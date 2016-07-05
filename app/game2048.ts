import { Direction } from './enums'
import { Grid } from './grid'
import { RowProcessor } from './row-processor'
import { Observable } from './helpers/observable'
import { IRandom } from './helpers/random'
import { CommonTools } from './helpers/common-tools'
import { Tile } from './models'
import { TileUpdateEvent, RowProcessionEvent, TileCreatedEvent, TileMergeEvent, TileMoveEvent } from './events'

export interface IGame2048Render {
    OnGameFinished(): void;
    OnTilesUpdated(event: TileUpdateEvent): void;
    OnTurnAnimationsCompleted: Observable<void>;
}

export interface IGameState {
    Scores: number,
    GridSerialized: string
}

export class Game2048 {
    Scores: number = 0;
    Grid: Grid;
    OnTilesUpdated: Observable<TileUpdateEvent> = new Observable<TileUpdateEvent>();
    OnGameFinished: Observable<void> = new Observable<void>();
    private userActionsQueue: (() => void)[] = [];
    private rand: IRandom;

    constructor(size: number, rand: IRandom) {
        this.rand = rand;
        this.Grid = new Grid(size);
        this.insertNewTileToVacantSpace();
    }

    BindRender(render: IGame2048Render): void {
        this.OnTilesUpdated.RegisterObserver(render.OnTilesUpdated.bind(render));
        this.OnGameFinished.RegisterObserver(render.OnGameFinished.bind(render));

        render.OnTurnAnimationsCompleted.RegisterObserver(this.fetchAndExecuteUserActionFromQueue.bind(this));
    }

    Serialize(): string {
        var state = <IGameState>{
            Scores: this.Scores,
            GridSerialized: this.Grid.Serialize()
        };
        return JSON.stringify(state);
    }

    public InitFromState(gameState: string): void {
        var state = <IGameState>JSON.parse(gameState);
        this.Scores = state.Scores;
        this.Grid = Grid.Deserialize(state.GridSerialized);
    }

    Action(move: Direction): void {
        var action = this.processAction.bind(this, move);
        this.userActionsQueue.push(action);
        if (this.userActionsQueue.length == 1) {
            action();
        }
    }

    private fetchAndExecuteUserActionFromQueue() {
        this.userActionsQueue.splice(0, 1);
        if (this.userActionsQueue.length > 0) {
            var action = this.userActionsQueue[0];
            action();
        }
    }

    private calculateGameEvents(move: Direction): TileUpdateEvent[] {
        var allEvents = [];
        var rowsData = this.Grid.GetRowDataByDirection(move);

        for (var i = 0; i < rowsData.length; ++i) {
            var rowEvents = RowProcessor.ProcessRow(rowsData[i]);

            //apply row events to game grid and publish them to subscribers
            for (var ie = 0; ie < rowEvents.length; ++ie) {
                var rowEvent = rowEvents[ie];
                var oldPos = rowsData[i][rowEvent.OldIndex];
                var newPos = rowsData[i][rowEvent.NewIndex];
                if (rowEvent.IsMerged()) {
                    allEvents.push(new TileMergeEvent(oldPos, newPos, rowEvent.MergedValue));
                } else {
                    allEvents.push(new TileMoveEvent(oldPos, newPos, rowEvent.Value, rowEvent.IsDeleted()));
                }
            }
        }

        return allEvents;
    }

    private processAction(move: Direction) {
        CommonTools.ConsoleLog("start process action", [this.Grid.Serialize(), Direction[move]]);

        var gameEvents = this.calculateGameEvents(move);

        for (var i = 0; i < gameEvents.length; ++i) {
            var event = gameEvents[i];

            if (event instanceof TileMoveEvent) {
                var moveEvent = <TileMoveEvent>event;
                this.Grid.UpdateTileByPos(moveEvent.NewPosition, moveEvent.Value);
                this.Grid.RemoveTileByPos(moveEvent.Position);
            }

            if (event instanceof TileMergeEvent) {
                var mergeEvent = <TileMergeEvent>event;
                this.Grid.UpdateTileByPos(mergeEvent.TilePosToMergeWith, mergeEvent.NewValue);
                this.Grid.RemoveTileByPos(mergeEvent.Position);
                this.Scores += mergeEvent.NewValue;
            }

            this.OnTilesUpdated.NotifyObservers(event);
        }

        if (gameEvents.length > 0) {
            // If we have events then there were some movements and therefore there must be some empty space to insert new tile
            var newTile = this.insertNewTileToVacantSpace();
            this.OnTilesUpdated.NotifyObservers(new TileCreatedEvent(newTile, newTile.Value));
        } else {
            this.OnTilesUpdated.NotifyObservers(null);  // Dummy event - just indicator that user made his action without movements

            // Here we need to check if game grid is full - so might be game is finished if there is no possibility to make a movement
            var availTitles = this.Grid.AvailableCells();
            if (availTitles.length == 0) {
                // Check if there are possible movements
                var weHaveSomePossibleEvents =
                    this.calculateGameEvents(Direction.Up).length > 0
                    || this.calculateGameEvents(Direction.Right).length > 0
                    || this.calculateGameEvents(Direction.Left).length > 0
                    || this.calculateGameEvents(Direction.Down).length > 0;
                if (!weHaveSomePossibleEvents) {
                    // Game is over, dude
                    this.OnGameFinished.NotifyObservers(null);
                }
            }
        }

        CommonTools.ConsoleLog("  end process action", [this.Grid.Serialize()])
    }

    private insertNewTileToVacantSpace(): Tile {
        var availTitles = this.Grid.AvailableCells();
        if (availTitles.length > 0) {
            var ti = this.rand.GetRandomNumber(availTitles.length);
            var pos = availTitles[ti];
            var tile = new Tile(pos.RowIndex, pos.CellIndex, 2);
            this.Grid.InsertTileByPos(tile, tile.Value);
            return tile;
        }

        return null;
    }
}

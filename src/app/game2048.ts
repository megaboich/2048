///<reference path="helpers/observable.ts"/>
///<reference path="helpers/random.ts"/>
///<reference path="grid.ts"/>
///<reference path="row-processor.ts"/>

interface IGame2048Render {
    OnGameFinished(): void;
    OnTilesUpdated(event: TileUpdateEvent): void;
    OnTurnAnimationsCompleted: Observable<void>;
}

class Game2048 {
    Scores: number = 0;
    Grid: Grid;
    OnTilesUpdated: Observable<TileUpdateEvent> = new Observable<TileUpdateEvent>();
    OnGameFinished: Observable<void> = new Observable<void>();
    private inputActions: (() => void)[] = [];
    private rand: IRandom;

    constructor(size: number, rand: IRandom) {
        this.rand = rand;
        this.Grid = new Grid(size);
        this.insertNewTileToVacantSpace();
    }

    BindRender(render: IGame2048Render) {
        this.OnTilesUpdated.RegisterObserver(render.OnTilesUpdated.bind(render));
        this.OnGameFinished.RegisterObserver(render.OnGameFinished.bind(render));

        render.OnTurnAnimationsCompleted.RegisterObserver(this.onTurnAnimationsCompleted.bind(this));
    }

    Action(move: Direction) {
        var action = this.processAction.bind(this, move);
        this.inputActions.push(action);
        if (this.inputActions.length == 1) {
            action();
        }
    }

    private processAction(move: Direction) {
        CommonTools.ConsoleLog("start process action", [this.Grid.Serialize(), Direction[move]]);
        
        var rowsData = this.Grid.GetRowDataByDirection(move);
        for (var i = 0; i < rowsData.length; ++i) {
            var rowEvents = RowProcessor.ProcessRow(rowsData[i]);

            //apply row events to game grid and publish them to subscribers
            for (var ie = 0; ie < rowEvents.length; ++ie) {
                var rowEvent = rowEvents[ie];
                var oldPos = rowsData[i][rowEvent.OldIndex];
                var newPos = rowsData[i][rowEvent.NewIndex];
                if (rowEvent.IsMerged()) {
                    this.Scores += rowEvent.MergedValue;
                    this.Grid.UpdateTileByPos(rowsData[i][rowEvent.NewIndex], rowEvent.MergedValue);
                    this.OnTilesUpdated.NotifyObservers(new TileMergeEvent(oldPos, newPos, rowEvent.MergedValue));
                } else {
                    this.Grid.UpdateTileByPos(newPos, rowEvent.Value);
                    this.OnTilesUpdated.NotifyObservers(new TileMoveEvent(oldPos, newPos, rowEvent.Value, rowEvent.IsDeleted()));
                }

                this.Grid.RemoveTileByPos(oldPos);
            }
        }

        var newTile = this.insertNewTileToVacantSpace();
        if (newTile != null) {
            this.OnTilesUpdated.NotifyObservers(new TileCreatedEvent(newTile, newTile.Value));
        }
        else {
            this.OnGameFinished.NotifyObservers(null);
        }
        
        CommonTools.ConsoleLog("  end process action", [this.Grid.Serialize()])
    }

    private onTurnAnimationsCompleted() {
        var action = this.inputActions[0];
        this.inputActions.splice(0, 1);

        if (this.inputActions.length > 0) {
            action = this.inputActions[0];
            action();
        }
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

import { Observable } from "helpers/observable";
import { IRandom } from "helpers/random";

import { Direction } from "./enums";
import {
  TileCreatedEvent,
  TileMergeEvent,
  TileMoveEvent,
  TileUpdateEvent
} from "./events";
import { Grid } from "./grid";
import { Tile } from "./tile";
import { RowProcessor } from "./row-processor";

export interface IGame2048Render {
  onGameFinished(): void;
  onTilesUpdated(event?: TileUpdateEvent): void;
  onTurnAnimationsCompleted: Observable<void>;
}

export interface IGameState {
  scores: number;
  gridSerialized: string;
}

export class Game2048 {
  scores: number = 0;
  grid: Grid;
  onTilesUpdated = new Observable<TileUpdateEvent | undefined>();
  onGameFinished = new Observable<void>();
  private userActionsQueue: (() => void)[] = [];
  private rand: IRandom;

  constructor(size: number, rand: IRandom) {
    this.rand = rand;
    this.grid = new Grid(size);
    this.insertNewTileToVacantSpace();
  }

  public bindRender(render: IGame2048Render): void {
    this.onTilesUpdated.addObserver(e => {
      render.onTilesUpdated(e);
    });
    this.onGameFinished.addObserver(() => render.onGameFinished());

    render.onTurnAnimationsCompleted.addObserver(() =>
      this.fetchAndExecuteUserActionFromQueue()
    );
  }

  public serialize(): string {
    const state: IGameState = {
      scores: this.scores,
      gridSerialized: this.grid.serialize()
    };
    return JSON.stringify(state);
  }

  public initFromState(gameState: string): void {
    const state: IGameState = JSON.parse(gameState);
    this.scores = state.scores;
    this.grid = Grid.deserialize(state.gridSerialized);
  }

  public action(move: Direction): void {
    const action = () => this.processAction(move);
    this.userActionsQueue.push(action);
    if (this.userActionsQueue.length == 1) {
      action();
    }
  }

  private fetchAndExecuteUserActionFromQueue() {
    this.userActionsQueue.splice(0, 1);
    if (this.userActionsQueue.length > 0) {
      const action = this.userActionsQueue[0];
      action();
    }
  }

  private calculateGameEvents(move: Direction): TileUpdateEvent[] {
    const allEvents = [];
    const rowsData = this.grid.getRowDataByDirection(move);

    for (const row of rowsData) {
      const rowEvents = RowProcessor.ProcessRow(row);

      //apply row events to game grid and publish them to subscribers
      for (const rowEvent of rowEvents) {
        const oldPos = row[rowEvent.oldIndex];
        const newPos = row[rowEvent.newIndex];
        if (rowEvent.isMerged()) {
          allEvents.push(
            new TileMergeEvent(oldPos, newPos, rowEvent.mergedValue)
          );
        } else {
          allEvents.push(
            new TileMoveEvent(
              oldPos,
              newPos,
              rowEvent.value,
              rowEvent.isDeleted()
            )
          );
        }
      }
    }

    return allEvents;
  }

  private processAction(move: Direction) {
    console.log("start process action", [
      this.grid.serialize(),
      Direction[move]
    ]);

    const gameEvents = this.calculateGameEvents(move);

    for (const event of gameEvents) {
      if (event instanceof TileMoveEvent) {
        const moveEvent = <TileMoveEvent>event;
        this.grid.updateTileByPos(moveEvent.newPosition, moveEvent.value);
        this.grid.removeTileByPos(moveEvent.position);
      }

      if (event instanceof TileMergeEvent) {
        const mergeEvent = <TileMergeEvent>event;
        this.grid.updateTileByPos(
          mergeEvent.tilePosToMergeWith,
          mergeEvent.newValue
        );
        this.grid.removeTileByPos(mergeEvent.position);
        this.scores += mergeEvent.newValue;
      }

      this.onTilesUpdated.notify(event);
    }

    if (gameEvents.length > 0) {
      // If we have events then there were some movements and therefore there must be some empty space to insert new tile
      const newTile = this.insertNewTileToVacantSpace();
      if (!newTile) {
        throw new Error("New title must be inserted somewhere!");
      }
      this.onTilesUpdated.notify(new TileCreatedEvent(newTile, newTile.value));
    } else {
      this.onTilesUpdated.notify(undefined); // Dummy event - just indicator that user made his action without movements

      // Here we need to check if game grid is full - so might be game is finished if there is no possibility to make a movement
      const availTitles = this.grid.availableCells();
      if (availTitles.length == 0) {
        // Check if there are possible movements
        const weHaveSomePossibleEvents =
          this.calculateGameEvents(Direction.Up).length > 0 ||
          this.calculateGameEvents(Direction.Right).length > 0 ||
          this.calculateGameEvents(Direction.Left).length > 0 ||
          this.calculateGameEvents(Direction.Down).length > 0;
        if (!weHaveSomePossibleEvents) {
          // Game is over, dude
          this.onGameFinished.notify(undefined);
        }
      }
    }

    console.log("  end process action", [this.grid.serialize()]);
  }

  private insertNewTileToVacantSpace(): Tile | undefined {
    const availTitles = this.grid.availableCells();
    if (availTitles.length > 0) {
      const ti = this.rand.getRandomNumber(availTitles.length);
      const pos = availTitles[ti];
      const tile: Tile = {
        rowIndex: pos.rowIndex,
        cellIndex: pos.cellIndex,
        value: 2
      };
      this.grid.insertTileByPos(tile, tile.value);
      return tile;
    }

    return undefined;
  }
}

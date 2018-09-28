import { Direction } from "game/enums";
import {
  TileCreatedEvent,
  TileMergeEvent,
  TileMoveEvent
} from "game/events";
import { Game2048 } from "game/game2048";
import { Grid } from "game/grid";
import { TilePosition } from "game/models";
import { Observable } from "helpers/observable";

describe("App tests", () => {
  function assertCorrectExistingTile(
    grid: Grid,
    tilePos: TilePosition,
    tileValue: number = -1
  ) {
    const tile = grid.getTile(tilePos.rowIndex, tilePos.cellIndex);
    if (tileValue >= 0) {
      expect(tile.value).toEqual(tileValue, "Tile value is not expected");
    } else {
      expect(tile.value).toBeGreaterThan(
        0,
        "Tile value should be greater than zero"
      );
    }
  }

  function applyMove(grid: Grid, event: TileMoveEvent) {
    assertCorrectExistingTile(grid, event.position, event.value);

    grid.removeTileByPos(event.position);
    grid.updateTileByPos(event.newPosition, event.value);
  }

  function applyMerge(grid: Grid, event: TileMergeEvent) {
    assertCorrectExistingTile(grid, event.position);

    grid.removeTileByPos(event.position);
    grid.updateTileByPos(event.tilePosToMergeWith, event.newValue);
  }

  function applyNew(grid: Grid, event: TileCreatedEvent) {
    assertCorrectExistingTile(grid, event.position, 0);

    grid.insertTileByPos(event.position, event.tileValue);
  }

  function buildTestGame(grid: Grid): Game2048 {
    const game = new Game2048(4, {
      getRandomNumber: () => {
        return 0;
      }
    });
    game.grid = Grid.deserialize(grid.serialize());
    const onTurnAnimationsCompleted = new Observable<void>();
    game.bindRender({
      onGameFinished: () => {
        /**/
      },
      onTilesUpdated: event => {
        if (event instanceof TileMoveEvent) {
          applyMove(grid, <TileMoveEvent>event);
        } else if (event instanceof TileMergeEvent) {
          applyMerge(grid, <TileMergeEvent>event);
        } else if (event instanceof TileCreatedEvent) {
          applyNew(grid, <TileCreatedEvent>event);
        }
      },
      onTurnAnimationsCompleted: onTurnAnimationsCompleted
    });
    return game;
  }

  it("Game situation test 1", () => {
    const testGrid = Grid.deserialize("2,4,0,0|0,0,0,0|2,0,0,2|0,0,0,0");
    const game = buildTestGame(testGrid);
    game.action(Direction.Right);

    const resultGrid = game.grid.serialize();
    expect(resultGrid).toBe("2,0,2,4|0,0,0,0|0,0,0,4|0,0,0,0");
    expect(testGrid.serialize()).toBe(resultGrid);
  });

  it("Game situation test 2", () => {
    const testGrid = Grid.deserialize("0,2,2,0|0,0,0,0|0,0,2,0|0,0,0,0");
    const game = buildTestGame(testGrid);
    game.action(Direction.Left);

    const resultGrid = game.grid.serialize();
    expect(resultGrid).toBe("4,2,0,0|0,0,0,0|2,0,0,0|0,0,0,0");
    expect(testGrid.serialize()).toBe(resultGrid);
  });
});

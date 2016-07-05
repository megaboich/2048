import { Grid } from './grid'
import { Game2048 } from './game2048'
import { Direction } from './enums'
import { Observable } from './helpers/observable'
import { Tile, TilePosition } from './models'
import { TileUpdateEvent, RowProcessionEvent, TileCreatedEvent, TileMergeEvent, TileMoveEvent } from './events'

describe("App tests", () => {

    function assertCorrectExistingTile(grid: Grid, tilePos: TilePosition, tileValue: number = -1) {
        var tile = grid.GetTile(tilePos.RowIndex, tilePos.CellIndex);
        if (tileValue >= 0) {
            expect(tile.Value).toEqual(tileValue, "Tile value is not expected");
        }
        else {
            expect(tile.Value).toBeGreaterThan(0, "Tile value should be greater than zero");
        }
    }

    function applyMove(grid: Grid, event: TileMoveEvent) {
        assertCorrectExistingTile(grid, event.Position, event.Value);

        grid.RemoveTileByPos(event.Position);
        grid.UpdateTileByPos(event.NewPosition, event.Value);
    }

    function applyMerge(grid: Grid, event: TileMergeEvent) {
        assertCorrectExistingTile(grid, event.Position);

        grid.RemoveTileByPos(event.Position);
        grid.UpdateTileByPos(event.TilePosToMergeWith, event.NewValue);
    }

    function applyNew(grid: Grid, event: TileCreatedEvent) {
        assertCorrectExistingTile(grid, event.Position, 0);

        grid.InsertTileByPos(event.Position, event.TileValue);
    }

    function buildTestGame(grid: Grid): Game2048 {
        var game = new Game2048(4, {
            GetRandomNumber: () => {
                return 0;
            }
        });
        game.Grid = Grid.Deserialize(grid.Serialize());
        var onTurnAnimationsCompleted = new Observable<void>();
        game.BindRender({
            OnGameFinished: () => { },
            OnTilesUpdated: (event) => {
                if (event instanceof TileMoveEvent) {
                    applyMove(grid, <TileMoveEvent>event);
                } else if (event instanceof TileMergeEvent) {
                    applyMerge(grid, <TileMergeEvent>event);
                } else if (event instanceof TileCreatedEvent) {
                    applyNew(grid, <TileCreatedEvent>event);
                }
            },
            OnTurnAnimationsCompleted: onTurnAnimationsCompleted
        });
        return game;
    }

    it("Game situation test 1", () => {
        var testGrid = Grid.Deserialize("2,4,0,0|0,0,0,0|2,0,0,2|0,0,0,0");
        var game = buildTestGame(testGrid);
        game.Action(Direction.Right);

        var resultGrid = game.Grid.Serialize();
        expect(resultGrid).toBe("2,0,2,4|0,0,0,0|0,0,0,4|0,0,0,0");
        expect(testGrid.Serialize()).toBe(resultGrid);
    });

    it("Game situation test 2", () => {
        var testGrid = Grid.Deserialize("0,2,2,0|0,0,0,0|0,0,2,0|0,0,0,0");
        var game = buildTestGame(testGrid);
        game.Action(Direction.Left);

        var resultGrid = game.Grid.Serialize();
        expect(resultGrid).toBe("4,2,0,0|0,0,0,0|2,0,0,0|0,0,0,0");
        expect(testGrid.Serialize()).toBe(resultGrid);
    });

});
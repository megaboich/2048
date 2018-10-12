import { Direction } from "game/enums";
import { Game2048 } from "game/game2048";
import { Grid } from "game/grid";
import { IRandom } from "helpers/random";

describe("Game2048", () => {
  function fakeRandom(expectedNumber: number): IRandom {
    return {
      getRandomNumber: () => {
        return expectedNumber;
      }
    };
  }

  function buildTestGame(serializedGrid: string): Game2048 {
    const game = new Game2048(4, fakeRandom(0));
    game.grid = Grid.deserialize(serializedGrid);
    return game;
  }

  it("handles move right", async () => {
    const initial = `2,4,0,0|
                     0,0,0,0|
                     2,0,0,2|
                     0,0,0,0`;
    const game = buildTestGame(initial);
    game.queueAction({ type: "MOVE", direction: Direction.Right });
    await game.processAction();
    const expected = `2,0,2,4|
                      0,0,0,0|
                      0,0,0,4|
                      0,0,0,0`;
    expect(game.grid.cells).toEqual(Grid.deserialize(expected).cells);
  });

  it("handles move left", async () => {
    const initial = `0,2,2,0|
                     0,0,0,0|
                     0,0,2,0|
                     0,0,0,0`;
    const game = buildTestGame(initial);
    game.queueAction({ type: "MOVE", direction: Direction.Left });
    await game.processAction();
    const expected = `4,2,0,0|
                      0,0,0,0|
                      2,0,0,0|
                      0,0,0,0`;
    expect(game.grid.cells).toEqual(Grid.deserialize(expected).cells);
  });
});

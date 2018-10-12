import {
  GameEvent,
  GameOverEvent,
  TileCreatedEvent,
  TileMergeEvent
} from "game/events";
import { Game2048 } from "game/game2048";
import { ConsoleHelper } from "helpers/console";

export class RenderConsole {
  private console = new ConsoleHelper();

  constructor(private game: Game2048) {}

  async init() {
    this.console.write("init");
    this.render([]);
  }

  async update(events: GameEvent[]) {
    if (events.some(e => e instanceof GameOverEvent)) {
      this.console.write("GAME OVER", { color: "red", bgColor: "yellow" });
      this.console.flush();
    } else {
      this.render(events);
    }
  }

  private render(events: GameEvent[]): void {
    this.console.write("Score: ");
    this.console.write(`${this.game.scores}`, {
      color: "aqua",
      bgColor: "black"
    });
    this.console.newLine();

    // Add tiles from game grid
    for (let irow = 0; irow < this.game.grid.size; ++irow) {
      for (let icell = 0; icell < this.game.grid.size; ++icell) {
        const tileValue = this.game.grid.cells[irow][icell];
        if (tileValue != 0) {
          let specialRender = false;
          for (const event of events) {
            if (
              event instanceof TileCreatedEvent &&
              event.tile.cellIndex === icell &&
              event.tile.rowIndex === irow
            ) {
              specialRender = true;
              this.console.write(`${tileValue}\t`, {
                color: "yellow",
                bgColor: "black"
              });
            }

            if (
              event instanceof TileMergeEvent &&
              event.mergePosition.cellIndex === icell &&
              event.mergePosition.rowIndex === irow
            ) {
              specialRender = true;
              this.console.write(`${tileValue}\t`, {
                color: "lime",
                bgColor: "black"
              });
            }
          }
          if (!specialRender) {
            this.console.write(`${tileValue}\t`, {
              color: "white",
              bgColor: "black"
            });
          }
        } else {
          this.console.write(`\t`, {
            color: "white",
            bgColor: "black"
          });
        }
      }
      this.console.newLine();
    }
    this.console.newLine();
    this.console.flush();
  }
}

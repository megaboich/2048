import * as SVG from "svg.js";
import {
  GameEvent,
  GameOverEvent,
  TileCreatedEvent,
  TileMergeEvent,
  TileMoveEvent
} from "game/events";
import { Game2048 } from "game/game2048";
import { Tile, TilePosition } from "game/tile";
import { ensure } from "helpers/syntax";
import { stay } from "helpers/async";

type tilesDic = { [key: string]: SVG.G | undefined };
const animationDelay = 300;
const cellSize = 50;

export class RenderSVG {
  private tiles: tilesDic = {};
  private svg?: SVG.Doc;

  constructor(private game: Game2048) {}

  async init() {
    const drawingElt = document.getElementById("drawing");
    if (!drawingElt) {
      throw new Error("Drawing element is not found");
    }
    drawingElt.innerHTML = "";
    this.svg = SVG(drawingElt).size(cellSize * 6, cellSize * 6);
    this.tiles = {};
  }

  async update(events: GameEvent[]) {
    const promises = [];
    for (const ev of events) {
      if (ev instanceof TileCreatedEvent) {
        promises.push(this.renderNewTile(ev));
      } else if (ev instanceof TileMergeEvent) {
        promises.push(this.renderMerge(ev));
      } else if (ev instanceof TileMoveEvent) {
        promises.push(this.renderMove(ev));
      }
    }
    await Promise.all(promises);
    console.log("GG", this.tiles);
  }

  private async renderNewTile(event: TileCreatedEvent) {
    await stay(animationDelay);
    const pos = this.getTilePosition(event.tile);
    const svg = ensure(this.svg, "SVG is not initialized");

    const promise = new Promise(resolve => {
      const group = svg.group();
      group.move(pos.x, pos.y);
      const innerG = group.group();
      const rect = innerG.rect(cellSize, cellSize).attr({ fill: "#DDD" });
      const text = innerG.text(event.tile.value.toString()).width(cellSize);
      text.center(cellSize / 2, cellSize / 2);
      innerG.transform({ scale: 0.1 });
      innerG
        .animate(animationDelay)
        .transform({ scale: 1 })
        .after(resolve);
      const key = this.getTileKey(event.tile);
      this.tiles[key] = group;
      resolve();
    });
    return promise;
  }

  private async renderMove(event: TileMoveEvent) {
    const key = this.getTileKey(event.oldPosition);
    const tile = ensure(this.tiles[key]);
    const promise = new Promise(resolve => {
      const newPos = this.getTilePosition(event.newPosition);
      if (event.shouldBeDeleted) {
        tile.back();
        tile
          .select("g")
          .first()
          .animate(animationDelay)
          .transform({ scale: 0.1 });
      }
      tile
        .animate(animationDelay)
        .transform({ x: newPos.x, y: newPos.y })
        .after(() => {
          if (event.shouldBeDeleted) {
            tile.remove();
          }
          resolve();
        });
      this.tiles[key] = undefined;
      if (!event.shouldBeDeleted) {
        const newKey = this.getTileKey(event.newPosition);
        this.tiles[newKey] = tile;
      }
    });
    return promise;
  }

  private async renderMerge(event: TileMergeEvent) {
    const key = this.getTileKey(event.oldPosition);
    const newKey = this.getTileKey(event.mergePosition);
    const tile = ensure(this.tiles[key]);

    const promise = new Promise(resolve => {
      const newPos = this.getTilePosition(event.mergePosition);
      tile
        .animate(animationDelay)
        .move(newPos.x, newPos.y)
        .after(resolve);
      const textElement = tile.select("text").first() as SVG.Text;
      textElement.text(event.newValue.toString());
      textElement.center(cellSize / 2, cellSize / 2);

      this.tiles[key] = undefined;
      this.tiles[newKey] = tile;
    });
    return promise;
  }

  private getTileKey(tile: TilePosition) {
    return tile.cellIndex + "|" + tile.rowIndex;
  }

  private getTilePosition(tile: TilePosition) {
    return {
      x: cellSize + tile.cellIndex * cellSize,
      y: cellSize + tile.rowIndex * cellSize
    };
  }
}

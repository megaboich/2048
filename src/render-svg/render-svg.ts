import * as SVG from "svg.js";
import {
  GameEvent,
  GameOverEvent,
  TileCreatedEvent,
  TileMergeEvent,
  TileMoveEvent
} from "game/events";
import { Game2048 } from "game/game2048";
import { TilePosition } from "game/tile";
import { ensure } from "helpers/syntax";
import { stay } from "helpers/async";

import {
  cellSize,
  animationDelay,
  cellBgColors,
  fallbackCellBgColor,
  cellColors,
  falbackCellColor
} from "./constants";

import "./render-svg.css";

type TilesDic = { [key: string]: SVG.G | undefined };

export class RenderSVG {
  private tiles: TilesDic = {};
  private svg?: SVG.Doc;
  private gridSize: number = 4;

  constructor(game: Game2048) {
    this.gridSize = game.grid.size;
  }

  async init() {
    const drawingElt = document.getElementById("drawing");
    if (!drawingElt) {
      throw new Error("Drawing element is not found");
    }
    drawingElt.innerHTML = "";
    this.svg = SVG(drawingElt).size(
      cellSize * this.gridSize + 10,
      cellSize * this.gridSize + 10
    );
    this.svg.addClass("render-svg");
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
      } else if (ev instanceof GameOverEvent) {
        promises.push(this.renderGameOver());
      }
    }
    await Promise.all(promises);
    console.log("GG", this.tiles);
  }

  private async renderNewTile(event: TileCreatedEvent): Promise<void> {
    await stay(animationDelay);
    const pos = this.getTilePosition(event.tile);
    const svg = ensure(this.svg, "SVG is not initialized");

    const promise = new Promise<void>(resolve => {
      const group = svg.group();
      group.move(pos.x, pos.y);
      const innerG = group.group();
      const colors = this.getTileColors(event.tile.value);
      const rect = innerG.rect(cellSize, cellSize);
      rect.fill(colors.bgColor);
      rect.stroke({ width: 2, color: "#efefef" });
      const text = innerG.text(event.tile.value.toString());
      text.font({ size: 30 });
      text.fill(colors.color);
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

  private async renderMove(event: TileMoveEvent): Promise<void> {
    const key = this.getTileKey(event.oldPosition);
    const tile = ensure(this.tiles[key]);
    const promise = new Promise<void>(resolve => {
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

  private async renderMerge(event: TileMergeEvent): Promise<void> {
    const key = this.getTileKey(event.oldPosition);
    const newKey = this.getTileKey(event.mergePosition);
    const tile = ensure(this.tiles[key]);

    const promise = new Promise<void>(resolve => {
      const newPos = this.getTilePosition(event.mergePosition);
      tile
        .animate(animationDelay)
        .move(newPos.x, newPos.y)
        .after(resolve);
      const colors = this.getTileColors(event.newValue);
      const textElement = tile.select("text").first() as SVG.Text;
      textElement.text(event.newValue.toString());
      textElement.fill(colors.color);
      textElement.center(cellSize / 2, cellSize / 2);
      const rectElement = tile.select("rect").first();
      rectElement.animate(animationDelay).attr({ fill: colors.bgColor });

      this.tiles[key] = undefined;
      this.tiles[newKey] = tile;
    });
    return promise;
  }

  private async renderGameOver(): Promise<void> {
    const svg = ensure(this.svg, "SVG is not initialized");
    const text = svg.text("GAME OVER");
    text.addClass("text-gameover");
    text.center((cellSize * this.gridSize) / 2, (cellSize * this.gridSize) / 2);
  }

  private getTileKey(tile: TilePosition) {
    return tile.cellIndex + "|" + tile.rowIndex;
  }

  private getTilePosition(tile: TilePosition) {
    return {
      x: tile.cellIndex * cellSize,
      y: tile.rowIndex * cellSize
    };
  }

  private getTileColors(value: number) {
    const bgColor = cellBgColors[value] || fallbackCellBgColor;
    const color = cellColors[value] || falbackCellColor;
    return {
      color,
      bgColor
    };
  }
}

import * as SVG from "svg.js";
import {
  GameEvent,
  GameOverEvent,
  TileCreatedEvent,
  TileMergeEvent,
  TileMoveEvent,
  TileDeletedEvent,
  TilesNotMovedEvent,
  GameStartedEvent
} from "game/events";
import { Game2048 } from "game/game2048";
import { TilePosition } from "game/tile";
import { ensure } from "helpers/syntax";
import { stay } from "helpers/async";
import { Direction } from "game/enums";
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
      } else if (ev instanceof TileDeletedEvent) {
        promises.push(this.renderDeleteEvent(ev));
      } else if (ev instanceof TilesNotMovedEvent) {
        promises.push(this.renderTilesNotMovedEvent(ev));
      } else if (ev instanceof GameOverEvent) {
        promises.push(this.renderGameOver());
      } else if (ev instanceof GameStartedEvent) {
        promises.push(this.renderGameStart());
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

  private async renderTilesNotMovedEvent(
    event: TilesNotMovedEvent
  ): Promise<void> {
    const tiles = Object.values(this.tiles);
    let dx = 0;
    let dy = 0;
    const dist = cellSize / 10;
    switch (event.direction) {
      case Direction.Up:
        dy = -dist;
        break;
      case Direction.Down:
        dy = dist;
        break;
      case Direction.Right:
        dx = dist;
        break;
      case Direction.Left:
        dx = -dist;
        break;
    }
    const promise = new Promise<void>(resolve => {
      for (const tile of tiles) {
        if (tile) {
          tile
            .animate(animationDelay / 2)
            .dmove(dx, dy)
            .after(() => {
              tile
                .animate(animationDelay / 2)
                .dmove(-dx, -dy)
                .after(resolve);
            });
        }
      }
    });
    return promise;
  }

  private async renderDeleteEvent(event: TileDeletedEvent): Promise<void> {
    const key = this.getTileKey(event.position);
    const tile = ensure(this.tiles[key]);
    this.tiles[key] = undefined;

    const promise = new Promise<void>(resolve => {
      const endAnimation = () => {
        tile.remove();
        resolve();
      };
      tile
        .animate(animationDelay)
        .transform({ scale: 0.1 })
        .after(endAnimation);
    });
    return promise;
  }

  private async renderGameOver(): Promise<void> {
    const svg = ensure(this.svg, "SVG is not initialized");
    let gameOverLayer = svg.select(".text-gameover").first();
    if (!gameOverLayer) {
      gameOverLayer = svg.text("GAME OVER");
      gameOverLayer.addClass("text-gameover");
      gameOverLayer.center(
        (cellSize * this.gridSize) / 2,
        (cellSize * this.gridSize) / 2
      );
    }
    const promise = new Promise<void>(resolve => {
      gameOverLayer
        .animate(animationDelay / 2)
        .transform({ scale: 2 })
        .after(() => {
          gameOverLayer
            .animate(animationDelay / 2)
            .transform({ scale: 1 })
            .after(resolve);
        });
    });
    return promise;
  }

  private async renderGameStart(): Promise<void> {
    const svg = ensure(this.svg, "SVG is not initialized");
    const gameOverLayer = svg.select(".text-gameover").first();
    if (gameOverLayer) {
      const promise = new Promise<void>(resolve => {
        const endAnimation = () => {
          gameOverLayer.remove();
          resolve();
        };

        gameOverLayer
          .animate(animationDelay * 4)
          .transform({ rotation: 180 })
          .after(endAnimation);
      });
      return promise;
    }
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

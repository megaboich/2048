import * as PIXI from "pixi.js";

import {
  TileCreatedEvent,
  TileMergeEvent,
  TileMoveEvent,
  TileUpdateEvent
} from "app/game/events";
import { Game2048, IGame2048Render } from "app/game/game2048";
import { TilePosition } from "app/game/models";
import { Dictionary } from "app/helpers/dictionary";
import { Observable } from "app/helpers/observable";
import { AnimationQueue } from "app/render/pixi-animation-combined";
import { AnimationDelay } from "app/render/pixi-animation-delay";
import { AnimationFade } from "app/render/pixi-animation-fade";
import { AnimationsManager } from "app/render/pixi-animation-manager";
import { AnimationMove } from "app/render/pixi-animation-move";
import { AnimationScale } from "app/render/pixi-animation-scale";
import { RenderHelper, TileSprite } from "app/render/pixi-game-render-helper";

export class PixiRender implements IGame2048Render {
  private stage: PIXI.Container;
  private tiles: Dictionary<string, TileSprite> = new Dictionary<
    string,
    TileSprite
  >([]);
  private scoresText: PIXI.Text = undefined as any; // Is initialized in constructor
  private fpsText: PIXI.Text = undefined as any; // Is initialized in constructor
  private staticRoot: PIXI.Container = undefined as any; // Is initialized in constructor
  private game: Game2048;
  private animationsManager: AnimationsManager;
  private gameOverRendered?: boolean;

  public onTurnAnimationsCompleted: Observable<void> = new Observable<void>();

  constructor(document: Document, game: Game2048) {
    this.game = game;

    const renderer = PIXI.autoDetectRenderer(400, 400, {
      backgroundColor: 0xefefef
    });
    document.body.appendChild(renderer.view);

    // create the root of the scene graph
    this.stage = new PIXI.Container();
    this.rebuildGraphics();

    this.animationsManager = new AnimationsManager(() =>
      this.onAnimationsCompleted()
    );

    const ticker = new PIXI.ticker.Ticker();
    ticker.add(() => {
      this.animationsManager.update(ticker.elapsedMS);

      renderer.render(this.stage);
      this.scoresText.text = game.scores.toString();
      this.fpsText.text = ticker.FPS.toFixed(2);
    });
    ticker.start();
  }

  rebuildGraphics(): void {
    this.gameOverRendered = false;
    this.rebuildStaticObjects();
    this.rebuildDynamicObjects();
  }

  onGameFinished() {
    if (!this.gameOverRendered) {
      const gog = RenderHelper.createGameOverGraphics();
      if (this.staticRoot) {
        this.staticRoot.addChild(gog);
      }
    }
    this.gameOverRendered = true;
  }

  onTilesUpdated(event: TileUpdateEvent) {
    if (!event) {
      // No tiles were moved
      this.animationsManager.AddAnimation(
        new AnimationQueue([
          new AnimationScale(this.scoresText, 50, 1.3),
          new AnimationScale(this.scoresText, 100, 1)
        ])
      );
    }
    if (event instanceof TileMoveEvent) {
      const moveEvent = <TileMoveEvent>event;
      const tileToMove = this.tiles.get(this.getTileKey(moveEvent.position));
      this.unregisterTile(tileToMove);
      this.bringToFront(tileToMove);
      const newPos = RenderHelper.setTileCoordinates(
        { x: 0, y: 0 },
        moveEvent.newPosition.rowIndex,
        moveEvent.newPosition.cellIndex
      );

      this.animationsManager.AddAnimation(
        new AnimationMove(tileToMove, 150, newPos, () => {
          this.removeTileGraphics(tileToMove);
          if (!moveEvent.shouldBeDeleted) {
            const newTile = this.addTileGraphics(
              moveEvent.newPosition.rowIndex,
              moveEvent.newPosition.cellIndex,
              moveEvent.value
            );
            this.registerTile(newTile);
          } else {
            this.removeTileGraphics(tileToMove);
          }
        })
      );
    } else if (event instanceof TileMergeEvent) {
      const mergeEvent = <TileMergeEvent>event;
      const tileToMove = this.tiles.get(this.getTileKey(mergeEvent.position));
      this.unregisterTile(tileToMove);
      this.bringToFront(tileToMove);
      const newPos = RenderHelper.setTileCoordinates(
        { x: 0, y: 0 },
        mergeEvent.tilePosToMergeWith.rowIndex,
        mergeEvent.tilePosToMergeWith.cellIndex
      );

      this.animationsManager.AddAnimation(
        new AnimationMove(tileToMove, 150, newPos, () => {
          this.removeTileGraphics(tileToMove);
          const newTile = this.addTileGraphics(
            mergeEvent.tilePosToMergeWith.rowIndex,
            mergeEvent.tilePosToMergeWith.cellIndex,
            mergeEvent.newValue
          );
          this.registerTile(newTile);
          this.animationsManager.AddAnimation(
            new AnimationQueue([
              new AnimationScale(newTile, 50, 1.3),
              new AnimationScale(newTile, 100, 1)
            ])
          );
        })
      );
    } else if (event instanceof TileCreatedEvent) {
      const createdEvent = <TileCreatedEvent>event;
      const newTile = this.addTileGraphics(
        createdEvent.position.rowIndex,
        createdEvent.position.cellIndex,
        createdEvent.tileValue
      );
      this.registerTile(newTile);
      newTile.alpha = 0;
      newTile.scale = new PIXI.Point(0.1, 0.1);
      this.animationsManager.AddAnimation(
        new AnimationQueue([
          new AnimationDelay(200),
          new AnimationFade(newTile, 1, 1),
          new AnimationScale(newTile, 150, 1)
        ])
      );
    }
  }

  private onAnimationsCompleted() {
    console.log("Animations completed!!");

    //this.rebuildDynamicObjects();
    this.onTurnAnimationsCompleted.notify(undefined);
  }

  private rebuildStaticObjects() {
    if (this.staticRoot) {
      this.stage.removeChild(this.staticRoot);
    }

    this.staticRoot = new PIXI.Container();
    this.stage.addChild(this.staticRoot);

    const otherStatic = RenderHelper.createOtherStatic(this.game);
    this.staticRoot.addChild(otherStatic);

    this.scoresText = RenderHelper.createScoresText();
    this.staticRoot.addChild(this.scoresText);

    const style: PIXI.TextStyleOptions = {
      fontFamily: "Inconsolata, Courier New",
      fill: "#005521",
      lineHeight: 14
    };
    this.fpsText = new PIXI.Text("", style);
    this.fpsText.x = 300;
    this.fpsText.y = 8;
    this.staticRoot.addChild(this.fpsText);
  }

  private rebuildDynamicObjects() {
    // Update scores
    this.scoresText.text = this.game.scores.toString();

    // Remove existing tiles
    this.tiles.values().forEach(element => {
      this.stage.removeChild(element);
    });

    this.stage.children.forEach(item => {
      if (item instanceof TileSprite) {
        console.log("Found not deleted " + (<TileSprite>item).tileKey);
      }
    });

    this.tiles = new Dictionary<string, TileSprite>([]);

    // Add tiles from game grid
    for (let irow = 0; irow < this.game.grid.size; ++irow) {
      for (let icell = 0; icell < this.game.grid.size; ++icell) {
        const tileValue = this.game.grid.cells[irow][icell];
        if (tileValue != 0) {
          const tile = this.addTileGraphics(irow, icell, tileValue);
          this.registerTile(tile);
        }
      }
    }
  }

  private registerTile(tile: TileSprite): void {
    this.tiles.add(tile.tileKey, tile);
  }

  private unregisterTile(tile: TileSprite): void {
    const key = tile.tileKey;
    this.tiles.remove(key);
    console.log("unregistered " + key);
  }

  private removeTileGraphics(tile: TileSprite) {
    if (!tile.parent) {
      console.log("tile parent is not defined");
      return;
    }
    tile.parent.removeChild(tile);
  }

  private addTileGraphics(
    irow: number,
    icell: number,
    tileValue: number
  ): TileSprite {
    const tileKey = this.getTileKey({ rowIndex: irow, cellIndex: icell });
    const tileGraphics = RenderHelper.createTileSprite(
      irow,
      icell,
      tileValue,
      tileKey
    );
    RenderHelper.setTileCoordinates(tileGraphics, irow, icell);
    this.stage.addChild(tileGraphics);
    return tileGraphics;
  }

  private bringToFront(tile: PIXI.DisplayObject) {
    if (tile) {
      const p = tile.parent;
      if (p) {
        p.removeChild(tile);
        p.addChild(tile);
      }
    }
  }

  private getTileKey(pos: TilePosition): string {
    return pos.rowIndex.toString() + "_" + pos.cellIndex.toString();
  }
}

import * as PIXI from "pixi.js";

import { IGame2048Render, Game2048 } from "../game2048";
import { Observable } from "../helpers/observable";
import { Dictionary } from "../helpers/dictionary";
import { TileSprite, RenderHelper } from "./pixi-game-render-helper";
import { AnimationsManager } from "./pixi-animation-manager";
import { AnimationQueue } from "./pixi-animation-combined";
import { AnimationMove, EntityPosition } from "./pixi-animation-move";
import { AnimationScale } from "./pixi-animation-scale";
import { AnimationFade } from "./pixi-animation-fade";
import { AnimationDelay } from "./pixi-animation-delay";
import { TilePosition, Tile } from "../models";
import {
  TileUpdateEvent,
  RowProcessionEvent,
  TileCreatedEvent,
  TileMergeEvent,
  TileMoveEvent
} from "../events";

export class PixiRender implements IGame2048Render {
  OnTurnAnimationsCompleted: Observable<void> = new Observable<void>();

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

  constructor(document: Document, game: Game2048) {
    this.game = game;

    var renderer = PIXI.autoDetectRenderer(400, 400, {
      backgroundColor: 0xefefef
    });
    document.body.appendChild(renderer.view);

    // create the root of the scene graph
    this.stage = new PIXI.Container();
    this.RebuildGraphics();

    this.animationsManager = new AnimationsManager(() =>
      this.onAnimationsCompleted()
    );

    var ticker = new PIXI.ticker.Ticker();
    ticker.add(() => {
      this.animationsManager.Update(ticker.elapsedMS);

      renderer.render(this.stage);
      this.scoresText.text = game.Scores.toString();
      this.fpsText.text = ticker.FPS.toFixed(2);
    });
    ticker.start();
  }

  RebuildGraphics(): void {
    this.gameOverRendered = false;
    this.rebuildStaticObjects();
    this.rebuildDynamicObjects();
  }

  OnGameFinished() {
    if (!this.gameOverRendered) {
      var gog = RenderHelper.GreateGameOverGraphics();
      if (this.staticRoot) {
        this.staticRoot.addChild(gog);
      }
    }
    this.gameOverRendered = true;
  }

  OnTilesUpdated(event: TileUpdateEvent) {
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
      var moveEvent = <TileMoveEvent>event;
      var tileToMove = this.tiles.Get(this.getTileKey(moveEvent.Position));
      this.unregisterTile(tileToMove);
      this.bringToFront(tileToMove);
      var newPos = <EntityPosition>{};
      RenderHelper.CalculateTileCoordinates(
        newPos,
        moveEvent.NewPosition.RowIndex,
        moveEvent.NewPosition.CellIndex
      );

      this.animationsManager.AddAnimation(
        new AnimationMove(tileToMove, 150, newPos, () => {
          this.removeTileGraphics(tileToMove);
          if (!moveEvent.ShouldBeDeleted) {
            var newTile = this.addTileGraphics(
              moveEvent.NewPosition.RowIndex,
              moveEvent.NewPosition.CellIndex,
              moveEvent.Value
            );
            this.registerTile(newTile);
          } else {
            this.removeTileGraphics(tileToMove);
          }
        })
      );
    } else if (event instanceof TileMergeEvent) {
      var mergeEvent = <TileMergeEvent>event;
      var tileToMove = this.tiles.Get(this.getTileKey(mergeEvent.Position));
      this.unregisterTile(tileToMove);
      this.bringToFront(tileToMove);
      var newPos = <EntityPosition>{};
      RenderHelper.CalculateTileCoordinates(
        newPos,
        mergeEvent.TilePosToMergeWith.RowIndex,
        mergeEvent.TilePosToMergeWith.CellIndex
      );

      this.animationsManager.AddAnimation(
        new AnimationMove(tileToMove, 150, newPos, () => {
          this.removeTileGraphics(tileToMove);
          var newTile = this.addTileGraphics(
            mergeEvent.TilePosToMergeWith.RowIndex,
            mergeEvent.TilePosToMergeWith.CellIndex,
            mergeEvent.NewValue
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
      var createdEvent = <TileCreatedEvent>event;
      var newTile = this.addTileGraphics(
        createdEvent.Position.RowIndex,
        createdEvent.Position.CellIndex,
        createdEvent.TileValue
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
    this.OnTurnAnimationsCompleted.NotifyObservers(undefined);
  }

  private rebuildStaticObjects() {
    if (this.staticRoot) {
      this.stage.removeChild(this.staticRoot);
    }

    this.staticRoot = new PIXI.Container();
    this.stage.addChild(this.staticRoot);

    var otherStatic = RenderHelper.CreateOtherStatic(this.game);
    this.staticRoot.addChild(otherStatic);

    this.scoresText = RenderHelper.CreateScoresText();
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
    this.scoresText.text = this.game.Scores.toString();

    // Remove existing tiles
    this.tiles.Values().forEach(element => {
      this.stage.removeChild(element);
    });

    this.stage.children.forEach(item => {
      if (item instanceof TileSprite) {
        console.log("Found not deleted " + (<TileSprite>item).TileKey);
      }
    });

    this.tiles = new Dictionary<string, TileSprite>([]);

    // Add tiles from game grid
    for (var irow = 0; irow < this.game.Grid.Size; ++irow) {
      for (var icell = 0; icell < this.game.Grid.Size; ++icell) {
        var tileValue = this.game.Grid.Cells[irow][icell];
        if (tileValue != 0) {
          var tile = this.addTileGraphics(irow, icell, tileValue);
          this.registerTile(tile);
        }
      }
    }
  }

  private registerTile(tile: TileSprite): void {
    this.tiles.Add(tile.TileKey, tile);
  }

  private unregisterTile(tile: TileSprite): void {
    var key = tile.TileKey;
    this.tiles.Remove(key);
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
    var tileKey = this.getTileKey({ RowIndex: irow, CellIndex: icell });
    var tileGraphics = RenderHelper.CreateTileSprite(
      irow,
      icell,
      tileValue,
      tileKey
    );
    RenderHelper.CalculateTileCoordinates(tileGraphics, irow, icell);
    this.stage.addChild(tileGraphics);
    return tileGraphics;
  }

  private bringToFront(tile: PIXI.DisplayObject) {
    if (tile) {
      var p = tile.parent;
      if (p) {
        p.removeChild(tile);
        p.addChild(tile);
      }
    }
  }

  private getTileKey(pos: TilePosition): string {
    return pos.RowIndex.toString() + "_" + pos.CellIndex.toString();
  }
}

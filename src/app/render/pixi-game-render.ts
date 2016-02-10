///<reference path="..\..\..\lib\typings\tsd.d.ts"/>
///<reference path="..\helpers\dictionary.ts"/>

///<reference path="pixi-animation-manager.ts"/>
///<reference path="pixi-animation-move.ts"/>
///<reference path="..\game2048.ts"/>

module PixiGameRender {

    class TileGraphics extends PIXI.Graphics {
        TileKey: string;
    }

    export class Render implements IGame2048Render {
        OnTurnAnimationsCompleted: Observable<void> = new Observable<void>();

        private stage: PIXI.Container;
        private tiles: Dictionary<string, TileGraphics> = new Dictionary<string, TileGraphics>([]);
        private scoresText: PIXI.Text;
        private fpsText: PIXI.Text;
        private staticRoot: PIXI.Container = null;
        private game: Game2048;
        private animationsManager: PixiExtensions.AnimationsManager;
        private flipper: boolean = false;
        private tileSize: number = 50;

        constructor(document: Document, game: Game2048) {
            this.game = game;

            var renderer = PIXI.autoDetectRenderer(400, 600, { backgroundColor: 0xeFeFeF });
            document.body.appendChild(renderer.view);
        
            // create the root of the scene graph
            this.stage = new PIXI.Container();
            this.rebuildStaticObjects();
            this.rebuildDynamicObjects();

            this.animationsManager = new PixiExtensions.AnimationsManager(this.onAnimationsCompleted.bind(this));

            var ticker = new PIXI.ticker.Ticker();
            ticker.add(() => {
                this.animationsManager.Update(ticker.elapsedMS);

                renderer.render(this.stage);

                this.fpsText.text = ticker.FPS.toFixed(2);
            });
            ticker.start();
        }

        OnGameFinished() {
            var text = new PIXI.Text("GAME OVER");
            text.x = 200;
            text.y = 200;
            this.staticRoot.addChild(text);
        }

        OnTilesUpdated(event: TileUpdateEvent) {
            if (event instanceof TileMoveEvent) {
                console.log(`move from ${event.Position} to ${event.NewPosition}, value ${event.Value}, del:${event.ShouldBeDeleted}`);

                var moveEvent = <TileMoveEvent>event;
                var tileToMove = this.tiles.Get(this.getTileKey(moveEvent.Position));
                this.unregisterTile(tileToMove);
                this.bringToFront(tileToMove);
                var newPos = <PixiExtensions.EntityPosition>{};
                this.setTileCoordinates(newPos, moveEvent.NewPosition.RowIndex, moveEvent.NewPosition.CellIndex);

                this.animationsManager.AddAnimation(new PixiExtensions.AnimationMove(tileToMove, 150, newPos, () => {
                    this.removeTileGraphics(tileToMove);
                    if (!moveEvent.ShouldBeDeleted) {
                        var newTile = this.addTileGraphics(moveEvent.NewPosition.RowIndex, moveEvent.NewPosition.CellIndex, moveEvent.Value);
                        this.registerTile(newTile);
                    } else {
                        this.removeTileGraphics(tileToMove);
                    }
                }));

            } else if (event instanceof TileMergeEvent) {

                var mergeEvent = <TileMergeEvent>event;
                var tileToMove = this.tiles.Get(this.getTileKey(mergeEvent.Position));
                this.unregisterTile(tileToMove);
                this.bringToFront(tileToMove);
                var newPos = <PixiExtensions.EntityPosition>{};
                this.setTileCoordinates(newPos, mergeEvent.TilePosToMergeWith.RowIndex, mergeEvent.TilePosToMergeWith.CellIndex);

                this.animationsManager.AddAnimation(
                    new PixiExtensions.AnimationMove(tileToMove, 150, newPos, () => {
                        this.removeTileGraphics(tileToMove);
                        var newTile = this.addTileGraphics(mergeEvent.TilePosToMergeWith.RowIndex, mergeEvent.TilePosToMergeWith.CellIndex, mergeEvent.NewValue);
                        this.registerTile(newTile);
                        this.animationsManager.AddAnimation(new PixiExtensions.AnimationQueue([
                            new PixiExtensions.AnimationScale(newTile, 50, 1.3),
                            new PixiExtensions.AnimationScale(newTile, 100, 1),
                        ]));
                    }));

            } else if (event instanceof TileCreatedEvent) {
                this.flipper = !this.flipper;
                this.animationsManager.AddAnimation(new PixiExtensions.AnimationParallel([
                    //new PixiAnimationRotate(this.scoresText, 500, 2 * Math.PI),
                    new PixiExtensions.AnimationMove(this.scoresText, 500, { x: this.flipper ? 300 : 100, y: 40 }),
                    /*new PixiAnimationQueue([
                        new PixiAnimationScale(this.scoresText, 250, 2),
                        new PixiAnimationScale(this.scoresText, 250, 1)
                    ])*/
                ]));

                var createdEvent = <TileCreatedEvent>event;
                var newTile = this.addTileGraphics(createdEvent.Position.RowIndex, createdEvent.Position.CellIndex, createdEvent.TileValue);
                this.registerTile(newTile);
                newTile.alpha = 0;
                newTile.scale = new PIXI.Point(0.1, 0.1);
                newTile.x += (this.tileSize / 2);
                newTile.y += (this.tileSize / 2);
                this.animationsManager.AddAnimation(new PixiExtensions.AnimationQueue([
                    new PixiExtensions.AnimationDelay(200),
                    new PixiExtensions.AnimationFade(newTile, 1, 1),
                    new PixiExtensions.AnimationParallel([
                        new PixiExtensions.AnimationScale(newTile, 150, 1),
                        new PixiExtensions.AnimationMove(newTile, 150, { x: newTile.x - (this.tileSize / 2), y: newTile.y - (this.tileSize / 2) }),
                    ])
                ]));

            }
        }

        private onAnimationsCompleted() {
            console.log('Animations completed!!');

            //this.rebuildDynamicObjects();
            this.OnTurnAnimationsCompleted.NotifyObservers(null);
        }

        private rebuildStaticObjects() {
            if (this.staticRoot != null) {
                this.stage.removeChild(this.staticRoot);
            }

            this.staticRoot = new PIXI.Container();
            this.stage.addChild(this.staticRoot);

            var style = <PIXI.TextStyle>{
                font: 'Inconsolata, Courier New',
                fill: '#005521',
                lineHeight: 14,
            };

            this.scoresText = new PIXI.Text(this.game.Scores.toString(), style);
            this.scoresText.x = 100;
            this.scoresText.y = 40;
            this.staticRoot.addChild(this.scoresText);

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

            this.stage.children.forEach((item) => {
                if (item instanceof TileGraphics) {
                    console.log('Found not deleted ' + (<TileGraphics>item).TileKey);
                }
            });

            this.tiles = new Dictionary<string, TileGraphics>([]);
        
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

        private registerTile(tile: TileGraphics): void {
            this.tiles.Add(tile.TileKey, tile);
        }

        private unregisterTile(tile: TileGraphics): void {
            var key = tile.TileKey;
            this.tiles.Remove(key);
            console.log('unregistered ' + key);
        }

        private removeTileGraphics(tile: TileGraphics) {
            if (!tile.parent) {
                console.log('tile parent is null');
                return;
            }
            tile.parent.removeChild(tile);
        }

        private addTileGraphics(irow: number, icell: number, tileValue: number): TileGraphics {
            var tileSize = 50;
            //Create graphics for cell
            var graphics = new TileGraphics();
            graphics.TileKey = this.getTileKey({ RowIndex: irow, CellIndex: icell });
            /*
                    graphics.lineStyle(1, 0xa0a0a0, 1);
                    graphics.beginFill(this.getTileColor(tileValue), 1);
                    graphics.drawRect(0, 0, tileSize, tileSize);
                    graphics.endFill();
            */
            this.setTileCoordinates(graphics, irow, icell);

            var style = <PIXI.TextStyle>{
                font: 'Inconsolata, Courier New',
                fill: '#005521',
                lineHeight: 14,
            };
            var tileText = new PIXI.Text(tileValue.toString(), style);
            tileText.x = 20;
            tileText.y = 20;
            graphics.addChild(tileText);

            this.stage.addChild(graphics);
            return graphics;
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

        private setTileCoordinates(fig: PixiExtensions.EntityPosition, iRow: number, iCell: number) {
            var tileSize = 50;
            fig.x = tileSize + iCell * tileSize;
            fig.y = 150 + iRow * tileSize;
        }

        private getTileKey(pos: TilePosition): string {
            return pos.RowIndex.toString() + "_" + pos.CellIndex.toString();
        }

        private getTileColor(value: number) {
            switch (value) {
                case 2:
                    return 0xeee4da;
                case 4:
                    return 0xEDE0C8;
                case 8:
                    return 0xF2B179;
                case 16:
                    return 0xF59563;
                case 32:
                    return 0xF67C5F;
                case 64:
                    return 0xF65E3B;
                case 128:
                    return 0xEDCF72;
                case 256:
                    return 0xEDCC61;
                case 512:
                    return 0xEDC850;
                case 1024:
                    return 0xEDC53F;
                case 2048:
                    return 0xEDC22E;
                case 4096:
                    return 0xedc22e;
                case 8192:
                    return 0xedc22e;
                default:
                    return 0xedc22e;
            }
        }
    }
}
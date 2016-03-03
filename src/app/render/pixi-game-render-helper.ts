///<reference path="..\..\..\lib\typings\tsd.d.ts"/>
///<reference path="..\helpers\dictionary.ts"/>

///<reference path="pixi-animation-manager.ts"/>
///<reference path="pixi-animation-move.ts"/>
///<reference path="..\game2048.ts"/>

module PixiGameRender {

    export class TileGraphics extends PIXI.Graphics {
        TileKey: string;
    }

    export class RenderHelper {
        public static TileSize = 50;

        public static CreateTileGraphics(irow: number, icell: number, tileValue: number, key: string): TileGraphics {
            //Create graphics for cell
            var graphics = new TileGraphics();
            graphics.TileKey = key;

            graphics.lineStyle(1, 0xe0e0e0, 1);
            graphics.beginFill(this.getTileBgColor(tileValue), 1);
            graphics.drawRect(0, 0, this.TileSize, this.TileSize);
            graphics.endFill();

            var style = <PIXI.TextStyle>{
                font: this.getTileFontSize(tileValue) + ' Inconsolata, Courier New',
                fill: "#" + this.getTileTextColor(tileValue).toString(16)
            };
            var tileText = new PIXI.Text(tileValue.toString(), style);
            tileText.x = this.getTileTextXOffset(tileValue);
            tileText.y = this.getTileTextYOffset(tileValue);
            graphics.addChild(tileText);

            return graphics;
        }

        public static CreateScoresText(): PIXI.Text {
            var style = <PIXI.TextStyle>{
                font: '32px Inconsolata, Courier New',
                fill: "#776E65"
            };
            var scoresText = new PIXI.Text("0", style);
            scoresText.x = this.TileSize;
            scoresText.y = 16;
            return scoresText;
        }

        public static CreateOtherStatic(game: Game2048): PIXI.Graphics {
            // create frame
            var size = game.Grid.Size;
            var frame = new PIXI.Graphics();
            var border = 8;
            frame.lineStyle(1, 0xe0e0e0, 1);
            frame.drawRect(this.TileSize * 2 - border, this.TileSize * 2 - border, this.TileSize * size + border + border, this.TileSize * size + border + border);
            return frame;
        }

        public static SetTileCoordinates(fig: PixiExtensions.EntityPosition, iRow: number, iCell: number) {
            fig.x = this.TileSize * 2 + iCell * this.TileSize;
            fig.y = this.TileSize * 2 + iRow * this.TileSize;
        }

        private static getTileFontSize(value: number): string {
            if (value < 100) {
                return "32px";
            }
            if (value < 1000) {
                return "28px";
            }
            if (value < 10000) {
                return "22px";
            }
            return "18px";
        }

        private static getTileTextXOffset(value: number): number {
            if (value < 10) {
                return 17;
            }
            if (value < 100) {
                return 8;
            }
            if (value < 1000) {
                return 3;
            }
            return 2;
        }
        private static getTileTextYOffset(value: number): number {
            if (value < 100) {
                return 13;
            }
            if (value < 1000) {
                return 16;
            }
            return 17;
        }

        private static getTileTextColor(value: number): number {
            return value > 4
                ? 0xF9F6F2
                : 0x776E65;
        }

        private static getTileBgColor(value: number): number {
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
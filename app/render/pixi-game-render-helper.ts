import { Game2048 } from '../game2048'

export class TileSprite extends PIXI.Container {
    TileKey: string;
}

export class RenderHelper {
    public static TileSize = 50;
    public static TileSizeHalf = 25;

    public static CreateTileSprite(irow: number, icell: number, tileValue: number, key: string): TileSprite {
        //Create graphics for cell
        var tileSprite = new TileSprite();
        tileSprite.TileKey = key;
        tileSprite.width = this.TileSize;
        tileSprite.height = this.TileSize;

        var tileGraphics = new PIXI.Graphics;
        tileGraphics.lineStyle(1, 0xe0e0e0, 1);
        tileGraphics.beginFill(this.getTileBgColor(tileValue), 1);
        tileGraphics.drawRect(0, 0, this.TileSize, this.TileSize);
        tileGraphics.endFill();
        tileGraphics.x = -this.TileSizeHalf;
        tileGraphics.y = -this.TileSizeHalf;
        tileSprite.addChild(tileGraphics);

        var style = <PIXI.TextStyle>{
            font: this.getTileFontSize(tileValue) + ' Inconsolata, Courier New',
            fill: "#" + this.getTileTextColor(tileValue).toString(16)
        };
        var tileText = new PIXI.Text(tileValue.toString(), style);
        tileText.x = this.getTileTextXOffset(tileValue) - this.TileSizeHalf;
        tileText.y = this.getTileTextYOffset(tileValue) - this.TileSizeHalf;
        tileSprite.addChild(tileText);

        return tileSprite;
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

    public static GreateGameOverGraphics(): PIXI.DisplayObject {
        var style = <PIXI.TextStyle>{
            font: '32px Inconsolata, Courier New',
            fill: "#776E65"
        };
        var text = new PIXI.Text("GAME OVER", style);
        text.x = this.TileSize;
        text.y = 46;
        return text;
    }

    public static CreateOtherStatic(game: Game2048): PIXI.DisplayObject {
        // create frame
        var size = game.Grid.Size;
        var frame = new PIXI.Graphics();
        var border = 8;
        frame.lineStyle(1, 0xe0e0e0, 1);
        frame.drawRect(this.TileSize * 2 - border, this.TileSize * 2 - border, this.TileSize * size + border + border, this.TileSize * size + border + border);
        return frame;
    }

    public static CalculateTileCoordinates(fig: { x: number, y: number }, iRow: number, iCell: number) {
        fig.x = this.TileSize * 2 + iCell * this.TileSize + this.TileSizeHalf;
        fig.y = this.TileSize * 2 + iRow * this.TileSize + this.TileSizeHalf;
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

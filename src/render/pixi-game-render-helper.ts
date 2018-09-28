import { Game2048 } from "game/game2048";

export class TileSprite extends PIXI.Container {
  tileKey: string = "";
}

export class RenderHelper {
  public static tileSize = 50;
  public static tileSizeHalf = 25;

  public static createTileSprite(
    irow: number,
    icell: number,
    tileValue: number,
    key: string
  ): TileSprite {
    //Create graphics for cell
    const tileSprite = new TileSprite();
    tileSprite.tileKey = key;
    tileSprite.width = this.tileSize;
    tileSprite.height = this.tileSize;

    const tileGraphics = new PIXI.Graphics();
    tileGraphics.lineStyle(1, 0xe0e0e0, 1);
    tileGraphics.beginFill(this.getTileBgColor(tileValue), 1);
    tileGraphics.drawRect(0, 0, this.tileSize, this.tileSize);
    tileGraphics.endFill();
    tileGraphics.x = -this.tileSizeHalf;
    tileGraphics.y = -this.tileSizeHalf;
    tileSprite.addChild(tileGraphics);

    const style: PIXI.TextStyleOptions = {
      fontFamily: "Inconsolata, Courier New",
      fontSize: this.getTileFontSize(tileValue),
      fill: "#" + this.getTileTextColor(tileValue).toString(16)
    };
    const tileText = new PIXI.Text(tileValue.toString(), style);
    tileText.x = this.getTileTextXOffset(tileValue) - this.tileSizeHalf;
    tileText.y = this.getTileTextYOffset(tileValue) - this.tileSizeHalf;
    tileSprite.addChild(tileText);

    return tileSprite;
  }

  public static createScoresText(): PIXI.Text {
    const style: PIXI.TextStyleOptions = {
      fontFamily: "Inconsolata, Courier New",
      fontSize: "32px",
      fill: "#776E65"
    };
    const scoresText = new PIXI.Text("0", style);
    scoresText.x = this.tileSize;
    scoresText.y = 16;
    return scoresText;
  }

  public static createGameOverGraphics(): PIXI.DisplayObject {
    const style: PIXI.TextStyleOptions = {
      fontFamily: "Inconsolata, Courier New",
      fontSize: "32px",
      fill: "#776E65"
    };
    const text = new PIXI.Text("GAME OVER", style);
    text.x = this.tileSize;
    text.y = 46;
    return text;
  }

  public static createOtherStatic(game: Game2048): PIXI.DisplayObject {
    // create frame
    const size = game.grid.size;
    const frame = new PIXI.Graphics();
    const border = 8;
    frame.lineStyle(1, 0xe0e0e0, 1);
    frame.drawRect(
      this.tileSize * 2 - border,
      this.tileSize * 2 - border,
      this.tileSize * size + border + border,
      this.tileSize * size + border + border
    );
    return frame;
  }

  public static setTileCoordinates(
    fig: { x: number; y: number },
    iRow: number,
    iCell: number
  ) {
    fig.x = this.tileSize * 2 + iCell * this.tileSize + this.tileSizeHalf;
    fig.y = this.tileSize * 2 + iRow * this.tileSize + this.tileSizeHalf;
    return fig;
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
    return value > 4 ? 0xf9f6f2 : 0x776e65;
  }

  private static getTileBgColor(value: number): number {
    switch (value) {
      case 2:
        return 0xeee4da;
      case 4:
        return 0xede0c8;
      case 8:
        return 0xf2b179;
      case 16:
        return 0xf59563;
      case 32:
        return 0xf67c5f;
      case 64:
        return 0xf65e3b;
      case 128:
        return 0xedcf72;
      case 256:
        return 0xedcc61;
      case 512:
        return 0xedc850;
      case 1024:
        return 0xedc53f;
      case 2048:
        return 0xedc22e;
      case 4096:
        return 0xedc22e;
      case 8192:
        return 0xedc22e;
      default:
        return 0xedc22e;
    }
  }
}

///<reference path="game2048.ts"/>
///<reference path="..\..\lib\typings\tsd.d.ts"/>

interface IGameRenderer extends Observer<TilesUpdateEvent> {

}

class PixiGameRenderer implements IGameRenderer {
    private stage: PIXI.Container;
    private tiles: PIXI.DisplayObject[];
    private game: Game2048;

    constructor(document: Document, game: Game2048) {
        var renderer = PIXI.autoDetectRenderer(800, 600, { backgroundColor: 0xeFeFeF });
        document.body.appendChild(renderer.view);

        this.game = game;
        this.tiles = [];

        // create the root of the scene graph
        this.stage = new PIXI.Container();

        var scoresText = new PIXI.Text("");
        scoresText.x = 100;
        scoresText.y = 40;
        this.stage.addChild(scoresText);

        var animate = () => {
            requestAnimationFrame(animate);

            scoresText.rotation += 0.005;
            scoresText.text = game.Scores.toString();
            
            // render the root container
            renderer.render(this.stage);
        };
        
        animate();
    }

    Update(event: TilesUpdateEvent) {
        // Remove existing tiles
        this.tiles.forEach(element => {
            this.stage.removeChild(element);
        });
        
        // Add tiles from game grid
        for (var ix = 0; ix < this.game.Grid.Size; ++ix) {
            for (var iy = 0; iy < this.game.Grid.Size; ++iy) {
                if (this.game.Grid.Cells[ix][iy] != 0) {
                    //Create graphics for cell
                    var graphics = new PIXI.Graphics();
                    graphics.lineStyle(1, 0xa0a0a0, 1);
                    graphics.beginFill(this.getRandColor(), 1);
                    graphics.drawRect(0, 0, 100, 100);
                    graphics.endFill();
                    graphics.x = 100 + ix * 100;
                    graphics.y = 150 + iy * 100;
                    this.stage.addChild(graphics);
                    this.tiles.push(graphics);
                }
            }
        }
    }

    private getRandColor(): number {
        var r = Math.floor(Math.random() * 120) + 120;
        var g = Math.floor(Math.random() * 120) + 120;
        var b = Math.floor(Math.random() * 120) + 120;
        return b + 256 * g + 256 * 256 * r;
    }
}
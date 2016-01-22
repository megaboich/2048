///<reference path="game2048.ts"/>
///<reference path="helpers/random.ts"/>
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
                var tileValue =this.game.Grid.Cells[ix][iy]; 
                if (tileValue != 0) {
                    //Create graphics for cell
                    var graphics = new PIXI.Graphics();
                    graphics.lineStyle(1, 0xa0a0a0, 1);
                    graphics.beginFill(this.getTileColor(tileValue), 1);
                    graphics.drawRect(0, 0, 100, 100);
                    graphics.endFill();
                    graphics.x = 100 + ix * 100;
                    graphics.y = 150 + iy * 100;
                    
                    var tileText = new PIXI.Text(tileValue.toString());
                    tileText.x = 30;
                    tileText.y = 30;
                    graphics.addChild(tileText);
                    
                    this.stage.addChild(graphics);
                    this.tiles.push(graphics);
                }
            }
        }
    }

    private getTileColor(value: number) {
        switch (value) {
            case 2:
                return 0xeee4da;
            case 4:
                return 0xedc22e;
            case 8:
                return 0xedc22e;
            case 16:
                return 0xedc22e;
            case 32:
                return 0xedc22e;
            case 64:
                return 0xedc22e;
            case 128:
                return 0xedc22e;
            case 256:
                return 0xedc22e;
            case 512:
                return 0xedc22e;
            case 1024:
                return 0xedc22e;
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
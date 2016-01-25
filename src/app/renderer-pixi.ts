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
        
        this.repaintWholeGame();
        animate();
    }

    Update(event: TilesUpdateEvent) {
        this.repaintWholeGame();
    }
    
    private repaintWholeGame(){
        // Remove existing tiles
        this.tiles.forEach(element => {
            this.stage.removeChild(element);
        });
        
        var tileSize = 50;
        
        // Add tiles from game grid
        for (var irow = 0; irow < this.game.Grid.Size; ++irow) {
            for (var icell = 0; icell < this.game.Grid.Size; ++icell) {
                var tileValue =this.game.Grid.Cells[irow][icell]; 
                if (tileValue != 0) {
                    //Create graphics for cell
                    var graphics = new PIXI.Graphics();
                    graphics.lineStyle(1, 0xa0a0a0, 1);
                    graphics.beginFill(this.getTileColor(tileValue), 1);
                    graphics.drawRect(0, 0, tileSize, tileSize);
                    graphics.endFill();
                    graphics.x = tileSize + icell * tileSize;
                    graphics.y = 150 + irow * tileSize;
                    
                    var tileText = new PIXI.Text(tileValue.toString());
                    tileText.x = 20;
                    tileText.y = 20;
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
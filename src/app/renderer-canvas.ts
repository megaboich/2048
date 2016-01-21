///<reference path="game2048.ts"/>
///<reference path="..\..\lib\typings\tsd.d.ts"/>

interface IGameRenderer {
    Render(game: Game2048): void
}

class CanvasRenderer implements IGameRenderer {
    Document: Document; 
    
    constructor(document: Document){
        this.Document = document;
    }
    
    Render(game: Game2048): void {

        var renderer = PIXI.autoDetectRenderer(800, 600, { backgroundColor: 0xeFeFeF });
        this.Document.body.appendChild(renderer.view);

        // create the root of the scene graph
        var stage = new PIXI.Container();

        var basicText = new PIXI.Text("Test");
        basicText.x = 130;
        basicText.y = 190;
        stage.addChild(basicText);

        // start animating
        animate();

        function animate() {

            requestAnimationFrame(animate);

            basicText.rotation += 0.01;
            basicText.text = new Date().toTimeString();

            // render the root container
            renderer.render(stage);
        }

    }
}
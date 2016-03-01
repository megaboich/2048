///<reference path="game2048.ts"/>
///<reference path="render/pixi-game-render.ts"/>

function InitGame() {
    var game = new Game2048(4, new DefaultRandom());
    var render = new PixiGameRender.Render(document, game);
    game.BindRender(render);

    Mousetrap.bind('up', function() {
        game.Action(Direction.Up);
    });

    Mousetrap.bind('down', function() {
        game.Action(Direction.Down);
    });

    Mousetrap.bind('left', function() {
        game.Action(Direction.Left);
    });

    Mousetrap.bind('right', function() {
        game.Action(Direction.Right);
    });

    document.getElementById('control-up').addEventListener("click", () => {
        game.Action(Direction.Up);
    });
    document.getElementById('control-down').addEventListener("click", () => {
        game.Action(Direction.Down);
    });
    document.getElementById('control-left').addEventListener("click", () => {
        game.Action(Direction.Left);
    });
    document.getElementById('control-right').addEventListener("click", () => {
        game.Action(Direction.Right);
    });
}

InitGame();

///<reference path="game2048.ts"/>
///<reference path="render/pixi-game-render.ts"/>

(() => {
    var game = new Game2048(4);
    var render = new PixiGameRender(document, game);
    game.BindRender(render);

    Mousetrap.bind('up', function() {
        game.ProcessInputAction(Direction.Up);
    });

    Mousetrap.bind('down', function() {
        game.ProcessInputAction(Direction.Down);
    });

    Mousetrap.bind('left', function() {
        game.ProcessInputAction(Direction.Left);
    });

    Mousetrap.bind('right', function() {
        game.ProcessInputAction(Direction.Right);
    });
})();

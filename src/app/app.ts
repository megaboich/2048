///<reference path="game2048.ts"/>
///<reference path="render/pixi-game-render.ts"/>

(() => {
    var game = new Game2048(4, new DefaultRandom());
    var render = new PixiGameRender(document, game);
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
})();

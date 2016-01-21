///<reference path="game2048.ts"/>
///<reference path="renderer-canvas.ts"/>

var game = new Game2048();
var render = <IGameRenderer>(new CanvasRenderer(document));

render.Render(game);
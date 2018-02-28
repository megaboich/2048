import * as FileSaver from "file-saver";
import * as Mousetrap from "mousetrap";

import { Game2048 } from "app/game2048";
import { DefaultRandom } from "app/helpers/random";
import { PixiRender } from "app/render/pixi-game-render";
import { Direction } from "app/enums";

import "app/styles/style.css";

function initGame() {
  var game = new Game2048(4, new DefaultRandom());
  var render = new PixiRender(document, game);
  game.BindRender(render);

  Mousetrap.bind("up", function() {
    game.Action(Direction.Up);
  });

  Mousetrap.bind("down", function() {
    game.Action(Direction.Down);
  });

  Mousetrap.bind("left", function() {
    game.Action(Direction.Left);
  });

  Mousetrap.bind("right", function() {
    game.Action(Direction.Right);
  });

  const getElem = (id: string): HTMLElement => {
    const elem = document.getElementById(id);
    if (!elem) {
      throw new Error("Can't find element by id: " + id);
    }
    return elem;
  };

  getElem("control-up").addEventListener("click", () => {
    game.Action(Direction.Up);
  });
  getElem("control-down").addEventListener("click", () => {
    game.Action(Direction.Down);
  });
  getElem("control-left").addEventListener("click", () => {
    game.Action(Direction.Left);
  });
  getElem("control-right").addEventListener("click", () => {
    game.Action(Direction.Right);
  });

  getElem("btn-save").addEventListener("click", () => {
    var gamestate = game.Serialize();
    var file = new File([gamestate], "game2048.txt", { type: "plain/text" });
    FileSaver.saveAs(file);
  });

  getElem("input-load").addEventListener("change", (evt: any) => {
    var file = evt.target.files[0]; // FileList object
    var reader = new FileReader();
    reader.onload = (e: any) => {
      var gameState = e.target.result;
      game.InitFromState(gameState);
      render.RebuildGraphics();
      document.body.focus();
    };
    reader.readAsText(file);
  });
}

(window as any).game2048 = {
  init: initGame
};

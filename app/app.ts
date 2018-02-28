import * as FileSaver from "file-saver";
import * as Mousetrap from "mousetrap";

import { Direction } from "app/game/enums";
import { Game2048 } from "app/game/game2048";
import { DefaultRandom } from "app/helpers/random";
import { PixiRender } from "app/render/pixi-game-render";

import "app/styles/style.css";

function initGame() {
  const game = new Game2048(4, new DefaultRandom());
  const render = new PixiRender(document, game);
  game.bindRender(render);

  Mousetrap.bind("up", function() {
    game.action(Direction.Up);
  });

  Mousetrap.bind("down", function() {
    game.action(Direction.Down);
  });

  Mousetrap.bind("left", function() {
    game.action(Direction.Left);
  });

  Mousetrap.bind("right", function() {
    game.action(Direction.Right);
  });

  const getElem = (id: string): HTMLElement => {
    const elem = document.getElementById(id);
    if (!elem) {
      throw new Error("Can't find element by id: " + id);
    }
    return elem;
  };

  getElem("control-up").addEventListener("click", () => {
    game.action(Direction.Up);
  });
  getElem("control-down").addEventListener("click", () => {
    game.action(Direction.Down);
  });
  getElem("control-left").addEventListener("click", () => {
    game.action(Direction.Left);
  });
  getElem("control-right").addEventListener("click", () => {
    game.action(Direction.Right);
  });

  getElem("btn-save").addEventListener("click", () => {
    const gamestate = game.serialize();
    const file = new File([gamestate], "game2048.txt", { type: "plain/text" });
    FileSaver.saveAs(file);
  });

  getElem("input-load").addEventListener("change", (evt: any) => {
    const file = evt.target.files[0]; // FileList object
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const gameState = e.target.result;
      game.initFromState(gameState);
      render.rebuildGraphics();
      document.body.focus();
    };
    reader.readAsText(file);
  });
}

(window as any).game2048 = {
  init: initGame
};

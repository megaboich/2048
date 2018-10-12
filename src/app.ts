import "core-js/es6/promise";
import * as Mousetrap from "mousetrap";

import { Direction } from "game/enums";
import { Game2048 } from "game/game2048";
import { DefaultRandom } from "helpers/random";
import { RenderConsole } from "render-console/render-console-main";

import "./app.css";

async function gameMain() {
  const game = new Game2048(4, new DefaultRandom());
  const render = new RenderConsole(game);

  Mousetrap.bind("up", function() {
    game.queueAction({ type: "MOVE", direction: Direction.Up });
  });

  Mousetrap.bind("down", function() {
    game.queueAction({ type: "MOVE", direction: Direction.Down });
  });

  Mousetrap.bind("left", function() {
    game.queueAction({ type: "MOVE", direction: Direction.Left });
  });

  Mousetrap.bind("right", function() {
    game.queueAction({ type: "MOVE", direction: Direction.Right });
  });

  await render.init();
  game.queueAction({ type: "START" });
  while (true) {
    const gameUpdates = await game.processAction();
    await render.update(gameUpdates);
  }

  /*
    const gamestate = game.serialize();
    const file = new File([gamestate], "game2048.txt", { type: "plain/text" });
    FileSaver.saveAs(file);
  */

  /*
  getElem("input-load").addEventListener("change", (evt: any) => {
    const file = evt.target.files[0]; // FileList object
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const gameState = e.target.result;
      game.initFromState(gameState);
      render.onInit();
      document.body.focus();
    };
    reader.readAsText(file);
  });
  */
}

(window as any).game2048 = {
  init: gameMain
};

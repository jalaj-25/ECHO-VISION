import { Game } from "./core/Game.js";
import "./styles/global.css";
import "./styles/hud.css";
import { GameStatus } from "./core/GameState.js";

const canvas = document.querySelector("#game-canvas");

if (!canvas) {
  throw new Error("Game canvas not found");
}

const game = new Game({ canvas });

game.initialize();
game.startLoop();

window.addEventListener("beforeunload", () => {
  game.dispose();
});

window.addEventListener("keydown", (e) => {
  if (e.code !== "Escape") return;

  if (game.state.status === GameStatus.PLAYING) {
    game.pauseGame();
  } else if (game.state.status === GameStatus.PAUSED) {
    game.resumeGame();
  }
});
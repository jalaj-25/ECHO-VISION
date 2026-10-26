import { GAME_CONFIG } from "../config/gameConfig.js";
  
export const GameStatus = Object.freeze({
  TITLE: "title",
  PLAYING: "playing",
  PAUSED: "paused",
  WON: "won",
  LOST: "lost"
});

export class GameState {
  constructor() {
    this.status = GameStatus.TITLE;
    this.elapsedTime = 0;
    this.pulsesUsed = 0;
    this.signalDecayRemaining = null;
    this.currentLevelIndex = 0;
    this.levelsCompleted = 0;
  }

  setStatus(status) {
    if (!Object.values(GameStatus).includes(status)) {
      throw new Error(`Invalid game state: ${status}`);
    }

    this.status = status;
  }

  get isPlaying() {
    return this.status === GameStatus.PLAYING;
  }

  reset() {
    this.status = GameStatus.TITLE;
    this.elapsedTime = 0;
    this.pulsesUsed = 0;
    this.signalDecayRemaining = null;
    this.currentLevelIndex = 0;
    this.levelsCompleted = 0;
  }

  nextLevel() {
    if (this.currentLevelIndex < GAME_CONFIG.levels.length - 1) {
      this.currentLevelIndex += 1;
    }
    this.levelsCompleted += 1;
  }

  getCurrentLevel() {
    return GAME_CONFIG.levels[this.currentLevelIndex];
  }
}
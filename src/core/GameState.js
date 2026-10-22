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
  }
}
import { GAME_CONFIG } from "../config/gameConfig.js";

export class HUD {
  constructor() {
    this.charges = 12;
    this.maximum = 12;
    this.message = "";
    this.visible = false;
    this.lowCharge = false;
    this.isRestartRequested = false;
    this.currentLevelIndex = 0;

    this.counterEl = document.querySelector("#pulse-counter");
    this.messageEl = document.querySelector("#game-message");
    this.overlayEl = document.querySelector("#screen-overlay");

    this.updateVisuals();
  }

  setLevel(index) {
    this.currentLevelIndex = index;

    const level = GAME_CONFIG.levels[index];

    if (!level) {
      console.error("Invalid level index:", index);
      return;
    }

    this.updateVisuals();
  }

  setCharges(remaining, maximum) {
    this.charges = remaining;
    this.maximum = maximum;
    this.updateVisuals();
  }

  setMessage(message) {
    this.message = message;
    this.messageEl.textContent = message;
    this.updateVisuals();
  }

  setVisible(visible) {
    this.visible = visible;
    if (this.overlayEl) {
      this.overlayEl.style.display = visible ? "grid" : "none";
    }
    this.updateVisuals();
  }

  updateLowChargeWarning() {
    this.lowCharge = this.charges <= 3;
    this.updateVisuals();
  }

  updateVisuals() {
    if (this.counterEl) {
      this.counterEl.textContent = `${this.charges}/${this.maximum}`;
      this.counterEl.style.color = this.lowCharge ? "#e3e7e1" : "#e8ebe6";
    }
    if (this.messageEl) {
      this.messageEl.style.opacity = this.message ? "1.0" : "0.0";
    }
  }

  dispose() {}
}
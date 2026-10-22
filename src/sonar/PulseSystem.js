import * as THREE from "three";
import { GAME_CONFIG } from "../config/gameConfig.js";

export class PulseSystem {
  constructor() {
    this.config = GAME_CONFIG.sonar;
    this.charges = this.config.initialCharges;
    this.cooldownRemaining = 0;
    this.activePulses = [];
  }

  emit(position) {
    if (
      this.charges <= 0 ||
      this.cooldownRemaining > 0 ||
      this.activePulses.length >= this.config.maxActivePulses
    ) {
      return false;
    }

    this.activePulses.push({
      origin: new THREE.Vector3().copy(position),
      elapsed: 0,
    });

    this.charges -= 1;
    this.cooldownRemaining = this.config.cooldown;

    return true;
  }

  update(deltaTime) {
    this.cooldownRemaining = Math.max(
      0,
      this.cooldownRemaining - deltaTime
    );

    for (const pulse of this.activePulses) {
      pulse.elapsed += deltaTime;
    }

    const lifetime =
      this.config.maxRadius / this.config.speed +
      this.config.fadeDuration;

    this.activePulses = this.activePulses.filter(
      pulse => pulse.elapsed < lifetime
    );
  }

  reset() {
    this.charges = this.config.initialCharges;
    this.cooldownRemaining = 0;
    this.activePulses = [];
  }
}
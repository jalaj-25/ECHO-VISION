export const GAME_CONFIG = Object.freeze({
  maze: {
    rows: 15,
    columns: 15,
    cellSize: 3,
    wallHeight: 3.2,
    wallThickness: 0.2,
    seed: 2026
  },

  player: {
    height: 1.65,
    speed: 3.2,
    slowSpeed: 1.6,
    radius: 0.22,
    mouseSensitivity: 0.002,
    maxPitch: Math.PI * 85 / 180
  },

  camera: {
    fov: 75,
    near: 0.05,
    far: 100
  },

  sonar: {
    initialCharges: 12,
    maxActivePulses: 3,
    cooldown: 0.45,
    speed: 16,
    maxRadius: 18,
    bandWidth: 1.25,
    fadeDuration: 1.4
  },

  gameplay: {
    exitRadius: 0.85,
    signalDecaySeconds: 30
  },

  rendering: {
    background: 0x070809,
    maxPixelRatio: 2
  }
});
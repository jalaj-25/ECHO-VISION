import { GameState, GameStatus } from "./GameState.js";
import { Renderer } from "./Renderer.js";
import { InputManager } from "./InputManager.js";
import { GAME_CONFIG } from "../config/gameConfig.js";
import { MazeGenerator } from "../world/MazeGenerator.js";
import { buildMaze } from "../world/MazeBuilder.js";
import { CollisionSystem } from "../world/CollisionSystem.js";
import { PulseSystem } from "../sonar/PulseSystem.js";
import { createSonarMaterial, syncPulses } from "../sonar/SonarMaterial.js";
import { HUD } from "../ui/HUD.js";
import { AudioManager } from "../audio/AudioManager.js";
import * as THREE from "three";

export class Game {
  constructor({ canvas }) {
    this.canvas = canvas;
    this.state = new GameState();
    this.renderer = null;
    this.inputManager = null;
    this.mazeGenerator = null;
    this.mazeMeshes = null;
    this.collisionSystem = null;
    this.playerController = null;
    this.pulseSystem = null;
    this.sonarMaterial = null;
    this.hud = null;
    this.audioManager = null;
    this.lastTime = 0;
    this.rafId = null;
    this.paused = false;
    this.signalDecayRemaining = null;
  }

  async initialize() {
    this.renderer = new Renderer(this.canvas);
    this.inputManager = new InputManager();
    this.pulseSystem = new PulseSystem();
    this.hud = new HUD();
    this.audioManager = new AudioManager();

    this.setupMaze();
    await this.setupPlayer();
    this.setupSonar();
    this.setupUI();
    this.showTitleScreen();
}

  setupMaze() {
    this.mazeGenerator = new MazeGenerator();
    const mazeData = this.mazeGenerator.generate(
      GAME_CONFIG.maze.rows,
      GAME_CONFIG.maze.columns,
      GAME_CONFIG.maze.seed
    );

    this.mazeMeshes = buildMaze(mazeData, this.renderer.scene);
    this.collisionSystem = new CollisionSystem();
    this.collisionSystem.setWalls(this.mazeMeshes.wallRectangles);
  }

  async setupPlayer() {
    const m = await import("../player/PlayerController.js");

    this.playerController = new m.PlayerController(
        this.renderer.camera,
        this.inputManager,
        this.collisionSystem
    );

    if (this.mazeMeshes) {
        this.playerController.setPosition({
            x: this.mazeMeshes.startWorld.x,
            y: GAME_CONFIG.player.height,
            z: this.mazeMeshes.startWorld.z,
        });
    }
  }

  setupSonar() {
    this.sonarMaterial = createSonarMaterial();
    this.renderer.scene.add(this._createGroundPlane());
    // Apply sonar material to all wall meshes
    this._applySonarToWalls();
  }

  _createGroundPlane() {
    const planeGeom = new THREE.PlaneGeometry(
      GAME_CONFIG.maze.columns * GAME_CONFIG.maze.cellSize,
      GAME_CONFIG.maze.rows * GAME_CONFIG.maze.cellSize
    );
    const plane = new THREE.Mesh(planeGeom, this.sonarMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0.001; // Slightly above floor
    return plane;
  }

  _applySonarToWalls() {
    for (const child of this.renderer.scene.children) {
      if (child instanceof THREE.Mesh && child.userData?.mazeWall) {
        child.material = this.sonarMaterial;
      }
    }
  }

  setupUI() {
    this.hud.setCharges(
        this.pulseSystem.charges,
        this.pulseSystem.config.initialCharges
    );

    const startBtn = document.querySelector("#start-button");

    if (startBtn) {
        startBtn.addEventListener("click", () => {
            this.startGame();
        });
    }
  }

  startGame() {
    this.state.setStatus(GameStatus.PLAYING);
    this.paused = false;

    this.inputManager.setEnabled(true);

    // Hide the title overlay
    const overlay = document.querySelector("#screen-overlay");
    if (overlay) {
        overlay.style.display = "none";
    }

    this.audioManager.resume();
    this.pulseSystem.reset();

    this.signalDecayRemaining = null;

    this.hud.setCharges(
        this.pulseSystem.charges,
        this.pulseSystem.config.initialCharges
    );

    this.hud.setMessage("");

    if (this.playerController && this.mazeMeshes) {
        this.playerController.setPosition({
            x: this.mazeMeshes.startWorld.x,
            y: GAME_CONFIG.player.height,
            z: this.mazeMeshes.startWorld.z,
        });
    }

    // Pointer lock must be requested from a user interaction
    this.canvas.requestPointerLock?.();
  }

  pauseGame() {
    this.paused = true;
    this.inputManager.setEnabled(false);
    this.hud.setVisible(false);
  }

  resumeGame() {
    this.paused = false;
    this.inputManager.setEnabled(true);
    this.hud.setVisible(true);
  }

  async restartGame() {
    this.state.reset();
    this.signalDecayRemaining = null;
    // Remove all children except background
    const children = this.renderer.scene.children;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child !== this.renderer.scene.background) {
        this.renderer.scene.remove(child);
      }
    }
    this.setupMaze();
    await this.setupPlayer();
    this.setupSonar();
    this.setupUI();
    this.hud.setCharges(12, 12);
    this.showTitleScreen();
  }

  showTitleScreen() {
    this.hud.setMessage("ECHO VISION\n\nFind your way through sound.\nUse WASD to move. Mouse to look.\nSpace to emit sonar pulse.\n\nClick Start to begin.");
    this.hud.setVisible(true);
    this.hud.setCharges(12, 12);
    this.hud.isRestartRequested = false;
  }

  hideTitleScreen() {
    this.hud.setVisible(false);
  }

  waitForStart() {
    // Check for Start button click via HUD
    if (this.hud && this.hud.isRestartRequested) {
      this.startGame();
      this.hud.isRestartRequested = false;
    }
  }

  checkExit() {
    if (!this.playerController) return false;
    const pos = this.playerController.getPosition();
    const exitPos = this.mazeMeshes.exitWorld;
    const dx = pos.x - exitPos.x;
    const dz = pos.z - exitPos.z;
    return Math.sqrt(dx * dx + dz * dz) < GAME_CONFIG.gameplay.exitRadius;
  }

  update(deltaTime) {
    if (this.state.status === GameStatus.TITLE) {
      this.waitForStart();
      return;
    }

    if (this.paused || this.inputManager.paused) return;

    deltaTime = Math.min(deltaTime, 0.05);

    // Signal decay logic: when charges are 0 and no active pulses remain,
    // start a 30-second countdown. Reaching the exit during countdown wins.
    // Countdown reaching zero loses.
    if (this.pulseSystem.charges <= 0 && this.pulseSystem.activePulses.length === 0) {
      if (this.signalDecayRemaining === null) {
        this.signalDecayRemaining = GAME_CONFIG.gameplay.signalDecaySeconds;
      }
      this.signalDecayRemaining = Math.max(0, this.signalDecayRemaining - deltaTime);
      if (this.signalDecayRemaining <= 0) {
        this.lose();
      }
    } else {
      // Reset decay timer if pulses are available again
      this.signalDecayRemaining = null;
    }
if (!this.playerController) return;

    // Process mouse movement for camera look
    const mouseMove = this.inputManager.getMouseMovement();
    this.playerController.update(deltaTime, mouseMove);

    // Handle pulse emission
    const spaceDown = this.inputManager.isKeyDown("Space");
    if (spaceDown) {
      console.log(`[DEBUG] update: Space is down, charges=${this.pulseSystem.charges}, cooldown=${this.pulseSystem.cooldownRemaining}`);
      this.handlePulse();
      this.inputManager.keys = this.inputManager.keys || {};
      this.inputManager.keys["Space"] = false;
    }

    // Update pulse propagation
    this.pulseSystem.update(deltaTime);
    syncPulses(
      this.sonarMaterial,
      this.pulseSystem.activePulses,
      this.pulseSystem.config
    );
    // Update HUD
    this.hud.setCharges(this.pulseSystem.charges, this.pulseSystem.config.initialCharges);

    // Check exit
    if (this.checkExit()) {
      this.win();
    }
  }

  handlePulse() {
    // One-shot pulse emission - only on press, not hold
    if (this.pulseSystem.emit(this.playerController.getPosition())) {
      this.hud.setCharges(this.pulseSystem.charges, this.pulseSystem.config.initialCharges);
      this.audioManager.playPulse();
    }
  }

  win() {
    this.state.setStatus(GameStatus.WON);
    this.hud.setMessage(`YOU FOUND THE SIGNAL\nPulses used: ${12 - this.pulseSystem.charges}`);
    this.audioManager.playWin();
    this.inputManager.setEnabled(false);
  }

  lose() {
    this.state.setStatus(GameStatus.LOST);
    this.hud.setMessage("THE SIGNAL IS GONE\nPulses used: 12");
    this.audioManager.lose();
    this.inputManager.setEnabled(false);
  }

  render() {
    if (this.renderer) this.renderer.render();
  }

  startLoop() {
    let previousTime = performance.now();

    const frame = (time) => {
        const deltaTime = Math.min(
            (time - previousTime) / 1000,
            0.05
        );

        previousTime = time;

        this.update(deltaTime);
        this.render();

        this.rafId = requestAnimationFrame(frame);
    };

    this.rafId = requestAnimationFrame(frame);
  }

  dispose() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.renderer.dispose();
    this.inputManager.dispose();
    this.playerController.dispose();
    this.collisionSystem.dispose();
  }
}
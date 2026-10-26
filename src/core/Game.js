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
    this.exitMarker = null;
    this.sonarGroundPlane = null;
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
    this.audioManager = new AudioManager;

    this.hud.setLevel(this.state.currentLevelIndex);

    this.setupMaze();
    await this.setupPlayer();
    this.setupSonar();
    this.setupUI();
    this.showTitleScreen();
  }

  setupMaze() {
    const currentLevel = this.state.getCurrentLevel();
    this.mazeGenerator = new MazeGenerator();
    const mazeData = this.mazeGenerator.generate(
      currentLevel.maze.rows,
      currentLevel.maze.columns,
      GAME_CONFIG.maze.seed
    );

    this.mazeMeshes = buildMaze(
      mazeData,
      this.renderer.scene,
      null,
      {
        ...GAME_CONFIG.maze,
        ...currentLevel.maze
      }
    );
    console.log("Exit world:", this.mazeMeshes.exitWorld);

    this.createExitMarker();
    const exitCell = mazeData.exit;

console.log("Exit cell:", exitCell);
console.log(
  "Exit cell walls:",
  mazeData.cells[exitCell.row][exitCell.column]
);
console.log("Start cell:", mazeData.cells[0][0]);
    this.collisionSystem = new CollisionSystem();
    this.collisionSystem.setWalls(this.mazeMeshes.wallRectangles);

    const cellSize =
    currentLevel.maze.cellSize ?? GAME_CONFIG.maze.cellSize;

    this.collisionSystem.setBounds(
      currentLevel.maze.columns * cellSize,
      currentLevel.maze.rows * cellSize
    );
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
    const currentLevel = this.state.getCurrentLevel();

    const cellSize =
      currentLevel.maze.cellSize ?? GAME_CONFIG.maze.cellSize;

    const width = currentLevel.maze.columns * cellSize;
    const depth = currentLevel.maze.rows * cellSize;

    const planeGeom = new THREE.PlaneGeometry(width, depth);

    const plane = new THREE.Mesh(planeGeom, this.sonarMaterial);

    plane.rotation.x = -Math.PI / 2;
    plane.position.set(width / 2, 0.001, depth / 2);
    plane.userData.isSonarGround = true;

    this.sonarGroundPlane = plane;

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

    const currentLevel = this.state.getCurrentLevel();

    this.pulseSystem.config = {
      ...GAME_CONFIG.sonar,
      ...currentLevel.sonar
    };

    this.pulseSystem.reset();

    this.hud.setLevel(this.state.currentLevelIndex);

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
    this.state.setStatus(GameStatus.PAUSED);
    this.inputManager.setEnabled(false);
    this.hud.setVisible(true);
  }

  resumeGame() {
    this.paused = false;
    this.state.setStatus(GameStatus.PLAYING);
    this.inputManager.setEnabled(true);
    this.hud.setVisible(false);
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
    this.hud.setCharges(
      this.state.getCurrentLevel().sonar.initialCharges,
      this.state.getCurrentLevel().sonar.initialCharges
    );
    this.hud.setLevel(0);
    this.showTitleScreen();
  }

  showTitleScreen() {
    const currentLevel = this.state.getCurrentLevel();
    const charges = currentLevel.sonar.initialCharges;

    this.hud.setMessage(
      `ECHO VISION\n\n` +
      `Find your way through sound.\n` +
      `Use WASD to move. Mouse to look.\n` +
      `Space to emit sonar pulse.\n` +
      `Level ${currentLevel.number}: ${currentLevel.name}\n\n` +
      `Click Start to begin.`
    );

    this.hud.setVisible(true);
    this.hud.setCharges(charges, charges);
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
  if (!this.playerController || !this.mazeMeshes?.exitWorld) {
    return false;
  }

  const pos = this.playerController.getPosition();
  const exit = this.mazeMeshes.exitWorld;

  const dx = pos.x - exit.x;
  const dz = pos.z - exit.z;

  const distance = Math.sqrt(dx * dx + dz * dz);
  const exitRadius = Math.max(
    GAME_CONFIG.gameplay.exitRadius ?? 1,
    1.5
  );

  // Temporary debugging log.
  if (distance < 3) {
    console.log("Near exit:", {
      player: { x: pos.x, z: pos.z },
      exit: { x: exit.x, z: exit.z },
      distance,
      exitRadius
    });
  }

  return distance < exitRadius;
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
  // Prevent repeated level completion.
  if (this.state.status !== GameStatus.PLAYING) return;

  const currentLevel = this.state.getCurrentLevel();
  const totalLevels = GAME_CONFIG.levels.length;
  const isLastLevel =
    this.state.currentLevelIndex >= totalLevels - 1;

  const pulsesUsed =
    this.pulseSystem.config.initialCharges -
    this.pulseSystem.charges;

  this.state.setStatus(GameStatus.WON);
  this.inputManager.setEnabled(false);
  this.audioManager.playWin();

  if (isLastLevel) {
    this.hud.setMessage(
      `CONGRATULATIONS!\n` +
      `You completed all ${totalLevels} levels!\n` +
      `Pulses used: ${pulsesUsed}\n\n` +
      `Click Start to restart from Level 1.`
    );

    setTimeout(() => {
      this.state.reset();
      this.state.setStatus(GameStatus.TITLE);
      this.showTitleScreen();
    }, 3000);

    return;
  }

  this.hud.setMessage(
    `Level ${currentLevel.name} Complete!\n` +
    `Pulses used: ${pulsesUsed}\n` +
    `Loading next level...`
  );

  setTimeout(async () => {
    try {
      this.state.nextLevel();
      await this.loadNextLevel();
    } catch (error) {
      console.error("Next level loading failed:", error);
      this.hud.setMessage("Failed to load the next level.");
    }
  }, 1500);
}


  lose() {
    this.state.setStatus(GameStatus.LOST);
    const currentLevel = this.state.getCurrentLevel();
    this.hud.setMessage(`THE SIGNAL IS GONE\nLevel ${currentLevel.name} failed`);
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

  clearCurrentMaze() {
    if (this.playerController) {
      this.playerController.dispose();
      this.playerController = null;
    }

    if (this.mazeMeshes?.meshes) {
      for (const mesh of this.mazeMeshes.meshes) {
      this.renderer.scene.remove(mesh);
      mesh.geometry?.dispose();
      }
    }

    if (this.sonarGroundPlane) {
      this.renderer.scene.remove(this.sonarGroundPlane);
      this.sonarGroundPlane.geometry?.dispose();
      this.sonarGroundPlane = null;
    }

    this.mazeMeshes = null;
    this.collisionSystem = null;

    if (this.exitMarker) {
    this.renderer.scene.remove(this.exitMarker);

    this.exitMarker.traverse((object) => {
      if (object.isMesh) {
        object.geometry.dispose();

        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.exitMarker = null;
    }
  }

  
async loadNextLevel() {
  this.clearCurrentMaze();

  this.setupMaze();
  await this.setupPlayer();
  this.setupSonar();

  const currentLevel = this.state.getCurrentLevel();

  this.pulseSystem.config = {
    ...GAME_CONFIG.sonar,
    ...currentLevel.sonar
  };

  this.pulseSystem.reset();
  this.signalDecayRemaining = null;

  this.hud.setLevel(this.state.currentLevelIndex);
  this.startGame();
}

createExitMarker() {
  const exit = this.mazeMeshes?.exitWorld;

  if (
    !exit ||
    !Number.isFinite(exit.x) ||
    !Number.isFinite(exit.z)
  ) {
    console.error("Invalid exit position:", exit);
    return;
  }

  // Remove the previous marker if one exists.
  if (this.exitMarker) {
    this.renderer.scene.remove(this.exitMarker);
  }

  const group = new THREE.Group();
  group.position.set(exit.x, 0, exit.z);

  const currentLevel = this.state.getCurrentLevel();

  const wallHeight =
    currentLevel.maze.wallHeight ??
    GAME_CONFIG.maze.wallHeight;

  // Green ring on the floor.
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.65, 0.07, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );

  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.08;
  group.add(ring);

  // Tall green pillar extending above the walls.
  const pillarHeight = wallHeight + 3;

  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, pillarHeight, 16),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );

  pillar.position.y = pillarHeight / 2;
  group.add(pillar);

  // Large yellow sphere above the walls.
  const yellowBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );

  yellowBeacon.position.y = pillarHeight + 0.5;
  group.add(yellowBeacon);

  this.renderer.scene.add(group);
  this.exitMarker = group;

  console.log("Exit marker created at:", exit);
}

}
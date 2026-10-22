# ECHO VISION: File Structure and Implementation Guide

## 1. Repository Layout

```text
echo-vision/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
├── system_instructions.md
├── project_spec.md
├── file_structure.md
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.js
│   ├── styles/
│   │   ├── global.css
│   │   └── hud.css
│   │
│   ├── config/
│   │   └── gameConfig.js
│   │
│   ├── core/
│   │   ├── Game.js
│   │   ├── GameState.js
│   │   ├── Renderer.js
│   │   └── InputManager.js
│   │
│   ├── world/
│   │   ├── MazeGenerator.js
│   │   ├── MazeBuilder.js
│   │   └── CollisionSystem.js
│   │
│   ├── player/
│   │   └── PlayerController.js
│   │
│   ├── sonar/
│   │   ├── PulseSystem.js
│   │   ├── SonarMaterial.js
│   │   └── shaders/
│   │       ├── sonar.vert.glsl
│   │       └── sonar.frag.glsl
│   │
│   ├── audio/
│   │   └── AudioManager.js
│   │
│   ├── ui/
│   │   ├── HUD.js
│   │   └── Screens.js
│   │
│   └── utils/
│       ├── math.js
│       └── seededRandom.js
│
├── tests/
│   ├── maze.test.js
│   ├── pulse.test.js
│   └── collision.test.js
│
└── docs/
    ├── architecture.md
    ├── shader-explanation.md
    └── team-contributions.md
```

## 2. Package Configuration

### package.json

```json
{
  "name": "echo-vision",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test tests/*.test.js"
  },
  "dependencies": {
    "three": "^0.180.0"
  },
  "devDependencies": {
    "vite": "^7.1.0"
  }
}
```

Use the dependency versions as initial targets and commit the resolved package-lock.json.

### vite.config.js

```javascript
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    host: "localhost",
    port: 5173
  },
  build: {
    target: "es2022"
  }
});
```

### .gitignore

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
.DS_Store
```

No OpenRouter API key is required by the game. Keep the OpenRouter key in OpenCode's own configuration, not in the frontend repository.

## 3. HTML Entry Point

### index.html

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <meta
    name="theme-color"
    content="#070809"
  />
  <title>Echo Vision | Navigate Through Sound</title>
</head>
<body>
  <div id="app">
    <canvas id="game-canvas"></canvas>

    <div id="hud" aria-live="polite">
      <div id="pulse-counter"></div>
      <div id="game-message"></div>
      <div id="crosshair">+</div>
    </div>

    <div id="screen-overlay"></div>
  </div>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

## 4. Central Configuration

### src/config/gameConfig.js

```javascript
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
```

All modules must read these values instead of duplicating configuration.

## 5. Application Entry

### src/main.js

```javascript
import { Game } from "./core/Game.js";
import "./styles/global.css";
import "./styles/hud.css";

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
```

## 6. Game State

### src/core/GameState.js

```javascript
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
```

## 7. Renderer

### src/core/Renderer.js

```javascript
import * as THREE from "three";
import { GAME_CONFIG } from "../config/gameConfig.js";

export class Renderer {
  constructor(canvas) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(
      GAME_CONFIG.rendering.background
    );

    this.camera = new THREE.PerspectiveCamera(
      GAME_CONFIG.camera.fov,
      window.innerWidth / window.innerHeight,
      GAME_CONFIG.camera.near,
      GAME_CONFIG.camera.far
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance"
    });

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        GAME_CONFIG.rendering.maxPixelRatio
      )
    );

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.resize = this.resize.bind(this);
    window.addEventListener("resize", this.resize);
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener("resize", this.resize);
    this.renderer.dispose();
  }
}
```

## 8. Deterministic Random Generator

### src/utils/seededRandom.js

```javascript
export function createSeededRandom(seed) {
  let state = seed >>> 0;

  return function random() {
    state = (state + 0x6D2B79F5) >>> 0;

    let t = state;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

## 9. Maze Generator

### src/world/MazeGenerator.js

```javascript
import { createSeededRandom } from "../utils/seededRandom.js";

const DIRECTIONS = [
  { dr: -1, dc: 0, wall: "north", opposite: "south" },
  { dr: 0, dc: 1, wall: "east", opposite: "west" },
  { dr: 1, dc: 0, wall: "south", opposite: "north" },
  { dr: 0, dc: -1, wall: "west", opposite: "east" }
];

export class MazeGenerator {
  generate(rows, columns, seed) {
    if (
      !Number.isInteger(rows) ||
      !Number.isInteger(columns) ||
      rows < 2 ||
      columns < 2
    ) {
      throw new Error("Maze dimensions must be integers >= 2");
    }

    const random = createSeededRandom(seed);

    const cells = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: columns }, (_, column) => ({
        row,
        column,
        north: true,
        east: true,
        south: true,
        west: true,
        visited: false
      }))
    );

    const stack = [cells[0][0]];
    cells[0][0].visited = true;

    while (stack.length > 0) {
      const current = stack[stack.length - 1];

      const options = DIRECTIONS.filter(({ dr, dc }) => {
        const nr = current.row + dr;
        const nc = current.column + dc;

        return (
          nr >= 0 &&
          nr < rows &&
          nc >= 0 &&
          nc < columns &&
          !cells[nr][nc].visited
        );
      });

      if (options.length === 0) {
        stack.pop();
        continue;
      }

      const direction =
        options[Math.floor(random() * options.length)];

      const next = cells[
        current.row + direction.dr
      ][
        current.column + direction.dc
      ];

      current[direction.wall] = false;
      next[direction.opposite] = false;

      next.visited = true;
      stack.push(next);
    }

    for (const row of cells) {
      for (const cell of row) {
        delete cell.visited;
      }
    }

    const start = { row: 0, column: 0 };
    const exit = this.findFarthestCell(cells, start);

    return {
      rows,
      columns,
      seed,
      cells,
      start,
      exit
    };
  }

  findFarthestCell(cells, start) {
    const queue = [start];
    const seen = new Set([`${start.row},${start.column}`]);

    let head = 0;
    let farthest = start;

    while (head < queue.length) {
      const current = queue[head++];
      farthest = current;

      const cell = cells[current.row][current.column];

      for (const direction of DIRECTIONS) {
        if (cell[direction.wall]) continue;

        const row = current.row + direction.dr;
        const column = current.column + direction.dc;
        const key = `${row},${column}`;

        if (seen.has(key)) continue;

        seen.add(key);
        queue.push({ row, column });
      }
    }

    return farthest;
  }
}
```

## 10. Sonar Pulse System

### src/sonar/PulseSystem.js

```javascript
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
      radius: 0
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
      pulse.radius = Math.min(
        pulse.elapsed * this.config.speed,
        this.config.maxRadius
      );
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
```

The pulse manager stores authoritative gameplay data. The shader receives a synchronized snapshot of active pulses each frame.

## 11. Vertex Shader

### src/sonar/shaders/sonar.vert.glsl

```glsl
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
    vec4 worldPosition =
        modelMatrix * vec4(position, 1.0);

    vWorldPosition = worldPosition.xyz;

    vWorldNormal = normalize(
        mat3(modelMatrix) * normal
    );

    gl_Position =
        projectionMatrix *
        viewMatrix *
        worldPosition;
}
```

For nonuniformly scaled meshes, use the appropriate normal matrix or a correctly transformed world-space normal. Do not assume the simple normal transform is universally valid.

## 12. Fragment Shader

### src/sonar/shaders/sonar.frag.glsl

```glsl
precision highp float;

#define MAX_PULSES 3

uniform vec3 uPulseOrigins[MAX_PULSES];
uniform float uPulseRadii[MAX_PULSES];
uniform float uPulseAges[MAX_PULSES];
uniform int uPulseCount;

uniform float uBandWidth;
uniform float uFadeDuration;
uniform float uPulseSpeed;
uniform float uMaxRadius;

uniform vec3 uSurfaceColor;
uniform vec3 uWaveColor;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
    float intensity = 0.0;

    for (int i = 0; i < MAX_PULSES; i++) {
        if (i >= uPulseCount) break;

        float distanceToOrigin =
            length(vWorldPosition - uPulseOrigins[i]);

        float radius = uPulseRadii[i];

        float arrivalTime =
            distanceToOrigin / uPulseSpeed;

        float timeSinceArrival =
            uPulseAges[i] - arrivalTime;

        float frontDistance =
            abs(distanceToOrigin - radius);

        float waveFront =
            1.0 - smoothstep(
                0.0,
                uBandWidth,
                frontDistance
            );

        float trail = 0.0;

        if (
            timeSinceArrival >= 0.0 &&
            distanceToOrigin <= uMaxRadius
        ) {
            trail = exp(
                -3.0 * timeSinceArrival /
                uFadeDuration
            );
        }

        intensity = max(
            intensity,
            max(waveFront, trail * 0.42)
        );
    }

    intensity = clamp(intensity, 0.0, 1.0);

    vec3 normal = normalize(vWorldNormal);

    float orientation = 0.75 +
        0.25 * abs(normal.y);

    vec3 base = vec3(0.003);

    vec3 surface =
        uSurfaceColor * intensity * orientation;

    vec3 highlight =
        uWaveColor * pow(intensity, 3.0) * 0.25;

    vec3 finalColor = base + surface + highlight;

    gl_FragColor = vec4(finalColor, 1.0);
}
```

The shader is an initial implementation, not the final visual treatment.

OpenCode must connect all uniforms through SonarMaterial.js, ensure the material works with the selected mesh construction approach, and refine the wave response after testing.

## 13. Sonar Material Interface

### src/sonar/SonarMaterial.js

Create a factory:

`createSonarMaterial(options)`

It must:

- Import both GLSL files through Vite.
- Return a Three.js ShaderMaterial.
- Initialize arrays for exactly three pulse slots.
- Use shared pulse uniforms where practical.
- Support wall and floor color variations.
- Expose a method or uniform interface for synchronization.
- Avoid allocating new uniform arrays every frame.
- Keep inactive pulse slots neutral.
- Use a consistent world-space coordinate system.

Suggested update contract:

`syncPulses(material, activePulses, config)`

This function copies active pulse origins, radii, and ages into shader uniforms.

## 14. Maze Builder Interface

### src/world/MazeBuilder.js

Implement:

`buildMaze(mazeData, scene, materials)`

Responsibilities:

- Create floor geometry.
- Build north and west walls for each cell where present.
- Add east boundary walls.
- Add south boundary walls.
- Avoid duplicate shared walls.
- Use InstancedMesh or shared geometry.
- Return wall collision rectangles.
- Return start and exit world positions.
- Return references to meshes requiring disposal.

Coordinate convention:

- X axis: maze columns.
- Z axis: maze rows.
- Y axis: height.
- Cell center: `(column * cellSize, row * cellSize)` in XZ.
- Wall center height: `wallHeight / 2`.

Use the same coordinate convention for camera placement, collisions, exit detection, and sonar origins.

## 15. Player Controller Interface

### src/player/PlayerController.js

Implement:

- `constructor(camera, inputManager, collisionSystem)`
- `update(deltaTime)`
- `setPosition(position)`
- `reset(position)`
- `setEnabled(enabled)`

Required behavior:

- WASD movement relative to camera yaw.
- Mouse look using pointer-lock movement.
- Pitch clamping.
- Player radius collision.
- Sliding along walls when moving diagonally.
- No jumping or flying.
- Fixed player eye height.
- Frame-rate-independent movement.

Do not use camera clipping as collision detection.

## 16. Collision System Interface

### src/world/CollisionSystem.js

Implement:

- `setWalls(rectangles)`
- `resolveMovement(currentPosition, desiredPosition, radius)`
- `isPositionBlocked(position, radius)`

Use 2D collision in the XZ plane.

Walls are axis-aligned rectangles.

Use circle-versus-AABB tests for the player.

Resolve X and Z movement separately to permit sliding.

Use substeps or swept collision handling if movement could tunnel through thin walls.

## 17. Input Manager Interface

### src/core/InputManager.js

Implement:

- Keyboard state tracking.
- One-shot pulse activation.
- Mouse movement tracking.
- Pointer-lock acquisition.
- Pointer-lock loss handling.
- Key state reset on blur.
- Pause and resume signals.
- Input cleanup during disposal.

Never emit multiple pulses from a held Space key because of key repeat.

## 18. Audio Manager Interface

### src/audio/AudioManager.js

Implement:

- `initialize()`
- `resume()`
- `playPulse()`
- `playExitSignal(distance)`
- `playWin()`
- `setMuted(muted)`
- `dispose()`

Use oscillators, filters, gain envelopes, and short generated tones.

Do not download external audio assets for MVP.

Throttle proximity sounds to avoid constant oscillator creation.

## 19. HUD Interface

### src/ui/HUD.js

Implement:

- `setCharges(remaining, maximum)`
- `setMessage(message)`
- `setSignalDecay(seconds)`
- `setVisible(visible)`
- `dispose()`

### src/ui/Screens.js

Implement:

- Title screen
- Pause screen
- Victory screen
- Defeat screen
- Restart interaction

Screen components must not own gameplay state.

## 20. Main Game Controller

### src/core/Game.js

The Game class coordinates all modules.

Required methods:

```javascript
class Game {
  constructor({ canvas }) {}

  initialize() {}

  startLoop() {}

  update(deltaTime) {}

  render() {}

  startGame() {}

  pauseGame() {}

  resumeGame() {}

  restartGame() {}

  checkExit() {}

  updateSignalDecay(deltaTime) {}

  win() {}

  lose() {}

  dispose() {}
}
```

### Initialization Sequence

1. Construct GameState.
2. Construct Renderer.
3. Construct InputManager.
4. Generate maze data.
5. Construct sonar materials.
6. Build maze meshes.
7. Create collision system.
8. Construct PlayerController.
9. Position player at maze start.
10. Construct PulseSystem.
11. Construct AudioManager.
12. Construct HUD and Screens.
13. Register UI and input callbacks.
14. Show title screen.

### Frame Update Sequence

1. Calculate and clamp delta time.
2. Process state transitions.
3. If playing, update player movement.
4. Process one-shot pulse input.
5. Update pulse propagation.
6. Synchronize shader uniforms.
7. Update exit detection.
8. Update signal decay.
9. Update HUD.
10. Render the scene.

Pause must freeze gameplay time, pulse propagation, and signal decay.

Rendering may continue while paused.

## 21. Main Loop Pattern

Use a single animation loop.

```javascript
let previousTime = 0;

function frame(time) {
  const deltaTime = previousTime
    ? Math.min((time - previousTime) / 1000, 0.05)
    : 0;

  previousTime = time;

  game.update(deltaTime);
  game.render();

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
```

The production Game class must own the animation frame ID and cancel it during disposal.

Do not create additional independent gameplay animation loops.

## 22. Global Styling

### src/styles/global.css

```css
:root {
  font-family: Inter, Arial, sans-serif;
  color: #e8ebe6;
  background: #070809;
  font-synthesis: none;
}

* {
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}

#app {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #070809;
}

#game-canvas {
  display: block;
  width: 100%;
  height: 100%;
  outline: none;
}

button {
  font: inherit;
  cursor: pointer;
}

button:focus-visible {
  outline: 2px solid #e8ebe6;
  outline-offset: 4px;
}
```

### src/styles/hud.css

```css
#hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  color: #e8ebe6;
}

#pulse-counter {
  position: absolute;
  left: 32px;
  bottom: 32px;
  font-family: monospace;
  font-size: 14px;
  letter-spacing: 0.12em;
}

#game-message {
  position: absolute;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

#crosshair {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  font-weight: 300;
  opacity: 0.5;
}

#screen-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(7, 8, 9, 0.94);
}

#screen-overlay:empty {
  display: none;
}
```

## 23. Testing

### Maze Tests

Verify:

- All cells are reachable.
- Every opened wall has a matching opened wall in its neighbor.
- Identical seeds produce identical layouts.
- Exit is reachable.
- Outer boundary is closed.

### Pulse Tests

Verify:

- Successful emission consumes one charge.
- Cooldown rejects additional emissions.
- Rejected emission does not consume a charge.
- Pulse radius increases with time.
- Pulse radius does not exceed its maximum.
- Expired pulses are removed.
- Reset restores charges and clears active pulses.

### Collision Tests

Verify:

- A player cannot enter a wall.
- Movement parallel to a wall remains possible.
- Diagonal movement slides appropriately.
- A player cannot escape the outer maze boundary.

Use Node's built-in test runner for pure JavaScript modules.

Browser-specific rendering and pointer-lock behavior require manual browser testing or a dedicated browser test environment.

## 24. Documentation

### docs/architecture.md

Document:

- Major modules
- Module dependencies
- Initialization sequence
- Game update sequence
- Data ownership
- Rendering pipeline

### docs/shader-explanation.md

Explain:

- Vertex transformation
- Model, view, and projection matrices
- World-space fragment coordinates
- Pulse propagation equation
- Smoothstep wave band
- Time-based surface fading
- Shader uniforms
- Performance considerations

### docs/team-contributions.md

Document each team member's actual contributions.

Do not invent team members or claim unfinished work.

## 25. Development Milestones

### Milestone 1: Foundation
Deliver a running Vite application with a Three.js scene.

### Milestone 2: Maze
Deliver a visible, deterministic, solvable 3D maze.

### Milestone 3: Navigation
Deliver working movement, mouse look, and wall collision.

### Milestone 4: Sonar
Deliver shader-based expanding waves and temporary visibility.

### Milestone 5: Gameplay
Deliver pulse charges, exit detection, win/loss states, and restart.

### Milestone 6: Presentation
Deliver refined visuals, audio, HUD, tests, and documentation.

Each milestone must be independently testable.

## 26. Definition of Done

The final application must:

- Be playable from beginning to end.
- Have a consistent atmospheric appearance.
- Demonstrate genuine WebGL rendering concepts.
- Have no known blocking gameplay bugs.
- Build successfully.
- Be organized into understandable modules.
- Be suitable for a live university demonstration.

OpenCode must treat this document as the implementation contract.

Where a module contains an interface rather than a full implementation, complete that module according to the specification before declaring the project finished.

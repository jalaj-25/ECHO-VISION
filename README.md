# ECHO VISION

### Navigate Through Sound

**Project / Team:** Echo Vision Team\
**Project Type:** Browser-based 3D maze exploration game\
**Technology:** JavaScript, Three.js, WebGL, Vite, GLSL\
**Version:** 1.0.0

------------------------------------------------------------------------

## 1. About the Project

**Echo Vision** is a first-person 3D maze game built for the browser.
The player explores a dark maze and uses sonar pulses to reveal nearby
walls and understand the surrounding environment. Instead of relying
only on continuous visibility, players use spatial awareness, movement,
and timed sonar pulses to find their way to the exit.

The project uses Three.js for 3D rendering, WebGL for graphics, GLSL
shaders for the sonar effect, and Vite for local development and
production builds.

### Core features

-   First-person camera and mouse-look controls.
-   Procedurally generated maze with a seeded layout.
-   Sonar pulses that expand through the environment and reveal nearby
    geometry.
-   Collision checks to prevent walking through maze walls.
-   HUD elements for gameplay messages and sonar charges.
-   Game states for the title screen, active play, pause, win, and loss.
-   Configurable player movement, maze dimensions, sonar behavior, and
    rendering settings.
-   Browser-based setup; no separate game launcher is required.

> The exact features available at runtime depend on the current source
> files in the project.

------------------------------------------------------------------------

## 2. Technology Stack

  Technology              Purpose
  ----------------------- ------------------------------------------------------
  HTML5                   Page structure and game canvas
  CSS                     Page layout, overlays, and HUD styling
  JavaScript ES modules   Game logic and application code
  Three.js (`three`)      3D scene, camera, geometry, and rendering
  WebGL                   Hardware-accelerated browser graphics
  GLSL                    Custom vertex and fragment shaders for sonar visuals
  Vite                    Development server and production build tooling
  Node.js and npm         JavaScript runtime and package management
  Node.js test runner     Automated tests

------------------------------------------------------------------------

## 3. Requirements

Install the following before running the project:

1.  **Node.js:** Use a current supported release. For Vite 7, use
    Node.js **20.19+ or 22.12+**.
2.  **npm:** Installed automatically with Node.js.
3.  **A modern browser:** Current Chrome, Microsoft Edge, or Firefox is
    recommended.
4.  **A code editor:** Visual Studio Code is recommended but not
    required.
5.  **WebGL support:** Hardware acceleration and WebGL must be available
    in the browser.

Check your installations in a terminal:

``` bash
node --version
npm --version
```

If either command is not recognized, install Node.js, close and reopen
the terminal, and run the commands again.

------------------------------------------------------------------------

## 4. Download and Set Up Locally

### Option A --- You have the ZIP file

1.  Extract `Echo-Vision Group Project.zip`.
2.  Open the extracted `Echo-Vision Group Project` folder.
3.  Confirm that `package.json` and `index.html` are in the project
    root.
4.  Open a terminal in that folder.

In Visual Studio Code, you can select **File → Open Folder**, choose the
extracted project folder, then select **Terminal → New Terminal**.

### Option B --- You have a Git repository

Open a terminal and run the following, replacing the example URL with
the actual repository URL:

``` bash
git clone <YOUR_REPOSITORY_URL>
cd <REPOSITORY_FOLDER>
```

### Install dependencies

Run this command from the folder containing `package.json`:

``` bash
npm install
```

This installs the project dependencies declared in `package.json`,
including Three.js and Vite. You normally only need to do this once, and
again if dependencies change.

**Do not run the commands from the parent folder** if `package.json` is
inside `Echo-Vision Group Project`.

### Start the development server

``` bash
npm run dev
```

Vite will display a local URL in the terminal, usually:

``` text
http://localhost:5173/
```

Open that URL in your browser. Keep the terminal running while you play;
it hosts the local development server.

To stop the server, focus the terminal and press **Ctrl + C**.

------------------------------------------------------------------------

## 5. How to Play

1.  Open the local URL in your browser.
2.  Select **Start Game**.
3.  Click the game area if the browser asks for pointer lock or mouse
    control.
4.  Use the keyboard and mouse to explore the maze.
5.  Press **Space** to emit a sonar pulse and reveal nearby
    surroundings.
6.  Follow the maze corridors and use sonar strategically to locate the
    exit.

### Controls

  -----------------------------------------------------------------------
  Input                               Action
  ----------------------------------- -----------------------------------
  `W`                                 Move forward

  `A`                                 Move left

  `S`                                 Move backward

  `D`                                 Move right

  Mouse                               Look around

  `Space`                             Emit a sonar pulse

  `Shift`                             Move slowly / precision movement

  `Esc`                               Release pointer lock or open the
                                      browser's pointer-lock exit
                                      behavior
  -----------------------------------------------------------------------

The exact Escape/pause behavior depends on how the current input and
game-state handlers are implemented. If the pointer is released, click
the game area again to resume mouse-look when supported.

### Sonar behavior

The central configuration currently specifies:

-   Initial sonar charges: **12**
-   Maximum simultaneous active pulses: **3**
-   Pulse cooldown: **0.45 seconds**
-   Pulse speed: **16 units/second**
-   Maximum pulse radius: **18 units**
-   Signal-decay duration: **30 seconds**

These are configuration values, not guarantees that every HUD or
gameplay mechanic is currently enabled. Adjust them in
`src/config/gameConfig.js`.

------------------------------------------------------------------------

## 6. Project Structure

The main source files are organized by responsibility:

``` text
Echo-Vision Group Project/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── main.js
│   ├── styles/
│   │   ├── global.css
│   │   └── hud.css
│   ├── config/
│   │   └── gameConfig.js
│   ├── core/
│   │   ├── Game.js
│   │   ├── GameState.js
│   │   ├── Renderer.js
│   │   └── InputManager.js
│   ├── world/
│   │   ├── MazeGenerator.js
│   │   ├── MazeBuilder.js
│   │   └── CollisionSystem.js
│   ├── player/
│   │   └── PlayerController.js
│   ├── sonar/
│   │   ├── PulseSystem.js
│   │   ├── SonarMaterial.js
│   │   └── shaders/
│   │       ├── sonar.vert.glsl
│   │       └── sonar.frag.glsl
│   ├── audio/
│   │   └── AudioManager.js
│   ├── ui/
│   │   ├── HUD.js
│   │   └── Screens.js
│   └── utils/
│       ├── math.js
│       └── seededRandom.js
├── tests/
│   ├── maze.test.js
│   ├── pulse.test.js
│   └── collision.test.js
└── docs/
    ├── architecture.md
    ├── shader-explanation.md
    └── team-contributions.md
```

Some files shown above may be absent in a particular copy or branch. The
source files in your extracted project are the definitive reference.

### Key modules

-   **`src/main.js`** --- Application entry point; creates and starts
    the game.
-   **`src/core/Game.js`** --- Coordinates initialization, updates, and
    rendering.
-   **`src/core/GameState.js`** --- Tracks game status and session
    values.
-   **`src/core/Renderer.js`** --- Sets up the Three.js scene, camera,
    and renderer.
-   **`src/core/InputManager.js`** --- Handles keyboard and mouse input.
-   **`src/config/gameConfig.js`** --- Central location for gameplay and
    rendering settings.
-   **`src/world/MazeGenerator.js`** --- Generates maze cell data.
-   **`src/world/MazeBuilder.js`** --- Builds the visible maze and
    collision rectangles.
-   **`src/world/CollisionSystem.js`** --- Checks whether player
    movement intersects walls or maze boundaries.
-   **`src/player/PlayerController.js`** --- Handles movement, camera
    rotation, and player position.
-   **`src/sonar/PulseSystem.js`** --- Manages sonar pulse lifecycle and
    updates.
-   **`src/sonar/SonarMaterial.js`** --- Configures sonar shader
    materials.
-   **`src/sonar/shaders/`** --- GLSL vertex and fragment shader source.
-   **`src/ui/`** --- HUD and game-screen behavior.
-   **`tests/`** --- Automated tests for core mechanics, if included in
    the current copy.

------------------------------------------------------------------------

## 7. Configuration and Customization

Open `src/config/gameConfig.js` to change the main game settings.

### Maze

``` js
maze: {
  rows: 15,
  columns: 15,
  cellSize: 3,
  wallHeight: 3.2,
  wallThickness: 0.2,
  seed: 2026
}
```

-   `rows` and `columns` control maze dimensions.
-   `cellSize` controls the size of each maze cell.
-   `wallHeight` controls wall height.
-   `wallThickness` controls wall thickness.
-   `seed` controls the deterministic maze layout when the generator
    uses the seed.

### Player

``` js
player: {
  height: 1.65,
  speed: 3.2,
  slowSpeed: 1.6,
  radius: 0.22,
  mouseSensitivity: 0.002,
  maxPitch: Math.PI * 85 / 180
}
```

-   `speed` controls normal movement speed.
-   `slowSpeed` controls slower movement.
-   `radius` is used for player collision checks.
-   `mouseSensitivity` controls mouse-look sensitivity.
-   `maxPitch` limits vertical camera rotation.

### Sonar

``` js
sonar: {
  initialCharges: 12,
  maxActivePulses: 3,
  cooldown: 0.45,
  speed: 16,
  maxRadius: 18,
  bandWidth: 1.25,
  fadeDuration: 1.4
}
```

Change values gradually and test after each change. If you change maze
dimensions or cell size, check that maze generation, floor dimensions,
boundaries, collision geometry, player spawn, and exit placement remain
consistent.

------------------------------------------------------------------------

## 8. How to Create or Add a Maze

Echo Vision currently creates its maze from code. It does **not** include a visual, in-game maze editor. You can make a different maze by changing the generation settings, or build a custom layout by editing the maze data.

### Method A — Generate a different maze (recommended)

The maze is generated by `src/world/MazeGenerator.js`. The easiest way to create a different layout is to change the `seed` value in `src/config/gameConfig.js`.

```js
maze: {
  rows: 15,
  columns: 15,
  cellSize: 3,
  wallHeight: 3.2,
  wallThickness: 0.2,
  seed: 2027
}
```

1. Open `src/config/gameConfig.js`.
2. Change `seed` from `2026` to another integer, such as `2027` or `42`.
3. Save the file and reload the game.
4. Keep the same seed if you want to reproduce that layout later.

The generator uses a seeded random algorithm, so the same dimensions and seed should produce the same maze layout.

#### Change the maze size

You can also change `rows` and `columns`:

```js
maze: {
  rows: 20,
  columns: 20,
  cellSize: 3,
  wallHeight: 3.2,
  wallThickness: 0.2,
  seed: 42
}
```

- `rows`: number of cells from front to back.
- `columns`: number of cells from left to right.
- `cellSize`: world-space size of each cell.
- `seed`: controls the generated layout.

Start with a modest size such as `10 × 10` or `15 × 15`. Larger mazes create more walls and can take longer to explore. If you change the maze dimensions, check the collision boundary logic as well: it must match the actual maze size and coordinate range. Do not assume the boundary is always `22.5`.

### Method B — Design a custom maze layout

For a hand-designed maze, the core data format is a grid of cells. Each cell has four wall flags:

```js
{
  row: 0,
  column: 0,
  north: true,
  east: false,
  south: true,
  west: true
}
```

- `true` means that wall exists.
- `false` means that side is an opening into the neighboring cell.
- `row` and `column` identify the cell in the grid.

`src/world/MazeGenerator.js` creates this structure automatically. To make a hand-designed layout, create or modify a `mazeData` object in the same format and pass it to `buildMaze(mazeData, scene, wallMaterial)` in place of the generated data. You will need to adjust the game initialization code that currently calls `MazeGenerator.generate(...)` so that it uses your custom data.

#### Example custom maze data

This small example shows the required data shape for a 2 × 2 maze. It is a format example; adapt the wall openings and exit to create the route you want.

```js
const customMazeData = {
  rows: 2,
  columns: 2,
  seed: 1,
  start: { row: 0, column: 0 },
  exit: { row: 1, column: 1 },
  cells: [
    [
      {
        row: 0, column: 0,
        north: true, east: false,
        south: false, west: true
      },
      {
        row: 0, column: 1,
        north: true, east: true,
        south: true, west: false
      }
    ],
    [
      {
        row: 1, column: 0,
        north: false, east: true,
        south: true, west: true
      },
      {
        row: 1, column: 1,
        north: true, east: true,
        south: true, west: true
      }
    ]
  ]
};
```

In this example, the top-left cell is connected to the top-right cell through their shared east/west opening, and to the bottom-left cell through their shared south/north opening. The bottom-right cell is isolated in this sample, so **do not use it as a playable maze without adding a connecting opening**. This illustrates the data format, not a finished playable layout.

#### Rules for a valid custom maze

1. **Keep shared walls consistent.** If cell `(row, column)` has `east: false`, the cell to its right must have `west: false`. Similarly, a cell's `south: false` must match the cell below it having `north: false`.
2. **Ensure the exit is reachable.** There must be a continuous route from the start cell to the exit cell.
3. **Keep the grid dimensions consistent.** `cells` must have exactly `rows` arrays, and every row must contain exactly `columns` cells.
4. **Use valid exit coordinates.** `exit` must contain valid `row` and `column` values. The builder uses these to calculate the exit's world position.
5. **Keep the spawn clear.** The start cell must have enough open space for the player radius; do not place a wall across the spawn location.
6. **Keep boundaries and collisions aligned.** `MazeBuilder.js` creates wall meshes and collision rectangles from the same cell data. `CollisionSystem.js` must use the rectangle properties `x`, `z`, `width`, and `depth`.
7. **Test the whole route.** Play from the start to the exit and confirm that the player can pass every intended opening without crossing walls.

### Which files are involved?

| File | What to change |
|---|---|
| `src/config/gameConfig.js` | Change the number of rows/columns, cell size, wall dimensions, or generation seed. |
| `src/world/MazeGenerator.js` | Change the generation algorithm or create a custom cell grid. |
| `src/world/MazeBuilder.js` | Controls how maze cell data becomes visible wall meshes and collision rectangles. |
| `src/world/CollisionSystem.js` | Controls wall collision and outer maze boundaries. |
| Game initialization code (usually `src/core/Game.js`) | Select whether to use generated maze data or your own custom maze data. |

**Recommended workflow:** First change the seed to create a new maze. Only modify `MazeGenerator.js` or game initialization if you need a specific, hand-designed layout. After every maze change, test movement, wall collisions, the spawn point, and the exit.

---

## 9. Useful Development Commands

Run these from the project root.

### Start local development

``` bash
npm run dev
```

### Run automated tests

``` bash
npm test
```

### Create a production build

``` bash
npm run build
```

Vite writes the production output to the `dist/` directory.

### Preview the production build locally

``` bash
npm run preview
```

Use the local URL printed by Vite to inspect the production build.

### Recommended workflow

1.  Make a small code change.
2.  Save the file.
3.  Check the browser; Vite usually refreshes the page automatically.
4.  Open browser developer tools with `F12`.
5.  Inspect the **Console** for JavaScript errors and the **Network**
    tab for failed file requests.
6.  Run `npm test` and `npm run build` before sharing a release.

------------------------------------------------------------------------

## 10. Troubleshooting

### `npm` or `node` is not recognized

Node.js is not installed correctly or the terminal has not refreshed its
PATH. Install a supported Node.js version, reopen the terminal, and
check `node --version` and `npm --version`.

### `npm install` fails

-   Confirm you are in the folder containing `package.json`.
-   Check your internet connection.
-   Read the first meaningful error in the terminal.
-   If dependencies were copied from another operating system, remove
    `node_modules` and reinstall.

Windows PowerShell:

``` powershell
Remove-Item -Recurse -Force node_modules
npm install
```

macOS/Linux:

``` bash
rm -rf node_modules
npm install
```

Do not delete `package.json` or the lockfile as a first troubleshooting
step.

### The page does not open

-   Confirm `npm run dev` is still running.
-   Open the exact URL printed in the terminal.
-   If port `5173` is busy, Vite may offer another port; use the URL it
    prints.

### The page is blank or the game does not start

-   Open browser developer tools with `F12`.
-   Check the Console for the first error.
-   Confirm `index.html` loads `/src/main.js`.
-   Confirm the imports in `src/main.js` point to existing files.
-   Verify the browser supports WebGL and that graphics acceleration is
    available.

### The Start Game button does nothing

-   Check the browser Console for JavaScript errors.
-   Confirm the button ID in `index.html` matches the ID used by the
    UI/game code.
-   Confirm the click handler changes the game status and starts or
    enables gameplay.
-   Check whether the browser is waiting for a click to enable pointer
    lock or audio.

### The mouse does not control the camera

-   Click inside the game area after starting.
-   Pointer lock may be restricted until a user gesture.
-   Press `Esc` to release pointer lock; click the game area again when
    ready.

### WASD does not move the player

-   Confirm keyboard input is being registered in `InputManager.js`.
-   Check that the game is in the `PLAYING` state.
-   Inspect collision logs and player coordinates in the Console.
-   Ensure `MazeBuilder.js` produces collision rectangles with `x`, `z`,
    `width`, and `depth`.
-   Ensure `CollisionSystem.js` reads those same property names and uses
    the correct maze boundaries.
-   Check that the spawn point is in an open cell.

### Sonar is not visible

-   Confirm `Space` input is registered.
-   Check sonar charges and cooldown settings in `gameConfig.js`.
-   Inspect the Console for shader compilation errors.
-   Confirm the sonar material and pulse system are initialized and
    updated by the game loop.
-   Check that the GLSL shader files are imported using valid paths.

### Changes do not appear

-   Save the edited file.
-   Check that you edited the extracted project folder currently served
    by Vite.
-   Hard-refresh the browser with `Ctrl + Shift + R`.
-   Restart the development server if necessary.

------------------------------------------------------------------------

## 11. Testing Checklist

Before submitting or demonstrating the project, verify:

-   [ ] The project installs using `npm install`.
-   [ ] `npm run dev` starts without errors.
-   [ ] The local page loads and the Start Game control responds.
-   [ ] Mouse-look works after entering gameplay.
-   [ ] `W`, `A`, `S`, and `D` move the player through open corridors.
-   [ ] The player cannot walk through maze walls.
-   [ ] Space triggers a sonar pulse.
-   [ ] Sonar charges/cooldown behave as expected.
-   [ ] The exit and win state work, if implemented in the current
    branch.
-   [ ] Browser Console has no unresolved runtime or shader errors.
-   [ ] `npm test` passes, if tests are included.
-   [ ] `npm run build` completes successfully.

------------------------------------------------------------------------

## 12. Browser Compatibility and Performance

Echo Vision uses real-time 3D rendering. Performance depends on the
browser, GPU, device, display resolution, and pixel ratio.

For best results:

-   Use an up-to-date desktop browser.
-   Enable hardware acceleration where available.
-   Close other GPU-heavy applications if frame rates are low.
-   Test on the target device before a live demonstration.
-   Keep the browser tab active during gameplay.

The project is designed as a browser game; it does not currently require
a separate desktop installer.

------------------------------------------------------------------------

## 13. Security and Privacy

-   The local development server is intended for development and
    testing.
-   Do not expose a development server publicly unless you understand
    the network and security implications.
-   Do not add private credentials, tokens, or passwords to frontend
    source files.
-   This project does not require an API key for its described local
    gameplay.

------------------------------------------------------------------------

## 14. Team and Credits

**Project Name:** Echo Vision\
**Builder / Project Team:** Echo Vision Team

### Team contributions

Add the actual contributors and their responsibilities before final
submission. Do not leave placeholder names in a submitted copy.

  Team member            Contribution
  ---------------------- ---------------------------
  Add team member name   Add contribution / module
  Add team member name   Add contribution / module
  Add team member name   Add contribution / module

### Acknowledgements

-   **Three.js** --- 3D graphics library.
-   **Vite** --- Local development server and build tool.
-   **WebGL and GLSL** --- Browser graphics and shader technology.

Third-party dependencies retain their respective licenses. Check the
relevant dependency and asset licenses before redistributing the
project.

------------------------------------------------------------------------

## 15. License

No project-specific open-source license has been confirmed in this
README. If the team plans to publish or redistribute Echo Vision, add a
`LICENSE` file that states the intended terms and verify that
third-party assets and dependencies can be used under those terms.

------------------------------------------------------------------------

## 16. Quick Start Summary

``` bash
# 1. Open the project root (the folder containing package.json)

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open the URL printed by Vite, usually:
# http://localhost:5173/

# 5. Run tests
npm test

# 6. Build for production
npm run build

# 7. Preview the production build
npm run preview
```

**Built by the Echo Vision Team.**\
*Explore the maze. Listen to the echoes. Find the exit.*

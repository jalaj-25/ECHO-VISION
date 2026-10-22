# ECHO VISION: AI Development Instructions

## 1. Agent Role

You are the lead WebGL engineer, gameplay programmer, technical artist, and code reviewer for Echo Vision.

Build a complete, browser-based 3D echolocation maze game suitable for a university team evaluation.

Do not generate a generic Three.js demonstration. Build a cohesive, playable application with well-defined systems, thoughtful interaction design, and maintainable code.

## 2. Project Metadata

- Project: Echo Vision
- University: [UNIVERSITY_NAME]
- Team: [TEAM_NAMES]
- Technical preference: [TECH_STACK_PREFERENCE]
- Default implementation: Three.js + JavaScript + HTML5 + CSS3 + Vite
- Game mode: Single-player
- Platform: Desktop web browsers
- Primary controls: Keyboard and mouse
- Rendering: WebGL through Three.js
- Backend: Not required for MVP

If the technical preference is unspecified, use the default implementation.

## 3. Non-Negotiable Rules

1. Use JavaScript ES Modules.
2. Keep rendering, gameplay, input, audio, UI, and maze generation separate.
3. Use Three.js for 3D rendering and custom GLSL shaders where appropriate.
4. Never put all gameplay logic inside `main.js`.
5. Use `requestAnimationFrame` through the main game loop.
6. Use delta-time-based movement and animation.
7. Use deterministic maze generation using a configurable random seed.
8. Use collision detection to prevent walking through walls.
9. Implement the pulse budget as an actual gameplay constraint.
10. Handle browser resize, pointer-lock changes, and audio initialization.
11. Do not introduce React, Tailwind, TypeScript, or a backend without a documented need and approval.
12. Do not introduce unnecessary dependencies.
13. Do not use external paid assets or services.
14. Keep the initial game lightweight and offline-capable after installation.
15. Do not claim a feature works unless it has been implemented and tested.

## 4. Visual Design Requirements

Echo Vision must look like an atmospheric experimental game, not a generic AI-generated dashboard.

Use:
- Obsidian and charcoal environments.
- Near-black background and low ambient visibility.
- Desaturated stone and graphite geometry.
- Thin monochrome sonar propagation bands.
- Brief surface illumination with soft falloff.
- Controlled white or warm-gray UI accents.
- Minimal, carefully spaced typography.
- Subtle procedural textures where useful.

Avoid:
- Purple, pink, or rainbow gradients.
- Permanent glowing wall outlines.
- Bright neon grids.
- Excessive bloom.
- Generic gaming dashboards.
- Large colorful buttons.
- Decorative particle effects without gameplay purpose.
- Excessive UI panels.

The visual reference is an acoustic sensing instrument inside a dark architectural environment.

## 5. Architectural Requirements

Use the following major modules:

### Game
Owns initialization, lifecycle, game state, frame updates, and restart behavior.

### Renderer
Owns WebGL renderer configuration, camera setup, fog, and scene management.

### MazeGenerator
Creates a deterministic, solvable maze layout.

### MazeBuilder
Converts maze data into Three.js meshes and collision geometry.

### PlayerController
Handles first-person movement, mouse orientation, and collision.

### InputManager
Handles keyboard input and pointer-lock state.

### PulseSystem
Creates sound-wave events, updates propagation, consumes charges, and manages reveal timing.

### SonarMaterial
Implements distance-based temporary illumination on maze surfaces.

### AudioManager
Produces pulse, movement, collision, and completion sounds.

### HUD
Displays pulse charges, objective information, and game status.

### GameState
Tracks title, playing, paused, won, and lost states.

Each module must have a clear public interface and minimal coupling.

## 6. Rendering Rules

- Prefer shared geometry and materials.
- Use instanced meshes for repeated maze walls where practical.
- Use custom ShaderMaterial for the primary sonar reveal.
- Avoid one light source per pulse.
- Avoid large numbers of transparent meshes.
- Avoid per-frame geometry reconstruction.
- Reuse Vector3, Matrix4, and other temporary objects in hot paths.
- Clamp delta time after inactive browser tabs.
- Dispose of GPU resources during teardown.

The pulse must reveal actual maze surfaces using world-space calculations.

A purely decorative expanding circle is not sufficient.

## 7. Gameplay Rules

- The player starts in a dark maze.
- WASD moves the player.
- Mouse controls camera direction.
- Spacebar emits one sonar pulse.
- Each pulse consumes one available charge.
- Pulses propagate outward from the player's position.
- Nearby geometry becomes visible only when the wave reaches it.
- Revealed surfaces fade back into darkness.
- The exit has a subtle acoustic signature.
- The player wins by reaching the exit.
- The player loses when no pulses remain and no further valid progress is possible under the defined loss rules.

Do not make zero charges cause immediate defeat unless the player is genuinely unable to continue.

## 8. Coding Standards

- Use descriptive PascalCase class names.
- Use camelCase for functions and variables.
- Use uppercase snake case for immutable configuration constants.
- Prefer small methods with a single responsibility.
- Use named exports except for application entry points where unnecessary.
- Add JSDoc to public methods and non-obvious algorithms.
- Validate configuration values.
- Avoid circular imports.
- Avoid hardcoded paths and magic numbers.
- Use centralized configuration for movement, pulse, camera, and maze parameters.
- Do not suppress errors silently.

## 9. Development Workflow

Before implementing a feature:

1. Inspect the existing repository.
2. Read this document, `project_spec.md`, and `file_structure.md`.
3. Identify the files affected.
4. State the planned changes briefly.
5. Implement the smallest complete working increment.
6. Run the available build and tests.
7. Verify integration with existing systems.
8. Update documentation when interfaces change.

Do not overwrite functioning code without checking dependencies.

Do not perform unrelated refactoring.

## 10. Implementation Order

Phase 1: Vite setup and application shell.

Phase 2: Three.js renderer, camera, and main loop.

Phase 3: Deterministic maze generation and 3D construction.

Phase 4: First-person movement, pointer lock, and collision.

Phase 5: Sonar shader and pulse propagation.

Phase 6: Pulse resource system and game states.

Phase 7: Audio feedback and HUD.

Phase 8: Exit logic, win/loss conditions, and restart.

Phase 9: Performance improvements, accessibility, and testing.

Phase 10: Final visual polish and evaluation preparation.

Finish and verify each phase before advancing.

## 11. Acceptance Requirements

The application is complete only when:

- `npm install` succeeds.
- `npm run dev` starts the application.
- `npm run build` succeeds.
- The maze is navigable and solvable.
- The player cannot pass through solid walls.
- Spacebar emits a visible, expanding sonar wave.
- Pulses decrease correctly.
- Surface illumination fades after propagation.
- The exit can be reached.
- Winning and losing are handled consistently.
- Restart restores a valid initial state.
- Audio works after user interaction.
- Pointer-lock failure does not break gameplay.
- Browser resizing works.
- No recurring runtime errors occur.
- The game maintains acceptable performance on an ordinary student laptop.

## 12. Team Development Policy

Keep systems independent so different team members can work in parallel.

Recommended workstreams:

- Core engine and renderer
- Maze generation and player movement
- Sonar rendering and audio
- UI, gameplay integration, testing, and documentation

Use Git branches and review changes before merging.

Do not create parallel implementations of the same system.

## 13. Final Instruction

Prioritize a polished, complete, technically explainable game over feature quantity.

The primary technical achievement must be visible, real-time WebGL-based echolocation.

When uncertain, choose the simplest implementation that preserves the intended gameplay and rendering quality.

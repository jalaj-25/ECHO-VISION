# ECHO VISION: Project Specification

## 1. Project Overview

**Title:** Echo Vision

**Genre:** First-person atmospheric maze puzzle

**Mode:** Single-player

**Platform:** Desktop browser

**Technology:** Three.js and WebGL

**Theme:** Navigation through acoustic perception

### Concept

The player awakens inside an unfamiliar architectural maze without conventional lighting.

The environment is almost completely invisible.

By emitting sound pulses, the player temporarily reveals surrounding surfaces and constructs a mental map of the environment.

Every pulse is limited, forcing players to balance exploration, memory, and resource management.

The objective is to locate an acoustic exit marker and escape.

### Central Design Principle

**Sound is sight. Silence is uncertainty.**

The player should learn the maze through brief visual information, not continuous illumination.

## 2. Learning Objectives

The project must demonstrate:

- WebGL-based real-time 3D rendering.
- Perspective projection and camera transformations.
- Model, view, and projection matrices.
- Vertex and fragment shaders.
- World-space distance calculations.
- Time-based visual animation.
- Keyboard and mouse interaction.
- Collision detection.
- Procedural geometry generation.
- Basic game state management.
- Real-time audio-visual interaction.
- Modular frontend architecture.

The project must be understandable and demonstrable during a university evaluation.

## 3. Core Gameplay Loop

1. Player enters a dark maze.
2. Player emits a sonar pulse.
3. The pulse expands through the environment.
4. Nearby walls and objects appear temporarily.
5. The player identifies possible paths.
6. The revealed geometry fades.
7. The player moves using remembered information.
8. The player decides whether another pulse is worth spending.
9. The player reaches the exit or exhausts their usable navigation options.

## 4. Controls

| Input | Action |
|---|---|
| W | Move forward |
| S | Move backward |
| A | Strafe left |
| D | Strafe right |
| Mouse | Look around |
| Space | Emit sonar pulse |
| Shift | Walk slowly |
| Escape | Release pointer lock and pause |
| R | Restart after winning or losing |
| M | Toggle audio mute |

Prevent browser scrolling when Space is used during gameplay.

Disable gameplay input when the game is paused or finished.

## 5. Player Configuration

Default parameters:

- Camera height: 1.65 world units
- Walking speed: 3.2 units/second
- Slow-walk speed: 1.6 units/second
- Player collision radius: 0.22 units
- Maximum pitch: 85 degrees
- Field of view: 75 degrees
- Near clipping plane: 0.05
- Far clipping plane: 100

Movement must be independent of frame rate.

The camera should have restrained motion without exaggerated head bobbing.

## 6. Maze Design

### Default Layout

- Logical maze size: 15 × 15 cells
- Cell width: 3 world units
- Wall height: 3.2 world units
- Wall thickness: 0.2 world units
- Floor: Continuous dark surface
- Ceiling: Optional, disabled in MVP
- Start: One corner of the maze
- Exit: Distant reachable cell

### Generation

Use randomized depth-first search with a configurable seed.

Requirements:

- Every cell is reachable.
- There is at least one valid route from start to exit.
- The maze is reproducible using the same seed.
- Walls align without gaps.
- Outer boundaries remain closed except for deliberate exit geometry.
- Maze geometry and collision data derive from the same source layout.

Use BFS to select a farthest reachable cell as the exit.

### Maze Data Model

Each cell stores:

- Row
- Column
- North wall
- East wall
- South wall
- West wall
- Visited flag during generation

The generator returns a maze object containing dimensions, cells, seed, start, and exit.

## 7. Sonar Pulse Mechanics

### Pulse Budget

- Initial charges: 12
- Maximum simultaneous active pulses: 3
- Pulse cooldown: 0.45 seconds
- Pulse propagation speed: 16 world units/second
- Maximum radius: 18 world units
- Wave-band thickness: 1.25 world units
- Surface fade duration: 1.4 seconds
- Initial visibility: Near-black
- Pulse origin: Player position at activation

Charges are consumed only when a pulse is successfully emitted.

Pressing Space during cooldown must not consume a charge.

### Pulse Lifecycle

1. Validate gameplay state.
2. Check remaining charges.
3. Check cooldown.
4. Capture player position.
5. Create pulse event.
6. Consume one charge.
7. Play sound.
8. Propagate the wave.
9. Reveal surfaces when reached.
10. Fade the revealed surfaces.
11. Remove expired pulse.

### Mathematical Model

For each surface fragment:

- Let `P` be its world-space position.
- Let `O` be the pulse origin.
- Let `t` be elapsed pulse time.
- Let `v` be propagation speed.

Wave radius:

`R = v × t`

Distance from origin:

`d = length(P - O)`

Wave-front intensity:

`I = 1 - smoothstep(0, width, abs(d - R))`

The final reveal also includes a short-lived fading trail behind the wave front.

All intensity calculations must be clamped to the range 0 to 1.

### Important Technical Constraint

The MVP uses world-space radial propagation.

It does not simulate physically accurate sound reflections, diffraction, or acoustic ray tracing.

The wave may visually reveal surfaces through intervening walls.

True acoustic occlusion is an optional advanced feature, not an MVP requirement.

This distinction must be explained accurately during evaluation.

## 8. Rendering Design

### Base Environment

The world uses very dark materials with nearly zero ambient contribution.

Walls should be rendered in muted graphite tones only when revealed.

The background should remain visually quiet.

Avoid using large ambient lights to fake the sonar effect.

### Sonar Material

Implement a custom shader using:

- World-space fragment position
- Surface normal
- Pulse origin
- Pulse radius
- Pulse elapsed time
- Wave-band thickness
- Surface fade time
- Reveal intensity

The shader must support up to three simultaneous active pulses.

Use a fixed-size uniform array with an active-pulse count.

Blend the pulse contribution into the final surface color.

Do not add one dynamic light per pulse.

### Surface Response

A pulse should produce:

- A crisp advancing wave band.
- A softer trailing illumination region.
- Subtle variation based on surface orientation.
- A gradual return to darkness.

Walls should appear as solid surfaces, not only outlines.

### Floor Treatment

The floor should reveal faintly, with less intensity than walls.

Use low-frequency procedural noise or restrained texture variation.

Do not introduce bright tiled grids.

## 9. Visual Identity

### Palette

| Element | Color |
|---|---|
| Background | `#070809` |
| Deep void | `#0B0D0E` |
| Wall graphite | `#272C2D` |
| Revealed surface | `#B8BFBA` |
| Sonar highlight | `#E3E7E1` |
| Muted UI text | `#8E9692` |
| Primary UI text | `#E8EBE6` |
| Exit accent | `#C3AD82` |

The exit accent should be rare and restrained.

### Typography

Use system sans-serif typography for interface labels.

Recommended hierarchy:

- Game title: Thin uppercase lettering with wide tracking.
- Status labels: Small uppercase text.
- Pulse count: Monospaced numerals.
- Instructions: Short, readable sentences.

Avoid futuristic display fonts and heavy decorative typography.

### Composition

The game view occupies the entire viewport.

UI overlays must remain minimal.

Place pulse information near the bottom-left corner.

Place a subtle crosshair at the center.

Show contextual prompts only when needed.

Do not place a permanent large navigation map on screen.

## 10. Audio Design

Use the Web Audio API.

Required sounds:

### Pulse Emission
A short, low-frequency synthetic impulse with a higher-frequency attack.

### Pulse Return
A restrained delayed resonance.

### Exit Proximity
A subtle recurring acoustic tone that becomes more noticeable near the exit.

### Completion
A short tonal resolution.

Sound should feel spatial and restrained.

Do not use loud arcade sound effects.

AudioContext must initialize or resume after user interaction.

Include a mute control.

## 11. Interface States

### Title

Display:

ECHO VISION

"Find your way through sound."

Controls and a Start button.

### Playing

Display:

- Remaining pulse charges
- Small center crosshair
- Optional short objective hint
- Low-charge warning

### Paused

Display:

- Paused
- Resume instruction
- Restart option
- Mute control

### Won

Display:

"YOU FOUND THE SIGNAL"

Include:

- Pulses used
- Time taken
- Restart button

### Lost

Display:

"THE SIGNAL IS GONE"

Include:

- Pulses used
- Time taken
- Restart button

## 12. Win and Loss Conditions

### Win

The player wins when entering the exit trigger radius.

Default radius: 0.85 world units.

### Loss

Running out of pulses alone does not immediately end the game.

For the MVP, the player may continue moving without charges.

After pulse
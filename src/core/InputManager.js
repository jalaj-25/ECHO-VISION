export class InputManager {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, moved: false };
    this.pointerLocked = false;

    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
      if (e.code === "KeyM") {
        remove;
      }
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    document.addEventListener("mousemove", (e) => {
      this.mouse.x = e.movementX || 0;
      this.mouse.y = e.movementY || 0;
      this.mouse.moved = true;
    });

    const canvas = document.querySelector("#game-canvas");
    if (canvas) {
      canvas.addEventListener("click", () => {
        if (!this.pointerLocked) {
          canvas.requestPointerLock();
        }
      });

      document.addEventListener("pointerlockchange", () => {
        this.pointerLocked = document.pointerLockElement === canvas;
      });

      document.addEventListener("pointerlockerror", (e) => {
        console.error("Pointer lock error:", e.error);
      });
    }
  }

  isKeyDown(code) {
    const normalizedCode = code === "Space" ? "Spacebar" : code;
    return !!this.keys[normalizedCode] || !!this.keys[code];
  }

  getMouseMovement() {
    const movement = { x: this.mouse.x, y: this.mouse.y };
    this.mouse.moved = false;
    return movement;
  }

  isPointerLocked() {
    return this.pointerLocked;
  }

  setEnabled(enabled) {
    // Enable/disable gameplay input
    if (!enabled) {
      this.keys = {};
    }
  }

  reset() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, moved: false };
    this.pointerLocked = false;
  }

  dispose() {
    this.reset();
  }
}
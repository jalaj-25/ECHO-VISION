
export class InputManager {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, moved: false };
    this.pointerLocked = false;

    this.canvas = document.querySelector("#game-canvas");

    this.handleKeyDown = (e) => {
      this.keys[e.code] = true;
    };

    this.handleKeyUp = (e) => {
      this.keys[e.code] = false;
    };

    this.handleMouseMove = (e) => {
      if (!this.pointerLocked) return;

      this.mouse.x = e.movementX || 0;
      this.mouse.y = e.movementY || 0;
      this.mouse.moved = true;
    };

    this.handlePointerLockChange = () => {
      this.pointerLocked =
        document.pointerLockElement === this.canvas;

      if (!this.pointerLocked) {
        this.mouse = { x: 0, y: 0, moved: false };
      }
    };

    this.handlePointerLockError = () => {
      console.warn(
        "Pointer lock could not be acquired. Click the game canvas to retry."
      );
    };

    this.handleCanvasClick = () => {
      if (!this.canvas || document.pointerLockElement) return;

      // Called directly from the user's click gesture.
      try {
        const result = this.canvas.requestPointerLock();

        if (result && typeof result.catch === "function") {
          result.catch((error) => {
            console.warn("Pointer lock request failed:", error);
          });
        }
      } catch (error) {
        console.warn("Pointer lock request failed:", error);
      }
    };

    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener(
      "pointerlockchange",
      this.handlePointerLockChange
    );
    document.addEventListener(
      "pointerlockerror",
      this.handlePointerLockError
    );

    if (this.canvas) {
      this.canvas.addEventListener("click", this.handleCanvasClick);
    } else {
      console.error('InputManager: "#game-canvas" was not found.');
    }
  }

  isKeyDown(code) {
    return !!this.keys[code];
  }

  getMouseMovement() {
    const movement = {
      x: this.mouse.x,
      y: this.mouse.y,
    };

    this.mouse.x = 0;
    this.mouse.y = 0;
    this.mouse.moved = false;

    return movement;
  }

  isPointerLocked() {
    return this.pointerLocked;
  }

  setEnabled(enabled) {
    this.enabled = enabled;

    if (!enabled) {
      this.keys = {};
    }
  }

  reset() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, moved: false };
  }

  dispose() {
    this.reset();

    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener(
      "pointerlockchange",
      this.handlePointerLockChange
    );
    document.removeEventListener(
      "pointerlockerror",
      this.handlePointerLockError
    );

    if (this.canvas) {
      this.canvas.removeEventListener("click", this.handleCanvasClick);
    }

    this.pointerLocked = false;
  }
}

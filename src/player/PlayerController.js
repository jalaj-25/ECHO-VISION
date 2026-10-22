
import { GAME_CONFIG } from "../config/gameConfig.js";

export class PlayerController {
  constructor(camera, inputManager, collisionSystem, radius = 0.22) {
    this.camera = camera;
    this.inputManager = inputManager;
    this.collisionSystem = collisionSystem;
    this.radius = radius;

    this.pitch = 0;
    this.yaw = 0;

    this.position = { x: 0, y: 1.65, z: 0 };

    this.speed = GAME_CONFIG.player.speed;
    this.slowSpeed = GAME_CONFIG.player.slowSpeed;
    this.maxPitch = GAME_CONFIG.player.maxPitch;

    // Movement is read from InputManager only.
    // Avoid duplicate keyboard and mouse event listeners.
    this.camera.rotation.order = "YXZ";
  }

  setPosition(position) {
    this.position = { ...position };
    this.camera.position.set(position.x, position.y, position.z);
  }

  getPosition() {
    return { ...this.position };
  }

  setEnabled(enabled) {
    // InputManager controls whether keyboard input is enabled.
  }

  update(deltaTime, mouseMovement) {
    // Mouse look
    if (mouseMovement) {
      const sensitivity = GAME_CONFIG.player.mouseSensitivity;

      this.yaw -= mouseMovement.x * sensitivity;
      this.pitch -= mouseMovement.y * sensitivity;

      this.pitch = Math.max(
        -this.maxPitch,
        Math.min(this.maxPitch, this.pitch)
      );

      this.camera.rotation.set(this.pitch, this.yaw, 0);
    }

    // Read actual keyboard codes from InputManager.
    const forward =
      (this.inputManager.isKeyDown("KeyW") ? 1 : 0) -
      (this.inputManager.isKeyDown("KeyS") ? 1 : 0);

    const right =
      (this.inputManager.isKeyDown("KeyD") ? 1 : 0) -
      (this.inputManager.isKeyDown("KeyA") ? 1 : 0);

    if (forward === 0 && right === 0) return;

    const slow = this.inputManager.isKeyDown("ShiftLeft");
    const speed = slow ? this.slowSpeed : this.speed;

    const moveZ =
        (this.inputManager.isKeyDown("KeyW") ? 1 : 0) -
        (this.inputManager.isKeyDown("KeyS") ? 1 : 0);

    const moveX =
        (this.inputManager.isKeyDown("KeyD") ? 1 : 0) -
        (this.inputManager.isKeyDown("KeyA") ? 1 : 0);

    console.log({
      W: this.inputManager.isKeyDown("KeyW"),
      A: this.inputManager.isKeyDown("KeyA"),
      S: this.inputManager.isKeyDown("KeyS"),
      D: this.inputManager.isKeyDown("KeyD"),
      moveX,
      moveZ
    });
    // Normalize diagonal movement.
    const length = Math.hypot(forward, right);
    const f = forward / length;
    const r = right / length;

    // Move relative to the direction the camera faces.
    const desiredX =
      -Math.sin(this.yaw) * f + Math.cos(this.yaw) * r;

    const desiredZ =
      -Math.cos(this.yaw) * f - Math.sin(this.yaw) * r;

    const distance = speed * deltaTime;

    const predictedX = this.position.x + desiredX * distance;
    const predictedZ = this.position.z + desiredZ * distance;

    const collisionX = this.collisionSystem.isPositionBlocked(
      { x: predictedX, z: this.position.z },
      this.radius
    );

    const collisionZ = this.collisionSystem.isPositionBlocked(
      { x: this.position.x, z: predictedZ },
      this.radius
    );
    console.log({
      currentPosition: { ...this.position },
      predictedPosition: { x: predictedX, z: predictedZ },
      collisionX,
      collisionZ
    });
    if (!collisionX) this.position.x = predictedX;
    if (!collisionZ) this.position.z = predictedZ;

    this.camera.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    );
  }

  reset() {
    // No local event listeners to clean up.
  }

  dispose() {
    this.reset();
  }
}

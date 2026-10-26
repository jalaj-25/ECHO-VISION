
export class CollisionSystem {
  constructor() {
    this.walls = [];
    this.width = 45;
    this.depth = 45;
  }

  setWalls(rectangles) {
    this.walls = Array.isArray(rectangles) ? rectangles : [];
  }

  setBounds(width, depth) {
    this.width = width;
    this.depth = depth;
  }

  isPositionBlocked(position, radius) {
    // Keep the player inside the maze boundaries.
    if (this._testBoundary(position, radius)) {
      return true;
    }

    // Check collision against each wall rectangle.
    for (const wall of this.walls) {
      if (this._testCircleVsAABB(position, radius, wall)) {
        return true;
      }
    }

    return false;
  }

  _testCircleVsAABB(position, radius, wall) {
    const left = Math.min(wall.x, wall.x + wall.width);
    const right = Math.max(wall.x, wall.x + wall.width);
    const top = Math.min(wall.z, wall.z + wall.depth);
    const bottom = Math.max(wall.z, wall.z + wall.depth);

    const closestX = Math.max(left, Math.min(position.x, right));
    const closestZ = Math.max(top, Math.min(position.z, bottom));

    const dx = position.x - closestX;
    const dz = position.z - closestZ;

    // Small tolerance helps avoid sticking due to floating-point precision.
    const effectiveRadius = Math.max(0, radius - 0.01);

    return (
      dx * dx + dz * dz <
      effectiveRadius * effectiveRadius
    );
  }

  _testBoundary(position, radius) {
    return (
      position.x - radius < 0 ||
      position.x + radius > this.width ||
      position.z - radius < 0 ||
      position.z + radius > this.depth
    );
  }

  resolveMovement(currentPosition, desiredPosition, radius) {
    const resolved = {
      x: currentPosition.x,
      z: currentPosition.z
    };

    // Resolve X and Z independently so the player can slide along walls.
    if (
      !this.isPositionBlocked(
        { x: desiredPosition.x, z: currentPosition.z },
        radius
      )
    ) {
      resolved.x = desiredPosition.x;
    }

    if (
      !this.isPositionBlocked(
        { x: resolved.x, z: desiredPosition.z },
        radius
      )
    ) {
      resolved.z = desiredPosition.z;
    }

    return resolved;
  }

  reset() {}

  dispose() {
    this.reset();
  }
}

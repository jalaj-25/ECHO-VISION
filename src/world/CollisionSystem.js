export class CollisionSystem {
  constructor() {
    this.walls = [];
  }

  setWalls(rectangles) {
    this.walls = rectangles;
  }

  isPositionBlocked(position, radius) {
  for (const wall of this.walls) {
    if (this._testCircleVsAABB(position, radius, wall)) {
      console.log("[Collision] Blocked by wall:", {
        position,
        wall
      });
      return true;
    }
  }

  const boundaryBlocked = this._testBoundary(position, radius);

  if (boundaryBlocked) {
    console.log("[Collision] Blocked by maze boundary:", position);
  }

  return boundaryBlocked;
}

  _testCircleVsAABB(position, radius, wall) {
  const closestX = Math.max(
    wall.x,
    Math.min(position.x, wall.x + wall.width)
  );

  const closestZ = Math.max(
    wall.z,
    Math.min(position.z, wall.z + wall.depth)
  );

  const dx = position.x - closestX;
  const dz = position.z - closestZ;

  return dx * dx + dz * dz < radius * radius;
}

_testBoundary(position, radius) {
  const mazeRadius = 22.5;

  return (
    position.x - radius < -mazeRadius ||
    position.x + radius > mazeRadius ||
    position.z - radius < -mazeRadius ||
    position.z + radius > mazeRadius
  );
}
  // _testCircleVsAABB(position, radius, wall) {
  //   const closestX = Math.max(wall.x, Math.min(position.x, wall.x + wall.width));
  //   const closestZ = Math.max(wall.y, Math.min(position.z, wall.y + wall.height));
  //   const dx = position.x - closestX;
  //   const dz = position.z - closestZ;
  //   return dx * dx + dz * dz < radius * radius;
  // }

  // _testBoundary(position, radius) {
    // const mazeRadius = 22.5;
    // const dx = Math.max(-mazeRadius - position.x, Math.min(0, mazeRadius - position.x));
    // const dz = Math.max(-mazeRadius - position.z, Math.min(mazeRadius - position.z, 0));
    // return dx * dx + dz * dz < radius * radius;
  // }

  resolveMovement(currentPosition, desiredPosition, radius) {
    const resolved = { x: currentPosition.x, z: currentPosition.z };

    const moveX = desiredPosition.x - currentPosition.x;
    const moveZ = desiredPosition.z - currentPosition.z;

    const stepX = moveX;
    const stepZ = moveZ;

    let collisionX = false;
    let collisionZ = false;

    if (Math.abs(stepX) > 0.001) {
      const predictedX = currentPosition.x + stepX;
      if (!this.isPositionBlocked({ x: predictedX, z: currentPosition.z }, radius)) {
        resolved.x = predictedX;
      } else {
        collisionX = true;
      }
    } else {
      resolved.x = currentPosition.x;
    }

    if (Math.abs(stepZ) > 0.001) {
      const predictedZ = currentPosition.z + stepZ;
      if (!this.isPositionBlocked({ x: resolved.x, z: predictedZ }, radius)) {
        resolved.z = predictedZ;
      } else {
        collisionZ = true;
      }
    } else {
      resolved.z = currentPosition.z;
    }

    if (collisionX && collisionZ) {
      const nx = Math.abs(stepX) > Math.abs(stepZ) ? (stepX > 0 ? 1 : -1) : 0;
      const nz = Math.abs(stepZ) > Math.abs(stepX) ? (stepZ > 0 ? 1 : -1) : 0;
      const testX = currentPosition.x + nx * Math.abs(stepX);
      const testZ = currentPosition.z + nz * Math.abs(stepZ);
      if (!this.isPositionBlocked({ x: testX, z: testZ }, radius)) {
        resolved.x = testX;
        resolved.z = testZ;
      }
    }

    return resolved;
  }

  reset() {}

  dispose() {
    this.reset();
  }
}

import * as THREE from "three";
import { GAME_CONFIG } from "../config/gameConfig.js";

export function buildMaze(mazeData, scene, wallMaterial) {
  const {
    rows,
    columns,
    cellSize,
    wallHeight,
    wallThickness,
  } = GAME_CONFIG.maze;

  const wallRectangles = [];
  const meshes = [];

  const halfWall = wallThickness / 2;

  const wallGeometry = new THREE.BoxGeometry(
    cellSize,
    wallHeight,
    wallThickness
  );

  const floorGeometry = new THREE.PlaneGeometry(
    columns * cellSize,
    rows * cellSize
  );

  const defaultWallMaterial = new THREE.MeshStandardMaterial({
    color: 0x272c2d,
    roughness: 0.85,
    metalness: 0.1,
    flatShading: true,
  });

  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1d1f,
    roughness: 1,
  });

  const effectiveWallMaterial =
    wallMaterial || defaultWallMaterial;

  // Floor
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(
    (columns * cellSize) / 2,
    0,
    (rows * cellSize) / 2
  );

  floor.receiveShadow = true;
  floor.userData.isMazeFloor = true;

  scene.add(floor);
  meshes.push(floor);

  // Add a wall mesh and its matching X/Z collision rectangle.
  function addWall(x, z, width, depth, rotationY = 0) {
    const geometry =
      width === cellSize && depth === wallThickness
        ? wallGeometry
        : new THREE.BoxGeometry(width, wallHeight, depth);

    const wall = new THREE.Mesh(geometry, effectiveWallMaterial);

    wall.position.set(
      x + width / 2,
      wallHeight / 2,
      z + depth / 2
    );

    wall.rotation.y = rotationY;
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData.mazeWall = true;

    scene.add(wall);
    meshes.push(wall);

    wallRectangles.push({
      x,
      z,
      width,
      depth,
    });
  }

  // Build walls from the maze cell data.
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const cell = mazeData.cells[row][col];

      const cx = col * cellSize;
      const cz = row * cellSize;

      // North: horizontal wall at the far Z edge of this cell.
      if (cell.north) {
        addWall(
          cx,
          cz + cellSize - halfWall,
          cellSize,
          wallThickness
        );
      }

      // East: vertical wall at the far X edge of this cell.
      if (cell.east) {
        addWall(
          cx + cellSize - halfWall,
          cz,
          wallThickness,
          cellSize
        );
      }

      // South: horizontal wall at the near Z edge of this cell.
      if (cell.south) {
        addWall(
          cx,
          cz - halfWall,
          cellSize,
          wallThickness
        );
      }

      // West: vertical wall at the near X edge of this cell.
      if (cell.west) {
        addWall(
          cx - halfWall,
          cz,
          wallThickness,
          cellSize
        );
      }
    }
  }

  // Player spawn: center of the first cell.
  const startWorld = {
    x: cellSize / 2,
    z: cellSize / 2,
  };

  // Exit: center of the configured exit cell.
  const exitCell = mazeData.exit;

  const exitWorld = {
    x: exitCell.column * cellSize + cellSize / 2,
    z: exitCell.row * cellSize + cellSize / 2,
  };

  return {
    meshes,
    wallRectangles,
    startWorld,
    exitWorld,
  };
}

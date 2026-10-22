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
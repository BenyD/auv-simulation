import { GRID_SIZE } from "./constants";

interface Position {
  x: number;
  y: number;
}

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

// Manhattan distance heuristic
const heuristic = (pos: Position, goal: Position): number => {
  return Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y);
};

// Get valid neighbors for a position
const getNeighbors = (
  pos: Position,
  obstacleMap: Set<string>,
  visited: Set<string>
): Position[] => {
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 1, y: 0 }, // right
    { x: 0, y: 1 }, // down
    { x: -1, y: 0 }, // left
  ];

  return directions
    .map((dir) => ({
      x: pos.x + dir.x,
      y: pos.y + dir.y,
    }))
    .filter((newPos) => {
      // Check bounds
      if (
        newPos.x < 0 ||
        newPos.x >= GRID_SIZE.width ||
        newPos.y < 0 ||
        newPos.y >= GRID_SIZE.height
      ) {
        return false;
      }

      // Check obstacles
      if (obstacleMap.has(`${newPos.x},${newPos.y}`)) {
        return false;
      }

      // Check if already visited
      const posKey = `${newPos.x},${newPos.y}`;
      if (visited.has(posKey)) {
        return false;
      }

      return true;
    });
};

// A* pathfinding implementation
export const findPath = (
  start: Position,
  goal: Position,
  obstacles: Position[]
): Position[] => {
  const obstacleMap = new Set(obstacles.map((o) => `${o.x},${o.y}`));

  const openSet: Node[] = [];
  const openSetMap = new Set<string>();
  const closedSet = new Set<string>();

  const h = heuristic(start, goal);
  const startNode: Node = {
    x: start.x,
    y: start.y,
    g: 0,
    h,
    f: h,
    parent: null,
  };

  openSet.push(startNode);
  openSetMap.add(`${startNode.x},${startNode.y}`);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    openSetMap.delete(`${current.x},${current.y}`);

    if (current.x === goal.x && current.y === goal.y) {
      const path: Position[] = [];
      let node: Node | null = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    closedSet.add(`${current.x},${current.y}`);

    const neighbors = getNeighbors(current, obstacleMap, closedSet);

    for (const neighbor of neighbors) {
      const g = current.g + 1;
      const h = heuristic(neighbor, goal);
      const f = g + h;

      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (openSetMap.has(neighborKey)) continue;

      const node: Node = {
        x: neighbor.x,
        y: neighbor.y,
        g,
        h,
        f,
        parent: current,
      };

      openSet.push(node);
      openSetMap.add(neighborKey);
    }
  }

  return [];
};

// Get next move direction based on current position and next position
export const getNextMove = (current: Position, next: Position): number => {
  if (next.x > current.x) return 1; // right
  if (next.x < current.x) return 0; // left
  if (next.y > current.y) return 3; // down
  if (next.y < current.y) return 2; // up
  return -1; // no move needed
};

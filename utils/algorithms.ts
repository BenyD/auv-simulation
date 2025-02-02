import { GRID_SIZE } from "./constants";

export interface Position {
  x: number;
  y: number;
}

export interface PathfindingResult {
  path: Position[];
  nodesExplored: number;
  executionTime: number;
}

export type PathfindingAlgorithm = "astar" | "rrt" | "drl";

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

// Base interface for all pathfinding algorithms
export interface PathFinder {
  findPath(
    start: Position,
    goal: Position,
    obstacles: Position[]
  ): PathfindingResult;
  getName(): string;
  getDescription(): string;
}

// Common helper functions
const getNeighbors = (
  pos: Position,
  obstacles: Set<string>,
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
      if (
        newPos.x < 0 ||
        newPos.x >= GRID_SIZE.width ||
        newPos.y < 0 ||
        newPos.y >= GRID_SIZE.height
      ) {
        return false;
      }

      const posKey = `${newPos.x},${newPos.y}`;
      if (obstacles.has(posKey) || visited.has(posKey)) {
        return false;
      }

      return true;
    });
};

const reconstructPath = (node: Node): Position[] => {
  const path: Position[] = [];
  let current: Node | null = node;

  while (current !== null) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }

  return path;
};

// A* Implementation
export class AStarPathFinder implements PathFinder {
  getName(): string {
    return "A* Search";
  }

  getDescription(): string {
    return "Optimal pathfinding using heuristic-based search. Guarantees shortest path.";
  }

  private heuristic(pos: Position, goal: Position): number {
    return Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y);
  }

  findPath(
    start: Position,
    goal: Position,
    obstacles: Position[]
  ): PathfindingResult {
    const startTime = performance.now();
    let nodesExplored = 0;

    const obstacleSet = new Set(obstacles.map((o) => `${o.x},${o.y}`));
    const openSet: Node[] = [];
    const closedSet = new Set<string>();

    const startNode: Node = {
      x: start.x,
      y: start.y,
      g: 0,
      h: this.heuristic(start, goal),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;
    openSet.push(startNode);

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      nodesExplored++;

      if (current.x === goal.x && current.y === goal.y) {
        return {
          path: reconstructPath(current),
          nodesExplored,
          executionTime: performance.now() - startTime,
        };
      }

      closedSet.add(`${current.x},${current.y}`);

      const neighbors = getNeighbors(current, obstacleSet, closedSet);
      for (const neighbor of neighbors) {
        const g = current.g + 1;
        const h = this.heuristic(neighbor, goal);
        const f = g + h;

        const node: Node = {
          x: neighbor.x,
          y: neighbor.y,
          g,
          h,
          f,
          parent: current,
        };

        openSet.push(node);
      }
    }

    return {
      path: [],
      nodesExplored,
      executionTime: performance.now() - startTime,
    };
  }
}

// Add RRT Implementation
export class RRTPathFinder implements PathFinder {
  private obstacleSet: Set<string> = new Set();

  getName(): string {
    return "RRT (Rapidly-exploring Random Tree)";
  }

  getDescription(): string {
    return "Efficient for complex environments, uses random sampling to explore space quickly.";
  }

  private getRandomPoint(): Position {
    return {
      x: Math.floor(Math.random() * GRID_SIZE.width),
      y: Math.floor(Math.random() * GRID_SIZE.height),
    };
  }

  private distance(a: Position, b: Position): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  private findNearestNode(point: Position, nodes: Node[]): Node {
    let nearest = nodes[0];
    let minDist = this.distance(point, nearest);

    for (const node of nodes) {
      const dist = this.distance(point, node);
      if (dist < minDist) {
        minDist = dist;
        nearest = node;
      }
    }
    return nearest;
  }

  private steer(from: Position, to: Position, maxDistance: number): Position {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= maxDistance) {
      return to;
    }

    const ratio = maxDistance / distance;
    return {
      x: Math.round(from.x + dx * ratio),
      y: Math.round(from.y + dy * ratio),
    };
  }

  private isValidPath(
    from: Position,
    to: Position,
    obstacles: Set<string>
  ): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 2; // Increase resolution

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(from.x + dx * t);
      const y = Math.round(from.y + dy * t);

      // Check bounds
      if (x < 0 || x >= GRID_SIZE.width || y < 0 || y >= GRID_SIZE.height) {
        return false;
      }

      // Check obstacles
      if (obstacles.has(`${x},${y}`)) {
        return false;
      }
    }
    return true;
  }

  private optimizePath(path: Position[]): Position[] {
    if (path.length <= 2) return path;

    const optimizedPath: Position[] = [path[0]];
    let currentPoint = 0;

    while (currentPoint < path.length - 1) {
      let furthestVisible = currentPoint + 1;

      for (let i = path.length - 1; i > currentPoint; i--) {
        if (this.isValidPath(path[currentPoint], path[i], this.obstacleSet)) {
          furthestVisible = i;
          break;
        }
      }

      optimizedPath.push(path[furthestVisible]);
      currentPoint = furthestVisible;
    }

    return optimizedPath;
  }

  findPath(
    start: Position,
    goal: Position,
    obstacles: Position[]
  ): PathfindingResult {
    const startTime = performance.now();
    let nodesExplored = 0;
    const maxIterations = 2000; // Increased iterations
    const stepSize = 2; // Maximum step size
    const goalBias = 0.2; // Increased goal bias

    this.obstacleSet = new Set(obstacles.map((o) => `${o.x},${o.y}`));
    const nodes: Node[] = [
      {
        x: start.x,
        y: start.y,
        g: 0,
        h: 0,
        f: 0,
        parent: null,
      },
    ];

    for (let i = 0; i < maxIterations; i++) {
      nodesExplored++;

      // Select target point with goal bias
      const targetPoint =
        Math.random() < goalBias ? goal : this.getRandomPoint();
      const nearestNode = this.findNearestNode(targetPoint, nodes);

      // Steer towards the target point
      const newPoint = this.steer(
        { x: nearestNode.x, y: nearestNode.y },
        targetPoint,
        stepSize
      );

      // Validate the path
      if (this.isValidPath(nearestNode, newPoint, this.obstacleSet)) {
        const newNode: Node = {
          x: newPoint.x,
          y: newPoint.y,
          g: 0,
          h: 0,
          f: 0,
          parent: nearestNode,
        };
        nodes.push(newNode);

        // Check if we can reach the goal
        if (
          this.distance(newPoint, goal) < stepSize &&
          this.isValidPath(newPoint, goal, this.obstacleSet)
        ) {
          const finalNode: Node = {
            x: goal.x,
            y: goal.y,
            g: 0,
            h: 0,
            f: 0,
            parent: newNode,
          };

          // Add path optimization before returning
          if (finalNode) {
            const rawPath = reconstructPath(finalNode);
            const optimizedPath = this.optimizePath(rawPath);
            return {
              path: optimizedPath,
              nodesExplored,
              executionTime: performance.now() - startTime,
            };
          }
        }
      }
    }

    // If no path found, try to return best partial path
    const closestToGoal = this.findNearestNode(goal, nodes);
    if (closestToGoal) {
      return {
        path: reconstructPath(closestToGoal),
        nodesExplored,
        executionTime: performance.now() - startTime,
      };
    }

    return {
      path: [],
      nodesExplored,
      executionTime: performance.now() - startTime,
    };
  }
}

// Update factory function
export function getPathFinder(algorithm: PathfindingAlgorithm): PathFinder {
  switch (algorithm) {
    case "astar":
      return new AStarPathFinder();
    case "rrt":
      return new RRTPathFinder();
    case "drl":
      throw new Error("Deep Reinforcement Learning implementation coming soon");
    default:
      return new AStarPathFinder();
  }
}

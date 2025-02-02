import { Position, getPathFinder, PathfindingAlgorithm } from "./algorithms";

let currentPath: Position[] = [];
let lastStart: string = "";
let lastGoal: string = "";
let lastObstacles: string = "";
let lastAlgorithm: string = "";

// Add path cache
const pathCache = new Map<string, Position[]>();

export const predictNextMove = (
  currentPos: Position,
  goalPos: Position,
  obstacles: Position[],
  algorithm: PathfindingAlgorithm
): number => {
  const cacheKey = `${algorithm}-${currentPos.x},${currentPos.y}-${goalPos.x},${
    goalPos.y
  }-${obstacles
    .map((o) => `${o.x},${o.y}`)
    .sort()
    .join("|")}`;

  if (pathCache.has(cacheKey)) {
    currentPath = pathCache.get(cacheKey)!;
  } else {
    const pathFinder = getPathFinder(algorithm);
    const result = pathFinder.findPath(currentPos, goalPos, obstacles);
    currentPath = result.path;
    pathCache.set(cacheKey, currentPath);
  }

  const startKey = `${currentPos.x},${currentPos.y}`;
  const goalKey = `${goalPos.x},${goalPos.y}`;
  const obstaclesKey = obstacles
    .map((o) => `${o.x},${o.y}`)
    .sort()
    .join("|");

  // Add algorithm to cache key to force recalculation when algorithm changes
  if (
    currentPath.length === 0 ||
    !currentPath.some(
      (pos) => pos.x === currentPos.x && pos.y === currentPos.y
    ) ||
    startKey !== lastStart ||
    goalKey !== lastGoal ||
    obstaclesKey !== lastObstacles ||
    algorithm !== lastAlgorithm
  ) {
    const pathFinder = getPathFinder(algorithm);
    const result = pathFinder.findPath(currentPos, goalPos, obstacles);
    currentPath = result.path;

    lastStart = startKey;
    lastGoal = goalKey;
    lastObstacles = obstaclesKey;
    lastAlgorithm = algorithm;

    if (currentPath.length === 0) {
      console.warn("No path found!");
      return -1;
    }
  }

  const currentIndex = currentPath.findIndex(
    (pos) => pos.x === currentPos.x && pos.y === currentPos.y
  );

  if (currentIndex === currentPath.length - 1) {
    return -1; // Reached goal
  }

  const nextPos = currentPath[currentIndex + 1];
  return getNextMove(currentPos, nextPos);
};

// Helper to convert path positions into directional moves
export const getNextMove = (current: Position, next: Position): number => {
  if (next.x < current.x) return 0; // Left
  if (next.x > current.x) return 1; // Right
  if (next.y < current.y) return 2; // Up
  if (next.y > current.y) return 3; // Down
  return -1; // No move
};

// Add cache clearing function
export const clearPathCache = () => {
  pathCache.clear();
};

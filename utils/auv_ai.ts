import { findPath, getNextMove } from "./pathfinding";

interface Position {
  x: number;
  y: number;
}

let currentPath: Position[] = [];
let lastStart: string = "";
let lastGoal: string = "";
let lastObstacles: string = "";

export const predictNextMove = (
  currentPos: Position,
  goalPos: Position,
  obstacles: Position[]
): number => {
  const startKey = `${currentPos.x},${currentPos.y}`;
  const goalKey = `${goalPos.x},${goalPos.y}`;
  const obstaclesKey = obstacles
    .map((o) => `${o.x},${o.y}`)
    .sort()
    .join("|");

  if (
    currentPath.length === 0 ||
    !currentPath.some(
      (pos) => pos.x === currentPos.x && pos.y === currentPos.y
    ) ||
    startKey !== lastStart ||
    goalKey !== lastGoal ||
    obstaclesKey !== lastObstacles
  ) {
    currentPath = findPath(currentPos, goalPos, obstacles);
    lastStart = startKey;
    lastGoal = goalKey;
    lastObstacles = obstaclesKey;

    if (currentPath.length === 0) {
      console.warn("No path found!");
      return -1;
    }
  }

  const currentIndex = currentPath.findIndex(
    (pos) => pos.x === currentPos.x && pos.y === currentPos.y
  );

  if (currentIndex === currentPath.length - 1) {
    return -1;
  }

  const nextPos = currentPath[currentIndex + 1];
  return getNextMove(currentPos, nextPos);
};

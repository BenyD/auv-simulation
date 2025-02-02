import { GRID_SIZE } from "./constants";
import * as tf from "@tensorflow/tfjs";

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
  ): Promise<PathfindingResult> | PathfindingResult;
  getName(): string;
  getDescription(): string;
}

// Common helper functions
const hasCollisionAtPosition = (
  pos: Position,
  obstacles: Position[]
): boolean => {
  return obstacles.some((obs) => obs.x === pos.x && obs.y === pos.y);
};

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

// Add near other helper functions
const getNewPosition = (current: Position, move: number): Position => {
  const newPos = { ...current };
  switch (move) {
    case 0:
      newPos.x--;
      break; // Left
    case 1:
      newPos.x++;
      break; // Right
    case 2:
      newPos.y--;
      break; // Up
    case 3:
      newPos.y++;
      break; // Down
  }
  return newPos;
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

// Add DRL implementation
export class DRLPathFinder implements PathFinder {
  private model!: tf.LayersModel;
  private initialized: boolean = false;
  private epsilon: number = 0.05; // Reduced exploration rate
  private gamma: number = 0.99; // Increased discount factor
  private replayBuffer: Array<{
    state: number[];
    action: number;
    reward: number;
    nextState: number[];
    done: boolean;
  }> = [];
  private maxBufferSize: number = 10000; // Increased buffer size
  private batchSize: number = 64; // Increased batch size
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initModel();
  }

  private async initModel() {
    try {
      const model = tf.sequential();
      model.add(
        tf.layers.dense({
          units: 256, // Increased network capacity
          inputShape: [6],
          activation: "relu",
          kernelInitializer: "glorotUniform",
        })
      );
      model.add(tf.layers.dropout({ rate: 0.1 })); // Reduced dropout
      model.add(tf.layers.dense({ units: 128, activation: "relu" }));
      model.add(tf.layers.dense({ units: 64, activation: "relu" }));
      model.add(tf.layers.dense({ units: 4, activation: "linear" }));

      model.compile({
        optimizer: tf.train.adam(0.0005), // Reduced learning rate
        loss: "meanSquaredError",
      });

      this.model = model;
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize DRL model:", error);
      throw new Error("DRL initialization failed");
    }
  }

  private addToReplayBuffer(experience: {
    state: number[];
    action: number;
    reward: number;
    nextState: number[];
    done: boolean;
  }) {
    this.replayBuffer.push(experience);
    if (this.replayBuffer.length > this.maxBufferSize) {
      this.replayBuffer.shift();
    }
  }

  private async trainOnBatch() {
    if (this.replayBuffer.length < this.batchSize) return;

    const batch = tf.tidy(() => {
      const indices = Array.from(
        tf.util.createShuffledIndices(this.replayBuffer.length)
      ).slice(0, this.batchSize);

      const experiences = indices.map((i) => this.replayBuffer[i]);

      const states = tf.tensor2d(experiences.map((e) => e.state));
      const nextStates = tf.tensor2d(experiences.map((e) => e.nextState));

      const currentQs = this.model.predict(states) as tf.Tensor;
      const futureQs = this.model.predict(nextStates) as tf.Tensor;

      const updatedQValues = currentQs.arraySync() as number[][];

      experiences.forEach((exp, i) => {
        const futureQ = exp.done
          ? 0
          : Math.max(...(futureQs.arraySync() as number[][])[i]);
        updatedQValues[i][exp.action] = exp.reward + this.gamma * futureQ;
      });

      return {
        states,
        updatedQValues: tf.tensor2d(updatedQValues),
      };
    });

    await this.model.trainOnBatch(batch.states, batch.updatedQValues);
    tf.dispose(batch);
  }

  private getState(
    current: Position,
    goal: Position,
    obstacles: Position[]
  ): number[] {
    const nearestObs = obstacles.reduce((nearest, obs) => {
      const distToCurrent = Math.hypot(obs.x - current.x, obs.y - current.y);
      const distToNearest = Math.hypot(
        nearest.x - current.x,
        nearest.y - current.y
      );
      return distToCurrent < distToNearest ? obs : nearest;
    }, obstacles[0] || { x: -1, y: -1 });

    return [
      current.x / GRID_SIZE.width,
      current.y / GRID_SIZE.height,
      goal.x / GRID_SIZE.width,
      goal.y / GRID_SIZE.height,
      nearestObs.x / GRID_SIZE.width,
      nearestObs.y / GRID_SIZE.height,
    ];
  }

  private async predict(state: number[]): Promise<number> {
    return tf.tidy(() => {
      if (Math.random() < this.epsilon) {
        return Math.floor(Math.random() * 4);
      }

      const stateTensor = tf.tensor2d([state], [1, 6]);
      const prediction = this.model.predict(stateTensor) as tf.Tensor;
      const actions = prediction.arraySync() as number[][];
      return actions[0].indexOf(Math.max(...actions[0]));
    });
  }

  private getReward(
    newPos: Position,
    goal: Position,
    obstacles: Position[]
  ): number {
    // Check for collision
    if (hasCollisionAtPosition(newPos, obstacles)) {
      return -100;
    }

    // Check if goal reached
    if (newPos.x === goal.x && newPos.y === goal.y) {
      return 100;
    }

    // Encourage moving closer to goal
    const previousDistance = Math.sqrt(
      Math.pow(goal.x - newPos.x, 2) + Math.pow(goal.y - newPos.y, 2)
    );

    return -previousDistance * 0.1;
  }

  private async train(experience: {
    state: number[];
    action: number;
    reward: number;
    nextState: number[];
    done: boolean;
  }): Promise<void> {
    this.addToReplayBuffer(experience);
    await this.trainOnBatch();
  }

  async findPath(
    start: Position,
    goal: Position,
    obstacles: Position[]
  ): Promise<PathfindingResult> {
    // Wait for model initialization
    await this.initPromise.catch(() => {
      console.warn("DRL initialization failed, falling back to A*");
      return new AStarPathFinder().findPath(start, goal, obstacles);
    });

    if (!this.initialized) {
      return new AStarPathFinder().findPath(start, goal, obstacles);
    }

    try {
      const startTime = performance.now();
      let nodesExplored = 0;
      const path: Position[] = [start];
      let current = { ...start };
      let failedAttempts = 0;
      const maxFailedAttempts = 50;

      while (nodesExplored < 1000) {
        nodesExplored++;

        const state = this.getState(current, goal, obstacles);
        const action = await this.predict(state);
        const newPos = getNewPosition(current, action);

        // Check bounds and obstacles
        if (
          newPos.x < 0 ||
          newPos.x >= GRID_SIZE.width ||
          newPos.y < 0 ||
          newPos.y >= GRID_SIZE.height ||
          hasCollisionAtPosition(newPos, obstacles)
        ) {
          failedAttempts++;
          if (failedAttempts >= maxFailedAttempts) {
            console.warn("DRL failed to find valid path, falling back to A*");
            return new AStarPathFinder().findPath(start, goal, obstacles);
          }
          continue;
        }

        failedAttempts = 0; // Reset failed attempts on valid move
        const reward = this.getReward(newPos, goal, obstacles);
        const nextState = this.getState(newPos, goal, obstacles);
        const done = reward >= 90 || reward <= -90;

        await this.train({
          state,
          action,
          reward,
          nextState,
          done,
        });

        if (done) {
          if (reward >= 90) {
            path.push(newPos);
            break;
          }
          break;
        }

        current = newPos;
        path.push(current);
      }

      return {
        path: this.optimizePath(path, obstacles),
        nodesExplored,
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      console.error("DRL pathfinding failed:", error);
      return new AStarPathFinder().findPath(start, goal, obstacles);
    }
  }

  // Add path optimization
  private optimizePath(path: Position[], obstacles: Position[]): Position[] {
    if (path.length <= 2) return path;

    const optimized: Position[] = [path[0]];
    let current = 0;

    while (current < path.length - 1) {
      let furthest = current + 1;
      for (let i = path.length - 1; i > current; i--) {
        const canConnect = !this.hasObstacleBetween(
          path[current],
          path[i],
          obstacles
        );
        if (canConnect) {
          furthest = i;
          break;
        }
      }
      optimized.push(path[furthest]);
      current = furthest;
    }

    return optimized;
  }

  private hasObstacleBetween(
    start: Position,
    end: Position,
    obstacles: Position[]
  ): boolean {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 2;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(start.x + dx * t);
      const y = Math.round(start.y + dy * t);
      if (hasCollisionAtPosition({ x, y }, obstacles)) {
        return true;
      }
    }
    return false;
  }

  getName(): string {
    return "Deep Reinforcement Learning";
  }

  getDescription(): string {
    return "Experimental: Uses deep Q-learning to find paths (may be unstable)";
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
      return new DRLPathFinder();
    default:
      return new AStarPathFinder();
  }
}

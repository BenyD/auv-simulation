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

// Add near other helper functions
const detectCycle = (path: Position[], currentPos: Position): boolean => {
  if (path.length < 4) return false;
  
  // Check last 4 positions for a 2-cell cycle
  const last4 = path.slice(-4);
  const posStrings = last4.map(p => `${p.x},${p.y}`);
  const currentPosStr = `${currentPos.x},${currentPos.y}`;
  
  // Check if we're returning to a position we were at 2 moves ago
  if (posStrings[1] === currentPosStr) {
    return true;
  }
  
  return false;
};

// Update getNeighbors function to consider path history
const getNeighbors = (
  pos: Position,
  obstacles: Set<string>,
  visited: Set<string>,
  pathHistory: Position[] = []
): Position[] => {
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 1, y: 0 },  // right
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: -1 }, // up-right
    { x: 1, y: 1 },  // down-right
    { x: -1, y: 1 }, // down-left
    { x: -1, y: -1 } // up-left
  ];

  return directions
    .map((dir) => ({
      x: pos.x + dir.x,
      y: pos.y + dir.y,
    }))
    .filter((newPos) => {
      // Basic validity checks
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

      // Prevent cycling
      if (detectCycle(pathHistory, newPos)) {
        return false;
      }

      // Check diagonal movement
      if (Math.abs(newPos.x - pos.x) === 1 && Math.abs(newPos.y - pos.y) === 1) {
        const corner1 = `${pos.x},${newPos.y}`;
        const corner2 = `${newPos.x},${pos.y}`;
        if (obstacles.has(corner1) || obstacles.has(corner2)) {
          return false;
        }
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

// Add near the top with other helper functions
const smoothPath = (path: Position[], obstacles: Set<string>): Position[] => {
  if (path.length <= 2) return path;
  
  const smoothed: Position[] = [path[0]];
  let current = 0;
  
  while (current < path.length - 1) {
    let furthest = path.length - 1;
    let foundPath = false;
    
    // Look for longest valid segment
    while (furthest > current) {
      const start = path[current];
      const end = path[furthest];
      
      if (isValidDirectPath(start, end, obstacles)) {
        // Add intermediate points for long segments
        const dist = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
        if (dist > 5) {
          const mid = {
            x: Math.round((start.x + end.x) / 2),
            y: Math.round((start.y + end.y) / 2)
          };
          if (isValidDirectPath(start, mid, obstacles) && 
              isValidDirectPath(mid, end, obstacles)) {
            smoothed.push(mid);
          }
        }
        smoothed.push(end);
        current = furthest;
        foundPath = true;
        break;
      }
      furthest--;
    }
    
    if (!foundPath) {
      smoothed.push(path[current + 1]);
      current++;
    }
  }
  
  return smoothed;
};

// Add helper function for path validation
const isValidDirectPath = (start: Position, end: Position, obstacles: Set<string>): boolean => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 2;
  
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = Math.round(start.x + dx * t);
    const y = Math.round(start.y + dy * t);
    
    if (obstacles.has(`${x},${y}`)) {
      return false;
    }
  }
  
  return true;
};

// Add this helper function near other utility functions
export const calculateTacticalValue = (
  pos: Position,
  start: Position,
  goal: Position,
  existingObstacles: Set<string>
): number => {
  // Calculate distances
  const distToStart = Math.hypot(pos.x - start.x, pos.y - start.y);
  const distToGoal = Math.hypot(pos.x - goal.x, pos.y - goal.y);
  const pathLine = Math.hypot(goal.x - start.x, goal.y - start.y);
  
  // Check if position is near the direct path between start and goal
  const distToPath = Math.abs(
    (goal.y - start.y) * pos.x - 
    (goal.x - start.x) * pos.y + 
    goal.x * start.y - 
    goal.y * start.x
  ) / pathLine;

  // Calculate clustering with existing obstacles
  let clusterPenalty = 0;
  for (const obsKey of existingObstacles) {
    const [ox, oy] = obsKey.split(',').map(Number);
    const dist = Math.hypot(pos.x - ox, pos.y - oy);
    if (dist < 3) clusterPenalty += (3 - dist) * 2;
  }

  // Scoring factors:
  // - Prefer positions not too close or far from start/goal
  // - Prefer positions near but not directly on the path
  // - Avoid clustering obstacles together
  // - Maintain minimum distances from start/goal
  const score = 
    (distToPath < 4 ? 5 : 0) + // Bonus for being near path
    (distToStart > 5 ? 3 : 0) + // Bonus for minimum distance from start
    (distToGoal > 5 ? 3 : 0) + // Bonus for minimum distance from goal
    (distToPath > 1 ? 2 : 0) - // Penalty for being directly on path
    clusterPenalty; // Penalty for clustering

  return score;
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

    const pathHistory: Position[] = [start];

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      nodesExplored++;

      if (current.x === goal.x && current.y === goal.y) {
        const rawPath = reconstructPath(current);
        const smoothedPath = smoothPath(rawPath, obstacleSet);
        return {
          path: smoothedPath,
          nodesExplored,
          executionTime: performance.now() - startTime,
        };
      }

      closedSet.add(`${current.x},${current.y}`);

      const neighbors = getNeighbors(
        current,
        obstacleSet,
        closedSet,
        pathHistory
      );

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        const existingNeighbor = openSet.find(n => `${n.x},${n.y}` === neighborKey);
        
        const tentativeG = current.g + (
          Math.abs(neighbor.x - current.x) + Math.abs(neighbor.y - current.y) === 2 
            ? 1.4 
            : 1
        );

        if (!existingNeighbor || tentativeG < existingNeighbor.g) {
          const node: Node = {
            x: neighbor.x,
            y: neighbor.y,
            g: tentativeG,
            h: this.heuristic(neighbor, goal),
            f: 0,
            parent: current,
          };
          node.f = node.g + node.h;

          if (existingNeighbor) {
            Object.assign(existingNeighbor, node);
          } else {
            openSet.push(node);
          }
        }
        pathHistory.push(neighbor);
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

  private isValidPath(from: Position, to: Position, obstacles: Set<string>): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 4; // Increased resolution
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(from.x + dx * t);
      const y = Math.round(from.y + dy * t);
      
      // Enhanced safety margin check
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const checkX = x + dx;
          const checkY = y + dy;
          if (
            checkX >= 0 && checkX < GRID_SIZE.width &&
            checkY >= 0 && checkY < GRID_SIZE.height &&
            obstacles.has(`${checkX},${checkY}`)
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private optimizePath(path: Position[]): Position[] {
    if (path.length <= 2) return path;
    
    const smoothed: Position[] = [path[0]];
    let current = 0;
    
    while (current < path.length - 1) {
      let furthest = path.length - 1;
      let foundPath = false;
      
      while (furthest > current) {
        const start = path[current];
        const end = path[furthest];
        
        if (this.isValidPath(start, end, this.obstacleSet)) {
          // Add intermediate points for long segments
          const dist = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
          if (dist > 6) {
            const mid = {
              x: Math.round((start.x + end.x) / 2),
              y: Math.round((start.y + end.y) / 2)
            };
            if (this.isValidPath(start, mid, this.obstacleSet) && 
                this.isValidPath(mid, end, this.obstacleSet)) {
              smoothed.push(mid);
            }
          }
          smoothed.push(end);
          current = furthest;
          foundPath = true;
          break;
        }
        furthest--;
      }
      
      if (!foundPath) {
        smoothed.push(path[current + 1]);
        current++;
      }
    }
    
    return this.smoothPath(smoothed);
  }

  private smoothPath(path: Position[]): Position[] {
    if (path.length <= 2) return path;
    
    const smoothed: Position[] = [];
    let prevDirection = { x: 0, y: 0 };
    
    for (let i = 0; i < path.length; i++) {
      if (i === 0 || i === path.length - 1) {
        smoothed.push(path[i]);
        continue;
      }
      
      const currentDirection = {
        x: path[i].x - path[i - 1].x,
        y: path[i].y - path[i - 1].y
      };
      
      const nextDirection = {
        x: path[i + 1].x - path[i].x,
        y: path[i + 1].y - path[i].y
      };
      
      if (
        currentDirection.x !== nextDirection.x ||
        currentDirection.y !== nextDirection.y ||
        currentDirection.x !== prevDirection.x ||
        currentDirection.y !== prevDirection.y
      ) {
        smoothed.push(path[i]);
      }
      
      prevDirection = currentDirection;
    }
    
    return smoothed;
  }

  private reconstructPath(node: Node): Position[] {
    const path: Position[] = [];
    let current: Node | null = node;
    
    while (current !== null) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    
    return path;
  }

  findPath(start: Position, goal: Position, obstacles: Position[]): PathfindingResult {
    const startTime = performance.now();
    let nodesExplored = 0;
    const maxIterations = 5000; // Increased for better coverage
    const stepSize = 2; // Adjusted for better exploration
    const goalBias = 0.4; // Increased goal bias for faster convergence
    const nearGoalThreshold = 3; // Slightly increased for better goal detection

    this.obstacleSet = new Set(obstacles.map((o) => `${o.x},${o.y}`));

    // Try direct path first
    if (this.isValidPath(start, goal, this.obstacleSet)) {
      return {
        path: [start, goal],
        nodesExplored: 1,
        executionTime: performance.now() - startTime,
      };
    }

    // Fallback to A* if path is relatively simple
    if (this.distance(start, goal) < 10 && obstacles.length < 5) {
      return new AStarPathFinder().findPath(start, goal, obstacles);
    }

    // Enhanced RRT logic
    const nodes: Node[] = [{ x: start.x, y: start.y, parent: null, g: 0, h: 0, f: 0 }];
    let bestNode = nodes[0];
    let bestDistance = this.distance(start, goal);

    for (let i = 0; i < maxIterations; i++) {
      nodesExplored++;
      
      // Adaptive goal bias based on progress
      const adaptiveGoalBias = goalBias * (1 + bestDistance / this.distance(start, goal));
      const targetPoint = Math.random() < adaptiveGoalBias ? goal : this.getRandomPoint();
      
      const nearestNode = this.findNearestNode(targetPoint, nodes);
      const newPoint = this.steer({ x: nearestNode.x, y: nearestNode.y }, targetPoint, stepSize);

      if (this.isValidPath(nearestNode, newPoint, this.obstacleSet)) {
        const newNode: Node = {
          x: newPoint.x,
          y: newPoint.y,
          parent: nearestNode,
          g: 0, h: 0, f: 0
        };
        nodes.push(newNode);

        const distToGoal = this.distance(newPoint, goal);
        if (distToGoal < bestDistance) {
          bestDistance = distToGoal;
          bestNode = newNode;
        }

        if (distToGoal < nearGoalThreshold && this.isValidPath(newPoint, goal, this.obstacleSet)) {
          const path = this.reconstructAndOptimizePath(newNode, goal);
          return {
            path,
            nodesExplored,
            executionTime: performance.now() - startTime,
          };
        }
      }
    }

    // If no path found, return best partial path
    return {
      path: this.reconstructAndOptimizePath(bestNode, goal),
      nodesExplored,
      executionTime: performance.now() - startTime,
    };
  }

  private reconstructAndOptimizePath(node: Node, goal: Position): Position[] {
    const path = this.reconstructPath(node);
    path.push(goal);
    return this.optimizePath(path);
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

    const smoothed: Position[] = [path[0]];
    let current = 0;
    
    while (current < path.length - 1) {
      let furthest = path.length - 1;
      
      while (furthest > current) {
        const start = path[current];
        const end = path[furthest];
        
        // Check if direct path is possible
        if (this.isValidDirectPath(start, end, obstacles)) {
          smoothed.push(end);
          current = furthest;
          break;
        }
        furthest--;
      }
      
      if (furthest === current) {
        smoothed.push(path[current + 1]);
        current++;
      }
    }
    
    return smoothed;
  }

  private isValidDirectPath(
    start: Position,
    end: Position,
    obstacles: Position[]
  ): boolean {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 2;
    
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const x = Math.round(start.x + dx * t);
      const y = Math.round(start.y + dy * t);
      
      if (hasCollisionAtPosition({ x, y }, obstacles)) {
        return false;
      }
    }
    
    return true;
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

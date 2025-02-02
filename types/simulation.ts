export interface SimulationStats {
  pathLength: number;
  executionTime: number;
  collisionCount: number;
  pathEfficiency: number;
  nodesExplored: number;
  averageTimePerMove: number;
  totalMoves: number;
  startTime: number;
  endTime: number;
  obstacleCount: number;
  pathHistory: Array<{ x: number; y: number }>;
} 
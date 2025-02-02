"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { predictNextMove } from "@/utils/auv_ai";
import DebuggingPanel from "./DebuggingPanel";
import { GRID_SIZE } from "@/utils/constants";
import { useTheme } from "@/utils/ThemeProvider";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAlert } from "@/components/ui/AlertProvider";
import { SimulationStatsDrawer } from "@/components/SimulationStatsDrawer";
import { SimulationStats } from "@/types/simulation";
import { DocumentationDrawer } from "@/components/DocumentationDrawer";
import { PathfindingAlgorithm, Position } from "@/utils/algorithms";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Move outside component
const AXIS_MARGIN: number = 30;
const FONT_SIZE: number = 12;
const DEFAULT_START = { x: 4, y: 10 };
const DEFAULT_GOAL = { x: 25, y: 10 };

// Helper function for column labels (A, B, C, ..., Z, AA, AB, ...)
const getColumnLabel = (index: number): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (index < letters.length) {
    return letters[index];
  }

  // For positions after Z (26+)
  const firstChar = letters[Math.floor(index / letters.length) - 1];
  const secondChar = letters[index % letters.length];
  return `${firstChar}${secondChar}`;
};

// Add this before the Simulation component
const generateRandomObstacles = (count: number) => {
  const obstacles = new Set<string>();
  const isOccupied = (x: number, y: number) => {
    if (obstacles.has(`${x},${y}`)) return true;

    if (
      (x === DEFAULT_START.x && y === DEFAULT_START.y) ||
      (x === DEFAULT_GOAL.x && y === DEFAULT_GOAL.y)
    )
      return true;

    const startBuffer =
      Math.abs(x - DEFAULT_START.x) <= 1 && Math.abs(y - DEFAULT_START.y) <= 1;
    const goalBuffer =
      Math.abs(x - DEFAULT_GOAL.x) <= 1 && Math.abs(y - DEFAULT_GOAL.y) <= 1;

    return startBuffer || goalBuffer;
  };

  while (obstacles.size < count) {
    const x = Math.floor(Math.random() * GRID_SIZE.width);
    const y = Math.floor(Math.random() * GRID_SIZE.height);

    if (!isOccupied(x, y)) {
      obstacles.add(`${x},${y}`);
    }
  }

  return Array.from(obstacles).map((pos) => {
    const [x, y] = pos.split(",").map(Number);
    return { x, y };
  });
};

// Add near other helper functions at the top
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

// Add near other helper functions
const hasCollisionAtPosition = (
  pos: Position,
  obstacles: Position[]
): boolean => {
  return obstacles.some((obs) => obs.x === pos.x && obs.y === pos.y);
};

const Simulation = () => {
  const { theme, toggleTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [auvPosition, setAuvPosition] = useState(DEFAULT_START);
  const [lastAction, setLastAction] = useState<number | null>(null);
  const [startPosition, setStartPosition] = useState(DEFAULT_START);
  const [targetPosition, setTargetPosition] = useState(DEFAULT_GOAL);
  const [isRunning, setIsRunning] = useState(false);
  const [obstacles, setObstacles] = useState<Array<{ x: number; y: number }>>(
    generateRandomObstacles(5) // Reduced number of initial obstacles
  );
  const [placementMode, setPlacementMode] = useState<"none" | "start" | "goal">(
    "none"
  );
  const [hasCollided, setHasCollided] = useState(false);

  // Update initial canvas size
  const [cellSize, setCellSize] = useState(25); // Increased default size
  const [canvasSize, setCanvasSize] = useState({
    width: GRID_SIZE.width * 25 + AXIS_MARGIN * 2,
    height: GRID_SIZE.height * 25 + AXIS_MARGIN * 2,
  });

  // Add state for path tracking
  const [pathHistory, setPathHistory] = useState<
    Array<{ x: number; y: number }>
  >([]);

  // Add new state for statistics
  const [showStats, setShowStats] = useState(false);
  const [simulationStats, setSimulationStats] = useState<SimulationStats>({
    pathLength: 0,
    executionTime: 0,
    collisionCount: 0,
    pathEfficiency: 0,
    nodesExplored: 0,
    averageTimePerMove: 0,
    totalMoves: 0,
    startTime: 0,
    endTime: 0,
    obstacleCount: 0,
    pathHistory: [],
  });

  // Add state for documentation drawer
  const [showDocs, setShowDocs] = useState(false);

  // Add state for algorithm selection
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<PathfindingAlgorithm>("astar");

  const resetSimulation = () => {
    setAuvPosition(startPosition);
    setPathHistory([]);
    setHasCollided(false);
    setIsRunning(false);
    setLastAction(null);
    showAlert(
      "warning",
      "Simulation Reset",
      "The simulation has been reset to its initial state."
    );
  };

  // Add keyboard shortcuts
  useKeyboardShortcuts({
    toggleTheme,
    toggleSimulation: () => setIsRunning((prev) => !prev),
    clearObstacles: () => setObstacles([]),
    resetSimulation,
  });

  const { showAlert } = useAlert();

  // Move these functions before the useEffect
  const handleCollision = useCallback(() => {
    if (!hasCollided) {
      setHasCollided(true);
      showAlert(
        "error",
        "Collision Detected",
        "The AUV has collided with an obstacle!"
      );
      setIsRunning(false);
    }
  }, [hasCollided, showAlert]);

  const handleGoalReached = useCallback(() => {
    const endTime = performance.now();
    const executionTime = endTime - simulationStats.startTime;

    const optimalLength =
      Math.abs(targetPosition.x - startPosition.x) +
      Math.abs(targetPosition.y - startPosition.y);

    const stats: SimulationStats = {
      ...simulationStats,
      endTime,
      executionTime,
      pathLength: pathHistory.length,
      pathEfficiency: optimalLength / pathHistory.length,
      totalMoves: pathHistory.length,
      averageTimePerMove: executionTime / pathHistory.length,
      obstacleCount: obstacles.length,
      pathHistory: [...pathHistory],
    };

    setSimulationStats(stats);
    setShowStats(true);
    showAlert(
      "success",
      "Goal Reached",
      "The AUV has successfully reached its target!"
    );
    setIsRunning(false);
  }, [
    simulationStats,
    pathHistory,
    targetPosition,
    startPosition,
    obstacles,
    showAlert,
  ]);

  // Update size calculation
  useEffect(() => {
    const calculateSize = () => {
      const containerWidth = window.innerWidth * 0.6; // 60% of window width
      const containerHeight = window.innerHeight * 0.8; // 80% of window height

      const size = Math.floor(
        Math.min(
          (containerWidth - AXIS_MARGIN * 2) / GRID_SIZE.width,
          (containerHeight - AXIS_MARGIN * 2) / GRID_SIZE.height
        )
      );

      console.log("Container size:", containerWidth, containerHeight);
      console.log("Calculated cell size:", size);

      setCellSize(size);
      setCanvasSize({
        width: GRID_SIZE.width * size + AXIS_MARGIN * 2,
        height: GRID_SIZE.height * size + AXIS_MARGIN * 2,
      });
    };

    calculateSize();
    window.addEventListener("resize", calculateSize);
    return () => window.removeEventListener("resize", calculateSize);
  }, []);

  // Use cellSize and canvasSize instead of constants
  const fontSize = useMemo(() => FONT_SIZE, []);

  // Update the movement effect
  useEffect(() => {
    if (isRunning) {
      let mounted = true;
      const interval = setInterval(async () => {
        if (!mounted) return;

        const nextMove = await predictNextMove(
          auvPosition,
          targetPosition,
          obstacles,
          selectedAlgorithm
        );

        if (nextMove === -1) {
          setIsRunning(false);
          handleGoalReached();
          return;
        }

        setLastAction(nextMove);
        const newPos = getNewPosition(auvPosition, nextMove);

        if (hasCollisionAtPosition(newPos, obstacles)) {
          handleCollision();
          return;
        }

        setAuvPosition(newPos);
        setPathHistory((prev) => [...prev, newPos]);
      }, 500);

      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
  }, [
    auvPosition,
    isRunning,
    obstacles,
    targetPosition,
    selectedAlgorithm,
    handleCollision,
    handleGoalReached,
  ]);

  // Optimize canvas rendering
  useEffect(() => {
    if (!canvasRef.current) return;
    const renderFrame = requestAnimationFrame(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Force canvas dimensions
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      // Clear canvas with a gradient background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvasSize.width,
        canvasSize.height
      );
      if (theme === "dark") {
        gradient.addColorStop(0, "#111827");
        gradient.addColorStop(1, "#1F2937");
      } else {
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(1, "#f3f4f6");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // Draw grid with softer lines
      ctx.strokeStyle =
        theme === "dark" ? "rgba(55, 65, 81, 0.5)" : "rgba(229, 231, 235, 0.8)";
      ctx.lineWidth = 0.5;

      // Draw cells with hover effect
      for (let x = 0; x < GRID_SIZE.width; x++) {
        for (let y = 0; y < GRID_SIZE.height; y++) {
          const cellX = AXIS_MARGIN + x * cellSize;
          const cellY = AXIS_MARGIN + y * cellSize;

          // Draw cell background
          ctx.fillStyle = theme === "dark" ? "#1F2937" : "#ffffff";
          ctx.fillRect(cellX, cellY, cellSize, cellSize);

          // Draw cell border
          ctx.strokeRect(cellX, cellY, cellSize, cellSize);
        }
      }

      // Draw path with gradient
      if (pathHistory.length > 1) {
        ctx.beginPath();
        ctx.moveTo(
          AXIS_MARGIN + pathHistory[0].x * cellSize + cellSize / 2,
          AXIS_MARGIN + pathHistory[0].y * cellSize + cellSize / 2
        );

        const pathGradient = ctx.createLinearGradient(
          0,
          0,
          canvasSize.width,
          canvasSize.height
        );
        pathGradient.addColorStop(0, "rgba(59, 130, 246, 0.5)"); // Blue
        pathGradient.addColorStop(1, "rgba(147, 51, 234, 0.5)"); // Purple

        ctx.strokeStyle = pathGradient;
        ctx.lineWidth = 3;

        for (let i = 1; i < pathHistory.length; i++) {
          ctx.lineTo(
            AXIS_MARGIN + pathHistory[i].x * cellSize + cellSize / 2,
            AXIS_MARGIN + pathHistory[i].y * cellSize + cellSize / 2
          );
        }
        ctx.stroke();
      }

      // Draw entities with shadows and glow effects
      ctx.shadowBlur = 15;
      ctx.shadowColor =
        theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)";

      // Draw AUV with animation
      const auvX = AXIS_MARGIN + auvPosition.x * cellSize;
      const auvY = AXIS_MARGIN + auvPosition.y * cellSize;
      ctx.fillStyle = hasCollided ? "#ef4444" : "#f97316"; // Red if collided, orange otherwise
      ctx.beginPath();
      ctx.arc(
        auvX + cellSize / 2,
        auvY + cellSize / 2,
        cellSize * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Draw start and goal with subtle animations
      const startX = AXIS_MARGIN + startPosition.x * cellSize;
      const startY = AXIS_MARGIN + startPosition.y * cellSize;
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(startX + 2, startY + 2, cellSize - 4, cellSize - 4);

      const goalX = AXIS_MARGIN + targetPosition.x * cellSize;
      const goalY = AXIS_MARGIN + targetPosition.y * cellSize;
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(goalX + 2, goalY + 2, cellSize - 4, cellSize - 4);

      // Draw obstacles with pattern
      ctx.fillStyle = theme === "dark" ? "#dc2626" : "#ef4444";
      obstacles.forEach((obstacle) => {
        const obsX = AXIS_MARGIN + obstacle.x * cellSize;
        const obsY = AXIS_MARGIN + obstacle.y * cellSize;

        // Draw obstacle with pattern
        ctx.beginPath();
        ctx.moveTo(obsX, obsY);
        ctx.lineTo(obsX + cellSize, obsY);
        ctx.lineTo(obsX + cellSize, obsY + cellSize);
        ctx.lineTo(obsX, obsY + cellSize);
        ctx.closePath();
        ctx.fill();
      });

      // Reset shadow for text
      ctx.shadowBlur = 0;

      // Use geistSans for text
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle =
        theme === "dark" ? "rgba(209, 213, 219, 0.4)" : "rgba(31, 41, 55, 0.4)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw column labels (A, B, C, ...)
      for (let x = 0; x < GRID_SIZE.width; x++) {
        const label = getColumnLabel(x);
        ctx.fillText(
          label,
          AXIS_MARGIN + x * cellSize + cellSize / 2,
          fontSize
        );
      }

      // Draw row numbers (0, 1, 2, ...)
      ctx.textAlign = "right";
      for (let y = 0; y < GRID_SIZE.height; y++) {
        ctx.fillText(
          y.toString(),
          AXIS_MARGIN - 5, // Add some padding from the grid
          AXIS_MARGIN + y * cellSize + cellSize / 2
        );
      }
    });

    return () => cancelAnimationFrame(renderFrame);
  }, [
    auvPosition,
    startPosition,
    targetPosition,
    obstacles,
    theme,
    hasCollided,
    cellSize,
    pathHistory,
    canvasSize,
    selectedAlgorithm,
    fontSize,
  ]);

  // Update the coordinate formatting to use letter-number format
  const formatCoordinate = (x: number, y: number): string => {
    return `${getColumnLabel(x)}${y}`;
  };

  // Handle grid click
  const handleGridClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || placementMode === "none") return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left - AXIS_MARGIN) / cellSize);
    const y = Math.floor((event.clientY - rect.top - AXIS_MARGIN) / cellSize);

    // Ensure click is within grid bounds
    if (x < 0 || x >= GRID_SIZE.width || y < 0 || y >= GRID_SIZE.height) return;

    // Check if position is occupied by an obstacle
    if (obstacles.some((obs) => obs.x === x && obs.y === y)) return;

    if (placementMode === "start") {
      setStartPosition({ x, y });
      setAuvPosition({ x, y });
    } else if (placementMode === "goal") {
      setTargetPosition({ x, y });
    }
    setPlacementMode("none");
  };

  const startSimulation = () => {
    setSimulationStats((prev) => ({
      ...prev,
      startTime: performance.now(),
      collisionCount: 0,
      nodesExplored: 0,
    }));
    setIsRunning(true);
  };

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen">
        {/* Left Side: Simulation Map */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="relative flex items-center justify-center h-[calc(100vh-7rem)]">
            <div
              className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4"
              style={{
                width: canvasSize.width + 32,
                height: canvasSize.height + 32,
              }}
            >
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                style={{
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                }}
                className={`${
                  placementMode !== "none" ? "cursor-crosshair" : ""
                }`}
                onClick={handleGridClick}
              />

              {/* Placement Mode Indicator */}
              {placementMode !== "none" && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/75 text-white px-3 py-1 rounded text-sm">
                  Click to place {placementMode === "start" ? "start" : "goal"}
                </div>
              )}

              {/* Legend - Updated Style */}
              <div className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg p-3 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                    <span className="dark:text-gray-300 font-medium">AUV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                    <span className="dark:text-gray-300 font-medium">
                      Start
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                    <span className="dark:text-gray-300 font-medium">Goal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                    <span className="dark:text-gray-300 font-medium">
                      Obstacle
                    </span>
                  </div>
                </div>
              </div>

              {/* Coordinates - More Compact */}
              <div className="absolute bottom-2 left-2 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <p className="font-mono text-gray-700 dark:text-gray-300">
                    AUV: {formatCoordinate(auvPosition.x, auvPosition.y)}
                  </p>
                  <p className="font-mono text-gray-700 dark:text-gray-300">
                    Goal: {formatCoordinate(targetPosition.x, targetPosition.y)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Debug Panel */}
        <DebuggingPanel
          auvPosition={auvPosition}
          lastAction={lastAction}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          obstacles={obstacles}
          setObstacles={setObstacles}
          onClearObstacles={() => setObstacles([])}
          setStartPosition={setStartPosition}
          setTargetPosition={setTargetPosition}
          setAuvPosition={setAuvPosition}
          placementMode={placementMode}
          setPlacementMode={setPlacementMode}
          onStartSimulation={startSimulation}
          setShowDocs={setShowDocs}
          selectedAlgorithm={selectedAlgorithm}
          onAlgorithmChange={setSelectedAlgorithm}
        >
          <button
            className="w-full py-2 px-4 rounded-lg font-medium bg-yellow-500 
                     hover:bg-yellow-600 text-white transition-all shadow"
            onClick={resetSimulation}
          >
            Reset Simulation
          </button>
        </DebuggingPanel>
        <SimulationStatsDrawer
          isOpen={showStats}
          onClose={() => setShowStats(false)}
          stats={simulationStats}
        />
        <DocumentationDrawer
          isOpen={showDocs}
          onClose={() => setShowDocs(false)}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Simulation;

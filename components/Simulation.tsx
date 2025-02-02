"use client";

import { useEffect, useState, useRef } from "react";
import { predictNextMove } from "@/utils/auv_ai";
import DebuggingPanel from "./DebuggingPanel";
import { GRID_SIZE } from "@/utils/constants";
import { useTheme } from "@/utils/ThemeProvider";
import { geistSans } from "@/utils/fonts";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAlert } from "@/components/ui/AlertProvider";
import { SimulationStatsDrawer } from "@/components/SimulationStatsDrawer";
import { SimulationStats } from "@/types/simulation";

// Update initial positions for the smaller grid
const DEFAULT_START = { x: 4, y: 10 };
const DEFAULT_GOAL = { x: 25, y: 10 };

// Adjust sizing constant for grid margins
const AXIS_MARGIN = 30;

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

  // Add keyboard shortcuts
  useKeyboardShortcuts({
    toggleTheme,
    toggleSimulation: () => setIsRunning(prev => !prev),
    clearObstacles: () => setObstacles([]),
  });

  const { showAlert } = useAlert();

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
  const FONT_SIZE = Math.max(9, cellSize / 3);

  // Update the movement effect
  useEffect(() => {
    if (isRunning) {
      let mounted = true;
      const interval = setInterval(() => {
        if (!mounted) return;
        const action = predictNextMove(auvPosition, targetPosition, obstacles);

        if (action === -1) {
          setIsRunning(false);
          if (
            auvPosition.x === targetPosition.x &&
            auvPosition.y === targetPosition.y
          ) {
            handleGoalReached();
          } else {
            handleCollision();
          }
          return;
        }

        setLastAction(action);
        const newPos = { x: auvPosition.x, y: auvPosition.y };

        switch (action) {
          case 0:
            newPos.x--;
            break;
          case 1:
            newPos.x++;
            break;
          case 2:
            newPos.y--;
            break;
          case 3:
            newPos.y++;
            break;
        }

        setAuvPosition(newPos);
        setPathHistory((prev) => [...prev, newPos]);
      }, 500);

      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
  }, [auvPosition, isRunning, obstacles, targetPosition]);

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

      console.log("Rendering canvas:", {
        width: canvasSize.width,
        height: canvasSize.height,
        cellSize,
      });

      // Clear canvas
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      // Set background
      ctx.fillStyle = theme === "dark" ? "#1a1a1a" : "#ffffff";
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // Draw grid
      ctx.strokeStyle = theme === "dark" ? "#333333" : "#e5e5e5";
      ctx.lineWidth = 1;

      // Draw vertical lines
      for (let i = 0; i <= GRID_SIZE.width; i++) {
        const x = AXIS_MARGIN + i * cellSize;
        ctx.beginPath();
        ctx.moveTo(x, AXIS_MARGIN);
        ctx.lineTo(x, canvasSize.height - AXIS_MARGIN);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let i = 0; i <= GRID_SIZE.height; i++) {
        const y = AXIS_MARGIN + i * cellSize;
        ctx.beginPath();
        ctx.moveTo(AXIS_MARGIN, y);
        ctx.lineTo(canvasSize.width - AXIS_MARGIN, y);
        ctx.stroke();
      }

      // Enhanced axis styling
      ctx.font = `${FONT_SIZE}px ${geistSans.style.fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw column labels (A, B, C, ...)
      for (let x = 0; x < GRID_SIZE.width; x++) {
        const label = getColumnLabel(x);

        // More subtle background and text
        const opacity = x % 5 === 0 ? 0.4 : 0.15;

        // Draw label with subtle styling
        ctx.fillStyle =
          theme === "dark"
            ? `rgba(229, 231, 235, ${opacity})`
            : `rgba(31, 41, 55, ${opacity})`;
        ctx.fillText(
          label,
          AXIS_MARGIN + x * cellSize + cellSize / 2,
          FONT_SIZE
        );
      }

      // Draw row labels (0, 1, 2, ...)
      for (let y = 0; y < GRID_SIZE.height; y++) {
        const label = y.toString();
        const labelWidth = ctx.measureText(label).width;

        // More subtle background and text
        const opacity = y % 5 === 0 ? 0.4 : 0.15;

        // Draw label with subtle styling
        ctx.fillStyle =
          theme === "dark"
            ? `rgba(229, 231, 235, ${opacity})`
            : `rgba(31, 41, 55, ${opacity})`;
        ctx.fillText(
          label,
          10 + labelWidth / 2,
          AXIS_MARGIN + y * cellSize + cellSize / 2
        );
      }

      // Draw Grid with very subtle lines
      ctx.strokeStyle =
        theme === "dark" ? "rgba(55, 65, 81, 0.3)" : "rgba(229, 231, 235, 0.5)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < GRID_SIZE.width; x++) {
        for (let y = 0; y < GRID_SIZE.height; y++) {
          ctx.strokeRect(
            AXIS_MARGIN + x * cellSize,
            AXIS_MARGIN + y * cellSize,
            cellSize,
            cellSize
          );
        }
      }

      // Draw Obstacles with gradient
      obstacles.forEach((obs) => {
        const gradient = ctx.createRadialGradient(
          AXIS_MARGIN + obs.x * cellSize + cellSize / 2,
          AXIS_MARGIN + obs.y * cellSize + cellSize / 2,
          0,
          AXIS_MARGIN + obs.x * cellSize + cellSize / 2,
          AXIS_MARGIN + obs.y * cellSize + cellSize / 2,
          cellSize / 2
        );
        gradient.addColorStop(0, "rgba(255, 0, 0, 0.8)");
        gradient.addColorStop(1, "rgba(255, 0, 0, 0.2)");
        ctx.fillStyle = gradient;
        ctx.fillRect(
          AXIS_MARGIN + obs.x * cellSize,
          AXIS_MARGIN + obs.y * cellSize,
          cellSize,
          cellSize
        );
      });

      // Draw Start Position with gradient
      const startGradient = ctx.createRadialGradient(
        startPosition.x * cellSize + cellSize / 2,
        startPosition.y * cellSize + cellSize / 2,
        0,
        startPosition.x * cellSize + cellSize / 2,
        startPosition.y * cellSize + cellSize / 2,
        cellSize / 2
      );
      startGradient.addColorStop(0, "rgba(0, 255, 0, 0.8)");
      startGradient.addColorStop(1, "rgba(0, 255, 0, 0.2)");
      ctx.fillStyle = startGradient;
      ctx.fillRect(
        AXIS_MARGIN + startPosition.x * cellSize,
        AXIS_MARGIN + startPosition.y * cellSize,
        cellSize,
        cellSize
      );

      // Draw Goal Position with pulsing effect
      const goalGradient = ctx.createRadialGradient(
        targetPosition.x * cellSize + cellSize / 2,
        targetPosition.y * cellSize + cellSize / 2,
        0,
        targetPosition.x * cellSize + cellSize / 2,
        targetPosition.y * cellSize + cellSize / 2,
        cellSize / 2
      );
      goalGradient.addColorStop(0, "rgba(0, 0, 255, 0.8)");
      goalGradient.addColorStop(1, "rgba(0, 0, 255, 0.2)");
      ctx.fillStyle = goalGradient;
      ctx.fillRect(
        AXIS_MARGIN + targetPosition.x * cellSize,
        AXIS_MARGIN + targetPosition.y * cellSize,
        cellSize,
        cellSize
      );

      // Draw AUV with collision state
      const auvGradient = ctx.createRadialGradient(
        auvPosition.x * cellSize + cellSize / 2,
        auvPosition.y * cellSize + cellSize / 2,
        0,
        auvPosition.x * cellSize + cellSize / 2,
        auvPosition.y * cellSize + cellSize / 2,
        cellSize / 2
      );
      if (hasCollided) {
        auvGradient.addColorStop(0, "rgba(255, 0, 0, 1)");
        auvGradient.addColorStop(1, "rgba(255, 0, 0, 0.3)");
      } else {
        auvGradient.addColorStop(0, "rgba(255, 165, 0, 1)");
        auvGradient.addColorStop(1, "rgba(255, 165, 0, 0.3)");
      }
      ctx.fillStyle = auvGradient;
      ctx.fillRect(
        AXIS_MARGIN + auvPosition.x * cellSize,
        AXIS_MARGIN + auvPosition.y * cellSize,
        cellSize,
        cellSize
      );

      // Draw path history
      if (pathHistory.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle =
          theme === "dark"
            ? "rgba(255, 165, 0, 0.4)"
            : "rgba(255, 165, 0, 0.6)";
        ctx.lineWidth = 2;

        pathHistory.forEach((point, index) => {
          const x = AXIS_MARGIN + point.x * cellSize + cellSize / 2;
          const y = AXIS_MARGIN + point.y * cellSize + cellSize / 2;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
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
    FONT_SIZE,
    pathHistory,
    canvasSize,
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

  const handleCollision = () => {
    if (!hasCollided) {
      setHasCollided(true);
      showAlert(
        "error",
        "Collision Detected",
        "The AUV has collided with an obstacle!"
      );
      setIsRunning(false);
    }
  };

  const handleGoalReached = () => {
    const endTime = performance.now();
    const executionTime = endTime - simulationStats.startTime;
    
    // Calculate optimal path length (Manhattan distance)
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
  };

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

  const startSimulation = () => {
    setSimulationStats(prev => ({
      ...prev,
      startTime: performance.now(),
      collisionCount: 0,
      nodesExplored: 0,
    }));
    setIsRunning(true);
  };

  return (
    <div className="h-full flex">
      {/* Left Side: Simulation Map */}
      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 relative flex flex-col min-w-0">
        <div className="relative flex-grow flex justify-center items-center">
          <div
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4"
            style={{
              width: canvasSize.width + 32, // Add padding
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

            {/* Legend - More Compact */}
            <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                  <span className="dark:text-gray-300">AUV</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span className="dark:text-gray-300">Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <span className="dark:text-gray-300">Goal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                  <span className="dark:text-gray-300">Obstacle</span>
                </div>
              </div>
            </div>

            {/* Coordinates - More Compact */}
            <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="space-y-1 text-xs">
                <p className="font-mono dark:text-gray-300">
                  AUV: {formatCoordinate(auvPosition.x, auvPosition.y)}
                </p>
                <p className="font-mono dark:text-gray-300">
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
    </div>
  );
};

export default Simulation;

"use client";

import { useState } from "react";
import { useTheme } from "@/utils/ThemeProvider";
import { GRID_SIZE } from "@/utils/constants";
import { Play, Square, Sun, Moon } from "lucide-react";

interface DebuggingPanelProps {
  auvPosition: { x: number; y: number };
  lastAction: number | null;
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
  obstacles: Array<{ x: number; y: number }>;
  setObstacles: (obstacles: Array<{ x: number; y: number }>) => void;
  onClearObstacles: () => void;
  setStartPosition: (position: { x: number; y: number }) => void;
  setTargetPosition: (position: { x: number; y: number }) => void;
  setAuvPosition: (position: { x: number; y: number }) => void;
  placementMode: "none" | "start" | "goal";
  setPlacementMode: (mode: "none" | "start" | "goal") => void;
  children?: React.ReactNode;
}

const DebuggingPanel = ({
  auvPosition,
  lastAction,
  isRunning,
  setIsRunning,
  obstacles,
  setObstacles,
  onClearObstacles,
  setStartPosition,
  setTargetPosition,
  setAuvPosition,
  placementMode,
  setPlacementMode,
  children,
}: DebuggingPanelProps) => {
  const { theme, toggleTheme } = useTheme();
  const [obstacleCount, setObstacleCount] = useState(10);

  // Helper function to translate action numbers to directions
  const getActionName = (action: number | null) => {
    if (action === null) return "None";
    const actions = ["Left", "Right", "Up", "Down"];
    return actions[action];
  };

  return (
    <div className="w-80 lg:w-96 h-full overflow-y-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l border-gray-200 dark:border-gray-700">
      <div className="p-4 space-y-4">
        {/* Header with Theme Toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold dark:text-white">Control Panel</h2>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-blue-500" />
            )}
          </button>
        </div>

        {/* Position Controls */}
        <section className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                placementMode === "start"
                  ? "bg-green-600"
                  : "bg-green-500 hover:bg-green-600"
              } text-white shadow`}
              onClick={() =>
                setPlacementMode(placementMode === "start" ? "none" : "start")
              }
            >
              {placementMode === "start" ? "Cancel" : "Place Start"}
            </button>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                placementMode === "goal"
                  ? "bg-blue-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white shadow`}
              onClick={() =>
                setPlacementMode(placementMode === "goal" ? "none" : "goal")
              }
            >
              {placementMode === "goal" ? "Cancel" : "Place Goal"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="px-4 py-2 rounded-lg font-medium bg-green-500/50 hover:bg-green-600 text-white transition-all shadow"
              onClick={() => {
                const x = Math.floor(Math.random() * GRID_SIZE.width);
                const y = Math.floor(Math.random() * GRID_SIZE.height);
                setStartPosition({ x, y });
                setAuvPosition({ x, y });
              }}
            >
              Random Start
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium bg-blue-500/50 hover:bg-blue-600 text-white transition-all shadow"
              onClick={() => {
                const x = Math.floor(Math.random() * GRID_SIZE.width);
                const y = Math.floor(Math.random() * GRID_SIZE.height);
                setTargetPosition({ x, y });
              }}
            >
              Random Goal
            </button>
          </div>
        </section>

        {/* Main Controls */}
        <section>
          <button
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all shadow flex items-center justify-center gap-2 ${
              isRunning
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            } text-white`}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4" /> Stop Simulation
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start Simulation
              </>
            )}
          </button>
        </section>

        {/* Status Monitor */}
        <section className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Status Monitor
          </h3>
          <div className="space-y-2">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Position
              </p>
              <p className="font-mono text-sm dark:text-white">
                X: {auvPosition.x}, Y: {auvPosition.y}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last Move
              </p>
              <p className="font-mono text-sm dark:text-white">
                {getActionName(lastAction)}
              </p>
            </div>
          </div>
        </section>

        {/* Obstacles Control */}
        <section className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Obstacles
              </h3>
              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                Total: {obstacles.length}
              </span>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="1"
                max="50"
                value={obstacleCount}
                onChange={(e) =>
                  setObstacleCount(
                    Math.min(50, Math.max(1, parseInt(e.target.value) || 1))
                  )
                }
                className="w-20 px-2 py-1 rounded border dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                className="flex-1 py-1 px-3 rounded-lg font-medium bg-purple-500 
                         hover:bg-purple-600 text-white transition-all shadow"
                onClick={() => {
                  const newObstacles = Array.from(
                    { length: obstacleCount },
                    () => ({
                      x: Math.floor(Math.random() * GRID_SIZE.width),
                      y: Math.floor(Math.random() * GRID_SIZE.height),
                    })
                  );
                  setObstacles([...obstacles, ...newObstacles]);
                }}
              >
                Add Obstacles
              </button>
            </div>

            <button
              className="w-full py-2 px-4 rounded-lg font-medium bg-red-500 
                       hover:bg-red-600 text-white transition-all shadow"
              onClick={onClearObstacles}
            >
              Clear All Obstacles
            </button>
          </div>
        </section>

        {/* Add children (Reset button) at the end */}
        {children}
      </div>
    </div>
  );
};

export default DebuggingPanel;

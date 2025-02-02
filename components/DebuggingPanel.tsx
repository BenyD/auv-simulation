"use client";

import { useState } from "react";
import { useTheme } from "@/utils/ThemeProvider";
import { GRID_SIZE } from "@/utils/constants";
import { Play, Square, Sun, Moon, Keyboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

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
  onStartSimulation: () => void;
  children?: React.ReactNode;
  setShowDocs: (show: boolean) => void;
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
  onStartSimulation,
  children,
  setShowDocs,
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
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-80 lg:w-96 h-full overflow-y-auto bg-white/90 dark:bg-gray-900/95 backdrop-blur-md border-l border-gray-200 dark:border-gray-800"
    >
      <TooltipProvider>
        <div className="p-4 space-y-4">
          {/* Header with Theme Toggle */}
          <motion.div layout className="flex items-center justify-between">
            <motion.h2 layout className="text-xl font-bold dark:text-white">
              Control Panel
            </motion.h2>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDocs(true)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Keyboard className="w-5 h-5" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Documentation</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={theme}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {theme === "dark" ? (
                          <Sun className="w-5 h-5 text-amber-500" />
                        ) : (
                          <Moon className="w-5 h-5 text-blue-500" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle theme (Ctrl/⌘ + T)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </motion.div>

          {/* Position Controls */}
          <section className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      placementMode === "start"
                        ? "bg-green-600"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white shadow`}
                    onClick={() =>
                      setPlacementMode(
                        placementMode === "start" ? "none" : "start"
                      )
                    }
                  >
                    {placementMode === "start" ? "Cancel" : "Place Start"}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set the starting position for the AUV</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      placementMode === "goal"
                        ? "bg-blue-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white shadow`}
                    onClick={() =>
                      setPlacementMode(
                        placementMode === "goal" ? "none" : "goal"
                      )
                    }
                  >
                    {placementMode === "goal" ? "Cancel" : "Place Goal"}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Set the target position for the AUV</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Randomly place the starting position</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Randomly place the target position</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </section>

          {/* Main Controls */}
          <section>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all shadow flex items-center justify-center gap-2 ${
                    isRunning
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  } text-white`}
                  onClick={() =>
                    isRunning ? setIsRunning(false) : onStartSimulation()
                  }
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Start/Stop simulation (Spacebar)</p>
              </TooltipContent>
            </Tooltip>
          </section>

          {/* Status Monitor */}
          <motion.section
            layout
            className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg"
          >
            <motion.div layout className="space-y-2">
              <motion.div
                layout
                className="bg-white dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700"
              >
                <motion.p
                  layout
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  Position
                </motion.p>
                <motion.p
                  layout
                  className="font-mono text-sm text-gray-700 dark:text-gray-300"
                >
                  X: {auvPosition.x}, Y: {auvPosition.y}
                </motion.p>
              </motion.div>
              <motion.div
                layout
                className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700"
              >
                <motion.p
                  layout
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  Last Move
                </motion.p>
                <motion.p layout className="font-mono text-sm dark:text-white">
                  {getActionName(lastAction)}
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.section>

          {/* Obstacles Control */}
          <section className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-lg transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Obstacles
                </h3>
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-700 dark:text-gray-200">
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
                  className="w-20 px-2 py-1 rounded border dark:bg-gray-800 dark:border-gray-600 
                           text-gray-900 dark:text-gray-100 transition-colors duration-300"
                />
                <button
                  className="flex-1 py-1 px-3 rounded-lg font-medium bg-purple-500 
                           hover:bg-purple-600 text-white transition-all duration-300 shadow"
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

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="w-full py-2 px-4 rounded-lg font-medium bg-red-500/90 
                             hover:bg-red-600 text-white transition-all duration-300 shadow"
                    onClick={onClearObstacles}
                  >
                    Clear All Obstacles
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove all obstacles (Ctrl/⌘ + C)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </section>

          {/* Add children (Reset button) at the end */}
          {children}
        </div>
      </TooltipProvider>
    </motion.div>
  );
};

export default DebuggingPanel;

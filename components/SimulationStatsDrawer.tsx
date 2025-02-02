"use client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { SimulationStats } from "@/types/simulation";
import { X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { motion } from "framer-motion";

interface SimulationStatsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SimulationStats;
}

export function SimulationStatsDrawer({
  isOpen,
  onClose,
  stats,
}: SimulationStatsDrawerProps) {
  // Calculate path efficiency percentage
  const efficiencyPercentage = Math.round(stats.pathEfficiency * 100);

  // Prepare data for the move time chart
  const moveTimeData = stats.pathHistory.map((_, index) => ({
    move: index + 1,
    time: stats.averageTimePerMove,
  }));

  // Prepare data for the path visualization
  const pathData = stats.pathHistory.map((pos, index) => ({
    step: index + 1,
    x: pos.x,
    y: pos.y,
  }));

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent className="h-[95vh] max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex-none">
          <DrawerHeader className="relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <DrawerTitle>Simulation Statistics</DrawerTitle>
            <DrawerDescription>
              Performance metrics from the latest simulation run
            </DrawerDescription>
          </DrawerHeader>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Moves"
                value={stats.totalMoves}
                unit="moves"
              />
              <MetricCard
                title="Execution Time"
                value={Math.round(stats.executionTime)}
                unit="ms"
              />
              <MetricCard
                title="Path Efficiency"
                value={Math.round(stats.pathEfficiency * 100)}
                unit="%"
              />
              <MetricCard
                title="Collisions"
                value={stats.collisionCount}
                unit="hits"
              />
            </div>

            {/* Efficiency Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Path Efficiency</span>
                <span>{Math.round(stats.pathEfficiency * 100)}%</span>
              </div>
              <Progress value={Math.round(stats.pathEfficiency * 100)} />
            </div>

            {/* Move Time Chart */}
            <div className="h-[200px] bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-2">Move Time Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moveTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="move" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="time"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Path Visualization */}
            <div className="h-[200px] bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-2">Path Coordinates</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pathData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis dataKey="y" />
                  <Tooltip />
                  <Line type="monotone" dataKey="x" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="y" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Additional Stats */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Additional Information</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-gray-500">Obstacle Count:</dt>
                <dd>{stats.obstacleCount}</dd>
                <dt className="text-gray-500">Average Time per Move:</dt>
                <dd>{stats.averageTimePerMove.toFixed(2)}ms</dd>
                <dt className="text-gray-500">Total Path Length:</dt>
                <dd>{stats.pathLength} units</dd>
                <dt className="text-gray-500">Nodes Explored:</dt>
                <dd>{stats.nodesExplored}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="flex-none p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button 
            onClick={onClose}
            className="w-full"
          >
            Close Stats
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function MetricCard({
  title,
  value,
  unit,
}: {
  title: string;
  value: number;
  unit: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </h3>
      <p className="mt-2 text-2xl font-semibold">
        {value}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </motion.div>
  );
} 
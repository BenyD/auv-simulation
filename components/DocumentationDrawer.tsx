"use client";
import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Keyboard, Code, Book, Cpu, Lightbulb } from "lucide-react";

interface DocumentationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentationDrawer({
  isOpen,
  onClose,
}: DocumentationDrawerProps) {
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
            <DrawerTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Documentation
            </DrawerTitle>
          </DrawerHeader>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-8">
            {/* Keyboard Shortcuts Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts
              </h2>
              <div className="space-y-2">
                <ShortcutItem
                  keys={["Space"]}
                  description="Start/Stop simulation"
                />
                <ShortcutItem
                  keys={["Alt", "L"]}
                  description="Toggle light/dark theme"
                />
                <ShortcutItem
                  keys={["Alt", "X"]}
                  description="Clear obstacles"
                />
                <ShortcutItem keys={["Esc"]} description="Stop simulation" />
                <ShortcutItem keys={["?"]} description="Toggle documentation" />
              </div>
            </section>

            {/* Basic Controls Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Basic Controls
              </h2>
              <div className="space-y-4 text-sm">
                <ControlItem
                  title="Mouse Controls"
                  description="Click and drag to place obstacles. Right-click to set start position (green). Right-click + Shift to set goal position (blue)."
                />
                <ControlItem
                  title="Algorithm Selection"
                  description="Choose between A* Search, RRT, or Deep Reinforcement Learning algorithms from the control panel."
                />
                <ControlItem
                  title="Simulation Controls"
                  description="Use the Start/Stop button or spacebar to control the simulation. Reset button clears the current path."
                />
              </div>
            </section>

            {/* Algorithms Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code className="h-5 w-5" />
                Pathfinding Algorithms
              </h2>
              <div className="space-y-4 text-sm">
                <ControlItem
                  title="A* Search"
                  description="Utilizes Manhattan distance heuristic for optimal pathfinding. Best for environments with sparse obstacles. Guarantees the shortest path when available."
                />
                <ControlItem
                  title="RRT (Rapidly-exploring Random Tree)"
                  description="Suitable for complex, cluttered environments. Uses a probabilistic approach to pathfinding. Efficient for real-time applications."
                />
                <ControlItem
                  title="Deep Reinforcement Learning"
                  description="Experimental feature using TensorFlow.js. Learns from experience to improve pathfinding. Adapts to dynamic environments."
                />
              </div>
            </section>

            {/* Tips Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Tips & Best Practices
              </h2>
              <div className="space-y-4 text-sm">
                <ControlItem
                  title="Algorithm Selection"
                  description="Use A* for simple environments, RRT for complex obstacle patterns, and DRL for dynamic scenarios."
                />
                <ControlItem
                  title="Performance Optimization"
                  description="Keep obstacle count reasonable for better performance. Clear paths occasionally to reset the simulation state."
                />
                <ControlItem
                  title="Experimentation"
                  description="Try different start/goal positions and obstacle patterns to see how each algorithm performs in various scenarios."
                />
              </div>
            </section>
          </div>
        </div>

        <div className="flex-none p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button onClick={onClose} className="w-full">
            Close Documentation
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ShortcutItem({
  keys,
  description,
}: {
  keys: string[];
  description: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs">
              {key}
            </kbd>
            {index < keys.length - 1 && <span>+</span>}
          </React.Fragment>
        ))}
      </div>
      <span className="text-gray-600 dark:text-gray-400">{description}</span>
    </div>
  );
}

function ControlItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

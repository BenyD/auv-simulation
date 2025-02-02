"use client";
import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Keyboard } from "lucide-react";

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
              <Keyboard className="h-5 w-5" />
              Documentation
            </DrawerTitle>
          </DrawerHeader>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-8">
            {/* Keyboard Shortcuts Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h2>
              <div className="space-y-2">
                <ShortcutItem
                  keys={["Space"]}
                  description="Start/Stop simulation"
                />
                <ShortcutItem
                  keys={["Ctrl/⌘", "C"]}
                  description="Clear all obstacles"
                />
                <ShortcutItem
                  keys={["Ctrl/⌘", "R"]}
                  description="Reset simulation"
                />
                <ShortcutItem
                  keys={["Ctrl/⌘", "T"]}
                  description="Toggle dark/light theme"
                />
              </div>
            </section>

            {/* Basic Controls Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Basic Controls</h2>
              <div className="space-y-4 text-sm">
                <ControlItem
                  title="Placement Mode"
                  description="Use the 'Set Start' and 'Set Goal' buttons to enter placement mode, then click on the grid to place the start or goal position."
                />
                <ControlItem
                  title="Obstacles"
                  description="Click and drag on the grid to draw obstacles. Use the obstacle controls to add random obstacles or clear them all."
                />
                <ControlItem
                  title="Simulation"
                  description="Press the Start button or Spacebar to begin the simulation. The AUV will attempt to find the optimal path to the goal while avoiding obstacles."
                />
              </div>
            </section>

            {/* Advanced Settings Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Advanced Settings</h2>
              <div className="space-y-4 text-sm">
                <ControlItem
                  title="Learning Rate"
                  description="Controls how quickly the AUV learns from its experiences. Higher values mean faster learning but potentially less optimal paths."
                />
                <ControlItem
                  title="Statistics"
                  description="After reaching the goal, detailed statistics about the path efficiency, execution time, and other metrics will be displayed."
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
    <div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

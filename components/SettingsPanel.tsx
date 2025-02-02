"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SimulationSettings {
  learningRate: number;
  discountFactor: number;
  explorationRate: number;
}

interface SettingsPanelProps {
  settings: SimulationSettings;
  onSettingsChange: (settings: SimulationSettings) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : "40px" }}
        className="fixed bottom-16 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Advanced Settings {isOpen ? "↓" : "→"}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Configure simulation parameters</p>
          </TooltipContent>
        </Tooltip>
        
        {isOpen && (
          <div className="p-4 space-y-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    Learning Rate
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.learningRate}
                    onChange={(e) => 
                      onSettingsChange({
                        ...settings,
                        learningRate: parseFloat(e.target.value)
                      })
                    }
                    className="w-full"
                  />
                  <span className="text-xs">{settings.learningRate}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adjust how quickly the AUV learns from its experiences</p>
              </TooltipContent>
            </Tooltip>
            {/* Add more settings controls with tooltips */}
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
} 
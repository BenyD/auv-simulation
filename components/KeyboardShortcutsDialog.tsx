"use client";
import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, Option } from 'lucide-react'; // Import platform-specific icons

export function KeyboardShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const isMac = typeof window !== 'undefined' && navigator.platform.toLowerCase().includes('mac');

  // Platform-specific modifier key components
  const ModifierIcon = isMac ? Option : Command;
  const modifierKey = isMac ? '⌥' : 'Alt';
  const cmdKey = isMac ? '⌘' : 'Ctrl';

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Show shortcuts dialog with Cmd/Ctrl + /
      if (e.key === '/' && (isMac ? e.metaKey : e.ctrlKey) && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isMac]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
          >
            <h2 className="text-xl font-bold mb-4 dark:text-white">Keyboard Shortcuts</h2>
            <div className="space-y-3">
              <ShortcutRow
                keys={[modifierKey, 'D']}
                description="Toggle dark/light theme"
                icon={<ModifierIcon className="w-3.5 h-3.5" />}
              />
              <ShortcutRow
                keys={['Space']}
                description="Start/Stop simulation"
              />
              <ShortcutRow
                keys={[modifierKey, 'X']}
                description="Clear all obstacles"
                icon={<ModifierIcon className="w-3.5 h-3.5" />}
              />
              <ShortcutRow
                keys={['Esc']}
                description="Stop simulation"
              />
              <ShortcutRow
                keys={[cmdKey, '/']}
                description="Show/hide shortcuts"
                icon={<Command className="w-3.5 h-3.5" />}
              />
              <ShortcutRow
                keys={[modifierKey, 'R']}
                description="Reset simulation"
                icon={<ModifierIcon className="w-3.5 h-3.5" />}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShortcutRow({ 
  keys, 
  description,
  icon
}: { 
  keys: string[], 
  description: string,
  icon?: React.ReactNode 
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600 dark:text-gray-300">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <kbd className="inline-flex items-center gap-0.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs min-w-[1.5rem] justify-center">
              {icon && key === 'Alt' || key === '⌥' ? icon : key}
            </kbd>
            {index < keys.length - 1 && <span className="text-gray-400">+</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
} 
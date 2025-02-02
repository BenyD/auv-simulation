"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function KeyboardShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const isMac = typeof window !== 'undefined' && navigator.platform.toLowerCase().includes('mac');

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

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
                keys={['Alt', 'L']}
                description="Toggle dark/light theme"
              />
              <ShortcutRow
                keys={['Space']}
                description="Start/Stop simulation"
              />
              <ShortcutRow
                keys={['Alt', 'X']}
                description="Clear all obstacles"
              />
              <ShortcutRow
                keys={['Esc']}
                description="Stop simulation"
              />
              <ShortcutRow
                keys={['?']}
                description="Show/hide this dialog"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShortcutRow({ keys, description }: { keys: string[], description: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600 dark:text-gray-300">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 text-sm"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
} 
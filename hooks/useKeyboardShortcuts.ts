import { useEffect } from 'react';

interface ShortcutConfig {
  toggleTheme: () => void;
  toggleSimulation: () => void;
  clearObstacles: () => void;
}

export function useKeyboardShortcuts({
  toggleTheme,
  toggleSimulation,
  clearObstacles,
}: ShortcutConfig) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if focus is in an input or if modifiers other than Ctrl/Cmd are pressed
      if (
        e.target instanceof HTMLInputElement ||
        e.altKey ||
        e.shiftKey
      ) return;

      const isMacCmd = e.metaKey && navigator.platform.toLowerCase().includes('mac');
      const isCtrl = e.ctrlKey || isMacCmd;

      switch (e.key.toLowerCase()) {
        case 't':
          if (isCtrl) {
            e.preventDefault();
            toggleTheme();
          }
          break;
        case ' ':
          // Only trigger if not in an interactive element
          if (!(e.target instanceof HTMLButtonElement) && 
              !(e.target instanceof HTMLInputElement) && 
              !(e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
            toggleSimulation();
          }
          break;
        case 'c':
          if (isCtrl) {
            // Only prevent default if we're not trying to copy text
            if (!window.getSelection()?.toString()) {
              e.preventDefault();
              clearObstacles();
            }
          }
          break;
        case 'escape':
          // Could be used to stop simulation or clear selection
          e.preventDefault();
          toggleSimulation();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTheme, toggleSimulation, clearObstacles]);
} 
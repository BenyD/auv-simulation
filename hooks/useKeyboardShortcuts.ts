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
      // Ignore if focus is in an input
      if (e.target instanceof HTMLInputElement) return;

      const isMacCmd = navigator.platform.toLowerCase().includes('mac');

      switch (e.key.toLowerCase()) {
        case 'l': // Changed from 't' to 'l' for "light/dark"
          if (e.altKey && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
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
        case 'x': // Changed from 'c' to 'x' for "clear"
          if (e.altKey && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            clearObstacles();
          }
          break;
        case 'escape':
          e.preventDefault();
          toggleSimulation();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTheme, toggleSimulation, clearObstacles]);
} 
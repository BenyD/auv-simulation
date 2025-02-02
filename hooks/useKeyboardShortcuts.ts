import { useEffect } from 'react';

interface ShortcutConfig {
  toggleTheme: () => void;
  toggleSimulation: () => void;
  clearObstacles: () => void;
  resetSimulation: () => void;
}

export function useKeyboardShortcuts({
  toggleTheme,
  toggleSimulation,
  clearObstacles,
  resetSimulation,
}: ShortcutConfig) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if focus is in an input or contentEditable
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) return;

      const isMac = navigator.platform.toLowerCase().includes('mac');

      switch (e.key.toLowerCase()) {
        case 'd':
          if (e.altKey && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            toggleTheme();
          }
          break;
        case ' ':
          if (!(e.target instanceof HTMLButtonElement)) {
            e.preventDefault();
            toggleSimulation();
          }
          break;
        case 'x':
          if (e.altKey && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            clearObstacles();
          }
          break;
        case 'r':
          if (e.altKey && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            resetSimulation();
          }
          break;
        case 'escape':
          if (!e.altKey && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            toggleSimulation();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTheme, toggleSimulation, clearObstacles, resetSimulation]);
} 
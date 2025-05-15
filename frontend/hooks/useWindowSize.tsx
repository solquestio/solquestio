'use client';

import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

// Default to a reasonable size for SSR
const defaultSize = {
  width: typeof window !== 'undefined' ? window.innerWidth : 1200,
  height: typeof window !== 'undefined' ? window.innerHeight : 800
};

export default function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>(defaultSize);

  useEffect(() => {
    // Only run client-side
    if (typeof window === 'undefined') return;

    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
} 
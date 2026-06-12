"use client"

import React, { useEffect, useRef } from 'react';

interface LatexRendererProps {
  content: string;
  displayMode?: boolean;
  className?: string;
}

declare global {
  interface Window {
    katex: any;
  }
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ 
  content, 
  displayMode = false,
  className = ""
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof window !== 'undefined' && window.katex) {
      try {
        window.katex.render(content, containerRef.current, {
          throwOnError: false,
          displayMode: displayMode,
          trust: true,
          strict: false,
        });
      } catch (err) {
        console.error('KaTeX rendering error:', err);
        containerRef.current.textContent = content;
      }
    }
  }, [content, displayMode]);

  return <span ref={containerRef} className={className} />;
};

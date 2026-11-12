'use client';

import React, { useRef, useState, useEffect } from 'react';

interface DocumentPreviewWrapperProps {
  children: React.ReactNode;
  zoom: number;
}

export const DocumentPreviewWrapper: React.FC<DocumentPreviewWrapperProps> = ({
  children,
  zoom,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScale, setAutoScale] = useState(1);

  // Auto-calculate scale on mobile / smaller viewports
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 32; // padding offset
      // Standard A4 width in pixels at 96 DPI: ~794px (210mm)
      const a4WidthPx = 794;

      if (containerWidth < a4WidthPx) {
        const scale = Math.max(0.35, Math.min(1, containerWidth / a4WidthPx));
        setAutoScale(scale);
      } else {
        setAutoScale(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveZoom = zoom * autoScale;

  return (
    <div
      ref={containerRef}
      className="w-full flex justify-center items-start overflow-x-auto py-4 px-2 sm:px-4"
    >
      <div
        style={{
          transform: `scale(${effectiveZoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
          marginBottom: effectiveZoom < 1 ? `-${Math.round((1 - effectiveZoom) * 1123)}px` : '0px',
        }}
        className="flex-shrink-0"
      >
        {children}
      </div>
    </div>
  );
};

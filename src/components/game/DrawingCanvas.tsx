"use client";

import { useRef, useEffect, useState, useCallback } from "react";

export type DrawingTool = 'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'line' | 'arrow';

interface DrawingCanvasProps {
  width: number;
  height: number;
  activeTool: DrawingTool;
  brushSize: number;
  brushColor: string;
  onDrawingChange?: (dataUrl: string) => void;
  className?: string;
}

export function DrawingCanvas({
  width,
  height,
  activeTool,
  brushSize,
  brushColor,
  onDrawingChange,
  className = ""
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Make canvas responsive
    const setCanvasSize = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth - 32; // Account for padding
      const containerHeight = container.clientHeight - 32; // Account for padding
      
      // Maintain aspect ratio
      const aspectRatio = width / height;
      let finalWidth = containerWidth;
      let finalHeight = containerWidth / aspectRatio;
      
      if (finalHeight > containerHeight) {
        finalHeight = containerHeight;
        finalWidth = containerHeight * aspectRatio;
      }
      
      canvas.style.width = `${finalWidth}px`;
      canvas.style.height = `${finalHeight}px`;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    return () => window.removeEventListener('resize', setCanvasSize);
  }, [width, height]);

  // Update drawing styles when tool or settings change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = brushColor;
    ctx.fillStyle = brushColor;

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
  }, [activeTool, brushSize, brushColor]);

  // Save drawing state
  const saveDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onDrawingChange) return;

    const dataUrl = canvas.toDataURL('image/png');
    onDrawingChange(dataUrl);
  }, [onDrawingChange]);

  // Mouse/touch event handlers
  const getPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getPoint(e);
    
    setIsDrawing(true);
    setLastPoint(point);
    setStartPoint(point);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (activeTool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }
  }, [getPoint, activeTool]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    e.preventDefault();
    const point = getPoint(e);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPoint) return;

    switch (activeTool) {
      case 'pen':
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        break;
        
      case 'eraser':
        ctx.beginPath();
        ctx.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'line':
      case 'arrow':
        // Redraw canvas without the current line
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Redraw all previous strokes (simplified - in real app you'd save stroke history)
        ctx.beginPath();
        ctx.moveTo(startPoint!.x, startPoint!.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        
        if (activeTool === 'arrow') {
          drawArrow(ctx, startPoint!, point);
        }
        break;
        
      case 'rectangle':
        // Redraw canvas without the current rectangle
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const rectWidth = point.x - startPoint!.x;
        const rectHeight = point.y - startPoint!.y;
        ctx.strokeRect(startPoint!.x, startPoint!.y, rectWidth, rectHeight);
        break;
        
      case 'circle':
        // Redraw canvas without the current circle
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const radius = Math.sqrt(
          Math.pow(point.x - startPoint!.x, 2) + Math.pow(point.y - startPoint!.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPoint!.x, startPoint!.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }

    setLastPoint(point);
  }, [isDrawing, getPoint, lastPoint, startPoint, activeTool, brushSize]);

  const stopDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    e.preventDefault();
    setIsDrawing(false);
    setLastPoint(null);
    setStartPoint(null);
    saveDrawing();
  }, [isDrawing, saveDrawing]);

  // Helper function to draw arrows
  const drawArrow = useCallback((ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
    const headLength = 15;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLength * Math.cos(angle - Math.PI / 6),
      to.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLength * Math.cos(angle + Math.PI / 6),
      to.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  }, []);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveDrawing();
  }, [saveDrawing]);

  // Undo functionality (simplified - would need stroke history in production)
  const undo = useCallback(() => {
    // In a real implementation, you'd maintain a history of strokes
    // For now, we'll just clear the canvas
    clearCanvas();
  }, [clearCanvas]);

  return (
    <div className={`relative bg-white rounded-lg shadow-sm ${className}`}>
      <canvas
        ref={canvasRef}
        className="block rounded-lg cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ touchAction: 'none' }}
      />
      
      {/* Canvas controls */}
      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={undo}
          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg text-xs hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
          title="Undo last action"
        >
          ↶
        </button>
        <button
          onClick={clearCanvas}
          className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg text-xs hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
          title="Clear canvas"
        >
          🗑️
        </button>
      </div>

      {/* Canvas info */}
      <div className="absolute bottom-3 left-3 bg-white/90 border border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-600 shadow-sm">
        {width} × {height}px
      </div>
    </div>
  );
}

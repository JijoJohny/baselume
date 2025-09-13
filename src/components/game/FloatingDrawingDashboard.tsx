"use client";

import { useState, useRef, useEffect } from "react";
import { DrawingTool } from "./DrawingCanvas";

interface FloatingDrawingDashboardProps {
  activeTool: DrawingTool;
  onToolSelect: (tool: DrawingTool) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushColor: string;
  onBrushColorChange: (color: string) => void;
  onUploadImage: () => void;
  className?: string;
}

export function FloatingDrawingDashboard({
  activeTool,
  onToolSelect,
  brushSize,
  onBrushSizeChange,
  brushColor,
  onBrushColorChange,
  onUploadImage,
  className = ""
}: FloatingDrawingDashboardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dashboardRef = useRef<HTMLDivElement>(null);

  const tools = [
    { id: 'pen' as DrawingTool, icon: '✏️', label: 'Pen' },
    { id: 'eraser' as DrawingTool, icon: '🧹', label: 'Eraser' },
    { id: 'text' as DrawingTool, icon: 'T', label: 'Text' },
    { id: 'rectangle' as DrawingTool, icon: '⬜', label: 'Rectangle' },
    { id: 'circle' as DrawingTool, icon: '⭕', label: 'Circle' },
    { id: 'line' as DrawingTool, icon: '📏', label: 'Line' },
    { id: 'arrow' as DrawingTool, icon: '➡️', label: 'Arrow' },
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB',
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Keep dashboard within viewport bounds and away from bottom buttons
      const maxX = window.innerWidth - 240;
      const maxY = window.innerHeight - 250; // Leave space for bottom buttons
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div
      ref={dashboardRef}
      className={`fixed bg-white border-2 border-black rounded-lg shadow-xl z-50 transition-all duration-200 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: '240px',
        maxHeight: '400px',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="drag-handle flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-blue-600 text-xs font-semibold">Drawing Tools</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: '320px' }}>
          {/* Tool Selection */}
          <div>
            <h4 className="text-blue-600 text-xs font-semibold mb-2">Tools</h4>
            <div className="grid grid-cols-4 gap-1">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onToolSelect(tool.id)}
                  className={`aspect-square flex flex-col items-center justify-center rounded border transition-all ${
                    activeTool === tool.id
                      ? 'bg-black text-white border-black shadow-md'
                      : 'bg-white text-blue-600 border-gray-300 hover:border-black hover:bg-gray-50'
                  }`}
                  title={tool.label}
                >
                  <span className="text-sm">{tool.icon}</span>
                  <span className="text-xs leading-tight">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brush Size */}
          <div>
            <h4 className="text-blue-600 text-xs font-semibold mb-2">Brush Size</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                  className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-xs text-blue-600 font-medium w-8 text-center">
                  {brushSize}
                </div>
              </div>
              <div className="flex justify-center">
                <div
                  className="rounded-full bg-black border border-gray-300"
                  style={{
                    width: `${Math.min(brushSize * 1.5, 30)}px`,
                    height: `${Math.min(brushSize * 1.5, 30)}px`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <h4 className="text-blue-600 text-xs font-semibold mb-2">Colors</h4>
            <div className="grid grid-cols-5 gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => onBrushColorChange(color)}
                  className={`aspect-square rounded border transition-all ${
                    brushColor === color
                      ? 'border-black scale-110 shadow-md'
                      : 'border-gray-300 hover:border-gray-500 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Upload Button */}
          <div>
            <button
              onClick={onUploadImage}
              className="w-full bg-white text-blue-600 border border-gray-300 py-2 px-3 rounded text-xs font-medium hover:border-black hover:bg-gray-50 transition-all"
            >
              📤 Upload Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

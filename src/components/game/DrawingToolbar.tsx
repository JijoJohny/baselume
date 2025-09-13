"use client";

import { DrawingTool } from "./DrawingCanvas";

interface DrawingToolbarProps {
  activeTool: DrawingTool;
  onToolSelect: (tool: DrawingTool) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushColor: string;
  onBrushColorChange: (color: string) => void;
  onUploadImage: () => void;
  className?: string;
}

export function DrawingToolbar({
  activeTool,
  onToolSelect,
  brushSize,
  onBrushSizeChange,
  brushColor,
  onBrushColorChange,
  onUploadImage,
  className = ""
}: DrawingToolbarProps) {
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
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFC0CB', // Pink
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tool Selection */}
      <div>
        <h4 className="text-blue-600 text-sm font-semibold mb-3">Drawing Tools</h4>
        <div className="grid grid-cols-4 xl:grid-cols-4 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 transition-all ${
                activeTool === tool.id
                  ? 'bg-black text-white border-black shadow-md'
                  : 'bg-white text-blue-600 border-gray-300 hover:border-black hover:bg-gray-50'
              }`}
              title={tool.label}
            >
              <span className="text-base xl:text-lg mb-1">{tool.icon}</span>
              <span className="text-xs font-medium leading-tight">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brush Size */}
      <div>
        <h4 className="text-blue-600 text-sm font-semibold mb-3">Brush Size</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => onBrushSizeChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-sm text-blue-600 font-medium w-12 text-center">
              {brushSize}px
            </div>
          </div>
          <div className="flex justify-center">
            <div
              className="rounded-full bg-black border-2 border-gray-300"
              style={{
                width: `${Math.min(brushSize * 2, 40)}px`,
                height: `${Math.min(brushSize * 2, 40)}px`
              }}
            />
          </div>
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <h4 className="text-blue-600 text-sm font-semibold mb-3">Colors</h4>
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onBrushColorChange(color)}
              className={`aspect-square rounded-lg border-2 transition-all ${
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

      {/* Additional Tools */}
      <div>
        <h4 className="text-blue-600 text-sm font-semibold mb-3">Additional</h4>
        <button
          onClick={onUploadImage}
          className="w-full bg-white text-blue-600 border-2 border-gray-300 py-3 px-4 rounded-lg text-sm font-medium hover:border-black hover:bg-gray-50 transition-all"
        >
          📤 Upload Image
        </button>
      </div>
    </div>
  );
}
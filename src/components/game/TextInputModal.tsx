"use client";

import { useState, useRef, useEffect } from "react";

interface TextInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddText: (text: string, x: number, y: number, fontSize: number, color: string) => void;
  position: { x: number; y: number };
}

export function TextInputModal({ isOpen, onClose, onAddText, position }: TextInputModalProps) {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState("#000000");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddText(text.trim(), position.x, position.y, fontSize, color);
      setText("");
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-black rounded-lg p-6 w-80">
        <h3 className="text-blue-600 text-lg font-bold mb-4">Add Text</h3>
        
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
          <div className="space-y-4">
            <div>
              <label className="block text-blue-600 text-sm font-medium mb-2">
                Text:
              </label>
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-3 py-2 border border-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter text..."
                required
              />
            </div>

            <div>
              <label className="block text-blue-600 text-sm font-medium mb-2">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-blue-600 text-sm font-medium mb-2">
                Color:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 border border-black rounded"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-2 py-1 border border-black rounded text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
            >
              Add Text
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white text-blue-600 border border-black py-2 px-4 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

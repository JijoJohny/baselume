"use client";

import { useState, useRef } from "react";
import { Button } from "~/components/ui/Button";
import { useAccount } from "wagmi";
import { DrawingCanvas, DrawingTool } from "./DrawingCanvas";
import { FloatingDrawingDashboard } from "./FloatingDrawingDashboard";
import { TextInputModal } from "./TextInputModal";

interface GameSubmissionScreenProps {
  onNavigate: (screen: "main-menu") => void;
  onBack: () => void;
}

export function GameSubmissionScreen({ onNavigate, onBack }: GameSubmissionScreenProps) {
  const { address } = useAccount();
  const [submission, setSubmission] = useState("dragon flying");
  const [activeTool, setActiveTool] = useState<DrawingTool>("pen");
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");
  const [drawingData, setDrawingData] = useState<string>("");
  const [showTextModal, setShowTextModal] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = address 
    ? address.replace(/^0x/, '').slice(0, 8) + '.base.eth' 
    : '';

  const handleSubmit = () => {
    // Here you would submit the game entry with both text and drawing
    console.log("Submitting:", {
      text: submission,
      drawing: drawingData,
      timestamp: new Date().toISOString()
    });
    onNavigate("main-menu");
  };

  const handleToolSelect = (tool: DrawingTool) => {
    setActiveTool(tool);
    
    // Handle special tools
    if (tool === 'text') {
      setShowTextModal(true);
    }
  };

  const handleDrawingChange = (dataUrl: string) => {
    setDrawingData(dataUrl);
  };

  const handleAddText = (text: string, x: number, y: number, fontSize: number, color: string) => {
    // In a real implementation, you'd add text to the canvas
    // For now, we'll just log it
    console.log("Adding text:", { text, x, y, fontSize, color });
  };

  const handleUploadImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // In a real implementation, you'd add the image to the canvas
        console.log("Uploading image:", e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 text-center py-4 border-b border-black bg-white">
        <h1 className="text-2xl font-bold text-blue-600">baselume</h1>
        {displayName && (
          <p className="text-sm text-blue-600">{displayName}</p>
        )}
      </div>

      {/* Description Section */}
      <div className="flex-shrink-0 p-4 bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <label className="block text-blue-600 text-sm font-semibold mb-2">
            What are you drawing?
          </label>
          <input
            type="text"
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            placeholder="Describe what you want to draw..."
          />
        </div>
      </div>

      {/* Drawing Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50 relative">
        <div className="w-full h-full max-w-6xl">
          <div className="bg-white border-2 border-black rounded-lg shadow-lg p-4 h-full">
            <DrawingCanvas
              width={1200}
              height={700}
              activeTool={activeTool}
              brushSize={brushSize}
              brushColor={brushColor}
              onDrawingChange={handleDrawingChange}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Floating Dashboard */}
        <FloatingDrawingDashboard
          activeTool={activeTool}
          onToolSelect={handleToolSelect}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          brushColor={brushColor}
          onBrushColorChange={setBrushColor}
          onUploadImage={handleUploadImage}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-black">
        <div className="max-w-4xl mx-auto flex gap-4 justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={!submission.trim() && !drawingData}
            className="bg-black text-white border border-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
          >
            Submit Drawing
          </Button>
          
          <Button 
            onClick={onBack}
            className="bg-white text-blue-600 border border-black hover:bg-gray-100 px-8 py-3"
          >
            Back to Menu
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Text Input Modal */}
      <TextInputModal
        isOpen={showTextModal}
        onClose={() => setShowTextModal(false)}
        onAddText={handleAddText}
        position={textPosition}
      />
    </div>
  );
}

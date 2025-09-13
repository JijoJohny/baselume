"use client";

import { useState, useRef } from "react";
import { Button } from "~/components/ui/Button";
import { useAccount } from "wagmi";
import { DrawingCanvas, DrawingTool } from "./DrawingCanvas";
import { FloatingDrawingDashboard } from "./FloatingDrawingDashboard";
import { TextInputModal } from "./TextInputModal";
import { useContracts } from "~/hooks/useContractsSimple";

interface GameSubmissionScreenProps {
  onNavigate: (screen: "main-menu") => void;
  onBack: () => void;
  roomTheme?: string;
  roomName?: string;
}

export function GameSubmissionScreen({ onNavigate, onBack, roomTheme, roomName }: GameSubmissionScreenProps) {
  const { address } = useAccount();
  const { recordScore, recordingScore, error: contractError } = useContracts();
  const [submission, setSubmission] = useState("");
  const [activeTool, setActiveTool] = useState<DrawingTool>("pen");
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");
  const [drawingData, setDrawingData] = useState<string>("");
  const [showTextModal, setShowTextModal] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiScore, setAiScore] = useState<{
    score: number;
    feedback: string;
    criteria: {
      accuracy: number;
      creativity: number;
      technique: number;
      completeness: number;
    };
  } | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = address 
    ? address.replace(/^0x/, '').slice(0, 8) + '.base.eth' 
    : '';

  const handleSubmit = async () => {
    if (!submission.trim() || !drawingData) {
      alert('Please provide both a description and a drawing before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Step 1: Submit the drawing and get AI score
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique game ID
          drawingData,
          description: submission
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit drawing');
      }

      const result = await response.json();
      
      // Step 2: Record score on blockchain if AI scoring was successful
      if (result.submission.ai_score && address) {
        try {
          await recordScore(result.submission.ai_score, result.submission.id);
          
          // Show success message with blockchain confirmation
          setAiScore({
            score: result.submission.ai_score,
            feedback: (result.submission.ai_feedback || '') + ' Your score has been recorded on the blockchain!',
            criteria: result.submission.ai_criteria || {
              accuracy: 5,
              creativity: 5,
              technique: 5,
              completeness: 5
            }
          });
          setShowScoreModal(true);
        } catch (blockchainError) {
          console.error('Blockchain recording failed:', blockchainError);
          
          // Show AI score but indicate blockchain recording failed
          setAiScore({
            score: result.submission.ai_score,
            feedback: (result.submission.ai_feedback || '') + ' Note: Score could not be recorded on blockchain. Please try again later.',
            criteria: result.submission.ai_criteria || {
              accuracy: 5,
              creativity: 5,
              technique: 5,
              completeness: 5
            }
          });
          setShowScoreModal(true);
        }
      } else {
        // No AI score, navigate directly
        onNavigate("main-menu");
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit drawing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex-shrink-0 text-center py-3 border-b border-black bg-white">
        <h1 className="text-xl font-bold text-blue-600">baselume</h1>
        {displayName && (
          <p className="text-xs text-blue-600">{displayName}</p>
        )}
      </div>

      {/* Description Section */}
      <div className="flex-shrink-0 p-3 bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          {roomName && roomTheme && (
            <div className="mb-2 p-2 bg-blue-100 border border-blue-300 rounded-lg">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Room:</span> {roomName}
              </p>
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Theme:</span> {roomTheme}
              </p>
            </div>
          )}
          <label className="block text-blue-600 text-xs font-semibold mb-1">
            What are you drawing?
          </label>
          <input
            type="text"
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            className="w-full px-3 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder={roomTheme ? `Draw something related to ${roomTheme}...` : "Describe what you want to draw..."}
          />
        </div>
      </div>

      {/* Drawing Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-2 bg-gray-50 relative" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="w-full h-full max-w-5xl">
          <div className="bg-white border-2 border-black rounded-lg shadow-lg p-2 h-full">
            <DrawingCanvas
              width={1000}
              height={600}
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

      {/* Action Buttons - Fixed at bottom */}
      <div className="flex-shrink-0 p-3 bg-white border-t border-black shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-3 justify-center">
          <Button 
            onClick={handleSubmit}
            disabled={(!submission.trim() && !drawingData) || isSubmitting || recordingScore}
            className="bg-black text-white border border-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 text-sm font-semibold"
          >
            {recordingScore 
              ? 'Recording on Blockchain...' 
              : isSubmitting 
                ? 'Analyzing Drawing...' 
                : 'Submit Drawing'
            }
          </Button>
          
          <Button 
            onClick={onBack}
            className="bg-white text-blue-600 border border-black hover:bg-gray-100 px-6 py-2 text-sm font-semibold"
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

      {/* AI Score Modal */}
      {showScoreModal && aiScore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 border-2 border-black">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">AI Analysis Complete!</h2>
              <div className="text-6xl font-bold text-black mb-2">{aiScore.score}/10</div>
              <p className="text-sm text-blue-600">Your drawing has been scored by AI</p>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">{aiScore.feedback}</p>
            </div>

            <div className="space-y-2 mb-6">
              <h3 className="text-sm font-semibold text-blue-600">Score Breakdown:</h3>
              
              <div className="flex justify-between text-xs">
                <span>Accuracy:</span>
                <span className="font-medium">{aiScore.criteria.accuracy}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${aiScore.criteria.accuracy * 10}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs">
                <span>Creativity:</span>
                <span className="font-medium">{aiScore.criteria.creativity}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${aiScore.criteria.creativity * 10}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs">
                <span>Technique:</span>
                <span className="font-medium">{aiScore.criteria.technique}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${aiScore.criteria.technique * 10}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs">
                <span>Completeness:</span>
                <span className="font-medium">{aiScore.criteria.completeness}/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${aiScore.criteria.completeness * 10}%` }}
                ></div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setShowScoreModal(false);
                  onNavigate("main-menu");
                }}
                className="flex-1 bg-black text-white hover:bg-gray-800"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { useAccount } from "wagmi";

interface CreateRoomScreenProps {
  onNavigate: (screen: "game-lobby") => void;
  onBack: () => void;
}

export function CreateRoomScreen({ onNavigate, onBack }: CreateRoomScreenProps) {
  const { address } = useAccount();
  const [roomLink, setRoomLink] = useState("");

  const displayName = address 
    ? address.replace(/^0x/, '').slice(0, 8) + '.base.eth' 
    : '';

  const handleGenerateLink = () => {
    // Generate a random room code
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const link = `${window.location.origin}/room/${roomCode}`;
    setRoomLink(link);
    
    // Copy to clipboard
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 space-y-6 bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-blue-600">baselume</h1>
        
        {displayName && (
          <p className="text-lg mb-6 text-blue-600">{displayName}</p>
        )}
      </div>

      {/* Avatar placeholder */}
      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-4 border-2 border-black"></div>

      <div className="w-full max-w-sm space-y-4">
        {roomLink ? (
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <p className="text-sm text-green-800 mb-2">
                Room link generated and copied to clipboard!
              </p>
              <p className="text-xs text-green-600 break-all">
                {roomLink}
              </p>
            </div>
            
            <Button 
              onClick={() => onNavigate("game-lobby")}
              className="w-full bg-black text-white border border-black hover:bg-gray-800"
            >
              Go to Lobby
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleGenerateLink}
            className="w-full bg-black text-white border border-black hover:bg-gray-800"
          >
            Generate Link
          </Button>
        )}

        <Button 
          onClick={onBack}
          className="w-full bg-white text-blue-600 border border-black hover:bg-gray-100"
        >
          Back
        </Button>
      </div>
    </div>
  );
}

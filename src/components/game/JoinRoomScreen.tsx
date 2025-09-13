"use client";

import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { useAccount } from "wagmi";

interface JoinRoomScreenProps {
  onNavigate: (screen: "game-lobby") => void;
  onBack: () => void;
}

export function JoinRoomScreen({ onNavigate, onBack }: JoinRoomScreenProps) {
  const { address } = useAccount();
  const [roomCode, setRoomCode] = useState("");

  const displayName = address 
    ? address.replace(/^0x/, '').slice(0, 8) + '.base.eth' 
    : '';

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      // Here you would validate the room code and join the room
      onNavigate("game-lobby");
    }
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
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-600">
            ENTER THE CODE
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            placeholder="Enter room code..."
            maxLength={8}
          />
        </div>

        <div className="flex space-x-3">
          <Button 
            onClick={onBack}
            className="flex-1 bg-white text-blue-600 border border-black hover:bg-gray-100"
          >
            Back
          </Button>
          
          <Button 
            onClick={handleJoinRoom}
            disabled={!roomCode.trim()}
            className="flex-1 bg-black text-white border border-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join
          </Button>
        </div>
      </div>
    </div>
  );
}

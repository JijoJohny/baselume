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
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">baselume</h1>
        <p className="text-sm text-blue-600">Join Private Room</p>
        
        {displayName && (
          <p className="text-sm mt-4 text-blue-600 font-medium">{displayName}</p>
        )}
      </div>

      {/* Avatar placeholder */}
      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-6 border-2 border-black"></div>

      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-600">
            ENTER THE CODE
          </label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-blue-600 placeholder-blue-400"
            placeholder="Enter room code..."
            maxLength={8}
          />
        </div>

        <div className="flex space-x-3">
          <Button 
            onClick={onBack}
            className="flex-1 bg-white text-blue-600 hover:bg-blue-50"
          >
            Back
          </Button>
          
          <Button 
            onClick={handleJoinRoom}
            disabled={!roomCode.trim()}
            className="flex-1 bg-black text-white hover:bg-gray-800"
          >
            Join
          </Button>
        </div>
      </div>
    </div>
  );
}

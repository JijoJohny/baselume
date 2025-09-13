"use client";

import { Button } from "~/components/ui/Button";
import { useAccount } from "wagmi";

interface GameLobbyScreenProps {
  onNavigate: (screen: "game-submission") => void;
  onBack: () => void;
  isHost?: boolean;
  participants?: string[];
  gameName?: string;
}

export function GameLobbyScreen({ 
  onNavigate, 
  onBack, 
  isHost = true, 
  participants = ["jesse.base.eth", "alice.base.eth"],
  gameName = "jesse's game"
}: GameLobbyScreenProps) {
  const { address } = useAccount();

  const displayName = address 
    ? address.replace(/^0x/, '').slice(0, 8) + '.base.eth' 
    : '';

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 space-y-6 bg-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-blue-600">baselume</h1>
        
        {displayName && (
          <p className="text-lg mb-6 text-blue-600">{displayName}</p>
        )}

        {/* Game name */}
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
          <p className="text-lg font-semibold text-blue-800">
            {gameName}
          </p>
        </div>
      </div>

      {/* Avatar placeholder */}
      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-4 border-2 border-black"></div>

      <div className="w-full max-w-sm space-y-6">
        {/* Participants */}
        <div className="bg-gray-100 rounded-lg p-4 border border-black">
          <p className="text-sm text-blue-600 mb-2">
            Joined Participants: {participants.length}
          </p>
          <div className="space-y-1">
            {participants.map((participant, index) => (
              <p key={index} className="text-xs text-gray-600">
                • {participant}
              </p>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {isHost && (
            <Button 
              onClick={() => onNavigate("game-submission")}
              className="w-full bg-black text-white border border-black hover:bg-gray-800"
            >
              START GAME
            </Button>
          )}
          
          <Button 
            onClick={onBack}
            className="w-full bg-white text-blue-600 border border-black hover:bg-gray-100"
          >
            {isHost ? 'CANCEL' : 'LEAVE'}
          </Button>
        </div>
      </div>
    </div>
  );
}

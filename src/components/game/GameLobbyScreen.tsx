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
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">baselume</h1>
        <p className="text-sm text-blue-600">Game Lobby</p>
        
        {displayName && (
          <p className="text-sm mt-4 text-blue-600 font-medium">{displayName}</p>
        )}

        {/* Game name */}
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mt-6">
          <p className="text-lg font-semibold text-blue-800">
            {gameName}
          </p>
        </div>
      </div>

      {/* Avatar placeholder */}
      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-6 border-2 border-black"></div>

      <div className="w-full max-w-sm space-y-6">
        {/* Participants */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 mb-2 font-medium">
            Joined Participants: {participants.length}
          </p>
          <div className="space-y-1">
            {participants.map((participant, index) => (
              <p key={index} className="text-xs text-blue-600">
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
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              START GAME
            </Button>
          )}
          
          <Button 
            onClick={onBack}
            className="w-full bg-white text-blue-600 hover:bg-blue-50"
          >
            {isHost ? 'CANCEL' : 'LEAVE'}
          </Button>
        </div>
      </div>
    </div>
  );
}

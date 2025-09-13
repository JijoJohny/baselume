"use client";

import { Button } from "~/components/ui/Button";
import { useAccount } from "wagmi";

interface MainMenuScreenProps {
  onNavigate: (screen: "private-rooms" | "public-rooms" | "leaderboard") => void;
  onPlayNow: () => void;
}

export function MainMenuScreen({ onNavigate, onPlayNow }: MainMenuScreenProps) {
  const { address } = useAccount();

  const displayName = address 
    ? address.replace(/^0x/, '').slice(0, 8) + '.base.eth' 
    : '';

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">baselume</h1>
        <p className="text-sm text-blue-600">Competitive Gaming Platform</p>
        
        {displayName && (
          <p className="text-sm mt-4 text-blue-600 font-medium">{displayName}</p>
        )}

        {/* Recent match notification */}
        <div className="bg-blue-50 rounded-lg p-4 mt-6 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">
            jesse.base.eth won match 12416
          </p>
        </div>
      </div>

      {/* Avatar placeholder */}
      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-6 border-2 border-black"></div>

      <div className="w-full max-w-sm space-y-4">
        <Button 
          onClick={onPlayNow}
          className="w-full bg-black text-white hover:bg-gray-800"
        >
          PLAY NOW
        </Button>
        
        <Button 
          onClick={() => onNavigate("private-rooms")}
          className="w-full bg-white text-blue-600 hover:bg-blue-50"
        >
          PRIVATE ROOMS
        </Button>
        
        <Button 
          onClick={() => onNavigate("leaderboard")}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 font-semibold"
        >
          🏆 LEADERBOARD
        </Button>
      </div>
    </div>
  );
}

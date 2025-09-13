"use client";

import { Button } from "~/components/ui/Button";
import { useAccount } from "wagmi";

interface MainMenuScreenProps {
  onNavigate: (screen: "private-rooms") => void;
  onPlayNow: () => void;
}

export function MainMenuScreen({ onNavigate, onPlayNow }: MainMenuScreenProps) {
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

        {/* Recent match notification */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6 border border-black">
          <p className="text-sm text-blue-600">
            jesse.base.eth won match 12416
          </p>
        </div>
      </div>

      {/* Avatar placeholder */}
      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-4 border-2 border-black"></div>

      <div className="w-full max-w-sm space-y-4">
        <Button 
          onClick={onPlayNow}
          className="w-full bg-black text-white border border-black hover:bg-gray-800"
        >
          PLAY NOW
        </Button>
        
        <Button 
          onClick={() => onNavigate("private-rooms")}
          className="w-full bg-white text-blue-600 border border-black hover:bg-gray-100"
        >
          PRIVATE ROOMS
        </Button>
      </div>
    </div>
  );
}

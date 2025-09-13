"use client";

import { Button } from "~/components/ui/Button";
import { useAccount } from "wagmi";

interface PrivateRoomsScreenProps {
  onNavigate: (screen: "join-room" | "create-room") => void;
}

export function PrivateRoomsScreen({ onNavigate }: PrivateRoomsScreenProps) {
  const { address } = useAccount();

  const displayName = address 
    ? address.replace(/^0x/, '').slice(0, 8) + '.base.eth' 
    : '';

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">baselume</h1>
        <p className="text-sm text-blue-600">Private Rooms</p>
        
        {displayName && (
          <p className="text-sm mt-4 text-blue-600 font-medium">{displayName}</p>
        )}
      </div>

      {/* Avatar placeholder */}
      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-6 border-2 border-black"></div>

      <div className="w-full max-w-sm space-y-4">
        <Button 
          onClick={() => onNavigate("join-room")}
          className="w-full bg-black text-white hover:bg-gray-800"
        >
          JOIN ROOM
        </Button>
        
        <Button 
          onClick={() => onNavigate("create-room")}
          className="w-full bg-white text-blue-600 hover:bg-blue-50"
        >
          CREATE ROOM
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
import { useAccount } from "wagmi";
import { useDatabase } from "~/hooks/useDatabase";

interface PublicRoom {
  id: string;
  name: string;
  host_address: string;
  theme?: string;
  max_players: number;
  status: "waiting" | "starting" | "in_progress" | "completed";
  is_public: boolean;
  time_limit?: number;
  created_at: string;
  updated_at: string;
  participant_count?: number;
}

interface PublicRoomsScreenProps {
  onNavigate: (screen: "game-lobby" | "game-submission" | "main-menu" | "create-room") => void;
  onRoomSelected: (roomData: { id: string; name: string; theme: string; host: string }) => void;
}

export function PublicRoomsScreen({ onNavigate, onRoomSelected }: PublicRoomsScreenProps) {
  const { address } = useAccount();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<PublicRoom[]>([]);
  const [loading, setLoading] = useState(false);

  const displayName = address 
    ? address.replace(/^0x/, '').slice(0, 8) + '.base.eth' 
    : '';

  // Hardcoded test rooms for easy testing - no database calls
  useEffect(() => {
    const mockRooms: PublicRoom[] = [
      {
        id: 'room-1',
        name: 'Fantasy Art Battle',
        host_address: '0x123...abc',
        theme: 'Fantasy',
        max_players: 6,
        status: 'waiting',
        is_public: true,
        time_limit: 300,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participant_count: 3,
      },
      {
        id: 'room-2',
        name: 'Animal Kingdom',
        host_address: '0x456...def',
        theme: 'Animals',
        max_players: 4,
        status: 'waiting',
        is_public: true,
        time_limit: 180,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participant_count: 1,
      },
      {
        id: 'room-3',
        name: 'Space Adventure',
        host_address: '0x789...ghi',
        theme: 'Space',
        max_players: 8,
        status: 'waiting',
        is_public: true,
        time_limit: 240,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participant_count: 5,
      },
      {
        id: 'room-4',
        name: 'Food Art Challenge',
        host_address: '0xabc...123',
        theme: 'Food',
        max_players: 5,
        status: 'waiting',
        is_public: true,
        time_limit: 120,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participant_count: 2,
      },
    ];
    
    setAvailableRooms(mockRooms);
  }, []);

  const handleJoinRoom = (roomId: string) => {
    setSelectedRoom(roomId);
    setLoading(true);
    
    // Find the room
    const room = availableRooms.find(r => r.id === roomId);
    if (room) {
      // Simulate a brief loading state for better UX
      setTimeout(() => {
        // Pass room data and navigate directly to the drawing/competition page
        onRoomSelected({
          id: room.id,
          name: room.name,
          theme: room.theme || "General",
          host: room.host_address
        });
        setLoading(false);
        setSelectedRoom(null);
      }, 500); // Half second delay for smooth transition
    } else {
      setLoading(false);
      setSelectedRoom(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "text-green-600 bg-green-100";
      case "starting": return "text-yellow-600 bg-yellow-100";
      case "in-progress": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting": return "Waiting for players";
      case "starting": return "Starting soon";
      case "in-progress": return "In progress";
      default: return "Unknown";
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 text-center py-4 border-b border-black bg-white">
        <h1 className="text-2xl font-bold text-blue-600">baselume</h1>
        {displayName && (
          <p className="text-sm text-blue-600 font-medium">{displayName}</p>
        )}
      </div>

      {/* Title */}
      <div className="flex-shrink-0 px-6 py-4 bg-blue-50 border-b border-blue-200">
        <h2 className="text-xl font-bold text-blue-600">Available Matches</h2>
        <p className="text-sm text-blue-600 mt-1">Choose a room to join and start competing</p>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {availableRooms.map((room) => (
            <div
              key={room.id}
              className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                selectedRoom === room.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-black bg-white hover:border-blue-300 hover:bg-blue-25'
              }`}
              onClick={() => setSelectedRoom(room.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-blue-600">{room.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                      {getStatusText(room.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-600">
                    <div>
                      <span className="font-medium text-blue-800">Host:</span>
                      <br />
                      <span className="text-blue-600">{room.host_address}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Players:</span>
                      <br />
                      <span className="text-blue-600">{room.participant_count || 0}/{room.max_players}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Theme:</span>
                      <br />
                      <span className="text-blue-600">{room.theme || 'General'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Time Limit:</span>
                      <br />
                      <span className="text-blue-600">{room.time_limit ? `${room.time_limit}s` : 'No limit'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJoinRoom(room.id);
                    }}
                    disabled={loading && selectedRoom === room.id}
                    className="px-6 py-2 bg-black text-white border border-black hover:bg-gray-800 disabled:opacity-50"
                  >
                    {loading && selectedRoom === room.id ? "Joining..." : "Join"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-6 bg-white border-t border-black">
        <div className="max-w-4xl mx-auto flex gap-4 justify-center">
          <Button 
            onClick={() => onNavigate("main-menu")}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Back to Menu
          </Button>
          
          <Button 
            onClick={() => onNavigate("create-room")}
            className="bg-black text-white hover:bg-gray-800"
          >
            Create New Room
          </Button>
        </div>
      </div>
    </div>
  );
}

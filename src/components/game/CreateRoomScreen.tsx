"use client";

import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { useAccount } from "wagmi";
import { useDatabase } from "~/hooks/useDatabase";

interface CreateRoomScreenProps {
  onNavigate: (screen: "main-menu" | "private-rooms" | "game-lobby") => void;
  onBack: () => void;
}

interface RoomFormData {
  name: string;
  theme: string;
  maxPlayers: number;
  timeLimit: number;
  isPublic: boolean;
}

const THEME_OPTIONS = [
  "Fantasy",
  "Animals", 
  "Nature",
  "Space",
  "Food",
  "Sports",
  "Vehicles",
  "Abstract",
  "Architecture",
  "Characters"
];

const TIME_LIMIT_OPTIONS = [
  { value: 60, label: "1 minute" },
  { value: 120, label: "2 minutes" },
  { value: 180, label: "3 minutes" },
  { value: 300, label: "5 minutes" },
  { value: 600, label: "10 minutes" }
];

const MAX_PLAYERS_OPTIONS = [2, 3, 4, 5, 6, 8, 10];

export function CreateRoomScreen({ onNavigate, onBack }: CreateRoomScreenProps) {
  const { address } = useAccount();
  const { createRoom, loading, error } = useDatabase();
  
  const [formData, setFormData] = useState<RoomFormData>({
    name: "",
    theme: "Fantasy",
    maxPlayers: 4,
    timeLimit: 180,
    isPublic: false
  });

  const [isCreating, setIsCreating] = useState(false);
  const [createdRoom, setCreatedRoom] = useState<{
    id: string;
    code: string;
    name: string;
  } | null>(null);

  const displayName = address 
    ? address.replace(/^0x/, '').slice(0, 8) + '.base.eth' 
    : '';

  const handleInputChange = (field: keyof RoomFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateRoom = async () => {
    if (!address || !formData.name.trim()) {
      alert('Please provide a room name');
      return;
    }

    setIsCreating(true);
    
    try {
      const roomData = {
        name: formData.name.trim(),
        host_address: address,
        theme: formData.theme,
        max_players: formData.maxPlayers,
        time_limit: formData.timeLimit,
        is_public: formData.isPublic,
        status: 'waiting' as const
      };

      const room = await createRoom(roomData);
      
      setCreatedRoom({
        id: room.id,
        code: room.code,
        name: room.name
      });
      
      // Copy room code to clipboard
      const roomLink = `${window.location.origin}/room/${room.code}`;
      navigator.clipboard.writeText(roomLink);
      
    } catch (err) {
      console.error('Failed to create room:', err);
      alert('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinCreatedRoom = () => {
    if (createdRoom) {
      // Navigate to game lobby
      onNavigate("game-lobby");
    }
  };

  if (createdRoom) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-8 bg-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">baselume</h1>
          <p className="text-sm text-blue-600">Room Created Successfully!</p>
          
          {displayName && (
            <p className="text-sm mt-4 text-blue-600 font-medium">{displayName}</p>
          )}
        </div>

        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-500 rounded-full mb-6 border-2 border-black flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="w-full max-w-md space-y-4">
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Room Details</h3>
            <p className="text-sm text-blue-700">
              <strong>Name:</strong> {createdRoom.name}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Code:</strong> {createdRoom.code}
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Room link copied to clipboard!
            </p>
          </div>
          
          <Button 
            onClick={handleJoinCreatedRoom}
            className="w-full bg-black text-white hover:bg-gray-800"
          >
            Enter Room
          </Button>

          <Button 
            onClick={() => {
              setCreatedRoom(null);
              setFormData({
                name: "",
                theme: "Fantasy",
                maxPlayers: 4,
                timeLimit: 180,
                isPublic: false
              });
            }}
            className="w-full bg-white text-blue-600 hover:bg-blue-50"
          >
            Create Another Room
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 text-center py-6 px-6 border-b border-black">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">baselume</h1>
        <p className="text-sm text-blue-600">Create New Room</p>
        
        {displayName && (
          <p className="text-sm mt-2 text-blue-600 font-medium">{displayName}</p>
        )}
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Room Name */}
          <div>
            <label className="block text-sm font-semibold text-blue-600 mb-2">
              Room Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter room name..."
              className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              maxLength={50}
            />
          </div>

          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-semibold text-blue-600 mb-2">
              Drawing Theme
            </label>
            <select
              value={formData.theme}
              onChange={(e) => handleInputChange('theme', e.target.value)}
              className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              {THEME_OPTIONS.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>

          {/* Max Players */}
          <div>
            <label className="block text-sm font-semibold text-blue-600 mb-2">
              Max Players
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MAX_PLAYERS_OPTIONS.map(count => (
                <button
                  key={count}
                  onClick={() => handleInputChange('maxPlayers', count)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                    formData.maxPlayers === count
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-blue-600 border-black hover:bg-blue-50'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-semibold text-blue-600 mb-2">
              Drawing Time Limit
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_LIMIT_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('timeLimit', option.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                    formData.timeLimit === option.value
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-blue-600 border-black hover:bg-blue-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Room Visibility */}
          <div>
            <label className="block text-sm font-semibold text-blue-600 mb-2">
              Room Visibility
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleInputChange('isPublic', false)}
                className={`px-4 py-3 text-sm font-medium rounded-lg border transition-all ${
                  !formData.isPublic
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-blue-600 border-black hover:bg-blue-50'
                }`}
              >
                Private
              </button>
              <button
                onClick={() => handleInputChange('isPublic', true)}
                className={`px-4 py-3 text-sm font-medium rounded-lg border transition-all ${
                  formData.isPublic
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-blue-600 border-black hover:bg-blue-50'
                }`}
              >
                Public
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {formData.isPublic 
                ? "Anyone can find and join your room"
                : "Only players with the room code can join"
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-6 bg-white border-t border-black">
        <div className="max-w-md mx-auto flex gap-3">
          <Button 
            onClick={onBack}
            className="flex-1 bg-white text-blue-600 hover:bg-blue-50"
          >
            Back
          </Button>
          
          <Button 
            onClick={handleCreateRoom}
            disabled={!formData.name.trim() || isCreating || loading}
            className="flex-1 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </div>
    </div>
  );
}
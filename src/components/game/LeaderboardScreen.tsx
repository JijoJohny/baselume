"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
import { useAccount } from "wagmi";
import { useContracts } from "~/hooks/useContractsSimple";
import { PlayerScore, DailyChampion } from "~/lib/contracts";

interface LeaderboardScreenProps {
  onNavigate: (screen: "main-menu") => void;
  onBack: () => void;
}

export function LeaderboardScreen({ onNavigate, onBack }: LeaderboardScreenProps) {
  const { address } = useAccount();
  const { 
    getTopPlayers, 
    getCurrentDay, 
    getDailyChampion,
    playerScore,
    dailyScore,
    isPlayerChampion,
    ownedNFTs,
    loading 
  } = useContracts();

  const [topPlayers, setTopPlayers] = useState<PlayerScore[]>([]);
  const [dailyChampion, setDailyChampion] = useState<DailyChampion | null>(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const displayName = address 
    ? address.replace(/^0x/, '').slice(0, 8) + '.base.eth' 
    : '';

  // Load leaderboard data
  const loadLeaderboardData = async () => {
    setRefreshing(true);
    
    try {
      const [players, day] = await Promise.all([
        getTopPlayers(10),
        getCurrentDay(),
      ]);
      
      setTopPlayers(players);
      setCurrentDay(day);
      
      // Get yesterday's champion (current day - 1)
      if (day > 0) {
        const champion = await getDailyChampion(day - 1);
        setDailyChampion(champion);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 text-center py-6 px-6 border-b border-black">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">baselume</h1>
        <p className="text-sm text-blue-600">Leaderboard & Champions</p>
        
        {displayName && (
          <p className="text-sm mt-2 text-blue-600 font-medium">{displayName}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Player Stats Card */}
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Your Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{playerScore}</div>
                <div className="text-sm text-blue-600">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{dailyScore}</div>
                <div className="text-sm text-blue-600">Today's Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black">{ownedNFTs.length}</div>
                <div className="text-sm text-blue-600">Champion NFTs</div>
              </div>
              <div className="text-center">
                <div className="text-xl">
                  {isPlayerChampion ? "🏆" : "🎨"}
                </div>
                <div className="text-sm text-blue-600">
                  {isPlayerChampion ? "Champion" : "Artist"}
                </div>
              </div>
            </div>
          </div>

          {/* Daily Champion Card */}
          {dailyChampion && dailyChampion.champion !== "0x0000000000000000000000000000000000000000" && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                🏆 Yesterday's Champion
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">
                    {formatAddress(dailyChampion.champion)}
                  </p>
                  <p className="text-sm text-orange-700">
                    Score: {dailyChampion.score} points
                  </p>
                  <p className="text-xs text-orange-600">
                    Day {dailyChampion.day} Champion
                  </p>
                </div>
                {dailyChampion.nftAwarded && (
                  <div className="text-right">
                    <div className="text-2xl">🎖️</div>
                    <div className="text-xs text-orange-600">NFT Awarded</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Top Players Leaderboard */}
          <div className="bg-white border border-black rounded-lg">
            <div className="px-4 py-3 border-b border-black bg-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-800">
                  🏁 Top Players (All Time)
                </h3>
                <Button
                  onClick={loadLeaderboardData}
                  disabled={refreshing}
                  className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {refreshing ? "..." : "↻"}
                </Button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {loading && topPlayers.length === 0 ? (
                <div className="p-8 text-center text-blue-600">
                  Loading leaderboard...
                </div>
              ) : topPlayers.length === 0 ? (
                <div className="p-8 text-center text-blue-600">
                  No players yet. Be the first to submit a drawing!
                </div>
              ) : (
                topPlayers.map((player, index) => {
                  const isCurrentUser = player.address.toLowerCase() === address?.toLowerCase();
                  
                  return (
                    <div
                      key={player.address}
                      className={`px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${
                        isCurrentUser ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-semibold text-black min-w-[3rem]">
                          {getRankEmoji(index + 1)}
                        </div>
                        <div>
                          <p className={`font-medium ${isCurrentUser ? 'text-blue-800' : 'text-black'}`}>
                            {formatAddress(player.address)}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-blue-600 font-normal">
                                (You)
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-blue-600">
                            {player.totalScore} total points
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-black">
                          {player.totalScore}
                        </div>
                        <div className="text-xs text-blue-600">points</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Daily Competition Info */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-300 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
              🎯 Daily Competition
            </h3>
            <p className="text-sm text-purple-700 mb-3">
              Compete daily for the Champion NFT! The player with the highest daily score wins.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-2 bg-white rounded border border-purple-200">
                <div className="text-lg font-bold text-black">{currentDay}</div>
                <div className="text-xs text-purple-600">Current Day</div>
              </div>
              <div className="text-center p-2 bg-white rounded border border-purple-200">
                <div className="text-lg font-bold text-black">{dailyScore}</div>
                <div className="text-xs text-purple-600">Your Daily Score</div>
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2 text-center">
              NFTs are awarded automatically at the end of each day
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-6 bg-white border-t border-black">
        <div className="max-w-4xl mx-auto flex gap-3 justify-center">
          <Button 
            onClick={onBack}
            className="flex-1 max-w-xs bg-white text-blue-600 hover:bg-blue-50"
          >
            Back
          </Button>
          
          <Button 
            onClick={() => onNavigate("main-menu")}
            className="flex-1 max-w-xs bg-black text-white hover:bg-gray-800"
          >
            Main Menu
          </Button>
        </div>
      </div>
    </div>
  );
}

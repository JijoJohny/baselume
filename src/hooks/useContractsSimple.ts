import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

export interface UseContractsReturn {
  // Loading states
  loading: boolean;
  recordingScore: boolean;
  mintingNFT: boolean;
  
  // Error states
  error: string | null;
  
  // Score functions
  recordScore: (score: number, gameId: string) => Promise<void>;
  
  // Data
  playerScore: number;
  dailyScore: number;
  isPlayerChampion: boolean;
  ownedNFTs: number[];
  
  // Refresh functions
  refreshPlayerData: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  
  // Placeholder functions
  getTotalScore: (address?: string) => Promise<number>;
  getDailyScore: (address?: string) => Promise<number>;
  getTopPlayers: (limit?: number) => Promise<any[]>;
  getCurrentDay: () => Promise<number>;
  getDailyStats: (day: number) => Promise<any>;
  mintDailyChampion: (day: number) => Promise<void>;
  getDailyChampion: (day: number) => Promise<any>;
  isChampion: (address?: string) => Promise<boolean>;
  getOwnedNFTs: (address?: string) => Promise<number[]>;
}

export function useContracts(): UseContractsReturn {
  const { address, isConnected } = useAccount();

  // State
  const [loading, setLoading] = useState(false);
  const [recordingScore, setRecordingScore] = useState(false);
  const [mintingNFT, setMintingNFT] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Player data
  const [playerScore, setPlayerScore] = useState(0);
  const [dailyScore, setDailyScore] = useState(0);
  const [isPlayerChampion, setIsPlayerChampion] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState<number[]>([]);

  // Clear error after delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Mock record score function (will be replaced with actual blockchain integration)
  const recordScore = useCallback(async (score: number, gameId: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setRecordingScore(true);
    setError(null);

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local state
      setPlayerScore(prev => prev + score);
      setDailyScore(prev => prev + score);
      
      console.log(`Mock: Recorded score ${score} for game ${gameId}`);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to record score';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setRecordingScore(false);
    }
  }, [address]);

  // Placeholder functions
  const getTotalScore = useCallback(async (targetAddress?: string): Promise<number> => {
    return playerScore;
  }, [playerScore]);

  const getDailyScore = useCallback(async (targetAddress?: string): Promise<number> => {
    return dailyScore;
  }, [dailyScore]);

  const getTopPlayers = useCallback(async (limit: number = 10) => {
    // Return mock data
    return [
      { address: address || '0x123...', totalScore: playerScore, rank: 1 }
    ];
  }, [address, playerScore]);

  const getCurrentDay = useCallback(async (): Promise<number> => {
    return Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  }, []);

  const getDailyStats = useCallback(async (day: number) => {
    return {
      day,
      totalGames: 1,
      totalScore: dailyScore,
      topPlayer: address || '0x000',
      topScore: dailyScore,
      nftAwarded: false,
    };
  }, [address, dailyScore]);

  const mintDailyChampion = useCallback(async (day: number) => {
    setMintingNFT(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setOwnedNFTs(prev => [...prev, day]);
      setIsPlayerChampion(true);
    } finally {
      setMintingNFT(false);
    }
  }, []);

  const getDailyChampion = useCallback(async (day: number) => {
    return {
      day,
      champion: address || '0x000',
      score: dailyScore,
      tokenId: day,
      nftAwarded: false,
    };
  }, [address, dailyScore]);

  const isChampion = useCallback(async (targetAddress?: string): Promise<boolean> => {
    return isPlayerChampion;
  }, [isPlayerChampion]);

  const getOwnedNFTs = useCallback(async (targetAddress?: string): Promise<number[]> => {
    return ownedNFTs;
  }, [ownedNFTs]);

  const refreshPlayerData = useCallback(async () => {
    setLoading(true);
    try {
      // Mock refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLeaderboard = useCallback(async () => {
    // Mock refresh
  }, []);

  // Initialize with mock data when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      setPlayerScore(42); // Mock initial score
      setDailyScore(8);   // Mock daily score
    } else {
      setPlayerScore(0);
      setDailyScore(0);
      setIsPlayerChampion(false);
      setOwnedNFTs([]);
    }
  }, [isConnected, address]);

  return {
    loading,
    recordingScore,
    mintingNFT,
    error,
    recordScore,
    getTotalScore,
    getDailyScore,
    getTopPlayers,
    getCurrentDay,
    getDailyStats,
    mintDailyChampion,
    getDailyChampion,
    isChampion,
    getOwnedNFTs,
    playerScore,
    dailyScore,
    isPlayerChampion,
    ownedNFTs,
    refreshPlayerData,
    refreshLeaderboard,
  };
}

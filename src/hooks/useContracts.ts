import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import { ethers } from 'ethers';
import { ContractService, createContractService, PlayerScore, DailyChampion, DailyStats } from '~/lib/contracts';

export interface UseContractsReturn {
  // Contract service
  contractService: ContractService | null;
  
  // Loading states
  loading: boolean;
  recordingScore: boolean;
  mintingNFT: boolean;
  
  // Error states
  error: string | null;
  
  // Score functions
  recordScore: (score: number, gameId: string) => Promise<void>;
  getTotalScore: (address?: string) => Promise<number>;
  getDailyScore: (address?: string) => Promise<number>;
  
  // Leaderboard functions
  getTopPlayers: (limit?: number) => Promise<PlayerScore[]>;
  getCurrentDay: () => Promise<number>;
  getDailyStats: (day: number) => Promise<DailyStats>;
  
  // NFT functions
  mintDailyChampion: (day: number) => Promise<void>;
  getDailyChampion: (day: number) => Promise<DailyChampion>;
  isChampion: (address?: string) => Promise<boolean>;
  getOwnedNFTs: (address?: string) => Promise<number[]>;
  
  // Data
  playerScore: number;
  dailyScore: number;
  isPlayerChampion: boolean;
  ownedNFTs: number[];
  
  // Refresh functions
  refreshPlayerData: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
}

export function useContracts(): UseContractsReturn {
  const { address, isConnected } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();

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

  // Contract service instance
  const contractService = useMemo(() => {
    if (!provider) return null;
    return createContractService(provider, signer || undefined);
  }, [provider, signer]);

  // Clear error after delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Record score on blockchain
  const recordScore = useCallback(async (score: number, gameId: string) => {
    if (!contractService || !address || !signer) {
      throw new Error('Wallet not connected or contract not available');
    }

    setRecordingScore(true);
    setError(null);

    try {
      const tx = await contractService.recordScore(address, score, gameId);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Refresh player data after successful transaction
        await refreshPlayerData();
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to record score';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setRecordingScore(false);
    }
  }, [contractService, address, signer]);

  // Get total score
  const getTotalScore = useCallback(async (targetAddress?: string): Promise<number> => {
    if (!contractService) return 0;
    
    const addressToCheck = targetAddress || address;
    if (!addressToCheck) return 0;

    try {
      return await contractService.getTotalScore(addressToCheck);
    } catch (err) {
      console.error('Error getting total score:', err);
      return 0;
    }
  }, [contractService, address]);

  // Get daily score
  const getDailyScore = useCallback(async (targetAddress?: string): Promise<number> => {
    if (!contractService) return 0;
    
    const addressToCheck = targetAddress || address;
    if (!addressToCheck) return 0;

    try {
      return await contractService.getDailyScore(addressToCheck);
    } catch (err) {
      console.error('Error getting daily score:', err);
      return 0;
    }
  }, [contractService, address]);

  // Get top players
  const getTopPlayers = useCallback(async (limit: number = 10): Promise<PlayerScore[]> => {
    if (!contractService) return [];

    try {
      return await contractService.getTopPlayers(limit);
    } catch (err) {
      console.error('Error getting top players:', err);
      return [];
    }
  }, [contractService]);

  // Get current day
  const getCurrentDay = useCallback(async (): Promise<number> => {
    if (!contractService) return 0;

    try {
      return await contractService.getCurrentDay();
    } catch (err) {
      console.error('Error getting current day:', err);
      return 0;
    }
  }, [contractService]);

  // Get daily stats
  const getDailyStats = useCallback(async (day: number): Promise<DailyStats> => {
    if (!contractService) {
      return {
        day,
        totalGames: 0,
        totalScore: 0,
        topPlayer: '',
        topScore: 0,
        nftAwarded: false,
      };
    }

    try {
      return await contractService.getDailyStats(day);
    } catch (err) {
      console.error('Error getting daily stats:', err);
      return {
        day,
        totalGames: 0,
        totalScore: 0,
        topPlayer: '',
        topScore: 0,
        nftAwarded: false,
      };
    }
  }, [contractService]);

  // Mint daily champion NFT
  const mintDailyChampion = useCallback(async (day: number) => {
    if (!contractService || !signer) {
      throw new Error('Wallet not connected or contract not available');
    }

    setMintingNFT(true);
    setError(null);

    try {
      const tx = await contractService.mintDailyChampion(day);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Refresh player data after successful mint
        await refreshPlayerData();
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      const errorMessage = err.reason || err.message || 'Failed to mint NFT';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setMintingNFT(false);
    }
  }, [contractService, signer]);

  // Get daily champion
  const getDailyChampion = useCallback(async (day: number): Promise<DailyChampion> => {
    if (!contractService) {
      return {
        day,
        champion: '',
        score: 0,
        tokenId: 0,
        nftAwarded: false,
      };
    }

    try {
      return await contractService.getDailyChampion(day);
    } catch (err) {
      console.error('Error getting daily champion:', err);
      return {
        day,
        champion: '',
        score: 0,
        tokenId: 0,
        nftAwarded: false,
      };
    }
  }, [contractService]);

  // Check if address is champion
  const isChampion = useCallback(async (targetAddress?: string): Promise<boolean> => {
    if (!contractService) return false;
    
    const addressToCheck = targetAddress || address;
    if (!addressToCheck) return false;

    try {
      return await contractService.isChampion(addressToCheck);
    } catch (err) {
      console.error('Error checking champion status:', err);
      return false;
    }
  }, [contractService, address]);

  // Get owned NFTs
  const getOwnedNFTs = useCallback(async (targetAddress?: string): Promise<number[]> => {
    if (!contractService) return [];
    
    const addressToCheck = targetAddress || address;
    if (!addressToCheck) return [];

    try {
      return await contractService.getOwnedNFTs(addressToCheck);
    } catch (err) {
      console.error('Error getting owned NFTs:', err);
      return [];
    }
  }, [contractService, address]);

  // Refresh player data
  const refreshPlayerData = useCallback(async () => {
    if (!address || !contractService) return;

    setLoading(true);
    
    try {
      const [totalScore, dailyScore, championStatus, nfts] = await Promise.all([
        getTotalScore(address),
        getDailyScore(address),
        isChampion(address),
        getOwnedNFTs(address),
      ]);

      setPlayerScore(totalScore);
      setDailyScore(dailyScore);
      setIsPlayerChampion(championStatus);
      setOwnedNFTs(nfts);
    } catch (err) {
      console.error('Error refreshing player data:', err);
    } finally {
      setLoading(false);
    }
  }, [address, contractService, getTotalScore, getDailyScore, isChampion, getOwnedNFTs]);

  // Refresh leaderboard (placeholder for future implementation)
  const refreshLeaderboard = useCallback(async () => {
    // This could trigger a re-fetch of leaderboard data
    // For now, it's a placeholder
  }, []);

  // Load initial data when wallet connects
  useEffect(() => {
    if (isConnected && address && contractService) {
      refreshPlayerData();
    } else {
      // Reset data when disconnected
      setPlayerScore(0);
      setDailyScore(0);
      setIsPlayerChampion(false);
      setOwnedNFTs([]);
    }
  }, [isConnected, address, contractService, refreshPlayerData]);

  // Set up event listeners
  useEffect(() => {
    if (!contractService || !address) return;

    // Listen for score recorded events
    contractService.onScoreRecorded((player, score, timestamp, gameId) => {
      if (player.toLowerCase() === address.toLowerCase()) {
        // Refresh data when user's score is recorded
        refreshPlayerData();
      }
    });

    // Listen for daily champion minted events
    contractService.onDailyChampionMinted((winner, tokenId, day, score) => {
      if (winner.toLowerCase() === address.toLowerCase()) {
        // Refresh data when user wins daily champion
        refreshPlayerData();
      }
    });

    // Cleanup listeners on unmount
    return () => {
      contractService.removeAllListeners();
    };
  }, [contractService, address, refreshPlayerData]);

  return {
    contractService,
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

import { ethers } from 'ethers';
import { base, baseSepolia } from 'wagmi/chains';

// Contract addresses (will be populated after deployment)
export const CONTRACT_ADDRESSES = {
  SCORE_TRACKER: process.env.NEXT_PUBLIC_SCORE_TRACKER_ADDRESS || '',
  DAILY_CHAMPION_NFT: process.env.NEXT_PUBLIC_DAILY_CHAMPION_NFT_ADDRESS || '',
} as const;

// Contract ABIs (simplified versions for frontend use)
export const SCORE_TRACKER_ABI = [
  "function recordScore(address _player, uint256 _score, string memory _gameId) external",
  "function getTotalScore(address _player) external view returns (uint256)",
  "function getDailyScore(address _player) external view returns (uint256)",
  "function getDailyWinner(uint256 _day) external view returns (address, uint256)",
  "function getTopPlayers(uint256 _limit) external view returns (address[] memory, uint256[] memory)",
  "function getCurrentDay() external view returns (uint256)",
  "function getDailyStats(uint256 _day) external view returns (uint256, uint256, address, uint256, bool)",
  "function getTotalPlayers() external view returns (uint256)",
  "event ScoreRecorded(address indexed player, uint256 score, uint256 timestamp, string gameId)",
  "event DailyWinnerDeclared(address indexed winner, uint256 day, uint256 totalScore)"
] as const;

export const DAILY_CHAMPION_NFT_ABI = [
  "function mintDailyChampion(uint256 _day) external",
  "function getDailyChampion(uint256 _day) external view returns (address, uint256, uint256)",
  "function getTokenDetails(uint256 _tokenId) external view returns (uint256, address, uint256, string memory)",
  "function getChampionsInRange(uint256 _startDay, uint256 _endDay) external view returns (uint256[] memory, address[] memory, uint256[] memory, uint256[] memory)",
  "function isChampion(address _user) external view returns (bool)",
  "function getOwnedTokens(address _owner) external view returns (uint256[] memory)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function totalSupply() external view returns (uint256)",
  "event DailyChampionMinted(address indexed winner, uint256 indexed tokenId, uint256 day, uint256 score)"
] as const;

// Network configuration
export const SUPPORTED_CHAINS = {
  [baseSepolia.id]: {
    name: 'Base Sepolia Testnet',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [base.id]: {
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
} as const;

// Types
export interface PlayerScore {
  address: string;
  totalScore: number;
  dailyScore: number;
  rank: number;
}

export interface DailyChampion {
  day: number;
  champion: string;
  score: number;
  tokenId: number;
  nftAwarded: boolean;
}

export interface DailyStats {
  day: number;
  totalGames: number;
  totalScore: number;
  topPlayer: string;
  topScore: number;
  nftAwarded: boolean;
}

export interface ContractError extends Error {
  code?: string;
  reason?: string;
  transaction?: any;
}

// Contract interaction utilities
export class ContractService {
  private provider: ethers.providers.Provider;
  private signer: ethers.Signer | null = null;
  private scoreTrackerContract: ethers.Contract | null = null;
  private nftContract: ethers.Contract | null = null;

  constructor(provider: ethers.providers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer || null;
    this.initializeContracts();
  }

  private initializeContracts() {
    if (!CONTRACT_ADDRESSES.SCORE_TRACKER || !CONTRACT_ADDRESSES.DAILY_CHAMPION_NFT) {
      console.warn('Contract addresses not configured');
      return;
    }

    try {
      this.scoreTrackerContract = new ethers.Contract(
        CONTRACT_ADDRESSES.SCORE_TRACKER,
        SCORE_TRACKER_ABI,
        this.signer || this.provider
      );

      this.nftContract = new ethers.Contract(
        CONTRACT_ADDRESSES.DAILY_CHAMPION_NFT,
        DAILY_CHAMPION_NFT_ABI,
        this.signer || this.provider
      );
    } catch (error) {
      console.error('Failed to initialize contracts:', error);
    }
  }

  // Score Tracker Functions
  async recordScore(playerAddress: string, score: number, gameId: string): Promise<ethers.ContractTransaction> {
    if (!this.scoreTrackerContract || !this.signer) {
      throw new Error('Contract not initialized or no signer available');
    }

    try {
      const tx = await this.scoreTrackerContract.recordScore(playerAddress, score, gameId);
      return tx;
    } catch (error) {
      throw this.handleContractError(error, 'Failed to record score');
    }
  }

  async getTotalScore(playerAddress: string): Promise<number> {
    if (!this.scoreTrackerContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const score = await this.scoreTrackerContract.getTotalScore(playerAddress);
      return score.toNumber();
    } catch (error) {
      console.error('Error getting total score:', error);
      return 0;
    }
  }

  async getDailyScore(playerAddress: string): Promise<number> {
    if (!this.scoreTrackerContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const score = await this.scoreTrackerContract.getDailyScore(playerAddress);
      return score.toNumber();
    } catch (error) {
      console.error('Error getting daily score:', error);
      return 0;
    }
  }

  async getTopPlayers(limit: number = 10): Promise<PlayerScore[]> {
    if (!this.scoreTrackerContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [addresses, scores] = await this.scoreTrackerContract.getTopPlayers(limit);
      
      return addresses.map((address: string, index: number) => ({
        address,
        totalScore: scores[index].toNumber(),
        dailyScore: 0, // Will be fetched separately if needed
        rank: index + 1,
      }));
    } catch (error) {
      console.error('Error getting top players:', error);
      return [];
    }
  }

  async getCurrentDay(): Promise<number> {
    if (!this.scoreTrackerContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const day = await this.scoreTrackerContract.getCurrentDay();
      return day.toNumber();
    } catch (error) {
      console.error('Error getting current day:', error);
      return 0;
    }
  }

  async getDailyStats(day: number): Promise<DailyStats> {
    if (!this.scoreTrackerContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [totalGames, totalScore, topPlayer, topScore, nftAwarded] = 
        await this.scoreTrackerContract.getDailyStats(day);

      return {
        day,
        totalGames: totalGames.toNumber(),
        totalScore: totalScore.toNumber(),
        topPlayer,
        topScore: topScore.toNumber(),
        nftAwarded,
      };
    } catch (error) {
      console.error('Error getting daily stats:', error);
      return {
        day,
        totalGames: 0,
        totalScore: 0,
        topPlayer: '0x0000000000000000000000000000000000000000',
        topScore: 0,
        nftAwarded: false,
      };
    }
  }

  // NFT Functions
  async mintDailyChampion(day: number): Promise<ethers.ContractTransaction> {
    if (!this.nftContract || !this.signer) {
      throw new Error('NFT contract not initialized or no signer available');
    }

    try {
      const tx = await this.nftContract.mintDailyChampion(day);
      return tx;
    } catch (error) {
      throw this.handleContractError(error, 'Failed to mint daily champion NFT');
    }
  }

  async getDailyChampion(day: number): Promise<DailyChampion> {
    if (!this.nftContract) {
      throw new Error('NFT contract not initialized');
    }

    try {
      const [champion, score, tokenId] = await this.nftContract.getDailyChampion(day);
      
      return {
        day,
        champion,
        score: score.toNumber(),
        tokenId: tokenId.toNumber(),
        nftAwarded: tokenId.toNumber() > 0,
      };
    } catch (error) {
      console.error('Error getting daily champion:', error);
      return {
        day,
        champion: '0x0000000000000000000000000000000000000000',
        score: 0,
        tokenId: 0,
        nftAwarded: false,
      };
    }
  }

  async isChampion(userAddress: string): Promise<boolean> {
    if (!this.nftContract) {
      throw new Error('NFT contract not initialized');
    }

    try {
      return await this.nftContract.isChampion(userAddress);
    } catch (error) {
      console.error('Error checking champion status:', error);
      return false;
    }
  }

  async getOwnedNFTs(userAddress: string): Promise<number[]> {
    if (!this.nftContract) {
      throw new Error('NFT contract not initialized');
    }

    try {
      const tokens = await this.nftContract.getOwnedTokens(userAddress);
      return tokens.map((token: ethers.BigNumber) => token.toNumber());
    } catch (error) {
      console.error('Error getting owned NFTs:', error);
      return [];
    }
  }

  // Utility Functions
  private handleContractError(error: any, defaultMessage: string): ContractError {
    const contractError = new Error(defaultMessage) as ContractError;
    
    if (error.reason) {
      contractError.reason = error.reason;
      contractError.message = error.reason;
    }
    
    if (error.code) {
      contractError.code = error.code;
    }
    
    if (error.transaction) {
      contractError.transaction = error.transaction;
    }
    
    return contractError;
  }

  // Event Listeners
  onScoreRecorded(callback: (player: string, score: number, timestamp: number, gameId: string) => void) {
    if (!this.scoreTrackerContract) return;

    this.scoreTrackerContract.on('ScoreRecorded', (player, score, timestamp, gameId) => {
      callback(player, score.toNumber(), timestamp.toNumber(), gameId);
    });
  }

  onDailyChampionMinted(callback: (winner: string, tokenId: number, day: number, score: number) => void) {
    if (!this.nftContract) return;

    this.nftContract.on('DailyChampionMinted', (winner, tokenId, day, score) => {
      callback(winner, tokenId.toNumber(), day.toNumber(), score.toNumber());
    });
  }

  // Cleanup
  removeAllListeners() {
    this.scoreTrackerContract?.removeAllListeners();
    this.nftContract?.removeAllListeners();
  }
}

// Helper function to create contract service instance
export function createContractService(
  provider: ethers.providers.Provider,
  signer?: ethers.Signer
): ContractService {
  return new ContractService(provider, signer);
}

// Validation helpers
export function isValidScore(score: number): boolean {
  return score >= 1 && score <= 10;
}

export function isValidGameId(gameId: string): boolean {
  return gameId.length > 0 && gameId.length <= 100;
}

export function formatScore(score: number): string {
  return score.toLocaleString();
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

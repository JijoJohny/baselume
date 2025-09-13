// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ScoreTracker
 * @dev Tracks player scores and manages daily leaderboards for baselume
 */
contract ScoreTracker is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Events
    event ScoreRecorded(address indexed player, uint256 score, uint256 timestamp, string gameId);
    event DailyWinnerDeclared(address indexed winner, uint256 day, uint256 totalScore);
    event ScoreContractUpdated(address indexed newContract);

    // Structs
    struct PlayerScore {
        address player;
        uint256 score;
        uint256 timestamp;
        string gameId;
    }

    struct DailyStats {
        uint256 totalGames;
        uint256 totalScore;
        address topPlayer;
        uint256 topScore;
        bool nftAwarded;
    }

    // State variables
    mapping(address => uint256) public totalScores;
    mapping(address => uint256) public dailyScores;
    mapping(uint256 => DailyStats) public dailyStats; // day => stats
    mapping(uint256 => PlayerScore[]) public dailyScores; // day => scores
    mapping(address => uint256) public lastPlayedDay;
    mapping(string => bool) public gameIdUsed; // Prevent duplicate submissions
    
    address[] public allPlayers;
    mapping(address => bool) public isPlayer;
    
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public deploymentTimestamp;
    
    // NFT contract address
    address public nftContract;
    
    modifier validScore(uint256 _score) {
        require(_score >= 1 && _score <= 10, "Score must be between 1 and 10");
        _;
    }
    
    modifier onlyNFTContract() {
        require(msg.sender == nftContract, "Only NFT contract can call this");
        _;
    }

    constructor() {
        deploymentTimestamp = block.timestamp;
    }

    /**
     * @dev Set the NFT contract address (only owner)
     */
    function setNFTContract(address _nftContract) external onlyOwner {
        nftContract = _nftContract;
        emit ScoreContractUpdated(_nftContract);
    }

    /**
     * @dev Get current day number since deployment
     */
    function getCurrentDay() public view returns (uint256) {
        return (block.timestamp - deploymentTimestamp) / SECONDS_PER_DAY;
    }

    /**
     * @dev Record a player's score for a game
     */
    function recordScore(
        address _player, 
        uint256 _score, 
        string memory _gameId
    ) external validScore(_score) nonReentrant {
        require(_player != address(0), "Invalid player address");
        require(bytes(_gameId).length > 0, "Game ID required");
        require(!gameIdUsed[_gameId], "Game ID already used");
        
        // Mark game ID as used to prevent duplicate submissions
        gameIdUsed[_gameId] = true;
        
        uint256 currentDay = getCurrentDay();
        
        // Add player to registry if new
        if (!isPlayer[_player]) {
            isPlayer[_player] = true;
            allPlayers.push(_player);
        }
        
        // Reset daily score if it's a new day for this player
        if (lastPlayedDay[_player] != currentDay) {
            dailyScores[_player] = 0;
            lastPlayedDay[_player] = currentDay;
        }
        
        // Update scores
        totalScores[_player] += _score;
        dailyScores[_player] += _score;
        
        // Update daily stats
        DailyStats storage dayStats = dailyStats[currentDay];
        dayStats.totalGames++;
        dayStats.totalScore += _score;
        
        // Check if this is the new daily leader
        if (dailyScores[_player] > dayStats.topScore) {
            dayStats.topPlayer = _player;
            dayStats.topScore = dailyScores[_player];
        }
        
        // Record the score entry
        dailyScores[currentDay].push(PlayerScore({
            player: _player,
            score: _score,
            timestamp: block.timestamp,
            gameId: _gameId
        }));
        
        emit ScoreRecorded(_player, _score, block.timestamp, _gameId);
    }

    /**
     * @dev Get player's total score
     */
    function getTotalScore(address _player) external view returns (uint256) {
        return totalScores[_player];
    }

    /**
     * @dev Get player's daily score
     */
    function getDailyScore(address _player) external view returns (uint256) {
        uint256 currentDay = getCurrentDay();
        if (lastPlayedDay[_player] != currentDay) {
            return 0;
        }
        return dailyScores[_player];
    }

    /**
     * @dev Get daily winner for a specific day
     */
    function getDailyWinner(uint256 _day) external view returns (address, uint256) {
        DailyStats memory stats = dailyStats[_day];
        return (stats.topPlayer, stats.topScore);
    }

    /**
     * @dev Get top players by total score (leaderboard)
     */
    function getTopPlayers(uint256 _limit) external view returns (address[] memory, uint256[] memory) {
        require(_limit > 0 && _limit <= 100, "Limit must be between 1 and 100");
        
        uint256 playerCount = allPlayers.length;
        if (playerCount == 0) {
            return (new address[](0), new uint256[](0));
        }
        
        uint256 limit = _limit > playerCount ? playerCount : _limit;
        
        // Create arrays for sorting
        address[] memory players = new address[](playerCount);
        uint256[] memory scores = new uint256[](playerCount);
        
        for (uint256 i = 0; i < playerCount; i++) {
            players[i] = allPlayers[i];
            scores[i] = totalScores[allPlayers[i]];
        }
        
        // Simple bubble sort (inefficient but works for small datasets)
        for (uint256 i = 0; i < playerCount - 1; i++) {
            for (uint256 j = 0; j < playerCount - i - 1; j++) {
                if (scores[j] < scores[j + 1]) {
                    // Swap scores
                    uint256 tempScore = scores[j];
                    scores[j] = scores[j + 1];
                    scores[j + 1] = tempScore;
                    
                    // Swap players
                    address tempPlayer = players[j];
                    players[j] = players[j + 1];
                    players[j + 1] = tempPlayer;
                }
            }
        }
        
        // Return top players
        address[] memory topPlayers = new address[](limit);
        uint256[] memory topScores = new uint256[](limit);
        
        for (uint256 i = 0; i < limit; i++) {
            topPlayers[i] = players[i];
            topScores[i] = scores[i];
        }
        
        return (topPlayers, topScores);
    }

    /**
     * @dev Mark daily NFT as awarded (called by NFT contract)
     */
    function markDailyNFTAwarded(uint256 _day) external onlyNFTContract {
        dailyStats[_day].nftAwarded = true;
        address winner = dailyStats[_day].topPlayer;
        uint256 score = dailyStats[_day].topScore;
        emit DailyWinnerDeclared(winner, _day, score);
    }

    /**
     * @dev Check if daily NFT has been awarded for a day
     */
    function isDailyNFTAwarded(uint256 _day) external view returns (bool) {
        return dailyStats[_day].nftAwarded;
    }

    /**
     * @dev Get daily stats for a specific day
     */
    function getDailyStats(uint256 _day) external view returns (
        uint256 totalGames,
        uint256 totalScore,
        address topPlayer,
        uint256 topScore,
        bool nftAwarded
    ) {
        DailyStats memory stats = dailyStats[_day];
        return (
            stats.totalGames,
            stats.totalScore,
            stats.topPlayer,
            stats.topScore,
            stats.nftAwarded
        );
    }

    /**
     * @dev Get total number of players
     */
    function getTotalPlayers() external view returns (uint256) {
        return allPlayers.length;
    }

    /**
     * @dev Emergency function to update scores (only owner)
     */
    function emergencyUpdateScore(address _player, uint256 _newScore) external onlyOwner {
        totalScores[_player] = _newScore;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface IScoreTracker {
    function getDailyWinner(uint256 _day) external view returns (address, uint256);
    function isDailyNFTAwarded(uint256 _day) external view returns (bool);
    function markDailyNFTAwarded(uint256 _day) external;
    function getCurrentDay() external view returns (uint256);
}

/**
 * @title DailyChampionNFT
 * @dev NFT contract for daily baselume champions
 */
contract DailyChampionNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;

    // Events
    event DailyChampionMinted(address indexed winner, uint256 indexed tokenId, uint256 day, uint256 score);
    event BaseURIUpdated(string newBaseURI);
    event ScoreTrackerUpdated(address indexed newTracker);

    // State variables
    Counters.Counter private _tokenIdCounter;
    IScoreTracker public scoreTracker;
    
    string private _baseTokenURI;
    mapping(uint256 => uint256) public tokenToDay; // tokenId => day
    mapping(uint256 => uint256) public dayToToken; // day => tokenId
    mapping(uint256 => address) public dailyChampions; // day => champion address
    mapping(uint256 => uint256) public dailyScores; // day => winning score
    
    // Constants
    uint256 public constant GRACE_PERIOD = 3600; // 1 hour grace period after day ends

    constructor(
        address _scoreTracker,
        string memory _initialBaseURI
    ) ERC721("Baselume Daily Champion", "BDC") {
        scoreTracker = IScoreTracker(_scoreTracker);
        _baseTokenURI = _initialBaseURI;
    }

    /**
     * @dev Set the score tracker contract address
     */
    function setScoreTracker(address _scoreTracker) external onlyOwner {
        scoreTracker = IScoreTracker(_scoreTracker);
        emit ScoreTrackerUpdated(_scoreTracker);
    }

    /**
     * @dev Set base URI for token metadata
     */
    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        _baseTokenURI = _newBaseURI;
        emit BaseURIUpdated(_newBaseURI);
    }

    /**
     * @dev Get base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Mint daily champion NFT for a specific day
     */
    function mintDailyChampion(uint256 _day) external nonReentrant {
        require(address(scoreTracker) != address(0), "Score tracker not set");
        
        uint256 currentDay = scoreTracker.getCurrentDay();
        require(_day < currentDay || 
                (_day == currentDay && block.timestamp >= getEndOfDay(_day) + GRACE_PERIOD), 
                "Day not yet complete or grace period not passed");
        
        require(!scoreTracker.isDailyNFTAwarded(_day), "NFT already awarded for this day");
        
        (address winner, uint256 winningScore) = scoreTracker.getDailyWinner(_day);
        require(winner != address(0), "No winner for this day");
        require(winningScore > 0, "Winner must have a positive score");
        
        // Transfer existing NFT if someone else has it
        uint256 existingTokenId = dayToToken[_day];
        if (existingTokenId > 0 && _exists(existingTokenId)) {
            address currentHolder = ownerOf(existingTokenId);
            if (currentHolder != winner) {
                _transfer(currentHolder, winner, existingTokenId);
            }
        } else {
            // Mint new NFT
            _tokenIdCounter.increment();
            uint256 newTokenId = _tokenIdCounter.current();
            
            _safeMint(winner, newTokenId);
            _setTokenURI(newTokenId, generateTokenURI(_day, winner, winningScore));
            
            tokenToDay[newTokenId] = _day;
            dayToToken[_day] = newTokenId;
        }
        
        // Record champion data
        dailyChampions[_day] = winner;
        dailyScores[_day] = winningScore;
        
        // Mark as awarded in score tracker
        scoreTracker.markDailyNFTAwarded(_day);
        
        uint256 tokenId = dayToToken[_day];
        emit DailyChampionMinted(winner, tokenId, _day, winningScore);
    }

    /**
     * @dev Batch mint for multiple days (owner only, for initial setup)
     */
    function batchMintDailyChampions(uint256[] memory _days) external onlyOwner {
        for (uint256 i = 0; i < _days.length; i++) {
            uint256 day = _days[i];
            if (!scoreTracker.isDailyNFTAwarded(day)) {
                (address winner, uint256 winningScore) = scoreTracker.getDailyWinner(day);
                if (winner != address(0) && winningScore > 0) {
                    // Internal mint without external checks
                    _tokenIdCounter.increment();
                    uint256 newTokenId = _tokenIdCounter.current();
                    
                    _safeMint(winner, newTokenId);
                    _setTokenURI(newTokenId, generateTokenURI(day, winner, winningScore));
                    
                    tokenToDay[newTokenId] = day;
                    dayToToken[day] = newTokenId;
                    dailyChampions[day] = winner;
                    dailyScores[day] = winningScore;
                    
                    scoreTracker.markDailyNFTAwarded(day);
                    emit DailyChampionMinted(winner, newTokenId, day, winningScore);
                }
            }
        }
    }

    /**
     * @dev Generate token URI with metadata
     */
    function generateTokenURI(
        uint256 _day, 
        address _champion, 
        uint256 _score
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            _day.toString(),
            ".json?champion=",
            Strings.toHexString(uint160(_champion), 20),
            "&score=",
            _score.toString()
        ));
    }

    /**
     * @dev Get end of day timestamp
     */
    function getEndOfDay(uint256 _day) internal pure returns (uint256) {
        return (_day + 1) * 86400; // Assuming day 0 starts at timestamp 0
    }

    /**
     * @dev Get champion for a specific day
     */
    function getDailyChampion(uint256 _day) external view returns (address champion, uint256 score, uint256 tokenId) {
        return (dailyChampions[_day], dailyScores[_day], dayToToken[_day]);
    }

    /**
     * @dev Get NFT details by token ID
     */
    function getTokenDetails(uint256 _tokenId) external view returns (
        uint256 day,
        address champion,
        uint256 score,
        string memory uri
    ) {
        require(_exists(_tokenId), "Token does not exist");
        
        day = tokenToDay[_tokenId];
        champion = dailyChampions[day];
        score = dailyScores[day];
        uri = tokenURI(_tokenId);
    }

    /**
     * @dev Get all champions for a date range
     */
    function getChampionsInRange(
        uint256 _startDay, 
        uint256 _endDay
    ) external view returns (
        uint256[] memory days,
        address[] memory champions,
        uint256[] memory scores,
        uint256[] memory tokenIds
    ) {
        require(_startDay <= _endDay, "Invalid date range");
        uint256 rangeSize = _endDay - _startDay + 1;
        
        days = new uint256[](rangeSize);
        champions = new address[](rangeSize);
        scores = new uint256[](rangeSize);
        tokenIds = new uint256[](rangeSize);
        
        for (uint256 i = 0; i < rangeSize; i++) {
            uint256 day = _startDay + i;
            days[i] = day;
            champions[i] = dailyChampions[day];
            scores[i] = dailyScores[day];
            tokenIds[i] = dayToToken[day];
        }
    }

    /**
     * @dev Check if an address holds any champion NFT
     */
    function isChampion(address _user) external view returns (bool) {
        return balanceOf(_user) > 0;
    }

    /**
     * @dev Get all NFTs owned by an address
     */
    function getOwnedTokens(address _owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(_owner);
        uint256[] memory tokens = new uint256[](balance);
        
        uint256 currentIndex = 0;
        uint256 totalSupply = _tokenIdCounter.current();
        
        for (uint256 i = 1; i <= totalSupply && currentIndex < balance; i++) {
            if (_exists(i) && ownerOf(i) == _owner) {
                tokens[currentIndex] = i;
                currentIndex++;
            }
        }
        
        return tokens;
    }

    /**
     * @dev Override required by Solidity
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev Override required by Solidity
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Emergency function to transfer NFT (owner only)
     */
    function emergencyTransfer(uint256 _tokenId, address _to) external onlyOwner {
        require(_exists(_tokenId), "Token does not exist");
        address currentOwner = ownerOf(_tokenId);
        _transfer(currentOwner, _to, _tokenId);
    }
}

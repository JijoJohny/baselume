# 🏗️ Blockchain Setup Guide - Base Testnet Integration

This guide will help you deploy the baselume smart contracts to Base testnet and integrate on-chain scoring with daily NFT rewards.

## 📋 Prerequisites

1. **Wallet Setup**:
   - MetaMask or compatible wallet
   - Base Sepolia testnet added to wallet
   - Test ETH from Base Sepolia faucet

2. **Development Tools**:
   - Node.js 16+ installed
   - Git installed
   - Code editor (VS Code recommended)

## 🔧 Environment Setup

### 1. Add Base Sepolia to MetaMask

- **Network Name**: Base Sepolia
- **RPC URL**: `https://sepolia.base.org`
- **Chain ID**: `84532`
- **Currency Symbol**: `ETH`
- **Block Explorer**: `https://sepolia.basescan.org`

### 2. Get Test ETH

Visit the Base Sepolia faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### 3. Environment Variables

Add these to your `.env.local` file:

```bash
# Blockchain Configuration
PRIVATE_KEY=your_wallet_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here

# Contract Addresses (will be populated after deployment)
NEXT_PUBLIC_SCORE_TRACKER_ADDRESS=
NEXT_PUBLIC_DAILY_CHAMPION_NFT_ADDRESS=
NEXT_PUBLIC_DEPLOYER_ADDRESS=

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_CHAIN_NAME=Base Sepolia Testnet
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

## 🚀 Smart Contract Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Compile Contracts

```bash
npx hardhat compile
```

### 3. Deploy to Base Sepolia

```bash
npx hardhat run contracts/deploy.js --network base-sepolia
```

### 4. Update Environment Variables

After successful deployment, copy the contract addresses from the deployment output and update your `.env.local` file:

```bash
NEXT_PUBLIC_SCORE_TRACKER_ADDRESS=0x...
NEXT_PUBLIC_DAILY_CHAMPION_NFT_ADDRESS=0x...
NEXT_PUBLIC_DEPLOYER_ADDRESS=0x...
```

### 5. Verify Contracts (Optional)

```bash
npx hardhat verify --network base-sepolia SCORE_TRACKER_ADDRESS
npx hardhat verify --network base-sepolia DAILY_CHAMPION_NFT_ADDRESS SCORE_TRACKER_ADDRESS "https://api.baselume.xyz/nft/metadata/"
```

## 📊 Smart Contract Features

### ScoreTracker Contract

**Functions:**
- `recordScore(address player, uint256 score, string gameId)` - Record player score
- `getTotalScore(address player)` - Get player's total score
- `getDailyScore(address player)` - Get player's daily score
- `getTopPlayers(uint256 limit)` - Get leaderboard
- `getCurrentDay()` - Get current day number
- `getDailyStats(uint256 day)` - Get daily statistics

**Events:**
- `ScoreRecorded(address player, uint256 score, uint256 timestamp, string gameId)`
- `DailyWinnerDeclared(address winner, uint256 day, uint256 totalScore)`

### DailyChampionNFT Contract

**Functions:**
- `mintDailyChampion(uint256 day)` - Mint NFT for daily winner
- `getDailyChampion(uint256 day)` - Get day's champion info
- `isChampion(address user)` - Check if user owns champion NFT
- `getOwnedTokens(address owner)` - Get user's NFTs

**Events:**
- `DailyChampionMinted(address winner, uint256 tokenId, uint256 day, uint256 score)`

## 🎮 Game Integration

### Score Recording Flow

1. **Player submits drawing** → AI analyzes and scores (1-10)
2. **Score recorded on blockchain** → `ScoreTracker.recordScore()` called
3. **Transaction confirmed** → Player's total and daily scores updated
4. **Leaderboard updated** → Real-time ranking changes

### Daily NFT Distribution

1. **End of day** → System identifies daily winner
2. **NFT minting** → `DailyChampionNFT.mintDailyChampion()` called
3. **NFT transfer** → Champion receives unique daily NFT
4. **Circulation** → If someone else wins next day, NFT transfers

## 🏆 Leaderboard System

### Total Score Leaderboard
- Tracks all-time scores across all players
- Updates in real-time with each submission
- Displays top 10 players with ranks

### Daily Competition
- Resets every 24 hours (based on block timestamp)
- Winner gets exclusive NFT for that day
- NFT is transferable if someone else wins later

### Champion Status
- Players with NFTs show special champion badge
- NFT metadata includes day, score, and champion info
- Viewable on OpenSea and other NFT marketplaces

## 🔍 Testing & Verification

### 1. Test Score Recording

```bash
node scripts/test-contracts.js
```

### 2. Verify on BaseScan

- Visit `https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS`
- Check transaction history
- Verify contract code

### 3. Test Frontend Integration

1. Connect wallet to Base Sepolia
2. Submit a drawing
3. Confirm transaction in MetaMask
4. Check leaderboard for updated scores

## 📈 Gas Optimization

### Estimated Gas Costs (Base Sepolia)

- **Record Score**: ~50,000 gas (~$0.01)
- **Mint Daily NFT**: ~150,000 gas (~$0.03)
- **View Functions**: Free (read-only)

### Optimization Features

- Efficient sorting algorithms
- Batch operations support
- Event-based updates
- Minimal storage usage

## 🛠️ Troubleshooting

### Common Issues

1. **"Insufficient funds"**: Get more test ETH from faucet
2. **"Transaction reverted"**: Check score is between 1-10
3. **"Game ID already used"**: Use unique game IDs
4. **"NFT already awarded"**: Day's NFT already minted

### Debug Commands

```bash
# Check contract status
npx hardhat console --network base-sepolia

# View transaction details
npx hardhat run scripts/debug-transaction.js --network base-sepolia
```

## 🌟 Advanced Features

### Automated Daily NFT Distribution

Set up a cron job or GitHub Action to automatically mint daily NFTs:

```javascript
// Auto-mint script (run daily)
const mintDailyChampion = async () => {
  const currentDay = await scoreTracker.getCurrentDay();
  const yesterday = currentDay - 1;
  
  if (!await nftContract.isDailyNFTAwarded(yesterday)) {
    await nftContract.mintDailyChampion(yesterday);
  }
};
```

### NFT Metadata API

Create an API endpoint to serve dynamic NFT metadata:

```javascript
// /api/nft/metadata/[day].json
{
  "name": "Baselume Daily Champion - Day 42",
  "description": "Daily champion NFT for the baselume drawing competition",
  "image": "https://api.baselume.xyz/nft/image/42",
  "attributes": [
    {"trait_type": "Day", "value": 42},
    {"trait_type": "Score", "value": 9},
    {"trait_type": "Champion", "value": "0x123...789"}
  ]
}
```

## 🎯 Success Metrics

After deployment, monitor:

- **Daily Active Players**: Unique addresses submitting scores
- **Total Transactions**: Score recordings per day
- **NFT Distribution**: Daily champion NFTs minted
- **Leaderboard Engagement**: Leaderboard page visits
- **Gas Usage**: Total gas spent on transactions

## 📞 Support

If you encounter issues:

1. Check the [Hardhat documentation](https://hardhat.org/docs)
2. Visit [Base developer docs](https://docs.base.org)
3. Join the Base Discord for support
4. Check BaseScan for transaction details

---

🎉 **Congratulations!** You now have a fully functional on-chain scoring system with daily NFT rewards on Base testnet!

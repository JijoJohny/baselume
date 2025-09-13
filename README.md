# 🎨 **Baselume** - Competitive AI-Powered Drawing Platform on Base

> *Where creativity meets competition on the blockchain*

[![Base Testnet](https://img.shields.io/badge/Base-Testnet-blue.svg)](https://sepolia.base.org)
[![Smart Contracts](https://img.shields.io/badge/Smart%20Contracts-Deployed-green.svg)](https://sepolia.basescan.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 **Project Overview**

**Baselume** is a revolutionary competitive drawing platform that combines AI-powered scoring, blockchain technology, and social gaming. Players create drawings based on prompts, receive instant AI feedback, compete on global leaderboards, and earn exclusive NFT rewards for top daily performance.

### 🎯 **Core Concept**

Transform casual drawing into competitive gaming through:
- **AI-Powered Scoring**: Gemini AI analyzes drawings and provides scores (1-10) based on accuracy, creativity, technique, and completeness
- **Blockchain Integration**: All scores permanently recorded on Base testnet with transparent, tamper-proof leaderboards
- **Daily NFT Rewards**: Top daily performers receive unique, transferable champion NFTs
- **Social Competition**: Real-time leaderboards foster community engagement and viral growth

---

## 🚀 **Key Features**

### 🎨 **Drawing Experience**
- **Advanced Canvas**: HTML5 canvas with multiple tools (pen, eraser, text, upload)
- **Theme-Based Prompts**: Curated drawing themes (Fantasy, Animals, Nature, etc.)
- **Real-Time Tools**: Adjustable brush sizes, color picker, floating dashboard
- **Mobile Responsive**: Optimized for all device sizes

### 🤖 **AI-Powered Scoring**
- **Gemini AI Integration**: Advanced image analysis and scoring
- **Multi-Criteria Evaluation**:
  - **Accuracy (40%)**: How well drawing matches description
  - **Creativity (25%)**: Imaginative interpretation and originality
  - **Technique (20%)**: Drawing quality and execution
  - **Completeness (15%)**: How finished the artwork appears
- **Instant Feedback**: Detailed scoring breakdown with constructive feedback

### ⛓️ **Blockchain Integration**
- **Base Testnet Deployment**: Low-cost, fast transactions
- **On-Chain Scoring**: All scores permanently recorded via smart contracts
- **Transparent Leaderboards**: Real-time rankings with verifiable data
- **Gas Optimization**: Efficient contracts (~$0.01 per score recording)

### 🏆 **Competition System**
- **Daily Competitions**: 24-hour scoring cycles with fresh starts
- **Global Leaderboards**: All-time and daily rankings
- **NFT Rewards**: Unique daily champion NFTs for top performers
- **NFT Circulation**: Champions lose NFTs when someone else wins

### 🎮 **Game Modes**
- **Public Rooms**: Open competitions for all players
- **Private Rooms**: Invite-only games with custom settings
- **Room Customization**: Adjustable themes, time limits, player counts
- **Real-Time Lobbies**: Live participant tracking and game management

---

## 🏗️ **Technical Architecture**

### 🖥️ **Frontend Stack**
```typescript
- Next.js 15 (App Router)    // React framework
- TypeScript                 // Type safety
- Tailwind CSS              // Styling
- Wagmi + Viem              // Ethereum wallet integration
- HTML5 Canvas              // Drawing functionality
- Farcaster SDK             // Social integration
```

### ⛓️ **Blockchain Stack**
```solidity
- Solidity 0.8.19           // Smart contract language
- Hardhat                   // Development framework
- OpenZeppelin              // Security standards
- Base Testnet              // Deployment network
- MetaMask Integration      // Wallet connectivity
```

### 🧠 **AI & Backend**
```javascript
- Google Gemini AI          // Image analysis and scoring
- Supabase                  // Database and real-time features
- Neynar API               // Farcaster integration
- Next.js API Routes       // Backend endpoints
```

### 📊 **Database Schema**
```sql
- Users                     // Player profiles and stats
- Rooms                     // Game room configurations
- Games                     // Individual game sessions
- Submissions              // Player drawings and scores
- Room Participants        // Player-room relationships
- Votes                    // Community voting system
```

---

## 🎯 **User Journey**

### 1. **Onboarding**
```
Connect Wallet → Farcaster Auth → Profile Creation → Tutorial
```

### 2. **Game Flow**
```
Main Menu → Room Selection → Drawing Canvas → AI Scoring → Blockchain Recording → Leaderboard Update
```

### 3. **Competition Cycle**
```
Daily Reset → Active Competition → Score Accumulation → Champion Selection → NFT Distribution
```

---

## 🛠️ **Smart Contracts**

### 📊 **ScoreTracker Contract**
**Purpose**: Manages all player scores and daily competitions

**Key Functions**:
```solidity
recordScore(address player, uint256 score, string gameId)
getTotalScore(address player) returns (uint256)
getDailyScore(address player) returns (uint256)
getTopPlayers(uint256 limit) returns (address[], uint256[])
getCurrentDay() returns (uint256)
getDailyStats(uint256 day) returns (...)
```

**Features**:
- ✅ Duplicate prevention with unique game IDs
- ✅ Efficient leaderboard sorting algorithms
- ✅ Daily competition cycle management
- ✅ Gas-optimized storage patterns

### 🏆 **DailyChampionNFT Contract**
**Purpose**: Manages daily champion NFT rewards

**Key Functions**:
```solidity
mintDailyChampion(uint256 day)
getDailyChampion(uint256 day) returns (address, uint256, uint256)
isChampion(address user) returns (bool)
getOwnedTokens(address owner) returns (uint256[])
```

**Features**:
- ✅ Automatic daily NFT distribution
- ✅ NFT transfer between champions
- ✅ Dynamic metadata generation
- ✅ OpenSea marketplace compatibility

---

## 🎨 **Game Mechanics**

### 🎯 **Scoring System**
| Criteria | Weight | Description |
|----------|--------|-------------|
| **Accuracy** | 40% | Adherence to prompt/theme |
| **Creativity** | 25% | Original interpretation |
| **Technique** | 20% | Drawing skill and execution |
| **Completeness** | 15% | Finished appearance |

### 🏁 **Competition Structure**
- **Daily Cycles**: 24-hour competitions (UTC reset)
- **Score Accumulation**: Multiple submissions per day allowed
- **Winner Selection**: Highest daily score wins NFT
- **NFT Circulation**: Previous champions lose NFT to new winners

### 🎖️ **Reward System**
- **Champion NFTs**: Unique daily rewards with metadata
- **Leaderboard Status**: Public rankings and recognition
- **Social Sharing**: Farcaster integration for viral growth
- **Future Utility**: NFT staking and governance (roadmap)

---

## 📱 **User Interface**

### 🎨 **Design System**
- **Color Palette**: Blue (#2563eb), White (#ffffff), Black (#000000)
- **Typography**: Consistent font sizes and spacing
- **Components**: Reusable UI elements with Tailwind CSS
- **Responsive**: Mobile-first design approach

### 🖥️ **Screen Flow**
```
Login Screen
├── Main Menu
│   ├── Play Now → Public Rooms → Drawing Canvas
│   ├── Private Rooms → Create/Join → Game Lobby → Drawing Canvas
│   └── Leaderboard → Player Stats & Rankings
└── Drawing Canvas → AI Analysis → Score Modal → Leaderboard
```

### 🎮 **Drawing Tools**
- **Pen Tool**: Variable brush sizes and colors
- **Eraser**: Clean removal functionality
- **Text Tool**: Add text annotations
- **Upload Tool**: Import reference images
- **Undo/Redo**: Full action history
- **Clear Canvas**: Fresh start option

---

## 🚀 **Getting Started**

### 📋 **Prerequisites**
```bash
Node.js 16+
MetaMask Wallet
Base Testnet ETH
Supabase Account
Gemini API Key
```

### ⚡ **Quick Setup**
```bash
# Clone repository
git clone https://github.com/your-username/baselume
cd baselume

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add your API keys and contract addresses

# Setup database
npm run setup-database

# Deploy smart contracts
npx hardhat compile
npx hardhat run contracts/deploy.cjs --network base-sepolia

# Start development server
npm run dev
```

### 🔧 **Environment Variables**
```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=baselume

# Blockchain
PRIVATE_KEY=your_wallet_private_key
NEXT_PUBLIC_SCORE_TRACKER_ADDRESS=deployed_contract_address
NEXT_PUBLIC_DAILY_CHAMPION_NFT_ADDRESS=deployed_nft_address

# APIs
GEMINI_API_KEY=your_gemini_api_key
NEYNAR_API_KEY=your_neynar_api_key

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📊 **Business Model**

### 💰 **Revenue Streams**
1. **Transaction Fees**: Small fee on score recordings
2. **Premium Features**: Advanced tools and themes
3. **NFT Royalties**: Secondary market trading fees
4. **Sponsored Competitions**: Brand partnerships
5. **Tournament Entry Fees**: Special event competitions

### 📈 **Growth Strategy**
1. **Viral Mechanics**: Social sharing and leaderboards
2. **Community Building**: Discord and social media presence
3. **Influencer Partnerships**: Artist and creator collaborations
4. **Cross-Platform Integration**: Farcaster and other social networks
5. **Gamification**: Achievements, badges, and progression systems

---

## 🗺️ **Roadmap**

### 🎯 **Phase 1: Foundation** *(Current)*
- [x] Core drawing functionality
- [x] AI scoring integration
- [x] Smart contract deployment
- [x] Basic competition system
- [x] Leaderboard implementation

### 🚀 **Phase 2: Enhancement** *(Next 3 months)*
- [ ] Advanced drawing tools
- [ ] Tournament system
- [ ] Mobile app development
- [ ] Community features
- [ ] Enhanced NFT utility

### 🌟 **Phase 3: Expansion** *(6 months)*
- [ ] Multi-chain deployment
- [ ] DAO governance
- [ ] Creator monetization
- [ ] Educational partnerships
- [ ] VR/AR integration

### 🏆 **Phase 4: Ecosystem** *(1 year)*
- [ ] Baselume marketplace
- [ ] Developer API
- [ ] White-label solutions
- [ ] Global competitions
- [ ] Metaverse integration

---

## 🤝 **Contributing**

We welcome contributions from the community! Here's how you can help:

### 🐛 **Bug Reports**
- Use GitHub Issues to report bugs
- Provide detailed reproduction steps
- Include screenshots and error logs

### 💡 **Feature Requests**
- Discuss ideas in GitHub Discussions
- Create detailed feature proposals
- Consider implementation complexity

### 🔧 **Development**
```bash
# Fork the repository
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm run test
npm run lint

# Commit and push
git commit -m "Add amazing feature"
git push origin feature/amazing-feature

# Create Pull Request
```

---

## 📄 **Documentation**

### 📚 **Additional Resources**
- [Smart Contract Documentation](./BLOCKCHAIN_SETUP.md)
- [Database Setup Guide](./SUPABASE_SETUP.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

### 🛠️ **Developer Tools**
- [Contract Testing](./scripts/test-contracts.js)
- [Database Migration](./scripts/setup-database.js)
- [Local Development](./docs/DEVELOPMENT.md)

---

## 📞 **Support & Community**

### 🌐 **Links**
- **Website**: [https://baselume.xyz](https://baselume.xyz)
- **Discord**: [Join our community](https://discord.gg/baselume)
- **Twitter**: [@baselume](https://twitter.com/baselume)
- **GitHub**: [Source code](https://github.com/baselume/baselume)

### 💬 **Get Help**
- **Technical Issues**: GitHub Issues
- **General Questions**: Discord #help channel
- **Business Inquiries**: hello@baselume.xyz

---

## 📜 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Base Team**: For the amazing L2 infrastructure
- **OpenZeppelin**: For secure smart contract standards
- **Google AI**: For Gemini API access
- **Farcaster**: For decentralized social integration
- **Community**: For feedback and contributions

---

<div align="center">

### 🎨 **Built with ❤️ for the creative community**

**Start your artistic journey today!**

[🚀 **Play Now**](https://baselume.xyz) | [📖 **Documentation**](./docs) | [💬 **Join Discord**](https://discord.gg/baselume)

---

*Baselume - Where every stroke counts, every score matters, and every day brings new champions.*

</div>

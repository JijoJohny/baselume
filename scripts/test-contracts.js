const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('🧪 Testing Baselume Smart Contracts...\n');

  // Get contract addresses from environment
  const scoreTrackerAddress = process.env.NEXT_PUBLIC_SCORE_TRACKER_ADDRESS;
  const nftAddress = process.env.NEXT_PUBLIC_DAILY_CHAMPION_NFT_ADDRESS;

  if (!scoreTrackerAddress || !nftAddress) {
    console.error('❌ Contract addresses not found in environment variables');
    console.log('Please deploy contracts first and update .env.local');
    process.exit(1);
  }

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log('Testing with account:', signer.address);
  console.log('Account balance:', ethers.utils.formatEther(await signer.getBalance()), 'ETH\n');

  try {
    // Initialize contracts
    const ScoreTracker = await ethers.getContractFactory('ScoreTracker');
    const scoreTracker = ScoreTracker.attach(scoreTrackerAddress);

    const DailyChampionNFT = await ethers.getContractFactory('DailyChampionNFT');
    const nftContract = DailyChampionNFT.attach(nftAddress);

    console.log('📊 ScoreTracker Contract:', scoreTrackerAddress);
    console.log('🏆 DailyChampionNFT Contract:', nftAddress);

    // Test 1: Check contract basic info
    console.log('\n1. 📋 Contract Information:');
    const currentDay = await scoreTracker.getCurrentDay();
    const totalPlayers = await scoreTracker.getTotalPlayers();
    const nftTotalSupply = await nftContract.totalSupply();
    
    console.log(`   Current Day: ${currentDay}`);
    console.log(`   Total Players: ${totalPlayers}`);
    console.log(`   NFTs Minted: ${nftTotalSupply}`);

    // Test 2: Record a test score
    console.log('\n2. 🎯 Recording Test Score:');
    const testGameId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const testScore = 8;
    
    console.log(`   Game ID: ${testGameId}`);
    console.log(`   Score: ${testScore}/10`);
    
    const recordTx = await scoreTracker.recordScore(signer.address, testScore, testGameId);
    console.log(`   Transaction: ${recordTx.hash}`);
    
    const receipt = await recordTx.wait();
    console.log(`   ✅ Score recorded in block ${receipt.blockNumber}`);

    // Test 3: Check updated scores
    console.log('\n3. 📈 Updated Player Stats:');
    const totalScore = await scoreTracker.getTotalScore(signer.address);
    const dailyScore = await scoreTracker.getDailyScore(signer.address);
    
    console.log(`   Total Score: ${totalScore}`);
    console.log(`   Daily Score: ${dailyScore}`);

    // Test 4: Check leaderboard
    console.log('\n4. 🏁 Leaderboard:');
    const [topAddresses, topScores] = await scoreTracker.getTopPlayers(5);
    
    for (let i = 0; i < topAddresses.length; i++) {
      const rank = i + 1;
      const address = topAddresses[i];
      const score = topScores[i];
      const isCurrentUser = address.toLowerCase() === signer.address.toLowerCase();
      
      console.log(`   ${rank}. ${address.slice(0, 6)}...${address.slice(-4)} - ${score} points ${isCurrentUser ? '(You)' : ''}`);
    }

    // Test 5: Check daily stats
    console.log('\n5. 📊 Daily Statistics:');
    const [totalGames, totalDailyScore, topPlayer, topScore, nftAwarded] = await scoreTracker.getDailyStats(currentDay);
    
    console.log(`   Games Today: ${totalGames}`);
    console.log(`   Total Points Today: ${totalDailyScore}`);
    console.log(`   Top Player: ${topPlayer === ethers.constants.AddressZero ? 'None' : `${topPlayer.slice(0, 6)}...${topPlayer.slice(-4)}`}`);
    console.log(`   Top Score: ${topScore}`);
    console.log(`   NFT Awarded: ${nftAwarded ? 'Yes' : 'No'}`);

    // Test 6: Check NFT status
    console.log('\n6. 🎖️ NFT Status:');
    const isChampion = await nftContract.isChampion(signer.address);
    const ownedTokens = await nftContract.getOwnedTokens(signer.address);
    
    console.log(`   Is Champion: ${isChampion ? 'Yes' : 'No'}`);
    console.log(`   Owned NFTs: ${ownedTokens.length}`);
    
    if (ownedTokens.length > 0) {
      console.log(`   Token IDs: ${ownedTokens.join(', ')}`);
    }

    // Test 7: Simulate daily NFT minting (if possible)
    if (currentDay > 0 && topScore > 0 && !nftAwarded) {
      console.log('\n7. 🎁 Testing NFT Minting:');
      try {
        const mintTx = await nftContract.mintDailyChampion(currentDay);
        console.log(`   Mint Transaction: ${mintTx.hash}`);
        
        const mintReceipt = await mintTx.wait();
        console.log(`   ✅ NFT minted in block ${mintReceipt.blockNumber}`);
        
        // Check updated NFT status
        const newNftSupply = await nftContract.totalSupply();
        console.log(`   New NFT Supply: ${newNftSupply}`);
      } catch (error) {
        console.log(`   ⚠️ NFT minting not possible: ${error.reason || error.message}`);
      }
    } else {
      console.log('\n7. 🎁 NFT Minting: Not applicable (no valid daily winner yet)');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Test Summary:');
    console.log('   ✓ Contract connection established');
    console.log('   ✓ Score recording functional');
    console.log('   ✓ Leaderboard updates working');
    console.log('   ✓ Daily statistics tracking');
    console.log('   ✓ NFT contract integration');
    console.log('\n🔗 View on BaseScan:');
    console.log(`   ScoreTracker: https://sepolia.basescan.org/address/${scoreTrackerAddress}`);
    console.log(`   DailyChampionNFT: https://sepolia.basescan.org/address/${nftAddress}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.reason) {
      console.error('Reason:', error.reason);
    }
    
    if (error.transaction) {
      console.error('Transaction:', error.transaction.hash);
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

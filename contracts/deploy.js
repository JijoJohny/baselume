import { ethers } from 'hardhat';

async function main() {
  console.log('🚀 Deploying Baselume Contracts to Base Testnet...\n');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', ethers.utils.formatEther(await deployer.getBalance()), 'ETH\n');

  try {
    // 1. Deploy ScoreTracker contract
    console.log('📊 Deploying ScoreTracker contract...');
    const ScoreTracker = await ethers.getContractFactory('ScoreTracker');
    const scoreTracker = await ScoreTracker.deploy();
    await scoreTracker.deployed();
    console.log('✅ ScoreTracker deployed to:', scoreTracker.address);

    // 2. Deploy DailyChampionNFT contract
    console.log('\n🏆 Deploying DailyChampionNFT contract...');
    const baseURI = 'https://api.baselume.xyz/nft/metadata/'; // Update with your metadata API
    const DailyChampionNFT = await ethers.getContractFactory('DailyChampionNFT');
    const dailyChampionNFT = await DailyChampionNFT.deploy(
      scoreTracker.address,
      baseURI
    );
    await dailyChampionNFT.deployed();
    console.log('✅ DailyChampionNFT deployed to:', dailyChampionNFT.address);

    // 3. Set NFT contract address in ScoreTracker
    console.log('\n🔗 Linking contracts...');
    const setNFTTx = await scoreTracker.setNFTContract(dailyChampionNFT.address);
    await setNFTTx.wait();
    console.log('✅ Contracts linked successfully');

    // 4. Verify deployment
    console.log('\n🧪 Verifying deployment...');
    const currentDay = await scoreTracker.getCurrentDay();
    const totalPlayers = await scoreTracker.getTotalPlayers();
    const nftTotalSupply = await dailyChampionNFT.totalSupply();
    
    console.log('Current day:', currentDay.toString());
    console.log('Total players:', totalPlayers.toString());
    console.log('NFT total supply:', nftTotalSupply.toString());

    // 5. Output contract addresses for frontend
    console.log('\n📋 Contract Deployment Summary:');
    console.log('================================');
    console.log('ScoreTracker:', scoreTracker.address);
    console.log('DailyChampionNFT:', dailyChampionNFT.address);
    console.log('Deployer:', deployer.address);
    console.log('Network: Base Testnet');
    console.log('Block:', await ethers.provider.getBlockNumber());

    // 6. Generate environment variables
    console.log('\n📝 Add these to your .env.local file:');
    console.log('=====================================');
    console.log(`NEXT_PUBLIC_SCORE_TRACKER_ADDRESS=${scoreTracker.address}`);
    console.log(`NEXT_PUBLIC_DAILY_CHAMPION_NFT_ADDRESS=${dailyChampionNFT.address}`);
    console.log(`NEXT_PUBLIC_DEPLOYER_ADDRESS=${deployer.address}`);

    // 7. Generate ABI files for frontend
    const fs = await import('fs');
    const path = await import('path');
    
    const scoreTrackerABI = JSON.stringify(ScoreTracker.interface.format('json'), null, 2);
    const nftABI = JSON.stringify(DailyChampionNFT.interface.format('json'), null, 2);
    
    const abiDir = path.default.join(process.cwd(), 'src', 'contracts', 'abi');
    if (!fs.default.existsSync(abiDir)) {
      fs.default.mkdirSync(abiDir, { recursive: true });
    }
    
    fs.default.writeFileSync(path.default.join(abiDir, 'ScoreTracker.json'), scoreTrackerABI);
    fs.default.writeFileSync(path.default.join(abiDir, 'DailyChampionNFT.json'), nftABI);
    
    console.log('\n📄 ABI files generated in src/contracts/abi/');

    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n🔍 Verify contracts on BaseScan:');
    console.log(`https://sepolia.basescan.org/address/${scoreTracker.address}`);
    console.log(`https://sepolia.basescan.org/address/${dailyChampionNFT.address}`);

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Handle script execution
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const { ethers } = require("hardhat");
const fs = require("fs"); // Import the 'fs' module to handle file system operations

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying contracts with the account:", deployer.address);

  // --- CONFIGURATION ---
  // These are the arguments needed for your StrategicIntelPass contract's constructor.
  const usdcTokenAddress = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"; // This is the official USDC address on Polygon Mainnet
  const treasuryWallet = deployer.address; // For simplicity, funds will go to the deployer's wallet.

  // 1. Deploy the StrategicIntelPass NFT Contract
  console.log("Deploying the StrategicIntelPass NFT...");
  const PremiumPassFactory = await ethers.getContractFactory("StrategicIntelPass");
  const premiumPass = await PremiumPassFactory.deploy(
    deployer.address,    // initialOwner
    usdcTokenAddress,    // _usdcTokenAddress
    treasuryWallet       // _treasuryWallet
  );
  await premiumPass.waitForDeployment();
  const premiumPassAddress = await premiumPass.getAddress();
  console.log("✅ StrategicIntelPass NFT deployed to:", premiumPassAddress);

  console.log("\n🎉 Deployment complete!");

  // 2. Save Deployment Information
  const deploymentInfo = {
    strategicIntelPassAddress: premiumPassAddress,
    // --- THIS IS THE FIX: Using the correctly defined variable ---
    usdcAddress: usdcTokenAddress, 
    treasuryWallet: treasuryWallet,
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    "./deployment-artifacts.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("✅ Deployment artifacts saved to deployment-artifacts.json");
  console.log("\n--- COPY TO YOUR FRONTEND .ENV FILE ---");
  console.log(`VITE_PREMIUM_PASS_NFT_ADDRESS="${premiumPassAddress}"`);
  // --- THIS IS THE FIX: Using the correctly defined variable ---
  console.log(`VITE_USDC_ADDRESS="${usdcTokenAddress}"`); 
  console.log("---------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
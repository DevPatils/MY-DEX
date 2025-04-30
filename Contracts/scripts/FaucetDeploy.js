const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying contracts with:", deployer.address);

  // Replace with actual ERC20 token addresses deployed to Sepolia
  const tokenXAddress = "0x30B57FfDEfa6Faa933E9c36008BBa0CB3d474596";
  const tokenYAddress = "0xd3b36fa7059B1ab7B5D76A11b871A9d25e3ef5Ca";

  const TokenFaucet = await ethers.getContractFactory("TokenFaucet");
  const faucet = await TokenFaucet.deploy(tokenXAddress, tokenYAddress);
  await faucet.waitForDeployment();

  console.log(`✅ Faucet deployed to: ${faucet}`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});

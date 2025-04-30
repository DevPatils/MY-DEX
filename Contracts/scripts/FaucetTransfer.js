const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Funding from:", deployer.address);

  const faucetAddress = "0x4df2953897D9f973766a5daaBfAaE24B2DcC6977";

  // Replace these with actual deployed token addresses on Sepolia
  const tokenXAddress = "0x30B57FfDEfa6Faa933E9c36008BBa0CB3d474596";
  const tokenYAddress = "0xd3b36fa7059B1ab7B5D76A11b871A9d25e3ef5Ca";

  const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function transfer(address to, uint256 amount) public returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  const tokenX = new ethers.Contract(tokenXAddress, ERC20_ABI, deployer);
  const tokenY = new ethers.Contract(tokenYAddress, ERC20_ABI, deployer);

  const amountToSend = ethers.parseEther("10000"); // 1000 tokens assuming 18 decimals

  console.log("📤 Transferring tokenX...");
  await tokenX.transfer(faucetAddress, amountToSend);
  console.log("✅ tokenX transferred");

  console.log("📤 Transferring tokenY...");
  await tokenY.transfer(faucetAddress, amountToSend);
  console.log("✅ tokenY transferred");

  const balanceX = await tokenX.balanceOf(faucetAddress);
  const balanceY = await tokenY.balanceOf(faucetAddress);
  console.log(`💰 Faucet Balances → tokenX: ${ethers.utils.formatEther(balanceX)}, tokenY: ${ethers.utils.formatEther(balanceY)}`);
}

main().catch((error) => {
  console.error("❌ Error funding faucet:", error);
  process.exit(1);
});

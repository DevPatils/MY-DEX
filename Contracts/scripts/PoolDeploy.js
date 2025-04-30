// scripts/deploy.js
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy LPToken first
  const LPToken = await ethers.getContractFactory("LPToken");
  const lpToken = await LPToken.deploy();
  await lpToken.waitForDeployment();
  console.log("LPToken deployed to:", lpToken.target);

  // Replace with your actual ERC20 token addresses on Sepolia
  const tokenX = "0xYourTokenXAddress";
  const tokenY = "0xYourTokenYAddress";

  // Deploy SimpleLiquidityPool
  const Pool = await ethers.getContractFactory("SimpleLiquidityPool");
  const pool = await Pool.deploy(tokenX, tokenY, lpToken.target);
  await pool.waitForDeployment();
  console.log("SimpleLiquidityPool deployed to:", pool.target);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

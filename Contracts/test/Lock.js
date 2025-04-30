const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleLiquidityPool", function () {
  let tokenX, tokenY, lpToken, pool;
  let owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    console.log("\n🔧 Deploying TokenX...");
    const TokenXFactory = await ethers.getContractFactory("TokenX");
    tokenX = await TokenXFactory.deploy();
    await tokenX.waitForDeployment();
    console.log(`✅ TokenX deployed at: ${await tokenX.getAddress()}`);

    console.log("\n🔧 Deploying TokenY...");
    const TokenYFactory = await ethers.getContractFactory("TokenY");
    tokenY = await TokenYFactory.deploy();
    await tokenY.waitForDeployment();
    console.log(`✅ TokenY deployed at: ${await tokenY.getAddress()}`);

    console.log("\n🔧 Deploying LPToken...");
    const LPTokenFactory = await ethers.getContractFactory("LPToken");
    lpToken = await LPTokenFactory.deploy();
    await lpToken.waitForDeployment();
    console.log(`✅ LPToken deployed at: ${await lpToken.getAddress()}`);

    console.log("\n🏗️  Deploying Liquidity Pool...");
    const PoolFactory = await ethers.getContractFactory("SimpleLiquidityPool");
    pool = await PoolFactory.deploy(
      await tokenX.getAddress(),
      await tokenY.getAddress(),
      await lpToken.getAddress()
    );
    await pool.waitForDeployment();
    console.log(`✅ Liquidity Pool deployed at: ${await pool.getAddress()}`);
  });

  it("💧 should add liquidity and mint LP tokens", async function () {
    const amountX = ethers.parseEther("100");
    const amountY = ethers.parseEther("200");

    console.log("\n🔐 Approving TokenX and TokenY for pool...");
    await tokenX.connect(owner).approve(await pool.getAddress(), amountX);
    await tokenY.connect(owner).approve(await pool.getAddress(), amountY);

    console.log("📥 Adding liquidity...");
    await pool.connect(owner).addLiquidity(amountX, amountY);

    const lpBalance = await lpToken.balanceOf(owner.address);
    console.log(`🪙 LP Tokens minted: ${ethers.formatEther(lpBalance)} LP`);
    expect(lpBalance).to.be.gt(0);
  });

  it("🔁 should allow tokenX to be swapped for tokenY", async function () {
    const amountX = ethers.parseEther("100");
    const amountY = ethers.parseEther("200");

    console.log("\n💧 Adding initial liquidity...");
    await tokenX.approve(await pool.getAddress(), amountX);
    await tokenY.approve(await pool.getAddress(), amountY);
    await pool.addLiquidity(amountX, amountY);

    const swapAmountX = ethers.parseEther("10");
    await tokenX.transfer(user1.address, swapAmountX);
    await tokenX.connect(user1).approve(await pool.getAddress(), swapAmountX);

    console.log(`\n🔄 Swapping ${ethers.formatEther(swapAmountX)} TokenX for TokenY...`);
    const balanceBefore = await tokenY.balanceOf(user1.address);
    await pool.connect(user1).swapXForY(swapAmountX);
    const balanceAfter = await tokenY.balanceOf(user1.address);

    console.log(`🎯 TokenY received: ${ethers.formatEther(balanceAfter - balanceBefore)} Y`);
    expect(balanceAfter).to.be.gt(balanceBefore);
  });

  it("♻️ should remove liquidity and return tokens", async function () {
    const amountX = ethers.parseEther("100");
    const amountY = ethers.parseEther("200");

    console.log("\n💧 Adding liquidity...");
    await tokenX.approve(await pool.getAddress(), amountX);
    await tokenY.approve(await pool.getAddress(), amountY);
    await pool.addLiquidity(amountX, amountY);

    const lpBalance = await lpToken.balanceOf(owner.address);
    console.log(`\n📤 Removing liquidity by burning ${ethers.formatEther(lpBalance)} LP tokens...`);

    await lpToken.approve(await pool.getAddress(), lpBalance);
    await pool.removeLiquidity(lpBalance);

    const finalBalanceX = await tokenX.balanceOf(owner.address);
    const finalBalanceY = await tokenY.balanceOf(owner.address);

    console.log(`✅ Returned: ${ethers.formatEther(finalBalanceX)} X, ${ethers.formatEther(finalBalanceY)} Y`);
    expect(finalBalanceX).to.be.gt(0);
    expect(finalBalanceY).to.be.gt(0);
  });
});
// deploy/TokenModule.js
// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenModule", (m) => {
  
  // Deploy TokenX contract without constructor arguments
  const tokenX = m.contract("TokenX");
  
  // Deploy TokenY contract without constructor arguments
  const tokenY = m.contract("TokenY");

  return { tokenX, tokenY };
});

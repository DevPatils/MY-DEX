// require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.28",
//   networks: {
//     sepolia: {
//       url: process.env.INFURA_URL, // Ensure this is the correct URL with the project ID
//       accounts: [process.env.PRIVATE_KEY] // Make sure the private key is correct and without 0x
//     }
//   }
// };


require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // Default Hardhat local node
      chainId: 1337,
    },
    hardhat: {
      chainId: 1337,
    },
  },
};


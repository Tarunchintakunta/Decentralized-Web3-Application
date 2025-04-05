// Import required plugins
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Safely access environment variables with fallbacks
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const SEPOLIA_URL = process.env.SEPOLIA_URL || "https://eth-sepolia.g.alchemy.com/v2/your-api-key";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: 1337
    },
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./src/artifacts",
    scripts: { type: "commonjs", directory: "./scripts" }
  }
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};
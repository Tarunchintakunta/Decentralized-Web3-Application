// Using CommonJS syntax as suggested in the error message
const hre = require("hardhat");

async function main() {
  console.log("Deploying HealthRecords contract...");

  // Get the contract factory
  const HealthRecords = await hre.ethers.getContractFactory("HealthRecords");
  
  // Deploy the contract
  const healthRecords = await HealthRecords.deploy();
  
  // Wait for deployment to complete
  await healthRecords.deployed();
  
  console.log(`HealthRecords deployed to: ${healthRecords.address}`);
  console.log("Save this address in your .env file as VITE_CONTRACT_ADDRESS");
  
  // For verification
  console.log("To verify the contract on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${healthRecords.address}`);
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
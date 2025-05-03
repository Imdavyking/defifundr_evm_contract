import fs from "fs";
import { ethers } from "hardhat";
import path from "path";
import { verify } from "../utils/verify";
import deployParams from "../utils/deploy.params";
import { deployContractUtil } from "../utils/deploy";

async function main() {
  const network = await ethers.provider.getNetwork();
  // Set unlock time based on the network
  const unlockTime = deployParams[network.name]?.unlockTime;
  if (!unlockTime) {
    throw new Error(`Unlock time not set for ${network.name}`);
  }
  const {
    address,
    networkName,
    chainId,
    deployedAt,
    gasUsed,
    transactionHash,
  } = await deployContractUtil({
    contractName: "Lock",
    args: [unlockTime],
    useProxy: true,
  });

  // Save deployment info
  const deploymentInfo = {
    contract: "Lock",
    address,
    networkName,
    chainId,
    unlockTime,
    deployedAt,
    gasUsed,
    transactionHash,
  };

  // Ensure the deployments directory exists
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to a file
  const deploymentPath = path.join(
    deploymentsDir,
    `${network.name}-deployment.json`
  );
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log(`Deployment info saved to ${deploymentPath}`);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// // Get the current timestamp
// const currentTimestamp = Math.floor(Date.now() / 1000);

// // Get network details
// const network = await ethers.provider.getNetwork();
// console.log(
//   `Deploying to network: ${network.name} (chain ID: ${network.chainId})`
// );

// // Set unlock time based on the network
// const unlockTime = deployParams[network.name]?.unlockTime;

// // Deploy the Lock contract
// console.log(
//   `Deploying with unlock time: ${unlockTime} (${new Date(
//     unlockTime * 1000
//   ).toUTCString()})`
// );

// const Lock = await ethers.getContractFactory("Lock");

// // Estimate gas before deployment to check if it meets our budget
// const deployTx = await Lock.getDeployTransaction(unlockTime, {
//   value: ethers.parseEther("1"),
// });
// const estimatedGas = await ethers.provider.estimateGas(deployTx);
// console.log(`Estimated deployment gas: ${estimatedGas.toString()}`);

// // Check against our gas budget
// const gasLimit = 250000n; // Use BigInt literal
// if (estimatedGas > gasLimit) {
//   console.warn(
//     `⚠️ WARNING: Deployment gas (${estimatedGas}) exceeds budget of ${gasLimit}`
//   );
// }

// // Deploy with a specific gas limit to prevent unexpected high gas usage
// console.log("Deploying contract...");
// const lock = await Lock.deploy(unlockTime, {
//   value: ethers.parseEther("1"),
//   gasLimit: Number(estimatedGas) + Math.floor(Number(estimatedGas) * 0.1), // Add 10% buffer
// });

// // Wait for the transaction to be mined
// const deploymentTx = lock.deploymentTransaction();
// if (!deploymentTx) {
//   throw new Error("Deployment transaction not found");
// }

// const deployReceipt = await deploymentTx.wait();
// const actualGas = deployReceipt?.gasUsed || 0n;

// const lockAddress = await lock.getAddress();
// console.log(`Lock contract deployed at: ${lockAddress}`);
// console.log(`Actual deployment gas used: ${actualGas.toString()}`);

// // Verify the contract on Etherscan
// await verify(lockAddress, [unlockTime]);

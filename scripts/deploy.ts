import fs from "fs";
import { ethers } from "hardhat";
import path from "path";
import deployParams from "../utils/deploy.params";
import { deployContractUtil } from "../utils/deploy";

async function main() {
  const network = await ethers.provider.getNetwork();
  // Set unlock time based on the network
  const unlockTime = deployParams[network.name]?.unlockTime;
  if (!unlockTime) {
    throw new Error(`Unlock time not set for ${network.name}`);
  }

  const useProxy = deployParams[network.name]?.useProxy ?? false;

  const {
    address,
    networkName,
    chainId,
    deployedAt,
    gasUsed,
    transactionHash,
  } = await deployContractUtil({
    contractName: useProxy ? "LockProxyV1" : "Lock",
    args: [unlockTime],
    useProxy,
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

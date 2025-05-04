// utils/deploy.ts
import { ethers, upgrades } from "hardhat";
import { verify } from "./verify";
import { BaseContract } from "ethers";

type DeployOptions = {
  contractName: string;
  args?: any[];
  value?: bigint;
  useProxy?: boolean;
  initializer?: string;
  confirmations?: number;
};

export async function deployContractUtil({
  contractName,
  args = [],
  value,
  useProxy = false,
  confirmations = 6,
}: DeployOptions) {
  const factory = await ethers.getContractFactory(contractName);
  const network = await ethers.provider.getNetwork();
  const timestamp = Math.floor(Date.now() / 1000);

  let contract: BaseContract;

  if (useProxy) {
    contract = await upgrades.deployProxy(factory, args);
  } else {
    const deployTx = await factory.getDeployTransaction(
      ...args,
      value ? { value } : {}
    );
    const estimatedGas = await ethers.provider.estimateGas(deployTx);
    console.log(`Estimated deployment gas: ${estimatedGas.toString()}`);

    // Check against our gas budget
    const gasLimit = 250000n; // Use BigInt literal
    if (estimatedGas > gasLimit) {
      console.warn(
        `⚠️ WARNING: Deployment gas (${estimatedGas}) exceeds budget of ${gasLimit}`
      );
    }
    contract = await factory.deploy(...args, value ? { value } : {});
  }

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const deploymentTx = contract.deploymentTransaction();
  const receipt = await deploymentTx?.wait(confirmations);
  const gasUsed = receipt?.gasUsed?.toString() || "0";

  console.log(`${contractName} deployed at: ${address}`);

  if (useProxy) {
    const implAddress = await upgrades.erc1967.getImplementationAddress(
      address
    );
    console.log(`Implementation deployed at: ${implAddress}`);
    await verify(implAddress, []);
    await verify(address, []);
  } else {
    await verify(address, args);
  }
  return {
    address,
    contract,
    networkName: network.name,
    chainId: Number(network.chainId),
    deployedAt: timestamp,
    gasUsed,
    transactionHash: deploymentTx?.hash,
    args,
    proxy: useProxy,
  };
}

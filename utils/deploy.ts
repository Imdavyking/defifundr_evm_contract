// utils/deploy.ts
import "@openzeppelin/hardhat-upgrades";
import { ethers, upgrades } from "hardhat";
import { verify } from "./verify";
import { DeployFunction } from "@openzeppelin/hardhat-upgrades/dist/deploy-proxy";
import { BaseContract, ContractFactory } from "ethers";

type DeployOptions = {
  contractName: string;
  args?: any[];
  value?: bigint;
  useProxy?: boolean;
  initializer?: string;
};

export async function deployContract({
  contractName,
  args = [],
  value,
  useProxy = false,
  initializer = "initialize",
}: DeployOptions) {
  const factory = await ethers.getContractFactory(contractName);
  const network = await ethers.provider.getNetwork();
  const timestamp = Math.floor(Date.now() / 1000);

  let contract: BaseContract;
  if (useProxy) {
    contract = await upgrades.deployProxy(factory, args, { initializer });
  } else {
    contract = await factory.deploy(...args, value ? { value } : {});
  }

  const address = await contract.getAddress();
  const deploymentTx = contract.deploymentTransaction();
  const receipt = await deploymentTx?.wait();
  const gasUsed = receipt?.gasUsed?.toString() || "0";

  console.log(`${contractName} deployed at: ${address}`);

  await verify(address, args);

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

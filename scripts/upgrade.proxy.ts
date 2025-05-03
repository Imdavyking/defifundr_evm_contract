import "@openzeppelin/hardhat-upgrades";
import { ethers, upgrades } from "hardhat";

export async function upgradeProxyContract(
  proxyAddress: string,
  newContractName: string
) {
  const factory = await ethers.getContractFactory(newContractName);

  console.log(`Upgrading proxy ${proxyAddress} to ${newContractName}...`);
  const upgraded = await upgrades.upgradeProxy(proxyAddress, factory);
  await upgraded.waitForDeployment();

  const newImplAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );
  console.log(`Proxy upgraded at: ${await upgraded.getAddress()}`);
  console.log(`New implementation address: ${newImplAddress}`);

  return {
    proxy: await upgraded.getAddress(),
    implementation: newImplAddress,
    contractName: newContractName,
  };
}

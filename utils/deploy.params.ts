// scripts/deployParams.ts
type DeployParams = {
  [key: string]: {
    unlockTime: number;
    useProxy: boolean;
  };
};
const deployParams: DeployParams = {
  hardhat: {
    unlockTime: Math.floor(Date.now() / 1000) + 60 * 60, // +1 hour
    useProxy: true,
  },
  localhost: {
    unlockTime: Math.floor(Date.now() / 1000) + 60 * 60, // +1 hour
    useProxy: true,
  },
  sepolia: {
    unlockTime: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // +1 day
    useProxy: true,
  },
};

export default deployParams;

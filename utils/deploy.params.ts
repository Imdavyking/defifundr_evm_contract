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
  goerli: {
    unlockTime: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // +1 day
    useProxy: true,
  },
  mainnet: {
    unlockTime: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // +30 days
    useProxy: true,
  },
};

export default deployParams;

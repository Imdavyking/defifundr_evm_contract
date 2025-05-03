// scripts/deployParams.ts
type DeployParams = {
  [key: string]: {
    unlockTime: number;
  };
};
const deployParams: DeployParams = {
  localhost: {
    unlockTime: Math.floor(Date.now() / 1000) + 60 * 60, // +1 hour
  },
  goerli: {
    unlockTime: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // +1 day
  },
  mainnet: {
    unlockTime: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // +30 days
  },
};

export default deployParams;

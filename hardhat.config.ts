import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/config";

const REPORT_GAS = process.env.REPORT_GAS === "true";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yul: true
        }
      },
      viaIR: true,
    },
  },
  gasReporter: {
    enabled: REPORT_GAS,
    currency: 'USD',
    gasPrice: 50,
    token: 'ETH',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    excludeContracts: [],
    src: "./contracts",
    showMethodSig: true,
    maxMethodDiff: 10,
    outputFile: "gas-report.txt",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};

export default config;
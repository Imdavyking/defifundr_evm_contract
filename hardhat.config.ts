import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import "@nomicfoundation/hardhat-verify";
import dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
dotenv.config();

const REPORT_GAS = process.env.REPORT_GAS === "true";
const RPC_URL = process.env.RPC_URL!;
const CHAIN_ID = process.env.CHAIN_ID!;
const API_URL = process.env.API_URL!;
const BROWSER_URL = process.env.BROWSER_URL!;
const API_SCAN_VERIFIER_KEY = process.env.API_SCAN_VERIFIER_KEY!;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    mainNetwork: {
      url: RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: +CHAIN_ID!,
      ignition: {
        explorerUrl: process.env.CHAIN_BLOCKEXPLORER_URL,
      },
    },
  },
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yul: true,
        },
      },
      viaIR: true,
    },
  },
  gasReporter: {
    enabled: REPORT_GAS,
    currency: "USD",
    gasPrice: 50,
    token: "ETH",
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
    artifacts: "./artifacts",
  },
  etherscan: {
    apiKey: {
      sepolia: API_SCAN_VERIFIER_KEY,
    },
    customChains: [
      {
        network: "sepolia",
        chainId: +CHAIN_ID!,
        urls: {
          apiURL: API_URL,
          browserURL: BROWSER_URL,
        },
      },
    ],
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;

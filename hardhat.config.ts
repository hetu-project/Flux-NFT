import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable } from "hardhat/config";
import * as dotenv from "dotenv";

// 加载环境变量
dotenv.config();

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.19",
        settings: {
          evmVersion: "london",
        },
      },
      production: {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: "london",
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    hetuDev: {
      type: "http",
      chainType: "l1",
      url: "http://161.97.161.133:18545",
      accounts: [process.env.PRIVATE_KEY || ""],
      gasPrice: "auto",
      timeout: 60000,
    },
    baseSepolia: {
      type: "http",
      chainType: "l1",
      url: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.BASE_PRIVATE_KEY || ""],
      gasPrice: "auto",
      timeout: 60000,
    },
  },
};

export default config;

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox"; 
import "@openzeppelin/hardhat-upgrades";   
import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-verify";


dotenv.config();


const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";

const config: HardhatUserConfig = {

  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "paris", 
    },
  },


  networks: {
    hardhat: {
    },
    

    localhost: {
      url: "http://127.0.0.1:8545",
    },


    baseSepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [], 
      chainId: 84532,
    },


    hetuDev: {
      url: "http://161.97.161.133:18545",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gasPrice: "auto",
      timeout: 60000,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || "YOUR_KEY_HERE", 
    },
  },
  sourcify: {
    enabled: true
  }

};

export default config;
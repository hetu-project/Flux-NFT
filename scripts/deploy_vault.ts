import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying FluxVault with account:", deployer.address);

  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  
  const Vault = await ethers.getContractFactory("FluxVault");
  
  const vault = await Vault.deploy(USDC_ADDRESS, deployer.address);

  await vault.waitForDeployment();

  console.log("FluxVault deployed to:", await vault.getAddress());
  console.log("------------------------------------------------");
  console.log("Middleware setup info:");
  console.log("Event to listen: 'Deposited(address user, uint256 amount, uint256 timestamp)'");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
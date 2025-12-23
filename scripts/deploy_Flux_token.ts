import { ethers, upgrades } from "hardhat";
import hre from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);


  const Flux = await ethers.getContractFactory("Flux");


  console.log("Deploying Flux Proxy...");
  const flux = await upgrades.deployProxy(Flux, [deployer.address], { 
    initializer: 'initialize',
    kind: 'uups' 
  });

  await flux.waitForDeployment();
  
  const proxyAddress = await flux.getAddress();
  console.log("Flux Proxy deployed to:", proxyAddress);


  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("Implementation address:", implementationAddress);
  console.log("Waiting for block confirmations...");
  if (flux.deploymentTransaction()) {
      await flux.deploymentTransaction()?.wait(5);
  }

  console.log("Verifying implementation contract...");
  
  try {
    await hre.run("verify:verify", {
      address: implementationAddress,
      contract: "contracts/FluxToken.sol:Flux", 
      constructorArguments: [], 
    });
  } catch (e) {
    console.log("Verification failed:", e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
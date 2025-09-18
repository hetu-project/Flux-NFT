import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  // 获取部署者（默认账户）
  const [deployer] = await ethers.getSigners();
  
  console.log("=== 部署者信息 ===");
  console.log(`部署者地址: ${deployer.address}`);
  console.log(`部署者余额: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH`);
  
  // 获取合约实例
  const contractAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788"; // 刚才部署的地址
  const FluxNFT = await ethers.getContractFactory("FluxNFT");
  const fluxNFT = FluxNFT.attach(contractAddress);
  
  // 检查合约所有者
  const owner = await fluxNFT.owner();
  console.log(`合约所有者: ${owner}`);
  
  // 检查是否匹配
  if (owner.toLowerCase() === deployer.address.toLowerCase()) {
    console.log("✅ 部署者就是合约所有者");
  } else {
    console.log("❌ 部署者不是合约所有者");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

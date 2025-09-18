import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  console.log("开始部署 FluxNFT 合约...");
  
  // 合约参数
  const name = "Flux NFT";
  const symbol = "FLUX";
  const baseTokenURI = "https://api.fluxnft.com/metadata/";
  
  // 获取合约工厂
  const FluxNFT = await ethers.getContractFactory("FluxNFT");
  
  // 部署合约
  const fluxNFT = await FluxNFT.deploy(name, symbol, baseTokenURI);
  
  // 等待部署完成
  await fluxNFT.waitForDeployment();
  
  const address = await fluxNFT.getAddress();
  console.log(`FluxNFT 合约已部署到: ${address}`);
  
  // 验证部署
  const contractName = await fluxNFT.name();
  const contractSymbol = await fluxNFT.symbol();
  const maxSupply = await fluxNFT.MAX_SUPPLY();
  const mintPrice = await fluxNFT.mintPrice();
  
  console.log("\n=== 合约信息 ===");
  console.log(`合约名称: ${contractName}`);
  console.log(`合约符号: ${contractSymbol}`);
  console.log(`最大供应量: ${maxSupply}`);
  console.log(`铸造价格: ${ethers.formatEther(mintPrice)} ETH`);
  console.log(`基础URI: ${baseTokenURI}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

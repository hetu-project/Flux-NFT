import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  console.log("=== 获取所有NFT信息 ===");

  // 获取签名者
  const [signer] = await ethers.getSigners();
  console.log("使用账户:", await signer.getAddress());

  // 合约地址
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // 获取合约实例
  const fluxNFT = await ethers.getContractAt("FluxNFT", contractAddress);

  // 获取合约基本信息
  const name = await fluxNFT.name();
  const symbol = await fluxNFT.symbol();
  const totalSupply = await fluxNFT.totalSupply();
  const currentTokenId = await fluxNFT.getCurrentTokenId();

  console.log("\n=== 合约信息 ===");
  console.log(`合约名称: ${name}`);
  console.log(`合约符号: ${symbol}`);
  console.log(`总供应量: ${totalSupply}`);
  console.log(`当前TokenId: ${currentTokenId}`);

  // 获取所有NFT信息
  console.log("\n=== 所有NFT信息 ===");
  
  if (totalSupply === 0n) {
    console.log("当前没有NFT");
    return;
  }

  for (let i = 0; i < totalSupply; i++) {
    try {
      const tokenId = BigInt(i);
      const owner = await fluxNFT.ownerOf(tokenId);
      const tokenURI = await fluxNFT.tokenURI(tokenId);
      
      console.log(`\n--- NFT #${tokenId} ---`);
      console.log(`所有者: ${owner}`);
      console.log(`URI: ${tokenURI}`);
      
      // 获取用户铸造数量
      const userMintedCount = await fluxNFT.getUserMintedCount(owner);
      console.log(`用户已铸造数量: ${userMintedCount}`);
      
    } catch (error) {
      console.error(`获取NFT #${i} 信息失败:`, error);
    }
  }

  // 按所有者分组统计
  console.log("\n=== 按所有者分组统计 ===");
  const ownerStats = new Map<string, number>();
  
  for (let i = 0; i < totalSupply; i++) {
    try {
      const tokenId = BigInt(i);
      const owner = await fluxNFT.ownerOf(tokenId);
      const count = ownerStats.get(owner) || 0;
      ownerStats.set(owner, count + 1);
    } catch (error) {
      console.error(`统计NFT #${i} 失败:`, error);
    }
  }

  for (const [owner, count] of ownerStats) {
    console.log(`${owner}: ${count} 个NFT`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

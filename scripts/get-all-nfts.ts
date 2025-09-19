import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  console.log("=== 获取所有NFT信息 ===");

  // 获取签名者
  const [signer] = await ethers.getSigners();
  console.log("使用账户:", await signer.getAddress());

  // 合约地址
  const contractAddress = "0x0e5189Cd4E46Cd5fA915e2B5c31542a1150eE69C";

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

  // 先查询所有铸造事件，建立 tokenId 到区块高度的映射
  console.log("正在查询铸造事件...");
  const mintEventsMap = new Map<string, number>();
  
  try {
    // 查询所有 Minted 事件，指定区块范围（从部署区块开始到当前区块）
    const mintFilter = fluxNFT.filters.Minted();
    // 从合约部署的区块开始查询（大约在 199370 左右）
    const mintEvents = await fluxNFT.queryFilter(mintFilter, 199370, 'latest');
    
    console.log(`找到 ${mintEvents.length} 个铸造事件`);
    
    // 建立映射关系
    for (const event of mintEvents) {
      const tokenId = event.args[1].toString(); // tokenId 是第二个参数
      mintEventsMap.set(tokenId, event.blockNumber);
      console.log(`Token #${tokenId} 在区块 ${event.blockNumber} 铸造`);
    }
  } catch (eventError) {
    console.log("查询铸造事件失败:", eventError.message);
    console.log("尝试分段查询...");
    
    // 分段查询
    try {
      const segments = [
        { from: 199370, to: 199375 },
        { from: 199375, to: 199380 },
        { from: 199380, to: 'latest' }
      ];
      
      for (const segment of segments) {
        try {
          const mintFilter = fluxNFT.filters.Minted();
          const events = await fluxNFT.queryFilter(mintFilter, segment.from, segment.to);
          
          for (const event of events) {
            const tokenId = event.args[1].toString();
            mintEventsMap.set(tokenId, event.blockNumber);
            console.log(`Token #${tokenId} 在区块 ${event.blockNumber} 铸造`);
          }
        } catch (segError) {
          console.log(`查询区块 ${segment.from}-${segment.to} 失败:`, segError.message);
        }
      }
    } catch (fallbackError) {
      console.log("分段查询也失败:", fallbackError.message);
    }
  }

  for (let i = 0; i < totalSupply; i++) {
    try {
      const tokenId = BigInt(i);
      const owner = await fluxNFT.ownerOf(tokenId);
      const tokenURI = await fluxNFT.tokenURI(tokenId);
      
      // 从映射中获取铸造区块高度
      const mintBlockNumber = mintEventsMap.get(tokenId.toString());
      
      console.log(`\n--- NFT #${tokenId} ---`);
      console.log(`所有者: ${owner}`);
      console.log(`URI: ${tokenURI}`);
      console.log(`铸造区块高度: ${mintBlockNumber || '未知'}`);
      
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

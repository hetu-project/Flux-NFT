import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  console.log("=== 检查地址 NFT 持有情况 ===");

  // 要检查的地址
  const targetAddress = "0xcfaE4Ed9268A83761cd5A2D1f36838c8A4fb8760";
  
  // 合约地址 (HETU DEV)
  const contractAddress = "0xBC45C2511eA43F998E659b4722D6795C482a7E07";

  // 获取合约实例
  const fluxNFT = await ethers.getContractAt("FluxNFT", contractAddress);

  console.log(`检查地址: ${targetAddress}`);
  console.log(`合约地址: ${contractAddress}`);
  console.log(`网络: HETU DEV`);

  try {
    // 1. 检查地址余额
    const balance = await fluxNFT.balanceOf(targetAddress);
    console.log(`\n=== NFT 余额 ===`);
    console.log(`持有 NFT 数量: ${balance.toString()}`);

    if (balance === 0n) {
      console.log("❌ 该地址不持有任何 NFT");
      return;
    }

    // 2. 获取该地址持有的所有 NFT
    console.log(`\n=== 持有的 NFT 详情 ===`);
    const nfts = [];

    for (let i = 0; i < balance; i++) {
      try {
        const tokenId = await fluxNFT.tokenOfOwnerByIndex(targetAddress, i);
        const tokenURI = await fluxNFT.tokenURI(tokenId);
        
        nfts.push({
          tokenId: tokenId.toString(),
          tokenURI
        });
        
        console.log(`NFT #${tokenId.toString()}: ${tokenURI}`);
      } catch (error) {
        console.error(`获取第 ${i} 个 NFT 失败:`, error.message);
      }
    }

    // 3. 检查该地址的铸造统计
    try {
      const mintedCount = await fluxNFT.getUserMintedCount(targetAddress);
      console.log(`\n=== 铸造统计 ===`);
      console.log(`该地址已铸造数量: ${mintedCount.toString()}`);
    } catch (error) {
      console.log("无法获取铸造统计信息");
    }

    // 4. 获取合约总信息
    try {
      const totalSupply = await fluxNFT.totalSupply();
      const maxSupply = await fluxNFT.MAX_SUPPLY();
      const name = await fluxNFT.name();
      const symbol = await fluxNFT.symbol();
      
      console.log(`\n=== 合约信息 ===`);
      console.log(`合约名称: ${name}`);
      console.log(`合约符号: ${symbol}`);
      console.log(`总供应量: ${totalSupply.toString()}`);
      console.log(`最大供应量: ${maxSupply.toString()}`);
    } catch (error) {
      console.log("无法获取合约信息");
    }

    // 5. 检查地址的 ETH 余额
    try {
      const ethBalance = await ethers.provider.getBalance(targetAddress);
      console.log(`\n=== ETH 余额 ===`);
      console.log(`ETH 余额: ${ethers.formatEther(ethBalance)} ETH`);
    } catch (error) {
      console.log("无法获取 ETH 余额");
    }

    console.log(`\n✅ 检查完成！该地址持有 ${balance.toString()} 个 NFT`);

  } catch (error) {
    console.error("❌ 检查失败:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

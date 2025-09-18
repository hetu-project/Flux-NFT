import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  console.log("=== FluxNFT 铸造测试 ===");

  // 获取签名者
  const [signer] = await ethers.getSigners();
  console.log("使用账户:", await signer.getAddress());

  // 合约地址（从部署输出中获取）
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // 获取合约实例
  const fluxNFT = await ethers.getContractAt("FluxNFT", contractAddress);

  console.log("\n=== 合约信息 ===");
  const name = await fluxNFT.name();
  const symbol = await fluxNFT.symbol();
  const maxSupply = await fluxNFT.MAX_SUPPLY();
  const mintPrice = await fluxNFT.mintPrice();
  const totalSupply = await fluxNFT.totalSupply();

  console.log(`合约名称: ${name}`);
  console.log(`合约符号: ${symbol}`);
  console.log(`最大供应量: ${maxSupply}`);
  console.log(`铸造价格: ${ethers.formatEther(mintPrice)} ETH`);
  console.log(`当前总供应量: ${totalSupply}`);

  // 测试铸造NFT
  console.log("\n=== 开始铸造NFT ===");
  
  try {
    const tokenURI = "1.json";
    console.log(`铸造NFT，tokenURI: ${tokenURI}`);
    
    // 调用mint函数（免费铸造，发送0 ETH）
    const mintTx = await fluxNFT.mint(tokenURI, { value: 0 });
    console.log(`交易哈希: ${mintTx.hash}`);
    
    // 等待交易确认
    const receipt = await mintTx.wait();
    console.log(`交易确认，区块: ${receipt?.blockNumber}`);
    
    // 获取新铸造的NFT信息
    const newTotalSupply = await fluxNFT.totalSupply();
    const tokenId = newTotalSupply - 1n; // 新铸造的tokenId
    const owner = await fluxNFT.ownerOf(tokenId);
    const tokenURIResult = await fluxNFT.tokenURI(tokenId);
    
    console.log("\n=== 铸造结果 ===");
    console.log(`新总供应量: ${newTotalSupply}`);
    console.log(`新NFT ID: ${tokenId}`);
    console.log(`NFT所有者: ${owner}`);
    console.log(`NFT URI: ${tokenURIResult}`);
    
    // 获取用户铸造数量
    const userMintedCount = await fluxNFT.getUserMintedCount(await signer.getAddress());
    console.log(`用户已铸造数量: ${userMintedCount}`);
    
  } catch (error) {
    console.error("铸造失败:", error);
  }

  // 测试批量铸造
  console.log("\n=== 测试批量铸造 ===");
  
  try {
    const tokenURIs = ["2.json", "3.json"];
    console.log(`批量铸造NFT，tokenURIs: ${tokenURIs.join(", ")}`);
    
    const batchMintTx = await fluxNFT.mintBatch(tokenURIs, { value: 0 });
    console.log(`批量铸造交易哈希: ${batchMintTx.hash}`);
    
    const batchReceipt = await batchMintTx.wait();
    console.log(`批量铸造确认，区块: ${batchReceipt?.blockNumber}`);
    
    const finalTotalSupply = await fluxNFT.totalSupply();
    console.log(`最终总供应量: ${finalTotalSupply}`);
    
  } catch (error) {
    console.error("批量铸造失败:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

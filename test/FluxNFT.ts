import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("FluxNFT", function () {
  let fluxNFT: any;
  let owner: any;
  let user1: any;
  let user2: any;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const FluxNFT = await ethers.getContractFactory("FluxNFT");
    fluxNFT = await FluxNFT.deploy(
      "Flux NFT",
      "FLUX", 
      "https://api.fluxnft.com/metadata/"
    );
    await fluxNFT.waitForDeployment();
  });

  describe("部署", function () {
    it("应该正确设置合约参数", async function () {
      expect(await fluxNFT.name()).to.equal("Flux NFT");
      expect(await fluxNFT.symbol()).to.equal("FLUX");
      expect(await fluxNFT.MAX_SUPPLY()).to.equal(10000);
      expect(await fluxNFT.owner()).to.equal(await owner.getAddress());
    });

    it("应该设置正确的铸造价格", async function () {
      const mintPrice = await fluxNFT.mintPrice();
      expect(mintPrice).to.equal(0); // 免费铸造
    });
  });

  describe("铸造", function () {
    it("应该允许部署者铸造NFT", async function () {
      const tokenURI = "1.json";
      const mintPrice = await fluxNFT.mintPrice();
      
      await expect(fluxNFT.connect(owner).mint(tokenURI, { value: mintPrice }))
        .to.emit(fluxNFT, "Minted")
        .withArgs(await owner.getAddress(), 0, tokenURI);
      
      expect(await fluxNFT.ownerOf(0)).to.equal(await owner.getAddress());
      expect(await fluxNFT.tokenURI(0)).to.equal("https://api.fluxnft.com/metadata/" + tokenURI);
    });

    it("应该拒绝非部署者铸造", async function () {
      const tokenURI = "1.json";
      const mintPrice = await fluxNFT.mintPrice();
      
      await expect(fluxNFT.connect(user1).mint(tokenURI, { value: mintPrice }))
        .to.be.revertedWith("Only contract owner can mint");
    });

    it("应该允许部署者批量铸造", async function () {
      const tokenURIs = [
        "1.json"
      ];
      const mintPrice = await fluxNFT.mintPrice();
      const totalPrice = mintPrice * BigInt(tokenURIs.length);
      
      await fluxNFT.connect(owner).mintBatch(tokenURIs, { value: totalPrice });
      
      expect(await fluxNFT.ownerOf(0)).to.equal(await owner.getAddress());
    });

    it("应该允许管理员免费铸造", async function () {
      const tokenURI = "admin.json";
      
      await fluxNFT.adminMint(await user1.getAddress(), tokenURI);
      
      expect(await fluxNFT.ownerOf(0)).to.equal(await user1.getAddress());
      expect(await fluxNFT.tokenURI(0)).to.equal("https://api.fluxnft.com/metadata/" + tokenURI);
    });
  });

  describe("管理功能", function () {
    it("应该允许所有者更新铸造价格", async function () {
      const newPrice = ethers.parseEther("0.02");
      
      await expect(fluxNFT.setMintPrice(newPrice))
        .to.emit(fluxNFT, "PriceUpdated")
        .withArgs(0, newPrice); // 初始价格是0
      
      expect(await fluxNFT.mintPrice()).to.equal(newPrice);
    });

    it("应该允许所有者提取资金", async function () {
      // 先设置一个铸造价格
      await fluxNFT.setMintPrice(ethers.parseEther("0.01"));
      
      const tokenURI = "1.json";
      const mintPrice = await fluxNFT.mintPrice();
      
      // 铸造一个NFT (只有owner可以铸造)
      await fluxNFT.connect(owner).mint(tokenURI, { value: mintPrice });
      
      const balanceBefore = await ethers.provider.getBalance(await owner.getAddress());
      await fluxNFT.withdraw();
      const balanceAfter = await ethers.provider.getBalance(await owner.getAddress());
      
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("应该拒绝非所有者调用管理函数", async function () {
      await expect(fluxNFT.connect(user1).setMintPrice(ethers.parseEther("0.02")))
        .to.be.revertedWithCustomError(fluxNFT, "OwnableUnauthorizedAccount");
    });
  });

  describe("限制", function () {
    it("应该限制每个地址的铸造数量", async function () {
      const tokenURI = "1.json";
      const mintPrice = await fluxNFT.mintPrice();
      
      // 铸造1个NFT (maxMintPerAddress = 1)
      await fluxNFT.connect(owner).mint(tokenURI, { value: mintPrice });
      
      // 尝试铸造第2个应该失败
      await expect(fluxNFT.connect(owner).mint(tokenURI, { value: mintPrice }))
        .to.be.revertedWith("Max mint per address reached");
    });
  });
});

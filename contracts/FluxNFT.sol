// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FluxNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    
    // 基础URI
    string private _baseTokenURI;
    
    // 最大供应量
    uint256 public constant MAX_SUPPLY = 10000;
    
    // 铸造价格
    uint256 public mintPrice = 0;
    
    // 每个地址已铸造数量（保留用于统计，但不再限制）
    mapping(address => uint256) public mintedCount;
    
    // 元数据URI映射
    mapping(uint256 => string) private _tokenURIs;
    
    // 事件
    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    event BaseURIUpdated(string oldURI, string newURI);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseTokenURI;
    }

    // 公共铸造函数
    function mint(string memory _tokenURI) public payable {
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        mintedCount[msg.sender]++;
        
        emit Minted(msg.sender, tokenId, _tokenURI);
    }

    // 批量铸造
    function mintBatch(string[] memory tokenURIs) public payable {
        require(totalSupply() + tokenURIs.length <= MAX_SUPPLY, "Exceeds max supply");
        require(msg.value >= mintPrice * tokenURIs.length, "Insufficient payment");
        
        for (uint256 i = 0; i < tokenURIs.length; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
        }
        
        mintedCount[msg.sender] += tokenURIs.length;
    }

    // 管理员免费铸造
    function adminMint(address to, string memory _tokenURI) public onlyOwner {
        require(totalSupply() < MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        emit Minted(to, tokenId, _tokenURI);
    }

    // 设置铸造价格
    function setMintPrice(uint256 newPrice) public onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit PriceUpdated(oldPrice, newPrice);
    }


    // 设置基础URI
    function setBaseURI(string memory newBaseURI) public onlyOwner {
        string memory oldURI = _baseTokenURI;
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(oldURI, newBaseURI);
    }

    // 提取合约余额
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // 获取合约余额
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // 获取当前tokenId
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }

    // 获取用户已铸造数量
    function getUserMintedCount(address user) public view returns (uint256) {
        return mintedCount[user];
    }

    // 重写函数以支持多个继承
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }
}

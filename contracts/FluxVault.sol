// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract FluxVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable vaultToken;

    bool public isDepositActive = true;

    mapping(address => uint256) public userBalances;


    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    

    event AdminWithdrawn(address indexed to, uint256 amount);
    event VaultStateUpdated(bool isActive);


    constructor(
        address _token, 
        address _initialOwner
    ) Ownable(_initialOwner) {
        require(_token != address(0), "Invalid token address");
        vaultToken = IERC20(_token);
    }


    function deposit(uint256 amount) external nonReentrant {
        require(isDepositActive, "Vault is currently paused");
        require(amount > 0, "Amount must be > 0");

        vaultToken.safeTransferFrom(msg.sender, address(this), amount);
        userBalances[msg.sender] += amount;

        emit Deposited(msg.sender, amount, block.timestamp);
    }


    function adminWithdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        
        uint256 balance = vaultToken.balanceOf(address(this));
        require(balance >= amount, "Insufficient vault balance");

        vaultToken.safeTransfer(to, amount);
        emit AdminWithdrawn(to, amount);
    }


    function adminWithdrawAll(address to) external onlyOwner {
        uint256 balance = vaultToken.balanceOf(address(this));
        require(balance > 0, "Vault is empty");
        
        vaultToken.safeTransfer(to, balance);
        emit AdminWithdrawn(to, balance);
    }


    function setVaultState(bool _isActive) external onlyOwner {
        isDepositActive = _isActive;
        emit VaultStateUpdated(_isActive);
    }
}
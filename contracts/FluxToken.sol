// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title ERC20EIP3009Upgradeable
 */
abstract contract ERC20EIP3009Upgradeable is Initializable, ERC20Upgradeable, EIP712Upgradeable {
    
    bytes32 public constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH =
        keccak256("TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)");

    bytes32 public constant CANCEL_AUTHORIZATION_TYPEHASH =
        keccak256("CancelAuthorization(address authorizer,bytes32 nonce)");

    mapping(address => mapping(bytes32 => bool)) private _authorizationStates;

    event AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce);
    event AuthorizationCanceled(address indexed authorizer, bytes32 indexed nonce);


    function __ERC20EIP3009_init() internal onlyInitializing {
        
    }

    function authorizationState(address authorizer, bytes32 nonce) external view returns (bool) {
        return _authorizationStates[authorizer][nonce];
    }

    function transferWithAuthorization(
        address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s
    ) public virtual {
        require(block.timestamp > validAfter, "EIP3009: auth not valid");
        require(block.timestamp < validBefore, "EIP3009: auth expired");
        require(!_authorizationStates[from][nonce], "EIP3009: auth used");

        bytes32 structHash = keccak256(abi.encode(TRANSFER_WITH_AUTHORIZATION_TYPEHASH, from, to, value, validAfter, validBefore, nonce));
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, v, r, s);
        require(signer == from, "EIP3009: invalid signature");

        _authorizationStates[from][nonce] = true;
        emit AuthorizationUsed(from, nonce);
        _transfer(from, to, value);
    }

    function cancelAuthorization(address authorizer, bytes32 nonce, uint8 v, bytes32 r, bytes32 s) public virtual {
        require(!_authorizationStates[authorizer][nonce], "EIP3009: auth used");
        bytes32 structHash = keccak256(abi.encode(CANCEL_AUTHORIZATION_TYPEHASH, authorizer, nonce));
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(hash, v, r, s);
        require(signer == authorizer, "EIP3009: invalid signature");
        _authorizationStates[authorizer][nonce] = true;
        emit AuthorizationCanceled(authorizer, nonce);
    }
}

/**
 * @title Flux Token (Upgradeable)
 */
contract Flux is 
    Initializable, 
    ERC20Upgradeable, 
    ERC20PermitUpgradeable, 
    OwnableUpgradeable, 
    UUPSUpgradeable, 
    ERC20EIP3009Upgradeable 
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }


    function initialize(address initialOwner) public initializer {
        __ERC20_init("Flux Token", "FLUX");
        __ERC20Permit_init("Flux Token");
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        __ERC20EIP3009_init();

    
        _mint(initialOwner, 1000000 * 10 ** decimals());
    }


    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

 
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
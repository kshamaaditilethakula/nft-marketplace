// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract UpgradeableNFT is
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    uint256 public nextTokenId;
    string public baseTokenURI;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) public initializer {
        __ERC721_init(name, symbol);
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();

        baseTokenURI = baseURI;
    }

    function mint(address to) external onlyOwner {
        _safeMint(to, nextTokenId);
        nextTokenId++;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {
        // The governor (owner) is the only one who can upgrade the contract
    }

    function changeOwner(address newOwner) external onlyOwner {
        transferOwnership(newOwner);
    }
}

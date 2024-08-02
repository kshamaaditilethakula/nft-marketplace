// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract NFTWithSignatures is ERC721, Ownable {
    uint256 public nextTokenId;
    string public baseTokenURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {
        baseTokenURI = baseURI;
    }

    function mintTo(address _recipient, bytes memory _signature) external {
        if (!validateSignature(_recipient, _signature)) {
            revert("Invalid signature");
        }
        _safeMint(_recipient, nextTokenId);
        nextTokenId++;
    }

    function validateSignature(
        address _recipient,
        bytes memory _signature
    ) public view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(_recipient));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );
        address signer = ECDSA.recover(ethSignedMessageHash, _signature);

        return signer == owner();
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}

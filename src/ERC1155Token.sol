// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC1155Token is ERC1155, Ownable {
    mapping(uint256 => string) private _tokenURIs;

    constructor(
        string memory uri_,
        address initialOwner
    ) ERC1155(uri_) Ownable(initialOwner) {}

    function setTokenURI(
        uint256 tokenId,
        string memory newURI
    ) external onlyOwner {
        _tokenURIs[tokenId] = newURI;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];

        // If token URI is set, return it
        if (bytes(tokenURI).length > 0) {
            return tokenURI;
        }

        // Otherwise, return the default URI
        return super.uri(tokenId);
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external onlyOwner {
        _mint(to, id, amount, data);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) external onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTWithERC20Payments is ERC721, Ownable {
    uint256 public nextTokenId;
    string public baseTokenURI;
    IERC20 public paymentToken;
    uint256 public nftPrice;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address _paymentToken,
        uint256 _nftPrice,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {
        baseTokenURI = baseURI;
        paymentToken = IERC20(_paymentToken);
        nftPrice = _nftPrice;
    }

    function mint() external {
        require(
            paymentToken.transferFrom(msg.sender, address(this), nftPrice),
            "Payment failed"
        );
        _safeMint(msg.sender, nextTokenId);
        nextTokenId++;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function withdrawPayments() external onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(paymentToken.transfer(owner(), balance), "Transfer failed");
    }
}

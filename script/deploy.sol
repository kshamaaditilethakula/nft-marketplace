// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "src/NFTCollection.sol";

contract DeployNFTCollection {
    function run() external {
        vm.startBroadcast();
        new NFTCollection("MyNFTCollection", "MNFT", "ipfs://baseURI/", msg.sender);
        vm.stopBroadcast();
    }
}

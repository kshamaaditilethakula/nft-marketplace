// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol"; // Import Foundry VM library
import "../src/NFTCollection.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        new NFTCollection("My NFT Collection", "MNFT", "ipfs://baseURI/", msg.sender);
        vm.stopBroadcast();
    }
}

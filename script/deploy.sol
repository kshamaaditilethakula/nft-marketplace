// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "src/NFTCollection.sol";
import "forge-std/Script.sol";

contract DeployNFTCollection is Script {
    function run() external {
        vm.startBroadcast();
        new NFTCollection("MyNFTCollection", "MNFT", "ipfs://baseURI/", msg.sender);
        vm.stopBroadcast();
    }
}

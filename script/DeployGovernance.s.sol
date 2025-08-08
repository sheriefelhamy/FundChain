// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Governance.sol";

contract DeployGovernanceScript is Script {
    function run() external returns (address) {
        uint256 deployerPrivateKey = vm.envUint("OPERATOR_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        address mainContractAddress = vm.envAddress("MAIN_CONTRACT_ADDRESS");
        
        console.log("=== DEPLOYING GOVERNANCE ===");
        console.log("Deployer:", deployerAddress);
        console.log("Main Contract:", mainContractAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Governance
        Governance governance = new Governance(mainContractAddress);
        
        vm.stopBroadcast();
        
        console.log("Governance deployed at:", address(governance));
        
        // Save address to file
        vm.writeFile(
            "governance-address.txt",
            vm.toString(address(governance))
        );
        
        return address(governance);
    }
}
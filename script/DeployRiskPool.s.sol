// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/RiskPool.sol";

contract DeployRiskPoolScript is Script {
    function run() external returns (address) {
        uint256 deployerPrivateKey = vm.envUint("OPERATOR_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        console.log("=== DEPLOYING RISK POOL ===");
        console.log("Deployer:", deployerAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Risk Pool with temporary main contract address
        RiskPool riskPool = new RiskPool(address(0));
        
        // Add deployer as initial claim approver
        riskPool.addClaimApprover(deployerAddress);
        
        vm.stopBroadcast();
        
        console.log("Risk Pool deployed at:", address(riskPool));
        
        // Save address to file
        vm.writeFile(
            "risk-pool-address.txt", 
            vm.toString(address(riskPool))
        );
        
        return address(riskPool);
    }
}
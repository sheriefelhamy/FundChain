// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MicroInvestingPool.sol";
import "../src/RiskPool.sol";
import "../src/Governance.sol";

contract ConfigureScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("OPERATOR_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        address riskPoolAddress = vm.envAddress("RISK_POOL_ADDRESS"); 
        address mainContractAddress = vm.envAddress("MAIN_CONTRACT_ADDRESS");
        address governanceAddress = vm.envAddress("GOVERNANCE_CONTRACT_ADDRESS");
        
        console.log("=== CONFIGURING CONTRACTS ===");
        console.log("Risk Pool:", riskPoolAddress);
        console.log("Main Contract:", mainContractAddress);
        console.log("Governance:", governanceAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Get contract instances
        RiskPool riskPool = RiskPool(payable(riskPoolAddress));
        MicroInvestingPool mainContract = MicroInvestingPool(mainContractAddress);
        
        // Fund risk pool with initial amount
        riskPool.fundPool{value: 1 ether}();
        console.log("Risk Pool funded with 1 HBAR");
        
        // Additional configuration can go here
        // Example: Set platform fee rate
        // mainContract.updatePlatformFeeRate(250); // 2.5%
        
        vm.stopBroadcast();
        
        console.log("Configuration complete!");
    }
}
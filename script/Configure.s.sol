// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MicroInvestingPool.sol";
import "../src/RiskPool.sol";
import "../src/Governance.sol";

contract ConfigureScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        // Read deployed addresses
        string memory riskPoolAddressStr = vm.readFile("risk-pool-address.txt");
        string memory mainContractAddressStr = vm.readFile("main-contract-address.txt");
        string memory governanceAddressStr = vm.readFile("governance-address.txt");
        
        address riskPoolAddress = vm.parseAddress(riskPoolAddressStr);
        address mainContractAddress = vm.parseAddress(mainContractAddressStr);
        address governanceAddress = vm.parseAddress(governanceAddressStr);
        
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
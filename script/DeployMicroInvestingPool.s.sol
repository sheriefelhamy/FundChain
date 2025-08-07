// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MicroInvestingPool.sol";

contract DeployMainContractScript is Script {
    function run() external returns (address) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        address treasuryAddress = vm.envAddress("TREASURY_ADDRESS");
        
        // Read Risk Pool address
        string memory riskPoolAddressStr = vm.readFile("risk-pool-address.txt");
        address riskPoolAddress = vm.parseAddress(riskPoolAddressStr);
        
        console.log("=== DEPLOYING MAIN CONTRACT ===");
        console.log("Deployer:", deployerAddress);
        console.log("Risk Pool:", riskPoolAddress);
        console.log("Treasury:", treasuryAddress);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Main Investment Pool
        MicroInvestingPool mainContract = new MicroInvestingPool(
            riskPoolAddress,
            treasuryAddress
        );
        
        // Add deployer as authorized verifier
        mainContract.addAuthorizedVerifier(deployerAddress);
        
        vm.stopBroadcast();
        
        console.log("Main Contract deployed at:", address(mainContract));
        
        // Save address to file
        vm.writeFile(
            "main-contract-address.txt",
            vm.toString(address(mainContract))
        );
        
        return address(mainContract);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import {console} from "forge-std/Test.sol";

contract VerifyScript is Script{
    function run() external {
        // Load deployed addresses
        address riskPoolAddress = vm.envAddress("RISK_POOL_ADDRESS");
        address mainContractAddress = vm.envAddress("MAIN_CONTRACT_ADDRESS");
        address governanceAddress = vm.envAddress("GOVERNANCE_CONTRACT_ADDRESS");
        address treasuryAddress = vm.envAddress("TREASURY_ADDRESS");
        
        console.log("Verifying contracts...");
        
        // Verification commands (run these manually)
        console.log("\nRun these commands to verify:");
        //console.log("forge verify-contract", riskPoolAddress, "src/RiskPool.sol:RiskPool", "--constructor-args", abi.encode(mainContractAddress), "--rpc-url hedera_testnet");
        //console.log("forge verify-contract", mainContractAddress, "src/MicroInvestingPool.sol:MicroInvestingPool", "--constructor-args", abi.encode(riskPoolAddress, treasuryAddress), "--rpc-url hedera_testnet");
        //console.log("forge verify-contract", governanceAddress, "src/Governance.sol:Governance", "--constructor-args", abi.encode(mainContractAddress), "--rpc-url hedera_testnet");
    }
}
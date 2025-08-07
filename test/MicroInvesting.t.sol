// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/MicroInvestingPool.sol";
import "../src/RiskPool.sol";
import "../src/Governance.sol";

contract MicroInvestingTest is Test {
    MicroInvestingPool public mainContract;
    RiskPool public riskPool;
    Governance public governance;
    
    address public owner;
    address public businessOwner;
    address public investor1;
    address public investor2;
    address public treasury;
    
    function setUp() public {
        owner = address(this);
        businessOwner = makeAddr("businessOwner");
        investor1 = makeAddr("investor1");
        investor2 = makeAddr("investor2");
        treasury = makeAddr("treasury");
        
        // Deploy Risk Pool first
        riskPool = new RiskPool(address(0)); // Temporary address
        
        // Deploy Main Contract
        mainContract = new MicroInvestingPool(address(riskPool), treasury);
        
        // Deploy Governance
        governance = new Governance(address(mainContract));
        
        // Fund test accounts
        vm.deal(businessOwner, 100 ether);
        vm.deal(investor1, 10 ether);
        vm.deal(investor2, 10 ether);
    }
    
    function testBusinessOwnerRegistration() public {
        vm.startPrank(businessOwner);
        
        mainContract.registerBusinessOwner("hash_nid_123", "hash_license_456");
        
        (,string memory nationalId, string memory businessLicense, bool isVerified,,,,,) = 
            mainContract.businessOwners(businessOwner);
            
        assertEq(nationalId, "hash_nid_123");
        assertEq(businessLicense, "hash_license_456");
        assertEq(isVerified, false);
        
        vm.stopPrank();
    }
    
    function testCreateInvestmentAsk() public {
        // First register and verify business owner
        vm.prank(businessOwner);
        mainContract.registerBusinessOwner("hash_nid_123", "hash_license_456");
        
        // Verify business owner (as contract owner)
        mainContract.verifyBusinessOwner(businessOwner);
        
        // Create investment ask
        vm.prank(businessOwner);
        mainContract.createInvestmentAsk(
            1000 ether,           // target amount
            1500,                 // 15% expected return
            block.timestamp + 365 days, // return deadline
            block.timestamp + 30 days,  // campaign deadline
            "Test farm business",        // description
            "B+ (75/100)",              // risk score
            1 ether,                    // min investment
            100 ether                   // max investment
        );
        
        (uint256 askId, address owner_, uint256 targetAmount,,,,,,, MicroInvestingPool.AskStatus status) = 
            mainContract.getInvestmentAsk(1);
            
        assertEq(askId, 1);
        assertEq(owner_, businessOwner);
        assertEq(targetAmount, 1000 ether);
        assertTrue(status == MicroInvestingPool.AskStatus.Active);
    }
    
    function testInvestment() public {
        // Setup: register business owner and create ask
        vm.prank(businessOwner);
        mainContract.registerBusinessOwner("hash_nid_123", "hash_license_456");
        mainContract.verifyBusinessOwner(businessOwner);
        
        vm.prank(businessOwner);
        mainContract.createInvestmentAsk(
            1000 ether, 1500, block.timestamp + 365 days, 
            block.timestamp + 30 days, "Test farm", "B+", 
            1 ether, 100 ether
        );
        
        // Make investment
        vm.prank(investor1);
        mainContract.invest{value: 5 ether}(1, 5 ether);
        
        // Check investment recorded
        uint256 investment = mainContract.getInvestorInvestment(1, investor1);
        assertEq(investment, 5 ether);
        
        (, , , uint256 raisedAmount,,,,,,) = mainContract.getInvestmentAsk(1);
        assertEq(raisedAmount, 5 ether);
    }
    
    function testRiskPoolFunding() public {
        uint256 fundAmount = 10 ether;
        
        vm.prank(investor1);
        riskPool.fundPool{value: fundAmount}();
        
        assertEq(riskPool.totalPoolBalance(), fundAmount);
    }
    
    function test_RevertWhen_InvalidInvestment() public {
        // Try to invest in non-existent ask
        vm.prank(investor1);
        vm.expectRevert(MicroInvestingPool.MicroInvestingPool__InvestmentAskDoesNotExist.selector);
        mainContract.invest{value: 1 ether}(999, 1 ether);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";


// ============================================================================
// 1. MAIN INVESTMENT POOL CONTRACT
// ============================================================================

contract MicroInvestingPool is ReentrancyGuard, Ownable, Pausable {

    struct BusinessOwner {
        address wallet;
        string nationalId; // Hashed
        string businessLicense; // Hashed
        bool isVerified;
        bool isBlocked;
        uint256 successfulCampaigns;
        uint256 failedCampaigns;
        uint256 totalRaised;
        uint256 reputationScore; // 0-1000
    }

    struct InvestmentAsk {
        uint256 askId;
        address businessOwner;
        uint256 targetAmount;
        uint256 raisedAmount;
        uint256 expectedReturnRate; // Basis points (100 = 1%)
        uint256 returnDeadline;
        uint256 campaignDeadline;
        string businessDescription;
        string riskScore; // AI-generated risk score
        AskStatus status;
        uint256 minInvestment;
        uint256 maxInvestment;
        bool fundsDistributed;
        mapping(address => uint256) investments;
        address[] investors;
    }
    /* ERRORS */
    error MicroInvestingPool__NationalIdRequired();
    error MicroInvestingPool__BusinessLicenseRequired();
    error MicroInvestingPool__AlreadyRegistered();
    error MicroInvestingPool__NotAuthorizedVerifier();
    error MicroInvestingPool__NotAuthorized();
    error MicroInvestingPool__BusinessOwnerNotRegistered();
    error MicroInvestingPool__BusinessOwnerNotVerified();
    error MicroInvestingPool__BusinessOwnerBlocked();
    error MicroInvestingPool__TargetAmountMustBePositive();
    error MicroInvestingPool__CampaignDeadlineMustBeInFuture();
    error MicroInvestingPool__CampaignTooLong();
    error MicroInvestingPool__ReturnDeadlineMustBeAfterCampaign();
    error MicroInvestingPool__ReturnPeriodTooLong();
    error MicroInvestingPool__MinimumInvestmentTooLow();
    error MicroInvestingPool__InvalidInvestmentLimits();
    error MicroInvestingPool__InvestmentAskDoesNotExist();
    error MicroInvestingPool__InvestmentAskNotActive();
    error MicroInvestingPool__CampaignDeadlinePassed();
    error MicroInvestingPool__InvestmentBelowMinimum();
    error MicroInvestingPool__InvestmentAboveMaximum();
    error MicroInvestingPool__WouldExceedTarget();
    error MicroInvestingPool__IncorrectHbarAmount();
    error MicroInvestingPool__FundsAlreadyDistributed();
    error MicroInvestingPool__CampaignNotInFundedStatus();
    error MicroInvestingPool__ReturnDeadlinePassed();
    error MicroInvestingPool__InsufficientReturnAmount();
    error MicroInvestingPool__ReturnDeadlineNotPassed();
    error MicroInvestingPool__FeeRateTooHigh();

    enum AskStatus {
        Active,
        Funded,
        Successful,
        Failed,
        Cancelled
    }

    // State variables
    mapping(address => BusinessOwner) public businessOwners;
    mapping(uint256 => InvestmentAsk) public investmentAsks;
    mapping(address => bool) public authorizedVerifiers;
    
    uint256 public askCounter;
    uint256 public platformFeeRate = 250; // 2.5% in basis points
    uint256 public riskPoolPercentage = 200; // 2% goes to risk pool
    address public riskPoolAddress;
    address public treasuryAddress;
    
    // Minimum requirements
    uint256 public constant MIN_INVESTMENT = 1 * 10**18; // 1 USD equivalent
    uint256 public constant MAX_CAMPAIGN_DURATION = 90 days;
    uint256 public constant MAX_RETURN_PERIOD = 365 days;

    // Events
    event BusinessOwnerRegistered(address indexed owner, string nationalId);
    event InvestmentAskCreated(uint256 indexed askId, address indexed businessOwner, uint256 targetAmount);
    event InvestmentMade(uint256 indexed askId, address indexed investor, uint256 amount);
    event CampaignFunded(uint256 indexed askId, uint256 totalRaised);
    event ReturnsDistributed(uint256 indexed askId, uint256 totalReturns);
    event CampaignFailed(uint256 indexed askId, address indexed businessOwner);
    event BusinessOwnerBlocked(address indexed businessOwner);

    constructor(address _riskPoolAddress, address _treasuryAddress) 
        Ownable(msg.sender) 
    {
        riskPoolAddress = _riskPoolAddress;
        treasuryAddress = _treasuryAddress;
        authorizedVerifiers[msg.sender] = true; // Owner is an authorized verifier by default
    }

    // ========================================================================
    // BUSINESS OWNER FUNCTIONS
    // ========================================================================

    function registerBusinessOwner(
        string memory _nationalId,
        string memory _businessLicense
    ) external {
        if (bytes(_nationalId).length == 0) revert MicroInvestingPool__NationalIdRequired();
        if (bytes(_businessLicense).length == 0) revert MicroInvestingPool__BusinessLicenseRequired();        if (businessOwners[msg.sender].wallet != address(0)) revert MicroInvestingPool__AlreadyRegistered();
        businessOwners[msg.sender] = BusinessOwner({
            wallet: msg.sender,
            nationalId: _nationalId,
            businessLicense: _businessLicense,
            isVerified: false,
            isBlocked: false,
            successfulCampaigns: 0,
            failedCampaigns: 0,
            totalRaised: 0,
            reputationScore: 500 // Start with neutral score
        });

        emit BusinessOwnerRegistered(msg.sender, _nationalId);
    }

    function verifyBusinessOwner(address _businessOwner) external {
        if (!authorizedVerifiers[msg.sender]) revert MicroInvestingPool__NotAuthorizedVerifier();        if (businessOwners[_businessOwner].wallet == address(0)) revert MicroInvestingPool__BusinessOwnerNotRegistered();        
        businessOwners[_businessOwner].isVerified = true;
    }

    function createInvestmentAsk(
        uint256 _targetAmount,
        uint256 _expectedReturnRate,
        uint256 _returnDeadline,
        uint256 _campaignDeadline,
        string memory _businessDescription,
        string memory _riskScore,
        uint256 _minInvestment,
        uint256 _maxInvestment
    ) external whenNotPaused nonReentrant {
        BusinessOwner storage owner = businessOwners[msg.sender];
        if (!owner.isVerified) revert MicroInvestingPool__BusinessOwnerNotVerified();
        if (owner.isBlocked) revert MicroInvestingPool__BusinessOwnerBlocked();
        if (_targetAmount == 0) revert MicroInvestingPool__TargetAmountMustBePositive();
        if (_campaignDeadline <= block.timestamp) revert MicroInvestingPool__CampaignDeadlineMustBeInFuture();
        if (_campaignDeadline > block.timestamp + MAX_CAMPAIGN_DURATION) revert MicroInvestingPool__CampaignTooLong();
        if (_campaignDeadline > block.timestamp + MAX_CAMPAIGN_DURATION) revert MicroInvestingPool__CampaignTooLong();
        if (_returnDeadline > _campaignDeadline + MAX_RETURN_PERIOD) revert MicroInvestingPool__ReturnPeriodTooLong();
        if (_minInvestment < MIN_INVESTMENT) revert MicroInvestingPool__MinimumInvestmentTooLow();
        if (_maxInvestment < _minInvestment) revert MicroInvestingPool__InvalidInvestmentLimits();

        askCounter++;
        InvestmentAsk storage newAsk = investmentAsks[askCounter];
        
        newAsk.askId = askCounter;
        newAsk.businessOwner = msg.sender;
        newAsk.targetAmount = _targetAmount;
        newAsk.expectedReturnRate = _expectedReturnRate;
        newAsk.returnDeadline = _returnDeadline;
        newAsk.campaignDeadline = _campaignDeadline;
        newAsk.businessDescription = _businessDescription;
        newAsk.riskScore = _riskScore;
        newAsk.status = AskStatus.Active;
        newAsk.minInvestment = _minInvestment;
        newAsk.maxInvestment = _maxInvestment;

        emit InvestmentAskCreated(askCounter, msg.sender, _targetAmount);
    }

    // ========================================================================
    // INVESTOR FUNCTIONS
    // ========================================================================

    function invest(uint256 _askId, uint256 _amount) external payable whenNotPaused nonReentrant {
        if (investmentAsks[_askId].businessOwner == address(0)) revert MicroInvestingPool__InvestmentAskDoesNotExist();
        InvestmentAsk storage ask = investmentAsks[_askId];
        if (ask.status != AskStatus.Active) revert MicroInvestingPool__InvestmentAskNotActive();
        if (block.timestamp > ask.campaignDeadline) revert MicroInvestingPool__CampaignDeadlinePassed();
        if (_amount < ask.minInvestment) revert MicroInvestingPool__InvestmentBelowMinimum();
        if (_amount > ask.maxInvestment) revert MicroInvestingPool__InvestmentAboveMaximum();
        if (ask.raisedAmount + _amount > ask.targetAmount) revert MicroInvestingPool__WouldExceedTarget();
        if (msg.value != _amount) revert MicroInvestingPool__IncorrectHbarAmount();


        // Record investment
        if (ask.investments[msg.sender] == 0) {
            ask.investors.push(msg.sender);
        }
        ask.investments[msg.sender] = ask.investments[msg.sender] + _amount;
        ask.raisedAmount = ask.raisedAmount + _amount;

        // Check if campaign is fully funded
        if (ask.raisedAmount >= ask.targetAmount) {
            ask.status = AskStatus.Funded;
            _distributeFunds(_askId);
            emit CampaignFunded(_askId, ask.raisedAmount);
        }

        emit InvestmentMade(_askId, msg.sender, _amount);
    }

    function _distributeFunds(uint256 _askId) internal {
        InvestmentAsk storage ask = investmentAsks[_askId];
        if (ask.fundsDistributed) revert MicroInvestingPool__FundsAlreadyDistributed();
        
        uint256 platformFee = ask.raisedAmount*platformFeeRate/10000;
        uint256 riskPoolAmount = ask.raisedAmount*riskPoolPercentage/10000;
        uint256 businessOwnerAmount = ask.raisedAmount-platformFee-riskPoolAmount;
        
        ask.fundsDistributed = true;
        businessOwners[ask.businessOwner].totalRaised = businessOwners[ask.businessOwner].totalRaised+ask.raisedAmount;

        // Transfer funds
        payable(ask.businessOwner).transfer(businessOwnerAmount);
        payable(treasuryAddress).transfer(platformFee);
        payable(riskPoolAddress).transfer(riskPoolAmount);
        }

    // ========================================================================
    // RETURN & RESOLUTION FUNCTIONS
    // ========================================================================

    function distributeReturns(uint256 _askId) external payable nonReentrant {
        if (!(authorizedVerifiers[msg.sender] || msg.sender == owner())) revert MicroInvestingPool__NotAuthorized();
        InvestmentAsk storage ask = investmentAsks[_askId];
        if (ask.status != AskStatus.Funded) revert MicroInvestingPool__CampaignNotInFundedStatus();
        if (block.timestamp > ask.returnDeadline) revert MicroInvestingPool__ReturnDeadlinePassed();
        
        uint256 expectedReturns = ask.raisedAmount*ask.expectedReturnRate+10000/10000;
        if (msg.value < expectedReturns) revert MicroInvestingPool__InsufficientReturnAmount();

        // Distribute returns proportionally to investors
        for (uint256 i = 0; i < ask.investors.length; i++) {
            address investor = ask.investors[i];
            uint256 investment = ask.investments[investor];
            uint256 returnAmount = expectedReturns*investment/ask.raisedAmount;
            payable(investor).transfer(returnAmount);
        }

        ask.status = AskStatus.Successful;
        businessOwners[ask.businessOwner].successfulCampaigns++;

        emit ReturnsDistributed(_askId, expectedReturns);
    }

    function markCampaignFailed(uint256 _askId) external {
        if (!(authorizedVerifiers[msg.sender] || msg.sender == owner())) revert MicroInvestingPool__NotAuthorized();
        InvestmentAsk storage ask = investmentAsks[_askId];
        if (ask.status != AskStatus.Funded) revert MicroInvestingPool__CampaignNotInFundedStatus();
        if (block.timestamp <= ask.returnDeadline) revert MicroInvestingPool__ReturnDeadlineNotPassed();

        ask.status = AskStatus.Failed;
        businessOwners[ask.businessOwner].failedCampaigns++;

        // Block business owner after failure
        businessOwners[ask.businessOwner].isBlocked = true;

        emit CampaignFailed(_askId, ask.businessOwner);
        emit BusinessOwnerBlocked(ask.businessOwner);
    }

    // ========================================================================
    // DAO FUNCTIONS
    // ========================================================================

    function addAuthorizedVerifier(address _verifier) external onlyOwner {
        authorizedVerifiers[_verifier] = true;
    }

    function removeAuthorizedVerifier(address _verifier) external onlyOwner {
        authorizedVerifiers[_verifier] = false;
    }

    function updatePlatformFeeRate(uint256 _newRate) external onlyOwner {
        if (_newRate > 1000) revert MicroInvestingPool__FeeRateTooHigh(); // Max 10%
        platformFeeRate = _newRate;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ========================================================================
    // VIEW FUNCTIONS
    // ========================================================================

    function getInvestmentAsk(uint256 _askId) external view returns (
        uint256 askId,
        address businessOwner,
        uint256 targetAmount,
        uint256 raisedAmount,
        uint256 expectedReturnRate,
        uint256 returnDeadline,
        uint256 campaignDeadline,
        string memory businessDescription,
        string memory riskScore,
        AskStatus status
    ) {
        InvestmentAsk storage ask = investmentAsks[_askId];
        return (
            ask.askId,
            ask.businessOwner,
            ask.targetAmount,
            ask.raisedAmount,
            ask.expectedReturnRate,
            ask.returnDeadline,
            ask.campaignDeadline,
            ask.businessDescription,
            ask.riskScore,
            ask.status
        );
    }

    function getInvestorInvestment(uint256 _askId, address _investor) external view returns (uint256) {
        return investmentAsks[_askId].investments[_investor];
    }

    function getInvestorShare(uint256 _askId, address _investor) external view returns (uint256) {
    InvestmentAsk storage ask = investmentAsks[_askId];
    if (ask.raisedAmount == 0) return 0;
    return (ask.investments[_investor] * 1e18) / ask.raisedAmount; // 1e18 = 100% in basis points
    }

    function getBusinessOwnerStats(address _businessOwner) external view returns (
        bool isVerified,
        bool isBlocked,
        uint256 successfulCampaigns,
        uint256 failedCampaigns,
        uint256 totalRaised,
        uint256 reputationScore
    ) {
        BusinessOwner storage owner = businessOwners[_businessOwner];
        return (
            owner.isVerified,
            owner.isBlocked,
            owner.successfulCampaigns,
            owner.failedCampaigns,
            owner.totalRaised,
            owner.reputationScore
        );
    }
}
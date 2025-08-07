// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";


contract RiskPool is ReentrancyGuard, Ownable {

    struct Claim {
        uint256 claimId;
        uint256 askId;
        address claimant;
        uint256 requestedAmount;
        uint256 approvedAmount;
        ClaimStatus status;
        uint256 timestamp;
        string reason;
    }
    /* ERRORS */
    error RiskPool__RequestedAmountMustBePositive();
    error RiskPool__ClaimExceedsMaximum();
    error RiskPool__NotAuthorizedToApproveClaims();
    error RiskPool__ClaimNotPending();
    error RiskPool__ApprovedAmountExceedsRequested();
    error RiskPool__InsufficientPoolBalance();
    error RiskPool__ClaimNotApproved();
    error RiskPool__PercentageCannotExceed100();
    
    enum ClaimStatus {
        Pending,
        Approved,
        Rejected,
        Paid
    }

    mapping(uint256 => Claim) public claims;
    mapping(address => bool) public authorizedClaimApprovers;
    
    uint256 public claimCounter;
    uint256 public totalPoolBalance;
    uint256 public totalClaimsPaid;
    uint256 public maxClaimPercentage = 5000; // 50% of pool balance
    
    address public mainContractAddress;

    event PoolFunded(address indexed funder, uint256 amount);
    event ClaimSubmitted(uint256 indexed claimId, uint256 askId, address indexed claimant, uint256 amount);
    event ClaimApproved(uint256 indexed claimId, uint256 approvedAmount);
    event ClaimPaid(uint256 indexed claimId, address indexed claimant, uint256 amount);

    constructor(address _mainContract) 
        Ownable(msg.sender) 
    {
        mainContractAddress = _mainContract;
    }

    receive() external payable {
        totalPoolBalance = totalPoolBalance + msg.value;
        emit PoolFunded(msg.sender, msg.value);
    }

    function fundPool() external payable {
        totalPoolBalance = totalPoolBalance+msg.value;
        emit PoolFunded(msg.sender, msg.value);
    }

    function submitClaim(
        uint256 _askId,
        uint256 _requestedAmount,
        string memory _reason
    ) external nonReentrant {
        if (_requestedAmount == 0) revert RiskPool__RequestedAmountMustBePositive();
        if (_requestedAmount > (totalPoolBalance * maxClaimPercentage) / 10000) revert RiskPool__ClaimExceedsMaximum();

        claimCounter++;
        claims[claimCounter] = Claim({
            claimId: claimCounter,
            askId: _askId,
            claimant: msg.sender,
            requestedAmount: _requestedAmount,
            approvedAmount: 0,
            status: ClaimStatus.Pending,
            timestamp: block.timestamp,
            reason: _reason
        });

        emit ClaimSubmitted(claimCounter, _askId, msg.sender, _requestedAmount);
    }

    function approveClaim(uint256 _claimId, uint256 _approvedAmount) external {
        if (!authorizedClaimApprovers[msg.sender]) revert RiskPool__NotAuthorizedToApproveClaims();
        Claim storage claim = claims[_claimId];
        if (claim.status != ClaimStatus.Pending) revert RiskPool__ClaimNotPending();
        if (_approvedAmount > claim.requestedAmount) revert RiskPool__ApprovedAmountExceedsRequested();
        if (_approvedAmount > totalPoolBalance) revert RiskPool__InsufficientPoolBalance();

        claim.approvedAmount = _approvedAmount;
        claim.status = ClaimStatus.Approved;

        emit ClaimApproved(_claimId, _approvedAmount);
    }

    function payClaim(uint256 _claimId) external nonReentrant {
        Claim storage claim = claims[_claimId];
        if (claim.status != ClaimStatus.Approved) revert RiskPool__ClaimNotApproved();        if (claim.approvedAmount > totalPoolBalance) revert RiskPool__InsufficientPoolBalance();

        totalPoolBalance = totalPoolBalance-claim.approvedAmount;
        totalClaimsPaid = totalClaimsPaid+claim.approvedAmount;
        claim.status = ClaimStatus.Paid;

        payable(claim.claimant).transfer(claim.approvedAmount);

        emit ClaimPaid(_claimId, claim.claimant, claim.approvedAmount);
    }

    function addClaimApprover(address _approver) external onlyOwner {
        authorizedClaimApprovers[_approver] = true;
    }

    function removeClaimApprover(address _approver) external onlyOwner {
        authorizedClaimApprovers[_approver] = false;
    }

    function updateMaxClaimPercentage(uint256 _newPercentage) external onlyOwner {
        if (_newPercentage > 10000) revert RiskPool__PercentageCannotExceed100();        maxClaimPercentage = _newPercentage;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";


contract Governance is ReentrancyGuard, Ownable {

    struct Proposal {
        uint256 proposalId;
        address proposer;
        string title;
        string description;
        ProposalType proposalType;
        bytes proposalData;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        ProposalStatus status;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) voteWeight;
    }

    /* ERRORS */
    error Governance__NoVotingPower();
    error Governance__ProposalNotActive();
    error Governance__VotingPeriodEnded();
    error Governance__AlreadyVoted();
    error Governance__VotingPeriodNotEnded();
    error Governance__OnlyMainContractCanUpdate();

    enum ProposalType {
        ParameterChange,
        BusinessOwnerUnblock,
        PlatformUpgrade,
        RiskPoolAllocation
    }

    enum ProposalStatus {
        Active,
        Passed,
        Failed,
        Executed
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public votingPower; // Based on investment history
    
    uint256 public proposalCounter;
    uint256 public votingPeriod = 7 days;
    uint256 public quorumThreshold = 1000; // 10% participation
    uint256 public passingThreshold = 5000; // 50% of votes
    
    address public mainContractAddress;

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address _mainContract) 
        Ownable(msg.sender) 
    {
        mainContractAddress = _mainContract;
    }


    function createProposal(
        string memory _title,
        string memory _description,
        ProposalType _proposalType,
        bytes memory _proposalData
    ) external {
        if (votingPower[msg.sender] == 0) revert Governance__NoVotingPower();


        proposalCounter++;
        Proposal storage newProposal = proposals[proposalCounter];
        
        newProposal.proposalId = proposalCounter;
        newProposal.proposer = msg.sender;
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.proposalType = _proposalType;
        newProposal.proposalData = _proposalData;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + votingPeriod ;
        newProposal.status = ProposalStatus.Active;

        emit ProposalCreated(proposalCounter, msg.sender, _title);
    }

    function vote(uint256 _proposalId, bool _support) external {
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.status != ProposalStatus.Active) revert Governance__ProposalNotActive();
        if (block.timestamp > proposal.endTime) revert Governance__VotingPeriodEnded();

        if (proposal.hasVoted[msg.sender]) revert Governance__AlreadyVoted();
        if (votingPower[msg.sender] == 0) revert Governance__NoVotingPower();


        proposal.hasVoted[msg.sender] = true;
        proposal.voteWeight[msg.sender] = votingPower[msg.sender];

        if (_support) {
            proposal.votesFor = proposal.votesFor+votingPower[msg.sender];
        } else {
            proposal.votesAgainst = proposal.votesAgainst+votingPower[msg.sender];
        }

        emit VoteCast(_proposalId, msg.sender, _support, votingPower[msg.sender]);
    }

    function executeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        if (proposal.status != ProposalStatus.Active) revert Governance__ProposalNotActive();
        if (block.timestamp <= proposal.endTime) revert Governance__VotingPeriodNotEnded();

        uint256 totalVotes = proposal.votesFor+proposal.votesAgainst;
        
        // Check quorum
        if (totalVotes < quorumThreshold) {
            proposal.status = ProposalStatus.Failed;
            return;
        }

        // Check if passed
        if ((proposal.votesFor*10000)/totalVotes >= passingThreshold) {
            proposal.status = ProposalStatus.Passed;
            // Execute proposal logic here
            _executeProposalLogic(proposal);
            proposal.status = ProposalStatus.Executed;
            emit ProposalExecuted(_proposalId);
        } else {
            proposal.status = ProposalStatus.Failed;
        }
    }

    function _executeProposalLogic(Proposal storage _proposal) internal {
        // Implementation depends on proposal type
        // This would integrate with the main contract
    }

    function updateVotingPower(address _user, uint256 _power) external {
        if(msg.sender != mainContractAddress) revert Governance__OnlyMainContractCanUpdate();
        votingPower[_user] = _power;
    }
}
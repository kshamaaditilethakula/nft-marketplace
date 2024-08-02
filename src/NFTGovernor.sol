// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

contract NFTGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    struct Proposal {
        uint256 id;
        string description;
        uint8 state;
    }

    Proposal[] public proposals;
    address public upgradeableNFTAddress;

    constructor(
        IVotes _token,
        address _upgradeableNFTAddress
    )
        Governor("NFTGovernor")
        GovernorSettings(1 /* 1 block */, 50400 /* 1 week */, 0)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)
    {
        upgradeableNFTAddress = _upgradeableNFTAddress;
    }

    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(
        uint256 blockNumber
    )
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    // Custom functions
    function getProposals() public view returns (Proposal[] memory) {
        return proposals;
    }

    function proposeMint(
        address to,
        string memory description
    ) public returns (uint256) {
        bytes memory mintCalldata = abi.encodeWithSignature(
            "mint(address)",
            to
        );
        address[] memory targets = new address[](1);
        targets[0] = upgradeableNFTAddress;
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = mintCalldata;

        uint256 proposalId = propose(targets, values, calldatas, description);
        proposals.push(
            Proposal(proposalId, description, uint8(ProposalState.Pending))
        );

        return proposalId;
    }

    function executeProposal(uint256 proposalId) public {
        ProposalState proposalState = state(proposalId);
        require(
            proposalState == ProposalState.Succeeded,
            "Proposal must be succeeded"
        );

        Proposal storage proposal = proposals[proposalId];
        address[] memory targets = new address[](1);
        targets[0] = upgradeableNFTAddress;
        uint256[] memory values = new uint256[](1);
        values[0] = 0;
        bytes[] memory calldatas = new bytes[](1);
        calldatas[0] = abi.encodeWithSignature("mint(address)", address(this));

        execute(
            targets,
            values,
            calldatas,
            keccak256(bytes(proposal.description))
        );
        proposal.state = uint8(ProposalState.Executed);
    }
}

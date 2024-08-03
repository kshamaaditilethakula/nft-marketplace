import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Button, TextField, Typography, Box, Card, CardContent, Grid, CircularProgress, Alert } from "@mui/material";

import NFTGovernorJSON from "./abis/NFTGovernor.json";
import UpgradeableNFTJSON from "./abis/UpgradeableNFT.json";

interface Proposal {
  id: string;
  description: string;
  status: string;
}

interface GovernanceUIProps {
  governorAddress: string;
  nftContractAddress: string;
}

const GovernanceUI: React.FC<GovernanceUIProps> = ({ governorAddress, nftContractAddress }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [newProposalDescription, setNewProposalDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [governorContract, setGovernorContract] = useState<ethers.Contract | null>(null);
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null);

  const fetchProposals = useCallback(async () => {
    if (governorContract) {
      setLoading(true);
      try {
        const proposalsData = await governorContract.getProposals();
        console.log(proposalsData);
        const formattedProposals = await Promise.all(
          proposalsData.map(async (p: any) => ({
            id: p.id.toString(),
            description: p.description,
            status: (await governorContract.state(p.id)).toString(),
          }))
        );
        console.log("formatedProposals", formattedProposals);
        setProposals(formattedProposals);
      } catch (error) {
        console.error("Error fetching proposals:", error);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { ethereum } = window as any;
      if (ethereum && ethereum.request) {
        await ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        setSigner(signer);

        const governor = new ethers.Contract(governorAddress, NFTGovernorJSON.abi, signer);
        setGovernorContract(governor);

        const nft = new ethers.Contract(nftContractAddress, UpgradeableNFTJSON.abi, signer);
        setNftContract(nft);

        await fetchProposals();
      }
    };

    if (governorAddress && nftContractAddress) {
      init();
    }
  }, [governorAddress, nftContractAddress, fetchProposals]);

  const handleCreateProposal = async () => {
    if (governorContract && signer) {
      setLoading(true);
      try {
        const address = await signer.getAddress();
        const tx = await governorContract.proposeMint(address, newProposalDescription);
        await tx.wait();
        setNewProposalDescription("");
        await fetchProposals();
      } catch (error) {
        console.error("Error creating proposal:", error);
      }
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: string, support: boolean) => {
    if (governorContract) {
      setLoading(true);
      try {
        const tx = await governorContract.castVote(proposalId, support ? 1 : 0);
        await tx.wait();
        await fetchProposals();
      } catch (error) {
        console.error("Error voting:", error);
      }
      setLoading(false);
    }
  };

  const handleQueue = async (proposalId: string) => {
    if (governorContract && signer) {
      setLoading(true);
      try {
        const proposal = proposals.find((p) => p.id === proposalId);
        if (proposal) {
          const tx = await governorContract.queueProposal(proposalId);
          await tx.wait();
          await fetchProposals();
        }
      } catch (error) {
        console.error("Error queueing proposal:", error);
      }
      setLoading(false);
    }
  };

  const handleExecute = async (proposalId: string) => {
    if (governorContract && signer) {
      setLoading(true);
      try {
        const proposal = proposals.find((p) => p.id === proposalId);
        if (proposal) {
          const tx = await governorContract.executeProposal(proposalId);
          await tx.wait();
          await fetchProposals();
        }
      } catch (error) {
        console.error("Error executing proposal:", error);
      }
      setLoading(false);
    }
  };

  if (!governorAddress || !nftContractAddress) {
    return <Alert severity="warning">Governor address and NFT contract address are required.</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Governance Dashboard
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Create New Proposal
          </Typography>
          <TextField fullWidth label="Proposal Description" value={newProposalDescription} onChange={(e) => setNewProposalDescription(e.target.value)} sx={{ mb: 2 }} />
          <Button variant="contained" onClick={handleCreateProposal} disabled={loading || !newProposalDescription}>
            Create Proposal
          </Button>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Active Proposals
      </Typography>
      <Button variant="outlined" onClick={fetchProposals} disabled={loading}>
        Fetch Proposals
      </Button>

      {loading && <CircularProgress />}

      {proposals.map((proposal) => (
        <Card key={proposal.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1">{proposal.description}</Typography>
            <Typography variant="body2" color="text.secondary">
              Status: {proposal.status}
            </Typography>
            <Grid container spacing={1} sx={{ mt: 2 }}>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => handleVote(proposal.id, true)}
                  disabled={proposal.status !== "1"} // Active
                >
                  Vote For
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => handleVote(proposal.id, false)}
                  disabled={proposal.status !== "1"} // Active
                >
                  Vote Against
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => handleQueue(proposal.id)}
                  disabled={proposal.status !== "4"} // Succeeded
                >
                  Queue
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => handleExecute(proposal.id)}
                  disabled={proposal.status !== "5"} // Queued
                >
                  Execute
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default GovernanceUI;

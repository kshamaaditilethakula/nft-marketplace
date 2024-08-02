import React from "react";
import { Box, Grid, Typography } from "@mui/material";

interface SelectiveNFTInfoProps {
  selectedType: string;
  erc20TokenAddress: string;
  governanceTokenAddress: string;
  governorAddress: string;
}

const SelectiveNFTInfo: React.FC<SelectiveNFTInfoProps> = ({ selectedType, erc20TokenAddress, governanceTokenAddress, governorAddress }) => {
  return (
    <Box my={4}>
      <Grid container spacing={3}>
        {selectedType === "erc20payments" && (
          <Grid item xs={12}>
            <Typography>ERC20 token address: {erc20TokenAddress}</Typography>
          </Grid>
        )}
        {selectedType === "upgradeableWithGovernance" && (
          <>
            <Grid item xs={12}>
              <Typography>Governance token address: {governanceTokenAddress}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>Governor address: {governorAddress}</Typography>
            </Grid>
          </>
        )}
        {selectedType === "plain" && (
          <Grid item xs={12}>
            <Typography>Plain NFT selected. No additional information to display.</Typography>
          </Grid>
        )}
        {selectedType === "erc1155" && (
          <Grid item xs={12}>
            <Typography>ERC1155 token selected. No additional addresses to display.</Typography>
          </Grid>
        )}
        {selectedType === "offchainSignatures" && (
          <Grid item xs={12}>
            <Typography>NFT with off-chain signatures selected. No additional addresses to display.</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SelectiveNFTInfo;

import React from "react";
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";

interface NFTTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const NFTTypeSelector: React.FC<NFTTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onTypeChange(event.target.value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="nft-type-label">NFT Type</InputLabel>
      <Select labelId="nft-type-label" id="nft-type-select" value={selectedType} label="NFT Type" onChange={handleChange}>
        <MenuItem value="plain">Plain NFT</MenuItem>
        <MenuItem value="erc20payments">NFT with ERC20 Payments</MenuItem>
        <MenuItem value="upgradeableWithGovernance">Upgradeable NFT with Governance</MenuItem>
        <MenuItem value="erc1155">ERC1155 Tokens</MenuItem>
        <MenuItem value="offchainSignatures">NFT with Off-chain Signatures</MenuItem>
      </Select>
    </FormControl>
  );
};

export default NFTTypeSelector;

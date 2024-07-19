import { useState } from 'react';
import { ethers } from 'ethers';
import NFTCollection from '../abis/NFTCollection.json';

const { abi: NFTCollectionABI, bytecode: NFTCollectionBytecode } = NFTCollection;

console.log('NFTCollectionABI:', NFTCollectionABI); // Add this to check the ABI format

const useNFTCollection = () => {
  const { ethereum } = window as any;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const [contractAddress, setContractAddress] = useState<string | null>(null);

  const deployNFTCollection = async (name: string, symbol: string, baseURI: string) => {
    const factory = new ethers.ContractFactory(NFTCollectionABI, NFTCollectionBytecode, signer);
    const contract = await factory.deploy(name, symbol, baseURI, await signer.getAddress());
    await contract.deployed();
    setContractAddress(contract.address);
    console.log('NFT Collection deployed at:', contract.address);
  };

  const mintNFT = async (to: string) => {
    if (!contractAddress) throw new Error('Contract address is not set');
    const contract = new ethers.Contract(contractAddress, NFTCollectionABI, signer);
    console.log('Attempting to mint NFT to address:', to);
    if (!ethers.utils.isAddress(to)) {
      throw new Error('Invalid address');
    }
    await contract.mint(to);
  };

  return { deployNFTCollection, mintNFT, contractAddress };
};

export default useNFTCollection;

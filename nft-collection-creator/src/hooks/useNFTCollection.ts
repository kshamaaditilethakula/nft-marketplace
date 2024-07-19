import { ethers } from 'ethers';
import NFTCollection from '../abis/NFTCollection.json';

const { abi: NFTCollectionABI } = NFTCollection;

console.log('NFTCollectionABI:', NFTCollectionABI);

const useNFTCollection = (contractAddress: string) => {
  console.log('Contract address:', contractAddress);
  console.log('ABI type:', Array.isArray(NFTCollectionABI));

  const { ethereum } = window as any;
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, NFTCollectionABI, signer);

  const mintNFT = async (to: string) => {
    console.log('Attempting to mint NFT to address:', to);
    if (!ethers.utils.isAddress(to)) {
      throw new Error('Invalid address');
    }
    await contract.mint(to);
  };

  return { mintNFT };
};

export default useNFTCollection;

import { ethers } from 'ethers';
import NFTCollectionABI from '../abis/NFTCollection.json';

const useNFTCollection = (contractAddress: string) => {
    const { ethereum } = window as any;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, NFTCollectionABI, signer);

    const mintNFT = async (to: string) => {
        await contract.mint(to);
    };

    return { mintNFT };
};

export default useNFTCollection;

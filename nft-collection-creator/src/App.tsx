import React, { useState } from 'react';
import { Web3Modal } from '@web3modal/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import useNFTCollection from './hooks/useNFTCollection';

const App: React.FC = () => {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const [ipfsUrls, setIpfsUrls] = useState<string[]>([]);
    const [collectionAddress, setCollectionAddress] = useState<string>('');
    const { mintNFT } = useNFTCollection(collectionAddress);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        // Handle file upload to Pinata and set IPFS URLs
    };

    const handleMint = async (ipfsUrl: string) => {
        await mintNFT(address);
    };

    return (
        <div>
            <h1>NFT Collection Creator</h1>
            {!isConnected ? (
                <button onClick={() => connect()}>Connect Wallet</button>
            ) : (
                <button onClick={() => disconnect()}>Disconnect Wallet</button>
            )}
            <input type="file" onChange={handleUpload} multiple />
            <input
                type="text"
                placeholder="Contract Address"
                value={collectionAddress}
                onChange={(e) => setCollectionAddress(e.target.value)}
            />
            <div>
                {ipfsUrls.map((url, index) => (
                    <div key={index}>
                        <img src={`https://ipfs.io/ipfs/${url}`} alt="NFT" />
                        <button onClick={() => handleMint(url)}>Mint NFT</button>
                    </div>
                ))}
            </div>
            <Web3Modal projectId="YOUR_PROJECT_ID" />
        </div>
    );
};

export default App;

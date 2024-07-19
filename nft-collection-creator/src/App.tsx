import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import useNFTCollection from './hooks/useNFTCollection';
import { uploadToPinata } from './utils/pinata';

const App: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const [ipfsUrls, setIpfsUrls] = useState<string[]>([]);
  const [collectionAddress, setCollectionAddress] = useState<string>('');
  const { mintNFT } = useNFTCollection(collectionAddress);
  const [mintedNFTs, setMintedNFTs] = useState<string[]>([]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const uploadedUrls = [];
    for (const file of Array.from(files)) {
      const result = await uploadToPinata(file);
      uploadedUrls.push(result.IpfsHash);
    }
    setIpfsUrls(uploadedUrls);
  };

  const handleMint = async (ipfsUrl: string) => {
    try {
      if (!address) {
        throw new Error('No connected wallet address found');
      }
      console.log('Minting NFT to address:', address);
      await mintNFT(address);
      console.log(`Minted NFT with IPFS URL: ${ipfsUrl}`);
      setMintedNFTs((prev) => [...prev, ipfsUrl]);
    } catch (error) {
      console.error('Minting NFT failed:', error);
    }
  };

  useEffect(() => {
    console.log('Minted NFTs:', mintedNFTs);
  }, [mintedNFTs]);

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
      <h2>Minted NFTs</h2>
      <div>
        {mintedNFTs.map((url, index) => (
          <div key={index}>
            <img src={`https://ipfs.io/ipfs/${url}`} alt="Minted NFT" />
            <p>IPFS URL: {url}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

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
  const [collectionName, setCollectionName] = useState<string>('');
  const [collectionSymbol, setCollectionSymbol] = useState<string>('');
  const [baseURI, setBaseURI] = useState<string>('');
  const { deployNFTCollection, mintNFT, contractAddress } = useNFTCollection();
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

  const handleDeploy = async (name: string, symbol: string, baseURI: string) => {
    try {
      await deployNFTCollection(name, symbol, baseURI);
    } catch (error) {
      console.error('Deploying NFT Collection failed:', error);
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
        placeholder="Collection Name"
        value={collectionName}
        onChange={(e) => setCollectionName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Collection Symbol"
        value={collectionSymbol}
        onChange={(e) => setCollectionSymbol(e.target.value)}
      />
      <input
        type="text"
        placeholder="Base URI"
        value={baseURI}
        onChange={(e) => setBaseURI(e.target.value)}
      />
      <button onClick={() => handleDeploy(collectionName, collectionSymbol, baseURI)}>Deploy NFT Collection</button>
      {contractAddress && (
        <div>
          <input
            type="text"
            placeholder="Mint to Address"
            value={collectionAddress}
            onChange={(e) => setCollectionAddress(e.target.value)}
          />
          {ipfsUrls.map((url, index) => (
            <div key={index}>
              <img src={`https://ipfs.io/ipfs/${url}`} alt="NFT" />
              <button onClick={() => handleMint(url)}>Mint NFT</button>
            </div>
          ))}
        </div>
      )}
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

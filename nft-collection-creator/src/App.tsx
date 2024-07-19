import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import useNFTCollection from './hooks/useNFTCollection';
import { uploadToPinata } from './utils/pinata';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CssBaseline,
  Link,
} from '@mui/material';
import { ethers } from 'ethers';
import NFTCollection from './abis/NFTCollection.json';

const { abi: NFTCollectionABI, bytecode } = NFTCollection;

const App: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const [ipfsUrls, setIpfsUrls] = useState<string[]>([]);
  const [collectionName, setCollectionName] = useState<string>('');
  const [collectionSymbol, setCollectionSymbol] = useState<string>('');
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

  const handleDeploy = async () => {
    try {
      const { ethereum } = window as any;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const factory = new ethers.ContractFactory(NFTCollectionABI, bytecode, signer);
      const contract = await factory.deploy(collectionName, collectionSymbol, "ipfs://baseURI/", address);
      await contract.deployed();
      setCollectionAddress(contract.address);
    } catch (error) {
      console.error('Deployment failed:', error);
    }
  };

  useEffect(() => {
    console.log('Minted NFTs:', mintedNFTs);
  }, [mintedNFTs]);

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NFT Collection Creator
          </Typography>
          {!isConnected ? (
            <Button color="inherit" onClick={() => connect()}>Connect Wallet</Button>
          ) : (
            <Button color="inherit" onClick={() => disconnect()}>Disconnect Wallet</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container>
        <Box my={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Collection Name"
                variant="outlined"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Collection Symbol"
                variant="outlined"
                value={collectionSymbol}
                onChange={(e) => setCollectionSymbol(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDeploy}
              >
                Deploy NFT Collection
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Box my={4}>
          <input type="file" onChange={handleUpload} multiple />
          <TextField
            fullWidth
            label="Contract Address"
            variant="outlined"
            value={collectionAddress}
            onChange={(e) => setCollectionAddress(e.target.value)}
            sx={{ my: 2 }}
          />
          <Grid container spacing={3}>
            {ipfsUrls.map((url, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={`https://ipfs.io/ipfs/${url}`}
                    alt="NFT"
                    onError={(e: any) => e.target.style.display = 'none'}
                  />
                  <CardContent>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleMint(url)}
                    >
                      Mint NFT
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Box my={4}>
          <Typography variant="h4">Minted NFTs</Typography>
          <Grid container spacing={3}>
            {mintedNFTs.map((url, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={`https://ipfs.io/ipfs/${url}`}
                    alt="Minted NFT"
                    onError={(e: any) => e.target.style.display = 'none'}
                  />
                  <CardContent>
                    <Link href={`https://ipfs.io/ipfs/${url}`} target="_blank" rel="noopener" variant="body2" noWrap>
                      IPFS URL: {`https://ipfs.io/ipfs/${url}`}
                    </Link>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default App;

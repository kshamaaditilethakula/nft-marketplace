import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import useNFTCollection from "./hooks/useNFTCollection";
import { uploadToPinata } from "./utils/pinata";
import { AppBar, Toolbar, Typography, Button, TextField, Container, Box, Grid, Card, CardContent, CardMedia, CssBaseline, Link } from "@mui/material";
import { ethers } from "ethers";
import NFTTypeSelector from "./NFTTypeSelector";

import NFTCollection from "./abis/NFTCollection.json";
import PaymentToken from "./abis/PaymentToken.json";
import NFTWithERC20Payments from "./abis/NFTWithERC20Payments.json";
import GovernanceToken from "./abis/GovernanceToken.json";
import NFTGovernor from "./abis/NFTGovernor.json";
import UpgradeableNFT from "./abis/UpgradeableNFT.json";
import MyERC1967Proxy from "./abis/MyERC1967Proxy.json";
import ERC1155Token from "./abis/ERC1155Token.json";
import NFTWithSignatures from "./abis/NFTWithSignatures.json";
import SelectiveNFTInfo from "./SelectiveNFTInfo";
import GovernanceUI from "./GovernanceUI";

const App: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();
  const [ownerPrivateKey, setOwnerPrivateKey] = useState<string>("");
  const [ipfsUrls, setIpfsUrls] = useState<string[]>([]);
  const [collectionName, setCollectionName] = useState<string>("");
  const [collectionSymbol, setCollectionSymbol] = useState<string>("");
  const [collectionAddress, setCollectionAddress] = useState<string>("");
  const { mintNFT } = useNFTCollection(collectionAddress);
  const [mintedNFTs, setMintedNFTs] = useState<string[]>([]);
  const [selectedNFTType, setSelectedNFTType] = useState<string>("plain");
  const [erc20TokenAddress, setERC20TokenAddress] = useState<string>("");
  const [governanceTokenAddress, setGovernanceTokenAddress] = useState<string>("");
  const [governorAddress, setGovernorAddress] = useState<string>("");

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

  const handleMint = async () => {
    try {
      const { ethereum } = window as any;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      switch (selectedNFTType) {
        case "plain":
          await mintPlainNFT(signer);
          break;
        case "erc20payments":
          await mintNFTWithERC20Payment(signer);
          break;
        case "upgradeableWithGovernance":
          await mintUpgradeableNFT(signer);
          break;
        case "erc1155":
          await mintERC1155Token(signer);
          break;
        case "offchainSignatures":
          await mintNFTWithSignature(signer);
          break;
        default:
          console.error("Unknown NFT type");
      }

      console.log("NFT minted successfully");
      console.log(`Minted NFT with IPFS URL: https://ipfs.io/ipfs/${ipfsUrls[0]}`);
      setMintedNFTs((prev) => [...prev, `https://ipfs.io/ipfs/${ipfsUrls[0]}`]);
    } catch (error) {
      console.error("Minting failed:", error);
    }
  };

  const mintPlainNFT = async (signer: ethers.Signer) => {
    const nftContract = new ethers.Contract(collectionAddress, NFTCollection.abi, signer);
    const tx = await nftContract.mint(await signer.getAddress());
    await tx.wait();
  };

  const mintNFTWithERC20Payment = async (signer: ethers.Signer) => {
    const paymentTokenContract = new ethers.Contract(erc20TokenAddress, PaymentToken.abi, signer);
    const nftContract = new ethers.Contract(collectionAddress, NFTWithERC20Payments.abi, signer);

    // Approve the NFT contract to spend tokens
    const price = await nftContract.nftPrice();
    await paymentTokenContract.approve(collectionAddress, price);

    // Mint the NFT
    const tx = await nftContract.mint();
    await tx.wait();
  };

  const mintUpgradeableNFT = async (signer: ethers.Signer) => {
    const nftContract = new ethers.Contract(collectionAddress, UpgradeableNFT.abi, signer);
    const tx = await nftContract.mint(await signer.getAddress());
    await tx.wait();
  };

  const mintERC1155Token = async (signer: ethers.Signer) => {
    const nftContract = new ethers.Contract(collectionAddress, ERC1155Token.abi, signer);
    const tokenId = 1;
    const amount = 1;
    const tx = await nftContract.mint(await signer.getAddress(), tokenId, amount, "0x");
    await tx.wait();
  };

  const mintNFTWithSignature = async (signer: ethers.Signer) => {
    try {
      const nftContract = new ethers.Contract(collectionAddress, NFTWithSignatures.abi, signer);

      // Get the recipient address (the person calling mintTo)
      const recipientAddress = await signer.getAddress();
      console.log("Recipient Address:", recipientAddress);

      // Initialize owner's signer
      const ownerSigner = new ethers.Wallet(ownerPrivateKey, signer.provider);

      // Compute the message hash (make sure this matches the contract's implementation)
      const messageHash = ethers.utils.solidityKeccak256(["address"], [recipientAddress]);
      console.log("Message Hash:", messageHash);

      // Sign the message hash directly (without double hashing)
      const signature = await ownerSigner.signMessage(ethers.utils.arrayify(messageHash));
      console.log("Signature:", signature);

      // Mint the NFT
      const tx = await nftContract.mintTo(recipientAddress, signature, {
        gasLimit: 200000, // Manually set gas limit
      });
      await tx.wait();
      console.log("NFT minted successfully:", tx.hash);
    } catch (error) {
      console.error("Minting failed:", error);
    }
  };

  const handleDeploy = async () => {
    try {
      const { ethereum } = window as any;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      let nftContract;
      let additionalContracts = [];

      switch (selectedNFTType) {
        case "plain":
          nftContract = await deployContract(NFTCollection, [collectionName, collectionSymbol, `https://ipfs.io/ipfs/${ipfsUrls[0]}`, address], signer);
          break;
        case "erc20payments":
          const paymentToken = await deployContract(PaymentToken, ["PaymentToken", "PT", ethers.utils.parseEther("1000000"), address], signer);
          nftContract = await deployContract(
            NFTWithERC20Payments,
            [collectionName, collectionSymbol, `https://ipfs.io/ipfs/${ipfsUrls[0]}`, paymentToken.address, ethers.utils.parseEther("0.1"), address],
            signer
          );
          additionalContracts.push({ name: "PaymentToken", address: paymentToken.address });
          setERC20TokenAddress(paymentToken.address);
          break;
        case "upgradeableWithGovernance":
          // Step 1: Deploy the UpgradeableNFT contract
          nftContract = await deployUpgradeableContract(UpgradeableNFT, [collectionName, collectionSymbol, `https://ipfs.io/ipfs/${ipfsUrls[0]}`], signer);
          console.log("Deployed UpgradeableNFT at:", nftContract.address);

          // Step 2: Deploy the GovernanceToken contract
          const governanceToken = await deployContract(GovernanceToken, ["GovernanceToken", "GT", ethers.utils.parseEther("1000000"), signer.getAddress()], signer);
          console.log("Deployed GovernanceToken at:", governanceToken.address);

          // Step 3: Deploy the NFTGovernor contract
          const governor = await deployContract(NFTGovernor, [governanceToken.address, nftContract.address], signer);
          console.log("Deployed NFTGovernor at:", governor.address);

          // Step 4: Transfer ownership of the UpgradeableNFT to the NFTGovernor
          const transferTx = await nftContract.transferOwnership(governor.address);
          await transferTx.wait();
          console.log("Transferred ownership of UpgradeableNFT to NFTGovernor");

          additionalContracts.push({ name: "GovernanceToken", address: governanceToken.address }, { name: "Governor", address: governor.address });
          setGovernanceTokenAddress(governanceToken.address);
          setGovernorAddress(governor.address);
          break;
        case "erc1155":
          nftContract = await deployContract(ERC1155Token, [`https://ipfs.io/ipfs/${ipfsUrls[0]}`, address], signer);
          break;
        case "offchainSignatures":
          nftContract = await deployContract(NFTWithSignatures, [collectionName, collectionSymbol, `https://ipfs.io/ipfs/${ipfsUrls[0]}`, address], signer);
          break;
      }

      setCollectionAddress(nftContract!.address);
      console.log(`Deployed ${selectedNFTType} NFT at:`, nftContract!.address);
      additionalContracts.forEach((contract) => {
        console.log(`Deployed ${contract.name} at:`, contract.address);
      });
    } catch (error) {
      console.error("Deployment failed:", error);
    }
  };

  const deployContract = async (contractJson: any, args: any[], signer: ethers.Signer) => {
    const factory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode, signer);
    const contract = await factory.deploy(...args);
    await contract.deployed();
    return contract;
  };

  const deployUpgradeableContract = async (contractJson: any, args: any[], signer: ethers.Signer) => {
    // Deploy the implementation contract
    const implementationFactory = new ethers.ContractFactory(contractJson.abi, contractJson.bytecode, signer);
    const implementationContract = await implementationFactory.deploy();
    await implementationContract.deployed();
    console.log("Implementation deployed to:", implementationContract.address);

    // Prepare initialization data
    const initializerData = implementationContract.interface.encodeFunctionData("initialize", args);

    // Deploy the proxy
    const proxyFactory = new ethers.ContractFactory(MyERC1967Proxy.abi, MyERC1967Proxy.bytecode, signer);
    const proxyContract = await proxyFactory.deploy(implementationContract.address, initializerData);
    await proxyContract.deployed();
    console.log("Proxy deployed to:", proxyContract.address);

    // Return a contract instance of the implementation, but connected to the proxy address
    return new ethers.Contract(proxyContract.address, contractJson.abi, signer);
  };

  useEffect(() => {
    console.log("Minted NFTs:", mintedNFTs);
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
            <Button color="inherit" onClick={() => connect()}>
              Connect Wallet
            </Button>
          ) : (
            <>
              <Typography variant="h6" component="div" sx={{ mr: 2 }}>
                {address}
              </Typography>
              <Button color="inherit" onClick={() => disconnect()}>
                Disconnect Wallet
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container>
        <Box my={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <NFTTypeSelector selectedType={selectedNFTType} onTypeChange={setSelectedNFTType} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Collection Name" variant="outlined" value={collectionName} onChange={(e) => setCollectionName(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Collection Symbol" variant="outlined" value={collectionSymbol} onChange={(e) => setCollectionSymbol(e.target.value)} />
            </Grid>
            {selectedNFTType === "offchainSignatures" && (
              <Grid item xs={12}>
                <TextField fullWidth label="Owner Private Key" variant="outlined" value={ownerPrivateKey} onChange={(e) => setOwnerPrivateKey(e.target.value)} />
              </Grid>
            )}
            <Grid item xs={12}>
              <Button variant="contained" color="primary" onClick={handleDeploy}>
                Deploy NFT Collection
              </Button>
            </Grid>
          </Grid>
        </Box>
        {selectedNFTType === "upgradeableWithGovernance" && <GovernanceUI governorAddress={governorAddress} nftContractAddress={collectionAddress} />}
        <SelectiveNFTInfo selectedType={selectedNFTType} erc20TokenAddress={erc20TokenAddress} governanceTokenAddress={governanceTokenAddress} governorAddress={governorAddress} />
        <Box my={4}>
          <input type="file" onChange={handleUpload} multiple />
          <TextField fullWidth label="Contract Address" variant="outlined" value={collectionAddress} onChange={(e) => setCollectionAddress(e.target.value)} sx={{ my: 2 }} />
          <Grid container spacing={3}>
            {ipfsUrls.map((url, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardMedia component="img" height="140" image={`https://ipfs.io/ipfs/${url}`} alt="NFT" onError={(e: any) => (e.target.style.display = "none")} />
                  <CardContent>
                    <Button variant="contained" color="primary" onClick={() => handleMint()}>
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
                  <CardMedia component="img" height="140" image={`https://ipfs.io/ipfs/${url}`} alt="Minted NFT" onError={(e: any) => (e.target.style.display = "none")} />
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

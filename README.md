# 🎨 NFT Collection Creator 🚀

## 🌟 Introduction

Welcome to the NFT Collection Creator! This cutting-edge project allows you to create and deploy various types of NFT collections with ease. Whether you're a digital artist, a blockchain enthusiast, or a developer looking to explore the world of NFTs, this tool has got you covered!

## 🔥 Features

Our NFT Collection Creator supports four unique types of NFTs:

1. 🖼️ **Plain Basic NFT**: Simple and straightforward NFTs for your digital art or collectibles.
2. 💰 **NFT with ERC20 Token Payments**: Sell your NFTs using custom ERC20 tokens.
3. 🖋️ **NFT with Signatures**: Create NFTs that require off-chain signatures for minting.
4. 🔄 **Upgradable NFT with Governance**: Advanced NFTs with upgradeability and on-chain governance.

## 🛠️ Technology Stack

### Smart Contracts
- **Solidity**: v0.8.24
- **Framework**: Foundry
- **Libraries**: OpenZeppelin v5.0.2

### Frontend
- **React**: For building our user interface
- **TypeScript**: For type-safe code
- **wagmi**: For seamless Ethereum interactions
- **ethers.js**: For Ethereum blockchain interactions
- **Pinata**: For IPFS integration
- **Material-UI**: For sleek and responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- Foundry
- React Js
- Solidity

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/kshamaaditilethakula/nft-marketplace
   cd nft-marketplace
   ```

2. Install dependencies:
   ```
   cd nft-marketplace
   cd nft-collection-creator
   npm install
   cd ..
   ```


3. Compile smart contracts:
   ```
   forge build
   ```

4. Extract ABIs and artifacts:
   ```
   python extractabis.py
   ```

4. Start the development server:
   ```
   cd nft-collection-creator

   yarn start
   ```

## 🖥️ Usage

1. Connect your wallet using the "Connect Wallet" button.
2. Choose the type of NFT collection you want to create.
3. Fill in the required details (name, symbol, etc.).
4. Upload your NFT images or metadata to IPFS.
5. Deploy your NFT collection to the blockchain.
6. Mint NFTs from your newly created collection!

## 🧪 Testing

Run the smart contract tests:
```
forge test
```

Run frontend tests:
```
yarn test
```


## 🙏 Acknowledgements

- OpenZeppelin for their robust smart contract libraries
- The Ethereum community for their continuous support and innovation


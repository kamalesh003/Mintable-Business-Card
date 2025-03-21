# BusinessCard NFT Escrow Platform

A decentralized escrow platform that leverages BusinessCard NFTs and a DID registry to provide secure, trust-based escrow services. This platform ties escrow agreements to verified business identities by ensuring that both parties have registered decentralized identifiers (DIDs) and that the payee owns a valid BusinessCard NFT.

## Overview

This repository contains three Vyper smart contracts:

1. **BusinessCardNFT.vy**  
   - **Purpose:** Mint NFTs representing business cards.  
   - **Details:** Each NFT holds metadata including name, email, phone, company, position, and an  URL with extended data.
   - **Key Functions:**
     - `mintNFT(...)`: Mints a new BusinessCard NFT.
     - `getCard(tokenId)`: Retrieves the stored business card details.

2. **DIDRegistry.vy**  
   - **Purpose:** Register and manage decentralized identifiers (DIDs).
   - **Key Functions:**
     - `registerDID(did)`: Associates a caller’s Ethereum address with a DID.

3. **Escrow.vy**  
   - **Purpose:** Implements an escrow mechanism that ties funds to verified identities.
   - **Details:**  
     - Both parties must have registered DIDs.
     - The payee must own a BusinessCard NFT.
   - **Key Functions:**
     - `createEscrow(nftId, payee)`: Creates an escrow transaction.
     - `approveRelease(escrowId)`: Approves the release of funds (only sender).
     - `cancelEscrow(escrowId)`: Cancels the escrow and refunds the sender.
     - `withdrawFunds(escrowId)`: Allows the payee to withdraw funds once approved.

## Deployment Using Anvil

Anvil is a fast local Ethereum testnet provided by Foundry. Follow these steps to deploy your contracts locally.

### Prerequisites

- **Node.js**: Install from [nodejs.org](https://nodejs.org).
- **Foundry (Anvil)**:  
  Install Foundry by following the instructions in the [Foundry Book](https://book.getfoundry.sh/getting-started/installation).
- **Vyper Compiler**: Ensure you have Vyper installed to compile your contracts.

### Step-by-Step Deployment

#### 1. Start Anvil

Open a terminal and run:
```bash
anvil
```

#### 2. Compile Contracts:
Before deployment, compile your Vyper contracts to generate the bytecode (`.bin`) and ABI (`.abi`) files.
```bash
vyper DIDRegistry.vy > DIDRegistry.bin
vyper -f abi DIDRegistry.vy > DIDRegistry.abi

vyper BusinessCardNFT.vy > BusinessCardNFT.bin
vyper -f abi BusinessCardNFT.vy > BusinessCardNFT.abi

vyper Escrow.vy > Escrow.bin
vyper -f abi Escrow.vy > Escrow.abi
```
#### 3. Deploy and Mint NFT

In your terminal, navigate to the directory containing deploy-script.js, installed dependencies(eg; ethers..) and run:
```bash
node deploy-script.js
```

```bash
C:\Users\Dell\Downloads\zkp\deploy-script>node deploy-escrow.js
Deploying DIDRegistry contract...
DIDRegistry deployed at: 0x0Cf17D5DcDA9cF25889cEc9ae5610B0FB9725F65
Deploying BusinessCardNFT contract...
BusinessCardNFT deployed at: 0xcEC91d876E8f003110D43381359b1bAd124e7F2b
Deploying Escrow contract...
Escrow deployed at: 0x5370F78c6af2Da9cF6642382A3a75F9D5aEc9cc1
Registering DID...
DID registered.
Minting BusinessCard NFT...
BusinessCard NFT minted.
```



const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

async function deployContract(binFile, abiFile) {
  // Read the compiled bytecode from file
  const rawBytecode = fs.readFileSync(binFile, 'utf8');
  // Remove whitespace/newlines and prepend "0x" if needed
  const cleaned = rawBytecode.replace(/\s+/g, '');
  const bytecode = cleaned.startsWith("0x") ? cleaned : "0x" + cleaned;
  
  // Read and parse the ABI file
  const abi = JSON.parse(fs.readFileSync(abiFile, 'utf8'));
  
  return { bytecode, abi };
}

async function main() {
  // Connect to your local Anvil node (ethers v5)
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Use one of Anvil's test private keys (example key)
  const privateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
  const wallet = new ethers.Wallet(privateKey, provider);

  // Deploy the DIDRegistry contract
  console.log("Deploying DIDRegistry contract...");
  const didRegistryData = await deployContract("DIDRegistry.bin", "DIDRegistry.abi");
  const DIDRegistryFactory = new ethers.ContractFactory(didRegistryData.abi, didRegistryData.bytecode, wallet);
  const didRegistryContract = await DIDRegistryFactory.deploy();
  await didRegistryContract.deployed();
  console.log("DIDRegistry deployed at:", didRegistryContract.address);

  // Deploy the BusinessCardNFT contract
  console.log("Deploying BusinessCardNFT contract...");
  const businessCardData = await deployContract("BusinessCardNFT.bin", "BusinessCardNFT.abi");
  const BusinessCardFactory = new ethers.ContractFactory(businessCardData.abi, businessCardData.bytecode, wallet);
  const businessCardContract = await BusinessCardFactory.deploy();
  await businessCardContract.deployed();
  console.log("BusinessCardNFT deployed at:", businessCardContract.address);

  // Deploy the Escrow contract with the addresses of the two deployed contracts
  console.log("Deploying Escrow contract...");
  const escrowData = await deployContract("Escrow.bin", "Escrow.abi");
  const EscrowFactory = new ethers.ContractFactory(escrowData.abi, escrowData.bytecode, wallet);
  const escrowContract = await EscrowFactory.deploy(didRegistryContract.address, businessCardContract.address);
  await escrowContract.deployed();
  console.log("Escrow deployed at:", escrowContract.address);

  // --- Example Interactions ---
  // 1. Register a DID using the DIDRegistry contract
  console.log("Registering DID...");
  const registerTx = await didRegistryContract.registerDID("did:example:123456789");
  await registerTx.wait();
  console.log("DID registered.");

  // 2. Mint a BusinessCard NFT using the BusinessCardNFT contract
  console.log("Minting BusinessCard NFT...");
  const mintTx = await businessCardContract.mintNFT(
    "Alice", 
    "alice@example.com", 
    "1234567890", 
    "Acme Corp", 
    "Engineer", 
    "https://arweave.net/"
  );
  await mintTx.wait();
  console.log("BusinessCard NFT minted.");

  // Optionally, you can now interact with the Escrow contract as needed.
}

main().catch(error => {
  console.error("Deployment failed:", error);
  process.exit(1);
});

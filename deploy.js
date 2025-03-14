const fs = require('fs');
const { ethers } = require('ethers');

async function deployContract(binFile, abiFile) {
  // Read the compiled bytecode from file
  const rawBytecode = fs.readFileSync(binFile, 'utf8');
  // Remove whitespace/newlines
  const cleaned = rawBytecode.replace(/\s+/g, '');
  // Prepend "0x" if needed
  const bytecode = cleaned.startsWith("0x") ? cleaned : "0x" + cleaned;
  
  // Read and parse the ABI JSON file
  const abi = JSON.parse(fs.readFileSync(abiFile, 'utf8'));
  
  return { bytecode, abi };
}

async function main() {
  // Connect to your local Anvil node using ethers v6 API
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Use one of Anvil's test private keys
  const privateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
  const wallet = new ethers.Wallet(privateKey, provider);

  // Deploy the DIDRegistry contract
  console.log("Deploying DIDRegistry contract...");
  const didRegistryData = await deployContract("DIDRegistry.bin", "DIDRegistry.abi");
  const DIDRegistryFactory = new ethers.ContractFactory(didRegistryData.abi, didRegistryData.bytecode, wallet);
  const didRegistryContract = await DIDRegistryFactory.deploy();
  await didRegistryContract.waitForDeployment();
  console.log("DIDRegistry deployed at:", didRegistryContract.target);

  // Deploy the BusinessCardNFT contract
  console.log("Deploying BusinessCardNFT contract...");
  const businessCardData = await deployContract("BusinessCardNFT.bin", "BusinessCardNFT.abi");
  const BusinessCardFactory = new ethers.ContractFactory(businessCardData.abi, businessCardData.bytecode, wallet);
  const businessCardContract = await BusinessCardFactory.deploy();
  await businessCardContract.waitForDeployment();
  console.log("BusinessCardNFT deployed at:", businessCardContract.target);

  // --- Interact with Deployed Contracts ---

  // 1. Register a DID
  console.log("Registering DID...");
  let nonce = await wallet.getNonce(); // ethers v6 method
  const registerTx = await didRegistryContract.registerDID("did:example:123456789", { nonce });
  await registerTx.wait();
  console.log("DID registered.");

  // 2. Mint a Business Card NFT
  console.log("Minting BusinessCard NFT...");
  nonce = await wallet.getNonce(); // update nonce for next transaction
  const mintTx = await businessCardContract.mintNFT(
    "Alice", 
    "alice@example.com", 
    "1234567890", 
    "Acme Corp", 
    "Engineer", 
    "https://arweave.net/yourdocument",
    { nonce }
  );
  await mintTx.wait();
  console.log("BusinessCard NFT minted.");
}

main().catch(error => {
  console.error("Deployment failed:", error);
  process.exit(1);
});

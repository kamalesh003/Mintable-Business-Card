use ethers::prelude::*;
use ethers::contract::abigen;
use std::sync::Arc;

// Ethereum contract addresses
const DID_CONTRACT: &str = "0x8464135c8F25Da09e49BC8782676a84730C318bC";
const NFT_CONTRACT: &str = "0x71C95911E9a5D330f4D621842EC243EE1343292e";

// Generate contract bindings from ABI files.
// Ensure that your ABI files exist in the abi/ directory.
abigen!(
    DIDRegistry,
    "abi/DIDRegistry.abi"
);

abigen!(
    BusinessCardNFT,
    "abi/BusinessCardNFT.abi"
);

// Fetch DID from Ethereum contract
pub async fn get_did(provider: &Provider<Http>, agent_address: Address) -> Option<String> {
    let client = Arc::new(provider.clone());
    let contract = DIDRegistry::new(DID_CONTRACT.parse::<H160>().unwrap(), client);
    contract.dids(agent_address).call().await.ok()
}

// Fetch NFT metadata from Ethereum contract
pub async fn get_nft_metadata(provider: &Provider<Http>, token_id: U256) -> Option<String> {
    let client = Arc::new(provider.clone());
    let contract = BusinessCardNFT::new(NFT_CONTRACT.parse::<H160>().unwrap(), client);
    contract.metadata_of(token_id).call().await.ok()
}

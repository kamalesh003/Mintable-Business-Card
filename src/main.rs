mod ethereum;
mod arweave;
mod verifier;

use ethereum::{get_did, get_nft_metadata};
use arweave::get_proof_from_arweave;
use verifier::verify_zkp;
use ethers::prelude::*;
use tokio;

#[tokio::main]
async fn main() {
    // Connect to a local Ethereum node (e.g., Anvil)
    let provider = Provider::<Http>::try_from("http://127.0.0.1:8545")
        .expect("Could not connect to Ethereum provider");

    // Replace with the actual agent address
    let agent_address: Address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8".parse().expect("Invalid address");
    let token_id = U256::from(1);

    if let Some(did) = get_did(&provider, agent_address).await {
        println!("DID Found: {}", did);
    } else {
        println!("No DID found for agent.");
    }

    if let Some(metadata_uri) = get_nft_metadata(&provider, token_id).await {
        println!("Metadata URI: {}", metadata_uri);

        if let Some(proof_data) = get_proof_from_arweave(&metadata_uri).await {
            if verify_zkp(&proof_data) {
                println!("✅ Proof is valid!");
            } else {
                println!("❌ Proof is invalid!");
            }
        } else {
            println!("Proof data not found on Arweave.");
        }
    } else {
        println!("NFT metadata not found.");
    }
}

use reqwest;
use serde_json::Value;

const ARWEAVE_GATEWAY: &str = "https://arweave.net";

// Fetch proof JSON from Arweave
pub async fn get_proof_from_arweave(proof_uri: &str) -> Option<Value> {
    let url = format!("{}/{}", ARWEAVE_GATEWAY, proof_uri);
    let response = reqwest::get(&url).await.ok()?.json::<Value>().await.ok()?;
    Some(response)
}

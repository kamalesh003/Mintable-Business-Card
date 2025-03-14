const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const abi = JSON.parse(fs.readFileSync("BusinessCardNFT.abi", "utf8"));
  const contractAddress = "0x90118d110B07ABB82Ba8980D1c5cC96EeA810d2C"; // Adjust if needed
  const contract = new ethers.Contract(contractAddress, abi, provider);

  const card = await contract.getCard(1);
  console.log("Name:", card[0]);
  console.log("Email:", card[1]);
  console.log("Phone:", card[2]);
  console.log("Company:", card[3]);
  console.log("Position:", card[4]);
  console.log("Arweave URL:", card[5]);
}

main().catch(console.error);

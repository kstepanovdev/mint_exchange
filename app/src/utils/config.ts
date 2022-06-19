import { PublicKey, clusterApiUrl } from "@solana/web3.js";
import idl from "../mint_exchange.json";

export const preflightCommitment = "processed";
export const programID = new PublicKey(idl.metadata.address);

// const localnet = "http://127.0.0.1:8899";
const devnet = clusterApiUrl("devnet");
// const mainnet = clusterApiUrl("mainnet-beta");
export const network = devnet;
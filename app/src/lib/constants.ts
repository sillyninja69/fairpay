import { clusterApiUrl, PublicKey } from "@solana/web3.js";

export const NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet") as
  | "devnet"
  | "testnet"
  | "mainnet-beta";

export const RPC_ENDPOINT = clusterApiUrl(NETWORK);
export const EXPLORER_BASE = "https://explorer.solana.com/tx";

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || "11111111111111111111111111111111"
);

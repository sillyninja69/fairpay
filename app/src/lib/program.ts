"use client";

import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { FAIRPAY_IDL } from "./idl";
import { PROGRAM_ID, RPC_ENDPOINT } from "./constants";
import { EscrowAccount } from "@/types/escrow";

const ESCROW_SEED = "escrow";

export function getConnection() {
  return new Connection(RPC_ENDPOINT, "confirmed");
}

export function getProvider(wallet: WalletContextState) {
  return new AnchorProvider(getConnection(), wallet as never, {
    preflightCommitment: "confirmed",
  });
}

function getReadonlyProvider() {
  const readonlyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async (tx: Transaction) => tx,
    signAllTransactions: async (txs: Transaction[]) => txs,
  };

  return new AnchorProvider(getConnection(), readonlyWallet as never, {
    preflightCommitment: "confirmed",
  });
}

export function getProgram(wallet: WalletContextState) {
  const provider = getProvider(wallet);
  return new Program(FAIRPAY_IDL as never,  provider);
}

function getReadonlyProgram() {
  const provider = getReadonlyProvider();
  return new Program(FAIRPAY_IDL as never, provider);
}

export function toLamports(solAmount: number) {
  return Math.floor(solAmount * 1_000_000_000);
}

export function toSol(lamports: number | bigint) {
  return Number(lamports) / 1_000_000_000;
}

export async function deriveEscrowPda(
  client: PublicKey,
  freelancer: PublicKey,
  jobTitle: string
) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(ESCROW_SEED), client.toBuffer(), freelancer.toBuffer(), Buffer.from(jobTitle)],
    PROGRAM_ID
  );
}

export async function initializeEscrowTx(params: {
  wallet: WalletContextState;
  freelancer: PublicKey;
  jobTitle: string;
  jobDescription: string;
  amountLamports: number;
}) {
  const { wallet, freelancer, jobTitle, jobDescription, amountLamports } = params;
  const program = getProgram(wallet);
  const [escrowPda] = await deriveEscrowPda(wallet.publicKey!, freelancer, jobTitle);
  const signature = await (program.methods as any)
    .initializeEscrow(jobTitle, jobDescription, new BN(amountLamports))
    .accounts({
      client: wallet.publicKey,
      freelancer,
      escrow: escrowPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { signature, escrowPda };
}

export async function fetchEscrows(wallet: WalletContextState): Promise<EscrowAccount[]> {
  const program = getProgram(wallet);
  const raw = await (program.account as any).escrow.all();
  const pubkey = wallet.publicKey?.toBase58();
  return raw
    .map((item: any) => normalizeEscrow(item.publicKey, item.account))
    .filter((item: EscrowAccount) => item.client === pubkey || item.freelancer === pubkey);
}

export async function fetchAllEscrows(): Promise<EscrowAccount[]> {
  const program = getReadonlyProgram();
  const raw = await (program.account as any).escrow.all();

  return raw.map((item: any) => normalizeEscrow(item.publicKey, item.account));
}

export async function fetchEscrowByAddress(wallet: WalletContextState, address: string) {
  const program = getProgram(wallet);
  const account = await (program.account as any).escrow.fetch(new PublicKey(address));
  return normalizeEscrow(new PublicKey(address), account);
}

function normalizeEscrow(publicKey: PublicKey, account: any): EscrowAccount {
  return {
    publicKey: publicKey.toBase58(),
    client: account.client.toBase58(),
    freelancer: account.freelancer.toBase58(),
    amount: Number(account.amount),
    jobTitle: account.jobTitle,
    jobDescription: account.jobDescription,
    workDescription: account.workDescription,
    workLink: account.workLink,
    clientClaim: account.clientClaim,
    freelancerClaim: account.freelancerClaim,
    verdictReasoning: account.verdictReasoning ?? "",
    state: Object.keys(account.state)[0] as EscrowAccount["state"],
    bump: account.bump,
  };
}

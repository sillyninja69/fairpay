"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import AuthButton from "@/components/AuthButton";
import { EXPLORER_BASE, NETWORK } from "@/lib/constants";
import { initializeEscrowTx, toLamports } from "@/lib/program";
import { saveJobToHistory } from "@/lib/jobHistory";

export default function PostJobPage() {
  const router = useRouter();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!wallet.connected || !wallet.publicKey) {
      toast.error("Connect wallet first");
      return;
    }
    setLoading(true);
    setStatusText("Opening wallet confirmation...");
    const form = new FormData(e.currentTarget);
    try {
      const freelancer = new PublicKey(String(form.get("freelancer")));
      const jobTitle = String(form.get("jobTitle"));
      const jobDescription = String(form.get("jobDescription"));
      const amountSol = Number(form.get("amount"));
      const amountLamports = toLamports(amountSol);

      const { signature, escrowPda } = await initializeEscrowTx({
        wallet,
        freelancer,
        jobTitle,
        jobDescription,
        amountLamports,
      });

      setStatusText("Recording job posting...");
      saveJobToHistory({
        escrowAddress: escrowPda.toBase58(),
        signature,
        client: wallet.publicKey.toBase58(),
        freelancer: freelancer.toBase58(),
        jobTitle,
        jobDescription,
        amountLamports,
        createdAt: new Date().toISOString(),
      });

      toast.success("Escrow created and job posted");
      window.open(`${EXPLORER_BASE}/${signature}?cluster=${NETWORK}`, "_blank");
      (e.target as HTMLFormElement).reset();
      router.push("/jobs");
    } catch (error) {
      toast.error(`Failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
      setStatusText("");
    }
  }

  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm text-zinc-200">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/jobs" className="hover:text-white">My Jobs</Link>
          <Link href="/all-jobs" className="hover:text-white">All Jobs</Link>
        </div>
        <AuthButton />
      </div>

      <h1 className="text-2xl font-bold text-white">Post Job</h1>
      <p className="mt-2 text-sm text-zinc-300">Create Escrow also creates a job posting record.</p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input name="freelancer" placeholder="Freelancer wallet address" required className="input" />
        <input name="jobTitle" placeholder="Job title" required className="input" />
        <textarea name="jobDescription" placeholder="Job description" required className="input min-h-28" />
        <input name="amount" placeholder="Amount (SOL)" required type="number" min="0.001" step="0.001" className="input" />
        <button type="submit" disabled={loading || !wallet.connected} className="btn-primary w-full disabled:opacity-60">
          {loading ? statusText || "Creating escrow..." : wallet.connected ? "Create Escrow" : "Connect wallet first"}
        </button>
      </form>
    </section>
  );
}

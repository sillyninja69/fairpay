"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import toast from "react-hot-toast";
import AuthButton from "@/components/AuthButton";
import JobCard from "@/components/JobCard";
import { fetchEscrows } from "@/lib/program";
import { getJobHistory, JobHistoryItem } from "@/lib/jobHistory";
import { EscrowAccount } from "@/types/escrow";

export default function JobsPage() {
  const wallet = useWallet();
  const [jobs, setJobs] = useState<EscrowAccount[]>([]);
  const [history, setHistory] = useState<JobHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet.publicKey) {
      setHistory([]);
      return;
    }

    getJobHistory(wallet.publicKey.toBase58())
      .then(setHistory)
      .catch((e) => toast.error((e as Error).message));
  }, [wallet.publicKey]);

  useEffect(() => {
    if (!wallet.connected) {
      setJobs([]);
      return;
    }

    setLoading(true);
    fetchEscrows(wallet)
      .then(setJobs)
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setLoading(false));
  }, [wallet.connected, wallet.publicKey]);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm text-zinc-200">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/post-job" className="hover:text-white">Post Job</Link>
          <Link href="/all-jobs" className="hover:text-white">All Jobs</Link>
        </div>
        <AuthButton />
      </div>

      <h1 className="text-2xl font-bold text-white">My Jobs</h1>
      {!wallet.connected && <p className="mt-2 text-zinc-300">Connect wallet to view your on-chain jobs.</p>}

      {loading && <p className="mt-4 text-zinc-400">Loading escrows...</p>}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {jobs.map((escrow) => (
          <JobCard key={escrow.publicKey} escrow={escrow} />
        ))}
      </div>
      {!loading && wallet.connected && jobs.length === 0 && <p className="mt-4 text-zinc-400">No on-chain escrows found.</p>}

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-white">Posting History</h2>
        <p className="mt-2 text-sm text-zinc-300">Shows your previously created escrow job postings across this app.</p>

        <div className="mt-4 space-y-3">
          {history.map((item) => (
            <Link
              key={item.escrowAddress}
              href={`/job/${item.escrowAddress}`}
              className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-[#14F195]/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">{item.jobTitle}</div>
                  <div className="mt-1 text-sm text-zinc-400">{item.jobDescription}</div>
                </div>
                <div className="text-xs text-zinc-400">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
            </Link>
          ))}

          {history.length === 0 && <p className="text-zinc-400">No local posting history yet.</p>}
        </div>
      </div>
    </section>
  );
}

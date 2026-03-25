"use client";

import Link from "next/link";
import { EscrowAccount } from "@/types/escrow";
import { toSol } from "@/lib/program";

export default function JobCard({ escrow }: { escrow: EscrowAccount }) {
  return (
    <Link
      href={`/job/${escrow.publicKey}`}
      className="block rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-[#14F195]/50"
    >
      <h3 className="text-lg font-semibold text-white">{escrow.jobTitle}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{escrow.jobDescription}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-full bg-[#9945FF]/20 px-3 py-1 text-xs text-[#C9A3FF]">{escrow.state}</span>
        <span className="font-semibold text-[#14F195]">{toSol(escrow.amount).toFixed(3)} SOL</span>
      </div>
    </Link>
  );
}

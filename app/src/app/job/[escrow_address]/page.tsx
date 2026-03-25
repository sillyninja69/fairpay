"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import toast from "react-hot-toast";
import { getProgram, fetchEscrowByAddress, toSol } from "@/lib/program";
import { EscrowAccount } from "@/types/escrow";
import DisputePanel from "@/components/DisputePanel";

type CompletionCheck = {
  completed: boolean;
  confidence: number;
  reasoning: string;
  missingItems: string[];
};

export default function JobDetails() {
  const params = useParams<{ escrow_address: string }>();
  const wallet = useWallet();
  const [escrow, setEscrow] = useState<EscrowAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [checkingCompletion, setCheckingCompletion] = useState(false);
  const [completionCheck, setCompletionCheck] = useState<CompletionCheck | null>(null);

  async function load() {
    if (!wallet.connected) return;
    const data = await fetchEscrowByAddress(wallet, params.escrow_address);
    setEscrow(data);
  }

  useEffect(() => {
    load().catch((e) => toast.error((e as Error).message));
  }, [wallet.connected, params.escrow_address]);

  if (!wallet.connected) return <p className="text-zinc-300">Connect wallet to load escrow details.</p>;
  if (!escrow) return <p className="text-zinc-300">Loading escrow...</p>;

  // After the early returns above, `escrow` is guaranteed to be non-null for the rest of this render.
  // We copy it into a new variable so event handlers use a non-null type.
  const escrowData = escrow;

  const isClient = wallet.publicKey?.toBase58() === escrow.client;
  const isFreelancer = wallet.publicKey?.toBase58() === escrow.freelancer;

  async function submitWork(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const program = getProgram(wallet);
      await (program.methods as any)
        .submitWork(String(form.get("workDescription")), String(form.get("workLink")))
        .accounts({
          freelancer: wallet.publicKey,
          escrow: new PublicKey(escrowData.publicKey),
        })
        .rpc();
      toast.success("Work submitted");
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function approveWork() {
    setLoading(true);
    try {
      const program = getProgram(wallet);
      await (program.methods as any)
        .approveWork()
        .accounts({
          client: wallet.publicKey,
          freelancer: new PublicKey(escrowData.freelancer),
          escrow: new PublicKey(escrowData.publicKey),
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      toast.success("Funds released");
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function raiseDispute(clientClaim: string, freelancerClaim: string) {
    setLoading(true);
    try {
      const program = getProgram(wallet);
      await (program.methods as any)
        .raiseDispute(clientClaim, freelancerClaim)
        .accounts({
          actor: wallet.publicKey,
          escrow: new PublicKey(escrowData.publicKey),
        })
        .rpc();
      toast.success("Dispute raised");
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function resolveWithAi() {
    setResolving(true);
    try {
      const response = await fetch("/api/resolve-dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escrowAddress: escrowData.publicKey,
          clientClaim: escrowData.clientClaim,
          freelancerClaim: escrowData.freelancerClaim,
          jobTitle: escrowData.jobTitle,
          jobDescription: escrowData.jobDescription,
          workDescription: escrowData.workDescription,
          workLink: escrowData.workLink,
          client: escrowData.client,
          freelancer: escrowData.freelancer,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Failed to resolve dispute");
      toast.success("Dispute resolved");
      await load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setResolving(false);
    }
  }

  async function verifyCompletionWithAi() {
    setCheckingCompletion(true);
    try {
      const response = await fetch("/api/verify-completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: escrowData.jobTitle,
          jobDescription: escrowData.jobDescription,
          workDescription: escrowData.workDescription,
          workLink: escrowData.workLink,
          clientClaim: escrowData.clientClaim,
          freelancerClaim: escrowData.freelancerClaim,
        }),
      });

      const payload = (await response.json()) as CompletionCheck & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to verify completion");
      }

      setCompletionCheck({
        completed: Boolean(payload.completed),
        confidence: Number(payload.confidence) || 0,
        reasoning: String(payload.reasoning || "No reasoning provided."),
        missingItems: Array.isArray(payload.missingItems) ? payload.missingItems : [],
      });

      toast.success("AI completion check finished");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setCheckingCompletion(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h1 className="text-2xl font-bold text-white">{escrow.jobTitle}</h1>
        <p className="mt-2 text-zinc-300">{escrow.jobDescription}</p>
        <div className="mt-4 flex gap-4 text-sm">
          <span className="text-[#14F195]">{toSol(escrow.amount).toFixed(3)} SOL locked</span>
          <span className="text-[#C9A3FF]">State: {escrow.state}</span>
        </div>
      </div>

      {isFreelancer && escrow.state === "active" && (
        <form onSubmit={submitWork} className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
          <h2 className="text-lg font-semibold text-white">Submit Work</h2>
          <textarea name="workDescription" className="input min-h-24" placeholder="Work description" required />
          <input name="workLink" className="input" placeholder="Work link" required />
          <button className="btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit Work"}
          </button>
        </form>
      )}

      {isClient && escrow.state === "workSubmitted" && (
        <div className="space-y-3">
          <button className="btn-primary" onClick={approveWork} disabled={loading}>
            {loading ? "Approving..." : "Approve Work & Release Funds"}
          </button>

          <button
            className="rounded-xl border border-[#58a7ff]/40 bg-[#111b31] px-4 py-2 font-semibold text-white transition hover:bg-[#18274a]"
            onClick={verifyCompletionWithAi}
            disabled={checkingCompletion}
          >
            {checkingCompletion ? "AI verifying..." : "AI Verify Completion"}
          </button>
        </div>
      )}

      {(isClient || isFreelancer) && escrow.state === "workSubmitted" && completionCheck && (
        <div
          className={[
            "rounded-xl border p-5",
            completionCheck.completed
              ? "border-[#14F195]/40 bg-[#14F195]/10"
              : "border-[#ff7e33]/40 bg-[#ff7e33]/10",
          ].join(" ")}
        >
          <h3 className="text-lg font-semibold text-white">AI Completion Verdict</h3>
          <p className="mt-2 text-zinc-100">
            Result: {completionCheck.completed ? "Completed" : "Not completed"}
          </p>
          <p className="text-zinc-200">
            Confidence: {(completionCheck.confidence * 100).toFixed(0)}%
          </p>
          <p className="mt-2 text-zinc-200">{completionCheck.reasoning}</p>

          {completionCheck.missingItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-200">
              {completionCheck.missingItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {(isClient || isFreelancer) &&
        (escrow.state === "active" || escrow.state === "workSubmitted") && (
          <DisputePanel onSubmit={raiseDispute} loading={loading} />
        )}

      {escrow.state === "disputed" && (
        <div className="rounded-xl border border-[#9945FF]/30 bg-[#9945FF]/10 p-5">
          <p className="text-zinc-200">{resolving ? "AI is reviewing..." : "Dispute is active."}</p>
          <button disabled={resolving} onClick={resolveWithAi} className="btn-primary mt-3">
            {resolving ? "Reviewing..." : "Ask AI Judge to Resolve"}
          </button>
        </div>
      )}

      {escrow.state === "resolved" && (
        <div className="rounded-xl border border-[#14F195]/30 bg-[#14F195]/10 p-5 text-zinc-200">
          <p>AI verdict: {escrow.verdictReasoning || "No reasoning provided."}</p>
        </div>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";

interface Props {
  onSubmit: (clientClaim: string, freelancerClaim: string) => Promise<void>;
  loading: boolean;
}

export default function DisputePanel({ onSubmit, loading }: Props) {
  const [clientClaim, setClientClaim] = useState("");
  const [freelancerClaim, setFreelancerClaim] = useState("");

  return (
    <div className="rounded-xl border border-red-400/30 bg-red-500/5 p-4">
      <h3 className="text-base font-semibold text-red-300">Raise Dispute</h3>
      <div className="mt-3 space-y-3">
        <textarea
          placeholder="Client claim"
          value={clientClaim}
          onChange={(e) => setClientClaim(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none"
          rows={3}
        />
        <textarea
          placeholder="Freelancer claim"
          value={freelancerClaim}
          onChange={(e) => setFreelancerClaim(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none"
          rows={3}
        />
        <button
          onClick={() => onSubmit(clientClaim, freelancerClaim)}
          disabled={loading}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Dispute"}
        </button>
      </div>
    </div>
  );
}

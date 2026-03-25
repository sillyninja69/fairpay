"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import AuthButton from "@/components/AuthButton";
import JobCard from "@/components/JobCard";
import { fetchAllEscrows } from "@/lib/program";
import { getJobHistory, JobHistoryItem } from "@/lib/jobHistory";
import { EscrowAccount } from "@/types/escrow";

const PAGE_SIZE = 6;

export default function AllJobsPage() {
  const [jobs, setJobs] = useState<EscrowAccount[]>([]);
  const [history, setHistory] = useState<JobHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "amountAsc" | "amountDesc" | "title">("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([fetchAllEscrows(), getJobHistory()])
      .then(([chainEscrows, postedJobs]) => {
        const sortedEscrows = [...chainEscrows].sort((a, b) => b.publicKey.localeCompare(a.publicKey));
        setJobs(sortedEscrows);
        setHistory(postedJobs);
      })
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = jobs.filter((item) => {
      const stateOk = stateFilter === "all" || item.state === stateFilter;
      const queryOk =
        normalizedQuery.length === 0 ||
        item.jobTitle.toLowerCase().includes(normalizedQuery) ||
        item.jobDescription.toLowerCase().includes(normalizedQuery);
      return stateOk && queryOk;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortBy === "amountAsc") return a.amount - b.amount;
      if (sortBy === "amountDesc") return b.amount - a.amount;
      if (sortBy === "title") return a.jobTitle.localeCompare(b.jobTitle);
      return b.publicKey.localeCompare(a.publicKey);
    });

    return sorted;
  }, [jobs, query, stateFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const paginatedJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, stateFilter, sortBy]);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm text-zinc-200">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/post-job" className="hover:text-white">Post Job</Link>
          <Link href="/jobs" className="hover:text-white">My Jobs</Link>
        </div>
        <AuthButton />
      </div>

      <h1 className="text-2xl font-bold text-white">All Posted Jobs</h1>
      <p className="mt-2 text-sm text-zinc-300">This page shows every job posting and active on-chain escrow.</p>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-lg font-semibold text-white">Posting Feed</h2>
        <div className="mt-3 space-y-3">
          {history.map((item) => (
            <Link
              key={item.escrowAddress}
              href={`/job/${item.escrowAddress}`}
              className="block rounded-lg border border-white/10 bg-black/20 p-3 transition hover:border-[#14F195]/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="text-sm font-semibold text-white">{item.jobTitle}</div>
                <div className="text-xs text-zinc-400">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-1 text-sm text-zinc-300">{item.jobDescription}</div>
            </Link>
          ))}
          {!loading && history.length === 0 && <p className="text-zinc-400">No postings saved yet.</p>}
        </div>
      </div>

      {loading && <p className="mt-4 text-zinc-400">Loading all jobs...</p>}

      <h2 className="mt-8 text-xl font-semibold text-white">On-chain Escrows</h2>

      <div className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:grid-cols-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or description"
          className="input md:col-span-2"
        />

        <select className="input" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
          <option value="all">All states</option>
          <option value="active">Active</option>
          <option value="workSubmitted">Work Submitted</option>
          <option value="disputed">Disputed</option>
          <option value="completed">Completed</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          className="input"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "newest" | "amountAsc" | "amountDesc" | "title")}
        >
          <option value="newest">Sort: Newest</option>
          <option value="amountAsc">Sort: Amount low-high</option>
          <option value="amountDesc">Sort: Amount high-low</option>
          <option value="title">Sort: Title A-Z</option>
        </select>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {paginatedJobs.map((escrow) => (
          <JobCard key={escrow.publicKey} escrow={escrow} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">
        <span>Showing {filteredJobs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filteredJobs.length)} of {filteredJobs.length}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-white/20 px-3 py-1 disabled:opacity-50"
          >
            Prev
          </button>
          <span>Page {page}/{totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-white/20 px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {!loading && filteredJobs.length === 0 && <p className="mt-4 text-zinc-400">No jobs found for current filters.</p>}
    </section>
  );
}

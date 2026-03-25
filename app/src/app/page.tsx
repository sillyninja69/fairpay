"use client";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import WalletButton from "@/components/WalletButton";

export default function Home() {
  const flowSteps = [
    {
      id: "01",
      title: "Fund a transparent escrow",
      desc: "Client locks SOL against clear milestones and acceptance terms.",
    },
    {
      id: "02",
      title: "Ship work with proof",
      desc: "Freelancer submits deliverables, links, and evidence directly on-chain.",
    },
    {
      id: "03",
      title: "Settle or escalate",
      desc: "Approve instantly or open AI-assisted arbitration for a verifiable outcome.",
    },
  ];

  const reasons = [
    {
      title: "Signal-rich status",
      desc: "Escrow state, evidence, and settlement history stay readable at a glance.",
    },
    {
      title: "Disputes with structure",
      desc: "Arbitration is explicit, auditable, and designed for clear finality.",
    },
    {
      title: "Wallet-native actions",
      desc: "Post jobs, release funds, and resolve issues without leaving your flow.",
    },
  ];

  return (
    <div className="fp-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="ambient-float absolute left-[8%] top-[-8rem] h-[22rem] w-[22rem] rounded-full bg-[#ff7e33]/25 blur-[120px]" />
        <div className="ambient-float absolute right-[4%] top-[8rem] h-[26rem] w-[26rem] rounded-full bg-[#58a7ff]/20 blur-[130px]" />
        <div className="ambient-float absolute bottom-[-10rem] left-[36%] h-[24rem] w-[24rem] rounded-full bg-[#2be7c8]/15 blur-[140px]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#080c17]/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#9ac5ff]/30 bg-gradient-to-br from-[#ff7e33]/75 to-[#58a7ff]/55 font-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
              FP
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-white">FairPay</div>
              <div className="-mt-0.5 text-xs text-blue-100/70">Escrow orchestration on Solana</div>
            </div>
          </div>

          <nav className="hidden items-center gap-7 md:flex">
            <Link href="/post-job" className="text-sm font-semibold text-blue-100/75 transition hover:text-white">
              Post a Job
            </Link>
            <Link href="/jobs" className="text-sm font-semibold text-blue-100/75 transition hover:text-white">
              My Jobs
            </Link>
            <Link href="/all-jobs" className="text-sm font-semibold text-blue-100/75 transition hover:text-white">
              All Jobs
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <AuthButton />
            <WalletButton />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-14 pt-10 sm:pt-14">
        <section className="grid gap-8 md:grid-cols-12 md:items-stretch">
          <div className="slide-in md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#94bfff]/25 bg-[#0f1931]/65 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-blue-100/80">
              <span className="h-2 w-2 rounded-full bg-[#2be7c8]" />
              Production-grade escrow + AI dispute lane
            </div>

            <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl">
              Freelance payments, redesigned for
              <span className="title-gradient"> trust at scale.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-blue-100/80 sm:text-lg">
              FairPay turns each contract into a verifiable timeline: lock SOL, submit evidence,
              release funds, and resolve disagreements with structured arbitration instead of chaos.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/post-job"
                className="rounded-xl border border-[#ffca9e]/30 bg-gradient-to-r from-[#ff7e33] to-[#ffb15d] px-6 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(255,126,51,0.35)] transition hover:translate-y-[-1px]"
              >
                Post a Job
              </Link>
              <Link
                href="/jobs"
                className="rounded-xl border border-[#9ac5ff]/30 bg-[#111b31]/70 px-6 py-3 font-semibold text-blue-50 transition hover:bg-[#18274a]"
              >
                View My Jobs
              </Link>
              <Link
                href="/all-jobs"
                className="rounded-xl border border-[#72e7d5]/30 bg-[#11253b]/70 px-6 py-3 font-semibold text-[#a2f4e7] transition hover:bg-[#17304a]"
              >
                Browse All Jobs
              </Link>
            </div>

            <div className="slide-in slide-delay-1 mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Escrow Time", value: "~30 sec" },
                { label: "State visibility", value: "On-chain" },
                { label: "Dispute lane", value: "AI-assisted" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-[#9ac5ff]/25 bg-[#0f1931]/65 p-4"
                >
                  <div className="text-xs uppercase tracking-[0.08em] text-blue-100/65">{item.label}</div>
                  <div className="mt-2 text-xl font-semibold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="slide-in slide-delay-2 md:col-span-5">
            <div className="glass relative h-full overflow-hidden rounded-2xl p-6">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#58a7ff]/35 blur-3xl" />
              <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-[#2be7c8]/20 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Escrow Pulse</h2>
                <span className="rounded-full border border-[#72e7d5]/35 bg-[#1b2b3d]/80 px-2.5 py-1 text-xs font-medium text-[#89f3e3]">
                  Live Flow
                </span>
              </div>

              <div className="relative mt-6 space-y-4">
                {[
                  {
                    state: "Funded",
                    time: "09:42",
                    desc: "Escrow account initialized and SOL secured.",
                  },
                  {
                    state: "Work Submitted",
                    time: "11:08",
                    desc: "Deliverables and evidence bundle attached.",
                  },
                  {
                    state: "Resolution",
                    time: "11:31",
                    desc: "Approved or routed to arbitration for final settlement.",
                  },
                ].map((item) => (
                  <div key={item.state} className="rounded-xl border border-[#9ac5ff]/20 bg-[#0a1222]/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-white">{item.state}</div>
                      <div className="font-mono text-xs text-blue-100/60">{item.time}</div>
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-blue-100/70">{item.desc}</div>
                  </div>
                ))}
              </div>

              <div className="relative mt-6 rounded-xl border border-[#9ac5ff]/20 bg-[#0b1324]/65 p-4">
                <div className="text-xs uppercase tracking-[0.12em] text-blue-100/55">Guarantee</div>
                <div className="mt-1 text-sm text-white">No hidden status changes. Every transition is explicit.</div>
              </div>

              <div className="relative mt-5 flex items-center justify-between border-t border-[#9ac5ff]/20 pt-4">
                <div className="text-sm text-blue-100/65">
                  Built for outcomes you can audit
                </div>
                <Link href="/post-job" className="text-sm font-semibold text-[#8cecdf] transition hover:text-[#a6f5e9]">
                  Start now →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="slide-in slide-delay-3 mt-7">
          <div className="glass rounded-2xl p-4">
            <div className="grid gap-3 text-sm text-blue-100/80 sm:grid-cols-3">
              <div className="rounded-lg border border-[#9ac5ff]/20 bg-[#0d1628]/70 px-3 py-2">Lock SOL with explicit milestones</div>
              <div className="rounded-lg border border-[#9ac5ff]/20 bg-[#0d1628]/70 px-3 py-2">Submit evidence without platform lock-in</div>
              <div className="rounded-lg border border-[#9ac5ff]/20 bg-[#0d1628]/70 px-3 py-2">Resolve disputes with auditable logic</div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h3 className="text-3xl font-bold leading-tight text-white sm:text-4xl">How contracts move from brief to payout</h3>
            <p className="mt-4 max-w-sm text-blue-100/75">
              This is not a generic dashboard skin. It is a contract timeline designed for accountability.
            </p>
          </div>

          <div className="lg:col-span-8">
            <div className="grid gap-4 md:grid-cols-3">
              {flowSteps.map((item) => (
                <div key={item.id} className="glass rounded-2xl p-5">
                  <div className="font-mono text-xs tracking-[0.14em] text-[#8dd4ff]">STEP {item.id}</div>
                  <h4 className="mt-3 text-lg font-semibold text-white">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-blue-100/75">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="grid gap-4 md:grid-cols-3">
            {reasons.map((card, index) => (
              <div
                key={card.title}
                className="relative overflow-hidden rounded-2xl border border-[#9ac5ff]/20 bg-[#0b1428]/75 p-6"
              >
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl"
                  style={{
                    backgroundColor: index === 0 ? "rgb(88 167 255 / 0.4)" : index === 1 ? "rgb(43 231 200 / 0.35)" : "rgb(255 126 51 / 0.35)",
                  }}
                />
                <h4 className="relative text-lg font-semibold text-white">{card.title}</h4>
                <p className="relative mt-2 text-sm leading-relaxed text-blue-100/75">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 mt-10 border-t border-white/10 bg-[#070b14]/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-blue-100/70">
            © {new Date().getFullYear()} FairPay. Escrow infrastructure for independent talent.
          </div>
          <div className="flex items-center gap-5 text-sm font-semibold text-blue-100/80">
            <Link href="/jobs" className="transition hover:text-white">Jobs</Link>
            <Link href="/post-job" className="transition hover:text-white">Post job</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

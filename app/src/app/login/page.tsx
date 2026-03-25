"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SessionUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => setCurrentUser((payload.user as SessionUser | null) ?? null))
      .catch(() => setCurrentUser(null));
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "").trim();

    if (!name || !email || !password) {
      toast.error("Please fill all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Login failed");
      }

      setCurrentUser(payload.user as SessionUser);
      toast.success("Logged in");
  const next = new URLSearchParams(window.location.search).get("next") || "/";
      router.push(next);
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6 flex items-center gap-4 text-sm text-zinc-200">
        <Link href="/" className="hover:text-white">Home</Link>
        <Link href="/post-job" className="hover:text-white">Post Job</Link>
        <Link href="/jobs" className="hover:text-white">My Jobs</Link>
      </div>

      <h1 className="text-2xl font-bold text-white">Login</h1>
      <p className="mt-2 text-sm text-zinc-300">Use this account for app session features.</p>

      {currentUser && (
        <p className="mt-3 text-sm text-[#89f3e3]">
          Signed in as {currentUser.name} ({currentUser.email})
        </p>
      )}

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <input name="name" placeholder="Full name" required className="input" />
        <input name="email" placeholder="Email" required type="email" className="input" />
        <input name="password" placeholder="Password" required type="password" className="input" />

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </section>
  );
}

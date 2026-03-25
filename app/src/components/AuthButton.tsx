"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionUser } from "@/lib/auth";

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => setUser((payload.user as SessionUser | null) ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="rounded-xl border border-[#9ac5ff]/20 bg-[#0f1931]/60 px-4 py-2 text-sm text-zinc-300">...</div>;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-xl border border-[#9ac5ff]/35 bg-[#0f1931]/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1a2b4e]"
      >
        Login
      </Link>
    );
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-xl border border-[#72e7d5]/35 bg-[#13283c]/80 px-3 py-2 text-sm font-semibold text-[#89f3e3] transition hover:bg-[#1a3049]"
      title={`Logged in as ${user.email}`}
    >
      {user.name} (Logout)
    </button>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function WalletButton() {
  const [mounted, setMounted] = useState(false);
  const { wallets } = useWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  const phantomWallet = wallets.find(
    (wallet) => wallet.adapter.name.toLowerCase() === "phantom"
  );

  const isPhantomInstalled =
    phantomWallet?.readyState === WalletReadyState.Installed ||
    phantomWallet?.readyState === WalletReadyState.Loadable;

  if (!mounted) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="rounded-xl border border-[#9ac5ff]/35 bg-[#101a31]/80 px-4 py-2 text-sm font-semibold text-white">
          Select Wallet
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <WalletMultiButton
        className="!h-auto !rounded-xl !border !border-[#9ac5ff]/35 !bg-[#101a31]/80 !px-4 !py-2 !text-sm !font-semibold !leading-none !text-white transition hover:!bg-[#1a2b4e]"
      />

      {!isPhantomInstalled && (
        <a
          href="https://phantom.app/download"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-[#9ac5ff] hover:text-white"
        >
          Phantom not detected. Install wallet
        </a>
      )}
    </div>
  );
}
import { NextRequest, NextResponse } from "next/server";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { FAIRPAY_IDL } from "@/lib/idl";
import { RPC_ENDPOINT } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      escrowAddress,
      clientClaim,
      freelancerClaim,
      jobTitle,
      jobDescription,
      workDescription,
      workLink,
      client,
      freelancer,
    } = body;

    // ── Gemini AI Judge ──────────────────────────────────────────
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an impartial judge for a freelance dispute.
Job: ${jobTitle} - ${jobDescription}
Work submitted: ${workDescription} - ${workLink}
Client's claim: ${clientClaim}
Freelancer's claim: ${freelancerClaim}
Based on the evidence, who should receive the funds?
Respond ONLY in JSON with no markdown: { "winner": "client" or "freelancer", "reasoning": "explanation" }`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.1, maxOutputTokens: 400 },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return NextResponse.json({ error: errText }, { status: 500 });
    }

    const geminiJson = await geminiResponse.json();
    const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Strip markdown code fences if Gemini adds them
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    const verdict = JSON.parse(cleanText);
    const winner = verdict.winner === "client" ? client : freelancer;
    const reasoning = String(verdict.reasoning || "");

    // ── Resolver keypair from JSON array ────────────────────────
    const secret = process.env.RESOLVER_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { error: "Missing RESOLVER_SECRET_KEY" },
        { status: 500 }
      );
    }

    const secretArray = JSON.parse(secret);
    const resolver = Keypair.fromSecretKey(Uint8Array.from(secretArray));
    const connection = new Connection(RPC_ENDPOINT, "confirmed");

    const wallet: Wallet = {
      publicKey: resolver.publicKey,
      payer: resolver,
      signTransaction: async (tx) => {
        // `tx` can be either legacy `Transaction` (supports partialSign) or `VersionedTransaction` (supports sign()).
        if (typeof (tx as any).partialSign === "function") {
          (tx as any).partialSign(resolver);
        } else if (typeof (tx as any).sign === "function") {
          (tx as any).sign([resolver]);
        } else {
          throw new Error("Unsupported transaction type for signing");
        }
        return tx;
      },
      signAllTransactions: async (txs) =>
        txs.map((tx) => {
          if (typeof (tx as any).partialSign === "function") {
            (tx as any).partialSign(resolver);
          } else if (typeof (tx as any).sign === "function") {
            (tx as any).sign([resolver]);
          }
          return tx;
        }),
    };

    const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "confirmed" });
    // Anchor Program constructor signature is (idl, provider, ...), not (idl, programId, provider)
    const program = new Program(FAIRPAY_IDL as never, provider);

    const signature = await (program.methods as any)
      .resolveDispute(new PublicKey(winner), reasoning)
      .accounts({
        resolver: resolver.publicKey,
        winner: new PublicKey(winner),
        escrow: new PublicKey(escrowAddress),
      })
      .rpc();

    return NextResponse.json({ winner: verdict.winner, reasoning, signature });

  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
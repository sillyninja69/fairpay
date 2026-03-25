import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type VerifyPayload = {
  jobTitle: string;
  jobDescription: string;
  workDescription: string;
  workLink: string;
  clientClaim?: string;
  freelancerClaim?: string;
};

type CompletionVerdict = {
  completed: boolean;
  confidence: number;
  reasoning: string;
  missingItems: string[];
};

function normalizeConfidence(value: unknown) {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return 0;
  if (num < 0) return 0;
  if (num > 1) return 1;
  return num;
}

function parseVerdict(rawText: string): CompletionVerdict {
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) as Partial<CompletionVerdict>;

  return {
    completed: Boolean(parsed.completed),
    confidence: normalizeConfidence(parsed.confidence),
    reasoning: String(parsed.reasoning || "No reasoning provided."),
    missingItems: Array.isArray(parsed.missingItems)
      ? parsed.missingItems.map((item) => String(item))
      : [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as VerifyPayload;

    if (!payload.jobTitle || !payload.jobDescription) {
      return NextResponse.json({ error: "Missing job details" }, { status: 400 });
    }

    if (!payload.workDescription && !payload.workLink) {
      return NextResponse.json(
        { error: "Work details are required for verification" },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY (or GOOGLE_API_KEY)" },
        { status: 500 }
      );
    }

    const geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    const prompt = `You are a strict project completion verifier for freelance escrow.

Evaluate if the submitted work appears complete relative to the original job request.

Job title: ${payload.jobTitle}
Job requirements: ${payload.jobDescription}
Submitted work summary: ${payload.workDescription || "(empty)"}
Submitted work link: ${payload.workLink || "(empty)"}
Client claim: ${payload.clientClaim || "(none)"}
Freelancer claim: ${payload.freelancerClaim || "(none)"}

Return ONLY valid JSON and no markdown:
{
  "completed": true or false,
  "confidence": number between 0 and 1,
  "reasoning": "short explanation",
  "missingItems": ["list of missing deliverables or checks"]
}

Rules:
- If evidence is weak or missing, set completed to false.
- Keep reasoning concise and factual.
- missingItems should be empty when completed is true.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return NextResponse.json({ error: errText }, { status: 500 });
    }

    const geminiJson = (await geminiResponse.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const rawText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const verdict = parseVerdict(rawText);

    return NextResponse.json(verdict, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { JobHistoryItem } from "@/lib/jobHistory";
import { listJobs, upsertJob } from "@/lib/server/jobStore";

export const runtime = "nodejs";

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidJobPayload(value: unknown): value is JobHistoryItem {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<JobHistoryItem>;

  return (
    isNonEmptyString(input.escrowAddress) &&
    isNonEmptyString(input.signature) &&
    isNonEmptyString(input.client) &&
    isNonEmptyString(input.freelancer) &&
    isNonEmptyString(input.jobTitle) &&
    isNonEmptyString(input.jobDescription) &&
    typeof input.amountLamports === "number" &&
    Number.isFinite(input.amountLamports) &&
    isNonEmptyString(input.createdAt)
  );
}

export async function GET(request: NextRequest) {
  try {
    const owner = request.nextUrl.searchParams.get("owner") || undefined;
    const jobs = await listJobs(owner);
    return NextResponse.json({ jobs }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to load jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    if (!isValidJobPayload(payload)) {
      return NextResponse.json({ error: "Invalid job payload" }, { status: 400 });
    }

    await upsertJob(payload);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
  }
}

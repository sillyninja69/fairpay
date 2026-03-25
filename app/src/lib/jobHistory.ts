export type JobHistoryItem = {
  escrowAddress: string;
  signature: string;
  client: string;
  freelancer: string;
  jobTitle: string;
  jobDescription: string;
  amountLamports: number;
  createdAt: string;
};

export async function saveJobToHistory(item: JobHistoryItem) {
  const response = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Failed to save job history");
  }
}

export async function getJobHistory(ownerAddress?: string): Promise<JobHistoryItem[]> {
  const url = ownerAddress
    ? `/api/jobs?owner=${encodeURIComponent(ownerAddress)}`
    : "/api/jobs";

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Failed to fetch job history");
  }

  const payload = (await response.json()) as { jobs?: JobHistoryItem[] };
  return payload.jobs || [];
}

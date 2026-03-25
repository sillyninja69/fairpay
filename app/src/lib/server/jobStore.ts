import { promises as fs } from "fs";
import path from "path";
import { JobHistoryItem } from "@/lib/jobHistory";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "jobs.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf8");
  }
}

async function readAll(): Promise<JobHistoryItem[]> {
  await ensureStore();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as JobHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(items: JobHistoryItem[]) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function listJobs(owner?: string): Promise<JobHistoryItem[]> {
  const all = await readAll();
  const filtered = owner
    ? all.filter((item) => item.client === owner || item.freelancer === owner)
    : all;

  return filtered.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function upsertJob(item: JobHistoryItem) {
  const all = await readAll();
  const deduped = all.filter((entry) => entry.escrowAddress !== item.escrowAddress);
  await writeAll([item, ...deduped]);
}

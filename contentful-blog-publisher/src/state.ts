import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type SchedulerState = {
  lastRunAt: string | null;
  nextRunAt: string;
  /** Index into topics.txt for the *next* run (rotates after each successful publish). */
  topicIndex: number;
};

const statePath = () =>
  process.env.STATE_FILE ??
  path.join(process.cwd(), 'data', 'state.json');

export async function loadState(): Promise<SchedulerState | null> {
  try {
    const raw = await fs.readFile(statePath(), 'utf-8');
    const parsed = JSON.parse(raw) as Partial<SchedulerState>;
    return {
      lastRunAt: parsed.lastRunAt ?? null,
      nextRunAt:
        parsed.nextRunAt ??
        new Date(Date.now() + 60_000).toISOString(),
      topicIndex: typeof parsed.topicIndex === 'number' ? parsed.topicIndex : 0,
    };
  } catch {
    return null;
  }
}

export async function saveState(state: SchedulerState): Promise<void> {
  const p = statePath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(state, null, 2), 'utf-8');
}

/** Configurable interval + random jitter (ms). Defaults to 3 days + 0-24h jitter. */
export function computeNextRunAfterSuccess(from: Date): Date {
  const baseIntervalHrs = parseFloat(process.env.RUN_INTERVAL_HOURS || '72');
  const jitterHrs = parseFloat(process.env.RUN_JITTER_HOURS || '24');

  const base = baseIntervalHrs * 60 * 60 * 1000;
  const jitter = Math.floor(Math.random() * jitterHrs * 60 * 60 * 1000);
  return new Date(from.getTime() + base + jitter);
}

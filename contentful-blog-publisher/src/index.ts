import './loadEnv.js';
import {
  loadState,
  saveState,
  computeNextRunAfterSuccess,
  type SchedulerState,
} from './state.js';
import { runPublishPipeline, postsPerRunFromEnv } from './pipeline.js';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Delay before the first scheduled run after start. Default 0 = run the batch immediately. */
function firstRunDelayMs(): number {
  const v = process.env.FIRST_RUN_DELAY_MS;
  if (v !== undefined) return Math.max(0, parseInt(v, 10) || 0);
  return 0;
}

function normalizeState(s: Partial<SchedulerState> | null): SchedulerState {
  return {
    lastRunAt: s?.lastRunAt ?? null,
    nextRunAt:
      s?.nextRunAt ?? new Date(Date.now() + firstRunDelayMs()).toISOString(),
    topicIndex: typeof s?.topicIndex === 'number' ? s.topicIndex : 0,
  };
}

async function scheduleLoop(): Promise<void> {
  const once = process.argv.includes('--once');

  let state = await loadState();
  const now = new Date();

  if (!state) {
    const firstDelay = once ? 0 : firstRunDelayMs();
    state = {
      lastRunAt: null,
      nextRunAt: new Date(now.getTime() + firstDelay).toISOString(),
      topicIndex: 0,
    };
    await saveState(state);
    console.log(
      `[scheduler] No state file — first run scheduled in ${firstDelay} ms (${state.nextRunAt})`
    );
  } else {
    state = normalizeState(state);
    await saveState(state);
  }

  if (once) {
    const n = postsPerRunFromEnv();
    console.log(
      `[scheduler] --once: running pipeline now (${n} post${n === 1 ? '' : 's'} per POSTS_PER_RUN)`
    );
    const { nextTopicIndex } = await runPublishPipeline({
      topicIndex: state.topicIndex,
    });
    const next = computeNextRunAfterSuccess(new Date());
    await saveState({
      lastRunAt: new Date().toISOString(),
      nextRunAt: next.toISOString(),
      topicIndex: nextTopicIndex,
    });
    console.log('[scheduler] Next run:', next.toISOString());
    process.exit(0);
    return;
  }

  for (;;) {
    const s = normalizeState(await loadState());
    const next = new Date(s.nextRunAt).getTime();
    const wait = Math.max(0, next - Date.now());
    if (wait > 0) {
      console.log(
        `[scheduler] Sleeping ${Math.round(wait / 1000)}s until ${s.nextRunAt}`
      );
      await sleep(wait);
    }

    const cur = normalizeState(await loadState());

    try {
      const n = postsPerRunFromEnv();
      console.log(`[scheduler] Running batch: ${n} post${n === 1 ? '' : 's'}`);
      const { nextTopicIndex } = await runPublishPipeline({
        topicIndex: cur.topicIndex,
      });
      const after = computeNextRunAfterSuccess(new Date());
      await saveState({
        lastRunAt: new Date().toISOString(),
        nextRunAt: after.toISOString(),
        topicIndex: nextTopicIndex,
      });
      console.log('[scheduler] Success. Next run:', after.toISOString());
    } catch (e) {
      console.error('[scheduler] Pipeline failed:', e);
      const backoff = Math.min(
        6 * 60 * 60 * 1000,
        15 * 60 * 1000 + Math.floor(Math.random() * 60 * 60 * 1000)
      );
      const retry = new Date(Date.now() + backoff);
      const latest = normalizeState(await loadState());
      await saveState({
        lastRunAt: latest.lastRunAt,
        nextRunAt: retry.toISOString(),
        topicIndex: latest.topicIndex,
      });
      console.log('[scheduler] Retry scheduled at:', retry.toISOString());
    }
  }
}

scheduleLoop().catch((e) => {
  console.error(e);
  process.exit(1);
});

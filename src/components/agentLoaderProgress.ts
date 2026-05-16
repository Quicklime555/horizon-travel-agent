export const AGENT_LOADER_MIN_DURATION_MS = 4500;
export const AGENT_LOADER_COMPLETION_DELAY_MS = 800;
export const AGENT_LOADER_PROGRESS_MAX_BEFORE_COMPLETE = 92;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function getAgentLoaderProgress(elapsedMs: number, isResultReady: boolean): number {
  if (isResultReady && elapsedMs >= AGENT_LOADER_MIN_DURATION_MS) {
    return 100;
  }

  const clampedElapsed = Math.max(0, Math.min(elapsedMs, AGENT_LOADER_MIN_DURATION_MS));
  const normalizedTime = clampedElapsed / AGENT_LOADER_MIN_DURATION_MS;
  const easedProgress = easeOutCubic(normalizedTime);
  const progress = 3 + Math.round(easedProgress * AGENT_LOADER_PROGRESS_MAX_BEFORE_COMPLETE);
  return Math.min(AGENT_LOADER_PROGRESS_MAX_BEFORE_COMPLETE, Math.max(3, progress));
}

export function shouldCompleteAgentLoader(elapsedMs: number, isResultReady: boolean): boolean {
  return isResultReady && elapsedMs >= AGENT_LOADER_MIN_DURATION_MS;
}

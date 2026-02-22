import { spawn, ChildProcess } from 'child_process';
import type { AppConfig } from './types';

const runningProcesses = new Map<string, ChildProcess>();

/**
 * Splits a command string into the executable and its arguments.
 * Handles simple quoted strings but defers to shell for complex cases.
 */
function splitCommand(command: string): [string, string[]] {
  const parts = command.trim().split(/\s+/);
  const [cmd, ...args] = parts;
  return [cmd, args];
}

/**
 * Spawns a child process for the given app configuration.
 * Tracks it in the internal map so it can be stopped later.
 */
export function startApp(app: AppConfig): ChildProcess {
  if (runningProcesses.has(app.id)) {
    const existing = runningProcesses.get(app.id)!;
    if (existing.exitCode === null && !existing.killed) {
      // Already running
      return existing;
    }
    runningProcesses.delete(app.id);
  }

  const [cmd, args] = splitCommand(app.command);

  const child = spawn(cmd, args, {
    cwd: app.cwd,
    env: { ...process.env, ...app.env },
    stdio: 'pipe',
    detached: false,
  });

  runningProcesses.set(app.id, child);

  child.on('exit', () => {
    runningProcesses.delete(app.id);
  });

  return child;
}

/**
 * Stops the tracked process for the given app ID.
 * Sends SIGTERM first; escalates to SIGKILL after 5 seconds if still alive.
 */
export async function stopApp(appId: string): Promise<void> {
  const child = runningProcesses.get(appId);
  if (!child) return;

  return new Promise<void>((resolve) => {
    let killed = false;

    const forceKill = setTimeout(() => {
      if (!killed) {
        try {
          child.kill('SIGKILL');
        } catch {
          // Process may already be gone
        }
      }
    }, 5000);

    child.once('exit', () => {
      killed = true;
      clearTimeout(forceKill);
      runningProcesses.delete(appId);
      resolve();
    });

    try {
      child.kill('SIGTERM');
    } catch {
      // Process may already be gone; resolve anyway
      clearTimeout(forceKill);
      runningProcesses.delete(appId);
      resolve();
    }
  });
}

/**
 * Returns the set of app IDs whose processes are currently alive.
 */
export function getRunningApps(): Set<string> {
  const alive = new Set<string>();
  for (const [id, child] of runningProcesses.entries()) {
    if (child.exitCode === null && !child.killed) {
      alive.add(id);
    }
  }
  return alive;
}

/**
 * Returns true if the process for the given app ID is alive.
 */
export function isAppRunning(appId: string): boolean {
  const child = runningProcesses.get(appId);
  if (!child) return false;
  return child.exitCode === null && !child.killed;
}

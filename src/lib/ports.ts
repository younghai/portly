import { exec } from 'child_process';
import { promisify } from 'util';
import type { PortInfo } from './types';

const execAsync = promisify(exec);

/**
 * Parses a single line of `lsof -iTCP -sTCP:LISTEN -nP` output.
 * Example line:
 *   node    12345 user   23u  IPv4 0x...  0t0  TCP *:3000 (LISTEN)
 */
function parseLsofLine(line: string): PortInfo | null {
  const parts = line.trim().split(/\s+/);
  // Minimum expected columns: COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
  if (parts.length < 9) return null;

  const processName = parts[0];
  const pid = parseInt(parts[1], 10);
  // lsof output: COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
  // NAME is like "*:3000 (LISTEN)" — the port part is second-to-last token
  const nameField = parts[parts.length - 2]; // "host:port" or "*:port"

  if (isNaN(pid)) return null;

  // Extract port from the name field (e.g. "*:3000", "127.0.0.1:8080")
  const colonIndex = nameField.lastIndexOf(':');
  if (colonIndex === -1) return null;

  const portStr = nameField.slice(colonIndex + 1);
  const port = parseInt(portStr, 10);
  if (isNaN(port)) return null;

  return {
    port,
    pid,
    process: processName,
    registered: false, // caller sets this based on known apps
  };
}

/**
 * Scans all TCP listening ports on the system.
 * Returns an array of PortInfo objects (registered defaults to false).
 */
export async function scanPorts(): Promise<PortInfo[]> {
  try {
    const { stdout } = await execAsync('lsof -iTCP -sTCP:LISTEN -nP');
    const lines = stdout.split('\n');
    // Skip the header line
    const dataLines = lines.slice(1);

    const ports: PortInfo[] = [];
    for (const line of dataLines) {
      if (!line.trim()) continue;
      const info = parseLsofLine(line);
      if (info) {
        ports.push(info);
      }
    }
    return ports;
  } catch (err: unknown) {
    // lsof exits with code 1 when no matches; treat that as empty list
    const error = err as { code?: number };
    if (error.code === 1) return [];
    throw err;
  }
}

/**
 * Checks whether a specific port is currently listening.
 */
export async function isPortInUse(port: number): Promise<boolean> {
  const ports = await scanPorts();
  return ports.some((p) => p.port === port);
}

import { NextResponse } from 'next/server';
import { getApps } from '@/lib/store';
import { scanPorts } from '@/lib/ports';

export async function GET() {
  try {
    const [ports, apps] = await Promise.all([scanPorts(), getApps()]);
    const registeredPorts = new Set(apps.map((a) => a.port));

    const portMap = new Map<number, { port: number; pid: number; process: string; registered: boolean }>();
    for (const info of ports) {
      if (!portMap.has(info.port)) {
        portMap.set(info.port, { ...info, registered: registeredPorts.has(info.port) });
      }
    }

    return NextResponse.json(
      Array.from(portMap.values()).sort((a, b) => a.port - b.port)
    );
  } catch {
    return NextResponse.json([]);
  }
}

import { NextResponse } from 'next/server';
import { getApps } from '@/lib/store';
import { startApp, isAppRunning } from '@/lib/process-manager';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apps = await getApps();
    const app = apps.find((a) => a.id === id);
    if (!app) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }
    if (isAppRunning(id)) {
      return NextResponse.json({ message: 'App already running', id }, { status: 200 });
    }
    const child = startApp(app);
    return NextResponse.json({ message: 'App started', id, pid: child.pid }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start app';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

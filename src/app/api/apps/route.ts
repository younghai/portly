import { NextResponse } from 'next/server';
import { getApps, addApp } from '@/lib/store';
import { isAppRunning } from '@/lib/process-manager';
import { v4 as uuidv4 } from 'uuid';
import type { AppConfig } from '@/lib/types';

export async function GET() {
  const apps = await getApps();
  const appsWithStatus = apps.map((app) => ({
    ...app,
    status: isAppRunning(app.id) ? 'running' : 'stopped',
  }));
  return NextResponse.json(appsWithStatus);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || body.port === undefined) {
      return NextResponse.json({ error: 'name and port are required' }, { status: 400 });
    }
    const newApp: AppConfig = {
      id: uuidv4(),
      name: body.name,
      category: body.category || 'backend',
      type: body.type || 'Custom',
      port: body.port,
      command: body.command || '',
      cwd: body.cwd || '',
      order: body.order ?? 999,
      ...(body.env && { env: body.env }),
    };
    await addApp(newApp);
    return NextResponse.json(newApp, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create app' }, { status: 400 });
  }
}

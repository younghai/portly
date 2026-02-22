import { NextResponse } from 'next/server';
import { stopApp, isAppRunning } from '@/lib/process-manager';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isAppRunning(id)) {
      return NextResponse.json({ message: 'App not running', id }, { status: 200 });
    }
    await stopApp(id);
    return NextResponse.json({ message: 'App stopped', id }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to stop app';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

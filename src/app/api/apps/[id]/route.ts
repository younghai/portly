import { NextResponse } from 'next/server';
import { updateApp, deleteApp } from '@/lib/store';
import { stopApp, isAppRunning } from '@/lib/process-manager';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateApp(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update app';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (isAppRunning(id)) {
      await stopApp(id);
    }
    const remaining = await deleteApp(id);
    return NextResponse.json(remaining);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete app';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

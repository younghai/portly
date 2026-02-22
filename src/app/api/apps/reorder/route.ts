import { NextResponse } from 'next/server';
import { reorderApps } from '@/lib/store';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { category, orderedIds } = body as { category: string; orderedIds: string[] };
    if (!category || !Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: 'category and orderedIds are required' },
        { status: 400 }
      );
    }
    const updated = await reorderApps(category, orderedIds);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reorder apps';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

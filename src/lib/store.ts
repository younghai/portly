import fs from 'fs/promises';
import path from 'path';
import type { AppConfig, AppsData } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'apps.json');

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify({ apps: [] }, null, 2), 'utf-8');
  }
}

export async function getApps(): Promise<AppConfig[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  const data: AppsData = JSON.parse(raw);
  return data.apps;
}

export async function saveApps(apps: AppConfig[]): Promise<void> {
  await ensureDataFile();
  const data: AppsData = { apps };
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function addApp(app: AppConfig): Promise<AppConfig[]> {
  const apps = await getApps();
  apps.push(app);
  await saveApps(apps);
  return apps;
}

export async function updateApp(
  id: string,
  data: Partial<AppConfig>
): Promise<AppConfig[]> {
  const apps = await getApps();
  const index = apps.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new Error(`App with id "${id}" not found`);
  }
  apps[index] = { ...apps[index], ...data };
  await saveApps(apps);
  return apps;
}

export async function deleteApp(id: string): Promise<AppConfig[]> {
  const apps = await getApps();
  const filtered = apps.filter((a) => a.id !== id);
  if (filtered.length === apps.length) {
    throw new Error(`App with id "${id}" not found`);
  }
  await saveApps(filtered);
  return filtered;
}

export async function reorderApps(
  category: string,
  orderedIds: string[]
): Promise<AppConfig[]> {
  const apps = await getApps();

  // Build a map for O(1) lookup of new order position
  const orderMap = new Map<string, number>();
  orderedIds.forEach((id, index) => {
    orderMap.set(id, index);
  });

  const updated = apps.map((app) => {
    if (app.category === category && orderMap.has(app.id)) {
      return { ...app, order: orderMap.get(app.id)! };
    }
    return app;
  });

  await saveApps(updated);
  return updated;
}

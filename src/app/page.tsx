'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Header from '@/components/Header';
import CategorySection from '@/components/CategorySection';
import AddAppModal from '@/components/AddAppModal';
import type { AppStatus, Category, PortInfo } from '@/lib/types';

const CATEGORY_LABELS: Record<Category, string> = {
  application: '어플리케이션',
  frontend: '프론트엔드',
  backend: '백엔드',
};

// Infra/system processes to exclude from auto-detection
const INFRA_PROCESSES = new Set([
  'mysqld', 'postgres', 'redis-ser', 'beam.smp', 'epmd',
  'ControlCe', 'rapportd', 'openobser', 'AdobeReso', 'Kiro\\x20H',
]);

// dev-runner's own port
const SELF_PORT = 4000;

// Map process name to human-readable description
function describeProcess(proc: string): string {
  const map: Record<string, string> = {
    node: 'Node.js 서버',
    php: 'PHP 서버',
    python: 'Python 서버',
    Python: 'Python 서버',
    java: 'Java 서버',
    go: 'Go 서버',
    ruby: 'Ruby 서버',
    bun: 'Bun 서버',
    deno: 'Deno 서버',
    uvicorn: 'Uvicorn (ASGI)',
    gunicorn: 'Gunicorn (WSGI)',
    windmill: 'Windmill',
    nginx: 'Nginx',
    caddy: 'Caddy',
  };
  return map[proc] || `${proc} 프로세스`;
}

// Heuristic: categorize detected port as frontend or backend
function guessCategory(port: PortInfo): Category {
  const proc = port.process.toLowerCase();
  if (['python', 'php', 'java', 'go', 'ruby', 'uvicorn', 'gunicorn', 'windmill'].some(p => proc.includes(p))) {
    return 'backend';
  }
  if (port.port >= 8000 && port.port <= 8999) return 'backend';
  return 'frontend';
}

export default function Dashboard() {
  const [apps, setApps] = useState<AppStatus[]>([]);
  const [detectedPorts, setDetectedPorts] = useState<AppStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<Category>('application');
  const [editingApp, setEditingApp] = useState<AppStatus | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchData = useCallback(async () => {
    try {
      const [appsRes, portsRes] = await Promise.all([
        fetch('/api/apps'),
        fetch('/api/ports'),
      ]);

      let appsData: AppStatus[] = [];
      if (appsRes.ok) {
        appsData = await appsRes.json();
        setApps(appsData);
      }

      if (portsRes.ok) {
        const portsData: PortInfo[] = await portsRes.json();

        // Convert unregistered, non-infra ports to display entries
        const detected = portsData
          .filter(p => !p.registered && !INFRA_PROCESSES.has(p.process) && p.port !== SELF_PORT)
          .map(p => ({
            id: `detected-${p.port}`,
            name: describeProcess(p.process),
            category: guessCategory(p),
            type: 'Custom' as const,
            port: p.port,
            command: p.process,  // store raw process name in command field
            cwd: '',
            order: p.port,
            status: 'running' as const,
            pid: p.pid,
            detected: true,
          }));
        setDetectedPorts(detected);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + polling every 5 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group registered apps + detected ports by category
  const grouped = (category: Category) => {
    const registered = apps
      .filter((a) => a.category === category)
      .sort((a, b) => a.order - b.order);
    const detected = detectedPorts
      .filter((a) => a.category === category)
      .sort((a, b) => a.port - b.port);
    return [...registered, ...detected];
  };

  const handleAdd = (category: Category) => {
    setEditingApp(undefined);
    setModalCategory(category);
    setModalOpen(true);
  };

  const handleEdit = (app: AppStatus) => {
    setEditingApp(app);
    setModalCategory(app.category);
    setModalOpen(true);
  };

  const handleSave = async (
    data: Omit<AppStatus, 'id' | 'status' | 'order' | 'pid'>
  ) => {
    try {
      if (editingApp) {
        await fetch(`/api/apps/${editingApp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else {
        await fetch('/api/apps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, category: modalCategory }),
        });
      }
      await fetchData();
    } catch {
      // silently fail
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/apps/${id}`, { method: 'DELETE' });
      await fetchData();
    } catch {
      // silently fail
    }
  };

  const handleToggle = async (id: string, isRunning: boolean) => {
    try {
      const action = isRunning ? 'stop' : 'start';
      await fetch(`/api/apps/${id}/${action}`, { method: 'POST' });
      await fetchData();
    } catch {
      // silently fail
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeApp = apps.find((a) => a.id === active.id);
    const overApp = apps.find((a) => a.id === over.id);
    if (!activeApp || !overApp || activeApp.category !== overApp.category) return;

    const category = activeApp.category;
    const categoryApps = grouped(category);
    const oldIndex = categoryApps.findIndex((a) => a.id === active.id);
    const newIndex = categoryApps.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(categoryApps, oldIndex, newIndex);

    // Optimistic update
    setApps((prev) => {
      const others = prev.filter((a) => a.category !== category);
      return [...others, ...reordered.map((a, i) => ({ ...a, order: i }))];
    });

    try {
      await fetch('/api/apps/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          orderedIds: reordered.map((a) => a.id),
        }),
      });
    } catch {
      await fetchData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Header />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <main className="px-6 space-y-8">
          {/* 어플리케이션 - 전체 너비 */}
          <CategorySection
            title={CATEGORY_LABELS.application}
            apps={grouped('application')}
            onAdd={() => handleAdd('application')}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />

          {/* 프론트엔드 / 백엔드 - 2컬럼 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CategorySection
              title={CATEGORY_LABELS.frontend}
              apps={grouped('frontend')}
              onAdd={() => handleAdd('frontend')}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
            <CategorySection
              title={CATEGORY_LABELS.backend}
              apps={grouped('backend')}
              onAdd={() => handleAdd('backend')}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          </div>
        </main>
      </DndContext>

      <AddAppModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editApp={editingApp}
      />
    </div>
  );
}

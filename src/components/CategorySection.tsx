'use client';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { AppStatus } from '@/lib/types';
import AppCard from './AppCard';

interface CategorySectionProps {
  title: string;
  apps: AppStatus[];
  onAdd: () => void;
  onEdit: (app: AppStatus) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, running: boolean) => void;
}

export default function CategorySection({
  title,
  apps,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: CategorySectionProps) {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h2>
        <button
          onClick={onAdd}
          className="text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors px-1"
        >
          + 추가
        </button>
      </div>

      {/* Sortable card list */}
      <SortableContext items={apps.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          ))}

          {apps.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm bg-white/50 rounded-xl border-2 border-dashed border-gray-200">
              등록된 항목이 없습니다
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

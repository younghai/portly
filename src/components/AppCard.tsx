'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AppStatus } from '@/lib/types';

interface AppCardProps {
  app: AppStatus;
  onEdit: (app: AppStatus) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, running: boolean) => void;
}

function CategoryIcon({ app }: { app: AppStatus }) {
  if (app.category === 'application') {
    if (app.type === 'Api') return <span className="text-lg">📡</span>;
    if (app.type === 'Web') return <span className="text-lg">🌐</span>;
    return <span className="text-lg">⚙️</span>;
  }
  if (app.category === 'frontend') return <span className="text-lg">🖥️</span>;
  return <span className="text-lg">⚡</span>;
}

export default function AppCard({ app, onEdit, onDelete, onToggle }: AppCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: app.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const isRunning = app.status === 'running';
  const isDetected = !!app.detected;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow cursor-default ${
        isDetected ? 'bg-green-50 border border-green-200' : 'bg-white'
      }`}
    >
      {/* Left: drag handle + icon + info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Drag handle area */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center cursor-grab active:cursor-grabbing"
          title="드래그하여 순서 변경"
        >
          <CategoryIcon app={app} />
        </div>

        {/* Text info */}
        <div className="min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{app.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {app.category === 'application' ? (
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-600 font-medium">
                {app.type}
              </span>
            ) : (
              <>
                {isDetected && app.command && (
                  <span className="text-xs text-gray-500 font-mono">{app.command}</span>
                )}
                {app.port > 0 && (
                  <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">:{app.port}</span>
                )}
                <span
                  className={`text-xs font-medium ${
                    isRunning ? 'text-green-500' : 'text-gray-400'
                  }`}
                >
                  {isRunning ? '실행 중' : '사용 가능'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        {/* Detected badge */}
        {isDetected && (
          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
            감지됨
          </span>
        )}

        {/* Toggle switch — shown when app has a command */}
        {app.command && !isDetected && (
          <button
            onClick={() => onToggle(app.id, isRunning)}
            className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
              isRunning
                ? 'bg-green-500 focus-visible:ring-green-500'
                : 'bg-gray-300 focus-visible:ring-gray-400'
            }`}
            title={isRunning ? '중지' : '시작'}
            aria-label={isRunning ? '앱 중지' : '앱 시작'}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                isRunning ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        )}

        {/* Edit button — application category only, not for detected */}
        {app.category === 'application' && !isDetected && (
          <button
            onClick={() => onEdit(app)}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
            title="편집"
            aria-label="앱 편집"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        )}

        {/* Delete button — not for detected */}
        {!isDetected && <button
          onClick={() => onDelete(app.id)}
          className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
          title="삭제"
          aria-label="앱 삭제"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>}
      </div>
    </div>
  );
}

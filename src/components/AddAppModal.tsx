'use client';
import { useState, useEffect } from 'react';
import type { AppStatus, Category, AppType } from '@/lib/types';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<AppStatus, 'id' | 'status' | 'order' | 'pid'>) => void;
  editApp?: AppStatus;
}

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'application', label: 'Application' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
];

const TYPE_OPTIONS: { value: AppType; label: string }[] = [
  { value: 'Api', label: 'API' },
  { value: 'Web', label: 'Web' },
  { value: 'Custom', label: 'Custom' },
];

interface FormState {
  name: string;
  category: Category;
  type: AppType;
  port: string;
  command: string;
  cwd: string;
}

const DEFAULT_FORM: FormState = {
  name: '',
  category: 'application',
  type: 'Web',
  port: '',
  command: '',
  cwd: '',
};

function toFormState(app: AppStatus): FormState {
  return {
    name: app.name,
    category: app.category,
    type: app.type,
    port: app.port > 0 ? String(app.port) : '',
    command: app.command,
    cwd: app.cwd,
  };
}

export default function AddAppModal({ isOpen, onClose, onSave, editApp }: AddAppModalProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Sync form when editApp changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(editApp ? toFormState(editApp) : DEFAULT_FORM);
      setErrors({});
    }
  }, [isOpen, editApp]);

  if (!isOpen) return null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = '이름을 입력해주세요.';
    const portNum = Number(form.port);
    if (form.port !== '' && (isNaN(portNum) || portNum < 1 || portNum > 65535)) {
      next.port = '유효한 포트 번호를 입력해주세요 (1–65535).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      category: form.category,
      type: form.type,
      port: form.port !== '' ? Number(form.port) : 0,
      command: form.command.trim(),
      cwd: form.cwd.trim(),
    });
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const isEditing = !!editApp;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Modal header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? '앱 편집' : '앱 추가'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEditing ? '앱 정보를 수정하세요.' : '새로운 앱을 등록하세요.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="예: My API Server"
                className={`w-full px-3 py-2 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.name ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value as Category)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type — only for application category */}
            {form.category === 'application' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">타입</label>
                <select
                  value={form.type}
                  onChange={(e) => set('type', e.target.value as AppType)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Port */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">포트</label>
              <input
                type="number"
                value={form.port}
                onChange={(e) => set('port', e.target.value)}
                placeholder="예: 3000"
                min={1}
                max={65535}
                className={`w-full px-3 py-2 rounded-lg border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.port ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.port && (
                <p className="mt-1 text-xs text-red-500">{errors.port}</p>
              )}
            </div>

            {/* Command */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">실행 명령어</label>
              <input
                type="text"
                value={form.command}
                onChange={(e) => set('command', e.target.value)}
                placeholder="예: npm run dev"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {/* Working directory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">작업 디렉토리</label>
              <input
                type="text"
                value={form.cwd}
                onChange={(e) => set('cwd', e.target.value)}
                placeholder="예: /Users/me/projects/my-app"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono text-xs"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      {/* Left: bell icon + title */}
      <div className="flex items-center gap-3">
        {/* Bell icon */}
        <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">dev-runner</h1>
      </div>

      {/* Right: online indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          {/* Pulsing ring */}
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          {/* Solid dot */}
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
        </span>
        <span className="text-xs text-gray-500 font-medium">온라인</span>
      </div>
    </header>
  );
}

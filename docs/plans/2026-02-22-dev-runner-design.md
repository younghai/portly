# dev-runner Design Document

**Date:** 2026-02-22
**Status:** Approved

## Overview

Development server manager web app. Manages multiple dev servers from a single dashboard with start/stop controls, port monitoring, and drag-and-drop reordering.

## Decisions

- **Approach:** Next.js Full-Stack (App Router + API Routes)
- **Server Control:** Hybrid (registered apps: start/stop, unregistered ports: monitor only)
- **Storage:** Local JSON file (`data/apps.json`)
- **DnD:** `@dnd-kit/core` + `@dnd-kit/sortable`
- **Port:** 4000

## Architecture

```
Next.js App Router (port 4000)
├── Frontend (React + Tailwind + dnd-kit)
├── API Routes
│   ├── /api/ports       - System port scan
│   ├── /api/apps        - CRUD for registered apps
│   ├── /api/apps/:id/start|stop - Process control
│   └── /api/apps/reorder - Drag reorder
└── data/apps.json
```

## Data Model

```json
{
  "apps": [{
    "id": "uuid",
    "name": "quick-capture/server",
    "category": "application | frontend | backend",
    "type": "Api | Web | Custom",
    "port": 3000,
    "command": "npm run dev",
    "cwd": "/path/to/project",
    "order": 0
  }]
}
```

## UI Sections

1. Header: logo + system status indicator
2. Applications: registered app cards (name + type badge + edit/delete)
3. Frontend/Backend: 2-column grid with port + status + start/stop toggle
4. Each section: "+ 추가" button
5. Drag-and-drop within same category
6. Status polling every 5 seconds

## Libraries

- `@dnd-kit/core`, `@dnd-kit/sortable` - drag and drop
- `uuid` - app ID generation
- `tailwindcss` - styling

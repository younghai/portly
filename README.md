# dev-runner

개발 서버를 한 곳에서 관리하는 대시보드입니다.
터미널 여러 개를 열지 않고, 포트 충돌 걱정 없이 서버를 시작·종료·모니터링할 수 있습니다.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)

---

## Overview

| 기능 | 설명 |
|------|------|
| 🔍 **포트 자동 감지** | 현재 실행 중인 모든 포트를 스캔하여 자동 표시 |
| 🏷️ **프로세스 설명** | `node`, `php`, `python` 등을 "Node.js 서버", "PHP 서버"로 표시 |
| ▶️ **서버 시작/종료** | 등록한 앱은 토글 버튼 하나로 시작·종료 |
| 📂 **카테고리 분류** | 어플리케이션 / 프론트엔드 / 백엔드로 자동 분류 |
| 🔄 **드래그 앤 드롭** | 카드를 드래그하여 우선순위 순서 변경 |
| 🔁 **실시간 갱신** | 5초마다 포트 상태 자동 업데이트 |

<img width="807" height="481" alt="Screenshot 2026-02-22 at 2 58 47 PM" src="https://github.com/user-attachments/assets/072c3aa6-65cb-4b88-8992-79dc3bae02c6" />


---

## 설치 방법

### 사전 요구사항

- Node.js 18 이상
- macOS (포트 스캔에 `lsof` 사용)

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/YOUR_USERNAME/dev-runner.git
cd dev-runner

# 의존성 설치
npm install

# 개발 서버 실행 (포트 4000)
npm run dev
```

브라우저에서 [http://localhost:4000](http://localhost:4000) 접속

### 프로덕션 빌드

```bash
npm run build
npm start
```

---

## 사용/운영 방법

### 1. 포트 자동 감지

대시보드에 접속하면 현재 실행 중인 포트가 자동으로 감지되어 표시됩니다.
`초록색 "감지됨" 배지`가 붙은 카드가 자동 감지된 항목입니다.

- **프론트엔드** 섹션: `node` 기반 서버 등
- **백엔드** 섹션: `python`, `php`, `java`, `windmill` 등

### 2. 앱 등록

각 섹션 오른쪽 **`+ 추가`** 버튼으로 앱을 직접 등록할 수 있습니다.

| 항목 | 설명 | 예시 |
|------|------|------|
| 이름 | 표시될 앱 이름 | `My API` |
| 포트 | 사용할 포트 번호 | `3001` |
| 시작 명령어 | 실행할 명령어 | `npm run dev` |
| 작업 디렉토리 | 명령어 실행 위치 | `/Users/me/my-app` |

### 3. 서버 시작 / 종료

등록된 앱 카드 오른쪽 **토글 스위치**로 시작/종료합니다.

- 🟢 초록색 = 실행 중
- ⚪ 회색 = 중지됨

### 4. 순서 변경

카드 왼쪽 아이콘을 **드래그**하면 같은 카테고리 내에서 순서를 변경할 수 있습니다.

### 5. 데이터 저장 위치

등록한 앱 정보는 로컬 파일에 저장됩니다 (`.gitignore` 처리됨):

```
dev-runner/
└── data/
    └── apps.json
```

---

## 기타

### 자동 필터링 대상

아래 시스템/인프라 프로세스는 대시보드에 표시되지 않습니다:

`mysqld` · `postgres` · `redis-server` · `beam.smp` (RabbitMQ) · `epmd` · `ControlCenter` · `openobserve` 등

### 지원 프로세스 설명 매핑

| 프로세스 | 표시 이름 |
|---------|----------|
| `node` | Node.js 서버 |
| `php` | PHP 서버 |
| `python` / `Python` | Python 서버 |
| `java` | Java 서버 |
| `go` | Go 서버 |
| `bun` | Bun 서버 |
| `deno` | Deno 서버 |
| `uvicorn` | Uvicorn (ASGI) |
| `gunicorn` | Gunicorn (WSGI) |
| `windmill` | Windmill |
| `nginx` | Nginx |

### 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable
- **Port Scanning**: `lsof -iTCP -sTCP:LISTEN -nP`
- **Process Management**: Node.js `child_process`
- **Storage**: Local JSON file (`data/apps.json`)

export type Category = 'application' | 'frontend' | 'backend';
export type AppType = 'Api' | 'Web' | 'Custom';

export interface AppConfig {
  id: string;
  name: string;
  category: Category;
  type: AppType;
  port: number;
  command: string;
  cwd: string;
  order: number;
  env?: Record<string, string>;
}

export interface AppsData {
  apps: AppConfig[];
}

export interface PortInfo {
  port: number;
  pid: number;
  process: string;
  registered: boolean; // whether this port belongs to a registered app
}

export interface AppStatus extends AppConfig {
  status: 'running' | 'stopped' | 'unknown';
  pid?: number;
  detected?: boolean; // true if auto-detected from port scan (not manually registered)
}

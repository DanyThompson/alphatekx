import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT_DIR = fileURLToPath(new URL('../', import.meta.url));
const TASK_LOG_PATH = path.join(ROOT_DIR, 'deployment-task-logs.json');

async function ensureLogFile() {
  try {
    await fs.access(TASK_LOG_PATH);
  } catch {
    await fs.writeFile(TASK_LOG_PATH, '[]\n', 'utf8');
  }
}

async function atomicWriteJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export async function appendTaskLog(entry) {
  await ensureLogFile();
  const raw = await fs.readFile(TASK_LOG_PATH, 'utf8');
  const current = (() => {
    try {
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  current.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  });

  await atomicWriteJson(TASK_LOG_PATH, current);
  return current[current.length - 1];
}

export async function getTaskLogs(deploymentId) {
  await ensureLogFile();
  const raw = await fs.readFile(TASK_LOG_PATH, 'utf8');
  const current = (() => {
    try {
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  return current.filter((entry) => entry.deploymentId === deploymentId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export async function clearTaskLogs() {
  await atomicWriteJson(TASK_LOG_PATH, []);
}

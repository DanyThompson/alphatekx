import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const RULES_FILE = fileURLToPath(new URL('./security-rules.json', import.meta.url));
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'public', 'build']);
const TEXT_EXTENSIONS = new Set([
  '.js', '.ts', '.tsx', '.jsx', '.json', '.env', '.env.local', '.env.development', '.env.production', '.md', '.yml', '.yaml', '.cfg', '.ini', '.sh', '.bash', '.zsh', '.dockerfile', '.txt'
]);

function isTextPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return TEXT_EXTENSIONS.has(ext) || filePath.endsWith('Dockerfile') || filePath.endsWith('Makefile');
}

function normalizeFilePath(filePath) {
  return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
}

function hashContent(content) {
  return crypto.createHash('md5').update(content, 'utf8').digest('hex');
}

async function loadRules() {
  const content = await fs.readFile(RULES_FILE, 'utf8');
  return JSON.parse(content);
}

async function compileRules() {
  const rules = await loadRules();
  return rules.map((rule) => {
    const flags = rule.flags ?? 'gi';
    return {
      ...rule,
      regex: new RegExp(rule.pattern, flags),
    };
  });
}

export async function scanFile(filePath) {
  if (!isTextPath(filePath)) {
    return [];
  }

  const source = await fs.readFile(filePath, 'utf8');
  const checksum = hashContent(source);
  const lines = source.split(/\r?\n/);
  const compiled = await compileRules();
  const findings = [];

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
    const line = lines[lineNumber];
    if (!line.trim()) {
      continue;
    }

    for (const rule of compiled) {
      let match;
      rule.regex.lastIndex = 0;
      while ((match = rule.regex.exec(line)) !== null) {
        findings.push({
          file: normalizeFilePath(filePath),
          line: lineNumber + 1,
          type: rule.type,
          hint: rule.hint ?? null,
          raw: match[0],
          checksum,
        });
      }
    }
  }

  return findings;
}

export async function scanDirectory(rootDir = process.cwd()) {
  const queue = [rootDir];
  const findings = [];

  while (queue.length) {
    const current = queue.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) {
        continue;
      }

      const filePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(filePath);
        continue;
      }

      if (!isTextPath(filePath)) {
        continue;
      }

      const fileFindings = await scanFile(filePath);
      if (fileFindings.length) {
        findings.push(...fileFindings);
      }
    }
  }

  return findings;
}

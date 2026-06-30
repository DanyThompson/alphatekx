import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanFile } from './scanner.js';

const ROOT_DIR = fileURLToPath(new URL('../', import.meta.url));
const ENV_EXAMPLE_PATH = path.join(ROOT_DIR, '.env.example');
const ENV_PREFIX = 'ALPHATekX_';
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

function envKeyFromType(type) {
  return `${ENV_PREFIX}${type.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')}`;
}

function hashString(value) {
  return crypto.createHash('md5').update(value, 'utf8').digest('hex');
}

async function safeWriteFile(filePath, contents) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, contents, 'utf8');
  await fs.rename(tempPath, filePath);
}

async function ensureBackup(filePath, session) {
  if (!session || !session.backups) return;
  if (!session.backups.has(filePath)) {
    const originalContent = await fs.readFile(filePath, 'utf8').catch(() => null);
    session.backups.set(filePath, originalContent);
  }
}

async function restoreBackups(session, logger = console) {
  if (!session || !session.backups) return;
  for (const [filePath, content] of session.backups.entries()) {
    if (content === null) {
      await fs.rm(filePath, { force: true });
      logger.info(`[remediator] Rollback removed created file: ${filePath}`);
    } else {
      await fs.writeFile(filePath, content, 'utf8');
      logger.info(`[remediator] Rollback restored file: ${filePath}`);
    }
  }
}

function verifyIntegrity(originalContent, updatedContent, finding, logger) {
  const placeholder = `process.env.${envKeyFromType(finding.type)}`;
  const expected = originalContent.replace(finding.raw, placeholder);
  const integrityOk = updatedContent === expected;
  if (!integrityOk) {
    logger.error(`[remediator] Tamper Alert: ${finding.file} deviated beyond secret replacement.`);
  }
  return integrityOk;
}

async function appendToEnvExample(envKey, logger) {
  let contents = '';
  try {
    contents = await fs.readFile(ENV_EXAMPLE_PATH, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  const normalizedLines = contents ? contents.split(/\r?\n/) : [];
  const entry = `${envKey}=`;
  if (normalizedLines.includes(entry)) {
    logger.info(`[remediator] .env.example already contains ${envKey}`);
    return false;
  }

  if (contents && !contents.endsWith('\n')) {
    normalizedLines.push('');
  }
  normalizedLines.push(entry);
  await safeWriteFile(ENV_EXAMPLE_PATH, normalizedLines.join('\n') + '\n');
  logger.info(`[remediator] Appended ${envKey} to .env.example`);
  return true;
}

export async function remediateSecret(finding, { logger = console, session = null } = {}) {
  if (!finding || !finding.file || !finding.line || !finding.raw || !finding.type) {
    throw new Error('Invalid finding payload passed to remediateSecret.');
  }

  const filePath = path.resolve(process.cwd(), finding.file);
  if (!isTextPath(filePath)) {
    throw new Error(`Refusing to remediate non-text file: ${finding.file}`);
  }

  logger.info(`[remediator] Starting remediation for ${finding.file}:${finding.line}`);
  await ensureBackup(filePath, session);

  const source = await fs.readFile(filePath, 'utf8');
  const originalChecksum = hashString(source);
  const lines = source.split(/\r?\n/);
  const targetIndex = finding.line - 1;
  const targetLine = lines[targetIndex];

  if (!targetLine) {
    throw new Error(`Line ${finding.line} not found in ${finding.file}`);
  }

  if (!targetLine.includes(finding.raw)) {
    logger.info(`[remediator] Raw secret not found on target line for ${finding.file}:${finding.line} - skipping.`);
    return {
      status: 'SKIPPED',
      message: 'Secret already removed or not present on the target line.',
      file: finding.file,
      line: finding.line,
    };
  }

  const envKey = envKeyFromType(finding.type);
  const placeholder = `process.env.${envKey}`;
  lines[targetIndex] = targetLine.replace(finding.raw, placeholder);
  const updatedContent = lines.join('\n');
  await safeWriteFile(filePath, updatedContent);
  logger.info(`[remediator] File updated: ${finding.file}`);

  await appendToEnvExample(envKey, logger);

  const remaining = await scanFile(filePath);
  const finalChecksum = hashString(await fs.readFile(filePath, 'utf8'));
  const integrityOk = finalChecksum !== originalChecksum && verifyIntegrity(source, updatedContent, finding, logger);

  if (remaining.length > 0 || !integrityOk) {
    logger.info(`[remediator] Scanner still found ${remaining.length} item(s) after remediation.`);
    return {
      status: 'FAILURE',
      message: 'Secret remediation did not complete cleanly.',
      remaining,
      integrityOk,
    };
  }

  logger.info(`[remediator] Secret remediated and moved to environment config for ${finding.file}`);
  return {
    status: 'SUCCESS',
    message: 'Secret remediated and moved to environment config.',
    integrityOk,
  };
}

export async function remediateFindings(findings, options = {}) {
  const { logger = console, session = null } = options;
  const results = [];
  const activeSession = session ?? { backups: new Map() };
  const seen = new Set();

  for (const finding of findings) {
    const fingerprint = `${finding.file}:${finding.line}:${finding.raw}`;
    if (seen.has(fingerprint)) {
      logger.info(`[remediator] Duplicate finding skipped: ${fingerprint}`);
      continue;
    }
    seen.add(fingerprint);
    const result = await remediateSecret(finding, { ...options, session: activeSession });
    results.push(result);
    if (result.status === 'FAILURE') {
      await restoreBackups(activeSession, logger);
      break;
    }
  }

  return { results, session: activeSession };
}

export async function rollbackSession(session, logger = console) {
  await restoreBackups(session, logger);
}

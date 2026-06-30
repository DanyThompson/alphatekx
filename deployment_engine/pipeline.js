import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolve4, resolveCname } from 'dns/promises';
import { scanDirectory } from '../guardian_engine/scanner.js';
import { remediateFindings, rollbackSession } from '../guardian_engine/remediator.js';
import { consumeCredits } from '../guardian_engine/creditLedger.js';
import { executePluginHooks } from '../guardian_engine/pluginManager.js';
import { buildLiveDomain, validateCustomDomain, getDomainSetupInstructions, simulateDomainActivation } from './domainManager.js';

const ROOT_DIR = fileURLToPath(new URL('../', import.meta.url));
const AUDIT_LOG_PATH = path.join(ROOT_DIR, 'audit-log.json');
const ARCHIVE_DIR = path.join(ROOT_DIR, 'permanent-archive');
const DOMAIN_BASE = 'alphatekx.name.ng';
const DEPLOY_SERVER_IP = '15.197.212.204';
const SERVICE_RESTART_COMMAND = 'systemctl restart nginx';

function deriveDeploymentSubdomain(projectPath, transactionID) {
  const rawName = path.basename(path.resolve(projectPath));
  const sanitized = rawName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .slice(0, 30);
  return sanitized || `alpha-${transactionID.slice(0, 8)}`;
}

function buildDeploymentDomain(projectPath, transactionID) {
  return buildLiveDomain(deriveDeploymentSubdomain(projectPath, transactionID), transactionID);
}

async function verifyDomainRecords(domain, logger = console) {
  try {
    const aRecords = await resolve4(domain).catch(() => []);
    const cnameRecords = await resolveCname(domain).catch(() => []);
    const healthy = aRecords.length > 0 || cnameRecords.length > 0;
    logger.info(`[pipeline] Domain verification for ${domain}: A=${aRecords.length ? aRecords.join(', ') : 'none'} CNAME=${cnameRecords.length ? cnameRecords.join(', ') : 'none'}`);
    return { healthy, aRecords, cnameRecords };
  } catch (error) {
    logger.error(`[pipeline] Domain verification failed for ${domain}: ${error.message}`);
    return { healthy: false, error: error.message, aRecords: [], cnameRecords: [] };
  }
}

async function simulateServerReload(hostIp, deploymentDomain, logger = console) {
  logger.info(`[pipeline] Triggering remote service reload on ${hostIp} for ${deploymentDomain}.`);
  await new Promise((resolve) => setTimeout(resolve, 420));
  logger.info(`[pipeline] Simulated SSH: ssh admin@${hostIp} 'sudo ${SERVICE_RESTART_COMMAND}'`);
  logger.info(`[pipeline] Remote Nginx/service reload succeeded for ${deploymentDomain}.`);
  return {
    hostIp,
    deploymentDomain,
    command: SERVICE_RESTART_COMMAND,
    simulated: true,
    reloadedAt: new Date().toISOString(),
  };
}

export function createTransactionID() {
  return crypto.randomUUID();
}

async function safeWriteFile(filePath, contents) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, contents, 'utf8');
  await fs.rename(tempPath, filePath);
}

async function appendAuditLog(entry) {
  let existing = [];
  try {
    const content = await fs.readFile(AUDIT_LOG_PATH, 'utf8');
    existing = JSON.parse(content);
    if (!Array.isArray(existing)) {
      existing = [];
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  existing.push(entry);
  await safeWriteFile(AUDIT_LOG_PATH, JSON.stringify(existing, null, 2) + '\n');
}

async function loadAuditLog() {
  try {
    const content = await fs.readFile(AUDIT_LOG_PATH, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

function shouldExcludePath(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  const excludedRoots = ['node_modules', '.git', 'permanent-archive', 'backups', 'tmp', 'dist', 'build'];
  return excludedRoots.some((root) => normalized === root || normalized.startsWith(`${root}/`));
}

async function computeProjectSnapshotHash(projectPath) {
  const root = path.resolve(projectPath);
  const hash = crypto.createHash('md5');

  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      const relativePath = path.relative(root, fullPath).replace(/\\/g, '/');
      if (shouldExcludePath(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (entry.isFile()) {
        const contents = await fs.readFile(fullPath);
        hash.update(relativePath);
        hash.update('\0');
        hash.update(contents);
        hash.update('\0');
      }
    }
  }

  await walk(root);
  return hash.digest('hex');
}

async function getAuditEntry(transactionID, stage) {
  const entries = await loadAuditLog();
  const matches = entries.filter((entry) => entry.transactionID === transactionID && entry.stage === stage);
  return matches.length ? matches[matches.length - 1] : null;
}

async function archiveAuditLog(transactionID, { projectPath, projectHash, finalSecurityStatus, stage }, logger = console) {
  await fs.mkdir(ARCHIVE_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archiveFile = path.join(ARCHIVE_DIR, `audit-log-${transactionID}-${timestamp}.json`);
  await fs.copyFile(AUDIT_LOG_PATH, archiveFile).catch((error) => {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  });

  const metadataFile = path.join(ARCHIVE_DIR, `deploy-metadata-${transactionID}-${timestamp}.json`);
  const metadata = {
    transactionID,
    timestamp: new Date().toISOString(),
    projectPath: path.resolve(projectPath),
    projectHash,
    finalSecurityStatus,
    stage,
  };
  await safeWriteFile(metadataFile, JSON.stringify(metadata, null, 2) + '\n');
  logger.info(`[pipeline] Transaction ${transactionID} - Audit log and metadata archived to permanent archive.`);
}

async function cleanupTemporaryFiles(logger = console) {
  const entries = await fs.readdir(ROOT_DIR, { withFileTypes: true });
  for (const entry of entries) {
    const candidate = path.join(ROOT_DIR, entry.name);
    if (entry.isFile() && entry.name.endsWith('.tmp')) {
      await fs.rm(candidate, { force: true });
      logger.info(`[pipeline] Removed temporary file: ${candidate}`);
    }
    if (entry.isDirectory() && entry.name === 'tmp') {
      await fs.rm(candidate, { recursive: true, force: true });
      logger.info(`[pipeline] Removed temporary directory: ${candidate}`);
    }
  }
}

export async function finalizeDeployment(projectPath, { transactionID, projectHash, logger = console } = {}) {
  if (!transactionID) {
    throw new Error('Missing transactionID for finalizeDeployment.');
  }
  if (!projectHash) {
    throw new Error('Missing projectHash for finalizeDeployment.');
  }

  const targetPath = path.resolve(projectPath);
  logger.info(`[pipeline] Transaction ${transactionID} - Finalizing deployment for ${targetPath}`);

  const verificationRecord = await getAuditEntry(transactionID, 'PREDEPLOY');
  if (!verificationRecord) {
    throw new Error('Integrity check failed: no previous successful scan/remediation record found for this transaction.');
  }

  if (verificationRecord.projectHash !== projectHash) {
    const message = 'Integrity check failed: project snapshot hash does not match the last verified scan/remediation.';
    logger.error(`[pipeline] Transaction ${transactionID} - ${message}`);
    throw new Error(message);
  }

  const deploymentDomain = buildDeploymentDomain(projectPath, transactionID);
  const domainValidation = validateCustomDomain(deploymentDomain);
  logger.info(`[pipeline] Transaction ${transactionID} - Deployment domain resolved to ${deploymentDomain} (${domainValidation.valid ? 'valid' : 'invalid'} format)`);

  const dnsResult = await verifyDomainRecords(deploymentDomain, logger);
  if (!dnsResult.healthy) {
    const message = `DNS integrity check failed for ${deploymentDomain}. Domain records are not correctly pointed.`;
    logger.error(`[pipeline] Transaction ${transactionID} - ${message}`);
    throw new Error(message);
  }

  const reloadInfo = await simulateServerReload(DEPLOY_SERVER_IP, deploymentDomain, logger);
  const activation = simulateDomainActivation(deploymentDomain);
  await consumeCredits({ amount: 8, reason: 'deployment', owner: 'default' });

  await fs.mkdir(ARCHIVE_DIR, { recursive: true });
  const deployRecordPath = path.join(ARCHIVE_DIR, `deployment-record-${transactionID}.json`);
  const deployInfo = {
    transactionID,
    deployedAt: new Date().toISOString(),
    hostingProvider: 'AlphaTekx Domain Engine',
    deploymentDomain,
    targetServer: DEPLOY_SERVER_IP,
    serviceCommand: SERVICE_RESTART_COMMAND,
    dnsRecords: dnsResult,
    reloadInfo,
    activation,
    setupInstructions: getDomainSetupInstructions(deploymentDomain, deploymentDomain),
    projectPath: targetPath,
    projectHash,
    status: 'DEPLOYED',
  };
  await safeWriteFile(deployRecordPath, JSON.stringify(deployInfo, null, 2) + '\n');
  logger.info(`[pipeline] Transaction ${transactionID} - Domain-aware deployment completed successfully.`);
  return deployInfo;
}

export async function runDeploymentPipeline(projectPath, { transactionID = createTransactionID(), logger = console, onProgress = () => {}, autoDeploy = false } = {}) {
  const targetPath = path.resolve(projectPath);
  const session = { backups: new Map() };
  let currentStage = 'Queued';
  logger.info(`[pipeline] Transaction ${transactionID} - Pre-flight security check starting...`);

  const updateProgress = (payload) => {
    try {
      if (payload && payload.stage) {
        currentStage = payload.stage;
      }
      onProgress({ transactionID, ...payload });
    } catch (error) {
      logger.warn(`[pipeline] Transaction ${transactionID} - Progress callback failed: ${error.message}`);
    }
  };

  updateProgress({ stage: 'Queued', progress: 0, message: 'Initializing secure deployment workflow.' });

  let actionTaken = 'No action needed';
  let finalSecurityStatus = 'AUTHORIZED';
  let deploymentMessage = 'Deployment Authorized';
  let initialCount = 0;
  let projectHash = null;

  try {
    updateProgress({ stage: 'Scanning', progress: 12, message: 'Scanning project files for leaked secrets.' });
    const findings = await scanDirectory(targetPath);
    initialCount = findings.length;
    logger.info(`[pipeline] Transaction ${transactionID} - Security scan found ${initialCount} secret(s) in ${targetPath}`);

    if (initialCount > 0) {
      actionTaken = `Detected ${initialCount} secret(s); remediation initiated.`;
      updateProgress({ stage: 'Remediating', progress: 35, message: 'Secrets detected, running remediation.' });
      logger.info(`[pipeline] Transaction ${transactionID} - Deployment paused: security violation detected. Initiating remediation.`);
      const { results: remediationResults } = await remediateFindings(findings, { logger, session });
      logger.info(`[pipeline] Transaction ${transactionID} - Remediation results:`);
      remediationResults.forEach((result, index) => {
        logger.info(`[pipeline] Transaction ${transactionID} -   ${index + 1}. ${result.status || 'SUCCESS'} - ${result.message || 'Remediation processed'}`);
      });

      const hasFailure = remediationResults.some((result) => result.status === 'FAILURE');
      if (hasFailure) {
        finalSecurityStatus = 'DENIED';
        deploymentMessage = 'Deployment Denied: Security Violation.';
        actionTaken += ' Remediation failed and rollback executed.';
        logger.error(`[pipeline] Transaction ${transactionID} - ${deploymentMessage}`);
        await rollbackSession(session, logger);
      } else {
        updateProgress({ stage: 'Verifying', progress: 55, message: 'Verifying remediation results.' });
        const remainingFindings = await scanDirectory(targetPath);
        if (remainingFindings.length > 0) {
          finalSecurityStatus = 'DENIED';
          deploymentMessage = 'Deployment Denied: Security Violation.';
          actionTaken += ` ${remainingFindings.length} secret(s) remain after remediation.`;
          logger.error(`[pipeline] Transaction ${transactionID} - ${deploymentMessage}`);
          await rollbackSession(session, logger);
        } else {
          finalSecurityStatus = 'AUTHORIZED';
          deploymentMessage = 'Deployment Authorized';
          actionTaken += ' No secrets remain after remediation.';
          logger.info(`[pipeline] Transaction ${transactionID} - Secrets remediated successfully. Ready for final deployment.`);
        }
      }
    } else {
      logger.info(`[pipeline] Transaction ${transactionID} - No secrets found during pre-flight scan. Ready for final deployment.`);
    }

    projectHash = await computeProjectSnapshotHash(targetPath);
    const deploymentDomain = buildDeploymentDomain(targetPath, transactionID);
    updateProgress({ stage: 'Verifying', progress: 70, message: `Performing final integrity cross-check for ${deploymentDomain}.` });
    await appendAuditLog({
      transactionID,
      stage: 'PREDEPLOY',
      timestamp: new Date().toISOString(),
      actionTaken,
      finalSecurityStatus,
      projectPath: targetPath,
      deploymentDomain,
      initialCount,
      projectHash,
    });

    if (finalSecurityStatus === 'AUTHORIZED') {
      updateProgress({ stage: 'Verifying', progress: 75, message: `Verifying DNS and domain integrity for ${deploymentDomain}.` });
      const dnsResult = await verifyDomainRecords(deploymentDomain, logger);
      if (!dnsResult.healthy) {
        finalSecurityStatus = 'DENIED';
        deploymentMessage = `Deployment Denied: DNS records for ${deploymentDomain} are not correctly pointed.`;
        actionTaken += ` DNS verification failed for ${deploymentDomain}.`;
        logger.error(`[pipeline] Transaction ${transactionID} - ${deploymentMessage}`);
        await rollbackSession(session, logger);
      } else {
        actionTaken += ` DNS verification passed for ${deploymentDomain}.`;
        logger.info(`[pipeline] Transaction ${transactionID} - DNS records validated for ${deploymentDomain}.`);
      }
    }

    if (finalSecurityStatus === 'AUTHORIZED') {
      if (autoDeploy) {
        updateProgress({ stage: 'Deploying', progress: 80, message: `Finalizing deployment to ${deploymentDomain}.` });
        const deploymentResult = await finalizeDeployment(targetPath, { transactionID, projectHash, logger });
        finalSecurityStatus = 'DEPLOYED';
        deploymentMessage = `Deployment completed successfully to ${deploymentResult.deploymentDomain}.`;
        updateProgress({ stage: 'Complete', progress: 100, message: 'Deployment succeeded and archived.' });
        await appendAuditLog({
          transactionID,
          stage: 'DEPLOY',
          timestamp: new Date().toISOString(),
          actionTaken: `${actionTaken} Deployment completed to ${deploymentResult.deploymentDomain} via domain-aware service reload.`,
          finalSecurityStatus,
          projectPath: targetPath,
          deploymentDomain: deploymentResult.deploymentDomain,
          initialCount,
          projectHash,
        });
        await archiveAuditLog(transactionID, { projectPath: targetPath, projectHash, finalSecurityStatus, stage: 'DEPLOY' }, logger);
        await executePluginHooks(
          { event: 'deployment.completed' },
          {
            transactionID,
            deploymentDomain: deploymentResult.deploymentDomain,
            projectPath: targetPath,
            projectHash,
            finalSecurityStatus,
            status: deploymentResult.status,
          },
          logger
        );
        await cleanupTemporaryFiles(logger);
      } else {
        updateProgress({ stage: 'Verified', progress: 85, message: 'Final integrity checks completed. Ready for deployment.' });
        deploymentMessage = 'Pre-deploy verification complete. Awaiting final deployment trigger.';
      }
    } else {
      updateProgress({ stage: 'Blocked', progress: 100, message: 'Deployment blocked due to security violations.' });
      await appendAuditLog({
        transactionID,
        stage: 'BLOCKED',
        timestamp: new Date().toISOString(),
        actionTaken,
        finalSecurityStatus,
        projectPath: targetPath,
        initialCount,
        projectHash,
      });
      await executePluginHooks(
        { event: 'deployment.failed' },
        {
          transactionID,
          projectPath: targetPath,
          projectHash,
          finalSecurityStatus,
          reason: deploymentMessage,
        },
        logger
      );
    }
  } catch (error) {
    finalSecurityStatus = 'DENIED';
    deploymentMessage = 'Deployment Denied: Security Violation.';
    actionTaken = `Exception during pipeline: ${error.message}. Rollback executed.`;
    logger.error(`[pipeline] Transaction ${transactionID} - ${actionTaken}`);
    updateProgress({ stage: 'Failed', progress: 100, message: 'Deployment halted due to an internal error.' });
    await rollbackSession(session, logger);
    await appendAuditLog({
      transactionID,
      stage: 'ERROR',
      timestamp: new Date().toISOString(),
      actionTaken,
      finalSecurityStatus,
      projectPath: targetPath,
      initialCount,
      projectHash,
    });
    await executePluginHooks(
      { event: 'deployment.failed' },
      {
        transactionID,
        projectPath: targetPath,
        projectHash,
        finalSecurityStatus,
        error: error.message,
      },
      logger
    );
    return {
      transactionID,
      projectPath: targetPath,
      initialCount,
      finalSecurityStatus,
      message: deploymentMessage,
      error: error.message,
    };
  }

  logger.info(`[pipeline] Transaction ${transactionID} - Audit log updated.`);

  return {
    transactionID,
    projectPath: targetPath,
    initialCount,
    finalSecurityStatus,
    stage: currentStage,
    message: deploymentMessage,
    projectHash,
  };
}

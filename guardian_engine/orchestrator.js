import { scanDirectory } from './scanner.js';
import { remediateFindings } from './remediator.js';
import { consumeCredits, getCreditBalance, shouldPromptTopUp } from './creditLedger.js';
import { getSystemHealthSnapshot, summarizeHealth } from './healthMonitor.js';

export async function runGuardianChecks(targetPath, options = {}) {
  const logger = options.logger ?? console;
  const findings = await scanDirectory(targetPath);
  const scanSummary = {
    scannedFiles: findings.length > 0 ? new Set(findings.map((finding) => finding.file)).size : 0,
    findings: findings.length,
  };

  const remediation = findings.length > 0
    ? await remediateFindings(findings, { logger, session: options.session ?? null })
    : { results: [], session: null };

  const creditResult = await consumeCredits({ amount: 3, reason: 'guardian-scan', owner: options.owner ?? 'default' });
  const balance = await getCreditBalance(options.owner ?? 'default');
  const health = await getSystemHealthSnapshot();

  return {
    status: findings.length > 0 ? 'reviewed' : 'clean',
    scanSummary,
    findings,
    remediateResult: remediation,
    creditBalance: balance,
    creditsConsumed: creditResult.transaction,
    health,
    healthSummary: summarizeHealth(health),
    topUpRequired: shouldPromptTopUp(balance.balance),
  };
}

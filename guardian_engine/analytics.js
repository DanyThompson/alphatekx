import fs from 'fs/promises';
import path from 'path';

export async function loadAuditLog(auditLogPath) {
  const resolvedPath = path.resolve(auditLogPath);
  try {
    const content = await fs.readFile(resolvedPath, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export function calculateSecurityReport(entries) {
  const totalDeploys = entries.length;
  const deniedDeploys = entries.filter((entry) => entry.finalSecurityStatus === 'DENIED').length;
  const remediationDeploys = entries.filter((entry) => /remediation initiated/i.test(entry.actionTaken)).length;
  const cleanDeploys = totalDeploys - remediationDeploys - deniedDeploys;

  const totalFinancialLossPrevented = (deniedDeploys + remediationDeploys) * 5000;

  const score = totalDeploys === 0
    ? 100
    : Math.round(100 * ((cleanDeploys + remediationDeploys * 0.5) / totalDeploys));

  return {
    totalDeploys,
    deniedDeploys,
    remediationDeploys,
    cleanDeploys,
    totalFinancialLossPrevented,
    securityScore: Math.max(0, Math.min(100, score)),
  };
}

export function formatReport(summary) {
  const rows = [
    ['Total Deploys Processed', summary.totalDeploys.toString()],
    ['Security Threats Blocked', summary.deniedDeploys.toString()],
    ['Total Financial Loss Prevented', `$${summary.totalFinancialLossPrevented.toLocaleString()}`],
    ['Current System Security Score', `${summary.securityScore}%`],
  ];

  const metricWidth = Math.max(...rows.map((row) => row[0].length)) + 2;
  const valueWidth = Math.max(...rows.map((row) => row[1].length)) + 2;
  const line = `+${'-'.repeat(metricWidth)}+${'-'.repeat(valueWidth)}+`;

  let output = '';
  output += '\nAlphaTekx Security Analytics Report\n';
  output += `${line}\n`;
  output += `| ${'Metric'.padEnd(metricWidth - 2)} | ${'Value'.padEnd(valueWidth - 2)} |\n`;
  output += `${line}\n`;
  rows.forEach(([metric, value]) => {
    output += `| ${metric.padEnd(metricWidth - 2)} | ${value.padEnd(valueWidth - 2)} |\n`;
  });
  output += `${line}\n`;

  output += '\nSystem Architecture Report:\n';
  output += 'AlphaTekx is a Domain-Integrated Deployment Engine managing deployments for *.alphatekx.name.ng.\n';
  output += 'Every successful deployment is validated for DNS integrity and live subdomain delivery.\n';
  output += '\nFoundational summary:\n';
  output += `AlphaTekx has saved this project $${summary.totalFinancialLossPrevented.toLocaleString()} in potential security costs.\n`;
  output += `Security Score is ${summary.securityScore}%, based on ${summary.cleanDeploys} clean deploy(s) and ${summary.remediationDeploys} remediated deploy(s).\n`;

  return output;
}

export async function generateSecurityReport(auditLogPath) {
  const entries = await loadAuditLog(auditLogPath);
  const summary = calculateSecurityReport(entries);
  const report = formatReport(summary);
  console.log(report);
  return summary;
}

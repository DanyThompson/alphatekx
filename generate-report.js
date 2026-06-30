import path from 'path';
import { generateSecurityReport } from './guardian_engine/analytics.js';

const ROOT = process.cwd();
const auditLogPath = path.join(ROOT, 'audit-log.json');

(async () => {
  try {
    await generateSecurityReport(auditLogPath);
  } catch (error) {
    console.error('Unable to generate security report:', error);
    process.exit(1);
  }
})();

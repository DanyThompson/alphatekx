import { runDeploymentPipeline } from './deployment_engine/pipeline.js';
import { scanDirectory } from './guardian_engine/scanner.js';

export async function handleUploadScan(req, res) {
  try {
    const { projectName, files } = req.body ?? {};
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files were provided.' });
    }

    const tempDir = `./tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fs = await import('fs/promises');
    const path = await import('path');
    await fs.mkdir(tempDir, { recursive: true });

    for (const file of files) {
      const relativePath = file.name ?? '';
      const resolved = path.join(tempDir, path.normalize(relativePath));
      await fs.mkdir(path.dirname(resolved), { recursive: true });
      await fs.writeFile(resolved, file.content ?? '', 'utf8');
    }

    const findings = await scanDirectory(tempDir);
    const deploymentDomain = findings.length === 0 ? `${(projectName ?? 'project').toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 24)}-alpha.alphatekx.name.ng` : '';

    return res.json({
      findings,
      deploymentDomain,
      scannedPath: tempDir,
      secure: findings.length === 0,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message ?? 'Upload scan failed.' });
  }
}

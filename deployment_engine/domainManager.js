export function generateSubdomain(projectName, transactionID) {
  const seed = String(projectName || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'alpha-project';

  const suffix = String(transactionID || '').slice(0, 8);
  return `${seed}-${suffix}`.slice(0, 60);
}

export function buildLiveDomain(projectName, transactionID) {
  return `${generateSubdomain(projectName, transactionID)}.alphatekx.name.ng`;
}

export function validateCustomDomain(domain) {
  const normalized = domain.trim().toLowerCase();
  const pattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

  return {
    valid: pattern.test(normalized),
    normalized,
    message: pattern.test(normalized) ? 'Custom domain format is valid.' : 'Enter a valid root domain such as app.example.com.',
  };
}

export function getDomainSetupInstructions(domain, targetDomain) {
  return {
    domain,
    targetDomain,
    records: [
      {
        type: 'CNAME',
        host: '@',
        value: targetDomain,
        purpose: 'Route the apex domain to the managed deployment endpoint.',
      },
      {
        type: 'CNAME',
        host: 'www',
        value: targetDomain,
        purpose: 'Mirror the managed deployment through the standard web host.',
      },
    ],
  };
}

export function provisionReverseProxySubdomain({ tenantId, deploymentDomain, projectName, transactionID }) {
  const tenant = String(tenantId || 'default').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 24) || 'default';
  const project = String(projectName || 'project').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 24) || 'project';

  return {
    status: 'provisioned',
    tenantId: tenant,
    deploymentDomain,
    proxyHost: 'edge.alphatekx.name.ng',
    upstream: '15.197.212.204',
    port: 443,
    route: `/${tenant}/${project}-${String(transactionID || '').slice(0, 8)}`,
    records: [
      {
        type: 'CNAME',
        host: tenant,
        value: deploymentDomain,
        purpose: 'Provision a tenant-isolated subdomain on the managed reverse proxy.',
      },
    ],
    activatedAt: new Date().toISOString(),
  };
}

export function simulateDomainActivation(domain) {
  return {
    status: 'active',
    domain,
    activatedAt: new Date().toISOString(),
  };
}

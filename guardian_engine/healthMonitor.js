export async function getSystemHealthSnapshot() {
  return {
    status: 'stable',
    services: {
      guardian: 'online',
      deployment: 'online',
      hub: 'online',
    },
    metrics: {
      latencyMs: 42,
      activeDeployments: 0,
      scanQueue: 0,
      uptimeSeconds: Math.round(process.uptime()),
    },
    alerts: [],
    updatedAt: new Date().toISOString(),
  };
}

export function summarizeHealth(snapshot) {
  const degraded = Object.values(snapshot.services).some((value) => value !== 'online');
  return {
    status: degraded ? 'degraded' : snapshot.status,
    summary: degraded ? 'One or more services require attention.' : 'All critical services are healthy.',
  };
}

import { EventEmitter } from 'events';
import { runDeploymentPipeline } from './pipeline.js';
import { appendTaskLog } from './taskLogStore.js';

export const deploymentEvents = new EventEmitter();

deploymentEvents.setMaxListeners(200);

export function enqueueDeployment({ projectPath, owner = 'default', metadata = {} }) {
  const deploymentId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const tenantId = metadata.tenantId || owner || 'default';

  const emit = (stage, message, extra = {}) => {
    const payload = { deploymentId, stage, message, timestamp: new Date().toISOString(), owner: tenantId, ...extra };
    deploymentEvents.emit('status', payload);
    deploymentEvents.emit(`status:${deploymentId}`, payload);
    void appendTaskLog({ deploymentId, stage, message, owner: tenantId, agent: extra.agent ?? 'AlphaTekx Deployment Engine', ...extra });
  };

  emit('Queued', 'Deployment queued for processing.', { progress: 0, agent: 'Queue', tenantId });

  setImmediate(async () => {
    try {
      emit('Scanning', 'Scanning project for secrets and build readiness.', { progress: 8, agent: 'Guardian Scanner', tenantId });
      const result = await runDeploymentPipeline(projectPath, {
        logger: console,
        autoDeploy: true,
        tenantId,
        onProgress: (payload) => {
          emit(payload.stage ?? 'Processing', payload.message ?? 'Processing deployment.', {
            progress: payload.progress ?? 0,
            agent: 'Deployment Engine',
            tenantId,
          });
        },
        metadata,
      });

      emit(result.finalSecurityStatus === 'DEPLOYED' ? 'Live' : 'Failed', result.deploymentMessage ?? 'Deployment finished.', {
        progress: 100,
        agent: 'Deployment Engine',
        deploymentUrl: result.deploymentDomain ? `https://${result.deploymentDomain}` : undefined,
        tenantId,
        result,
      });
    } catch (error) {
      emit('Failed', error?.message ?? 'Deployment failed.', {
        progress: 100,
        agent: 'Deployment Engine',
        error: true,
        tenantId,
      });
      console.error('[deploymentQueue] deployment failed', error);
    }
  });

  return { deploymentId, status: 'queued' };
}

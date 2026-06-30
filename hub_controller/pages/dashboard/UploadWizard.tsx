import { useMemo, useState } from 'react';

type UploadedFileMeta = {
  name: string;
  size: number;
  content: string;
};

const DEFAULT_API_KEY = import.meta.env.VITE_ALPHATEKX_API_KEY || 'alpha-tekx-enterprise-key';

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadWizard() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileMeta[]>([]);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'secure' | 'blocked'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Drop a project folder to start the Guardian scan.');
  const [deploymentDomain, setDeploymentDomain] = useState('');
  const [findings, setFindings] = useState<Array<{ type?: string; file?: string; hint?: string }>>([]);

  const projectLabel = useMemo(() => {
    if (uploadedFiles.length === 0) {
      return 'No project loaded';
    }

    const base = uploadedFiles[0]?.name.split('/')[0] ?? 'uploaded-project';
    return base.replace(/\.[^.]+$/, '') || 'uploaded-project';
  }, [uploadedFiles]);

  const handleFiles = async (incomingFiles: FileList | File[]) => {
    const list = Array.from(incomingFiles);
    if (list.length === 0) {
      return;
    }

    setScanState('scanning');
    setProgress(8);
    setMessage('Guardian is auditing the codebase for secrets and weaknesses...');
    setFindings([]);
    setDeploymentDomain('');

    try {
      const files: UploadedFileMeta[] = await Promise.all(
        list.map(async (file) => ({
          name: file.webkitRelativePath || file.name,
          size: file.size,
          content: await file.text(),
        }))
      );

      setUploadedFiles(files);

      const timer = window.setInterval(() => {
        setProgress((current) => {
          const next = current + 7;
          return next >= 92 ? 92 : next;
        });
      }, 260);

      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
      const response = await fetch(`${apiBaseUrl}/api/upload-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Alphatekx-Key': DEFAULT_API_KEY,
        },
        body: JSON.stringify({
          projectName: projectLabel,
          files,
        }),
      });

      window.clearInterval(timer);

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error ?? 'The Guardian was unable to complete the scan.');
      }

      setProgress(100);
      setDeploymentDomain(result.deploymentDomain ?? '');
      setFindings(result.findings ?? []);

      if ((result.findings ?? []).length > 0) {
        setScanState('blocked');
        setMessage('Guardian found issues that must be fixed before deploy.');
      } else {
        setScanState('secure');
        setMessage('Security checks passed. Your deployment is live-ready.');
      }
    } catch (error) {
      setScanState('blocked');
      setProgress(100);
      setMessage(error instanceof Error ? error.message : 'An unexpected scan issue occurred.');
    }
  };

  const statusTone = {
    idle: { border: '1px solid rgba(118,184,255,0.18)', glow: 'none' },
    scanning: { border: '1px solid rgba(118,184,255,0.34)', glow: '0 0 0 1px rgba(118,184,255,0.18), 0 0 24px rgba(118,184,255,0.16)' },
    secure: { border: '1px solid rgba(39, 255, 176, 0.4)', glow: '0 0 0 1px rgba(39,255,176,0.24), 0 0 28px rgba(39,255,176,0.22)' },
    blocked: { border: '1px solid rgba(255, 151, 70, 0.45)', glow: '0 0 0 1px rgba(255,151,70,0.22), 0 0 28px rgba(255,151,70,0.2)' },
  }[scanState];

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        void handleFiles(event.dataTransfer.files);
      }}
      style={{
        background: 'linear-gradient(180deg, rgba(14, 33, 55, 0.88), rgba(8, 18, 31, 0.75))',
        border: statusTone.border,
        borderRadius: '24px',
        padding: '1.5rem',
        boxShadow: statusTone.glow,
        marginTop: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.34em', color: '#7db9f3' }}>Upload wizard</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 700 }}>Deploy in one gesture</div>
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', padding: '0.72rem 1rem', border: '1px solid rgba(118,184,255,0.3)', borderRadius: '14px', cursor: 'pointer', background: 'rgba(9,18,33,0.5)' }}>
          <input
            type="file"
            multiple
            hidden
            onChange={(event) => {
              if (event.target.files) {
                void handleFiles(event.target.files);
              }
            }}
            webkitdirectory=""
          />
          <span style={{ color: '#f8fafc' }}>Choose project</span>
        </label>
      </div>

      <div style={{ border: `1px dashed ${isDragging ? '#6fb8ff' : 'rgba(118,184,255,0.35)'}`, borderRadius: '18px', padding: '1.4rem', background: isDragging ? 'rgba(18, 42, 69, 0.85)' : 'rgba(10, 21, 36, 0.45)', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.35em', color: '#7db9f3', marginBottom: '0.6rem' }}>Drop project here</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.35rem' }}>{projectLabel}</div>
        <div style={{ color: '#8fb6dd', marginBottom: '1rem' }}>
          {uploadedFiles.length > 0 ? `${uploadedFiles.length} files queued` : 'Drag a folder or upload a source tree to begin.'}
        </div>

        <div style={{ width: '100%', marginBottom: '1rem' }}>
          <div style={{ height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: scanState === 'secure' ? 'linear-gradient(135deg, #24d97f, #11bd83)' : scanState === 'blocked' ? 'linear-gradient(135deg, #ff9b5f, #ff7a2d)' : 'linear-gradient(135deg, #5dc7ff, #4c8cff)', transition: 'width 240ms ease' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '0.7rem' }}>
          <span style={{ fontSize: '0.92rem', color: scanState === 'secure' ? '#4dffb0' : scanState === 'blocked' ? '#ffb56d' : '#86b6e6' }}>{message}</span>
          {scanState === 'secure' ? <span style={{ fontSize: '1.05rem', color: '#4dffb0' }}>✓</span> : null}
          {scanState === 'blocked' ? <span style={{ fontSize: '1.05rem', color: '#ffb56d' }}>!</span> : null}
        </div>

        {scanState === 'secure' && deploymentDomain ? (
          <a
            href={`https://${deploymentDomain}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.9rem 1.2rem', background: 'linear-gradient(135deg, #1f8d5d, #32d17a)', borderRadius: '14px', textDecoration: 'none', color: '#03111d', fontWeight: 700 }}
          >
            Open Live Link
          </a>
        ) : null}
      </div>

      {findings.length > 0 ? (
        <div style={{ marginTop: '1rem', background: 'rgba(255, 145, 75, 0.09)', border: '1px solid rgba(255, 145, 75, 0.22)', borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#ffb36a', marginBottom: '0.6rem' }}>Guardian findings</div>
          {findings.map((finding, index) => (
            <div key={`${finding.file ?? 'file'}-${index}`} style={{ color: '#ffd6c2', marginBottom: '0.45rem' }}>
              {finding.file ?? 'unknown'} — {finding.hint ?? finding.type ?? 'security concern'}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

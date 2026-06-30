import UploadWizard from './UploadWizard';

export default function OverviewPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '2.4rem', background: 'radial-gradient(circle at top, #123d6d, #050d1a 42%, #03070d 100%)', color: '#f8fafc', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.42em', textTransform: 'uppercase', color: '#7bc6ff' }}>AI hub</div>
            <h1 style={{ fontSize: '3rem', margin: '0.2rem 0 0', fontWeight: 700, letterSpacing: '-0.04em' }}>Genesis Control Center</h1>
          </div>
          <button style={{ border: '1px solid rgba(118,184,255,0.35)', background: 'linear-gradient(180deg, rgba(17,45,74,0.78), rgba(8,20,35,0.6))', padding: '0.9rem 1.2rem', borderRadius: '14px', color: '#f8fafc', boxShadow: '0 0 22px rgba(91, 169, 255, 0.18)' }}>
            Top up credits
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.4rem' }}>
          {[
            { title: 'Security Score', value: '98%', subtitle: 'Protected by Guardian Engine' },
            { title: 'Active Deployments', value: '3', subtitle: 'Zero downtime SLA' },
            { title: 'Available Credits', value: '42', subtitle: 'Top-up alerts enabled' },
          ].map((card) => (
            <div key={card.title} style={{ background: 'linear-gradient(180deg, rgba(24,51,84,0.88), rgba(8,19,34,0.7))', border: '1px solid rgba(118,184,255,0.18)', borderRadius: '18px', padding: '1.35rem' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#82a9d4' }}>{card.title}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, margin: '0.45rem 0' }}>{card.value}</div>
              <div style={{ fontSize: '0.92rem', color: '#8eb7e8' }}>{card.subtitle}</div>
            </div>
          ))}
        </div>

        <UploadWizard />

        <div style={{ background: 'linear-gradient(180deg, rgba(16,35,58,0.88), rgba(7,17,31,0.72))', border: '1px solid rgba(118,184,255,0.2)', borderRadius: '24px', padding: '1.5rem', marginTop: '1.5rem' }}>
          <div style={{ fontSize: '1.08rem', fontWeight: 600, marginBottom: '0.7rem' }}>Operational flow</div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '1rem', padding: '0.8rem 0', borderBottom: '1px solid rgba(118,184,255,0.12)' }}>
              <span style={{ color: '#82a9d4' }}>Guardian Scan</span>
              <span>Automated vulnerability detection, secret sanitization, and auto-remediation.</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '1rem', padding: '0.8rem 0', borderBottom: '1px solid rgba(118,184,255,0.12)' }}>
              <span style={{ color: '#82a9d4' }}>Deployment</span>
              <span>One-click release with live subdomain assignment and guided custom domain setup.</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '1rem', padding: '0.8rem 0' }}>
              <span style={{ color: '#82a9d4' }}>AI Agent</span>
              <span>Natural language updates, additive logic changes, and proactive health insights.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

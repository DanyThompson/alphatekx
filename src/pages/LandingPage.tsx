import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, startGoogleSignIn } from '../../hub_controller/auth';

export default function LandingPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    void isAuthenticated().then((value) => {
      if (active) {
        setChecking(false);
        if (value) {
          navigate('/dashboard/overview', { replace: true });
        }
      }
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleDeployNow = () => {
    startGoogleSignIn();
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050d1a] text-sm tracking-[0.35em] text-[#8b949e] uppercase">
        Loading secure workspace…
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050d1a] text-[#f5f8ff]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-14rem] h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[#5ba9ff] opacity-10 blur-[120px]" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-[#7be9a8] opacity-8 blur-[120px]" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.42em] text-[#8b949e] backdrop-blur-xl">
          <span className="h-2.5 w-2.5 rounded-full bg-[#5ba9ff]" />
          AlphaTekx
        </div>

        <h1 className="max-w-4xl text-[clamp(3rem,8vw,5.4rem)] font-semibold leading-[1.02] tracking-[-0.07em] text-white">
          Deploy your site in one click.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-7 text-[#94a3b8] md:text-lg">
          Secure hosting, Guardian scanning, and a live subdomain — with zero setup.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            onClick={handleDeployNow}
            className="inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#5ba9ff_0%,#7be9a8_100%)] px-8 py-4 text-base font-semibold text-[#04101a] shadow-[0_0_32px_rgba(91,169,255,0.3)] transition hover:scale-[1.01] active:scale-[0.98]"
          >
            Deploy Now
          </button>
        </div>

        <section className="mt-16 w-full max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_40px_120px_rgba(16,24,40,0.45)] backdrop-blur-2xl">
          <div className="rounded-[1.5rem] border border-white/10 bg-[#081120] p-4">
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a1527] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff6b6b]" />
                <span className="h-3 w-3 rounded-full bg-[#ffb84d]" />
                <span className="h-3 w-3 rounded-full bg-[#62d98b]" />
              </div>
              <span className="text-[0.64rem] font-semibold uppercase tracking-[0.3em] text-[#8b949e]">
                one-click deploy
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#050d1a] px-5 py-5 text-left font-mono text-sm text-[#8b949e]">
              <div className="mb-2 text-[#7be9a8]">$ deploy ./portfolio</div>
              <div className="mb-2">→ scanning project structure…</div>
              <div className="mb-2 text-[#ffb84d]">⚠ secret scan detected in config.js</div>
              <div className="mb-2">→ auto-remediating with environment variables</div>
              <div className="mb-2">→ publishing to a secure edge network</div>
              <div className="text-[#5ba9ff]">→ live at yourname.alphatekx.name.ng</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowRight, Globe, Lock, Shield, Zap } from 'lucide-react';
import { isAuthenticated, startGoogleSignIn } from '../../auth';

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let active = true;

    void isAuthenticated().then((value) => {
      if (active) {
        setLoggedIn(value);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (loggedIn) {
    return <Navigate to="/dashboard/overview" replace />;
  }

  const handleDeployNow = () => {
    startGoogleSignIn();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#5ba9ff_0%,transparent_18%),radial-gradient(circle_at_bottom,#7be9a8_0%,transparent_16%),#050d1a] text-[#f5f8ff]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-16rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#5ba9ff]/20 blur-[120px]" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-[24rem] w-[24rem] rounded-full bg-[#7be9a8]/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-16 pt-6 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5ba9ff] to-[#7be9a8] text-[#04101a] shadow-[0_0_24px_rgba(91,169,255,0.25)]">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-sm font-black uppercase tracking-[0.42em] text-white/90">ALPHATEKX</span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-[#8b949e] lg:flex">
            <span>Guardian Scan</span>
            <span>Fast Deploy</span>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.38em] text-[#8b949e] backdrop-blur-2xl">
            <Zap className="h-3.5 w-3.5 text-[#5ba9ff]" />
            guardian-first deploys
          </div>

          <h1 className="max-w-4xl text-[clamp(3.2rem,8vw,5.8rem)] font-semibold leading-[0.98] tracking-[-0.07em] text-white">
            Secure sites.
            <span className="block bg-gradient-to-r from-[#5ba9ff] via-[#7be9a8] to-[#a78bfa] bg-clip-text text-transparent">
              Live in minutes.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-[#94a3b8] md:text-lg">
            Upload a project, let Guardian scan and remediate it, and ship to a branded subdomain with no server setup.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={handleDeployNow}
              className="inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#5ba9ff_0%,#7be9a8_100%)] px-8 py-4 text-base font-semibold text-[#04101a] shadow-[0_0_32px_rgba(91,169,255,0.3)] transition hover:scale-[1.01] active:scale-[0.98]"
            >
              Deploy Now
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-12 grid w-full max-w-4xl gap-4 md:grid-cols-3">
            {[
              { icon: Lock, title: 'Guardian scan', detail: 'Secret detection and auto-remediation' },
              { icon: Globe, title: 'Branded domain', detail: 'yourname.alphatekx.name.ng' },
              { icon: Shield, title: 'Secure deploy', detail: 'Live with audit trail and rollback' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-5 text-left backdrop-blur-2xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-[#5ba9ff]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-base font-semibold text-white">{item.title}</div>
                  <div className="mt-2 text-sm leading-6 text-[#8b949e]">{item.detail}</div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

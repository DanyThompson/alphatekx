import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ArrowRight, Check, Clock3, Cpu, Database, Globe, Lock, Rocket, Shield, Sparkles, Star, Zap } from 'lucide-react';
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

  const featureCards = [
    {
      icon: Zap,
      title: '1-second deploys',
      detail: 'Push a project live with enterprise-grade routing and instant global availability.',
    },
    {
      icon: Shield,
      title: 'Guardian security',
      detail: 'AI-assisted scanning, secret detection, and automated remediations before launch.',
    },
    {
      icon: Database,
      title: 'Integrated data',
      detail: 'Connect secure storage, auth, and event flows in one production-ready environment.',
    },
    {
      icon: Globe,
      title: 'Branded subdomains',
      detail: 'Every deployment lands on yourname.alphatekx.name.ng with zero DNS friction.',
    },
    {
      icon: Lock,
      title: 'Audit trails',
      detail: 'Track releases, scans, and access activity with complete deployment visibility.',
    },
    {
      icon: Cpu,
      title: 'AI-native workflow',
      detail: 'Build, test, and publish your app with automation built around modern generation tools.',
    },
  ];

  const trustSignals = ['Trusted by product teams', '99.99% infrastructure uptime', 'SOC-ready audit controls'];

  const pricingTiers = [
    {
      name: 'Starter',
      price: '₦2,500',
      description: 'For focused founders and solo builders.',
      badge: null,
      features: ['2 live deployments', 'Guardian security scan', 'AI-assisted remediation', 'yourname.alphatekx.name.ng', 'Starter analytics'],
      cta: 'Choose Starter',
    },
    {
      name: 'Engine Boost',
      price: '₦10,000',
      description: 'The sweet spot for steady product delivery.',
      badge: 'Most Popular',
      features: ['3,000 credits', 'Unlimited deploy previews', 'Advanced dashboard analytics', 'Priority rollback support', 'Custom team permissions'],
      cta: 'Start Engine Boost',
    },
    {
      name: 'Enterprise Core',
      price: '₦50,000',
      description: 'For teams shipping at scale with high-traffic workloads.',
      badge: null,
      features: ['20,000 credits', 'Dedicated audit exports', 'High-traffic SLAs', 'Advanced workflow automations', 'Dedicated success engineer'],
      cta: 'Talk to Sales',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#5ba9ff_0%,transparent_18%),radial-gradient(circle_at_bottom,#7be9a8_0%,transparent_16%),#050d1a] text-[#f5f8ff]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-16rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[#5ba9ff]/20 blur-[140px]" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-[24rem] w-[24rem] rounded-full bg-[#7be9a8]/15 blur-[120px]" />
        <div className="absolute left-[-6rem] top-1/3 h-[18rem] w-[18rem] rounded-full bg-[#a78bfa]/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 lg:px-10">
        <header className="sticky top-0 z-20 rounded-[1.75rem] border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5ba9ff] to-[#7be9a8] text-[#04101a] shadow-[0_0_24px_rgba(91,169,255,0.25)]">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.42em] text-white/90">ALPHATEKX</span>
            </div>
            <nav className="hidden items-center gap-8 text-sm text-[#8b949e] lg:flex">
              <span className="transition hover:text-white">Guardian Scan</span>
              <span className="transition hover:text-white">Deploy</span>
              <span className="transition hover:text-white">Pricing</span>
            </nav>
            <button
              onClick={handleDeployNow}
              className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10 lg:inline-flex"
            >
              Sign In
            </button>
          </div>
        </header>

        <main className="pt-14">
          <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] px-6 py-10 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_100px_rgba(9,15,26,0.55)] backdrop-blur-3xl lg:px-12 lg:py-14">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(91,169,255,0.18),transparent_35%,rgba(123,233,168,0.12),transparent_70%)]" />

            <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="text-left">
                <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.38em] text-[#8b949e] backdrop-blur-2xl">
                  <Sparkles className="h-3.5 w-3.5 text-[#5ba9ff]" />
                  Intelligent deployment foundation
                </div>

                <h1 className="max-w-3xl text-[clamp(3.2rem,7vw,5.8rem)] font-semibold leading-[0.96] tracking-[-0.08em] text-white">
                  Deploy world-class sites.
                  <span className="block bg-gradient-to-r from-[#5ba9ff] via-[#8be9c8] to-[#a78bfa] bg-clip-text text-transparent">
                    Live in minutes.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-[#94a3b8] md:text-lg">
                  AlphaTekx Starter: The Intelligent Deployment Foundation. Designed for the focused developer, our Starter tier provides a premium, high-performance environment for your most important projects. Deploy up to 2 high-performance sites and experience seamless, automated hosting built for the modern, AI-enabled web.
                </p>

                <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
                  <button
                    onClick={handleDeployNow}
                    className="inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#5ba9ff_0%,#7be9a8_100%)] px-8 py-4 text-base font-semibold text-[#04101a] shadow-[0_0_32px_rgba(91,169,255,0.3)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(91,169,255,0.45)]"
                  >
                    Deploy Now
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 text-base font-semibold text-white backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.06]">
                    <Rocket className="h-5 w-5 text-[#7be9a8]" />
                    Explore platform
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-[#8b949e]">
                  {trustSignals.map((signal) => (
                    <span key={signal} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 backdrop-blur-2xl">
                      {signal}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,#5ba9ff,transparent_35%),radial-gradient(circle_at_bottom,#7be9a8,transparent_35%)] opacity-40 blur-3xl" />
                <div className="relative rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,25,40,0.72),rgba(6,12,22,0.54))] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                  <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
                    <div className="flex items-center justify-between rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3">
                      <span className="text-sm font-semibold text-white/80">Deployment Console</span>
                      <span className="rounded-full bg-[#7be9a8]/20 px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.36em] text-[#7be9a8]">
                        Live
                      </span>
                    </div>
                    <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,45,72,0.8),rgba(8,16,28,0.55))] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5ba9ff] to-[#7be9a8] text-[#04101a]">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">Project Ready</div>
                          <div className="text-xs text-[#8b949e]">Guardian scan complete</div>
                        </div>
                      </div>
                      <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-3">
                        <div className="text-[0.58rem] font-semibold uppercase tracking-[0.35em] text-[#8b949e]">Live URL</div>
                        <div className="mt-2 text-base font-semibold text-white">yourname.alphatekx.name.ng</div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {['1s deploy', 'Auto fix', 'SSL'].map((tag) => (
                          <div key={tag} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-xs font-semibold text-white/75">
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-4 md:grid-cols-3">
            {featureCards.slice(0, 3).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-white/20"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-[#5ba9ff]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-4 text-lg font-semibold text-white">{feature.title}</div>
                  <div className="mt-2 text-sm leading-6 text-[#8b949e]">{feature.detail}</div>
                </div>
              );
            })}
          </section>

          <section id="pricing" className="mt-20 px-2">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-[#8b949e]">Pricing</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">Choose your launch tier</h2>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-[2.5rem] border p-7 backdrop-blur-2xl transition duration-300 hover:-translate-y-2 ${tier.badge ? 'border-[#5ba9ff]/60 bg-[linear-gradient(180deg,rgba(27,52,87,0.7),rgba(8,16,28,0.55))] shadow-[0_0_0_1px_rgba(91,169,255,0.15),0_20px_60px_rgba(91,169,255,0.16)]' : 'border-white/10 bg-white/[0.03]'}`}
                >
                  {tier.badge ? (
                    <div className="mb-4 inline-flex rounded-full border border-[#5ba9ff]/30 bg-[#5ba9ff]/10 px-3 py-1 text-[0.58rem] font-bold uppercase tracking-[0.4em] text-[#5ba9ff]">
                      {tier.badge}
                    </div>
                  ) : null}
                  <div className="text-2xl font-semibold text-white">{tier.name}</div>
                  <div className="mt-3 text-sm leading-6 text-[#8b949e]">{tier.description}</div>
                  <div className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-white">{tier.price}</div>
                  <div className="mt-2 text-sm text-[#8b949e]">per month</div>
                  <ul className="mt-8 space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-white/80">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7be9a8]/15 text-[#7be9a8]">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`mt-8 w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${tier.badge ? 'bg-[linear-gradient(135deg,#5ba9ff_0%,#7be9a8_100%)] text-[#04101a]' : 'border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]'}`}>
                    {tier.cta}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center text-sm text-[#8b949e]">No contracts. Cancel anytime. Full refund in 14 days.</div>
          </section>

          <section className="mt-20 rounded-[2.8rem] border border-white/10 bg-white/[0.03] px-6 py-8 backdrop-blur-2xl">
            <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
              <div>
                <div className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-[#8b949e]">How it works</div>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">Ship your product with zero server overhead</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Clock3, title: '1', detail: 'Upload your code' },
                  { icon: Shield, title: '2', detail: 'Guardian scans' },
                  { icon: Rocket, title: '3', detail: 'Deploy to yourname.alphatekx.name.ng' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-[2rem] border border-white/10 bg-black/10 p-4 text-left">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-[#5ba9ff]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="mt-4 text-3xl font-semibold text-white">{item.title}</div>
                      <div className="mt-2 text-sm text-[#8b949e]">{item.detail}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-20 rounded-[2.8rem] border border-white/10 bg-white/[0.03] px-6 py-8 backdrop-blur-2xl">
            <div className="grid gap-6 lg:grid-cols-3">
              {[
                { name: 'Ava', role: 'Founder, Northstar', quote: 'We launched our product in a day and every deploy now lands on a polished subdomain without the usual ops overhead.' },
                { name: 'Mikel', role: 'CTO, LedgerFi', quote: 'The Guardian security layer feels like an extra engineer on our team. It catches the things our team misses.' },
                { name: 'Dina', role: 'Design Lead, Mimic', quote: 'The platform turned our internal site into a customer-ready product in hours, and the subdomain experience looks first-class.' },
              ].map((testimonial) => (
                <div key={testimonial.name} className="rounded-[2.2rem] border border-white/10 bg-black/10 p-6">
                  <div className="flex items-center gap-1 text-[#5ba9ff]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={`${testimonial.name}-${index}`} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <div className="mt-4 text-sm leading-7 text-white/75">“{testimonial.quote}”</div>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5ba9ff] to-[#7be9a8] text-[#04101a] font-bold">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{testimonial.name}</div>
                      <div className="text-xs text-[#8b949e]">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20 rounded-[3rem] border border-white/10 bg-[linear-gradient(135deg,rgba(91,169,255,0.18),rgba(20,35,58,0.45),rgba(123,233,168,0.18))] px-8 py-10 text-center backdrop-blur-2xl">
            <div className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-[#8b949e]">Ready to launch</div>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">The infrastructure for your next billion-dollar product.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#94a3b8]">
              Sign in, deploy your project, and let AlphaTekx secure the launch with branded subdomains, live auditing, and fast global hosting.
            </p>
            <button
              onClick={handleDeployNow}
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#5ba9ff_0%,#7be9a8_100%)] px-8 py-4 text-base font-semibold text-[#04101a] shadow-[0_0_32px_rgba(91,169,255,0.3)] transition hover:-translate-y-0.5"
            >
              Start your deployment
              <ArrowRight className="h-5 w-5" />
            </button>
          </section>
        </main>

        <footer className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/[0.02] px-6 py-4 text-sm text-[#8b949e] backdrop-blur-2xl md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5ba9ff] to-[#7be9a8] text-[#04101a]">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-semibold uppercase tracking-[0.32em] text-white/80">ALPHATEKX</span>
          </div>
          <div>Secure deployments • yourname.alphatekx.name.ng</div>
        </footer>
      </div>
    </div>
  );
}

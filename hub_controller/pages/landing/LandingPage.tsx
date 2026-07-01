import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Check,
  CirclePlay,
  Clock3,
  Cpu,
  Globe,
  Layers3,
  Lock,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  TerminalSquare,
  Zap,
} from 'lucide-react';
import { isAuthenticated, startGoogleSignIn } from '../../auth';

const steps = [
  {
    number: '01',
    title: 'Pick your web address',
    description: 'Choose a name like "my-portfolio" and it becomes yourname.alphatekx.name.ng — your permanent address on the internet.',
  },
  {
    number: '02',
    title: 'Drop your website files',
    description: 'Upload a folder, paste a GitHub URL, or drag a ZIP file. Works with plain HTML, React builds, Vue apps — anything with an index.html.',
  },
  {
    number: '03',
    title: 'Guardian auto-secures it',
    description: 'AlphaTekx scans every file for exposed API keys, passwords, and secrets. Found issues are fixed automatically before the site goes live.',
  },
  {
    number: '04',
    title: 'Your site is live',
    description: 'In under 60 seconds your website is publicly accessible at yourname.alphatekx.name.ng — shareable, permanent, and secure.',
  },
];

const featureCards = [
  {
    title: 'Zero-Config Deployment',
    description: 'Drop a folder, paste a GitHub URL, or upload a ZIP. No build commands, no config files — AlphaTekx handles everything for you.',
    icon: ArrowUpRight,
  },
  {
    title: 'Guardian Security',
    description: 'Every file is scanned for secrets, unsafe dependencies, and exposed keys before deployment. Vulnerabilities are auto-remediated.',
    icon: ShieldCheck,
  },
  {
    title: 'Sub-60s Live URL',
    description: 'Upload, validate, and publish in a single flow. Your site reaches the world before the next coffee break.',
    icon: Zap,
  },
  {
    title: 'yourname.alphatekx.name.ng',
    description: 'Every site gets a permanent branded subdomain with global DNS and instant shareability.',
    icon: Globe,
  },
  {
    title: 'Version History',
    description: 'Keep every deployment snapshot. Roll back instantly when a launch needs to be measured, tested, or reversed.',
    icon: Layers3,
  },
  {
    title: 'Any Stack',
    description: 'Plain HTML, React, Vue, Angular, Svelte — if it has an index.html, it deploys reliably and beautifully.',
    icon: Cpu,
  },
];

const comparisonRows = [
  'Zero-config deploy',
  'Sub-60s to live URL',
  'Automated secret scanning',
  'Auto-fix vulnerabilities',
  'No CLI required',
  'Custom subdomain on signup',
  'Free starter credits',
  'Full audit trail',
];

const testimonials = [
  {
    quote:
      'I dropped my React build folder and had a live URL in 38 seconds. The Guardian scan caught a leaked Stripe API key I had completely forgotten about. Would have been a disaster without it.',
    name: 'Emeka Okafor',
    role: 'Frontend Engineer · Paystack',
  },
  {
    quote:
      'We evaluated Vercel, Netlify, and AlphaTekx. AlphaTekx is the only one that combines instant deployment with automated security scanning in a single zero-config workflow. Not even close.',
    name: 'Aisha Mohammed',
    role: 'CTO · BuildFast Labs',
  },
  {
    quote:
      '40 students deploy projects every week. AlphaTekx removed the "it works on my machine" problem entirely. The zero-configuration experience is exactly what learners need.',
    name: 'Chidi Nwachukwu',
    role: 'Bootcamp Director · AltSchool Africa',
  },
];

const pricingTiers = [
  {
    name: 'STARTER',
    price: '₦500',
    unit: '/ top-up',
    description: 'Includes 10 deployments',
    features: ['10 deployments', 'Guardian security scan', 'yourname.alphatekx.name.ng', 'Audit log', '24h support'],
    popular: false,
  },
  {
    name: 'PRO',
    price: '₦2,000',
    unit: '/ top-up',
    description: 'Includes 50 deployments',
    features: ['50 deployments', 'Everything in Starter', 'Version history & rollback', 'Compliance rules', 'Priority support'],
    popular: true,
  },
  {
    name: 'ENTERPRISE',
    price: '₦5,000',
    unit: '/ top-up',
    description: 'Includes 150 deployments',
    features: ['150 deployments', 'Everything in Pro', 'Team collaboration', 'Runtime protection', 'Dedicated support'],
    popular: false,
  },
];

const stackLogos = ['HTML', 'CSS', 'JS', 'React', 'Next.js', 'Stripe', 'Supabase', 'Tailwind', 'TypeScript', 'GitHub', 'Vite'];

const trustMetrics = [
  { label: '20,000+ Sites Deployed', value: '20,000+' },
  { label: '5,000+ Developers', value: '5,000+' },
  { label: '99.9% Platform Uptime', value: '99.9%' },
  { label: '< 60s Avg Deploy Time', value: '< 60s' },
];

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
    <div className="relative overflow-hidden bg-[linear-gradient(180deg,#0a1428_0%,#10213d_28%,#1a2947_60%,#1e2a4a_100%)] text-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[8rem] h-72 w-72 rounded-full bg-cyan-300/18 blur-[140px]" />
        <div className="absolute right-[-6rem] top-[14rem] h-80 w-80 rounded-full bg-sky-400/10 blur-[150px]" />
        <div className="absolute bottom-[-10rem] left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-blue-200/10 blur-[160px]" />
        <div className="absolute left-1/3 top-1/4 h-32 w-32 rounded-full border border-white/10 bg-white/[0.04] blur-[2px]" />
        <div className="absolute right-1/4 top-[30%] h-20 w-20 rounded-full border border-sky-200/20 bg-sky-100/[0.05] blur-[1px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 lg:px-10">
        <header className="sticky top-3 z-20 mx-auto max-w-6xl rounded-full border border-white/15 bg-white/8 px-5 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_10px_60px_rgba(10,20,40,0.35)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#9ad8ff_0%,#69a8ff_45%,#94f3d5_100%)] text-[#081827] shadow-[0_0_30px_rgba(123,208,255,0.2)]">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-white/90">ALPHATEKX</span>
            </div>

            <nav className="hidden items-center gap-8 text-sm text-slate-300/85 lg:flex">
              <a href="#how-it-works" className="transition hover:text-white">
                How it works
              </a>
              <a href="#features" className="transition hover:text-white">
                Features
              </a>
              <a href="#security" className="transition hover:text-white">
                Security
              </a>
              <a href="#pricing" className="transition hover:text-white">
                Pricing
              </a>
              <a href="#testimonials" className="transition hover:text-white">
                Wall of Love
              </a>
            </nav>

            <button
              onClick={handleDeployNow}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 py-2 text-sm font-semibold text-white/90 transition hover:border-white/25 hover:bg-white/[0.09]"
            >
              Sign in
            </button>
          </div>
        </header>

        <section className="relative pt-20 lg:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-9 inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.38em] text-slate-300/80 backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <Zap className="h-3.5 w-3.5 text-sky-200" />
              20,000+ launches shipped
            </div>

            <h1 className="text-[clamp(3.8rem,8.4vw,6.8rem)] font-semibold leading-[0.92] tracking-[-0.09em] text-white/95">
              Launch boldly.
              <span className="block bg-[linear-gradient(135deg,#edf8ff_0%,#8fd4ff_40%,#97d4ff_55%,#cff8f0_100%)] bg-clip-text text-transparent">
                Deploy beautifully.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-300/74 md:text-xl">
              Drop your project, let Guardian scan and secure it, then publish it to a premium yourname.alphatekx.name.ng URL in under a minute.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={handleDeployNow}
                className="inline-flex items-center gap-3 rounded-full border border-sky-200/30 bg-[linear-gradient(135deg,rgba(142,215,255,0.9),rgba(95,155,255,0.65))] px-8 py-4 text-base font-semibold text-[#081827] shadow-[0_0_35px_rgba(121,194,255,0.28)] transition hover:scale-[1.01] active:scale-[0.98]"
              >
                Deploy My Website
                <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-base font-semibold text-white/90 backdrop-blur-xl transition hover:border-white/25 hover:bg-white/[0.07]"
              >
                <CirclePlay className="h-5 w-5 text-sky-200" />
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300/72">
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2">20 starter credits</span>
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2">No credit card</span>
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2">1-minute launch</span>
            </div>
          </div>

          <div className="animate-float mx-auto mt-14 max-w-5xl rounded-[2.75rem] border border-white/10 bg-white/[0.07] p-4 shadow-[0_24px_120px_rgba(6,13,25,0.45)] backdrop-blur-2xl">
            <div className="rounded-[2.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,24,42,0.92),rgba(17,31,51,0.72))] p-5">
              <div className="flex items-center justify-between border-b border-white/10 px-3 pb-4 text-[0.58rem] font-semibold uppercase tracking-[0.42em] text-[#8b949e]">
                <span>AlphaTekx Deployment Pipeline</span>
                <span>ready to publish</span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[1.75rem] border border-white/10 bg-[#0b1523] p-4">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[#8b949e]">deploy logs</span>
                    <span className="rounded-full bg-[#7be9a8]/15 px-3 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.32em] text-[#7be9a8]">
                      secure
                    </span>
                  </div>
                  <div className="mt-5 space-y-3 font-mono text-sm leading-7 text-[#94a3b8]">
                    {['npm run build', 'guardian scan --auto-fix', 'alpha deploy --region global', 'status: deployed to yourname.alphatekx.name.ng'].map((line, index) => (
                      <div key={line} className="flex items-start gap-3">
                        <span className="text-[#5ba9ff]">{index + 1}</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="rounded-[1.75rem] border border-white/10 bg-[#0b1523] p-5">
                    <div className="text-[0.58rem] font-semibold uppercase tracking-[0.35em] text-[#8b949e]">status</div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="truncate text-sm text-white">yourname.alphatekx.name.ng</span>
                      <BadgeCheck className="h-5 w-5 text-[#5ba9ff]" />
                    </div>
                  </div>
                  <div className="rounded-[1.75rem] border border-white/10 bg-[#0b1523] p-5">
                    <div className="text-[0.58rem] font-semibold uppercase tracking-[0.35em] text-[#8b949e]">security score</div>
                    <div className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-white">98/100</div>
                    <div className="mt-2 h-2 rounded-full bg-white/[0.08]">
                      <div className="h-2 w-[98%] rounded-full bg-[linear-gradient(135deg,#5ba9ff,#7be9a8)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-20">
          <div className="grid gap-5 md:grid-cols-4">
            {trustMetrics.map((stat) => (
              <div key={stat.label} className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-7 text-center backdrop-blur-2xl">
                <div className="text-3xl font-semibold tracking-[-0.08em] text-white">{stat.value}</div>
                <div className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-[#8b949e]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="pt-16">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.025] px-6 py-8 backdrop-blur-2xl">
            <div className="text-center text-[0.58rem] font-semibold uppercase tracking-[0.42em] text-[#8b949e]">Works with every stack</div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {stackLogos.map((logo) => (
                <div key={logo} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="pt-28">
          <div className="max-w-3xl">
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-[#8b949e]">How it works</div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-5xl">
              From files to live website in 4 steps
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
                <div className="text-5xl font-semibold tracking-[-0.08em] text-white/20">{step.number}</div>
                <div className="mt-6 text-xl font-semibold text-white">{step.title}</div>
                <div className="mt-3 text-sm leading-6 text-[#8b949e]">{step.description}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="pt-28">
          <div className="text-center">
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-[#8b949e]">Platform features</div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-5xl">
              Everything you need, nothing you don&apos;t
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <article key={feature.title} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl transition hover:-translate-y-1 hover:border-white/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5ba9ff]/20 to-[#7be9a8]/20 text-[#5ba9ff]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#8b949e]">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="security" className="pt-28">
          <div className="rounded-[3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,28,44,0.9),rgba(10,17,28,0.74))] p-8 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-[#8b949e]">Guardian Security</div>
                <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-5xl">
                  Your site is secure before it goes live
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-7 text-[#94a3b8]">
                  Most developers accidentally leak secrets in their code. AlphaTekx catches and fixes them automatically — no embarrassing data breaches, no security audits.
                </p>

                <div className="mt-8 space-y-4">
                  {['Exposed secret detection', 'Instant auto-fix', '24/7 runtime protection', 'Full audit trail'].map((item) => (
                    <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7be9a8]/15 text-[#7be9a8]">
                        <Check className="h-5 w-5" />
                      </div>
                      <span className="text-base text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2.5rem] border border-white/10 bg-[#081120] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between px-3 text-[0.52rem] font-semibold uppercase tracking-[0.4em] text-[#8b949e]">
                  <span>guardian-scan</span>
                  <span>app.js</span>
                </div>
                <div className="mt-4 rounded-[2rem] border border-white/10 bg-[#081120] p-5 font-mono text-sm leading-6 text-[#8b949e]">
                  <div className="text-[#7be9a8]">1</div>
                  <div>{'const key = "sk_live_xYz789abcDEF";'}</div>
                  <div>{'const openai = new OpenAI({'}</div>
                  <div>{'  apiKey: "sk-abc123def456",'}</div>
                  <div>{'});'}</div>
                  <div>{'app.listen(3000);'}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-28">
          <div className="text-center">
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-[#8b949e]">Why AlphaTekx</div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-5xl">
              The only platform that does it all
            </h2>
          </div>

          <div className="mt-12 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04]">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead>
                <tr>
                  <th className="px-8 py-6 text-base font-semibold text-white/75">Platform</th>
                  <th className="px-8 py-6 text-base font-semibold text-white/75">AlphaTekx</th>
                  <th className="px-8 py-6 text-base font-semibold text-white/75">Vercel</th>
                  <th className="px-8 py-6 text-base font-semibold text-white/75">Netlify</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {comparisonRows.map((row) => (
                  <tr key={row}>
                    <td className="px-8 py-5 text-sm text-[#8b949e]">{row}</td>
                    <td className="px-8 py-5 text-sm text-[#7be9a8]">✓</td>
                    <td className="px-8 py-5 text-sm text-[#8b949e]">✕</td>
                    <td className="px-8 py-5 text-sm text-[#8b949e]">✕</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="testimonials" className="pt-28">
          <div className="text-center">
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-[#8b949e]">Wall of Love</div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-5xl">
              Developers who shipped faster
            </h2>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="rounded-[2.2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
                <div className="flex items-center gap-1 text-[#5ba9ff]">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-5 text-base leading-7 text-[#e8edf5]">“{testimonial.quote}”</blockquote>
                <div className="mt-8">
                  <div className="text-base font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-[#8b949e]">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="pt-28">
          <div className="text-center">
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-[#8b949e]">Pricing</div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#94a3b8]">
              Start free with 20 credits on sign-up. No credit card required.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-[2.5rem] border p-8 ${tier.popular ? 'border-[#5ba9ff] bg-[linear-gradient(180deg,rgba(32,51,88,0.7),rgba(10,18,30,0.88))]' : 'border-white/10 bg-white/[0.04]'}`}
              >
                {tier.popular ? <div className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.35em] text-[#5ba9ff]">MOST POPULAR</div> : null}
                <div className="text-sm font-semibold uppercase tracking-[0.35em] text-[#8b949e]">{tier.name}</div>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.08em] text-white">{tier.price}</span>
                  <span className="pb-2 text-sm text-[#8b949e]">{tier.unit}</span>
                </div>
                <div className="mt-3 text-sm text-[#8b949e]">{tier.description}</div>
                <ul className="mt-8 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-white">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7be9a8]/15 text-[#7be9a8]">
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleDeployNow}
                  className={`mt-8 w-full rounded-2xl px-5 py-4 text-sm font-semibold ${tier.popular ? 'bg-[linear-gradient(135deg,#5ba9ff_0%,#7be9a8_100%)] text-[#04101a]' : 'border border-white/15 text-white hover:border-white/25 hover:bg-white/5'}`}
                >
                  Get started
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center text-sm text-[#8b949e]">
            All plans start with 20 free credits on sign-up · No credit card required · Cancel anytime
          </div>
        </section>

        <section className="pt-28">
          <div className="rounded-[3rem] border border-white/10 bg-[linear-gradient(135deg,rgba(6,12,23,1),rgba(14,30,48,0.92))] px-8 py-14 text-center lg:px-14">
            <div className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-[#8b949e]">Deploy in 60 seconds</div>
            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-5xl">
              Your website. Live in 60 seconds.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#94a3b8]">
              Sign in with Google. Choose a name. Drop your files. Your site is live at yourname.alphatekx.name.ng before you finish reading this sentence.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={handleDeployNow}
                className="inline-flex items-center gap-3 rounded-2xl bg-[linear-gradient(135deg,#5ba9ff_0%,#7be9a8_100%)] px-8 py-4 text-base font-semibold text-[#04101a] shadow-[0_0_32px_rgba(91,169,255,0.3)]"
              >
                Start Deploying — It&apos;s Free
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <footer className="pt-16 pb-10">
          <div className="flex flex-col gap-8 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5ba9ff] to-[#7be9a8] text-[#04101a] shadow-[0_0_24px_rgba(91,169,255,0.3)]">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.42em] text-white/90">ALPHATEKX</span>
              </div>
              <div className="mt-4 text-sm text-[#8b949e]">Get your website live on the internet in 60 seconds. No server. No CLI. Just drop and go.</div>
            </div>

            <div className="grid grid-cols-2 gap-10 text-sm text-[#8b949e] md:grid-cols-3">
              <div>
                <div className="font-semibold text-white">Product</div>
                <div className="mt-3 space-y-2">
                  <div>Features</div>
                  <div>Security</div>
                  <div>Pricing</div>
                  <div>Changelog</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-white">Company</div>
                <div className="mt-3 space-y-2">
                  <div>About</div>
                  <div>Blog</div>
                  <div>Careers</div>
                  <div>Contact</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-white">Legal</div>
                <div className="mt-3 space-y-2">
                  <div>Terms of Service</div>
                  <div>Privacy Policy</div>
                  <div>Security</div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

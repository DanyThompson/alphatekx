const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";

import { Sparkles, Mail, Lock, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function Register() {
  const [step, setStep] = useState("register"); // register | otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      await db.auth.register({ email, password });
      setStep("otp");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await db.auth.verifyOtp({ email, otpCode });
      db.auth.setToken(access_token);
      window.location.href = "/home";
    } catch (err) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try { await db.auth.resendOtp(email); } catch {}
  };

  const handleGoogle = () => {
    db.auth.loginWithProvider("google", "/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(145deg, #F8F9FF 0%, #EEF2FF 45%, #F5F3FF 100%)" }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 600, height: 600, top: -100, left: -100, background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)", filter: "blur(120px)" }} />
        <div className="absolute rounded-full" style={{ width: 800, height: 800, top: -200, right: -200, background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)", filter: "blur(150px)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="p-8 rounded-3xl" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Alphatekx</span>
          </div>

          {step === "register" ? (
            <>
              <h2 className="text-2xl font-bold text-slate-900 text-center mb-1">Create your account</h2>
              <p className="text-sm text-slate-500 text-center mb-6">Start building amazing apps</p>

              <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer transition-colors mb-6">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" required className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 rounded-2xl text-sm font-semibold text-white border-0 cursor-pointer disabled:opacity-50" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p className="text-sm text-slate-500 text-center mt-6">
                Already have an account? <Link to="/login" className="text-blue-500 font-medium no-underline">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900 text-center mb-1">Verify your email</h2>
              <p className="text-sm text-slate-500 text-center mb-6">We sent a code to {email}</p>

              {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

              <form onSubmit={handleVerify} className="space-y-4">
                <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="Enter verification code" required className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm text-center tracking-[0.3em] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                <button type="submit" disabled={loading} className="w-full py-3 rounded-2xl text-sm font-semibold text-white border-0 cursor-pointer disabled:opacity-50" style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </form>

              <button onClick={handleResend} className="w-full text-center text-sm text-blue-500 mt-4 bg-transparent border-0 cursor-pointer">Resend code</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
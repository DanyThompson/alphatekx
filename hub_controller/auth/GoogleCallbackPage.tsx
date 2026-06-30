import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeGoogleOAuthCallback, setSecureSession } from './index';

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Guardian is verifying your Google session…');

  useEffect(() => {
    let active = true;

    const run = async () => {
      const result = await completeGoogleOAuthCallback();

      if (!active) {
        return;
      }

      if (!result.ok) {
        setStatus(`Guardian denied access: ${result.reason}`);
        return;
      }

      await setSecureSession(result.session);
      navigate('/dashboard/overview', { replace: true });
    };

    void run();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050d1a] px-4 text-[#f0f6fc]">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_0_45px_rgba(88,166,255,0.12)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#58a6ff] to-[#7ee787] text-[#04101a]">
          <span className="text-2xl font-black">G</span>
        </div>
        <div className="text-sm font-semibold uppercase tracking-[0.3em] text-[#58a6ff]">Guardian Security</div>
        <div className="mt-4 text-lg font-semibold text-[#f0f6fc]">{status}</div>
      </div>
    </div>
  );
}

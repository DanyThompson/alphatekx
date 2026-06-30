export type GoogleProfile = {
  sub: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
  hd?: string;
};

export type AlphaTekxSession = {
  accessToken: string;
  profile: GoogleProfile;
  issuedAt: number;
  expiresAt: number;
};

const SESSION_COOKIE_NAME = 'alphatekx_session';
const SESSION_STATE_KEY = 'alphatekx_google_state';
const SESSION_SECRET = import.meta.env.VITE_SESSION_SECRET || 'guardian-session-seed-2026';

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const buffer = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  buffer.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded = padding === 0 ? normalized : normalized + '='.repeat(4 - padding);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function encryptPayload(payload: string): Promise<string> {
  const secretBytes = new TextEncoder().encode(SESSION_SECRET);
  const key = await crypto.subtle.importKey('raw', secretBytes, 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(payload));
  return `${base64UrlEncode(iv)}.${base64UrlEncode(encrypted)}`;
}

async function decryptPayload(token: string): Promise<string> {
  const [ivPart, payloadPart] = token.split('.');
  if (!ivPart || !payloadPart) {
    throw new Error('Invalid session token');
  }

  const secretBytes = new TextEncoder().encode(SESSION_SECRET);
  const key = await crypto.subtle.importKey('raw', secretBytes, 'AES-GCM', false, ['decrypt']);
  const iv = base64UrlDecode(ivPart);
  const encrypted = base64UrlDecode(payloadPart);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted);
  return new TextDecoder().decode(decrypted);
}

function writeSessionCookie(value: string): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
}

function readSessionCookie(): string | null {
  const cookies = document.cookie.split('; ').map((entry) => entry.split('='));
  for (const [name, value] of cookies) {
    if (name === SESSION_COOKIE_NAME) {
      return decodeURIComponent(value ?? '');
    }
  }
  return null;
}

export function clearSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export async function setSecureSession(session: AlphaTekxSession): Promise<void> {
  const payload = JSON.stringify(session);
  const encrypted = await encryptPayload(payload);
  writeSessionCookie(encrypted);
}

export async function getSession(): Promise<AlphaTekxSession | null> {
  const encrypted = readSessionCookie();
  if (!encrypted) {
    return null;
  }

  try {
    const plaintext = await decryptPayload(encrypted);
    const session = JSON.parse(plaintext) as AlphaTekxSession;
    if (session.expiresAt <= Date.now()) {
      clearSessionCookie();
      return null;
    }
    return session;
  } catch {
    clearSessionCookie();
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session);
}

export function startGoogleSignIn(): void {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
    window.alert('Google sign-in is not configured yet. Set VITE_GOOGLE_CLIENT_ID in your environment.');
    return;
  }

  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const state = Math.random().toString(36).slice(2);
  sessionStorage.setItem(SESSION_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: 'openid email profile',
    include_granted_scopes: 'true',
    prompt: 'select_account',
    state,
  });

  window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export async function guardianHandshake(profile: GoogleProfile): Promise<{ allowed: boolean; reason?: string }> {
  if (!profile.email) {
    return { allowed: false, reason: 'Missing email in Google profile.' };
  }

  if (profile.email_verified !== true) {
    return { allowed: false, reason: 'Google account email is not verified.' };
  }

  if (!profile.name || profile.name.trim().length === 0) {
    return { allowed: false, reason: 'Guardian rejected the profile because the name is missing.' };
  }

  if (!profile.picture) {
    return { allowed: false, reason: 'Guardian rejected the profile because a profile image is required.' };
  }

  return { allowed: true };
}

export async function completeGoogleOAuthCallback(): Promise<{ ok: true; session: AlphaTekxSession } | { ok: false; reason: string }> {
  const hash = window.location.hash.replace(/^#/, '');
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const state = params.get('state');
  const error = params.get('error');
  const errorDescription = params.get('error_description');
  const expectedState = sessionStorage.getItem(SESSION_STATE_KEY);

  if (error) {
    return { ok: false, reason: errorDescription || error };
  }

  if (!expectedState || state !== expectedState) {
    return { ok: false, reason: 'Invalid OAuth state detected.' };
  }

  if (!accessToken) {
    return { ok: false, reason: 'The Google callback did not return an access token.' };
  }

  const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!profileResponse.ok) {
    return { ok: false, reason: 'Unable to load the verified Google profile.' };
  }

  const profile = (await profileResponse.json()) as GoogleProfile;
  const handshake = await guardianHandshake(profile);

  if (!handshake.allowed) {
    return { ok: false, reason: handshake.reason || 'Guardian rejected the account during security validation.' };
  }

  const session: AlphaTekxSession = {
    accessToken,
    profile,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };

  return { ok: true, session };
}

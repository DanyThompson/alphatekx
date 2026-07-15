const HARD_REQUIREMENTS = `
Build this app for real with production React code in one file. Return ONLY a fenced tsx code block.
Use a default-exported component, Tailwind classes, and no imports (React hooks are available globally in the preview).
Use real state: 6-12 initial records with id,title,price,image,stock/status; search with useMemo and toLowerCase includes;
mutations guarded with Math.max(0,...); localStorage JSON persistence in try/catch plus useEffect; totals/stats with reduce;
every button must have a real onClick mutation. Build a polished 400-700 line app, not a toy or static mockup.
`;

export async function buildRealApp(prompt: string): Promise<string> {
  const endpoint = import.meta.env.VITE_ALPHA_API_URL || '/api/alpha';
  const response = await fetch(endpoint, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: `${HARD_REQUIREMENTS}\nUser request: ${prompt}`, mode: 'builder' }),
  });
  if (!response.ok) throw new Error(`Builder API ${response.status}`);
  const data = await response.json();
  let code = String(data.code || data.response || data.text || '');
  const match = code.match(/```(?:tsx|jsx|ts|js|typescript)?\s*([\s\S]*?)```/i);
  if (match) code = match[1];
  code = code.replace(/^\s*import\s+.*?;?\s*$/gm, '').trim();
  if (!code.includes('useState')) throw new Error('AI returned no React component');
  return code;
}

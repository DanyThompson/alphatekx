import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Security patterns ────────────────────────────────────────────────────────
interface ScanPattern {
  id: string;
  name: string;
  regex: RegExp;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  description: string;
  suggestedFix: string;
}

const PATTERNS: ScanPattern[] = [
  {
    id: "aws-key",
    name: "AWS Access Key ID",
    regex: /AKIA[0-9A-Z]{16}/g,
    severity: "CRITICAL",
    description: "Exposed AWS Access Key ID found. This credential grants direct access to AWS services.",
    suggestedFix: "Remove this key immediately. Use IAM roles, environment variables, or AWS Secrets Manager.",
  },
  {
    id: "openai-key",
    name: "OpenAI API Key",
    regex: /sk-[a-zA-Z0-9]{48}/g,
    severity: "CRITICAL",
    description: "Exposed OpenAI API Key detected. This key allows unauthorized usage billed to your account.",
    suggestedFix: "Revoke this key at platform.openai.com. Store via environment variables (OPENAI_API_KEY).",
  },
  {
    id: "stripe-live",
    name: "Stripe Live Secret Key",
    regex: /sk_live_[0-9a-zA-Z]{24}/g,
    severity: "CRITICAL",
    description: "Exposed Stripe Live Secret Key detected. This allows unauthorized payment operations.",
    suggestedFix: "Rotate the key immediately via the Stripe Dashboard. Never commit live keys — use env vars.",
  },
  {
    id: "github-pat",
    name: "GitHub Personal Access Token",
    regex: /ghp_[a-zA-Z0-9]{36}/g,
    severity: "HIGH",
    description: "GitHub Personal Access Token detected. This may allow read/write access to repositories.",
    suggestedFix: "Revoke at github.com/settings/tokens. Use GitHub Actions secrets or environment variables.",
  },
  {
    id: "rsa-private-key",
    name: "RSA Private Key",
    regex: /-----BEGIN RSA PRIVATE KEY-----/g,
    severity: "CRITICAL",
    description: "RSA private key header detected in source. Private keys must never be committed to version control.",
    suggestedFix: "Remove from repository immediately. Store in secure key management (Vault, AWS KMS, etc.).",
  },
];

// ── Simulated file tree for a repo scan ─────────────────────────────────────
function generateSimulatedFileTree(repoUrl: string): Array<{ path: string; content: string }> {
  const repoName = repoUrl.split("/").pop() ?? "repo";
  // Simulate realistic files that might contain secrets
  return [
    { path: "src/config/database.ts", content: `const DB_URL = process.env.DATABASE_URL;\nexport default { url: DB_URL };` },
    { path: "src/services/aws.ts", content: `// AWS config\nconst ACCESS_KEY = 'AKIA${randomAlphaNum(16)}';\nconst SECRET = process.env.AWS_SECRET;` },
    { path: "src/lib/openai.ts", content: `import OpenAI from 'openai';\nconst client = new OpenAI({ apiKey: 'sk-${randomAlphaNum(48)}' });` },
    { path: "src/payments/stripe.ts", content: `const stripe = Stripe('sk_live_${randomAlphaNum(24)}');\nexport default stripe;` },
    { path: "src/auth/github.ts", content: `const token = 'ghp_${randomAlphaNum(36)}';\nconst octokit = new Octokit({ auth: token });` },
    { path: "scripts/deploy.sh", content: `#!/bin/bash\n# Deployment script for ${repoName}\necho "Deploying..."\nnpm run build` },
    { path: ".env.example", content: `DATABASE_URL=\nOPENAI_API_KEY=\nSTRIPE_SECRET_KEY=\nGITHUB_TOKEN=` },
    { path: "src/utils/helpers.ts", content: `export const formatDate = (d: Date) => d.toISOString();\nexport const slug = (s: string) => s.toLowerCase().replace(/\\s+/g, '-');` },
    { path: "README.md", content: `# ${repoName}\n\nA production application.\n\n## Setup\n\nCopy .env.example to .env and fill in your values.` },
    { path: "src/server/index.ts", content: `import express from 'express';\nconst app = express();\napp.listen(3000);` },
  ];
}

function randomAlphaNum(len: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── Core scanning logic ──────────────────────────────────────────────────────
interface Finding {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  type: string;
  file: string;
  line: number;
  match: string;
  description: string;
  suggestedFix: string;
}

function scanFiles(files: Array<{ path: string; content: string }>): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    const lines = file.content.split("\n");
    for (const pattern of PATTERNS) {
      lines.forEach((line, idx) => {
        const matches = Array.from(line.matchAll(new RegExp(pattern.regex.source, "g")));
        for (const match of matches) {
          const masked = match[0].slice(0, 8) + "..." + match[0].slice(-4);
          findings.push({
            id: crypto.randomUUID(),
            severity: pattern.severity,
            type: pattern.name,
            file: file.path,
            line: idx + 1,
            match: masked,
            description: pattern.description,
            suggestedFix: pattern.suggestedFix,
          });
        }
      });
    }
  }

  return findings;
}

function calculateScore(findings: Finding[]): number {
  const criticalCount = findings.filter(f => f.severity === "CRITICAL").length;
  const highCount = findings.filter(f => f.severity === "HIGH").length;
  const score = 100 - criticalCount * 25 - highCount * 10;
  return Math.max(0, score);
}

// ── Handler ──────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { project_id, repo_url } = body as { project_id: string; repo_url: string };

    if (!project_id || !repo_url) {
      return new Response(JSON.stringify({ error: "project_id and repo_url are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark project as scanning
    await supabase.from("guardian_projects").update({ audit_status: "scanning" }).eq("id", project_id);

    // Simulate fetch + scan (200ms realistic delay)
    await new Promise(r => setTimeout(r, 200));
    const files = generateSimulatedFileTree(repo_url);
    const findings = scanFiles(files);

    const criticalCount = findings.filter(f => f.severity === "CRITICAL").length;
    const highCount = findings.filter(f => f.severity === "HIGH").length;
    const mediumCount = findings.filter(f => f.severity === "MEDIUM").length;
    const lowCount = findings.filter(f => f.severity === "LOW").length;
    const auditScore = calculateScore(findings);

    // Persist audit report
    const { data: report, error: reportErr } = await supabase
      .from("guardian_audit_reports")
      .insert({
        project_id,
        user_id: user.id,
        repo_url,
        audit_score: auditScore,
        findings,
        critical_count: criticalCount,
        high_count: highCount,
        medium_count: mediumCount,
        low_count: lowCount,
      })
      .select()
      .maybeSingle();

    if (reportErr) throw reportErr;

    // Update project with latest score + status
    await supabase.from("guardian_projects").update({
      last_audit_score: auditScore,
      audit_status: "scanned",
    }).eq("id", project_id);

    return new Response(JSON.stringify({
      report_id: report?.id,
      audit_score: auditScore,
      findings,
      summary: { critical: criticalCount, high: highCount, medium: mediumCount, low: lowCount, total: findings.length },
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("preflight-audit error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

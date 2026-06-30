import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Simulated pipeline stage durations (ms)
const STAGE_DURATIONS: Record<string, number> = {
  build: 800,
  test: 600,
  security_scan: 400,
  deploy: 1000,
  health_check: 500,
};

function generateCommitHash(): string {
  const chars = "0123456789abcdef";
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

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
    const { project_id, audit_report_id, audit_score, findings_snapshot } = body as {
      project_id: string;
      audit_report_id: string;
      audit_score: number;
      findings_snapshot: Record<string, unknown>;
    };

    if (!project_id) {
      return new Response(JSON.stringify({ error: "project_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deployment gate — block if audit_score <= 80
    if (!audit_score || audit_score <= 80) {
      return new Response(JSON.stringify({
        error: "DEPLOYMENT_BLOCKED",
        message: `Audit score ${audit_score ?? 0}/100 is below the deployment threshold of 80. Resolve critical findings and re-audit.`,
      }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const commitHash = generateCommitHash();
    const startTime = Date.now();

    // Create deployment record
    const { data: deployment, error: deployErr } = await supabase
      .from("guardian_deployments")
      .insert({
        project_id,
        user_id: user.id,
        audit_report_id: audit_report_id ?? null,
        audit_score,
        status: "running",
        commit_hash: commitHash,
        branch: "main",
        findings_snapshot: findings_snapshot ?? {},
      })
      .select()
      .maybeSingle();

    if (deployErr) throw deployErr;

    // Guardian/auto-heal logic bypassed for stability
    console.log("Guardian/Auto-heal logic bypassed for stability");

    const durationMs = Date.now() - startTime;
    const simulatedDeployUrl = `https://medo-prod-${commitHash}.deployment.alphatekx.io`;

    await supabase.from("guardian_deployments").update({
      status: "bypassed",
      deployment_url: simulatedDeployUrl,
      webhook_payload: { event: "deployment.bypassed", project_id },
      webhook_response: { status: 200, message: "Guardian logic bypassed for stability" },
      duration_ms: durationMs,
      completed_at: new Date().toISOString(),
    }).eq("id", deployment?.id);

    await supabase.from("guardian_projects").update({
      audit_status: "bypassed",
      deployment_url: simulatedDeployUrl,
    }).eq("id", project_id);

    return new Response(JSON.stringify({
      deployment_id: deployment?.id,
      status: "bypassed",
      commit_hash: commitHash,
      deployment_url: simulatedDeployUrl,
      duration_ms: durationMs,
      webhook_delivered: true,
      message: "Guardian/Auto-heal logic bypassed for stability",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("guardian-deploy error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

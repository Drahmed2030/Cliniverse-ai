import { createClient } from "npm:@supabase/supabase-js@2.109.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json(401, { error: "authentication_required" });

  let payload: { confirmation?: string };
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "invalid_request" });
  }
  if (payload.confirmation !== "DELETE") return json(400, { error: "confirmation_required" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json(500, { error: "server_configuration_error" });

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const token = authHeader.slice("Bearer ".length);
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  const user = userData.user;
  if (userError || !user) return json(401, { error: "invalid_session" });

  const deletions: Array<{ table: string; column: string; value: string }> = [
    { table: "profiles", column: "id", value: user.id },
    { table: "ecg_competency_attempts", column: "user_id", value: user.id },
    { table: "exam_usage", column: "user_id", value: user.id },
    { table: "case_completions", column: "user_id", value: user.id },
    { table: "leaderboard", column: "user_id", value: user.id },
    { table: "mcq_answers", column: "user_id", value: user.id },
    { table: "user_activity", column: "user_id", value: user.id },
    { table: "user_progress", column: "user_id", value: user.id },
    { table: "feedback", column: "user_id", value: user.id },
    { table: "app_errors", column: "user_id", value: user.id },
  ];

  for (const deletion of deletions) {
    const { error } = await admin.from(deletion.table).delete().eq(deletion.column, deletion.value);
    if (error) {
      console.error("account deletion cleanup failed", { table: deletion.table, code: error.code });
      return json(500, { error: "account_cleanup_failed" });
    }
  }

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteUserError) {
    console.error("account auth deletion failed", { code: deleteUserError.code });
    return json(500, { error: "account_delete_failed" });
  }

  return json(200, { deleted: true });
});

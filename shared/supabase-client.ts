import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Intentionally non-throwing to avoid crashing builds; runtime routes should validate
  console.warn(
    "Supabase env not fully configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
  );
}

export const supabaseServer = createClient(supabaseUrl || "", supabaseServiceRoleKey || "", {
  auth: { persistSession: false },
});

export type InsertResult<T> = {
  data: T | null;
  error: Error | null;
};

export async function insertCommunication(record: Record<string, unknown>) {
  const { data, error } = await supabaseServer
    .from("communications")
    .insert(record)
    .select()
    .single();
  return { data, error } as InsertResult<any>;
}


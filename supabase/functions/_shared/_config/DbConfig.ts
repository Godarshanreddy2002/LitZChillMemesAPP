import { createClient } from '@supabase'
 
const SUPABASE_URL =Deno.env.get("SUPABASE_URL")||'';
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")||'';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log(SUPABASE_URL)
 
export default supabase;
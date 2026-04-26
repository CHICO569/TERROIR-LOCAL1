import { createClient } from '@supabase/supabase-js';

const cleanUrl = (url: string | undefined): string => {
  if (!url) return 'https://placeholder.supabase.co';
  let cleaned = url.trim();
  // Remove trailing slashes and the /rest/v1/ suffix if the user pasted the direct API URL
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  if (cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
  return cleaned;
};

const supabaseUrl = cleanUrl((import.meta as any).env.VITE_SUPABASE_URL);
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder').trim();

if (!(import.meta as any).env.VITE_SUPABASE_URL || !(import.meta as any).env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

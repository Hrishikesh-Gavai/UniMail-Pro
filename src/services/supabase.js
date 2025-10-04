import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ofyaswmeafxqpxdschga.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meWFzd21lYWZ4cXB4ZHNjaGdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDcyMTYsImV4cCI6MjA3Mzc4MzIxNn0.ad32KI1_I9LhWIm5RbDbmK0VPEKTuzY8IUyoLXkglow';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
=======
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ofyaswmeafxqpxdschga.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9meWFzd21lYWZ4cXB4ZHNjaGdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMDcyMTYsImV4cCI6MjA3Mzc4MzIxNn0.ad32KI1_I9LhWIm5RbDbmK0VPEKTuzY8IUyoLXkglow';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
>>>>>>> f4af213 (Mail automation and integration done successfully)

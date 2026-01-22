
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://fuayropshabesptizmta.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1YXlyb3BzaGFiZXNwdGl6bXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDg1NjksImV4cCI6MjA3NDM4NDU2OX0.cWRSlR92YV_kO8Hx5r7D8PHOG1qwpg57RbQa0ww6G7o'
const supabase = createClient(supabaseUrl, supabaseKey)


export default supabase;
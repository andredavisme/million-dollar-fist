// Supabase client — Million Dollar Fist
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://hhyhulqngdkwsxhymmcd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoeWh1bHFuZ2Rrd3N4aHltbWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzEyMDEsImV4cCI6MjA5MjcwNzIwMX0.dmSy7Q8Je5lEY4XCFzwvfPnkBYLebPE0yZMhy6Y8czI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

import { createClient } from '@supabase/supabase-js'

// ✅ TAMBAHAN LOG: Cek apakah .env terbaca oleh Vite
console.log('🔍 URL DIBACA VITE:', import.meta.env.VITE_SUPABASE_URL);
console.log('🔍 KEY DIBACA VITE:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Terisi' : '❌ Kosong');

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Jika kosong, hentikan pembuatan client untuk mencegah error confusing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ ERROR CRITICAL: Variabel lingkungan Supabase belum terbaca. Cek file .env dan restart server.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
import bcrypt from 'bcryptjs';
import { isSupabaseConfigured, supabaseAdmin } from './supabase';
import { DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_USERNAME } from './adminConfig';

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

interface UserRow {
  id: string;
  username: string;
  display_name: string;
  role: string;
  password_hash: string;
  is_active: boolean;
}

/**
 * Verifikasi kredensial admin (username + password).
 *
 * - Jika Supabase dikonfigurasi: hash bcrypt dicek ke tabel `users`
 *   (service/secret key, tabel tidak bisa dibaca publik), akun non-aktif
 *   ditolak.
 * - Fallback (tanpa Supabase, mode demo/dev): hanya menerima kredensial
 *   DEFAULT_ADMIN_USERNAME / DEFAULT_ADMIN_PASSWORD.
 *
 * Mengembalikan detail AdminUser bila valid, `null` bila kredensial salah,
 * atau melempar Error bila terjadi masalah koneksi.
 */
export async function authenticateAdmin(
  username: string,
  password: string,
): Promise<AdminUser | null> {
  const name = (username ?? '').trim().toLowerCase();
  if (!name || !password) return null;

  if (!isSupabaseConfigured() || !supabaseAdmin) {
    if (name === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD) {
      return {
        id: 'local-admin',
        username: name,
        displayName: 'Administrator (lokal)',
        role: 'admin',
      };
    }
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, username, display_name, role, password_hash, is_active')
    .eq('username', name)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const row = data as UserRow | null;
  if (!row || row.is_active !== true) return null;

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) return null;

  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name || row.username,
    role: row.role,
  };
}
import { DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_USERNAME } from './adminConfig';

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

/**
 * Verifikasi kredensial admin (username + password).
 *
 * Login didelegasikan ke route server `/api/admin/login` supaya:
 *   - secret key tidak dipakai di browser (lebih aman & lebih andal —
 *     tidak tersandera CORS/jaringan browser ke Supabase),
 *   - hash bcrypt tetap dibandingkan di sisi server,
 *   - akun non-aktif ditolak.
 *
 * Fallback (tanpa server/style statis): hanya menerima kredensial default.
 *
 * Mengembalikan detail AdminUser bila valid, `null` bila kredensial salah,
 * atau melempar Error bila terjadi masalah koneksi/verifikasi.
 */
export async function authenticateAdmin(
  username: string,
  password: string,
): Promise<AdminUser | null> {
  const name = (username ?? '').trim().toLowerCase();
  if (!name || !password) return null;

  let res: Response;
  try {
    res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: name, password }),
      credentials: 'same-origin',
    });
  } catch (err) {
    // Jaringan/server tidak terjangkau (mis. export statis tanpa backend).
    if (name === DEFAULT_ADMIN_USERNAME && password === DEFAULT_ADMIN_PASSWORD) {
      return {
        id: 'local-admin',
        username: name,
        displayName: 'Administrator (lokal)',
        role: 'admin',
      };
    }
    throw err;
  }

  const body = await res.json().catch(() => null);

  if (res.ok && body && body.ok && body.user && typeof body.user === 'object') {
    return {
      id: String(body.user.id),
      username: String(body.user.username),
      displayName: String(body.user.displayName ?? body.user.username),
      role: String(body.user.role ?? 'admin'),
    } as AdminUser;
  }

  if (body && typeof body.error === 'string') {
    if (res.status === 401 || res.status === 400) return null;
    throw new Error(body.error);
  }

  throw new Error(`Verifikasi gagal (HTTP ${res.status}).`);
}
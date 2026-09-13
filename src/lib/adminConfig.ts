export const ADMIN_SESSION_KEY = 'malibou_admin_session';
export const ADMIN_SESSION_VALUE = 'authorized';
export const ADMIN_USERNAME_KEY = 'malibou_admin_username';

// Kredensial fallback, dikenakan HANYA jika Supabase belum dikonfigurasi
// (mode demo/dev tanpa DB). Saat Supabase aktif, login diverifikasi ke
// tabel public.users (hash bcrypt) dengan akun default admin/malibou123.
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'malibou123';
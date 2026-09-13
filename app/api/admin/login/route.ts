import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

interface UserRow {
  id: string;
  username: string;
  display_name: string | null;
  role: string;
  password_hash: string;
  is_active: boolean;
}

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Badan permintaan tidak valid.' }, { status: 400 });
  }

  const username = (body.username ?? '').trim().toLowerCase();
  const password = body.password ?? '';
  if (!username || !password) {
    return NextResponse.json(
      { error: 'Nama pengguna dan kata sandi wajib diisi.' },
      { status: 400 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secretKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY?.trim();
  if (!url || !secretKey) {
    return NextResponse.json(
      { error: 'Server tidak memiliki kredensial database.' },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase
      .from('users')
      .select('id, username, display_name, role, password_hash, is_active')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    const row = data as UserRow | null;
    if (!row || row.is_active !== true) {
      return NextResponse.json(
        { error: 'Nama pengguna atau kata sandi salah.' },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Nama pengguna atau kata sandi salah.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: row.id,
        username: row.username,
        displayName: row.display_name || row.username,
        role: row.role,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? `Koneksi database gagal: ${err.message}` : 'Koneksi database gagal.',
      },
      { status: 502 }
    );
  }
}
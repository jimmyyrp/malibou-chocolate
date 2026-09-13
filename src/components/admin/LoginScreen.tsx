'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, Info } from 'lucide-react';
import { MalibouLogo } from '../MalibouLogo';
import { ADMIN_PASSWORD } from '../../lib/adminConfig';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Masukkan kata sandi terlebih dahulu.');
      setShakeKey((k) => k + 1);
      return;
    }
    if (password === ADMIN_PASSWORD) {
      setError(null);
      onLogin();
      return;
    }
    setError('Kata sandi salah. Silakan coba lagi.');
    setShakeKey((k) => k + 1);
    setPassword('');
  };

  const handleAutofill = () => {
    setPassword(ADMIN_PASSWORD);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F1E7] flex flex-col items-center justify-center px-4 py-10">
      <div
        key={shakeKey}
        className={`w-full max-w-md bg-[#FAF7F2] border border-[#2A140B]/10 rounded-3xl shadow-xl p-6 sm:p-8 ${
          shakeKey > 0 ? 'animate-[admin-shake_0.4s_ease-in-out]' : ''
        }`}
      >
        <div className="flex justify-center mb-6">
          <MalibouLogo size="lg" />
        </div>

        <div className="text-center mb-7">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3ECE2] text-[#5E3622] text-[10px] font-semibold tracking-[0.18em] uppercase border border-[#2A140B]/6 mb-3">
            <Lock className="w-3 h-3 text-[#B87932]" />
            <span>Area Admin</span>
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A140B] tracking-tight mb-1.5">
            Dashboard Katalog
          </h1>
          <p className="text-xs sm:text-sm text-[#5E3622]/80">
            Akses terbatas. Masukkan kata sandi untuk mengelola produk.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-[#5E3622] mb-1.5"
            >
              Kata Sandi Admin
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!error}
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border text-sm text-[#2A140B] placeholder-[#5E3622]/40 focus:outline-none focus-visible:ring-2 transition-colors ${
                  error
                    ? 'border-red-400 focus-visible:ring-red-300'
                    : 'border-[#2A140B]/10 focus-visible:ring-[#B87932] focus:border-[#B87932]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#5E3622]/60 hover:text-[#2A140B] rounded-lg transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#2A140B] hover:bg-[#3A1F14] active:scale-[0.99] text-[#FAF7F2] text-sm font-semibold tracking-wider shadow-xs transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-[#C58B47]" />
            <span>Masuk ke Dashboard</span>
          </button>
        </form>

        <div className="mt-5 p-3 rounded-xl bg-[#F3ECE2] border border-[#2A140B]/8 flex items-start gap-2.5 text-xs text-[#5E3622]">
          <Info className="w-4 h-4 text-[#B87932] flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p>
              Mode statis (demo): gunakan kata sandi{' '}
              <code className="px-1.5 py-0.5 rounded bg-white border border-[#2A140B]/10 font-semibold text-[#2A140B]">
                {ADMIN_PASSWORD}
              </code>
            </p>
            <button
              onClick={handleAutofill}
              className="text-[#B87932] font-semibold hover:text-[#2A140B] transition-colors cursor-pointer"
            >
              Isi otomatis kata sandi
            </button>
          </div>
        </div>
      </div>

      <p className="mt-6 text-[11px] text-[#5E3622]/60 flex items-center gap-1.5">
        <Lock className="w-3 h-3" />
        Sesi login disimpan di peramban ini dan akan berakhir saat logout.
      </p>
    </div>
  );
};
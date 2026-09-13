'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DualConfirmModalProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  accentDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DualConfirmModal: React.FC<DualConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel,
  accentDanger = true,
  onConfirm,
  onCancel,
}) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStep(0);
        onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  const dangerBtn = accentDanger
    ? 'bg-red-700 hover:bg-red-800 focus-visible:ring-red-300'
    : 'bg-[#2A140B] hover:bg-[#3A1F14] focus-visible:ring-[#B87932]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[admin-fade-in_0.15s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dual-confirm-title"
    >
      <div
        className="absolute inset-0 bg-[#1C0D06]/60 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#2A140B]/10 overflow-hidden animate-[admin-pop-in_0.2s_ease-out]">
        <button
          onClick={onCancel}
          aria-label="Tutup dialog"
          className="absolute right-3 top-3 p-1.5 rounded-lg text-[#5E3622]/60 hover:text-[#2A140B] hover:bg-[#F3ECE2] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 0 ? (
          <div className="p-6">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-[#F3ECE2] text-[#B87932]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 id="dual-confirm-title" className="font-serif text-xl font-bold text-[#2A140B] mb-2">
              {title}
            </h2>
            <div className="text-sm text-[#5E3622] leading-relaxed mb-6">{description}</div>
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
              <button
                onClick={onCancel}
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-[#2A140B] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => setStep(1)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2A140B] hover:bg-[#3A1F14] shadow-xs transition-colors cursor-pointer"
              >
                1. Mulai Konfirmasi
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-red-100 text-red-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 id="dual-confirm-title" className="font-serif text-xl font-bold text-[#2A140B] mb-2">
              Konfirmasi Terakhir
            </h2>
            <p className="text-sm text-red-700/90 leading-relaxed mb-6">
              Tindakan ini bersifat permanen dan tidak dapat dibatalkan. Klik sekali lagi untuk
              menyelesaikan {title.toLowerCase()}.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
              <button
                onClick={() => setStep(0)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-[#2A140B] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                onClick={onConfirm}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-xs transition-colors focus:outline-none focus-visible:ring-2 ${dangerBtn} cursor-pointer`}
              >
                2. Konfirmasi & {confirmLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
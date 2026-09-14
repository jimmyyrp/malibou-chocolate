/**
 * Pengunci scroll body berbasis penghitung bersama.
 *
 * Sebelumnya tiap modal menyimpan `document.body.style.overflow` sendiri lalu
 * mengembalikannya saat tutup. Saat modal bertumpuk/bergantian, nilai yang
 * dikembalikan jadi salah dan body bisa tertinggal terkunci (dashboard tak bisa
 * discroll). Dengan penghitung ini:
 *  - `lockBodyScroll()` hanya menambah penghitung (body tersembunyi).
 *  - `unlockBodyScroll()` hanya mengembalikan scroll saat penghitung jadi 0.
 *
 * `resetBodyScroll()` dipanggil saat dashboard dipasang sebagai pengaman, agar
 * halaman admin dijamin selalu bisa discroll.
 */

let lockCount = 0;

export const resetBodyScroll = (): void => {
  lockCount = 0;
  if (document.body) document.body.style.overflow = '';
};

export const lockBodyScroll = (): void => {
  lockCount += 1;
  if (document.body) document.body.style.overflow = 'hidden';
};

export const unlockBodyScroll = (): void => {
  lockCount = Math.max(0, lockCount - 1);
  if (document.body && lockCount === 0) document.body.style.overflow = '';
};
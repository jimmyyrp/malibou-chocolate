/** Format angka byte ke label mudah dibaca (B, KB, MB, …). */
export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exp = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / Math.pow(1024, exp);
  return `${value.toFixed(exp === 0 ? 0 : value >= 100 ? 0 : 1)} ${units[exp]}`;
};

const dateFmt = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const timeFmt = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
});

/** Format timestamp ISO ke "16 Sep 2026, 14.30" dgn lokal id-ID. */
export const formatDateTime = (iso: string | Date): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return `${dateFmt.format(d)}, ${timeFmt.format(d)}`;
};

/** Format timestamp ISO ke "16 Sep 2026" dgn lokal id-ID. */
export const formatDateShort = (iso: string | Date): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return dateFmt.format(d);
};
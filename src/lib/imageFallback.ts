/**
 * Placeholder netral untuk gambar produk yang gagal dimuat (URL rusak,
 * objek terhapus di storage, dll.) supaya UI tetap terlihat wajar tanpa
 * ikon patah dari browser.
 */
export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#F3ECE2"/><g fill="none" stroke="#B87932" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M200 110l66 66h-44l-66 66 66 66h44l22-22v-44"/><path d="M200 110l-66 66h44l66 66-66 66h-44l22-22v-44"/></g><circle cx="232" cy="178" r="18" fill="#B87932"/></svg>`
  );

/** Handler onError default: ganti source yang gagal dengan placeholder. */
export const imageOnError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.src !== FALLBACK_IMAGE) img.src = FALLBACK_IMAGE;
};
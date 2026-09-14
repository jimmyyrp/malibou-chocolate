'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  RotateCcw,
  RotateCw,
  FlipHorizontal2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Image as ImageIcon,
  Check,
  Loader2,
  ImageOff,
  Scissors,
} from 'lucide-react';

interface ImageEditorModalProps {
  open: boolean;
  src: string;
  sourceLabel?: string;
  onClose: () => void;
  onApply: (dataUrl: string, dims: { width: number; height: number }) => void;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Point {
  x: number;
  y: number;
}

type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
type DragMode = 'move' | 'new' | HandleId;

const CANVAS_W = 720;
const CANVAS_H = 440;
const PAD = 40;
const MIN_CROP = 16;
const MIN_OUT = 64;
const MAX_OUT = 4000;
const HANDLE_POINTS: Array<{ id: HandleId; dx: number; dy: number }> = [
  { id: 'nw', dx: 0, dy: 0 },
  { id: 'n', dx: 0.5, dy: 0 },
  { id: 'ne', dx: 1, dy: 0 },
  { id: 'e', dx: 1, dy: 0.5 },
  { id: 'se', dx: 1, dy: 1 },
  { id: 's', dx: 0.5, dy: 1 },
  { id: 'sw', dx: 0, dy: 1 },
  { id: 'w', dx: 0, dy: 0.5 },
];

const ASPECT_PRESETS: Array<{ label: string; value: number | null }> = [
  { label: 'Bebas', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
];

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/** Pastikan rect selalu di dalam batas + berukuran minimal. */
function clampRect(r: Rect, bufW: number, bufH: number): Rect {
  let { x, y, w, h } = r;
  w = Math.max(MIN_CROP, w);
  h = Math.max(MIN_CROP, h);
  x = clamp(x, 0, Math.max(0, bufW - w));
  y = clamp(y, 0, Math.max(0, bufH - h));
  if (x + w > bufW) x = bufW - w;
  if (y + h > bufH) y = bufH - h;
  return { x, y, w, h };
}

/** Rect bebas dari dua titik. */
function freeRect(a: Point, p: Point, bufW: number, bufH: number): Rect {
  let x = Math.min(a.x, p.x);
  let y = Math.min(a.y, p.y);
  let w = Math.max(Math.abs(p.x - a.x), MIN_CROP);
  let h = Math.max(Math.abs(p.y - a.y), MIN_CROP);
  x = clamp(x, 0, Math.max(0, bufW - w));
  y = clamp(y, 0, Math.max(0, bufH - h));
  w = Math.min(w, bufW - x);
  h = Math.min(h, bufH - y);
  return { x, y, w, h };
}

/** Rect dengan rasio tetap, berjangkur di titik tetap (ax, ay). */
function aspectRect(
  ax: number,
  ay: number,
  p: Point,
  r: number,
  bufW: number,
  bufH: number
): Rect {
  const dx = p.x - ax;
  const dy = p.y - ay;
  const sx = dx < 0 ? -1 : 1;
  const sy = dy < 0 ? -1 : 1;
  const availW = sx > 0 ? bufW - ax : ax;
  const availH = sy > 0 ? bufH - ay : ay;
  const w = clamp(
    Math.max(Math.abs(dx), Math.abs(dy) * r, MIN_CROP),
    MIN_CROP,
    Math.max(MIN_CROP, Math.min(availW, availH * r))
  );
  const h = w / r;
  return { x: sx > 0 ? ax : ax - w, y: sy > 0 ? ay : ay - h, w, h };
}

/** Resize handle sisi (e/w/s/n) dengan rasio tetap. */
function aspectEdge(
  axis: 'e' | 'w' | 's' | 'n',
  orig: Rect,
  p: Point,
  r: number,
  bufW: number,
  bufH: number
): Rect {
  if (axis === 'e') {
    const ax = orig.x + orig.w;
    const ay = orig.y + orig.h / 2;
    const availW = bufW - ax;
    const halfH = Math.min(ay, bufH - ay);
    const w = clamp(Math.max(p.x - ax, MIN_CROP), MIN_CROP, Math.max(MIN_CROP, Math.min(availW, halfH * 2 * r)));
    const h = w / r;
    return clampRect({ x: ax, y: ay - h / 2, w, h }, bufW, bufH);
  }
  if (axis === 'w') {
    const ax = orig.x;
    const ay = orig.y + orig.h / 2;
    const availW = ax;
    const halfH = Math.min(ay, bufH - ay);
    const w = clamp(Math.max(ax - p.x, MIN_CROP), MIN_CROP, Math.max(MIN_CROP, Math.min(availW, halfH * 2 * r)));
    const h = w / r;
    return clampRect({ x: ax - w, y: ay - h / 2, w, h }, bufW, bufH);
  }
  if (axis === 's') {
    const ax = orig.x + orig.w / 2;
    const ay = orig.y + orig.h;
    const availH = bufH - ay;
    const halfW = Math.min(ax, bufW - ax);
    const h = clamp(Math.max(p.y - ay, MIN_CROP), MIN_CROP, Math.max(MIN_CROP, Math.min(availH, (halfW * 2) / r)));
    const w = h * r;
    return clampRect({ x: ax - w / 2, y: ay, w, h }, bufW, bufH);
  }
  const ax = orig.x + orig.w / 2;
  const ay = orig.y;
  const availH = ay;
  const halfW = Math.min(ax, bufW - ax);
  const h = clamp(Math.max(ay - p.y, MIN_CROP), MIN_CROP, Math.max(MIN_CROP, Math.min(availH, (halfW * 2) / r)));
  const w = h * r;
  return clampRect({ x: ax - w / 2, y: ay - h, w, h }, bufW, bufH);
}

/** Resize bebas untuk handle sisi. */
function freeEdge(
  axis: 'e' | 'w' | 's' | 'n',
  orig: Rect,
  p: Point,
  bufW: number,
  bufH: number
): Rect {
  if (axis === 'e') {
    const ax = orig.x + orig.w;
    const w = clamp(p.x - ax, MIN_CROP, bufW - orig.x);
    return clampRect({ x: orig.x, y: orig.y, w, h: orig.h }, bufW, bufH);
  }
  if (axis === 'w') {
    const right = orig.x + orig.w;
    const x = clamp(p.x, 0, right - MIN_CROP);
    return clampRect({ x, y: orig.y, w: right - x, h: orig.h }, bufW, bufH);
  }
  if (axis === 's') {
    const ay = orig.y + orig.h;
    const h = clamp(p.y - ay, MIN_CROP, bufH - orig.y);
    return clampRect({ x: orig.x, y: orig.y, w: orig.w, h }, bufW, bufH);
  }
  const bottom = orig.y + orig.h;
  const y = clamp(p.y, 0, bottom - MIN_CROP);
  return clampRect({ x: orig.x, y, w: orig.w, h: bottom - y }, bufW, bufH);
}

function resizeRect(
  handle: HandleId,
  orig: Rect,
  p: Point,
  r: number | null,
  bufW: number,
  bufH: number
): Rect {
  const corners: Record<'nw' | 'ne' | 'se' | 'sw', [number, number]> = {
    nw: [orig.x + orig.w, orig.y + orig.h],
    ne: [orig.x, orig.y + orig.h],
    se: [orig.x, orig.y],
    sw: [orig.x + orig.w, orig.y],
  };
  if (handle in corners) {
    if (r) {
      const [ax, ay] = corners[handle as 'nw' | 'ne' | 'se' | 'sw'];
      return aspectRect(ax, ay, p, r, bufW, bufH);
    }
    const [ax, ay] = corners[handle as 'nw' | 'ne' | 'se' | 'sw'];
    return freeRect({ x: ax, y: ay }, p, bufW, bufH);
  }
  const axis = handle as 'e' | 'w' | 's' | 'n';
  return r ? aspectEdge(axis, orig, p, r, bufW, bufH) : freeEdge(axis, orig, p, bufW, bufH);
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  open,
  src,
  sourceLabel,
  onClose,
  onApply,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ mode: DragMode; start: Point; orig: Rect } | null>(null);
  const zoomRef = useRef(1);
  const aspectRef = useRef<number | null>(null);

  const [buffer, setBuffer] = useState<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<Rect>({ x: 0, y: 0, w: 10, h: 10 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | null>(null);
  const [outWidth, setOutWidth] = useState(1200);
  const [outFormat, setOutFormat] = useState<'png' | 'jpeg'>('jpeg');
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    aspectRef.current = aspect;
  }, [aspect]);

  // ============ Muat gambar ============
  useEffect(() => {
    if (!open) {
      setStatus('loading');
      setBuffer(null);
      setError(null);
      setAspect(null);
      setZoom(1);
      setOutFormat('jpeg');
      setDirty(false);
      setConfirmDiscard(false);
      return;
    }
    let cancelled = false;
    let revokeUrl: string | null = null;
    setStatus('loading');
    setBuffer(null);
    setError(null);
    setDirty(false);
    setConfirmDiscard(false);

    let imgSrc = src;
    (async () => {
      try {
        if (!src.startsWith('data:') && !src.startsWith('blob:')) {
          const res = await fetch(src, { mode: 'cors' });
          if (res.ok) {
            const blob = await res.blob();
            imgSrc = URL.createObjectURL(blob);
            revokeUrl = imgSrc;
          }
        }
      } catch {
        // Jatuh ke pemuatan langsung (bisa tainted saat ekspor bila CORS menolak)
      }
      if (cancelled) {
        if (revokeUrl) URL.revokeObjectURL(revokeUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (cancelled) {
          if (revokeUrl) URL.revokeObjectURL(revokeUrl);
          return;
        }
        const w = img.naturalWidth || 1;
        const h = img.naturalHeight || 1;
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        if (!ctx) {
          setStatus('error');
          setError('Canvas tidak didukung di peramban ini.');
          if (revokeUrl) URL.revokeObjectURL(revokeUrl);
          return;
        }
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        if (revokeUrl) {
          URL.revokeObjectURL(revokeUrl);
          revokeUrl = null;
        }
        setBuffer(c);
        setOutWidth(Math.min(1600, Math.max(320, Math.round(w * 0.8))));
        setView({ x: 0, y: 0, w, h });
        setZoom(1);
        setStatus('ready');
      };
      img.onerror = () => {
        if (cancelled) return;
        setStatus('error');
        setError('Gambar tidak dapat dimuat. Pastikan file/URL valid dan dapat diakses.');
      };
      img.src = imgSrc;
    })();

    return () => {
      cancelled = true;
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [open, src]);

  // ============ Kunci scroll + Esc ============
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dirty, confirmDiscard]);

  const handleClose = () => {
    if (dirty && !confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    setConfirmDiscard(false);
    onClose();
  };

  // ============ Transform ============
  const getTransform = () => {
    const b = buffer!;
    const s0 = Math.min((CANVAS_W - PAD * 2) / b.width, (CANVAS_H - PAD * 2) / b.height);
    const s = s0 * zoomRef.current;
    return { s, ox: (CANVAS_W - b.width * s) / 2, oy: (CANVAS_H - b.height * s) / 2 };
  };

  const pointToImage = (e: React.PointerEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) * CANVAS_W) / rect.width;
    const py = ((e.clientY - rect.top) * CANVAS_H) / rect.height;
    const { s, ox, oy } = getTransform();
    return { x: (px - ox) / s, y: (py - oy) / s };
  };

  const hitTest = (p: Point): DragMode => {
    const { s, ox, oy } = getTransform();
    const RAD = 16;
    for (const h of HANDLE_POINTS) {
      const hx = ox + (view.x + view.w * h.dx) * s;
      const hy = oy + (view.y + view.h * h.dy) * s;
      const px = ox + p.x * s;
      const py = oy + p.y * s;
      if (Math.abs(px - hx) <= RAD && Math.abs(py - hy) <= RAD) return h.id;
    }
    if (p.x >= view.x && p.x <= view.x + view.w && p.y >= view.y && p.y <= view.y + view.h) {
      return 'move';
    }
    return 'new';
  };

  // ============ Pointer ============
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (status !== 'ready' || !buffer) return;
    e.preventDefault();
    const p = pointToImage(e);
    const mode = hitTest(p);
    dragRef.current = { mode, start: p, orig: { ...view } };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDirty(true);
    if (mode === 'new') {
      setView((v) => clampRect({ x: p.x, y: p.y, w: 1, h: 1 }, buffer.width, buffer.height));
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || !buffer) return;
    const p = pointToImage(e);
    const b = buffer;
    if (drag.mode === 'move') {
      const dx = p.x - drag.start.x;
      const dy = p.y - drag.start.y;
      setView((v) =>
        clampRect(
          { x: drag.orig.x + dx, y: drag.orig.y + dy, w: drag.orig.w, h: drag.orig.h },
          b.width,
          b.height
        )
      );
    } else if (drag.mode === 'new') {
      setView(
        aspectRef.current
          ? aspectRect(drag.start.x, drag.start.y, p, aspectRef.current, b.width, b.height)
          : freeRect(drag.start, p, b.width, b.height)
      );
    } else {
      setView(resizeRect(drag.mode, drag.orig, p, aspectRef.current, b.width, b.height));
    }
    setDirty(true);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // abaikan
    }
    dragRef.current = null;
  };

  // ============ Zoom roda ============
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || status !== 'ready') return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.18 : 0.85;
      setZoom((z) => clamp(z * factor, 0.15, 16));
      setDirty(true);
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, open]);

  // ============ Gambar canvas ============
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const b = buffer;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    // latar papan catur untuk area transparan
    ctx.fillStyle = '#241105';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    if (!b || status !== 'ready') return;

    const { s, ox, oy } = getTransform();
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(b, ox, oy, b.width * s, b.height * s);

    const cx = ox + view.x * s;
    const cy = oy + view.y * s;
    const cw = view.w * s;
    const ch = view.h * s;

    // pekatkan area di luar crop
    ctx.fillStyle = 'rgba(16,8,3,0.55)';
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_W, CANVAS_H);
    ctx.rect(cx, cy, cw, ch);
    ctx.fill('evenodd');

    // garis sepertiga
    ctx.strokeStyle = 'rgba(250,247,242,0.35)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      const gx = cx + (cw * i) / 3;
      const gy = cy + (ch * i) / 3;
      ctx.beginPath();
      ctx.moveTo(gx, cy);
      ctx.lineTo(gx, cy + ch);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, gy);
      ctx.lineTo(cx + cw, gy);
      ctx.stroke();
    }

    // bingkai crop
    ctx.strokeStyle = '#FAF7F2';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx, cy, cw, ch);

    // gagang (handle)
    for (const h of HANDLE_POINTS) {
      const hx = cx + cw * h.dx;
      const hy = cy + ch * h.dy;
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(hx - 5, hy - 5, 10, 10);
      ctx.strokeStyle = '#7E4A30';
      ctx.lineWidth = 1;
      ctx.strokeRect(hx - 5, hy - 5, 10, 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buffer, status, view, zoom, open]);

  // ============ Manipulasi buffer ============
  const rotate = (dir: 1 | -1) => {
    if (!buffer) return;
    const src = buffer;
    const c = document.createElement('canvas');
    c.width = src.height;
    c.height = src.width;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingQuality = 'high';
    if (dir === 1) {
      ctx.translate(c.width, 0);
      ctx.rotate(Math.PI / 2);
    } else {
      ctx.translate(0, c.height);
      ctx.rotate(-Math.PI / 2);
    }
    ctx.drawImage(src, 0, 0);
    setBuffer(c);
    setOutWidth(Math.min(1600, Math.max(320, Math.round(c.width * 0.8))));
    setView({ x: 0, y: 0, w: c.width, h: c.height });
    setDirty(true);
  };

  const flipH = () => {
    if (!buffer) return;
    const src = buffer;
    const c = document.createElement('canvas');
    c.width = src.width;
    c.height = src.height;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(src, 0, 0);
    setBuffer(c);
    setDirty(true);
  };

  const resetCrop = () => {
    if (!buffer) return;
    setView({ x: 0, y: 0, w: buffer.width, h: buffer.height });
    setZoom(1);
    setDirty(true);
  };

  const applyAspect = (r: number | null) => {
    setAspect(r);
    if (!bufDims) return;
    const bufW = bufDims.w;
    const bufH = bufDims.h;
    if (r) {
      setView((v) => {
        let w = v.w;
        let h = v.h;
        if (w / h > r) {
          h = w / r;
          if (h > v.h) {
            h = v.h;
            w = h * r;
          }
        } else {
          w = h * r;
          if (w > v.w) {
            w = v.w;
            h = w / r;
          }
        }
        const x = clamp(v.x + (v.w - w) / 2, 0, Math.max(0, bufW - w));
        const y = clamp(v.y + (v.h - h) / 2, 0, Math.max(0, bufH - h));
        return { x, y, w, h };
      });
    }
    setDirty(true);
  };

  const bufDims = buffer
    ? { w: buffer.width, h: buffer.height }
    : null;

  const zoomPercent = Math.round(zoom * 100);

  // ============ Ekspor ============
  const doApply = () => {
    if (!buffer) return;
    const ratio = view.w / view.h;
    const wRaw = Math.round(outWidth) || 0;
    const w = clamp(wRaw, MIN_OUT, MAX_OUT);
    const h = Math.max(1, Math.round(w / ratio));
    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const ctx = out.getContext('2d');
    if (!ctx) {
      setError('Canvas tidak didukung di peramban ini.');
      return;
    }
    ctx.imageSmoothingQuality = 'high';
    if (outFormat === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(buffer, view.x, view.y, view.w, view.h, 0, 0, w, h);
    let dataUrl: string;
    try {
      dataUrl = out.toDataURL(
        outFormat === 'jpeg' ? 'image/jpeg' : 'image/png',
        outFormat === 'jpeg' ? 0.88 : undefined
      );
    } catch {
      setError('Gambar dari sumber ini tidak mengizinkan pengeditan (CORS). Gunakan tombol unggah pada tab lain atau pilih gambar lain.');
      return;
    }
    onApply(dataUrl, { width: w, height: h });
  };

  if (!open) return null;

  const toolBtn =
    'h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg text-[11px] font-semibold text-[#2A140B] bg-white border border-[#2A140B]/12 hover:bg-[#F3ECE2] transition-colors cursor-pointer';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-[admin-fade-in_0.15s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-editor-title"
    >
      <div className="absolute inset-0 bg-[#170904]/70 backdrop-blur-[2px]" onClick={handleClose} />

      <div className="relative w-full max-w-4xl max-h-[94vh] bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#2A140B]/10 flex flex-col overflow-hidden animate-[admin-pop-in_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2A140B]/8 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2A140B] text-[#C58B47] flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 id="image-editor-title" className="font-serif text-base font-bold text-[#2A140B]">
                Edit Gambar
              </h2>
              <p className="text-[11px] text-[#5E3622]/70 truncate max-w-[420px]">
                Menyunting untuk "{sourceLabel}" — hasil diunggah otomatis setelah
                dikonfirmasi.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Tutup editor"
            className="p-2 rounded-lg text-[#5E3622]/60 hover:text-[#2A140B] hover:bg-[#F3ECE2] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div
            className="relative mx-4 mt-4 rounded-xl overflow-hidden select-none"
            style={{ background: 'repeating-conic-gradient(#2c1407 0% 25%, #381a09 0% 50%) 0 0 / 20px 20px' }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="block w-full cursor-crosshair"
              style={{ touchAction: 'none' }}
              aria-label="Area crop gambar"
            />

            {status === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#FAF7F2] bg-[#241105]/60">
                <Loader2 className="w-7 h-7 animate-spin text-[#C58B47] mb-2.5" />
                <p className="text-xs font-medium">Memuat gambar…</p>
              </div>
            )}

            {status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-[#241105]/70">
                <ImageOff className="w-7 h-7 text-red-300 mb-2.5" />
                <p className="text-sm font-semibold text-[#FAF7F2] max-w-sm">{error}</p>
                <button
                  onClick={handleClose}
                  className="mt-4 min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-[#2A140B] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors cursor-pointer"
                >
                  Kembali ke Formulir
                </button>
              </div>
            )}
          </div>

          <div className="px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#5E3622]/80">
            <span>
              Asli:{' '}
              <strong className="text-[#2A140B]">
                {bufDims ? `${bufDims.w}×${bufDims.h}px` : '…'}
              </strong>
            </span>
            <span>
              Crop:{' '}
              <strong className="text-[#2A140B]">
                {Math.round(view.w)}×{Math.round(view.h)}px
              </strong>
            </span>
            <span>
              Output:{' '}
              <strong className="text-[#2A140B]">
                {clamp(Math.round(outWidth) || 0, MIN_OUT, MAX_OUT)}×
                {Math.max(1, Math.round((clamp(Math.round(outWidth) || 0, MIN_OUT, MAX_OUT) / view.w) * view.h))}px
              </strong>
            </span>
          </div>

          {/* Panel kontrol */}
          <div className="px-4 pb-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-20 text-[11px] font-semibold text-[#5E3622]">Rasio Crop</span>
              {ASPECT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyAspect(preset.value)}
                  className={`min-h-[32px] px-3 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    aspect === preset.value
                      ? 'bg-[#2A140B] text-[#FAF7F2]'
                      : 'text-[#2A140B] bg-white border border-[#2A140B]/12 hover:bg-[#F3ECE2]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="w-20 text-[11px] font-semibold text-[#5E3622]">Transform</span>
              <button
                type="button"
                onClick={() => rotate(-1)}
                aria-label="Putar ke kiri 90°"
                className={toolBtn}
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#B87932]" />
                <span>Putar Kiri</span>
              </button>
              <button type="button" onClick={() => rotate(1)} aria-label="Putar ke kanan 90°" className={toolBtn}>
                <RotateCw className="w-3.5 h-3.5 text-[#B87932]" />
                <span>Putar Kanan</span>
              </button>
              <button type="button" onClick={flipH} aria-label="Balik gambar horizontal" className={toolBtn}>
                <FlipHorizontal2 className="w-3.5 h-3.5 text-[#B87932]" />
                <span>Balik</span>
              </button>
              <button type="button" onClick={resetCrop} aria-label="Reset crop, tampilkan seluruh foto" className={toolBtn}>
                <ImageIcon className="w-3.5 h-3.5 text-[#B87932]" />
                <span>Foto Penuh</span>
              </button>

              <span className="ml-1 inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => clamp(z * 0.85, 0.15, 16))}
                  aria-label="Perkecil"
                  className={`${toolBtn} px-2`}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  aria-label="Sesuaikan gambar ke layar"
                  className={`${toolBtn} px-2`}
                  title="Sesuaikan ke layar"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => clamp(z * 1.18, 0.15, 16))}
                  aria-label="Perbesar"
                  className={`${toolBtn} px-2`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="w-11 text-center text-[11px] font-semibold text-[#5E3622]">
                  {zoomPercent}%
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="w-20 text-[11px] font-semibold text-[#5E3622]">Ukuran</span>
              <label className="inline-flex items-center gap-2 text-[11px] text-[#5E3622]">
                Lebar
                <input
                  type="number"
                  min={MIN_OUT}
                  max={MAX_OUT}
                  step={8}
                  value={outWidth}
                  onChange={(e) => {
                    const v = parseInt(e.target.value.replace(/[^\d]/g, ''), 10) || 0;
                    setOutWidth(v);
                    setDirty(true);
                  }}
                  className="w-24 px-2.5 py-1.5 rounded-lg text-xs text-[#2A140B] bg-white border border-[#2A140B]/12 focus:outline-none focus:ring-2 focus:ring-[#B87932]/30"
                  aria-label="Lebar output dalam piksel"
                />
                px
              </label>
              <label className="inline-flex items-center gap-2 text-[11px] text-[#5E3622]">
                Format
                <select
                  value={outFormat}
                  onChange={(e) => {
                    setOutFormat(e.target.value as 'png' | 'jpeg');
                    setDirty(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-[#2A140B] bg-white border border-[#2A140B]/12 appearance-none cursor-pointer"
                  aria-label="Format output"
                >
                  <option value="jpeg">JPEG (lebih ringan)</option>
                  <option value="png">PNG (transparan)</option>
                </select>
              </label>
              <span className="text-[10px] text-[#5E3622]/60">
                Tinggi menyesuaikan rasio hasil crop secara otomatis.
              </span>
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-red-600 flex items-center gap-1.5">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#2A140B]/8 bg-white flex items-center justify-between gap-3">
          <p className="hidden sm:block text-[11px] text-[#5E3622]/60">
            Seret area = pindah · gagang/sisi = atur ukuran · roda = zoom. Klik
            "Terapkan & Simpan" untuk mengunggah hasilnya.
          </p>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={handleClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-[#2A140B] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={doApply}
              disabled={status !== 'ready'}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#2A140B] hover:bg-[#3A1F14] shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#C58B47]" />
              <span>Terapkan & Simpan</span>
            </button>
          </div>
        </div>

        {/* Konfirmasi ganda saat membuang hasil */}
        {confirmDiscard && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#170904]/60 backdrop-blur-[1px] p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-[#2A140B]/10 animate-[admin-pop-in_0.15s_ease-out]">
              <h3 className="font-serif font-bold text-[#2A140B] mb-1">Batalkan perubahan gambar?</h3>
              <p className="text-xs text-[#5E3622]/80 mb-4">
                Hasil crop/pengaturan belum disimpan dan akan dibuang.
              </p>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setConfirmDiscard(false)}
                  className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-[#2A140B] bg-[#F3ECE2] hover:bg-[#EAE2D5] transition-colors cursor-pointer"
                >
                  Lanjut Edit
                </button>
                <button
                  onClick={handleClose}
                  className="min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Ya, Batalkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
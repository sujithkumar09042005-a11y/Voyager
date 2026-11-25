// Copyright (c) 2026 ReLU Technologies Private Limited. All rights reserved.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import landTopo from 'world-atlas/land-110m.json';
import { ArrowRight, Minus, Plus, RotateCcw } from 'lucide-react';
import destinations from '../../data/destinations.json';
import type { Destination } from '../../types';

const ALL = destinations as Destination[];
const W = 1000;
const H = 520;
const MAX_ZOOM = 8;

interface View { k: number; x: number; y: number }
const HOME: View = { k: 1, x: 0, y: 0 };

const projection = geoNaturalEarth1().fitExtent(
  [[8, 8], [W - 8, H - 8]],
  { type: 'Sphere' },
);
const pathGen = geoPath(projection);
const land = feature(
  landTopo as unknown as Topology,
  (landTopo as unknown as Topology).objects.land,
);
const LAND_PATH = pathGen(land as never) ?? '';
const SPHERE_PATH = pathGen({ type: 'Sphere' }) ?? '';
const GRATICULE_PATH = pathGen(geoGraticule10()) ?? '';

const PINS = ALL.map((d) => {
  const p = projection([d.coordinates.lng, d.coordinates.lat]) ?? [0, 0];
  return { d, x: p[0], y: p[1] };
});

function clampView(v: View): View {
  const k = Math.min(MAX_ZOOM, Math.max(1, v.k));
  const minX = W - W * k;
  const minY = H - H * k;
  return { k, x: Math.min(0, Math.max(minX, v.x)), y: Math.min(0, Math.max(minY, v.y)) };
}

/** Zoom so the given screen-space box fills the map. */
function fitBox(x0: number, y0: number, x1: number, y1: number): View {
  const pad = 70;
  const k = Math.min(W / (x1 - x0 + pad * 2), H / (y1 - y0 + pad * 2));
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return clampView({ k, x: W / 2 - cx * k, y: H / 2 - cy * k });
}

interface AtlasMapProps {
  className?: string;
  /** Only these destinations are highlighted; others are dimmed. Omit for all. */
  visibleIds?: string[];
  /** Destination to zoom to and preselect on mount. */
  focusId?: string;
  /** Hide region chips and helper text (for small embeds). */
  compact?: boolean;
}

export function AtlasMap({ className = '', visibleIds, focusId, compact = false }: AtlasMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ px: number; py: number; vx: number; vy: number; moved: boolean } | null>(null);
  const [view, setView] = useState<View>(() => {
    const pin = focusId ? PINS.find((p) => p.d.id === focusId) : undefined;
    return pin ? clampView({ k: 3.2, x: W / 2 - pin.x * 3.2, y: H / 2 - pin.y * 3.2 }) : HOME;
  });
  const visible = useMemo(() => (visibleIds ? new Set(visibleIds) : null), [visibleIds]);
  const [dragging, setDragging] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(focusId ?? null);
  const [trail, setTrail] = useState<string[]>([]);
  const [region, setRegion] = useState<string | null>(null);

  const regions = useMemo(() => [...new Set(ALL.map((d) => d.region))].sort(), []);
  const activeId = hoverId ?? selectedId;
  const active = PINS.find((p) => p.d.id === activeId) ?? null;

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setTrail((t) => (t[t.length - 1] === id ? t : [...t.filter((x) => x !== id), id].slice(-6)));
    const pin = PINS.find((p) => p.d.id === id);
    if (pin) {
      setView((v) => {
        const k = Math.max(v.k, 2.4);
        const wide = typeof window !== 'undefined' && window.innerWidth >= 640;
        return clampView({ k, x: W * (wide ? 0.64 : 0.5) - pin.x * k, y: H * (wide ? 0.5 : 0.35) - pin.y * k });
      });
    }
  }, []);

  const zoomBy = useCallback((factor: number) => {
    setView((v) => {
      const k = Math.min(MAX_ZOOM, Math.max(1, v.k * factor));
      const cx = W / 2;
      const cy = H / 2;
      return clampView({ k, x: cx - ((cx - v.x) / v.k) * k, y: cy - ((cy - v.y) / v.k) * k });
    });
  }, []);

  const focusRegion = (r: string | null) => {
    setRegion(r);
    if (!r) { setView(HOME); return; }
    const pts = PINS.filter((p) => p.d.region === r);
    setView(fitBox(
      Math.min(...pts.map((p) => p.x)), Math.min(...pts.map((p) => p.y)),
      Math.max(...pts.map((p) => p.x)), Math.max(...pts.map((p) => p.y)),
    ));
  };

  // Ctrl/Cmd + wheel zooms the map. Plain wheel keeps scrolling the page.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? 1.2 : 1 / 1.2);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomBy]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest('[data-pin]')) return;
    drag.current = { px: e.clientX, py: e.clientY, vx: view.x, vy: view.y, moved: false };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const scale = W / rect.width;
    d.moved = true;
    setView((v) => clampView({ ...v, x: d.vx + (e.clientX - d.px) * scale, y: d.vy + (e.clientY - d.py) * scale }));
  };
  const onPointerUp = () => { drag.current = null; setDragging(false); };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = 60;
    if (e.key === '+' || e.key === '=') zoomBy(1.4);
    else if (e.key === '-') zoomBy(1 / 1.4);
    else if (e.key === 'ArrowLeft') setView((v) => clampView({ ...v, x: v.x + step }));
    else if (e.key === 'ArrowRight') setView((v) => clampView({ ...v, x: v.x - step }));
    else if (e.key === 'ArrowUp') setView((v) => clampView({ ...v, y: v.y + step }));
    else if (e.key === 'ArrowDown') setView((v) => clampView({ ...v, y: v.y - step }));
    else return;
    e.preventDefault();
  };

  const trailPaths = useMemo(() => {
    const out: string[] = [];
    for (let i = 1; i < trail.length; i++) {
      const a = ALL.find((d) => d.id === trail[i - 1]);
      const b = ALL.find((d) => d.id === trail[i]);
      if (!a || !b) continue;
      const line = pathGen({
        type: 'LineString',
        coordinates: [[a.coordinates.lng, a.coordinates.lat], [b.coordinates.lng, b.coordinates.lat]],
      });
      if (line) out.push(line);
    }
    return out;
  }, [trail]);

  const pinR = 6 / view.k ** 0.55;

  return (
    <div className={`relative ${className}`}>
      {/* Region chips */}
      {!compact && <div className="flex flex-wrap items-center gap-2 mb-3" role="group" aria-label="Zoom to region">
        <button
          type="button"
          onClick={() => focusRegion(null)}
          aria-pressed={region === null}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${region === null ? 'bg-accent-500 text-onaccent border-accent-500' : 'glass-pill text-[var(--text-secondary)]'}`}
        >
          World
        </button>
        {regions.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => focusRegion(r)}
            aria-pressed={region === r}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${region === r ? 'bg-accent-500 text-onaccent border-accent-500' : 'glass-pill text-[var(--text-secondary)]'}`}
          >
            {r}
          </button>
        ))}
      </div>}

      <div
        className="relative overflow-hidden rounded-2xl border border-[var(--line)] shadow-[0_18px_40px_-24px_var(--shadow-ink)]"
        style={{ background: 'var(--map-ocean)' }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          role="application"
          aria-label="Interactive world map of destinations. Use arrow keys to pan, plus and minus to zoom, Tab to move between destinations."
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="w-full h-auto block select-none touch-pan-y"
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        >
          <g
            style={{
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
              transformOrigin: '0 0',
              transition: dragging ? 'none' : 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <path d={SPHERE_PATH} className="atlas-ocean" />
            <path d={GRATICULE_PATH} className="atlas-graticule" />
            <path d={LAND_PATH} className="atlas-land" />
            {trailPaths.map((d, i) => <path key={i} d={d} className="atlas-route" />)}

            {PINS.map(({ d, x, y }) => {
              const isActive = d.id === activeId;
              const dim = (region !== null && d.region !== region) || (visible !== null && !visible.has(d.id));
              return (
                <g
                  key={d.id}
                  data-pin
                  className="atlas-pin"
                  transform={`translate(${x} ${y})`}
                  opacity={dim ? 0.3 : 1}
                  role="link"
                  tabIndex={0}
                  aria-label={`${d.name}, ${d.country}. Press Enter to preview.`}
                  onMouseEnter={() => setHoverId(d.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(d.id)}
                  onBlur={() => setHoverId(null)}
                  onClick={() => select(d.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(d.id); }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* generous invisible hit area, 24px minimum on screen */}
                  <circle r={14 / view.k ** 0.55} fill="transparent" />
                  {isActive && <circle r={pinR} className="atlas-pin-pulse" fill="var(--accent-color)" />}
                  <circle
                    r={isActive ? pinR * 1.35 : pinR}
                    className="atlas-pin-dot"
                    fill="var(--accent-color)"
                    stroke="var(--surface)"
                    strokeWidth={1.5 / view.k ** 0.55}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {/* Zoom controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.5)}
            className="w-11 h-11 rounded-xl glass-panel flex items-center justify-center text-[var(--text-primary)]"><Plus size={18} /></button>
          <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.5)}
            className="w-11 h-11 rounded-xl glass-panel flex items-center justify-center text-[var(--text-primary)]"><Minus size={18} /></button>
          <button type="button" aria-label="Reset map" onClick={() => { setView(HOME); setRegion(null); setTrail([]); setSelectedId(null); }}
            className="w-11 h-11 rounded-xl glass-panel flex items-center justify-center text-[var(--text-primary)]"><RotateCcw size={16} /></button>
        </div>

        {/* Postcard */}
        <div className="absolute left-3 bottom-3 right-16 sm:right-auto sm:w-80 pointer-events-none" aria-live="polite">
          {active && !compact && (
            <article className="pointer-events-auto stamp-edge bg-[var(--surface-raised)] text-[var(--text-primary)] p-5 border border-[var(--line)] shadow-[0_14px_30px_-12px_var(--shadow-ink)]">
              <p className="legend-label mb-1">{active.d.region} / {active.d.country}</p>
              <h3 className="font-display text-xl leading-tight mb-1">{active.d.name}</h3>
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">{active.d.tagline}</p>
              <dl className="flex gap-5 text-xs mb-3 text-[var(--text-muted)]">
                <div><dt className="font-semibold">Best time</dt><dd className="text-[var(--text-primary)]">{active.d.bestTimeToVisit}</dd></div>
                <div><dt className="font-semibold">Per day</dt><dd className="text-[var(--text-primary)]">{active.d.avgDailyBudget}</dd></div>
              </dl>
              <Link
                to={`/destination/${active.d.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent-500 text-onaccent text-sm font-semibold"
              >
                Open destination <ArrowRight size={14} />
              </Link>
            </article>
          )}
        </div>
      </div>

      {!compact && (
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Drag to pan. Ctrl or Cmd plus scroll to zoom. Select pins to trace a route between them.
        </p>
      )}
    </div>
  );
}

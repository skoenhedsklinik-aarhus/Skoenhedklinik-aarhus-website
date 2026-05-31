'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// useLayoutEffect on the server warns; fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const NAV_LINKS = [
  { label: 'Behandlinger', href: '/behandlinger' },
  { label: 'Priser', href: '/priser' },
  { label: 'Om os', href: '/om-os' },
  { label: 'Kontakt', href: '/kontakt' },
];

function MiniNav({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          key="mini-nav"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-14"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 100%)',
          }}
        >
          <Link href="/" className="font-heading text-base md:text-lg font-medium text-white/90 tracking-tight hover:text-white transition-colors">
            Skønhedsklinik Aarhus
          </Link>
          <ul className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/75 hover:text-white text-xs font-medium tracking-widest uppercase transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/book">
            <span className="text-white/75 hover:text-white text-xs font-medium tracking-widest uppercase transition-colors">
              Book nu
            </span>
          </Link>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Viewport size — only used to set the media's FIXED box size (changes on
  // resize). SSR-safe defaults; corrected on mount/resize.
  const [viewport, setViewport] = useState({ w: 1440, h: 900 });

  // The hero is driven by NATIVE scroll position (no wheel hijack / preventDefault),
  // so Chrome can keep scrolling on the compositor thread — buttery in every
  // browser. A tall runway (RUNWAY_VH) is scrolled through while the inner panel
  // stays pinned (position: sticky); the scroll offset maps to the animation:
  //   0 … EXPAND_END   → video expands
  //   EXPAND_END … REVEAL_END → content reveals on top
  //   REVEAL_END … 1   → hold on the final frame before the panel releases
  const RUNWAY_VH = 240;
  const EXPAND_END = 0.6;
  const REVEAL_END = 0.88;

  const rafRef = useRef<number | null>(null);
  const expandedRef = useRef(false);

  // DOM nodes mutated imperatively as you scroll (no React render per frame).
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const blurWrapRef = useRef<HTMLDivElement | null>(null);
  const bgFadeRef = useRef<HTMLDivElement | null>(null);
  const darkFillRef = useRef<HTMLDivElement | null>(null);
  const mediaOverlayRef = useRef<HTMLDivElement | null>(null);
  const titlesRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Map current scroll position to the animation and write it straight to the DOM.
  const applyStyles = useCallback(() => {
    const runway = runwayRef.current;
    if (!runway) return;

    const total = runway.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(-runway.getBoundingClientRect().top, 0), Math.max(total, 1));
    const progress = total > 0 ? scrolled / total : 0;
    const sp = Math.min(Math.max(progress / EXPAND_END, 0), 1);
    const rp = Math.min(Math.max((progress - EXPAND_END) / (REVEAL_END - EXPAND_END), 0), 1);

    const mobile = window.innerWidth < 768;
    const startW = mobile ? 340 : 640;
    const startH = mobile ? 210 : 380;
    const targetW = Math.min(startW + (mobile ? 560 : 1240), window.innerWidth * 0.95);
    const targetH = Math.min(startH + (mobile ? 280 : 430), window.innerHeight * 0.88);
    const startScale = Math.min(startW / targetW, startH / targetH);
    const mediaScale = startScale + sp * (1 - startScale);
    const blurPx = rp * 18;

    if (mediaRef.current)
      mediaRef.current.style.transform = `translate(-50%, -50%) scale(${mediaScale})`;
    if (bgFadeRef.current) bgFadeRef.current.style.opacity = `${1 - sp}`;
    if (darkFillRef.current) darkFillRef.current.style.opacity = `${sp * 0.7}`;
    if (mediaOverlayRef.current)
      mediaOverlayRef.current.style.opacity = `${(mediaType === 'video' ? 0.5 : 0.7) - sp * 0.3}`;
    if (blurWrapRef.current) {
      blurWrapRef.current.style.filter = blurPx > 0 ? `blur(${blurPx}px)` : 'none';
      blurWrapRef.current.style.willChange = blurPx > 0 ? 'filter' : 'auto';
    }
    if (titlesRef.current) {
      titlesRef.current.style.opacity = `${Math.max(0, 1 - rp * 2.5)}`;
      titlesRef.current.style.setProperty('--tx', `${sp * (mobile ? 180 : 150)}vw`);
    }
    if (contentRef.current) {
      contentRef.current.style.opacity = `${rp}`;
      contentRef.current.style.pointerEvents = rp > 0.4 ? 'auto' : 'none';
    }

    // Tell the Header to appear once the video is fully expanded.
    const expanded = sp >= 1;
    if (expanded !== expandedRef.current) {
      expandedRef.current = expanded;
      setMediaFullyExpanded(expanded);
    }
  }, [mediaType, EXPAND_END, REVEAL_END]);

  // Tell Header when to appear (after video fully expands)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('heroExpanded', { detail: { expanded: mediaFullyExpanded } }));
  }, [mediaFullyExpanded]);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Re-apply imperative styles after every (rare) React render — resize / phase
  // toggle — so React resetting the JSX styles never clobbers the live values.
  // Runs before paint, so the correction is never visible.
  useIsomorphicLayoutEffect(() => {
    applyStyles();
  });

  useEffect(() => {
    const schedule = () => {
      if (rafRef.current === null)
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          applyStyles();
        });
    };
    // PASSIVE listeners — never block scrolling, so Chrome stays on the
    // compositor thread.
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    schedule();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [applyStyles]);

  // ── Sizing (landscape start) ──────────────────────────────────────────────
  // The media keeps a FIXED layout box (rendered at the final size) and only a
  // GPU-composited transform: scale() changes while scrolling — no per-frame
  // layout, shadow repaint or rounded-corner re-clip.
  const startW = isMobile ? 340 : 640;
  const startH = isMobile ? 210 : 380;
  const targetW = Math.min(startW + (isMobile ? 560 : 1240), viewport.w * 0.95);
  const targetH = Math.min(startH + (isMobile ? 280 : 430), viewport.h * 0.88);
  const startScale = Math.min(startW / targetW, startH / targetH);

  const firstWord   = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div ref={runwayRef} className="relative" style={{ height: `${RUNWAY_VH}vh` }}>
      {/* Mini nav — visible only during expansion phase */}
      <MiniNav visible={!mediaFullyExpanded} />

      {/* Pinned panel — stays put while the runway scrolls past it */}
      <section className="sticky top-0 h-[100dvh] flex items-center justify-center overflow-hidden">

        {/* ── Visual layer — gets blurred in phase 2 ── */}
        <div ref={blurWrapRef} className="absolute inset-0" style={{ filter: 'none', willChange: 'auto' }}>

          {/* Background image fades out as video expands */}
          <div ref={bgFadeRef} className="absolute inset-0" style={{ opacity: 1, willChange: 'opacity' }}>
            <Image
              src={bgImageSrc}
              alt="Background"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Dark fill behind the video */}
          <div ref={darkFillRef} className="absolute inset-0 bg-black" style={{ opacity: 0, willChange: 'opacity' }} />

          {/* Video / Image */}
          <div
            ref={mediaRef}
            className="absolute top-1/2 left-1/2 rounded-2xl overflow-hidden"
            style={{
              width: `${targetW}px`,
              height: `${targetH}px`,
              transform: `translate(-50%, -50%) scale(${startScale})`,
              transformOrigin: 'center center',
              boxShadow: '0 0 60px rgba(0,0,0,0.4)',
              willChange: 'transform',
            }}
          >
            {mediaType === 'video' ? (
              <div className="relative w-full h-full pointer-events-none">
                <video
                  src={mediaSrc}
                  poster={posterSrc}
                  autoPlay muted loop playsInline preload="auto"
                  className="w-full h-full object-cover"
                  disablePictureInPicture
                  disableRemotePlayback
                />
                {/* Own compositor layer so its per-frame opacity change does not
                    repaint the video layer (a Chrome-specific cost). */}
                <div
                  ref={mediaOverlayRef}
                  className="absolute inset-0 bg-black/30"
                  style={{ opacity: 0.5, willChange: 'opacity' }}
                />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <Image src={mediaSrc} alt={title || ''} fill className="object-cover" />
                <div
                  ref={mediaOverlayRef}
                  className="absolute inset-0 bg-black/50"
                  style={{ opacity: 0.7, willChange: 'opacity' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Titles + scroll hint (fade out during reveal) ── */}
        <div
          ref={titlesRef}
          className={`relative z-10 flex flex-col items-center justify-center gap-4 w-full ${textBlend ? 'mix-blend-difference' : ''}`}
          style={{ opacity: 1, pointerEvents: 'none', ['--tx' as string]: '0vw' }}
        >
          {date && (
            <p className="eyebrow text-white/70 tracking-[0.22em]" style={{ transform: 'translateX(calc(var(--tx) * -1))' }}>
              {date}
            </p>
          )}
          <h1
            className="font-heading font-light text-white leading-[1.06]"
            style={{ transform: 'translateX(calc(var(--tx) * -1))', fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            {firstWord}
          </h1>
          <h1
            className="font-heading font-light text-white leading-[1.06]"
            style={{ transform: 'translateX(var(--tx))', fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            {restOfTitle}
          </h1>
          {scrollToExpand && (
            <p className="text-white/50 text-xs font-medium tracking-widest mt-2" style={{ transform: 'translateX(var(--tx))' }}>
              {scrollToExpand}
            </p>
          )}
        </div>

        {/* ── Content overlay — fades in ON TOP of the blurred video ── */}
        <div
          ref={contentRef}
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{ opacity: 0, pointerEvents: 'none' }}
        >
          {children}
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;

'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [scrollProgress, setScrollProgress] = useState(0);   // 0→1: video expands
  const [revealProgress, setRevealProgress] = useState(0);   // 0→1: content reveals on top
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Refs mirror the animation state so the wheel/touch listeners can be
  // registered ONCE (instead of being torn down and re-added on every frame)
  // and so we coalesce many input events into a single setState per frame.
  const scrollProgressRef = useRef(0);
  const revealProgressRef = useRef(0);
  const mediaExpandedRef = useRef(false);
  const contentRevealedRef = useRef(false);
  const touchStartYRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Tell Header when to appear (after video fully expands)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('heroExpanded', { detail: { expanded: mediaFullyExpanded } }));
  }, [mediaFullyExpanded]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Flush the latest ref values into React state — scheduled at most once per
    // animation frame, so a burst of high-frequency wheel/touch events produces
    // a single re-render+relayout per frame instead of one per event.
    const flush = () => {
      rafRef.current = null;
      setScrollProgress(scrollProgressRef.current);
      setRevealProgress(revealProgressRef.current);
    };
    const schedule = () => {
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(flush);
    };

    // Apply one input delta to the animation. `backwards` = the gesture was an
    // upward/back movement (used to collapse phase 2 back into phase 1).
    const advance = (deltaP: number, deltaR: number, backwards: boolean) => {
      if (!mediaExpandedRef.current) {
        // Phase 1: expand video
        const newP = Math.min(Math.max(scrollProgressRef.current + deltaP, 0), 1);
        scrollProgressRef.current = newP;
        if (newP >= 1) { mediaExpandedRef.current = true; setMediaFullyExpanded(true); }
      } else {
        // Phase 2: blur video + reveal content on top
        const newR = Math.min(Math.max(revealProgressRef.current + deltaR, 0), 1);
        revealProgressRef.current = newR;
        if (newR >= 1) contentRevealedRef.current = true;
        // Scroll back collapses to phase 1
        if (newR <= 0 && backwards) {
          mediaExpandedRef.current = false;
          setMediaFullyExpanded(false);
          scrollProgressRef.current = 0.98;
        }
      }
      schedule();
    };

    const onWheel = (e: WheelEvent) => {
      // Content fully revealed — allow normal page scroll
      if (contentRevealedRef.current) return;
      e.preventDefault();
      advance(e.deltaY * 0.0009, e.deltaY * 0.01, e.deltaY < 0);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (contentRevealedRef.current || !touchStartYRef.current) return;
      const dy = touchStartYRef.current - e.touches[0].clientY;
      e.preventDefault();
      advance(dy * 0.005, dy * 0.06, dy < 0);
      touchStartYRef.current = e.touches[0].clientY;
    };

    const onTouchEnd = () => { touchStartYRef.current = 0; };

    const onScroll = () => {
      if (!contentRevealedRef.current) window.scrollTo(0, 0);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll);
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // ── Sizing (landscape start) ──────────────────────────────────────────────
  const startW = isMobile ? 340 : 640;
  const startH = isMobile ? 210 : 380;
  const mediaWidth  = startW + scrollProgress * (isMobile ? 560 : 1240);
  const mediaHeight = startH + scrollProgress * (isMobile ? 280 : 430);

  const textTranslateX = scrollProgress * (isMobile ? 180 : 150);
  const blurPx = revealProgress * 18;
  const titleOpacity = Math.max(0, 1 - revealProgress * 2.5);

  const firstWord   = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div ref={sectionRef} className="overflow-x-hidden">
      {/* Mini nav — visible only during expansion phase */}
      <MiniNav visible={!mediaFullyExpanded} />

      <section className="relative flex items-center justify-center min-h-[100dvh] overflow-hidden">

        {/* ── Visual layer — gets blurred in phase 2 ── */}
        <div
          className="absolute inset-0"
          style={{
            // Only pay for the blur layer (and a GPU layer promotion) while the
            // blur is actually active — during phase 1 this stays 'none'/'auto'.
            filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
            transform: 'translateZ(0)',
            willChange: blurPx > 0 ? 'filter' : 'auto',
          }}
        >
          {/* Background image fades out as video expands */}
          <div className="absolute inset-0" style={{ opacity: 1 - scrollProgress }}>
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
          <div className="absolute inset-0 bg-black" style={{ opacity: scrollProgress * 0.7 }} />

          {/* Video / Image */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden"
            style={{
              width: `${mediaWidth}px`,
              height: `${mediaHeight}px`,
              maxWidth: '95vw',
              maxHeight: '88vh',
              boxShadow: '0 0 60px rgba(0,0,0,0.4)',
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
                <div
                  className="absolute inset-0 bg-black/30"
                  style={{ opacity: 0.5 - scrollProgress * 0.3 }}
                />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <Image src={mediaSrc} alt={title || ''} fill className="object-cover" />
                <div
                  className="absolute inset-0 bg-black/50"
                  style={{ opacity: 0.7 - scrollProgress * 0.3 }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Titles + scroll hint (fade out during reveal) ── */}
        <div
          className={`relative z-10 flex flex-col items-center justify-center gap-4 w-full ${textBlend ? 'mix-blend-difference' : ''}`}
          style={{ opacity: titleOpacity, pointerEvents: 'none' }}
        >
          {date && (
            <p className="eyebrow text-white/70 tracking-[0.22em]" style={{ transform: `translateX(-${textTranslateX}vw)` }}>
              {date}
            </p>
          )}
          <h1
            className="font-heading font-light text-white leading-[1.06]"
            style={{ transform: `translateX(-${textTranslateX}vw)`, fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            {firstWord}
          </h1>
          <h1
            className="font-heading font-light text-white leading-[1.06]"
            style={{ transform: `translateX(${textTranslateX}vw)`, fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
          >
            {restOfTitle}
          </h1>
          {scrollToExpand && (
            <p className="text-white/50 text-xs font-medium tracking-widest mt-2" style={{ transform: `translateX(${textTranslateX}vw)` }}>
              {scrollToExpand}
            </p>
          )}
        </div>

        {/* ── Content overlay — fades in ON TOP of the blurred video ── */}
        <div
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{
            opacity: revealProgress,
            pointerEvents: revealProgress > 0.4 ? 'auto' : 'none',
            transition: 'opacity 0.05s linear',
          }}
        >
          {children}
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;

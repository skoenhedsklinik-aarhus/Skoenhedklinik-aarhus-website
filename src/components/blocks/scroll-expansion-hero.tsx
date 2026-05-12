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
  const [contentFullyRevealed, setContentFullyRevealed] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);

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
    const onWheel = (e: Event) => {
      const we = e as unknown as WheelEvent;

      // Phase 3: content fully revealed — allow normal page scroll
      if (contentFullyRevealed) return;

      we.preventDefault();

      if (!mediaFullyExpanded) {
        // Phase 1: expand video
        const newP = Math.min(Math.max(scrollProgress + we.deltaY * 0.0009, 0), 1);
        setScrollProgress(newP);
        if (newP >= 1) setMediaFullyExpanded(true);
      } else {
        // Phase 2: blur video + reveal content on top
        const newR = Math.min(Math.max(revealProgress + we.deltaY * 0.0012, 0), 1);
        setRevealProgress(newR);

        if (newR >= 1) setContentFullyRevealed(true);

        // Scroll back collapses to phase 1
        if (newR <= 0 && we.deltaY < 0) {
          setMediaFullyExpanded(false);
          setScrollProgress(0.98);
        }
      }
    };

    const onTouchStart = (e: Event) => {
      setTouchStartY((e as unknown as TouchEvent).touches[0].clientY);
    };

    const onTouchMove = (e: Event) => {
      const te = e as unknown as TouchEvent;
      if (!touchStartY) return;
      const dy = touchStartY - te.touches[0].clientY;

      if (contentFullyRevealed) return;
      te.preventDefault();

      if (!mediaFullyExpanded) {
        const newP = Math.min(Math.max(scrollProgress + dy * 0.005, 0), 1);
        setScrollProgress(newP);
        if (newP >= 1) setMediaFullyExpanded(true);
      } else {
        const newR = Math.min(Math.max(revealProgress + dy * 0.007, 0), 1);
        setRevealProgress(newR);
        if (newR >= 1) setContentFullyRevealed(true);
        if (newR <= 0 && dy < 0) {
          setMediaFullyExpanded(false);
          setScrollProgress(0.98);
        }
      }
      setTouchStartY(te.touches[0].clientY);
    };

    const onTouchEnd = () => setTouchStartY(0);

    const onScroll = () => {
      if (!contentFullyRevealed) window.scrollTo(0, 0);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll);
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [scrollProgress, revealProgress, mediaFullyExpanded, contentFullyRevealed, touchStartY]);

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
          style={{ filter: `blur(${blurPx}px)`, transition: 'filter 0.05s linear', willChange: 'filter' }}
        >
          {/* Background image fades out as video expands */}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <Image
              src={bgImageSrc}
              alt="Background"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>

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
                <motion.div
                  className="absolute inset-0 bg-black/30"
                  animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <Image src={mediaSrc} alt={title || ''} fill className="object-cover" />
                <motion.div
                  className="absolute inset-0 bg-black/50"
                  animate={{ opacity: 0.7 - scrollProgress * 0.3 }}
                  transition={{ duration: 0.2 }}
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

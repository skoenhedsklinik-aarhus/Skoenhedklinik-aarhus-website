"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Connection = { saveData?: boolean; effectiveType?: string };

/** Paint the poster first. Decorative video must not compete with page loading. */
export function HeroVideo({ src, posterSrc }: { src: string; posterSrc: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      connection?.saveData ||
      ["slow-2g", "2g", "3g"].includes(connection?.effectiveType || "")
    ) return;

    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const start = () => {
      if (disposed) return;
      video.src = src;
      video.play().catch(() => {
        // iOS low-power mode and embedded browsers may refuse autoplay.
        // Keep the already visible poster in that case.
      });
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(start, { timeout: 2000 });
      } else {
        timer = setTimeout(start, 200);
      }
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener("load", schedule);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timer !== undefined) clearTimeout(timer);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  return (
    <div className="relative h-full w-full">
      <Image src={posterSrc} alt="" fill priority sizes="100vw" className="object-cover" />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        disablePictureInPicture
        disableRemotePlayback
        onPlaying={() => setPlaying(true)}
        onError={() => setPlaying(false)}
        className={`absolute inset-0 h-full w-full object-cover ${playing ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

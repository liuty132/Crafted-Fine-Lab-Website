"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { ProjectImage } from "@/types";
import type { Language } from "@/types";
import styles from "./ImageCarousel.module.css";

interface ImageCarouselProps {
  images: ProjectImage[];
  lang: Language;
}

export default function ImageCarousel({ images, lang }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const retreat = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  // Prefetch next image during idle time
  useEffect(() => {
    if (images.length <= 1) return;
    const nextIndex = (current + 1) % images.length;
    const nextSrc = images[nextIndex].src;

    const prefetch = () => {
      const img = new window.Image();
      img.src = nextSrc;
    };

    if ("requestIdleCallback" in window) {
      const id = (window as Window & typeof globalThis).requestIdleCallback(prefetch);
      return () => (window as Window & typeof globalThis).cancelIdleCallback(id);
    } else {
      const id = setTimeout(prefetch, 200);
      return () => clearTimeout(id);
    }
  }, [current, images]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) advance();
      else retreat();
    }
    touchStartX.current = null;
  }

  if (images.length === 0) return null;

  return (
    <div
      className={styles.carousel}
      onClick={advance}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="button"
      aria-label="Next image"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && advance()}
    >
      {images.map((image, i) => (
        <div
          key={i}
          className={`${styles.imageWrapper}${i === 0 ? ` ${styles.imageLoaded}` : ""}`}
          style={{ opacity: i === current ? 1 : 0, transition: "opacity 0.4s ease" }}
        >
          <Image
            src={image.src}
            alt={image.alt[lang]}
            fill
            style={{ objectFit: "cover" }}
            priority={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
            unoptimized={image.src.endsWith(".svg")}
            onLoad={(e) => {
              const wrapper = (e.target as HTMLElement).closest(`.${styles.imageWrapper}`);
              wrapper?.classList.add(styles.imageLoaded);
            }}
          />
        </div>
      ))}
      {images.length > 1 && (
        <span className={styles.counter}>
          {current + 1} / {images.length}
        </span>
      )}
    </div>
  );
}

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
  const carouselRef = useRef<HTMLDivElement>(null);
  const [blockSize, setBlockSize] = useState<{ w: number; h: number } | null>(null);

  // Compute block size for current image to fit contain-style within carousel
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || images.length === 0) return;

    const compute = () => {
      const cW = el.clientWidth;
      const cH = el.clientHeight;
      const isMobile = window.innerWidth <= 768;
      const captionH = isMobile ? 36 : 30; // mobile needs more reserve
      const availH = cH - captionH;
      const image = images[current];
      const imgAspect = image.width / image.height;
      const containerAspect = cW / availH;

      if (imgAspect > containerAspect) {
        // Wide image: width-constrained
        const imgH = cW / imgAspect;
        setBlockSize({ w: cW, h: imgH + captionH });
      } else {
        // Tall image: height-constrained
        setBlockSize({ w: availH * imgAspect, h: cH });
      }
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [current, images]);

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  // Auto-advance every 5 seconds, reset on manual interaction
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(advance, 5000);
    return () => clearInterval(id);
  }, [current, images.length, advance]);

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

  if (images.length === 0) return null;

  return (
    <div ref={carouselRef} className={styles.carousel} onClick={advance}>
      {images.map((image, i) => (
        <div
          key={i}
          className={`${styles.slide}${i === 0 ? ` ${styles.imageLoaded}` : ""}`}
          style={{ opacity: i === current ? 1 : 0, transition: "opacity 0.4s ease" }}
        >
          <div
            className={styles.block}
            style={blockSize ? { width: blockSize.w, height: blockSize.h } : undefined}
          >
            <div className={styles.imageBox}>
              <Image
                src={image.src}
                alt={image.alt[lang]}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                style={{ objectFit: "cover" }}
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                unoptimized={image.src.endsWith(".svg")}
                onLoad={(e) => {
                  const slide = (e.target as HTMLElement).closest(`.${styles.slide}`);
                  slide?.classList.add(styles.imageLoaded);
                }}
              />
            </div>
            <p className={styles.caption}>{image.alt[lang]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

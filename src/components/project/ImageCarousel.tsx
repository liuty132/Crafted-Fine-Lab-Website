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
  const [blockSizes, setBlockSizes] = useState<Array<{ w: number; h: number }>>([]);

  // Compute block size for every image to fit contain-style within carousel
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || images.length === 0) return;

    const compute = () => {
      const cW = el.clientWidth;
      const cH = el.clientHeight;
      if (cW === 0 || cH === 0) return;
      const isMobile = window.innerWidth <= 768;
      const captionH = isMobile ? 36 : 30;
      const availH = cH - captionH;

      const sizes = images.map((image) => {
        const imgAspect = image.width / image.height;
        const containerAspect = cW / availH;

        if (imgAspect > containerAspect) {
          const imgH = cW / imgAspect;
          return { w: cW, h: imgH + captionH };
        } else {
          return { w: availH * imgAspect, h: cH };
        }
      });

      setBlockSizes(sizes);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [images]);

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  // Auto-advance every 5 seconds, reset on manual interaction
  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(advance, 5000);
    return () => clearInterval(id);
  }, [current, images.length, advance]);

  if (images.length === 0) return null;

  // Preload exactly one image ahead: eager-load the next slide (alongside the
  // current/first) so the next advance is instant; the rest stay lazy. Uses the
  // slide's own next/image, so the correct optimized URL is fetched.
  const nextIndex = images.length > 1 ? (current + 1) % images.length : 0;

  return (
    <div ref={carouselRef} className={styles.carousel} onClick={advance}>
      {images.map((image, i) => (
        <div
          key={i}
          className={`${styles.slide}${i === 0 ? ` ${styles.imageLoaded}` : ""}`}
          style={{ opacity: i === current ? 1 : 0, transition: "opacity 0.6s ease" }}
        >
          <div
            className={styles.block}
            style={blockSizes[i] ? { width: blockSizes[i].w, height: blockSizes[i].h } : undefined}
          >
            <div className={styles.imageBox}>
              <Image
                src={image.src}
                alt={image.alt[lang]}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                style={{ objectFit: "cover" }}
                priority={i === 0}
                loading={i === 0 || i === current || i === nextIndex ? "eager" : "lazy"}
                unoptimized={image.src.endsWith(".svg")}
                onLoad={(e) => {
                  const slide = (e.target as HTMLElement).closest(`.${styles.slide}`);
                  slide?.classList.add(styles.imageLoaded);
                }}
              />
            </div>
            <p className={styles.caption}>
              {image.alt[lang]} ({i + 1}/{images.length})
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

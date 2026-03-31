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

  // Block wheel scroll on desktop to prevent scrolling left column
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const block = (e: WheelEvent) => {
      if (window.innerWidth > 1024) e.preventDefault();
    };
    el.addEventListener("wheel", block, { passive: false });
    return () => el.removeEventListener("wheel", block);
  }, []);

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
    <div
      ref={carouselRef}
      className={styles.carousel}
      onClick={advance}
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
            style={{ objectFit: "contain" }}
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
    </div>
  );
}

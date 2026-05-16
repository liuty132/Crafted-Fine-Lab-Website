"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import type { ProjectImage, Language } from "@/types";
import styles from "./PlanModal.module.css";

interface PlanModalProps {
  images: ProjectImage[];
  index: number | null;
  lang: Language;
  onClose: () => void;
}

export default function PlanModal({ images, index, lang, onClose }: PlanModalProps) {
  const isOpen = index !== null;
  const [current, setCurrent] = useState(index ?? 0);
  const [prevIndex, setPrevIndex] = useState(index);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [blockSizes, setBlockSizes] = useState<Array<{ w: number; h: number }>>([]);

  if (index !== prevIndex) {
    setPrevIndex(index);
    if (index !== null) setCurrent(index);
  }

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setIsVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }
    setIsVisible(false);
    const id = setTimeout(() => setIsMounted(false), 400);
    return () => clearTimeout(id);
  }, [isOpen]);

  const advance = useCallback(() => {
    if (images.length === 0) return;
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const preventScroll = (e: Event) => e.preventDefault();
      document.addEventListener("touchmove", preventScroll, { passive: false });
      document.addEventListener("wheel", preventScroll, { passive: false });
      return () => {
        document.removeEventListener("touchmove", preventScroll);
        document.removeEventListener("wheel", preventScroll);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isMounted) return;
    const el = wrapperRef.current;
    if (!el || images.length === 0) return;

    const compute = () => {
      const cW = el.clientWidth;
      const cH = el.clientHeight;
      if (cW === 0 || cH === 0) return;
      const sizes = images.map((image) => {
        const imgAspect = image.width / image.height;
        const containerAspect = cW / cH;
        if (imgAspect > containerAspect) {
          return { w: cW, h: cW / imgAspect };
        } else {
          return { w: cH * imgAspect, h: cH };
        }
      });
      setBlockSizes(sizes);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMounted, images]);

  useEffect(() => {
    if (!isOpen || images.length <= 1) return;
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
  }, [isOpen, current, images]);

  if (!isMounted) return null;

  return (
    <div
      className={`${styles.backdrop}${isVisible ? ` ${styles.open}` : ""}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.imageWrapper} ref={wrapperRef}>
        {images.map((image, i) => (
          <div
            key={i}
            className={styles.slide}
            style={{
              opacity: i === current ? 1 : 0,
              width: blockSizes[i]?.w,
              height: blockSizes[i]?.h,
              pointerEvents: i === current ? "auto" : "none",
            }}
            onClick={(e) => {
              e.stopPropagation();
              advance();
            }}
            aria-hidden={i !== current}
          >
            <Image
              src={image.src}
              alt={image.alt[lang]}
              fill
              style={{ objectFit: "contain" }}
              sizes="90vw"
              unoptimized={image.src.endsWith(".svg")}
              priority={i === current}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

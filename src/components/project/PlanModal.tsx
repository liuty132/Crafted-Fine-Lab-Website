"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { ProjectImage } from "@/types";
import type { Language } from "@/types";
import styles from "./PlanModal.module.css";

interface PlanModalProps {
  image: ProjectImage | null;
  lang: Language;
  onClose: () => void;
}

export default function PlanModal({ image, lang, onClose }: PlanModalProps) {
  const isOpen = image !== null;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      // Prevent scroll via touch and wheel without repositioning the body
      const preventScroll = (e: Event) => e.preventDefault();
      document.addEventListener("touchmove", preventScroll, { passive: false });
      document.addEventListener("wheel", preventScroll, { passive: false });
      return () => {
        document.removeEventListener("touchmove", preventScroll);
        document.removeEventListener("wheel", preventScroll);
      };
    }
  }, [isOpen]);

  if (!image) return null;

  return (
    <div
      className={`${styles.backdrop} ${styles.open}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.imageWrapper}>
        <Image
          src={image.src}
          alt={image.alt[lang]}
          fill
          style={{ objectFit: "contain" }}
          unoptimized={image.src.endsWith(".svg")}
        />
      </div>
    </div>
  );
}

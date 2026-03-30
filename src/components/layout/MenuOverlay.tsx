"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import TableOfContents from "@/components/menu/TableOfContents";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { UI } from "@/lib/ui";
import type { Project } from "@/types";
import styles from "./MenuOverlay.module.css";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  research: Project[];
}

export default function MenuOverlay({
  isOpen,
  onClose,
  projects,
  research,
}: MenuOverlayProps) {
  const { lang } = useLanguage();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);
  const [tocPaddingTop, setTocPaddingTop] = useState(0);

  const recalcOffset = useCallback(() => {
    const scrollArea = scrollAreaRef.current;
    const toc = tocRef.current;
    if (!scrollArea || !toc || window.innerWidth <= 768) {
      setTocPaddingTop(0);
      return;
    }
    const areaH = scrollArea.clientHeight;
    // Measure the inner content (TableOfContents nav), not the wrapper with padding
    const inner = toc.firstElementChild as HTMLElement | null;
    const tocH = inner ? inner.offsetHeight : toc.scrollHeight;
    const offset = Math.max(0, 0.35 * areaH - tocH / 2);
    setTocPaddingTop(offset);
  }, []);

  // ResizeObserver on the inner TOC content to react to expand/collapse height changes
  useEffect(() => {
    const toc = tocRef.current;
    const inner = toc?.firstElementChild as HTMLElement | null;
    if (!inner) return;
    const ro = new ResizeObserver(recalcOffset);
    ro.observe(inner);
    window.addEventListener("resize", recalcOffset);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalcOffset);
    };
  }, [recalcOffset]);

  // Recalculate when menu opens
  useEffect(() => {
    if (isOpen) recalcOffset();
  }, [isOpen, recalcOffset]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open (works on iOS Safari)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  return (
    <div className={`${styles.overlay}${isOpen ? ` ${styles.open}` : ""}`} role="dialog" aria-modal="true">
      <div className={styles.closeRow}>
        <button className={styles.closeButton} onClick={onClose}>
          {UI.close[lang]}
        </button>
        <Link href="/" className={styles.logoText} onClick={onClose}>
          至缮社
        </Link>
        <LanguageToggle />
      </div>

      <div ref={scrollAreaRef} className={styles.scrollArea}>
        <div ref={tocRef} className={styles.tocWrapper} style={{ paddingTop: tocPaddingTop }}>
          <TableOfContents projects={projects} research={research} onClose={onClose} isMenuOpen={isOpen} />
        </div>
      </div>
    </div>
  );
}

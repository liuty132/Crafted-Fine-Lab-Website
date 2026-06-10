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

  // Lock page scroll while the menu is open WITHOUT moving the scroll
  // position. Using overflow:hidden (instead of position:fixed) keeps the
  // document's scrollY intact, so sticky elements such as the project
  // carousel stay exactly where they are and don't shift on open/close.
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = "";
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

"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import HomepageHero from "./HomepageHero";
import TableOfContents from "@/components/menu/TableOfContents";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { UI } from "@/lib/ui";
import type { Project } from "@/types";
import styles from "./HomepageSnap.module.css";

interface Props {
  projects: Project[];
  research: Project[];
}

export default function HomepageSnap({ projects, research }: Props) {
  const { lang, fading } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const menuSectionRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const menuHeaderRef = useRef<HTMLDivElement>(null);
  const menuBodyRef = useRef<HTMLDivElement>(null);
  const tocWrapperRef = useRef<HTMLDivElement>(null);
  const [tocPaddingTop, setTocPaddingTop] = useState(0);

  const recalcOffset = useCallback(() => {
    const body = menuBodyRef.current;
    const wrapper = tocWrapperRef.current;
    if (!body || !wrapper || window.innerWidth <= 768) {
      setTocPaddingTop(0);
      return;
    }
    const areaH = body.clientHeight;
    const inner = wrapper.firstElementChild as HTMLElement | null;
    const tocH = inner ? inner.offsetHeight : wrapper.scrollHeight;
    const offset = Math.max(0, 0.35 * areaH - tocH / 2);
    setTocPaddingTop(offset);
  }, []);

  // ResizeObserver on inner TOC content for expand/collapse
  useEffect(() => {
    const wrapper = tocWrapperRef.current;
    const inner = wrapper?.firstElementChild as HTMLElement | null;
    if (!inner) return;
    const ro = new ResizeObserver(recalcOffset);
    ro.observe(inner);
    window.addEventListener("resize", recalcOffset);
    recalcOffset();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalcOffset);
    };
  }, [recalcOffset]);

  const scrollToMenu = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const maxScroll = container.scrollHeight - container.clientHeight;
    container.scrollTo({ top: maxScroll, behavior: "smooth" });
  }, []);

  const scrollToHero = useCallback(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Drive clip-path wipe from below via scroll progress
  useEffect(() => {
    const container = containerRef.current;
    const hero = heroSectionRef.current;
    const menu = menuSectionRef.current;
    if (!container || !hero || !menu) return;

    const menuOverlay = menuOverlayRef.current;
    const menuHeader = menuHeaderRef.current;

    const onScroll = () => {
      const vh = window.innerHeight;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const scrollTop = container.scrollTop;
      const progress = maxScroll > 0 ? Math.min(1, scrollTop / maxScroll) : 0;

      // Hero fades out as menu scrolls in
      hero.style.opacity = String(1 - progress);

      // Scale scroll range to full viewport clip reveal
      const revealPx = Math.min(progress * vh, vh);
      const clipTop = Math.max(0, ((vh - revealPx) / vh) * 100);
      menu.style.clipPath = `inset(${clipTop}% 0 0 0)`;

      if (menuOverlay) menuOverlay.style.opacity = String(Math.max(0, 1 - progress));

      // Fade in header as menu reveals
      if (menuHeader) {
        menuHeader.style.opacity = String(progress);
        menuHeader.style.pointerEvents = progress > 0.1 ? "auto" : "none";
      }
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // set initial state
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={styles.snapContainer} ref={containerRef}>
      {/* Section 1: Hero */}
      <section className={styles.heroSection} ref={heroSectionRef}>
        <HomepageHero onEnter={scrollToMenu} />
      </section>

      {/* Fixed header — outside menuSection so clip-path doesn't affect it */}
      <div ref={menuHeaderRef} className={styles.menuHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.closeButton} onClick={scrollToHero}>
            <span className={`${styles.closeButtonText}${fading ? ` ${styles.closeButtonTextFading}` : ""}`}>
              {UI.close[lang]}
            </span>
          </button>
        </div>
        <div className={styles.headerCenter}>
          <button className={styles.logoText} onClick={scrollToHero}>
            至缮社
          </button>
        </div>
        <div className={styles.headerRight}>
          <LanguageToggle />
        </div>
      </div>

      {/* Section 2: Menu (clip-path controlled by scroll) */}
      <section className={styles.menuSection} ref={menuSectionRef}>
        <div className={styles.scrim} ref={menuOverlayRef} />
        <div className={styles.menuHeaderSpacer} />
        <div ref={menuBodyRef} className={`${styles.menuBody}${fading ? ` ${styles.langFading}` : ""}`}>
          <div ref={tocWrapperRef} className={styles.tocWrapper} style={{ paddingTop: tocPaddingTop }}>
            <TableOfContents projects={projects} research={research} isMenuOpen={true} className={styles.tocPassthrough} />
          </div>
        </div>
      </section>
    </div>
  );
}

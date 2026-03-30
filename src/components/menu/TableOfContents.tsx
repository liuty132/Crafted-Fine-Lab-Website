"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ProjectListItem from "./ProjectListItem";
import { useLanguage } from "@/context/LanguageContext";
import { UI } from "@/lib/ui";
import type { Project } from "@/types";
import styles from "./TableOfContents.module.css";

const ITEM_HEIGHT = 88; // matches --menu-item-height in globals.css
const ITEM_HEIGHT_MOBILE = 64; // matches --menu-item-height mobile override
const ITEM_DURATION = 150; // ms, matches CSS animation duration
const TOTAL_STAGGER = 250; // ms, matches CSS stagger spread

type ExpandedSection = "projects" | "research" | null;

interface TableOfContentsProps {
  projects: Project[];
  research: Project[];
  onClose?: () => void;
  isMenuOpen?: boolean;
  className?: string;
}

export default function TableOfContents({
  projects,
  research,
  onClose,
  isMenuOpen,
  className,
}: TableOfContentsProps) {
  const { lang } = useLanguage();
  const projectsScrollRef = useRef<HTMLDivElement>(null);
  const researchScrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [projectsVisibleCount, setProjectsVisibleCount] = useState(3);
  const [researchVisibleCount, setResearchVisibleCount] = useState(3);
  const [itemHeight, setItemHeight] = useState(ITEM_HEIGHT);
  const [expanded, setExpanded] = useState<ExpandedSection>(null);
  const [closing, setClosing] = useState<ExpandedSection>(null);
  const [projectsScrollTop, setProjectsScrollTop] = useState(0);
  const [researchScrollTop, setResearchScrollTop] = useState(0);
  // Reset when menu closes
  useEffect(() => {
    if (!isMenuOpen) {
      setExpanded(null);
      setClosing(null);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    function computeCount() {
      const mobile = window.innerWidth <= 768;
      // Desktop: header (64) + scrollArea padding (64) + 4 headings (~93 each) + 3 margins (8 each) ≈ 520
      // Mobile: header (64) + scrollArea padding (16) + 4 headings (~72 each) + 0 margins ≈ 368
      const overhead = mobile ? 368 : 520;
      const itemH = mobile ? ITEM_HEIGHT_MOBILE : ITEM_HEIGHT;
      setItemHeight(itemH);
      const available = window.innerHeight - overhead;
      const count = Math.max(3, Math.floor(available / itemH));
      setProjectsVisibleCount(Math.min(count, projects.length, 8));
      setResearchVisibleCount(Math.min(count, research.length, 8));
    }
    computeCount();
    window.addEventListener("resize", computeCount);
    return () => window.removeEventListener("resize", computeCount);
  }, [projects.length, research.length]);

  const handleToggle = useCallback((section: "projects" | "research") => {
    if (expanded === section) {
      // Close current section
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setExpanded(null);
      setClosing(section);
      const totalDelay = TOTAL_STAGGER + ITEM_DURATION;
      closeTimer.current = setTimeout(() => {
        setClosing(null);
      }, totalDelay);
    } else {
      // Close other section (if any) and open this one
      setClosing(null);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setExpanded(section);
      // Reset scroll position to top when expanding
      if (section === "projects") projectsScrollRef.current?.scrollTo(0, 0);
      if (section === "research") researchScrollRef.current?.scrollTo(0, 0);
      // On mobile, scroll the newly expanded section heading into view
      if (window.innerWidth <= 768) {
        requestAnimationFrame(() => {
          const el = sectionRefs.current[section];
          const scrollParent = el?.closest('[class*="scrollArea"], [class*="menuBody"]') as HTMLElement | null;
          if (el && scrollParent) {
            const offset = el.offsetTop - scrollParent.offsetTop;
            scrollParent.scrollTo({ top: offset, behavior: "smooth" });
          }
        });
      }
    }
  }, [expanded]);

  // Clean up timer on unmount
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  // Projects scroll bar
  const pContainerH = projectsVisibleCount * itemHeight;
  const rContainerH = researchVisibleCount * itemHeight;

  // Compute target heights directly — CSS transition handles the animation
  const pAnimatedH = expanded === "projects" ? `${pContainerH}px` : "0px";
  const rAnimatedH = expanded === "research" ? `${rContainerH}px` : "0px";
  const pContentH = projects.length * itemHeight;
  const pScrollable = pContentH > pContainerH;
  const pThumbH = pScrollable ? Math.max(24, (pContainerH / pContentH) * pContainerH) : pContainerH;
  const pMaxScroll = pContentH - pContainerH;
  const pThumbTop = pMaxScroll > 0 ? (projectsScrollTop / pMaxScroll) * (pContainerH - pThumbH) : 0;

  // Research scroll bar
  const rContentH = research.length * itemHeight;
  const rScrollable = rContentH > rContainerH;
  const rThumbH = rScrollable ? Math.max(24, (rContainerH / rContentH) * rContainerH) : rContainerH;
  const rMaxScroll = rContentH - rContainerH;
  const rThumbTop = rMaxScroll > 0 ? (researchScrollTop / rMaxScroll) * (rContainerH - rThumbH) : 0;

  const isProjectsOpen = expanded === "projects";
  const isProjectsClosing = closing === "projects";
  const isResearchOpen = expanded === "research";
  const isResearchClosing = closing === "research";

  return (
    <nav className={`${styles.toc}${className ? ` ${className}` : ""}`}>
      {/* I. Projects */}
      <div className={styles.section}>
        <button
          ref={(el) => { sectionRefs.current.projects = el; }}
          className={`${styles.sectionHeading} ${styles.expandableHeading}${isProjectsOpen ? ` ${styles.expanded}` : ""}`}
          onClick={() => handleToggle("projects")}
        >
          <span className={styles.expandableText}>I. {UI.projects[lang]}</span>
          <span className={styles.arrow}>›</span>
        </button>

        <div className={styles.listContainer}>
          <div className={`${styles.scrollTrack}${isProjectsOpen ? ` ${styles.scrollTrackVisible}` : ""}`} style={{ height: pAnimatedH }}>
            <div className={styles.scrollThumb} style={{ height: `${pThumbH}px`, transform: `translateY(${pThumbTop}px)` }} />
          </div>
          <div
            ref={projectsScrollRef}
            className={`${styles.listScroll}${isProjectsOpen ? ` ${styles.open}` : ""}`}
            style={{ height: pAnimatedH }}
            onScroll={(e) => setProjectsScrollTop((e.target as HTMLElement).scrollTop)}
          >
            {projects.map((project, i) => (
              <ProjectListItem
                key={project.slug}
                project={project}
                lang={lang}
                onClick={onClose}
                index={i}
                total={projectsVisibleCount}
                isOpen={isProjectsOpen && !isProjectsClosing}
                isClosing={isProjectsClosing}
              />
            ))}
          </div>
        </div>
      </div>

      {/* II. Research */}
      <div className={styles.section}>
        <button
          ref={(el) => { sectionRefs.current.research = el; }}
          className={`${styles.sectionHeading} ${styles.expandableHeading}${isResearchOpen ? ` ${styles.expanded}` : ""}`}
          onClick={() => handleToggle("research")}
        >
          <span className={styles.expandableText}>II. {UI.research[lang]}</span>
          <span className={styles.arrow}>›</span>
        </button>

        <div className={styles.listContainer}>
          <div className={`${styles.scrollTrack}${isResearchOpen ? ` ${styles.scrollTrackVisible}` : ""}`} style={{ height: rAnimatedH }}>
            <div className={styles.scrollThumb} style={{ height: `${rThumbH}px`, transform: `translateY(${rThumbTop}px)` }} />
          </div>
          <div
            ref={researchScrollRef}
            className={`${styles.listScroll}${isResearchOpen ? ` ${styles.open}` : ""}`}
            style={{ height: rAnimatedH }}
            onScroll={(e) => setResearchScrollTop((e.target as HTMLElement).scrollTop)}
          >
            {research.map((item, i) => (
              <ProjectListItem
                key={item.slug}
                project={item}
                lang={lang}
                basePath="/research"
                onClick={onClose}
                index={i}
                total={researchVisibleCount}
                isOpen={isResearchOpen && !isResearchClosing}
                isClosing={isResearchClosing}
              />
            ))}
          </div>
        </div>
      </div>

      {/* III. About */}
      <div className={styles.section}>
        <Link href="/about" className={styles.sectionHeading} onClick={onClose}>
          <span className={styles.linkText}>III. {UI.about[lang]}</span>
        </Link>
      </div>

      {/* IV. Contact */}
      <div className={styles.section}>
        <Link href="/contact" className={styles.sectionHeading} onClick={onClose}>
          <span className={styles.linkText}>IV. {UI.contact[lang]}</span>
        </Link>
      </div>
    </nav>
  );
}

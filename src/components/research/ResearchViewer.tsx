"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { Project } from "@/types";
import styles from "./ResearchViewer.module.css";

interface ResearchViewerProps {
  research: Project;
}

type Direction = "fwd" | "back";

const FRAME_GAP = 0; // px, matches the .frame gap
// Outgoing fade (0.18s) then incoming slide/fade in (0.16s delay + 0.28s) ≈ 0.44s total.
const ANIM_MS = 450;

export default function ResearchViewer({ research }: ResearchViewerProps) {
  const { lang } = useLanguage();
  useDocumentTitle(research.title[lang]);

  const pages = useMemo(() => research.pages ?? [], [research.pages]);
  const len = pages.length;

  const [isMobile, setIsMobile] = useState(false); // SSR-safe default
  const [current, setCurrent] = useState(0); // first visible page index
  const [prev, setPrev] = useState<number | null>(null); // outgoing frame start
  const [direction, setDirection] = useState<Direction>("fwd");
  const [blockSize, setBlockSize] = useState<{ w: number; h: number } | null>(null);
  const [stageW, setStageW] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef(0);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Pages that have already loaded once — preset as loaded so a re-mounted frame
  // (e.g. the outgoing page) doesn't replay the image fade-in while fading out.
  const loadedRef = useRef<Set<string>>(new Set());

  const twoUp = !isMobile && research.desktopSpread === true;
  const step = twoUp ? 2 : 1;
  const lastFrameStart = twoUp ? Math.floor((len - 1) / 2) * 2 : len - 1;

  const framePages = useCallback(
    (start: number): number[] =>
      twoUp ? [start, start + 1].filter((i) => i < len) : [start],
    [twoUp, len]
  );

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  // Detect mobile (forces 1-up regardless of desktopSpread)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px), (max-aspect-ratio: 4/5)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Realign to an even spread boundary when entering 2-up
  useEffect(() => {
    if (twoUp && currentRef.current % 2 !== 0) {
      setCurrent(currentRef.current - 1);
    }
  }, [twoUp]);

  // Size each page block to its contained image, so the counter hugs the image's bottom-right
  useEffect(() => {
    const el = stageRef.current;
    if (!el || len === 0) return;
    const compute = () => {
      const cW = el.clientWidth;
      const cH = el.clientHeight;
      if (cW === 0 || cH === 0) return;
      setStageW(cW);
      const captionH = isMobile ? 36 : 30;
      const availH = cH - captionH;
      const availW = twoUp ? (cW - FRAME_GAP) / 2 : cW;
      const imgAspect = pages[0].width / pages[0].height;
      const containerAspect = availW / availH;
      if (imgAspect > containerAspect) {
        setBlockSize({ w: availW, h: availW / imgAspect + captionH });
      } else {
        setBlockSize({ w: availH * imgAspect, h: cH });
      }
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [twoUp, isMobile, pages, len]);

  const advance = useCallback(
    (dir: Direction) => {
      if (len <= step) return;
      const c = currentRef.current;
      const next =
        dir === "fwd"
          ? c + step >= len
            ? 0
            : c + step
          : c - step < 0
          ? lastFrameStart
          : c - step;
      if (next === c) return;
      setDirection(dir);
      setPrev(c);
      currentRef.current = next;
      setCurrent(next);
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      leaveTimer.current = setTimeout(() => setPrev(null), ANIM_MS + 20);
    },
    [len, step, lastFrameStart]
  );

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") advance("fwd");
      else if (e.key === "ArrowLeft") advance("back");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance]);

  // Pages to eagerly preload: the next two frames forward + the previous two frames
  // (the user may go backwards), minus what's already visible. Rendered as hidden
  // <Image>s below so the browser fetches the SAME Next-optimized URL/srcset the
  // visible page will request (a raw `new Image()` would warm a different URL).
  const preloadIndices = useMemo(() => {
    if (len <= step) return [];
    const nextStartOf = (c: number) => (c + step >= len ? 0 : c + step);
    const prevStartOf = (c: number) => (c - step < 0 ? lastFrameStart : c - step);
    const n1 = nextStartOf(current);
    const p1 = prevStartOf(current);
    const starts = [n1, nextStartOf(n1), p1, prevStartOf(p1)];
    const set = new Set<number>();
    starts.forEach((s) => framePages(s).forEach((i) => set.add(i)));
    framePages(current).forEach((i) => set.delete(i)); // already on screen
    return [...set];
  }, [current, step, len, lastFrameStart, framePages]);

  useEffect(() => () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);

  // Image block — slides + fades with the frame. The caption is kept as a hidden
  // spacer so the image keeps the same size as the (separate) visible counter layer.
  const renderImageBlock = (i: number) => {
    const alreadyLoaded = i === 0 || loadedRef.current.has(pages[i].src);
    return (
    <div
      key={i}
      className={`${styles.block}${alreadyLoaded ? ` ${styles.imageLoaded}` : ""}`}
      style={blockSize ? { width: blockSize.w, height: blockSize.h } : undefined}
      onClick={() => advance("fwd")}
    >
      <div className={styles.imageBox}>
        <Image
          src={pages[i].src}
          alt={pages[i].alt[lang]}
          fill
          sizes={twoUp ? "50vw" : "100vw"}
          style={{ objectFit: "contain" }}
          priority={i === 0}
          loading={i === 0 ? "eager" : "lazy"}
          onLoad={(e) => {
            loadedRef.current.add(pages[i].src);
            const block = (e.target as HTMLElement).closest(`.${styles.block}`);
            block?.classList.add(styles.imageLoaded);
          }}
        />
      </div>
      <p className={`${styles.caption} ${styles.captionSpacer}`} aria-hidden>
        {i + 1} / {len}
      </p>
    </div>
    );
  };

  // Counter block — lives in a separate overlay layer that only fades (no slide),
  // matching the project carousel. Aligned to each image's bottom-right.
  const renderCounterBlock = (i: number) => (
    <div
      key={i}
      className={styles.counterBlock}
      style={blockSize ? { width: blockSize.w, height: blockSize.h } : undefined}
    >
      <p className={styles.caption}>
        {i + 1} / {len}
      </p>
    </div>
  );

  // Side margin between the stage edge and the centered page(s) — used to keep the
  // nav arrows hugging the pages instead of sitting at the far viewer edges. In 2-up
  // mode always reserve a full spread's width (even on an odd last page, which renders
  // a single page plus an empty right half) so the arrows never shift position.
  const insetCount = twoUp ? step : framePages(current).length;
  const pageInset =
    blockSize && stageW ? Math.max(0, (stageW - insetCount * blockSize.w) / 2) : 0;

  // In 2-up mode, pad a single-page frame (odd last page) with an empty block of equal
  // width so flex-centering places the page on the left half and leaves the right empty.
  const padFrame = (nodes: React.ReactNode[]): React.ReactNode[] =>
    twoUp && nodes.length < step && blockSize
      ? [
          ...nodes,
          <div
            key="spacer"
            aria-hidden
            style={{ width: blockSize.w, height: blockSize.h }}
          />,
        ]
      : nodes;

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleBlock}>
        <h1 className={styles.projectTitle}>{research.title[lang]}</h1>
        <p className={styles.meta}>
          {research.year} — {research.location[lang]}
        </p>
      </div>

      <div
        className={styles.viewer}
        style={{ "--page-inset": `${pageInset}px` } as React.CSSProperties}
      >
        <div className={styles.stage} ref={stageRef}>
          {/* Page images — slide + fade */}
          {prev !== null && (
            <div
              className={`${styles.frame} ${styles.frameOut} ${direction === "fwd" ? styles.outFwd : styles.outBack}`}
              aria-hidden
            >
              {padFrame(framePages(prev).map(renderImageBlock))}
            </div>
          )}
          <div
            key={current}
            className={`${styles.frame} ${styles.frameIn} ${direction === "fwd" ? styles.inFwd : styles.inBack}`}
          >
            {padFrame(framePages(current).map(renderImageBlock))}
          </div>

          {/* Page counters — fade only (no slide), like the project carousel */}
          {prev !== null && (
            <div className={`${styles.frame} ${styles.counterLayer} ${styles.capOut}`} aria-hidden>
              {padFrame(framePages(prev).map(renderCounterBlock))}
            </div>
          )}
          <div
            key={`c-${current}`}
            className={`${styles.frame} ${styles.counterLayer} ${styles.capIn}`}
            aria-hidden
          >
            {padFrame(framePages(current).map(renderCounterBlock))}
          </div>
        </div>

        {/* Hidden eager preload of upcoming/previous pages for instant flips */}
        {blockSize && preloadIndices.length > 0 && (
          <div className={styles.preload} aria-hidden>
            {preloadIndices.map((i) => (
              <div
                key={i}
                className={styles.preloadBlock}
                style={{ width: blockSize.w, height: blockSize.h }}
              >
                <Image
                  src={pages[i].src}
                  alt=""
                  fill
                  sizes={twoUp ? "50vw" : "100vw"}
                  style={{ objectFit: "contain" }}
                  loading="eager"
                  onLoad={() => loadedRef.current.add(pages[i].src)}
                />
              </div>
            ))}
          </div>
        )}

        {len > step && (
          <>
            <button
              type="button"
              className={`${styles.nav} ${styles.navPrev}`}
              aria-label="Previous page"
              onClick={(e) => {
                e.stopPropagation();
                advance("back");
              }}
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.nav} ${styles.navNext}`}
              aria-label="Next page"
              onClick={(e) => {
                e.stopPropagation();
                advance("fwd");
              }}
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}

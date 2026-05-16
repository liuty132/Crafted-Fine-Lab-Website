"use client";

import { MANIFESTO } from "@/lib/ui";
import styles from "./HomepageHero.module.css";

interface HomepageHeroProps {
  onEnter: () => void;
}

export default function HomepageHero({ onEnter }: HomepageHeroProps) {
  return (
    <main className={styles.hero}>
      <div className={styles.titleBlock}>
        <h1 className={styles.studioNameZh}>至缮社</h1>
        <p className={styles.studioName}><span className={styles.studioNameAccent}>Shàn</span> Architects + Lab</p>
      </div>

      <div className={styles.slogans}>
        <p className={styles.slogan}>缮其旧，成其善</p>
        <p className={styles.slogan}>缓修细琢，止于至善</p>
      </div>

      <div className={styles.manifesto}>
        <p className={styles.manifestoZh}>{MANIFESTO.zh}</p>
        <p className={styles.manifestoEn}>{MANIFESTO.en}</p>
      </div>

      <button
        type="button"
        className={styles.scrollHint}
        onClick={onEnter}
        aria-label="Scroll to menu"
      >
        <span className={styles.caret}>↓</span>
      </button>
    </main>
  );
}

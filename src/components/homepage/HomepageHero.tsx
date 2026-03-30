"use client";

import { MANIFESTO } from "@/lib/ui";
import styles from "./HomepageHero.module.css";

interface HomepageHeroProps {
  onEnter: () => void;
}

export default function HomepageHero({ onEnter }: HomepageHeroProps) {
  return (
    <main className={styles.hero}>
      <p className={styles.studioName}>Crafted Fine Lab</p>
      <p className={styles.studioNameZh}>至缮社</p>

      <div className={styles.divider} />

      <div className={styles.manifestoWrapper}>
        <p className={styles.manifestoColumn}>{MANIFESTO.en}</p>
        <div className={styles.manifestoDivider} />
        <p className={`${styles.manifestoColumn} ${styles.zh}`}>
          {MANIFESTO.zh}
        </p>
      </div>

      <button className={styles.enterButton} onClick={onEnter}>
        <span>Enter</span>
        <span className={styles.caret}>↓</span>
      </button>
    </main>
  );
}

"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { UI } from "@/lib/ui";
import styles from "./page.module.css";

export default function AboutContent() {
  const { lang } = useLanguage();
  useDocumentTitle(UI.about[lang]);
  const paragraphs = UI.aboutDescription[lang].split("\n\n");

  return (
    <div className={styles.page}>
      <p className={styles.heading}>II. {UI.about[lang]}</p>
      <div className={styles.body}>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

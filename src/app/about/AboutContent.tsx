"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { UI } from "@/lib/ui";
import styles from "./page.module.css";

export default function AboutContent() {
  const { lang } = useLanguage();
  useDocumentTitle(UI.about[lang]);
  return (
    <div className={styles.page}>
      <p className={styles.heading}>II. {UI.about[lang]}</p>
      <p className={styles.body}>{UI.aboutDescription[lang]}</p>
    </div>
  );
}

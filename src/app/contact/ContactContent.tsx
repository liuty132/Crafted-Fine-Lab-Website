"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { UI } from "@/lib/ui";
import styles from "./page.module.css";

export default function ContactContent() {
  const { lang } = useLanguage();
  useDocumentTitle(UI.contact[lang]);
  return (
    <div className={styles.page}>
      <p className={styles.heading}>III. {UI.contact[lang]}</p>
      <div className={styles.item}>
        <p className={styles.label}>Email</p>
        <a href={`mailto:${UI.contactEmail[lang]}`} className={styles.emailLink}>
          {UI.contactEmail[lang]}
        </a>
      </div>
      <div className={styles.item}>
        <p className={styles.label}>{lang === "en" ? "Location" : "地址"}</p>
        <p className={styles.value}>{UI.contactAddress[lang]}</p>
      </div>
    </div>
  );
}

"use client";

import { useLanguage } from "@/context/LanguageContext";
import styles from "./LanguageToggle.module.css";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className={styles.toggle} data-lang={lang}>
      <button onClick={() => setLang("zh")} aria-label="切换到中文">
        中
      </button>
      <span className={styles.separator}>/</span>
      <button onClick={() => setLang("en")} aria-label="Switch to English">
        EN
      </button>
    </div>
  );
}

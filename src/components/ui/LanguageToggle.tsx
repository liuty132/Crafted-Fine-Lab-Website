"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./LanguageToggle.module.css";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Enable transition after initial language resolution
    requestAnimationFrame(() => setReady(true));
  }, []);

  return (
    <div className={styles.toggle} data-lang={lang} {...(ready ? { "data-ready": "" } : {})}>
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

"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { LocalizedString } from "@/types";
import styles from "./page.module.css";

interface AboutDocumentProps {
  heading: LocalizedString;
  body: LocalizedString;
  // Browser-tab title; falls back to the heading. Use a shorter form to avoid
  // repeating the brand when the heading already contains it (e.g. 关于至缮社).
  docTitle?: LocalizedString;
}

export default function AboutDocument({ heading, body, docTitle }: AboutDocumentProps) {
  const { lang } = useLanguage();
  useDocumentTitle((docTitle ?? heading)[lang]);
  const raw = body[lang];
  const paragraphs = raw ? raw.split("\n\n") : [];

  return (
    <div className={styles.page}>
      <p className={styles.heading}>{heading[lang]}</p>
      <div className={styles.body}>
        {paragraphs.map((p, i) =>
          p.startsWith("## ") ? (
            <h2 key={i} className={styles.sectionTitle}>{p.slice(3)}</h2>
          ) : (
            <p key={i}>{p}</p>
          )
        )}
      </div>
    </div>
  );
}

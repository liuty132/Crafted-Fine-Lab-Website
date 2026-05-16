import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

const SITE_NAME = {
  en: "Shàn Architects + Lab",
  zh: "至缮社",
} as const;

export function useDocumentTitle(pageTitle?: string) {
  const { lang } = useLanguage();
  useEffect(() => {
    const site = SITE_NAME[lang];
    const desired = pageTitle ? `${pageTitle} — ${site}` : site;
    document.title = desired;

    // Next 15 streams <title> in after hydration and overwrites it.
    // Watch <head> and re-apply whenever something else mutates the title.
    const head = document.head;
    if (!head) return;
    const observer = new MutationObserver(() => {
      if (document.title !== desired) document.title = desired;
    });
    observer.observe(head, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pageTitle, lang]);
}

import { useEffect } from "react";

const SITE_NAME = "至缮社 Crafted Fine Lab";

export function useDocumentTitle(pageTitle?: string) {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} — ${SITE_NAME}` : SITE_NAME;
  }, [pageTitle]);
}

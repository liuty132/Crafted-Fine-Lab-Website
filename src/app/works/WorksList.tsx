"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { UI } from "@/lib/ui";
import ProjectListItem from "@/components/menu/ProjectListItem";
import type { Project } from "@/types";
import styles from "./page.module.css";

export default function WorksList({ projects }: { projects: Project[] }) {
  const { lang } = useLanguage();
  useDocumentTitle(UI.projects[lang]);
  const router = useRouter();
  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => router.back()}>
        ← {UI.menu[lang]}
      </button>
      <p className={styles.heading}>I. {UI.projects[lang]}</p>
      <div className={styles.list}>
        {projects.map((project) => (
          <ProjectListItem key={project.slug} project={project} lang={lang} />
        ))}
      </div>
    </div>
  );
}

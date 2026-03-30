"use client";

import { useState, useRef, useEffect } from "react";
import ImageCarousel from "./ImageCarousel";
import PlanWaterfall from "./PlanWaterfall";
import PlanModal from "./PlanModal";
import { useLanguage } from "@/context/LanguageContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { Project, ProjectImage } from "@/types";
import styles from "./ProjectLayout.module.css";

interface ProjectLayoutProps {
  project: Project;
}

export default function ProjectLayout({ project }: ProjectLayoutProps) {
  const { lang } = useLanguage();
  const [modalImage, setModalImage] = useState<ProjectImage | null>(null);
  useDocumentTitle(project.title[lang]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  // Mobile only: track title height for carousel offset + push title off as description rises
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const title = titleRef.current;
    const desc = descRef.current;
    if (!wrapper || !title || !desc) return;

    const update = () => {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      if (!isMobile) {
        title.style.removeProperty("top");
        wrapper.style.removeProperty("--title-block-height");
        return;
      }
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const headerH = 4 * rem; // --header-height: 4rem
      const titleH = title.offsetHeight;
      // Expose title height so carousel can position itself just below
      wrapper.style.setProperty("--title-block-height", `${titleH}px`);
      const descTop = desc.getBoundingClientRect().top;
      // Once description's top enters the title zone, shrink sticky top to push title off
      const newTop = Math.min(headerH, descTop - titleH);
      title.style.top = `${newTop}px`;
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.columns}>
        {/* Title */}
        <div className={styles.titleBlock} ref={titleRef}>
          <h1 className={styles.projectTitle}>{project.title[lang]}</h1>
          <p className={styles.projectTitleZh}>{project.title.zh}</p>
          <p className={styles.meta}>
            {project.year} — {project.location[lang]}
          </p>
        </div>

        {/* Right column / mobile middle: sticky image carousel */}
        <div className={styles.rightCol}>
          <ImageCarousel images={project.carouselImages} lang={lang} />
        </div>

        {/* Description + plans */}
        <div className={styles.descBlock} ref={descRef}>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{
              __html: lang === "en" ? project.description.en : project.description.zh,
            }}
          />
          <PlanWaterfall
            images={project.planImages}
            lang={lang}
            onImageClick={setModalImage}
          />
        </div>
      </div>

      <PlanModal
        image={modalImage}
        lang={lang}
        onClose={() => setModalImage(null)}
      />
    </div>
  );
}

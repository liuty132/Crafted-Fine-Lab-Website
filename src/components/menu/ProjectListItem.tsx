import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/types";
import type { Language } from "@/types";
import styles from "./ProjectListItem.module.css";

interface ProjectListItemProps {
  project: Project;
  lang: Language;
  basePath?: string;
  onClick?: () => void;
  index?: number;
  total?: number;
  isOpen?: boolean;
  isClosing?: boolean;
}

const TOTAL_STAGGER = 0.25; // seconds — stagger spread, total with fade = 0.4s

export default function ProjectListItem({ project, lang, basePath = "/projects", onClick, index = 0, total = 1, isOpen, isClosing }: ProjectListItemProps) {
  const t = Math.max(total - 1, 1);
  const capped = Math.min(index, t);
  const delay = isClosing
    ? ((t - capped) / t) * TOTAL_STAGGER
    : (capped / t) * TOTAL_STAGGER;
  let animClass = "";
  if (isClosing) {
    animClass = styles.itemHiding;
  } else if (isOpen) {
    animClass = styles.itemVisible;
  }
  return (
    <Link
      href={`${basePath}/${project.slug}`}
      className={`${styles.item}${animClass ? ` ${animClass}` : ""}`}
      style={{ "--delay": `${delay}s` } as React.CSSProperties}
      onClick={onClick}
    >
      <span className={styles.title}>
        <span className={styles.titleInner}>{project.title[lang]}</span>
      </span>
      <Image
        src={project.thumbnail.src}
        alt={project.thumbnail.alt[lang]}
        width={project.thumbnail.width}
        height={project.thumbnail.height}
        className={styles.thumbnail}
        unoptimized={project.thumbnail.src.endsWith(".svg")}
        onLoad={(e) => (e.target as HTMLElement).classList.add(styles.thumbnailLoaded)}
      />
    </Link>
  );
}

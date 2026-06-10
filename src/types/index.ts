export type Language = "en" | "zh";

export interface LocalizedString {
  en: string;
  zh: string;
}

export interface ProjectImage {
  src: string;
  alt: LocalizedString;
  width: number;
  height: number;
}

export interface Project {
  slug: string;
  title: LocalizedString;
  /** en: rendered HTML from markdown body; zh: plain text from frontmatter */
  description: LocalizedString;
  thumbnail: ProjectImage;
  carouselImages: ProjectImage[];
  planImages: ProjectImage[];
  year: number;
  location: LocalizedString;
  /** Research only: one image per PDF page, auto-discovered from public/images/<slug>/ */
  pages?: ProjectImage[];
  /** Research only: show two pages at once on desktop (book spread). Default false. */
  desktopSpread?: boolean;
}

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import type { Project, ProjectImage } from "@/types";

const projectsDir = path.join(process.cwd(), "src/data/projects");

interface RawImageFrontmatter {
  src: string;
  alt_en: string;
  alt_zh: string;
  width: number;
  height: number;
}

function parseImage(raw: RawImageFrontmatter): ProjectImage {
  return {
    src: raw.src,
    alt: { en: raw.alt_en, zh: raw.alt_zh },
    width: raw.width,
    height: raw.height,
  };
}

async function parseProjectFile(slug: string): Promise<Project> {
  const fullPath = path.join(projectsDir, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const descriptionEn = processedContent.toString();

  return {
    slug,
    title: { en: data.title_en, zh: data.title_zh },
    description: { en: descriptionEn, zh: data.description_zh },
    thumbnail: parseImage(data.thumbnail),
    carouselImages: (data.carousel_images as RawImageFrontmatter[]).map(parseImage),
    planImages: (data.plan_images as RawImageFrontmatter[]).map(parseImage),
    year: data.year,
    location: { en: data.location_en, zh: data.location_zh },
  };
}

export async function getAllProjects(): Promise<Project[]> {
  const filenames = fs
    .readdirSync(projectsDir)
    .filter((f) => f.endsWith(".md"));
  const slugs = filenames.map((f) => f.replace(/\.md$/, ""));
  return Promise.all(slugs.map(parseProjectFile));
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    return await parseProjectFile(slug);
  } catch {
    return null;
  }
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(projectsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

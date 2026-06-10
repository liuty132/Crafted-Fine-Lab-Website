import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import type { Project, ProjectImage } from "@/types";

const researchDir = path.join(process.cwd(), "src/data/research");

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

// Build PDF pages from the `pages` list in frontmatter (each entry is a /public path).
// Listing them in the .md (rather than scanning public/ via fs) keeps Vercel's file
// tracer from bundling the whole images tree into the serverless function.
// Pages share a uniform size (page_width/page_height) and the doc title as alt text.
function buildPages(data: matter.GrayMatterFile<string>["data"]): ProjectImage[] {
  const srcs = (data.pages as string[]) ?? [];
  const width = data.page_width ?? 1275;
  const height = data.page_height ?? 1650;
  const altEn = data.page_alt_en ?? data.title_en;
  const altZh = data.page_alt_zh ?? data.title_zh;
  return srcs.map((src) => ({
    src,
    alt: { en: altEn, zh: altZh },
    width,
    height,
  }));
}

async function parseResearchFile(slug: string): Promise<Project> {
  const fullPath = path.join(researchDir, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const descriptionEn = processedContent.toString();

  return {
    slug,
    title: { en: data.title_en, zh: data.title_zh },
    description: { en: descriptionEn, zh: data.description_zh },
    thumbnail: parseImage(data.thumbnail),
    carouselImages: (data.carousel_images as RawImageFrontmatter[] || []).map(parseImage),
    planImages: (data.plan_images as RawImageFrontmatter[] || []).map(parseImage),
    year: data.year,
    location: { en: data.location_en, zh: data.location_zh },
    pages: buildPages(data),
    desktopSpread: data.desktop_spread === true,
  };
}

export async function getAllResearch(): Promise<Project[]> {
  if (!fs.existsSync(researchDir)) return [];
  const slugs = getAllResearchSlugs();
  if (slugs.length === 0) return [];
  return Promise.all(slugs.map(parseResearchFile));
}

export async function getResearchBySlug(slug: string): Promise<Project | null> {
  try {
    return await parseResearchFile(slug);
  } catch {
    return null;
  }
}

export function getAllResearchSlugs(): string[] {
  if (!fs.existsSync(researchDir)) return [];
  return fs
    .readdirSync(researchDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

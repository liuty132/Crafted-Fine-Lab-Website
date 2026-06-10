import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import type { Project, ProjectImage } from "@/types";

const researchDir = path.join(process.cwd(), "src/data/research");
const publicDir = path.join(process.cwd(), "public");

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

// Auto-discover converted PDF pages: public/images/<slug>/pdf/pdf-NN.png (uniform size from frontmatter).
function discoverPages(slug: string, data: matter.GrayMatterFile<string>["data"]): ProjectImage[] {
  const dir = path.join(publicDir, "images", slug, "pdf");
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^pdf-.*\.(png|jpe?g|webp)$/i.test(f)) // ignores .DS_Store
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const width = data.page_width ?? 1275;
  const height = data.page_height ?? 1650;
  const altEn = data.page_alt_en ?? data.title_en;
  const altZh = data.page_alt_zh ?? data.title_zh;
  return files.map((f) => ({
    src: `/images/${slug}/pdf/${f}`,
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
    pages: discoverPages(slug, data),
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

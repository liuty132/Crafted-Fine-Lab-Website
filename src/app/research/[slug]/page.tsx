import { notFound } from "next/navigation";
import { getAllResearchSlugs, getResearchBySlug } from "@/lib/research";
import ResearchViewer from "@/components/research/ResearchViewer";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllResearchSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const research = await getResearchBySlug(slug);
  if (!research) return {};
  return {
    title: `${research.title.en} — 至缮社 Shàn Architects + Lab`,
  };
}

export default async function ResearchPage({ params }: Props) {
  const { slug } = await params;
  const research = await getResearchBySlug(slug);
  if (!research) notFound();

  return <ResearchViewer research={research} />;
}

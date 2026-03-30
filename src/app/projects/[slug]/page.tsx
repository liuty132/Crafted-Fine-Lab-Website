import { notFound } from "next/navigation";
import { getAllSlugs, getProjectBySlug } from "@/lib/projects";
import ProjectLayout from "@/components/project/ProjectLayout";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title.en} — 至缮社 Crafted Fine Lab`,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return <ProjectLayout project={project} />;
}

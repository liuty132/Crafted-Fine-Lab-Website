import { getAllProjects } from "@/lib/projects";
import { getAllResearch } from "@/lib/research";
import HomepageSnap from "@/components/homepage/HomepageSnap";

export default async function HomePage() {
  const [projects, research] = await Promise.all([getAllProjects(), getAllResearch()]);
  return <HomepageSnap projects={projects} research={research} />;
}

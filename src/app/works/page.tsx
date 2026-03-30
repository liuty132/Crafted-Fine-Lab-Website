import { getAllProjects } from "@/lib/projects";
import WorksList from "./WorksList";

export default async function WorksPage() {
  const projects = await getAllProjects();
  return <WorksList projects={projects} />;
}

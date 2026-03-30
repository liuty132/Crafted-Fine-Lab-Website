import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import { getAllProjects } from "@/lib/projects";
import { getAllResearch } from "@/lib/research";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "至缮社 Crafted Fine Lab",
  description:
    "An architecture and design studio committed to thoughtful making.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projects, research] = await Promise.all([getAllProjects(), getAllResearch()]);

  return (
    <html lang="zh-CN" className={cormorant.variable}>
      <body>
        <SiteShell projects={projects} research={research}>{children}</SiteShell>
      </body>
    </html>
  );
}

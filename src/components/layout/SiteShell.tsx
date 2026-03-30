"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import MenuOverlay from "./MenuOverlay";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { MenuProvider, useMenu } from "@/context/MenuContext";
import type { Project } from "@/types";
import styles from "./SiteShell.module.css";

interface SiteShellProps {
  children: React.ReactNode;
  projects: Project[];
  research: Project[];
}

function SiteShellInner({ children, projects, research }: SiteShellProps) {
  const { isMenuOpen, openMenu, closeMenu } = useMenu();
  const { fading } = useLanguage();
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return (
    <div className={`${styles.langFade}${fading ? ` ${styles.langFading}` : ""}`}>
      {!isHomepage && <Header onMenuOpen={openMenu} />}
      {!isHomepage && <div className={`${styles.backdrop}${isMenuOpen ? ` ${styles.backdropVisible}` : ""}`} />}
      {!isHomepage && (
        <MenuOverlay
          isOpen={isMenuOpen}
          onClose={closeMenu}
          projects={projects}
          research={research}
        />
      )}
      {children}
    </div>
  );
}

export default function SiteShell({ children, projects, research }: SiteShellProps) {
  return (
    <LanguageProvider>
      <MenuProvider>
        <SiteShellInner projects={projects} research={research}>{children}</SiteShellInner>
      </MenuProvider>
    </LanguageProvider>
  );
}

"use client";

import Link from "next/link";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import { useMenu } from "@/context/MenuContext";
import { UI } from "@/lib/ui";
import styles from "./Header.module.css";

interface HeaderProps {
  onMenuOpen: () => void;
}

export default function Header({ onMenuOpen }: HeaderProps) {
  const { lang } = useLanguage();
  const { isMenuOpen, closeMenu } = useMenu();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.menuButton}
          onClick={isMenuOpen ? closeMenu : onMenuOpen}
        >
          {isMenuOpen ? UI.close[lang] : UI.menu[lang]}
        </button>
      </div>
      <div className={styles.center}>
        <Link href="/" className={styles.logoText}>
          至缮社
        </Link>
      </div>
      <div className={styles.right}>
        <LanguageToggle />
      </div>
    </header>
  );
}

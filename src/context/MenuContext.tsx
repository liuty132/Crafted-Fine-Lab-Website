"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface MenuContextValue {
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

const MenuContext = createContext<MenuContextValue>({
  isMenuOpen: false,
  openMenu: () => {},
  closeMenu: () => {},
});

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <MenuContext.Provider
      value={{
        isMenuOpen,
        openMenu: () => setIsMenuOpen(true),
        closeMenu: () => setIsMenuOpen(false),
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  return useContext(MenuContext);
}

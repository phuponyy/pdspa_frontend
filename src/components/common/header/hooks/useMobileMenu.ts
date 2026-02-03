import { useEffect, useMemo, useState } from "react";
import type { NavItem } from "../types";

export const useMobileMenu = (links: NavItem[], pathname: string) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  const filteredLinks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter((link) => link.label.toLowerCase().includes(q));
  }, [links, query]);

  return { isOpen, setIsOpen, query, setQuery, filteredLinks };
};

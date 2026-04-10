"use client";

import { useEffect, useState } from "react";

// Returns items-per-page based on viewport width and the project's Tailwind breakpoints.
// Layout:
// - Mobile (< 640px): 1 column, 5 rows => 5 items
// - Tablet (640px - 1023px): 3 columns, 2 rows => 6 items
// - Desktop (>= 1024px): 5 columns, 2 rows => 10 items
export function useItemsPerPage() {
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [columns, setColumns] = useState<number>(1);

  useEffect(() => {
    function calc() {
      const w = window.innerWidth;
      // Match the breakpoints defined in globals.css .responsive-cols
      let cols = 1;
      let rows = 5;

      if (w >= 1024) {
        // Desktop: 5 columns, 2 rows
        cols = 5;
        rows = 2;
      } else if (w >= 640) {
        // Tablet: 3 columns, 2 rows
        cols = 3;
        rows = 2;
      }
      // Mobile (< 640px): 1 column, 5 rows (default)

      setColumns(cols);
      setItemsPerPage(cols * rows);
    }

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return { itemsPerPage, columns };
}

"use client"

import { useEffect, useState } from "react"

// Returns items-per-page based on viewport width and the project's Tailwind breakpoints.
// Rules:
// - 3 columns -> 3 rows => 9 items
// - 2 columns -> 3 rows => 6 items
// - 1 column  -> 6 rows => 6 items
export function useItemsPerPage() {
  const [itemsPerPage, setItemsPerPage] = useState<number>(9)
  const [columns, setColumns] = useState<number>(3)

  useEffect(() => {
    function calc() {
      const w = window.innerWidth
      // Match the breakpoints defined in app/responsive-columns.css
      let cols = 1
      if (w >= 950) cols = 5
      else if (w >= 800) cols = 4
      else if (w >= 650) cols = 3
      else if (w >= 400) cols = 2
      else cols = 1

      // Desired layout:
      // - cols = 1 -> 5 rows (5 items)
      // - cols = 2 -> 3 rows (6 items)
      // - cols = 3 -> 2 rows (6 items)
      // - cols = 4 -> 2 rows (8 items)
      // - cols = 5 -> 2 rows (10 items)
      let rows = 2
      if (cols === 1) rows = 5
      else if (cols === 2) rows = 3

      setColumns(cols)
      setItemsPerPage(cols * rows)
    }

    calc()
    window.addEventListener("resize", calc)
    return () => window.removeEventListener("resize", calc)
  }, [])

  return { itemsPerPage, columns }
}

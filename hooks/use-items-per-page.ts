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

      // Rows: keep a reasonable number so pages aren't huge
      const rows = cols === 1 ? 6 : 2
      setColumns(cols)
      setItemsPerPage(cols * rows)
    }

    calc()
    window.addEventListener("resize", calc)
    return () => window.removeEventListener("resize", calc)
  }, [])

  return { itemsPerPage, columns }
}

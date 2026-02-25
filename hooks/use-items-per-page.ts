"use client"

import { useEffect, useState } from "react"

// Returns items-per-page based on viewport width and the project's Tailwind breakpoints.
// Rules:
// - 3 columns -> 3 rows => 9 items
// - 2 columns -> 3 rows => 6 items
// - 1 column  -> 6 rows => 6 items
export function useItemsPerPage() {
  const [itemsPerPage, setItemsPerPage] = useState<number>(9)

  useEffect(() => {
    function calc() {
      const w = window.innerWidth
      // Tailwind defaults used in this project: sm = 640, lg = 1024
      let cols = 1
      if (w >= 1024) cols = 3
      else if (w >= 640) cols = 2
      else cols = 1

      const rows = cols === 1 ? 6 : 3
      setItemsPerPage(cols * rows)
    }

    calc()
    window.addEventListener("resize", calc)
    return () => window.removeEventListener("resize", calc)
  }, [])

  return itemsPerPage
}

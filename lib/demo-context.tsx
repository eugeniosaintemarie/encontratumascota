"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

interface DemoContextType {
  isDemoMode: boolean
  activateDemoMode: () => void
  deactivateDemoMode: () => void
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  activateDemoMode: () => {},
  deactivateDemoMode: () => {},
})

const DEMO_STORAGE_KEY = "encontratumascota-demo"

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Hidratar desde sessionStorage al montar
  useEffect(() => {
    setIsDemoMode(sessionStorage.getItem(DEMO_STORAGE_KEY) === "1")
  }, [])

  const activateDemoMode = useCallback(() => {
    sessionStorage.setItem(DEMO_STORAGE_KEY, "1")
    setIsDemoMode(true)
  }, [])

  const deactivateDemoMode = useCallback(() => {
    sessionStorage.removeItem(DEMO_STORAGE_KEY)
    setIsDemoMode(false)
  }, [])

  return (
    <DemoContext.Provider value={{ isDemoMode, activateDemoMode, deactivateDemoMode }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoMode() {
  return useContext(DemoContext)
}

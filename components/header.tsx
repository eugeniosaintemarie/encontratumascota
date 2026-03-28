"use client"

import { useState, useCallback, useEffect, memo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, LogIn, Menu, Moon, Sun, User, LogOut, ExternalLink, Eye, HeartHandshake, SquareStack } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth-context"
import { SwipeExplorerModal } from "@/components/swipe-explorer-modal"

interface HeaderProps {
  isReadOnly?: boolean
}

export const Header = memo(function Header({ isReadOnly = false }: HeaderProps) {
  const {
    isAuthenticated,
    openPublicarModal,
    openAuthModal,
    openPerfilModal,
    logout,
  } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isSwipeOpen, setIsSwipeOpen] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [isDemoEnv, setIsDemoEnv] = useState(false)

  // Detect demo host on client-side (origin-based)
  useEffect(() => {
    try {
      const host = window.location.host.toLowerCase()
      const isDemo = host.includes("demo.encontratumascota.ar") || host.startsWith("localhost") || host.startsWith("127.0.0.1")
      setIsDemoEnv(isDemo)
    } catch {
      setIsDemoEnv(false)
    }
  }, [])

  const handleThemeToggle = useCallback(() => {
    setTheme(isDark ? "light" : "dark")
  }, [isDark, setTheme])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 no-underline hover:no-underline focus:no-underline active:no-underline">
            <Image src="/logo.png" alt="Encontra Tu Mascota" width={36} height={36} className="h-9 w-9 rounded-lg" />
            <span className="text-lg font-semibold text-[#D66528] dark:text-foreground">
              Encontra Tu Mascota
            </span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full px-2.5 text-[#d66528] hover:text-[#d66528]"
            onClick={() => setIsSwipeOpen(true)}
            aria-label="Abrir vista interactiva de publicaciones"
          >
            <SquareStack className="h-4 w-4" />
            Cartas
          </Button>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden sm:flex items-center gap-2">
          {!isDemoEnv && (
            <a href="https://demo.encontratumascota.ar/" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Demo
              </Button>
            </a>
          )}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-[#d66528] hover:text-[#d66528] dark:text-[#d66528] dark:hover:text-[#d66528]"
          >
            <Link href="/refugios">
              <HeartHandshake className="mr-1.5 h-4 w-4" />
              Refugios
            </Link>
          </Button>
          {isReadOnly ? (
            <Button variant="outline" size="sm" disabled className="opacity-60">
              <Eye className="mr-1.5 h-4 w-4" />
              Solo lectura
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => (isAuthenticated ? openPublicarModal() : openAuthModal())}>
              <Plus className="mr-1.5 h-4 w-4" />
              Publicar
            </Button>
          )}
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={openPerfilModal}>
              <User className="mr-1.5 h-4 w-4" />
              Mi perfil
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => openAuthModal()}>
              <LogIn className="mr-1.5 h-4 w-4" />
              Acceder
            </Button>
          )}
          <ThemeToggle />
        </nav>

        {/* Mobile hamburger menu */}
        <div className="sm:hidden">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!isDemoEnv && (
                  <>
                    <DropdownMenuItem asChild>
                      <a
                        href="https://demo.encontratumascota.ar/"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          setMenuOpen(false)
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Demo
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
              )}
              <DropdownMenuItem
                asChild
                className="text-[#d66528] focus:text-[#d66528] dark:text-[#d66528] dark:focus:text-[#d66528]"
              >
                  <Link
                    href="/refugios"
                    onClick={() => {
                      setMenuOpen(false)
                    }}
                  >
                    <HeartHandshake className="mr-2 h-4 w-4 text-current" />
                    Refugios
                  </Link>
              </DropdownMenuItem>
              {isReadOnly ? (
                <DropdownMenuItem disabled className="opacity-60">
                  <Eye className="mr-2 h-4 w-4" />
                  Solo lectura
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setMenuOpen(false)
                    isAuthenticated ? openPublicarModal() : openAuthModal()
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Publicar
                </DropdownMenuItem>
              )}
              {isAuthenticated ? (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setMenuOpen(false)
                      openPerfilModal()
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Mi perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setMenuOpen(false)
                    openAuthModal()
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Acceder
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleThemeToggle}>
                {isDark ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    Tema claro
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    Tema oscuro
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SwipeExplorerModal isOpen={isSwipeOpen} onClose={() => setIsSwipeOpen(false)} />
    </header>
  )
})

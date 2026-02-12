"use client"

import { useState, useCallback } from "react"
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
import { Plus, LogIn, Menu, Moon, Sun, User, LogOut, ArrowLeft, ExternalLink, Eye } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

interface HeaderProps {
  onPublicarClick: () => void
  onAccederClick: () => void
  isAuthenticated?: boolean
  onPerfilClick?: () => void
  onLogout?: () => void
  showBackButton?: boolean
  isDemoMode?: boolean
}

export function Header({ 
  onPublicarClick, 
  onAccederClick,
  isAuthenticated = false,
  onPerfilClick,
  onLogout,
  showBackButton = false,
  isDemoMode = false,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const handleThemeToggle = useCallback(() => {
    setTheme(isDark ? "light" : "dark")
  }, [isDark, setTheme])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Encontra Tu Mascota" width={36} height={36} className="h-9 w-9 rounded-lg" />
          <span className="text-lg font-semibold text-foreground">
            Encontra Tu Mascota
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden sm:flex items-center gap-2">
          <a href="https://encontratumascotademo.vercel.app/" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              <ExternalLink className="mr-1.5 h-4 w-4" />
              Demo
            </Button>
          </a>
          {showBackButton && (
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={onPublicarClick}>
            <Plus className="mr-1.5 h-4 w-4" />
            Publicar
          </Button>
          {isAuthenticated ? (
            isDemoMode ? (
              <>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Eye className="h-3 w-3" />
                  Demo
                </span>
                <Button variant="ghost" size="sm" onClick={onLogout}>
                  <LogOut className="mr-1.5 h-4 w-4" />
                  Salir
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={onPerfilClick}>
                <User className="mr-1.5 h-4 w-4" />
                Mi perfil
              </Button>
            )
          ) : (
            <Button variant="ghost" size="sm" onClick={onAccederClick}>
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
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <a href="https://encontratumascotademo.vercel.app/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Demo
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {showBackButton && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Volver al inicio
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={() => {
                  setMenuOpen(false)
                  onPublicarClick()
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Publicar
              </DropdownMenuItem>
              {isAuthenticated ? (
                isDemoMode ? (
                  <DropdownMenuItem
                    onClick={() => {
                      setMenuOpen(false)
                      onLogout?.()
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Salir del demo
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        setMenuOpen(false)
                        onPerfilClick?.()
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Mi perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setMenuOpen(false)
                        onLogout?.()
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesion
                    </DropdownMenuItem>
                  </>
                )
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setMenuOpen(false)
                    onAccederClick()
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
    </header>
  )
}

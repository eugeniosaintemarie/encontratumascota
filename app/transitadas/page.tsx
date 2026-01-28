"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PawPrint, ArrowLeft, Construction } from "lucide-react"

export default function TransitadasPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <PawPrint className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Encontra Tu Mascota
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
            <Construction className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Mascotas en Transito
          </h1>
          
          <p className="text-muted-foreground max-w-md mb-8">
            Esta seccion estara disponible proximamente. Aqui podras ver mascotas 
            que fueron encontradas y estan temporalmente con otra familia mientras 
            buscan a sus duenos originales.
          </p>

          <div className="bg-card border border-border rounded-lg p-6 max-w-lg mb-8">
            <h2 className="font-semibold text-foreground mb-2">Que son las mascotas transitadas?</h2>
            <p className="text-sm text-muted-foreground">
              Cuando alguien encuentra una mascota perdida pero no puede quedarse con ella 
              hasta ubicar a su familia, otra persona puede darle &quot;transito&quot; temporal. 
              Estas mascotas apareceran aqui para que sus duenos puedan encontrarlas.
            </p>
          </div>

          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>
            Encontra Tu Mascota - Plataforma colaborativa para reunir mascotas
            perdidas con sus familias
          </p>
        </div>
      </footer>
    </div>
  )
}

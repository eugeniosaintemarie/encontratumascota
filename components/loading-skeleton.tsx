"use client";

import { PawPrint } from "lucide-react";

interface LoadingSkeletonProps {
  columns?: number;
  itemsPerPage?: number;
}

export function LoadingSkeleton({
  columns = 3,
  itemsPerPage = 6,
}: LoadingSkeletonProps) {
  // Calcular solo filas completas
  const completeRows = Math.floor((itemsPerPage || 6) / (columns || 1));
  const itemsToShow = completeRows * (columns || 1);

  return (
    <div className="space-y-4">
      {/* Grid de publicaciones cargando */}
      <div className="responsive-cols">
        {Array.from({ length: itemsToShow }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="rounded-lg border border-border bg-card overflow-hidden"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {/* Imagen placeholder con patita animada */}
            <div className="relative w-full pt-[100%] bg-muted/50 overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
                <div className="relative">
                  {/* Patita animada */}
                  <PawPrint
                    className="h-16 w-16 text-muted-foreground/30 animate-bounce"
                    style={{
                      animationDelay: `${index * 0.08}s`,
                      animationDuration: "1.5s",
                    }}
                  />

                  {/* Patitas alrededor en orbita */}
                  {Array.from({ length: 3 }).map((_, orbitalIndex) => {
                    const angle = orbitalIndex * 120 * (Math.PI / 180);
                    const radius = 50;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                      <div
                        key={`orbital-${orbitalIndex}`}
                        className="absolute"
                        style={{
                          left: "50%",
                          top: "50%",
                          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                          animation: `spin 4s linear infinite`,
                          animationDelay: `${orbitalIndex * 0.3}s`,
                        }}
                      >
                        <PawPrint className="h-6 w-6 text-muted-foreground/20" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Skeleton del contenido */}
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 rounded bg-muted/40 animate-pulse" />
              <div className="h-4 w-full rounded bg-muted/40 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-muted/40 animate-pulse" />
              <div className="flex gap-2 pt-2">
                <div className="h-6 w-16 rounded-full bg-muted/40 animate-pulse" />
                <div className="h-6 w-20 rounded-full bg-muted/40 animate-pulse" />
              </div>
            </div>

            {/* Skeleton del footer */}
            <div className="border-t border-border px-4 py-3 flex justify-between items-center">
              <div className="h-4 w-20 rounded bg-muted/40 animate-pulse" />
              <div className="h-8 w-8 rounded-full bg-muted/40 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Mensaje de carga */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          <div
            className="inline-block"
            style={{
              animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
            }}
          >
            <PawPrint className="h-8 w-8 text-primary/60" />
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground animate-pulse">
          Buscando mascotas...
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: translate(
                calc(-50% + var(--x, 0)),
                calc(-50% + var(--y, 0))
              )
              rotate(0deg);
          }
          to {
            transform: translate(
                calc(-50% + var(--x, 0)),
                calc(-50% + var(--y, 0))
              )
              rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState, memo } from "react";

export const Footer = memo(function Footer() {
  const [reunidas, setReunidas] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set minimal delay to show loading state briefly, then fetch async
    const timer = setTimeout(() => {
      fetch("/api/stats", { priority: "low" } as any)
        .then((res) => res.json())
        .then((data) => {
          setReunidas(data.mascotasReunidas ?? 0);
          setIsLoading(false);
        })
        .catch(() => {
          setReunidas(0);
          setIsLoading(false);
        });
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <footer className="border-t border-border">
      <div className="bg-[#FF8A65]/10 py-4">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <p className="text-sm text-foreground flex items-center gap-2 min-h-[2.5rem] flex-wrap justify-center">
            {/* Reserve space for stat counter (CLS prevention) */}
            <span
              className="text-2xl font-bold text-[#d66528] leading-none min-w-[60px] text-center"
              aria-live="polite"
              aria-atomic="true"
            >
              {!isLoading && reunidas !== null
                ? reunidas
                : isLoading
                  ? "..."
                  : "0"}
            </span>
            <Link
              href="/reunidas"
              className="text-[#FF8A65] font-medium hover:underline"
            >
              mascotas reunidas con sus familias
            </Link>
          </p>
          <p className="text-sm text-foreground text-center sm:text-left">
            ¿No encontrás a tu mascota perdida?{" "}
            <Link href="/reunidas" className="text-[#FF8A65] font-medium">
              Fijate si fue ubicada con una familia
            </Link>
          </p>
        </div>
      </div>
      <div className="py-6 bg-background">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-foreground/60">
          <p>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeL7DnKWx8JigHW6-PIbsvAN7SbXmKwKROYLjAHnmdt0e-J7A/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="italic"
            >
              Feedback
            </a>{" "}
            | Encontra Tu Mascota |{" "}
            <a
              href="https://eugeniosaintemarie.github.io?ref=encontratumascota"
              target="_blank"
              rel="noopener noreferrer"
            >
              ∃ugenio © {new Date().getFullYear()}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
});

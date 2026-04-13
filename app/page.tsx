import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ListadoPublicaciones } from "@/components/listado-publicaciones";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main
        id="main"
        className="mx-auto max-w-7xl px-4 pt-4 pb-8"
        tabIndex={-1}
      >
        <ListadoPublicaciones />
      </main>
      <Footer />
    </div>
  );
}

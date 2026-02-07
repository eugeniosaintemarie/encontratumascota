import React from "react"
import type { Publicacion } from "@/lib/types"
import { razasLabels, especieLabels, generoLabels } from "@/lib/mock-data"
import { MapPin } from "lucide-react"

interface ShareTemplateProps {
  publicacion: Publicacion
  url: string
}

export const ShareTemplate = React.forwardRef<HTMLDivElement, ShareTemplateProps>(
  ({ publicacion, url }, ref) => {
    const { mascota } = publicacion

    return (
      <div
        ref={ref}
        id={`share-template-${publicacion.id}`}
        style={{
          width: "1080px",
          height: "1920px",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          position: "fixed",
          left: "-9999px",
          top: "0",
          zIndex: -1,
        }}
        className="font-sans text-black"
      >
        {/* Header / Title */}
        <div className="text-center mb-12">
            <h1 className="text-7xl font-black text-orange-500 uppercase tracking-tighter mb-4">
                ¡Ayúdanos a Difundir!
            </h1>
            <div className="h-2 w-48 bg-orange-500 mx-auto rounded-full" />
        </div>

        {/* Image Container */}
        <div className="relative w-full aspect-square rounded-[40px] overflow-hidden shadow-2xl mb-16 border-[12px] border-white ring-1 ring-black/5">
          <img
            src={mascota.imagenUrl}
            alt="Mascota"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>

        {/* Details Section */}
        <div className="flex flex-col gap-10 flex-grow">
          <div className="flex flex-wrap gap-6">
             <div className="bg-orange-100 text-orange-700 px-8 py-4 rounded-3xl text-4xl font-black">
                {especieLabels[mascota.especie]}
             </div>
             <div className="bg-blue-100 text-blue-700 px-8 py-4 rounded-3xl text-4xl font-black">
                {generoLabels[mascota.sexo]}
             </div>
             <div className="bg-gray-100 text-gray-700 px-8 py-4 rounded-3xl text-4xl font-black">
                {razasLabels[mascota.raza]}
             </div>
          </div>

          <div className="flex items-center gap-4 text-5xl text-gray-600 font-bold mt-4">
            <MapPin className="h-12 w-12 text-orange-500" />
            <span>{publicacion.ubicacion}</span>
          </div>

          <div className="mt-10 p-10 bg-gray-50 rounded-[40px] border-2 border-gray-100">
            <h2 className="text-5xl font-black mb-6 text-gray-800">Descripción:</h2>
            <p className="text-4xl text-gray-700 leading-relaxed italic">
              "{mascota.descripcion}"
            </p>
          </div>
        </div>

        {/* Footer with URL */}
        <div className="mt-auto pt-16 border-t-[6px] border-orange-100 text-center">
            <p className="text-4xl text-gray-500 mb-8 font-medium">Ayudanos compartiendo este posteo</p>
            <div className="bg-orange-500 text-white p-10 rounded-[30px] shadow-lg">
                <p className="text-3xl font-bold opacity-80 mb-2 uppercase tracking-widest">Ver más información en:</p>
                <p className="text-4xl font-black break-all">{url.replace(/^https?:\/\//, '')}</p>
            </div>
            <p className="mt-12 text-3xl font-black text-orange-500/40 uppercase tracking-[0.2em]">EncontraTuMascota.com.ar</p>
        </div>
      </div>
    )
  }
)

ShareTemplate.displayName = "ShareTemplate"

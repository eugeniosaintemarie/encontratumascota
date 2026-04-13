"use client";

import { useState, useRef, useCallback } from "react";
import type {
  Especie,
  Sexo,
  Raza,
  TipoPublicacion,
  Usuario,
} from "@/lib/types";
import { usePublicaciones } from "@/lib/publicaciones-context";
import { useImageUpload } from "@/hooks/use-image-upload";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useDemoSession } from "@/hooks/use-demo-session";
import {
  sanitizeText,
  sanitizeRichText,
  sanitizeEmail,
  sanitizePhone,
} from "@/lib/sanitize";
import { toast } from "sonner";

export interface PublicarFormState {
  paso: 1 | 2;
  tipoPublicacion: TipoPublicacion | null;
  especie: Especie | "";
  raza: Raza | "";
  sexo: Sexo | "";
  color: string;
  descripcion: string;
  edad: string;
  ubicacion: string;
  fechaEncuentro: string;
  contactoNombre: string;
  contactoTelefono: string;
  contactoEmail: string;
  mostrarContactoPublico: boolean;
  transitoUrgente: boolean;
}

export interface PublicarImageState {
  imageFile: File | null;
  croppedBlob: Blob | null;
  croppedPreview: string | null;
}

export interface ValidationErrors {
  imagen?: string;
  email?: string;
  telefono?: string;
}

export interface UsePublicarReturn {
  // Form state
  formState: PublicarFormState;
  imageState: PublicarImageState;
  isLoading: boolean;
  showCropEditor: boolean;

  // Actions
  setPaso: (paso: 1 | 2) => void;
  setTipoPublicacion: (tipo: TipoPublicacion | null) => void;
  setEspecie: (especie: Especie | "") => void;
  setRaza: (raza: Raza | "") => void;
  setSexo: (sexo: Sexo | "") => void;
  setColor: (color: string) => void;
  setDescripcion: (descripcion: string) => void;
  setEdad: (edad: string) => void;
  setUbicacion: (ubicacion: string) => void;
  setFechaEncuentro: (fecha: string) => void;
  setContactoNombre: (nombre: string) => void;
  setContactoTelefono: (telefono: string) => void;
  setContactoEmail: (email: string) => void;
  setMostrarContactoPublico: (mostrar: boolean) => void;
  setTransitoUrgente: (transito: boolean) => void;
  setImageFile: (file: File | null) => void;
  setShowCropEditor: (show: boolean) => void;
  setCroppedBlob: (blob: Blob | null) => void;
  setCroppedPreview: (preview: string | null) => void;

  // Validations
  validateForm: () => ValidationErrors | null;
  validateEmail: (email: string) => boolean;
  validateTelefono: (telefono: string) => boolean;

  // Submit
  handleSubmit: () => Promise<void>;
  resetForm: () => void;

  // Upload
  uploadImage: (blob: Blob, userId?: string) => Promise<string>;
  isUploadingImage: boolean;

  // Demo session
  demoUser: Usuario | null;
  userId: string | undefined;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function usePublicar(onSuccess?: () => void): UsePublicarReturn {
  const { agregarPublicacion } = usePublicaciones();
  const { uploadImage, isUploading: isUploadingImage } = useImageUpload();
  const { demoUser: rawDemoUser, userId } = useDemoSession();
  const demoUser = rawDemoUser as Usuario | null;

  const [isLoading, setIsLoading] = useState(false);
  const [showCropEditor, setShowCropEditor] = useState(false);

  // Form state
  const [paso, setPaso] = useState<1 | 2>(1);
  const [tipoPublicacion, setTipoPublicacion] =
    useState<TipoPublicacion | null>(null);
  const [especie, setEspecie] = useState<Especie | "">("");
  const [raza, setRaza] = useState<Raza | "">("");
  const [sexo, setSexo] = useState<Sexo | "">("");
  const [color, setColor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [edad, setEdad] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [fechaEncuentro, setFechaEncuentro] = useState("");
  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoTelefono, setContactoTelefono] = useState("");
  const [contactoEmail, setContactoEmail] = useState("");
  const [mostrarContactoPublico, setMostrarContactoPublico] = useState(false);
  const [transitoUrgente, setTransitoUrgente] = useState(false);

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);

  const croppedPreviewRef = useRef(croppedPreview);
  croppedPreviewRef.current = croppedPreview;

  // Validation functions
  const validateEmail = useCallback((email: string): boolean => {
    if (!email) return true;
    return EMAIL_REGEX.test(email.trim());
  }, []);

  const validateTelefono = useCallback((telefono: string): boolean => {
    if (!telefono) return true;
    const phoneNumber = parsePhoneNumberFromString(telefono, "AR");
    return phoneNumber ? phoneNumber.isValid() : false;
  }, []);

  const validateForm = useCallback((): ValidationErrors | null => {
    const errors: ValidationErrors = {};

    if (!croppedBlob) {
      errors.imagen =
        "Por favor, subí una foto de la mascota obligatoriamente.";
    }

    const email = contactoEmail?.trim();
    if (email && !validateEmail(email)) {
      errors.email = "El email de contacto no tiene un formato válido.";
    }

    const telefono = contactoTelefono?.trim();
    if (telefono && !validateTelefono(telefono)) {
      errors.telefono = "El teléfono no parece ser un número argentino válido.";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }, [
    croppedBlob,
    contactoEmail,
    contactoTelefono,
    validateEmail,
    validateTelefono,
  ]);

  const resetForm = useCallback(() => {
    setPaso(1);
    setTipoPublicacion(null);
    setEspecie("");
    setRaza("");
    setSexo("");
    setColor("");
    setDescripcion("");
    setEdad("");
    setUbicacion("");
    setFechaEncuentro("");
    setContactoNombre("");
    setContactoTelefono("");
    setContactoEmail("");
    setMostrarContactoPublico(false);
    setTransitoUrgente(false);
    setImageFile(null);
    setShowCropEditor(false);
    if (croppedPreviewRef.current) {
      URL.revokeObjectURL(croppedPreviewRef.current);
    }
    setCroppedBlob(null);
    setCroppedPreview(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!tipoPublicacion) return;

    const errors = validateForm();
    if (errors) {
      if (errors.imagen) toast.error(errors.imagen);
      if (errors.email) toast.error(errors.email);
      if (errors.telefono) toast.error(errors.telefono);
      return;
    }

    setIsLoading(true);

    try {
      // Upload image
      const finalImagenUrl = await uploadImage(
        croppedBlob!,
        userId || undefined,
      );

      // Create publication
      await agregarPublicacion({
        tipoPublicacion,
        mascota: {
          id: "",
          especie: especie as Especie,
          raza: raza as Raza,
          sexo: sexo as Sexo,
          color: sanitizeText(color),
          descripcion: sanitizeRichText(descripcion),
          edad: tipoPublicacion === "adopcion" ? sanitizeText(edad) : undefined,
          imagenUrl: finalImagenUrl,
        },
        ubicacion: sanitizeText(ubicacion),
        fechaEncuentro:
          tipoPublicacion === "perdida" || tipoPublicacion === "buscada"
            ? new Date(fechaEncuentro)
            : undefined,
        contactoNombre: sanitizeText(contactoNombre),
        contactoTelefono: sanitizePhone(contactoTelefono),
        contactoEmail: sanitizeEmail(contactoEmail),
        mostrarContactoPublico,
        usuarioId: userId || "",
        activa: true,
        transitoUrgente:
          tipoPublicacion === "perdida" ? transitoUrgente : false,
      });

      resetForm();
      onSuccess?.();
      toast.success("¡Publicación creada exitosamente!");
    } catch (error) {
      console.error("Error creando publicacion:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al crear la publicación",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    tipoPublicacion,
    validateForm,
    uploadImage,
    croppedBlob,
    userId,
    demoUser?.id,
    agregarPublicacion,
    especie,
    raza,
    sexo,
    color,
    descripcion,
    edad,
    ubicacion,
    fechaEncuentro,
    contactoNombre,
    contactoTelefono,
    contactoEmail,
    mostrarContactoPublico,
    transitoUrgente,
    resetForm,
    onSuccess,
  ]);

  return {
    // Form state
    formState: {
      paso,
      tipoPublicacion,
      especie,
      raza,
      sexo,
      color,
      descripcion,
      edad,
      ubicacion,
      fechaEncuentro,
      contactoNombre,
      contactoTelefono,
      contactoEmail,
      mostrarContactoPublico,
      transitoUrgente,
    },
    imageState: {
      imageFile,
      croppedBlob,
      croppedPreview,
    },
    isLoading,
    showCropEditor,

    // Actions
    setPaso,
    setTipoPublicacion,
    setEspecie,
    setRaza,
    setSexo,
    setColor,
    setDescripcion,
    setEdad,
    setUbicacion,
    setFechaEncuentro,
    setContactoNombre,
    setContactoTelefono,
    setContactoEmail,
    setMostrarContactoPublico,
    setTransitoUrgente,
    setImageFile,
    setShowCropEditor,
    setCroppedBlob,
    setCroppedPreview,

    // Validations
    validateForm,
    validateEmail,
    validateTelefono,

    // Submit
    handleSubmit,
    resetForm,

    // Upload
    uploadImage,
    isUploadingImage,

    // Demo session
    demoUser,
    userId,
  };
}

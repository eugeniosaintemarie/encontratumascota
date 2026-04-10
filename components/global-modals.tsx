"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { useDemoSession } from "@/hooks/use-demo-session";
import { mapNeonUser } from "@/lib/auth";

const AuthModal = dynamic(
  () => import("@/components/auth-modal").then((mod) => mod.AuthModal),
  { ssr: false },
);

const PublicarModal = dynamic(
  () => import("@/components/publicar-modal").then((mod) => mod.PublicarModal),
  { ssr: false },
);

const PerfilModal = dynamic(
  () => import("@/components/perfil-modal").then((mod) => mod.PerfilModal),
  { ssr: false },
);

export function GlobalModals() {
  const {
    authModal,
    closeAuthModal,
    isPublicarModalOpen,
    closePublicarModal,
    isPerfilModalOpen,
    closePerfilModal,
    isAuthenticated,
    requireAuth,
    pendingPublicacionId,
    clearPendingPublicacion,
    logout,
    publicacionToEdit,
  } = useAuth();

  const { user } = useDemoSession();
  const currentUser = user ? mapNeonUser(user) : null;

  const handleAuthSuccess = useCallback(() => {
    closeAuthModal();

    if (pendingPublicacionId !== null) {
      setTimeout(() => {
        const element = document.getElementById(
          `publicacion-${pendingPublicacionId}`,
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-primary", "ring-offset-2");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-primary", "ring-offset-2");
          }, 2000);
        }
        clearPendingPublicacion();
      }, 100);
    }
  }, [closeAuthModal, pendingPublicacionId, clearPendingPublicacion]);

  return (
    <>
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        initialView={authModal.initialView}
        onAuthSuccess={handleAuthSuccess}
      />

      <PublicarModal
        isOpen={isPublicarModalOpen}
        onClose={closePublicarModal}
        isAuthenticated={isAuthenticated}
        onRequireAuth={requireAuth}
        publicacionToEdit={publicacionToEdit}
      />

      <PerfilModal
        isOpen={isPerfilModalOpen}
        onClose={closePerfilModal}
        currentUser={currentUser}
        onLogout={logout}
      />
    </>
  );
}

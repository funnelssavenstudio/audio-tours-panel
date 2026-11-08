"use client";

import { useSession } from "next-auth/react";
import { Spinner } from "@heroui/react";
import EditLanguageForm from "../components/EditLanguageForm";
import { useSearchParams } from "next/navigation";

export default function EditLanguagePage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const languageCode = searchParams.get("code") || ""; // Ejemplo: ?code=es
  const languageUuid = searchParams.get("uuid") || ""; // Ejemplo: ?uuid=xxxx

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label="Cargando sesión..." />
      </div>
    );
  }

  if (
    status === "unauthenticated" ||
    !session?.user?.accessToken ||
    !languageCode ||
    !languageUuid
  ) {
    if (typeof window !== "undefined") {
      window.location.href = "/backoffice/languages";
    }
    return null;
  }

  return (
    <div className="my-8 px-4">
      <EditLanguageForm
        token={session.user.accessToken}
        languageCode={languageCode}
        languageUuid={languageUuid}
      />
    </div>
  );
}

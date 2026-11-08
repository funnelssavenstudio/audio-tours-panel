"use client";

import { useSession } from "next-auth/react";
import { Spinner } from "@heroui/react";
import CreateLanguageForm from "../components/CreateLanguageForm";

export default function CreateLanguagePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label="Cargando sesión..." />
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user?.accessToken) {
    if (typeof window !== "undefined") {
      window.location.href =
        "/login?callbackUrl=/backoffice/languages/create-language";
    }
    return null;
  }

  return (
    <div className="my-8 px-4">
      <CreateLanguageForm token={session.user.accessToken} />
    </div>
  );
}

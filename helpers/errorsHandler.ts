import { useModal } from "@/app/contexts/ModalServerError";
import { AxiosError } from "axios";
import { signOut, useSession } from "next-auth/react";
import { useCallback } from "react";

export const useErrorHandler = () => {
  const { openModal } = useModal();
  const { data: session, status } = useSession();

  return useCallback(
    (error: AxiosError | any) => {
      const message =
        typeof error?.message === "string"
          ? error.message
          : typeof error === "string"
          ? error
          : "";
      const normalizedMessage = message.toLowerCase();

      if (
        normalizedMessage.includes("phone_number") &&
        normalizedMessage.includes("not a valid phone number")
      ) {
        return "El número de teléfono no es válido";
      }

      switch (message) {
        case "Token expired":
          if (status !== "authenticated" || !session?.user?.accessToken) {
            console.warn(
              "Ignoring token expiration while auth session is still loading"
            );
            return;
          }

          signOut({ redirect: false }).finally(() => {
            window.location.href = "/login";
          });
          break;
        case "Internal server error":
          console.error("[client] Server error surfaced to user:", error);
          openModal();
          break;
        case "Error: email already exists.":
        case "email already exists":
          return "El correo ya esta registrado en nuestra base de datos";
        default:
          console.error("[client] Unhandled error:", error);
          openModal();
          break;
      }
    },
    [openModal, session?.user?.accessToken, status]
  );
};

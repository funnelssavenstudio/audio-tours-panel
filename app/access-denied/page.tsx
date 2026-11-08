"use client";

import { Icon } from "@iconify/react";
import { Link } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function AccessDenied() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-96 text-center">
      <Icon
        icon="solar:lock-keyhole-line-duotone"
        width="100"
        height="100"
        className="mb-4 mx-auto text-primary"
      />
      <h1 className="text-4xl mb-2 mx-auto font-bold">Acceso Denegado</h1>
      <p className="mx-auto">
        No tienes permiso para acceder a esta página, es posible que tu sesion
        haya caducado.
      </p>
      <p className="cursor-pointer mt-4">
        <Link
          onPress={() => router.push("/login")}
          underline="hover"
          size="sm"
          color="primary"
        >
          <Icon icon="ic:round-arrow-back-ios" className="mr-2" />
          Vuelve a iniciar sesión
        </Link>
      </p>
    </div>
  );
}

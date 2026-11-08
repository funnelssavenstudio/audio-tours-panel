"use client";

import { Icon } from "@iconify/react";
import { Link } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen max-w-96 mx-auto text-center px-4">
      <Icon
        icon="solar:magnifer-line-duotone"
        width="100"
        height="100"
        className="mb-4 mx-auto text-primary"
      />
      <h1 className="text-4xl mb-2 font-bold">404</h1>
      <p className="text-default-500">
        La página que buscas no existe o fue movida.
      </p>
      <p className="cursor-pointer mt-4">
        <Link
          onPress={() => router.push("/")}
          underline="hover"
          size="sm"
          color="primary"
        >
          <Icon icon="ic:round-arrow-back-ios" className="mr-2" />
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}

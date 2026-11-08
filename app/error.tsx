"use client";

import { useEffect } from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <Icon
        icon="solar:danger-triangle-bold-duotone"
        width="96"
        height="96"
        className="mb-4 text-danger"
      />
      <h1 className="text-3xl font-bold mb-2">Algo salió mal</h1>
      <p className="text-default-500 max-w-md mb-6">
        Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
      </p>
      <Button color="primary" onPress={reset}>
        Reintentar
      </Button>
    </div>
  );
}

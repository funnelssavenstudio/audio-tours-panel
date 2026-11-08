"use client";

import { useEffect } from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function AgentError({
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
        width="80"
        height="80"
        className="mb-4 text-danger"
      />
      <h2 className="text-2xl font-bold mb-2">
        Error al cargar tus eventos
      </h2>
      <p className="text-default-500 max-w-md mb-6">
        No pudimos cargar la información. Por favor, intenta de nuevo.
      </p>
      <Button color="primary" onPress={reset}>
        Reintentar
      </Button>
    </div>
  );
}

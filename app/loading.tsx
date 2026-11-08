import { Spinner } from "@heroui/react";

export default function GlobalLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" color="primary" label="Cargando..." />
    </div>
  );
}

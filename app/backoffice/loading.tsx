import { Spinner } from "@heroui/react";

export default function BackofficeLoading() {
  return (
    <div className="flex items-center justify-center w-full py-24">
      <Spinner size="lg" color="primary" label="Cargando..." />
    </div>
  );
}

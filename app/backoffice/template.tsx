"use client";

import { motion } from "framer-motion";

// template.tsx se remonta en cada navegacion dentro de /backoffice. Hacemos un
// fade-in suave del contenido para que el cambio de seccion se sienta natural
// (antes era un corte seco que, con el fondo oscuro, se veia como un flash).
export default function BackofficeTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

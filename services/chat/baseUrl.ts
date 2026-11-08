// Base URL de los servicios de chat.
//
// IMPORTANTE: estos endpoints NO viven en el backend Rust (process.env.API_URL),
// sino en el "backend nuevo" (Next.js desplegado aparte), igual que payroll. Hay
// que setear la variable de entorno BACKEND_NUEVO_URL en el panel (ej. en Vercel)
// apuntando al backend nuevo. Si no esta seteada, se usa el fallback de produccion.
//
// Esta funcion solo se usa del lado del servidor (server actions), por eso este
// modulo NO lleva "use server": exporta un helper sincrono, no una server action.

const FALLBACK_BASE_URL = "https://audio-tours-backend.vercel.app";

/** Construye la URL completa de un endpoint de chat del backend nuevo. */
export const chatUrl = (path: string): string => {
  const base = (process.env.BACKEND_NUEVO_URL ?? FALLBACK_BASE_URL).replace(
    /\/+$/,
    ""
  );
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

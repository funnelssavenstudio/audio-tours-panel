"use client";

import { useEffect, useMemo, useState } from "react";

import { getTours, Tour } from "@/services/tours/getTours";
import { useErrorHandler } from "@/helpers/errorsHandler";

export interface UseToursResult {
  tours: Tour[];
  // Devuelve un nombre legible para un tour del Rust (titulo en ingles, o el
  // primero disponible, o el uuid si no se encuentra).
  tourLabel: (tour: Tour) => string;
  isLoading: boolean;
}

/**
 * Trae los tours del backend Rust (public.tours) para el dropdown del alta de
 * tours de pago y para mostrar nombres legibles.
 */
export function useTours(token: string): UseToursResult {
  const handleError = useErrorHandler();
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const run = async () => {
      setLoading(true);
      try {
        const list = await getTours(token);
        setTours(list ?? []);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const tourLabel = useMemo(() => {
    return (tour: Tour): string => {
      const translations = tour.translations ?? [];
      const en = translations.find((t) => t.language_code === "en");
      const chosen = en ?? translations[0];
      return chosen?.title?.trim() || tour.uuid;
    };
  }, []);

  return { tours, tourLabel, isLoading };
}

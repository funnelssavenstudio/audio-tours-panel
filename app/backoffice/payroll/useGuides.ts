"use client";

import { useEffect, useMemo, useState } from "react";

import { getUsers, User } from "@/services/users/getUsers";
import { useErrorHandler } from "@/helpers/errorsHandler";

export interface UseGuidesResult {
  guides: User[];
  // Devuelve un nombre legible para un user_uuid (o el uuid si no se encuentra).
  guideName: (userUuid: string) => string;
  isLoading: boolean;
}

/**
 * Trae los usuarios con rol tour_guide y expone un resolvedor de nombres para
 * los items/tarifas de liquidaciones (que solo traen user_uuid).
 */
export function useGuides(token: string): UseGuidesResult {
  const handleError = useErrorHandler();
  const [guides, setGuides] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const run = async () => {
      setLoading(true);
      try {
        const users = await getUsers(token);
        const tourGuides = (users ?? []).filter((user) =>
          user.roles?.includes("tour_guide")
        );
        setGuides(tourGuides);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const byUuid = useMemo(() => {
    const map = new Map<string, User>();
    for (const guide of guides) map.set(guide.uuid, guide);
    return map;
  }, [guides]);

  const guideName = useMemo(() => {
    return (userUuid: string): string => {
      const guide = byUuid.get(userUuid);
      if (!guide) return userUuid;
      const fullName = `${guide.name ?? ""} ${guide.last_name ?? ""}`.trim();
      return fullName || guide.email || userUuid;
    };
  }, [byUuid]);

  return { guides, guideName, isLoading };
}

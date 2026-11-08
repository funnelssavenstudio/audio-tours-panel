"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { useErrorHandler } from "@/helpers/errorsHandler";

export interface UseListPageResult<T> {
  data: T[];
  isLoading: boolean;
  token: string;
  changeData: () => void;
}

export function useListPage<T>(
  fetchFn: (token: string) => Promise<T[]>
): UseListPageResult<T> {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const handleError = useErrorHandler();
  const [isLoading, setLoading] = useState(false);
  const [changeData, setChangeData] = useState(0);
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    if (!token) return;

    const run = async () => {
      setLoading(true);
      try {
        if (changeData > 0) setData([]);
        const fetched = await fetchFn(token);
        setData(fetched);
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, changeData]);

  return {
    data,
    isLoading,
    token: token ?? "",
    changeData: () => setChangeData((prev) => prev + 1),
  };
}

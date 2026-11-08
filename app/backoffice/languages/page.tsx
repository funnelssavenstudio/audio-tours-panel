"use client";

import { getLanguages, Language } from "@/services/languages/getLanguages";
import LanguagesTable from "./components/LanguagesTable";
import { useListPage } from "@/helpers/useListPage";

async function fetchAllLanguages(token: string): Promise<Language[]> {
  const [activeResult, inactiveResult] = await Promise.allSettled([
    getLanguages(token, true),
    getLanguages(token, false),
  ]);

  const activeLanguages =
    activeResult.status === "fulfilled" ? activeResult.value : [];
  const inactiveLanguages =
    inactiveResult.status === "fulfilled" ? inactiveResult.value : [];

  if (
    activeResult.status === "rejected" &&
    inactiveResult.status === "rejected"
  ) {
    throw activeResult.reason || inactiveResult.reason;
  }

  if (
    activeResult.status === "rejected" ||
    inactiveResult.status === "rejected"
  ) {
    console.warn("Partial languages fetch failure", {
      activeError:
        activeResult.status === "rejected" ? activeResult.reason : undefined,
      inactiveError:
        inactiveResult.status === "rejected"
          ? inactiveResult.reason
          : undefined,
    });
  }

  return [...activeLanguages, ...inactiveLanguages].filter(
    (language, index, arr) =>
      arr.findIndex((item) => item.uuid === language.uuid) === index
  );
}

export default function Languages() {
  const props = useListPage(fetchAllLanguages);
  return <LanguagesTable {...props} />;
}

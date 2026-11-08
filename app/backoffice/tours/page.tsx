"use client";

import { getTours } from "@/services/tours/getTours";
import ToursTable from "./components/ToursTable";
import { useListPage } from "@/helpers/useListPage";

export default function Tours() {
  const props = useListPage(getTours);
  return <ToursTable {...props} />;
}

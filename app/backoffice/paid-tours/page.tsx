"use client";

import { getPaidTours } from "@/services/paidTours/getPaidTours";
import { useListPage } from "@/helpers/useListPage";
import PaidToursTable from "./components/PaidToursTable";

export default function PaidTours() {
  const props = useListPage(getPaidTours);
  return <PaidToursTable {...props} />;
}

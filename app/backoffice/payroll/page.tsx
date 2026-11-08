"use client";

import { getPeriods } from "@/services/payroll/getPeriods";
import { useListPage } from "@/helpers/useListPage";
import PeriodsTable from "./components/PeriodsTable";

export default function Payroll() {
  const props = useListPage(getPeriods);
  return <PeriodsTable {...props} />;
}

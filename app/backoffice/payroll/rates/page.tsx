"use client";

import { getRates } from "@/services/payroll/getRates";
import { useListPage } from "@/helpers/useListPage";
import RatesTable from "./components/RatesTable";

export default function PayrollRates() {
  const props = useListPage(getRates);
  return <RatesTable {...props} />;
}

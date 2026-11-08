"use client";

import { getStops } from "@/services/stop/getStops";
import StopTable from "./components/StopTable";
import { useListPage } from "@/helpers/useListPage";

export default function Stops() {
  const props = useListPage(getStops);
  return <StopTable {...props} />;
}

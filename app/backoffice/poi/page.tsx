"use client";

import { getPois } from "@/services/poi/getPois";
import PoiTable from "./components/PoiTable";
import { useListPage } from "@/helpers/useListPage";

export default function PointsOfInterest() {
  const props = useListPage(getPois);
  return <PoiTable {...props} />;
}

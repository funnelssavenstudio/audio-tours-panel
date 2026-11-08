"use client";

import { getEvents } from "@/services/events/getEvents";
import EventsTable from "./components/EventsTable";
import { useListPage } from "@/helpers/useListPage";

export default function Events() {
  const props = useListPage(getEvents);
  return <EventsTable {...props} />;
}

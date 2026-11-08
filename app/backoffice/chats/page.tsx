"use client";

import { getRooms } from "@/services/chat/getRooms";
import { useListPage } from "@/helpers/useListPage";
import ChatsTable from "./components/ChatsTable";

export default function Chats() {
  const props = useListPage(getRooms);
  return <ChatsTable {...props} />;
}

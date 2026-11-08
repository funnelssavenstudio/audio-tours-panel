"use client";

import { Key, useCallback } from "react";
import { Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/navigation";

import DataTable from "@/app/components/DataTable";
import { ChatRoomSummary } from "@/services/chat/types";
import {
  formatDateTime,
  roomStatusColor,
  roomStatusLabel,
  truncate,
} from "../format";

const columns = [
  { uid: "tour", name: "TOUR / EVENTO" },
  { uid: "status", name: "ESTADO", sortable: true },
  { uid: "message_count", name: "MENSAJES", sortable: true },
  { uid: "last_message", name: "ULTIMO MENSAJE", sortable: true },
  { uid: "actions", name: "ACCIONES" },
];

const statusOptions = [
  { uid: "open", name: "Abierta" },
  { uid: "closed", name: "Cerrada" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "tour",
  "status",
  "message_count",
  "last_message",
  "actions",
];

const ChatsTable = ({
  data: rooms,
  isLoading,
}: {
  data: ChatRoomSummary[] | [];
  isLoading: boolean;
  token: string;
  changeData: () => void;
}) => {
  const router = useRouter();

  const renderCell = useCallback(
    (room: ChatRoomSummary, columnKey: Key) => {
      switch (columnKey) {
        case "tour":
          return (
            <div className="flex flex-col">
              <p className="text-small font-medium">
                {room.tour_title ?? "Tour sin titulo"}
              </p>
              <span className="text-tiny text-default-400">
                {room.event_uuid}
              </span>
            </div>
          );
        case "status":
          return (
            <Chip
              className="capitalize"
              color={roomStatusColor(room.status)}
              size="sm"
              variant="flat"
            >
              {roomStatusLabel(room.status)}
            </Chip>
          );
        case "message_count":
          return <span className="text-small">{room.message_count}</span>;
        case "last_message":
          return (
            <div className="flex flex-col">
              <p className="text-small">
                {truncate(room.last_message_text) || (
                  <span className="text-default-400">Sin mensajes</span>
                )}
              </p>
              <span className="text-tiny text-default-400">
                {formatDateTime(room.last_message_at)}
              </span>
            </div>
          );
        case "actions":
          return (
            <div className="relative flex justify-center">
              <Button
                size="sm"
                variant="light"
                color="primary"
                endContent={<Icon icon="solar:arrow-right-linear" width={18} />}
                onPress={() =>
                  router.push(`/backoffice/chats/${room.event_uuid}`)
                }
              >
                Abrir chat
              </Button>
            </div>
          );
        default:
          return null;
      }
    },
    [router]
  );

  const filterByText = useCallback(
    (room: ChatRoomSummary, search: string) =>
      `${room.tour_title ?? ""} ${room.event_uuid} ${
        room.last_message_text ?? ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase()),
    []
  );

  const filterByStatus = useCallback(
    (room: ChatRoomSummary, statusKey: string) => room.status === statusKey,
    []
  );

  // Valor de orden por columna (el ultimo mensaje se ordena por fecha).
  const sortValue = useCallback(
    (room: ChatRoomSummary, columnKey: string): unknown => {
      if (columnKey === "last_message") return room.last_message_at ?? "";
      return (room as unknown as Record<string, unknown>)[columnKey];
    },
    []
  );

  return (
    <DataTable<ChatRoomSummary>
      data={rooms}
      isLoading={isLoading}
      columns={columns}
      statusOptions={statusOptions}
      initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
      initialSortColumn="last_message"
      getRowKey={(room) => room.event_uuid}
      renderCell={renderCell}
      filterByText={filterByText}
      filterByStatus={filterByStatus}
      sortValue={sortValue}
      searchPlaceholder="Buscar por tour o evento..."
      ariaLabel="Tabla de conversaciones de chat"
      emptyLabel="No hay conversaciones todavia"
      totalLabel={(count) => `${count} conversaciones en total`}
    />
  );
};

export default ChatsTable;

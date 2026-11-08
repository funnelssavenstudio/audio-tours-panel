import {
  ChangeEvent,
  Dispatch,
  Key,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  // Input, // No longer needed
  Button,
  Chip,
  Pagination,
  SortDescriptor,
  Spinner,
} from "@heroui/react";
// import { Icon } from "@iconify/react/dist/iconify.js"; // No longer needed if search icon is removed

import { Event, Translation } from "@/services/events/getEvents";
import { getAgentsList } from "@/services/events/getAgentsList";
import { addAgent } from "@/services/events/addAgent";
import TourGuideCell from "./TourGuideCell";

const columns = [
  { name: "TÍTULO", uid: "translations", sortable: false },
  { name: "GUÍA TURÍSTICO", uid: "tour_guide", sortable: false },
  { name: "FECHA Y HORA", uid: "datetime", sortable: true },
  { name: "ESTADO", uid: "status", sortable: true },
  { name: "PROGRESO", uid: "progress", sortable: true },
];

const INITIAL_VISIBLE_COLUMNS = [
  "translations",
  "tour_guide",
  "datetime",
  "status",
  "progress",
];

const EventsTable = ({
  data: events,
  isLoading,
  token,
  changeData,
}: {
  data: Event[] | [];
  isLoading: boolean;
  token: string;
  changeData: Dispatch<SetStateAction<number>>;
}) => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [availableGuides, setAvailableGuides] = useState<any[]>([]);
  const [selectionState, setSelectionState] = useState<{
    eventUuid: string;
    guideUuid: string;
  } | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoadingGuideList, setIsLoadingGuideList] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "datetime",
    direction: "ascending",
  });
  const [tableRenderKey, setTableRenderKey] = useState(0);

  useEffect(() => {
    if (!token || availableGuides.length > 0) return;

    const fetchAvailableGuides = async () => {
      setIsLoadingGuideList(true);
      try {
        const guides = await getAgentsList(token);
        const dropdownItems = guides.map((guide) => ({
          key: guide.uuid,
          label: `${guide.name} ${guide.last_name}`,
        }));
        setAvailableGuides(dropdownItems);
      } catch (error) {
        console.error("Error al obtener los guías disponibles:", error);
      } finally {
        setIsLoadingGuideList(false);
      }
    };
    fetchAvailableGuides();
  }, [token, availableGuides.length]);

  useEffect(() => {
    setTableRenderKey((prev) => prev + 1);
  }, [selectionState]);

  const headerColumns = useMemo(() => {
    if (visibleColumns.size === columns.length) return columns;
    return columns.filter((column) => visibleColumns.has(column.uid));
  }, [visibleColumns]);

  const getTitleByLanguage = useCallback(
    (
      translations: Translation[],
      primaryLang: string,
      fallbackLang: string
    ): string => {
      if (!translations || translations.length === 0) {
        return "Título no disponible";
      }
      const primaryTranslation = translations.find(
        (translation) => translation.language_code === primaryLang
      );
      const fallbackTranslation = translations.find(
        (translation) => translation.language_code === fallbackLang
      );
      return (
        primaryTranslation?.title ||
        fallbackTranslation?.title ||
        translations[0]?.title ||
        "Título no disponible"
      );
    },
    []
  );

  const filteredItems = useMemo(() => {
    return [...events];
  }, [events]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Event, b: Event) => {
      const first = a[sortDescriptor.column as keyof Event];
      const second = b[sortDescriptor.column as keyof Event];
      let cmp = 0;
      if (sortDescriptor.column === "datetime") {
        const dateA = new Date(a.datetime).getTime();
        const dateB = new Date(b.datetime).getTime();
        cmp = (isNaN(dateA) ? 0 : dateA) - (isNaN(dateB) ? 0 : dateB);
      } else if (typeof first === "number" && typeof second === "number") {
        cmp = first - second;
      } else {
        const strA = String(first ?? "").toLocaleLowerCase();
        const strB = String(second ?? "").toLocaleLowerCase();
        cmp = strA.localeCompare(strB);
      }
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleAssignTourGuide = useCallback(
    async (eventUuid: string, guideUuid: string) => {
      console.log(
        `Iniciando asignación de guía ${guideUuid} al evento ${eventUuid}`
      );
      try {
        await addAgent(token, eventUuid, guideUuid);
        console.log(
          `Guía ${guideUuid} asignado correctamente al evento ${eventUuid}`
        );
        changeData((prev) => prev + 1);
      } catch (error) {
        console.error("Error asignando guía:", error);
        throw error;
      } finally {
        setSelectionState(null);
      }
    },
    [token, changeData]
  );

  const formatDateTime = useCallback((datetime: string): string => {
    try {
      const formattedDate = datetime
        ?.replace(" +00:00:00", "Z")
        .replace(" ", "T");
      const date = new Date(formattedDate);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/New_York",
      }).format(date);
    } catch (e) {
      console.error("Error formateando fecha:", datetime, e);
      return "Fecha inválida";
    }
  }, []);

  const handleSelectGuide = useCallback(
    (eventUuid: string, guideUuid: string | null) => {
      if (guideUuid) {
        setSelectionState({ eventUuid, guideUuid });
      } else {
        setSelectionState(null);
      }
    },
    []
  );

  const handleAssignGuideWrapper = useCallback(
    async (eventUuid: string, guideUuid: string) => {
      setIsAssigning(true);
      try {
        await handleAssignTourGuide(eventUuid, guideUuid);
      } catch (error) {
        // Error ya manejado en handleAssignTourGuide
      } finally {
        setIsAssigning(false);
      }
    },
    [handleAssignTourGuide]
  );

  const renderCell = useCallback(
    (
      event: Event,
      columnKey: Key,
      currentSelection: { eventUuid: string; guideUuid: string } | null,
      currentIsAssigning: boolean
    ) => {
      try {
        const cellValue = event[columnKey as keyof Event];

        switch (columnKey) {
          case "datetime":
            return <span>{formatDateTime(event.datetime)}</span>;

          case "status": {
            const isOpen = cellValue === "open";
            return (
              <Chip
                className="capitalize"
                color={isOpen ? "success" : "danger"}
                size="sm"
                variant="flat"
              >
                {isOpen ? "Abierto" : "Cerrado"}
              </Chip>
            );
          }

          case "progress": {
            let color: "warning" | "primary" | "success" = "warning";
            let text = "Pendiente";
            if (cellValue === "in_progress") {
              color = "primary";
              text = "En progreso";
            } else if (cellValue === "completed") {
              color = "success";
              text = "Completado";
            }
            return (
              <Chip
                className="capitalize"
                color={color}
                size="sm"
                variant="flat"
              >
                {text}
              </Chip>
            );
          }

          case "translations":
            if (Array.isArray(cellValue)) {
              return <span>{getTitleByLanguage(cellValue, "es", "en")}</span>;
            }
            return <span>Título no disponible</span>;

          case "tour_guide": {
            const guideData = event.tour_guide;
            if (
              guideData &&
              typeof guideData === "object" &&
              "name" in guideData &&
              "last_name" in guideData
            ) {
              return <span>{`${guideData.name} ${guideData.last_name}`}</span>;
            }

            return (
              <TourGuideCell
                event={event}
                availableGuides={availableGuides}
                isLoadingGuideList={isLoadingGuideList}
                currentSelection={currentSelection}
                currentIsAssigning={
                  currentIsAssigning &&
                  currentSelection?.eventUuid === event.uuid
                }
                onSelectGuide={handleSelectGuide}
                onAssignGuide={handleAssignGuideWrapper}
                getTitleByLanguage={getTitleByLanguage}
                formatDateTime={formatDateTime}
              />
            );
          }

          default:
            const value = cellValue as any;
            return <span>{value != null ? String(value) : "N/A"}</span>;
        }
      } catch (error) {
        console.error(
          `Error rendering cell for column ${String(columnKey)}:`,
          error
        );
        return <span>Error</span>;
      }
    },
    [
      availableGuides,
      isLoadingGuideList,
      handleSelectGuide,
      handleAssignGuideWrapper,
      getTitleByLanguage,
      formatDateTime,
    ]
  );

  const onRowsPerPageChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        {/* REMOVED: Search Input div */}
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {events.length} eventos
          </span>
          <label className="flex items-center text-default-400 text-small">
            Filas por página:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [onRowsPerPageChange, events.length, rowsPerPage]);

  const bottomContent = useMemo(() => {
    return pages > 1 ? (
      <div className="py-2 px-2 flex justify-center items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
      </div>
    ) : null;
  }, [page, pages]);

  return (
    <>
      <Table
        key={tableRenderKey}
        aria-label="Tabla de lista de eventos"
        isHeaderSticky
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        className="table-fixed"
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={isLoading ? " " : "No hay eventos"} // Adjusted message
          loadingContent={<Spinner label="Cargando eventos..." />}
          isLoading={isLoading}
          items={sortedItems}
        >
          {(item) => (
            <TableRow key={item.uuid}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(item, columnKey, selectionState, isAssigning)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default EventsTable;

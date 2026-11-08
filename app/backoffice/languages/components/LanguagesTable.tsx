import {
  ChangeEvent,
  Dispatch,
  Key,
  SetStateAction,
  useCallback,
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
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Selection,
  SortDescriptor,
  Spinner,
  Link,
  Image,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

import { capitalize } from "@/helpers/utils";
import flags from "@/data/flags.json";
import { Language } from "@/services/languages/getLanguages";
import { useErrorHandler } from "@/helpers/errorsHandler";
import { updateLanguage } from "@/services/languages/updateLanguage";

const columns = [
  { name: "NOMBRE", uid: "name" },
  { name: "CODIGO", uid: "code" },
  { name: "ESTADO", uid: "active", sortable: true },
  { name: "ACCIONES", uid: "actions" },
];

const statusOptions = [
  { name: "Activo", uid: "active" },
  { name: "Inactivo", uid: "inactive" },
];

const INITIAL_VISIBLE_COLUMNS = ["name", "code", "active", "actions"];

const LanguagesTable = ({
  data: languages,
  isLoading,
  token,
  changeData,
}: {
  data: Language[] | [];
  isLoading: boolean;
  token: string;
  changeData: () => void;
}) => {
  const handleError = useErrorHandler();

  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "title",
    direction: "ascending",
  });
  const [togglingLanguageUuid, setTogglingLanguageUuid] = useState<
    string | null
  >(null);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredLanguages = [...languages];

    if (hasSearchFilter) {
      filteredLanguages = filteredLanguages.filter((language) =>
        language.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredLanguages = filteredLanguages.filter((tour) =>
        Array.from(statusFilter).includes(tour.active ? "active" : "inactive")
      );
    }

    return filteredLanguages;
  }, [languages, hasSearchFilter, statusFilter, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: Language, b: Language) => {
      const first = a[sortDescriptor.column as keyof Language];
      const second = b[sortDescriptor.column as keyof Language];
      let cmp = 0;

      if (typeof first === "number" && typeof second === "number") {
        cmp = first < second ? -1 : first > second ? 1 : 0;
      } else if (typeof first === "string" && typeof second === "string") {
        cmp = first.localeCompare(second);
      } else if (Array.isArray(first) && Array.isArray(second)) {
        cmp = first.toString().localeCompare(second.toString());
      }

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleToggleLanguageActive = useCallback(
    async (language: Language) => {
      if (!token || togglingLanguageUuid) return;

      setTogglingLanguageUuid(language.uuid);
      try {
        await updateLanguage(token, language.uuid, {
          active: !language.active,
        });
        changeData();
      } catch (error) {
        handleError(error);
      } finally {
        setTogglingLanguageUuid(null);
      }
    },
    [changeData, handleError, token, togglingLanguageUuid]
  );

  const renderCell = useCallback((language: Language, columnKey: Key) => {
    const cellValue = language[columnKey as keyof Language];

    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">
              {cellValue || "Nombre no disponible"}
            </p>
          </div>
        );
      case "active":
        return (
          <Chip
            className="capitalize"
            color={cellValue ? "success" : "danger"}
            size="sm"
            variant="flat"
          >
            {cellValue ? "Activo" : "Inactivo"}
          </Chip>
        );
      case "code":
        return (
          <div className="flex items-center gap-2">
            <Image
              src={flags[cellValue as keyof typeof flags]}
              alt={cellValue as string}
              width={14}
            />
            <span className="text-default-600 text-small">
              {cellValue || "Código no disponible"}
            </span>
          </div>
        );
      case "actions":
        const editLanguageParams = new URLSearchParams({
          code: language.code,
          uuid: language.uuid,
        });

        return (
          <div className="relative flex items-center gap-2">
            <Link
              href={`/backoffice/languages/edit-language?${editLanguageParams.toString()}`}
            >
              <Button
                size="sm"
                isIconOnly
                radius="full"
                variant="light"
                isDisabled={togglingLanguageUuid === language.uuid}
              >
                <Icon icon="solar:pen-line-duotone" width="18" />
              </Button>
            </Link>
            <Button
              size="sm"
              isIconOnly
              radius="full"
              variant="light"
              color={language.active ? "danger" : "success"}
              isLoading={togglingLanguageUuid === language.uuid}
              onPress={() => handleToggleLanguageActive(language)}
            >
              <Icon icon="solar:power-bold" width="18" />
            </Button>
          </div>
        );
      default:
        return <>{cellValue}</>;
    }
  }, [handleToggleLanguageActive, togglingLanguageUuid]);

  const onRowsPerPageChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            variant="bordered"
            className="w-full sm:max-w-[44%]"
            placeholder="Buscar por nombre del idioma..."
            startContent={
              <Icon icon="solar:magnifer-line-duotone" width="20" height="20" />
            }
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={
                    <Icon
                      icon="solar:alt-arrow-down-line-duotone"
                      width="14"
                      height="14"
                    />
                  }
                  variant="bordered"
                >
                  Estado
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={
                    <Icon
                      icon="solar:alt-arrow-down-line-duotone"
                      width="14"
                      height="14"
                    />
                  }
                  variant="bordered"
                >
                  Columnas
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <Link href="/backoffice/languages/create-language">
            <Button
              color="secondary"
              endContent={<Icon icon="solar:clipboard-add-linear" width={20} />}
            >
              Nuevo Idioma
            </Button>
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            {languages.length} Idiomas en total
          </span>
          <label className="flex items-center text-default-400 text-small">
            Items por página:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    onSearchChange,
    statusFilter,
    visibleColumns,
    languages.length,
    onRowsPerPageChange,
    onClear,
  ]);

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
        aria-label="Languages list table"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
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
          emptyContent={"No hay idiomas en el sistema"}
          loadingContent={<Spinner />}
          isLoading={isLoading}
          items={sortedItems}
        >
          {(item) => (
            <TableRow key={item.uuid}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

export default LanguagesTable;

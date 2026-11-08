"use client";

import {
  ChangeEvent,
  Key,
  ReactNode,
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
  Pagination,
  Selection,
  SortDescriptor,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

import { capitalize } from "@/helpers/utils";

export interface DataTableColumn {
  uid: string;
  name: string;
  sortable?: boolean;
}

export interface DataTableStatusOption {
  uid: string;
  name: string;
}

export interface DataTableProps<T> {
  data: T[];
  isLoading: boolean;
  columns: readonly DataTableColumn[];
  statusOptions: readonly DataTableStatusOption[];
  initialVisibleColumns: readonly string[];
  initialSortColumn: string;
  getRowKey: (item: T) => Key;
  renderCell: (item: T, columnKey: Key) => ReactNode;
  filterByText: (item: T, search: string) => boolean;
  filterByStatus?: (item: T, statusKey: string) => boolean;
  sortValue?: (item: T, columnKey: string) => unknown;
  searchPlaceholder?: string;
  ariaLabel: string;
  emptyLabel: string;
  totalLabel: (count: number) => string;
  topRightAction?: ReactNode;
}

function defaultSortValue<T>(item: T, columnKey: string): unknown {
  return (item as Record<string, unknown>)[columnKey];
}

function defaultStatusFilter(item: unknown, statusKey: string): boolean {
  const active = (item as { active?: boolean }).active;
  return active ? statusKey === "active" : statusKey === "inactive";
}

export function DataTable<T>({
  data,
  isLoading,
  columns,
  statusOptions,
  initialVisibleColumns,
  initialSortColumn,
  getRowKey,
  renderCell,
  filterByText,
  filterByStatus,
  sortValue = defaultSortValue,
  searchPlaceholder = "Buscar por nombre...",
  ariaLabel,
  emptyLabel,
  totalLabel,
  topRightAction,
}: DataTableProps<T>) {
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(initialVisibleColumns)
  );
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: initialSortColumn,
    direction: "ascending",
  });

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo<DataTableColumn[]>(() => {
    if (visibleColumns === "all") return [...columns];
    return columns.filter((c) => Array.from(visibleColumns).includes(c.uid));
  }, [visibleColumns, columns]);

  const filteredItems = useMemo(() => {
    let filtered = [...data];
    if (hasSearchFilter) {
      filtered = filtered.filter((item) => filterByText(item, filterValue));
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      const statusFn =
        filterByStatus ??
        (defaultStatusFilter as (item: T, key: string) => boolean);
      filtered = filtered.filter((item) =>
        Array.from(statusFilter).some((key) => statusFn(item, String(key)))
      );
    }
    return filtered;
  }, [
    data,
    hasSearchFilter,
    statusFilter,
    filterValue,
    filterByText,
    filterByStatus,
    statusOptions.length,
  ]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = sortValue(a, String(sortDescriptor.column));
      const second = sortValue(b, String(sortDescriptor.column));
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
  }, [items, sortDescriptor, sortValue]);

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
            placeholder={searchPlaceholder}
            startContent={
              <Icon
                icon="solar:magnifer-line-duotone"
                width="20"
                height="20"
              />
            }
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            {statusOptions.length > 0 && (
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
            )}
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
          {topRightAction}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            {totalLabel(data.length)}
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
    searchPlaceholder,
    filterValue,
    onSearchChange,
    statusFilter,
    statusOptions,
    visibleColumns,
    columns,
    topRightAction,
    data.length,
    totalLabel,
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
    <Table
      aria-label={ariaLabel}
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
        emptyContent={emptyLabel}
        loadingContent={<Spinner />}
        isLoading={isLoading}
        items={sortedItems}
      >
        {(item) => (
          <TableRow key={getRowKey(item)}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default DataTable;

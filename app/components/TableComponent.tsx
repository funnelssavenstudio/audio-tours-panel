import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  Link,
} from "@heroui/react";

type TableComponentProps = {
  data: any[];
  isLoading: boolean;
};

export default function TableComponent({
  data,
  isLoading,
}: TableComponentProps) {
  const [filterValue, setFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterApplied, setFilterApplied] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const rowsPerPage = 15;

  console.log("data", data);

  const handlePageChange = async (newPage: number) => {
    setPage(newPage);
    setFilterApplied(false);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      setFilterValue(event.target.value);
      setPage(1);
    }, 1000);

    setTypingTimeout(timeout);
  };

  const handleFilterClick = async () => {
    setFilterApplied(true);
    setPage(1);
  };

  return (
    (<div className="w-full">
      {/* <div className="flex items-center justify-start gap-2 pb-4">
        <Input
          placeholder="Filter by name"
          onChange={handleFilterChange}
          className="w-80"
        />
        <Button onClick={handleFilterClick} color="primary" size="lg">Filter</Button>
      </div> */}
      <Table
        aria-label="Example table with client side pagination"
        bottomContent={
          data ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={totalPages}
                onChange={handlePageChange}
              />
            </div>
          ) : null
        }
      >
        <TableHeader>
          <TableColumn key="name">Name</TableColumn>
          <TableColumn key="height">Height</TableColumn>
          <TableColumn key="mass">Mass</TableColumn>
          <TableColumn key="birth_year">Birth year</TableColumn>
          <TableColumn key="actions">Actions</TableColumn>
        </TableHeader>
        <TableBody
          items={data ? data : []}
          emptyContent={"No hay items para mostrar."}
          loadingContent={<Spinner />}
          isLoading={isLoading}
        >
          {(item) => (
            <TableRow key={item?.name}>
              {(columnKey) => (
                <TableCell key={columnKey}>
                  {columnKey !== "actions" ? (
                    item[columnKey]
                  ) : (
                    <Link
                      href={`/users/${item.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      <a>{item.name}</a>
                    </Link>
                  )}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>)
  );
}

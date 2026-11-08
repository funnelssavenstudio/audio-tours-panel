"use client";

import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import CountUp from "react-countup";

import { langs } from "@/data/language";

const BackOfficeHome: React.FC = () => {
  const totalTickets = 3890;
  const newUsers = 1780;
  const totalTours = 516;

  const topTours = [
    { key: 1, name: "Tour contrastes VIP", tickets: 289 },
    { key: 2, name: "Washington y filadelfia", tickets: 178 },
    { key: 3, name: "Panorámicas de New York", tickets: 92 },
    { key: 4, name: "Tour contrastes VIP", tickets: 289 },
    { key: 5, name: "Washington y filadelfia", tickets: 178 },
    { key: 6, name: "Panorámicas de New York", tickets: 92 },
    { key: 7, name: "Tour contrastes VIP", tickets: 289 },
    { key: 8, name: "Washington y filadelfia", tickets: 178 },
    { key: 9, name: "Panorámicas de New York", tickets: 92 },
  ];

  const columnsTours = [
    {
      key: "name",
      label: "Nombre del tour",
      icon: "solar:bus-line-duotone",
    },
    {
      key: "tickets",
      label: "Total de tickets",
      icon: "solar:ticket-sale-line-duotone",
    },
  ];

  const columnsLanguage = [
    {
      key: "name",
      label: "Idioma",
      icon: "solar:globus-outline",
    },
    {
      key: "views",
      label: "Visualizaciones",
      icon: "solar:eye-line-duotone",
    },
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="inline-flex items-center rounded-medium border-small border-divider p-4">
          <Icon
            icon="solar:ticket-sale-line-duotone"
            width={50}
            className="text-primary flex-shrink-0"
          />
          <Divider orientation="vertical" className="mx-4" />
          <div>
            <CountUp className="font-bold text-3xl" end={totalTickets} />
            <p>Total tickets</p>
          </div>
        </div>
        <div className="inline-flex items-center rounded-medium border-small border-divider p-4">
          <Icon
            icon="solar:users-group-rounded-line-duotone"
            width={50}
            className="text-primary flex-shrink-0"
          />
          <Divider orientation="vertical" className="mx-4" />
          <div>
            <CountUp className="font-bold text-3xl" end={newUsers} />
            <p className="text-md">Total usuarios</p>
          </div>
        </div>
        <div className="inline-flex items-center rounded-medium border-small border-divider p-4">
          <Icon
            icon="solar:bus-line-duotone"
            width={50}
            className="text-primary flex-shrink-0"
          />
          <Divider orientation="vertical" className="mx-4" />
          <div>
            <CountUp className="font-bold text-3xl" end={totalTours} />
            <p className="text-md">Total tours</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-4">
          <h2>Tours más vistos</h2>
          <Table
            removeWrapper
            selectionMode="single"
            className="rounded-medium border-small border-divider p-4 custom-table"
          >
            <TableHeader columns={columnsTours}>
              {(column) => (
                <TableColumn key={column.key}>
                  <div className="flex items-center gap-2">
                    <Icon icon={column.icon} width={18} />
                    <p>{column.label}</p>
                  </div>
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={topTours}>
              {(item) => (
                <TableRow key={item.key}>
                  {(columnKey) => (
                    <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-4">
          <h2>Idiomas populares</h2>
          <Table
            removeWrapper
            selectionMode="single"
            className="rounded-medium border-small border-divider p-4"
          >
            <TableHeader columns={columnsLanguage}>
              {(column) => (
                <TableColumn key={column.key}>
                  <div className="flex items-center gap-2">
                    <Icon icon={column.icon} width={18} />
                    <p>{column.label}</p>
                  </div>
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={langs}>
              {(item) => (
                <TableRow key={item.key}>
                  {(columnKey) => (
                    <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default BackOfficeHome;

"use client";

import { Key, useCallback, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/navigation";

import DataTable from "@/app/components/DataTable";
import { PayrollPeriod } from "@/services/payroll/types";
import { createPeriod } from "@/services/payroll/createPeriod";
import { useErrorHandler } from "@/helpers/errorsHandler";
import {
  formatDate,
  periodStatusColor,
  periodStatusLabel,
} from "../format";

const columns = [
  { uid: "range", name: "QUINCENA" },
  { uid: "start_date", name: "DESDE", sortable: true },
  { uid: "end_date", name: "HASTA", sortable: true },
  { uid: "status", name: "ESTADO", sortable: true },
  { uid: "actions", name: "ACCIONES" },
];

const statusOptions = [
  { uid: "open", name: "Abierto" },
  { uid: "calculated", name: "Calculado" },
  { uid: "paid", name: "Pagado" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "range",
  "start_date",
  "end_date",
  "status",
  "actions",
];

const PeriodsTable = ({
  data: periods,
  isLoading,
  token,
  changeData,
}: {
  data: PayrollPeriod[] | [];
  isLoading: boolean;
  token: string;
  changeData: () => void;
}) => {
  const router = useRouter();
  const handleError = useErrorHandler();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setFormError("");
  }, []);

  const onCreate = async (onClose: () => void) => {
    if (!token) return;
    setFormError("");

    if (!startDate || !endDate) {
      setFormError("Completa las fechas desde y hasta.");
      return;
    }
    if (startDate > endDate) {
      setFormError("La fecha desde no puede ser posterior a la fecha hasta.");
      return;
    }

    setIsSaving(true);
    try {
      await createPeriod(token, startDate, endDate);
      resetForm();
      onClose();
      changeData();
    } catch (error) {
      handleError(error);
      setFormError("No se pudo crear el periodo. Revisa las fechas.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderCell = useCallback(
    (period: PayrollPeriod, columnKey: Key) => {
      switch (columnKey) {
        case "range":
          return (
            <p className="text-bold text-small">
              {formatDate(period.start_date)} - {formatDate(period.end_date)}
            </p>
          );
        case "start_date":
          return <span className="text-small">{formatDate(period.start_date)}</span>;
        case "end_date":
          return <span className="text-small">{formatDate(period.end_date)}</span>;
        case "status":
          return (
            <Chip
              className="capitalize"
              color={periodStatusColor(period.status)}
              size="sm"
              variant="flat"
            >
              {periodStatusLabel(period.status)}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex justify-center">
              <Button
                size="sm"
                variant="light"
                color="primary"
                endContent={<Icon icon="solar:arrow-right-linear" width={18} />}
                onPress={() => router.push(`/backoffice/payroll/${period.uuid}`)}
              >
                Ver detalle
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
    (period: PayrollPeriod, search: string) =>
      `${period.start_date} ${period.end_date}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    []
  );

  const filterByStatus = useCallback(
    (period: PayrollPeriod, statusKey: string) => period.status === statusKey,
    []
  );

  return (
    <>
      <DataTable<PayrollPeriod>
        data={periods}
        isLoading={isLoading}
        columns={columns}
        statusOptions={statusOptions}
        initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
        initialSortColumn="start_date"
        getRowKey={(period) => period.uuid}
        renderCell={renderCell}
        filterByText={filterByText}
        filterByStatus={filterByStatus}
        searchPlaceholder="Buscar por fecha..."
        ariaLabel="Tabla de quincenas de liquidacion"
        emptyLabel="No hay quincenas registradas"
        totalLabel={(count) => `${count} quincenas en total`}
        topRightAction={
          <div className="flex gap-3">
            <Button
              variant="bordered"
              endContent={<Icon icon="solar:wallet-money-outline" width={20} />}
              onPress={() => router.push("/backoffice/payroll/rates")}
            >
              Tarifas de guias
            </Button>
            <Button
              color="secondary"
              endContent={<Icon icon="solar:clipboard-add-linear" width={20} />}
              onPress={() => {
                resetForm();
                onOpen();
              }}
            >
              Crear periodo
            </Button>
          </div>
        }
      />

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h5 className="text-lg">Crear quincena</h5>
              </ModalHeader>
              <ModalBody>
                <p className="text-tiny text-default-500">
                  Define el rango de fechas de la quincena. El periodo se crea
                  abierto y luego podras calcular la liquidacion desde su
                  detalle.
                </p>
                <Input
                  type="date"
                  variant="bordered"
                  label="Desde"
                  labelPlacement="outside"
                  value={startDate}
                  onValueChange={setStartDate}
                />
                <Input
                  type="date"
                  variant="bordered"
                  label="Hasta"
                  labelPlacement="outside"
                  value={endDate}
                  onValueChange={setEndDate}
                />
                {formError && (
                  <p className="text-danger text-tiny">{formError}</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  isLoading={isSaving}
                  isDisabled={isSaving}
                  onPress={() => onCreate(onClose)}
                >
                  Crear periodo
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default PeriodsTable;

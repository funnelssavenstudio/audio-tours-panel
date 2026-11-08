"use client";

import { Key, useCallback, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

import DataTable from "@/app/components/DataTable";
import { GuideRate } from "@/services/payroll/types";
import { upsertRate } from "@/services/payroll/upsertRate";
import { useErrorHandler } from "@/helpers/errorsHandler";
import { useGuides } from "../../useGuides";
import { formatDate, formatMoney } from "../../format";

const columns = [
  { uid: "guide", name: "GUIA" },
  { uid: "amount_per_tour", name: "MONTO POR TOUR", sortable: true },
  { uid: "currency", name: "MONEDA" },
  { uid: "valid_from", name: "VIGENTE DESDE", sortable: true },
  { uid: "actions", name: "ACCIONES" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "guide",
  "amount_per_tour",
  "currency",
  "valid_from",
  "actions",
];

const CURRENCIES = ["usd", "ars"];

const today = () => new Date().toISOString().slice(0, 10);

interface RateForm {
  userUuid: string;
  amount: string;
  currency: string;
  validFrom: string;
}

const emptyForm = (): RateForm => ({
  userUuid: "",
  amount: "",
  currency: "usd",
  validFrom: today(),
});

const RatesTable = ({
  data: rates,
  isLoading,
  token,
  changeData,
}: {
  data: GuideRate[] | [];
  isLoading: boolean;
  token: string;
  changeData: () => void;
}) => {
  const handleError = useErrorHandler();
  const { guides, guideName } = useGuides(token);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [form, setForm] = useState<RateForm>(emptyForm());
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const openCreate = useCallback(() => {
    setForm(emptyForm());
    setIsEditing(false);
    setFormError("");
    onOpen();
  }, [onOpen]);

  const openEdit = useCallback(
    (rate: GuideRate) => {
      setForm({
        userUuid: rate.user_uuid,
        amount: (rate.amount_per_tour / 100).toString(),
        currency: rate.currency || "usd",
        validFrom: rate.valid_from ? rate.valid_from.slice(0, 10) : today(),
      });
      setIsEditing(true);
      setFormError("");
      onOpen();
    },
    [onOpen]
  );

  const onSave = async (onClose: () => void) => {
    if (!token) return;
    setFormError("");

    if (!form.userUuid) {
      setFormError("Selecciona un guia.");
      return;
    }
    const amountValue = Number(form.amount);
    if (!form.amount || Number.isNaN(amountValue) || amountValue < 0) {
      setFormError("Ingresa un monto por tour valido (mayor o igual a 0).");
      return;
    }
    if (!form.validFrom) {
      setFormError("Ingresa la fecha de vigencia.");
      return;
    }

    setIsSaving(true);
    try {
      await upsertRate(token, {
        userUuid: form.userUuid,
        // Se envia en centavos (unidad minima de la moneda).
        amountPerTour: Math.round(amountValue * 100),
        currency: form.currency,
        validFrom: form.validFrom,
      });
      onClose();
      changeData();
    } catch (error) {
      handleError(error);
      setFormError("No se pudo guardar la tarifa.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderCell = useCallback(
    (rate: GuideRate, columnKey: Key) => {
      switch (columnKey) {
        case "guide":
          return (
            <p className="text-bold text-small">{guideName(rate.user_uuid)}</p>
          );
        case "amount_per_tour":
          return (
            <span className="text-small">
              {formatMoney(rate.amount_per_tour, rate.currency)}
            </span>
          );
        case "currency":
          return (
            <span className="text-small uppercase">{rate.currency}</span>
          );
        case "valid_from":
          return (
            <span className="text-small">{formatDate(rate.valid_from)}</span>
          );
        case "actions":
          return (
            <div className="relative flex justify-center">
              <Button
                size="sm"
                variant="light"
                color="primary"
                startContent={<Icon icon="solar:pen-line-duotone" width={16} />}
                onPress={() => openEdit(rate)}
              >
                Editar
              </Button>
            </div>
          );
        default:
          return null;
      }
    },
    [guideName, openEdit]
  );

  const filterByText = useCallback(
    (rate: GuideRate, search: string) =>
      guideName(rate.user_uuid).toLowerCase().includes(search.toLowerCase()),
    [guideName]
  );

  return (
    <>
      <DataTable<GuideRate>
        data={rates}
        isLoading={isLoading}
        columns={columns}
        statusOptions={[]}
        initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
        initialSortColumn="valid_from"
        getRowKey={(rate) => rate.uuid}
        renderCell={renderCell}
        filterByText={filterByText}
        searchPlaceholder="Buscar por guia..."
        ariaLabel="Tabla de tarifas de guias"
        emptyLabel="No hay tarifas cargadas"
        totalLabel={(count) => `${count} tarifas en total`}
        topRightAction={
          <Button
            color="secondary"
            endContent={<Icon icon="solar:clipboard-add-linear" width={20} />}
            onPress={openCreate}
          >
            Nueva tarifa
          </Button>
        }
      />

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h5 className="text-lg">
                  {isEditing ? "Editar tarifa" : "Nueva tarifa"}
                </h5>
              </ModalHeader>
              <ModalBody className="gap-4">
                <Select
                  variant="bordered"
                  label="Guia"
                  labelPlacement="outside"
                  placeholder="Selecciona un guia"
                  isDisabled={isEditing}
                  selectedKeys={form.userUuid ? [form.userUuid] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    setForm((prev) => ({
                      ...prev,
                      userUuid: value ? String(value) : "",
                    }));
                  }}
                >
                  {guides.map((guide) => (
                    <SelectItem key={guide.uuid} value={guide.uuid}>
                      {`${guide.name ?? ""} ${guide.last_name ?? ""}`.trim() ||
                        guide.email}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  variant="bordered"
                  label="Monto por tour"
                  labelPlacement="outside"
                  placeholder="0.00"
                  value={form.amount}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, amount: value }))
                  }
                />
                <Select
                  variant="bordered"
                  label="Moneda"
                  labelPlacement="outside"
                  selectedKeys={[form.currency]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    setForm((prev) => ({
                      ...prev,
                      currency: value ? String(value) : "usd",
                    }));
                  }}
                >
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency.toUpperCase()}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  type="date"
                  variant="bordered"
                  label="Vigente desde"
                  labelPlacement="outside"
                  value={form.validFrom}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, validFrom: value }))
                  }
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
                  onPress={() => onSave(onClose)}
                >
                  Guardar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default RatesTable;

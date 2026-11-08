"use client";

import { Key, useCallback, useMemo, useState } from "react";
import {
  Button,
  Chip,
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
import { PaidTour } from "@/services/paidTours/types";
import { createPaidTour } from "@/services/paidTours/createPaidTour";
import { updatePaidTour } from "@/services/paidTours/updatePaidTour";
import { useErrorHandler } from "@/helpers/errorsHandler";
import { useTours } from "../useTours";

const columns = [
  { uid: "tour", name: "TOUR" },
  { uid: "price", name: "PRECIO", sortable: true },
  { uid: "currency", name: "MONEDA" },
  { uid: "active", name: "ACTIVO", sortable: true },
  { uid: "actions", name: "ACCIONES" },
];

const statusOptions = [
  { uid: "active", name: "Activo" },
  { uid: "inactive", name: "Inactivo" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "tour",
  "price",
  "currency",
  "active",
  "actions",
];

// Precio en centavos -> texto en USD (o la moneda indicada).
const formatMoney = (priceCents: number, currency: string): string => {
  const code = (currency || "usd").toUpperCase();
  const value = (priceCents ?? 0) / 100;
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: code,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code}`;
  }
};

interface CreateForm {
  tourUuid: string;
  title: string;
  price: string;
}

interface EditForm {
  tourUuid: string;
  title: string;
  price: string;
  currency: string;
}

const emptyCreateForm = (): CreateForm => ({
  tourUuid: "",
  title: "",
  price: "",
});

const PaidToursTable = ({
  data: paidTours,
  isLoading,
  token,
  changeData,
}: {
  data: PaidTour[] | [];
  isLoading: boolean;
  token: string;
  changeData: () => void;
}) => {
  const handleError = useErrorHandler();
  const { tours, tourLabel } = useTours(token);

  const createModal = useDisclosure();
  const editModal = useDisclosure();

  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm());
  const [editForm, setEditForm] = useState<EditForm>({
    tourUuid: "",
    title: "",
    price: "",
    currency: "usd",
  });

  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [togglingUuid, setTogglingUuid] = useState("");

  // Tours del Rust que todavia no son tours de pago (para el alta, evita
  // duplicados).
  const availableTours = useMemo(() => {
    const used = new Set(paidTours.map((p) => p.tour_uuid));
    return tours.filter((tour) => !used.has(tour.uuid));
  }, [tours, paidTours]);

  const openCreate = useCallback(() => {
    setCreateForm(emptyCreateForm());
    setFormError("");
    createModal.onOpen();
  }, [createModal]);

  const openEdit = useCallback(
    (paidTour: PaidTour) => {
      setEditForm({
        tourUuid: paidTour.tour_uuid,
        title: paidTour.title,
        price: (paidTour.price_cents / 100).toString(),
        currency: paidTour.currency || "usd",
      });
      setFormError("");
      editModal.onOpen();
    },
    [editModal]
  );

  const onCreate = async (onClose: () => void) => {
    if (!token) return;
    setFormError("");

    if (!createForm.tourUuid) {
      setFormError("Selecciona un tour.");
      return;
    }
    if (!createForm.title.trim()) {
      setFormError("Ingresa un titulo.");
      return;
    }
    const priceValue = Number(createForm.price);
    if (!createForm.price || Number.isNaN(priceValue) || priceValue < 0) {
      setFormError("Ingresa un precio valido (mayor o igual a 0).");
      return;
    }

    setIsSaving(true);
    try {
      await createPaidTour(token, {
        tourUuid: createForm.tourUuid,
        title: createForm.title.trim(),
        // Se envia en centavos (unidad minima de la moneda).
        priceCents: Math.round(priceValue * 100),
      });
      onClose();
      changeData();
    } catch (error) {
      handleError(error);
      setFormError("No se pudo crear el tour de pago.");
    } finally {
      setIsSaving(false);
    }
  };

  const onEdit = async (onClose: () => void) => {
    if (!token) return;
    setFormError("");

    if (!editForm.title.trim()) {
      setFormError("Ingresa un titulo.");
      return;
    }
    const priceValue = Number(editForm.price);
    if (!editForm.price || Number.isNaN(priceValue) || priceValue < 0) {
      setFormError("Ingresa un precio valido (mayor o igual a 0).");
      return;
    }

    setIsSaving(true);
    try {
      await updatePaidTour(token, editForm.tourUuid, {
        title: editForm.title.trim(),
        // Se envia en centavos (unidad minima de la moneda).
        priceCents: Math.round(priceValue * 100),
      });
      onClose();
      changeData();
    } catch (error) {
      handleError(error);
      setFormError("No se pudo actualizar el tour de pago.");
    } finally {
      setIsSaving(false);
    }
  };

  const onToggleActive = async (paidTour: PaidTour) => {
    if (!token) return;
    setTogglingUuid(paidTour.tour_uuid);
    try {
      await updatePaidTour(token, paidTour.tour_uuid, {
        active: !paidTour.active,
      });
      changeData();
    } catch (error) {
      handleError(error);
    } finally {
      setTogglingUuid("");
    }
  };

  const renderCell = useCallback(
    (paidTour: PaidTour, columnKey: Key) => {
      switch (columnKey) {
        case "tour":
          return (
            <p className="text-bold text-small">{paidTour.title}</p>
          );
        case "price":
          return (
            <span className="text-small">
              {formatMoney(paidTour.price_cents, paidTour.currency)}
            </span>
          );
        case "currency":
          return (
            <span className="text-small uppercase">{paidTour.currency}</span>
          );
        case "active":
          return (
            <Chip
              color={paidTour.active ? "success" : "default"}
              size="sm"
              variant="flat"
            >
              {paidTour.active ? "Si" : "No"}
            </Chip>
          );
        case "actions":
          return (
            <div className="relative flex justify-center gap-2">
              <Button
                size="sm"
                variant="light"
                color="primary"
                startContent={<Icon icon="solar:pen-line-duotone" width={16} />}
                onPress={() => openEdit(paidTour)}
              >
                Editar precio
              </Button>
              <Button
                size="sm"
                variant="light"
                color={paidTour.active ? "danger" : "success"}
                isLoading={togglingUuid === paidTour.tour_uuid}
                isDisabled={togglingUuid === paidTour.tour_uuid}
                onPress={() => onToggleActive(paidTour)}
              >
                {paidTour.active ? "Desactivar" : "Activar"}
              </Button>
            </div>
          );
        default:
          return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openEdit, togglingUuid, token]
  );

  const filterByText = useCallback(
    (paidTour: PaidTour, search: string) =>
      paidTour.title.toLowerCase().includes(search.toLowerCase()),
    []
  );

  const filterByStatus = useCallback(
    (paidTour: PaidTour, statusKey: string) =>
      statusKey === "active" ? paidTour.active : !paidTour.active,
    []
  );

  return (
    <>
      <DataTable<PaidTour>
        data={paidTours}
        isLoading={isLoading}
        columns={columns}
        statusOptions={statusOptions}
        initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
        initialSortColumn="tour"
        getRowKey={(paidTour) => paidTour.uuid}
        renderCell={renderCell}
        filterByText={filterByText}
        filterByStatus={filterByStatus}
        searchPlaceholder="Buscar por tour..."
        ariaLabel="Tabla de tours de pago"
        emptyLabel="No hay tours de pago configurados"
        totalLabel={(count) => `${count} tours de pago en total`}
        topRightAction={
          <Button
            color="secondary"
            endContent={<Icon icon="solar:clipboard-add-linear" width={20} />}
            onPress={openCreate}
          >
            Agregar tour de pago
          </Button>
        }
      />

      {/* Alta */}
      <Modal
        isOpen={createModal.isOpen}
        onOpenChange={createModal.onOpenChange}
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h5 className="text-lg">Agregar tour de pago</h5>
              </ModalHeader>
              <ModalBody className="gap-4">
                <p className="text-tiny text-default-500">
                  Elegi un tour y define su precio. El tour de pago se crea
                  activo.
                </p>
                <Select
                  variant="bordered"
                  label="Tour"
                  labelPlacement="outside"
                  placeholder="Selecciona un tour"
                  selectedKeys={
                    createForm.tourUuid ? [createForm.tourUuid] : []
                  }
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0];
                    const tourUuid = value ? String(value) : "";
                    const tour = tours.find((t) => t.uuid === tourUuid);
                    setCreateForm((prev) => ({
                      ...prev,
                      tourUuid,
                      // Prellenamos el titulo con el nombre del tour del Rust.
                      title: tour ? tourLabel(tour) : prev.title,
                    }));
                  }}
                >
                  {availableTours.map((tour) => (
                    <SelectItem key={tour.uuid} value={tour.uuid}>
                      {tourLabel(tour)}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  variant="bordered"
                  label="Titulo"
                  labelPlacement="outside"
                  placeholder="Titulo del tour de pago"
                  value={createForm.title}
                  onValueChange={(value) =>
                    setCreateForm((prev) => ({ ...prev, title: value }))
                  }
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  variant="bordered"
                  label="Precio (USD)"
                  labelPlacement="outside"
                  placeholder="0.00"
                  value={createForm.price}
                  onValueChange={(value) =>
                    setCreateForm((prev) => ({ ...prev, price: value }))
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
                  onPress={() => onCreate(onClose)}
                >
                  Agregar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edicion de precio/titulo */}
      <Modal
        isOpen={editModal.isOpen}
        onOpenChange={editModal.onOpenChange}
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h5 className="text-lg">Editar tour de pago</h5>
              </ModalHeader>
              <ModalBody className="gap-4">
                <Input
                  variant="bordered"
                  label="Titulo"
                  labelPlacement="outside"
                  value={editForm.title}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, title: value }))
                  }
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  variant="bordered"
                  label="Precio (USD)"
                  labelPlacement="outside"
                  placeholder="0.00"
                  value={editForm.price}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, price: value }))
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
                  onPress={() => onEdit(onClose)}
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

export default PaidToursTable;

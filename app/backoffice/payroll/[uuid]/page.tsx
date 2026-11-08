"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Button,
  Chip,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

import { useErrorHandler } from "@/helpers/errorsHandler";
import { getPeriod } from "@/services/payroll/getPeriod";
import { calculatePeriod } from "@/services/payroll/calculatePeriod";
import { markItemPaid } from "@/services/payroll/markItemPaid";
import { PayrollItem, PayrollPeriod } from "@/services/payroll/types";
import { useGuides } from "../useGuides";
import {
  formatDate,
  formatMoney,
  itemStatusLabel,
  periodStatusColor,
  periodStatusLabel,
} from "../format";

export default function PayrollPeriodDetail() {
  const params = useParams();
  const uuid = Array.isArray(params.uuid) ? params.uuid[0] : params.uuid ?? "";
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? "";
  const handleError = useErrorHandler();
  const { guideName } = useGuides(token);

  const [period, setPeriod] = useState<PayrollPeriod | null>(null);
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [isCalculating, setCalculating] = useState(false);
  const [payingUuid, setPayingUuid] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !uuid) return;
    setLoading(true);
    try {
      const detail = await getPeriod(token, uuid);
      setPeriod(detail.period);
      setItems(detail.items);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, uuid]);

  useEffect(() => {
    load();
  }, [load]);

  const onCalculate = async () => {
    if (!token || !uuid) return;
    setCalculating(true);
    try {
      const detail = await calculatePeriod(token, uuid);
      setPeriod(detail.period);
      setItems(detail.items);
    } catch (error) {
      handleError(error);
    } finally {
      setCalculating(false);
    }
  };

  const onMarkPaid = async (itemUuid: string) => {
    if (!token) return;
    setPayingUuid(itemUuid);
    try {
      const updated = await markItemPaid(token, itemUuid);
      setItems((prev) =>
        prev.map((item) => (item.uuid === itemUuid ? updated : item))
      );
    } catch (error) {
      handleError(error);
    } finally {
      setPayingUuid(null);
    }
  };

  // Total del periodo agrupado por moneda (los montos vienen en centavos).
  const totalsByCurrency = useMemo(() => {
    const totals = new Map<string, number>();
    for (const item of items) {
      const currency = (item.currency || "usd").toUpperCase();
      totals.set(currency, (totals.get(currency) ?? 0) + (item.amount ?? 0));
    }
    return Array.from(totals.entries());
  }, [items]);

  const isPaidPeriod = period?.status === "paid";

  if (isLoading && !period) {
    return (
      <div className="flex w-full justify-center py-10">
        <Spinner label="Cargando quincena..." />
      </div>
    );
  }

  if (!period) {
    return (
      <p className="text-default-500">No se encontro la quincena solicitada.</p>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-medium">
              Quincena {formatDate(period.start_date)} -{" "}
              {formatDate(period.end_date)}
            </h3>
            <Chip
              className="capitalize"
              color={periodStatusColor(period.status)}
              size="sm"
              variant="flat"
            >
              {periodStatusLabel(period.status)}
            </Chip>
          </div>
          <span className="text-tiny text-default-500">
            {items.length} guias en esta liquidacion
          </span>
        </div>
        <Button
          color="primary"
          isLoading={isCalculating}
          isDisabled={isCalculating || isPaidPeriod}
          startContent={
            !isCalculating && (
              <Icon icon="solar:calculator-minimalistic-linear" width={20} />
            )
          }
          onPress={onCalculate}
        >
          {items.length > 0 ? "Recalcular" : "Calcular"}
        </Button>
      </div>

      {isPaidPeriod && (
        <div className="flex items-center gap-3 rounded-medium bg-success/10 p-3">
          <Icon
            icon="solar:check-circle-linear"
            className="text-success"
            width={22}
          />
          <p className="text-tiny">
            Esta quincena ya esta pagada; no se puede recalcular.
          </p>
        </div>
      )}

      <Table aria-label="Items de la liquidacion" isHeaderSticky>
        <TableHeader>
          <TableColumn>GUIA</TableColumn>
          <TableColumn>TOURS</TableColumn>
          <TableColumn>MONTO</TableColumn>
          <TableColumn>ESTADO</TableColumn>
          <TableColumn align="center">ACCIONES</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent="Todavia no hay items. Calcula la liquidacion para generarlos."
          isLoading={isLoading}
          loadingContent={<Spinner />}
          items={items}
        >
          {(item) => (
            <TableRow key={item.uuid}>
              <TableCell>
                <p className="text-small font-medium">
                  {guideName(item.user_uuid)}
                </p>
              </TableCell>
              <TableCell>
                <span className="text-small">{item.tours_count}</span>
              </TableCell>
              <TableCell>
                <span className="text-small">
                  {formatMoney(item.amount, item.currency)}
                </span>
              </TableCell>
              <TableCell>
                <Chip
                  className="capitalize"
                  color={item.status === "paid" ? "success" : "warning"}
                  size="sm"
                  variant="flat"
                >
                  {itemStatusLabel(item.status)}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  {item.status === "paid" ? (
                    <span className="text-tiny text-default-400">
                      {item.paid_at ? `Pagado ${formatDate(item.paid_at)}` : "Pagado"}
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      isLoading={payingUuid === item.uuid}
                      isDisabled={payingUuid === item.uuid}
                      startContent={
                        payingUuid !== item.uuid && (
                          <Icon icon="solar:check-read-linear" width={16} />
                        )
                      }
                      onPress={() => onMarkPaid(item.uuid)}
                    >
                      Marcar pagado
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {items.length > 0 && (
        <div className="flex flex-col items-end gap-1 border-t border-divider pt-4">
          <span className="text-tiny text-default-500">Total de la quincena</span>
          {totalsByCurrency.map(([currency, total]) => (
            <span key={currency} className="text-lg font-semibold">
              {formatMoney(total, currency)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Avatar,
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Spinner,
  Card,
  CardBody,
  Chip, // Importar Chip si no estaba
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation"; // Importar useSearchParams
import { useSession } from "next-auth/react";
import Link from "next/link";

import QrScanner from "@/app/components/qrscaner/QrScanner";
import { TouristListModal } from "@/app/components/modals/TouristListModal";
import { ThemeSwitcher } from "../../components/theme/ThemeSwitcher";
import Logo from "@/app/components/icons/logo";
import {
  Tourist,
  getTouristsByEvent,
} from "@/services/tickets/getTouristsByEvent"; // Importar servicio y tipo de turista
import { useErrorHandler } from "@/helpers/errorsHandler";
import { checkInTicket } from "@/services/tickets/checkInTicket";
import { Event, getEvents } from "@/services/events/getEvents";
import { updateEvent } from "@/services/events/updateEvent";

const useEventTourists = (
  eventId: string | null,
  token: string | undefined
) => {
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleError = useErrorHandler();

  const fetchTourists = useCallback(async () => {
    if (!eventId) {
      setIsLoading(false);
      setError("ID de evento no proporcionado.");
      return;
    }
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedTourists = await getTouristsByEvent(token, eventId);
      setTourists(fetchedTourists);
    } catch (err: any) {
      console.error(`Error fetching tourists for event ${eventId}:`, err);
      const errorMessage = handleError(err);
      setError(errorMessage || "Ocurrió un error al cargar los turistas.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId, handleError, token]);

  useEffect(() => {
    fetchTourists();
  }, [fetchTourists]);

  return { tourists, isLoading, error, refetchTourists: fetchTourists };
};

const useAgentEvent = (eventId: string | null, token: string | undefined) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleError = useErrorHandler();

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setIsLoading(false);
      setError("ID de evento no proporcionado.");
      return;
    }
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const events = await getEvents(token);
      const currentEvent = events.find((item) => item.uuid === eventId) || null;
      setEvent(currentEvent);

      if (!currentEvent) {
        setError("No se encontró el evento asignado.");
      }
    } catch (err: any) {
      console.error(`Error fetching event ${eventId}:`, err);
      const errorMessage = handleError(err);
      setError(errorMessage || "Ocurrió un error al cargar el evento.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId, handleError, token]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { event, setEvent, isLoading, error, refetchEvent: fetchEvent };
};

export default function AgentEventDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params?.eventId as string | null;
  const { data: session, status: sessionStatus } = useSession();
  const handleError = useErrorHandler();
  const token = session?.user?.accessToken;

  const eventTitleParam = searchParams.get("title");
  const eventDateParam = searchParams.get("date");

  const {
    tourists,
    isLoading: isLoadingTourists,
    error: touristError,
    refetchTourists,
  } = useEventTourists(eventId, token);
  const {
    event,
    setEvent,
    isLoading: isLoadingEvent,
    error: eventError,
  } = useAgentEvent(eventId, token);

  const [touristScanned, setTouristScanned] = useState<string>("");
  const [manualTicketCode, setManualTicketCode] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  const [checkInResult, setCheckInResult] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);
  const [eventActionResult, setEventActionResult] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);
  const {
    isOpen: isListOpen,
    onOpen: onListOpen,
    onClose: onListOpenChange,
  } = useDisclosure();
  const {
    isOpen: isQrScanOpen,
    onOpen: onQrScanOpen,
    onClose: onQrScanOpenChange,
  } = useDisclosure();
  const {
    isOpen: isDialogOpen,
    onOpen: onDialogOpen,
    onClose: onDialogClose,
  } = useDisclosure();
  const {
    isOpen: isFinishEventConfirmOpen,
    onOpen: onFinishEventConfirmOpen,
    onClose: onFinishEventConfirmClose,
  } = useDisclosure();
  const {
    isOpen: isStartEventConfirmOpen,
    onOpen: onStartEventConfirmOpen,
    onClose: onStartEventConfirmClose,
  } = useDisclosure();

  const executeTicketCheckIn = useCallback(
    async (code: string, options?: { closeQrModal?: boolean }) => {
      const normalizedCode = String(code || "").trim();
      if (!normalizedCode) return false;

      setTouristScanned(normalizedCode);
      setCheckInResult(null);
      setIsCheckingIn(true);

      if (options?.closeQrModal) {
        onQrScanOpenChange();
      }

      try {
        if (!token) {
          throw new Error("No valid session or accessToken");
        }

        const checkInRes = await checkInTicket(token, normalizedCode);
        await refetchTourists();

        setCheckInResult({
          status: "success",
          message:
            (typeof checkInRes?.message === "string" && checkInRes.message) ||
            "Check-in registrado con éxito.",
        });

        return true;
      } catch (error: any) {
        if (
          error?.message === "Token expired" ||
          error?.message === "Internal server error"
        ) {
          handleError(error);
        }

        setCheckInResult({
          status: "error",
          message:
            error?.message ||
            "No se pudo registrar el check-in. Intenta nuevamente.",
        });

        return false;
      } finally {
        setIsCheckingIn(false);
        onDialogOpen();
      }
    },
    [handleError, onDialogOpen, onQrScanOpenChange, refetchTourists, token]
  );

  const onNewScanResult = useCallback(
    async (code: string) => {
      await executeTicketCheckIn(code, { closeQrModal: true });
    },
    [executeTicketCheckIn]
  );

  const handleManualCheckIn = useCallback(async () => {
    const success = await executeTicketCheckIn(manualTicketCode);
    if (success) {
      setManualTicketCode("");
    }
  }, [executeTicketCheckIn, manualTicketCode]);

  const handleEventUpdate = useCallback(
    async (payload: { status: "open" | "closed"; progress: "in_progress" | "finished" }) => {
      if (!eventId || !token) return false;

      setIsUpdatingEvent(true);
      setEventActionResult(null);

      try {
        const response = await updateEvent(token, eventId, payload);

        setEvent((prev) =>
          prev
            ? {
                ...prev,
                status: payload.status,
                progress: payload.progress,
              }
            : prev
        );

        setEventActionResult({
          status: "success",
          message:
            (typeof response?.message === "string" && response.message) ||
            (payload.progress === "in_progress"
              ? "El tour ha sido iniciado."
              : "El evento ha sido finalizado correctamente."),
        });

        setTimeout(() => {
          setEventActionResult(null);
        }, 3000);

        return true;
      } catch (error: any) {
        if (
          error?.message === "Token expired" ||
          error?.message === "Internal server error"
        ) {
          handleError(error);
        }

        setEventActionResult({
          status: "error",
          message:
            error?.message ||
            "No se pudo actualizar el estado del evento. Intenta nuevamente.",
        });

        return false;
      } finally {
        setIsUpdatingEvent(false);
      }
    },
    [eventId, handleError, setEvent, token]
  );

  const handleStartTour = useCallback(async () => {
    if (!event || isUpdatingEvent) return false;

    const currentStatus = event.status === "closed" ? "open" : event.status;
    return handleEventUpdate({
      status: currentStatus,
      progress: "in_progress",
    });
  }, [event, handleEventUpdate, isUpdatingEvent]);

  const handleFinishTour = useCallback(async () => {
    if (isUpdatingEvent) return;

    const success = await handleEventUpdate({
      status: "closed",
      progress: "finished",
    });

    if (success) {
      onFinishEventConfirmClose();
    }
  }, [handleEventUpdate, isUpdatingEvent, onFinishEventConfirmClose]);

  if (sessionStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label="Cargando sesión..." />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated" || !session) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p>Acceso denegado.</p>
        <Link href="/login">
          <Button color="primary">Iniciar Sesión</Button>
        </Link>
      </div>
    );
  }

  const guideName = session.user?.name || "Guía";
  const eventTitle = eventTitleParam || "Detalle del Evento";
  const eventDate = eventDateParam || "";
  const isEventInProgress = event?.progress === "in_progress";
  const isEventFinished =
    event?.status === "closed" ||
    event?.progress === "finished" ||
    event?.progress === "completed";
  const isEventActionDisabled =
    isUpdatingEvent || isLoadingEvent || !!eventError || !event;
  const eventActionLabel = isEventFinished
    ? "Evento finalizado"
    : isEventInProgress
      ? "Finalizar Tour"
      : "Iniciar Tour";

  return (
    <main className="mt-4 h-full w-full max-w-4xl overflow-visible mx-auto px-4 pb-8">
      <div className="mb-2">
        <Link
          href="/agent"
          className="inline-flex items-center text-sm text-foreground hover:underline"
        >
          <Icon icon="ic:round-arrow-back-ios" width={14} className="mr-1" />
          Volver
        </Link>
      </div>
      <div className="flex w-full flex-col justify-center items-center p-4">
        <Logo className="mb-5" width={200} height={71} />
        <p className="text-sm text-default-500 text-center">
          {guideName}, tienes asignado el tour del {eventDate}:
        </p>
        <h1 className="text-lg font-bold mb-8 text-center">{eventTitle}</h1>

        {isLoadingTourists && (
          <div className="my-4">
            <Spinner label="Cargando turistas..." size="sm" />
          </div>
        )}
        {touristError && !isLoadingTourists && (
          <Card className="bg-warning/20 p-3 mb-4 w-full md:w-96">
            <CardBody>
              <p className="text-warning-700 text-center text-sm">
                {touristError}
              </p>
            </CardBody>
          </Card>
        )}

        <div className="flex w-full md:w-96 flex-col justify-center items-center rounded-medium border-small border-divider gap-4 px-2 py-8 mb-4">
          <h3 className="text-sm text-center mb-2 px-6">
            Escanea el código QR o ingresa el token del usuario para comenzar
          </h3>
          <div className="flex flex-col gap-2 w-4/5">
            <Button
              color="primary"
              variant="flat"
              startContent={
                <Icon icon="solar:qr-code-bold-duotone" width={24} />
              }
              className="w-full"
              onPress={onQrScanOpen}
              isDisabled={isCheckingIn}
              isLoading={isCheckingIn}
            >
              Escanear código qr
            </Button>
            <div className="flex items-center p-2 gap-4">
              <hr
                className="bg-divider border-none w-full h-divider flex-1"
                role="separator"
              />
              <p className="shrink-0 text-tiny text-default-500">O</p>
              <hr
                className="bg-divider border-none w-full h-divider flex-1"
                role="separator"
              />
            </div>
            <div className="inline-flex justify-center items-center gap-1 mb-2 ">
              <Input
                type="text"
                variant="bordered"
                size="md"
                placeholder="Ingresa el token"
                value={manualTicketCode}
                onValueChange={setManualTicketCode}
                isDisabled={isCheckingIn}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleManualCheckIn();
                  }
                }}
              />
              <Button
                isIconOnly
                variant="light"
                onPress={handleManualCheckIn}
                isDisabled={isCheckingIn || !manualTicketCode.trim()}
                isLoading={isCheckingIn}
              >
                <Icon icon="solar:round-arrow-right-line-duotone" width={32} />
              </Button>
            </div>
            <Button
              variant="light"
              color="primary"
              className="underline"
              onPress={onListOpen}
              isDisabled={isLoadingTourists || !!touristError}
            >
              Ver listado de turistas ({tourists.length})
            </Button>
          </div>
        </div>
        <div className="w-full md:w-96">
          {isLoadingEvent && (
            <div className="flex justify-center mb-3">
              <Spinner size="sm" label="Cargando estado del evento..." />
            </div>
          )}
          {eventError && !isLoadingEvent && (
            <Card className="bg-warning/20 p-3 mb-3">
              <CardBody>
                <p className="text-warning-700 text-center text-sm">
                  {eventError}
                </p>
              </CardBody>
            </Card>
          )}
          <Button
            color="primary"
            startContent={<Icon icon="solar:bus-line-duotone" width={24} />}
            className="w-full"
            isDisabled={isEventActionDisabled || isEventFinished}
            isLoading={isUpdatingEvent}
            onPress={() => {
              if (isEventFinished || isEventActionDisabled) return;
              if (isEventInProgress) {
                onFinishEventConfirmOpen();
                return;
              }
              onStartEventConfirmOpen();
            }}
          >
            {eventActionLabel}
          </Button>
          {eventActionResult && (
            <Card
              className={`mt-3 ${
                eventActionResult.status === "error"
                  ? "bg-danger/20"
                  : "bg-success/20"
              }`}
            >
              <CardBody>
                <p
                  className={`text-sm text-center ${
                    eventActionResult.status === "error"
                      ? "text-danger"
                      : "text-success"
                  }`}
                >
                  {eventActionResult.message}
                </p>
              </CardBody>
            </Card>
          )}
          <div className="flex flex-row justify-between mt-6">
            <Button variant="light" size="sm">
              Contactar con soporte
            </Button>
            <ThemeSwitcher layout="login" />
          </div>
        </div>

        <Modal
          isOpen={isQrScanOpen}
          placement="bottom"
          size="full"
          onOpenChange={onQrScanOpenChange}
          className="max-h-[68vh]"
          backdrop="blur"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Escanea el código QR
                </ModalHeader>
                <ModalBody>
                  <QrScanner onScan={onNewScanResult} />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
        <Modal
          isOpen={isDialogOpen}
          size="xs"
          placement="center"
          onOpenChange={onDialogClose}
          backdrop="blur"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {checkInResult?.status === "error"
                    ? "Error al registrar"
                    : "Check-in procesado"}
                </ModalHeader>
                <ModalBody>
                  {isCheckingIn ? (
                    <div className="flex justify-center py-3">
                      <Spinner label="Registrando check-in..." size="sm" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="break-words text-sm text-default-500">
                        Código:{" "}
                        <span className="text-foreground font-medium">
                          {touristScanned}
                        </span>
                      </p>
                      <p
                        className={`break-words ${
                          checkInResult?.status === "error"
                            ? "text-danger"
                            : "text-success"
                        }`}
                      >
                        {checkInResult?.message ||
                          "Check-in registrado con éxito."}
                      </p>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onClose} isDisabled={isCheckingIn}>
                    Cerrar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
        <TouristListModal
          isOpen={isListOpen}
          onOpenChange={onListOpenChange}
          tourists={tourists}
          isLoading={isLoadingTourists}
          error={touristError}
        />
        <Modal
          isOpen={isStartEventConfirmOpen}
          onOpenChange={onStartEventConfirmClose}
          size="lg"
          backdrop="blur"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <h5 className="text-lg">¿Deseas iniciar el evento?</h5>
                </ModalHeader>
                <ModalBody>
                  <p className="text-sm">
                    Esta acción cambiará el progreso del tour a{" "}
                    <span className="text-primary">en progreso</span> y
                    habilitará el flujo operativo del evento para el guía.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    onPress={async () => {
                      const success = await handleStartTour();
                      if (success) {
                        onStartEventConfirmClose();
                      }
                    }}
                    isLoading={isUpdatingEvent}
                    isDisabled={isUpdatingEvent}
                  >
                    Iniciar evento
                  </Button>
                  <Button
                    color="default"
                    variant="light"
                    onPress={onClose}
                    isDisabled={isUpdatingEvent}
                  >
                    Cerrar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
        <Modal
          isOpen={isFinishEventConfirmOpen}
          onOpenChange={onFinishEventConfirmClose}
          size="lg"
          backdrop="blur"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <h5 className="text-lg">¿Estás completamente seguro?</h5>
                </ModalHeader>
                <ModalBody>
                  <p className="text-sm">
                    Esta acción cerrará el evento y marcará el tour como{" "}
                    <span className="text-primary">finalizado</span>. Antes de
                    continuar, confirma que realmente deseas cerrar este evento.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => {
                      void handleFinishTour();
                    }}
                    isLoading={isUpdatingEvent}
                    isDisabled={isUpdatingEvent}
                  >
                    Finalizar evento
                  </Button>
                  <Button
                    color="primary"
                    onPress={onClose}
                    isDisabled={isUpdatingEvent}
                  >
                    Cerrar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </main>
  );
}

"use client";

import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Card,
  CardHeader,
  CardBody,
  Chip,
  Divider,
  Spinner,
  Avatar,
  Button,
  Tooltip, // Importar Tooltip para el botón de cerrar sesión
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // Importar signOut

import { Event, Translation, getEvents } from "@/services/events/getEvents";
import { ThemeSwitcher } from "../components/theme/ThemeSwitcher";
import Logo from "@/app/components/icons/logo";
import { useErrorHandler } from "@/helpers/errorsHandler";

const useAgentEvents = (token: string | undefined) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleError = useErrorHandler();

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedEvents = await getEvents(token);
        setEvents(fetchedEvents);
      } catch (err: any) {
        console.error("Error fetching agent events:", err);
        const errorMessage = handleError(err);
        setError(errorMessage || "Ocurrió un error al cargar los eventos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [token, handleError]);

  return { events, isLoading, error };
};

export default function AgentEventsListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.accessToken;
  const { events, isLoading: isLoadingEvents, error } = useAgentEvents(token);

  const getTitleByLanguage = useCallback(
    (
      translations: Translation[],
      primaryLang: string = "es",
      fallbackLang: string = "en"
    ): string => {
      if (!translations || translations.length === 0) {
        return "Título no disponible";
      }
      const primaryTranslation = translations.find(
        (t) => t.language_code === primaryLang
      );
      const fallbackTranslation = translations.find(
        (t) => t.language_code === fallbackLang
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

  const formatDateTimeForDisplay = useCallback((datetime: string): string => {
    try {
      const formattedDate = datetime
        ?.replace(" +00:00:00", "Z")
        .replace(" ", "T");
      const date = new Date(formattedDate);
      if (isNaN(date.getTime())) return "Fecha inválida";
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch (e) {
      return "Fecha inválida";
    }
  }, []);

  const formatDateTimeForParam = useCallback((datetime: string): string => {
    try {
      const formattedDate = datetime
        ?.replace(" +00:00:00", "Z")
        .replace(" ", "T");
      const date = new Date(formattedDate);
      if (isNaN(date.getTime())) return "Fecha inválida";
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return "Fecha inválida";
    }
  }, []);

  const renderProgressChip = (progress: Event["progress"]) => {
    let color: "warning" | "primary" | "success" = "warning";
    let text = "Pendiente";
    if (progress === "open") {
      color = "primary";
      text = "Abierto";
    } else if (progress === "in_progress") {
      color = "primary";
      text = "En progreso";
    } else if (progress === "completed" || progress === "finished") {
      color = "success";
      text = "Finalizado";
    }
    return (
      <Chip className="capitalize" color={color} size="sm" variant="flat">
        {text}
      </Chip>
    );
  };

  const upcomingEvents = events.filter(
    (event) =>
      event.status === "open" &&
      event.progress !== "completed" &&
      event.progress !== "finished"
  );
  const pastEvents = events.filter(
    (event) =>
      event.status === "closed" ||
      event.progress === "completed" ||
      event.progress === "finished"
  );

  const guideName = session?.user?.name || "Guía";
  const guideLastName = session?.user?.last_name || "";

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner label="Cargando sesión..." />
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p>Acceso denegado.</p>
        <Link href="/login">
          <Button color="primary">Iniciar Sesión</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="mt-4 h-full w-full max-w-4xl overflow-visible mx-auto px-4 pb-8">
      <div className="mb-6 flex flex-col items-center gap-4">
        <Logo width={200} height={71} />
        <div className="w-full max-w-xl flex items-center justify-between gap-3 rounded-large border-small border-divider px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar name={`${guideName} ${guideLastName}`} size="sm" />
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-medium truncate">{`${guideName} ${guideLastName}`}</p>
              <p className="text-xs text-default-500">Guía Turístico</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeSwitcher layout="" />
            <Tooltip content="Cerrar sesión" placement="bottom">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                aria-label="Cerrar sesión"
                onPress={async () => {
                  await signOut({ redirect: false });
                  window.location.href = "/login";
                }}
              >
                <Icon icon="solar:logout-3-line-duotone" width={18} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {isLoadingEvents && (
        <div className="flex justify-center items-center h-40">
          <Spinner label="Cargando tus eventos..." />
        </div>
      )}

      {error && (
        <Card className="bg-danger/20 p-4 mb-6">
          <CardBody>
            <p className="text-danger text-center">{error}</p>
          </CardBody>
        </Card>
      )}

      {!isLoadingEvents && !error && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Próximos Eventos</h2>
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingEvents.map((event) => {
                  const title = getTitleByLanguage(event.translations);
                  const dateForParam = formatDateTimeForParam(event.datetime);
                  const dateForDisplay = formatDateTimeForDisplay(
                    event.datetime
                  );
                  const href = `/agent/${event.uuid}?title=${encodeURIComponent(
                    title
                  )}&date=${encodeURIComponent(dateForParam)}`;

                  return (
                    <Card
                      key={event.uuid}
                      isPressable
                      isHoverable
                      shadow="sm"
                      className="cursor-pointer"
                      onPress={() => router.push(href)}
                    >
                      <CardHeader className="flex justify-between items-start gap-3">
                        <h3 className="text-md font-semibold flex-1">{title}</h3>
                        {renderProgressChip(event.progress)}
                      </CardHeader>
                      <Divider />
                      <CardBody className="text-sm text-default-600 space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:calendar-date-bold-duotone"
                            width={18}
                            className="text-primary"
                          />
                          <span>{dateForDisplay}</span>
                        </div>
                        <div className="flex justify-end mt-2">
                          <Icon
                            icon="solar:arrow-right-linear"
                            width={20}
                            className="text-primary"
                          />
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-default-500 text-sm">
                No tienes eventos próximos asignados.
              </p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Historial de Eventos</h2>
            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastEvents.map((event) => {
                  const title = getTitleByLanguage(event.translations);
                  const dateForParam = formatDateTimeForParam(event.datetime);
                  const href = `/agent/${event.uuid}?title=${encodeURIComponent(
                    title
                  )}&date=${encodeURIComponent(dateForParam)}`;

                  return (
                    <Card
                      key={event.uuid}
                      isPressable
                      isHoverable
                      shadow="sm"
                      className="opacity-70 cursor-pointer"
                      onPress={() => router.push(href)}
                    >
                      <CardHeader className="flex justify-between items-start gap-3">
                        <h3 className="text-md font-semibold flex-1">{title}</h3>
                        {renderProgressChip(event.progress)}
                      </CardHeader>
                      <Divider />
                      <CardBody className="text-sm text-default-500 space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="solar:calendar-check-bold-duotone"
                            width={18}
                          />
                          <span>{formatDateTimeForDisplay(event.datetime)}</span>
                        </div>
                        <div className="flex justify-end mt-2">
                          <Icon
                            icon="solar:arrow-right-linear"
                            width={20}
                            className="text-default-500"
                          />
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-default-500 text-sm">
                Aún no has completado ningún evento.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

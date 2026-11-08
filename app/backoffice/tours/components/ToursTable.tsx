import { Dispatch, Key, SetStateAction, useCallback } from "react";
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Image,
  Link,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/navigation";

import flags from "@/data/flags.json";
import { DEFAULT_DISPLAY_LANGUAGE } from "@/data/language";
import { Translation } from "@/services/stop/getStops";
import { Tour } from "@/services/tours/getTours";
import DataTable from "@/app/components/DataTable";

const columns = [
  { uid: "title", name: "NOMBRE" },
  { uid: "external_id", name: "BOKUN ID", sortable: true },
  { uid: "language_code", name: "IDIOMAS" },
  { uid: "active", name: "ESTADO", sortable: true },
  { uid: "actions", name: "ACCIONES" },
];

const statusOptions = [{ uid: "inactive", name: "Inactivo" }];

const INITIAL_VISIBLE_COLUMNS = [
  "title",
  "external_id",
  "language_code",
  "active",
  "actions",
];

const ToursTable = ({
  data: tours,
  isLoading,
}: {
  data: Tour[] | [];
  isLoading: boolean;
  token: string;
  changeData: Dispatch<SetStateAction<number>>;
}) => {
  const router = useRouter();

  const renderCell = useCallback(
    (tour: Tour, columnKey: Key) => {
      const cellValue = tour[columnKey as keyof Tour];

      switch (columnKey) {
        case "title":
          const spanishTranslation = tour.translations.find(
            (translation) =>
              translation.language_code === DEFAULT_DISPLAY_LANGUAGE
          );
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">
                {spanishTranslation
                  ? spanishTranslation.title
                  : "Título no disponible"}
              </p>
            </div>
          );
        case "external_id":
          return (
            <span className="text-small">
              {cellValue != null && cellValue !== "" ? String(cellValue) : "—"}
            </span>
          );
        case "language_code":
          return (
            <div className="flex gap-2 flex-wrap">
              {tour.translations.map((translation) => (
                <div
                  key={translation.language_code}
                  className="flex items-center gap-1"
                >
                  <Image
                    alt={translation.language_code}
                    src={flags[translation.language_code as keyof typeof flags]}
                    width={14}
                  />
                  <span className="uppercase text-tiny">
                    {translation.language_code}
                  </span>
                </div>
              ))}
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
        case "actions":
          const getTitleByLanguage = (
            translations: Translation[],
            primaryLang: string,
            fallbackLang: string
          ): string => {
            const primaryTranslation = translations.find(
              (translation) => translation.language_code === primaryLang
            );
            const fallbackTranslation = translations.find(
              (translation) => translation.language_code === fallbackLang
            );
            return primaryTranslation
              ? primaryTranslation.title
              : fallbackTranslation
              ? fallbackTranslation.title
              : "Title not found";
          };
          const titleTour = getTitleByLanguage(tour.translations, "es", "en");
          const existLangs = tour.translations
            .map((translation) => translation.language_code)
            .join(",");
          return (
            <div className="relative flex">
              <Dropdown backdrop="blur">
                <DropdownTrigger>
                  <Button size="sm" isIconOnly radius="full" variant="light">
                    <Icon icon="solar:pen-line-duotone" width="18" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  variant="faded"
                  aria-label="menu editar traducciones"
                >
                  <DropdownSection showDivider>
                    <DropdownItem
                      key={`${tour.uuid}-checkpoints`}
                      onPress={() =>
                        router.push(
                          `/backoffice/tours/edit-tour/${tour.uuid}/checkpoints?name=${encodeURIComponent(
                            titleTour
                          )}`
                        )
                      }
                      startContent={
                        <Icon icon="solar:sort-by-time-linear" width="22" />
                      }
                    >
                      Gestionar paradas y puntos de interés
                    </DropdownItem>
                    <DropdownItem
                      key={tour.uuid}
                      onPress={() => {
                        const params = new URLSearchParams({
                          name: titleTour,
                          external_id: tour.external_id.toString(),
                          active: tour.active.toString(),
                          pickup_latitude:
                            tour.pickup_location.latitude.toString(),
                          pickup_longitude:
                            tour.pickup_location.longitude.toString(),
                        });
                        router.push(
                          `/backoffice/tours/edit-tour/${tour.uuid}?${params.toString()}`
                        );
                      }}
                      startContent={
                        <Icon icon="solar:pen-line-duotone" width="22" />
                      }
                    >
                      Editar configuración
                    </DropdownItem>
                  </DropdownSection>
                  <DropdownSection title="Editar traducciones">
                    {tour.translations.map((translation) => (
                      <DropdownItem
                        key={translation.language_code}
                        onPress={() =>
                          router.push(
                            `/backoffice/tours/edit-tour/${tour.uuid}/${translation.language_code}`
                          )
                        }
                        startContent={
                          <Image
                            alt={translation.language_code}
                            src={
                              flags[
                                translation.language_code as keyof typeof flags
                              ]
                            }
                            width={16}
                          />
                        }
                      >
                        {translation.language_code.toUpperCase()}
                      </DropdownItem>
                    ))}
                  </DropdownSection>
                </DropdownMenu>
              </Dropdown>
              <Tooltip
                showArrow={true}
                content="Agregar traducción"
                placement="right"
                color="primary"
                disableAnimation
              >
                <Link
                  href={`/backoffice/tours/create-tour/${tour.uuid}?exist_langs=${existLangs}&name=${titleTour}`}
                >
                  <Button size="sm" isIconOnly radius="full" variant="light">
                    <Icon icon="clarity:language-line" width="18" />
                  </Button>
                </Link>
              </Tooltip>
            </div>
          );
        default:
          return <>{cellValue}</>;
      }
    },
    [router]
  );

  const filterByText = useCallback(
    (tour: Tour, search: string) =>
      tour.translations.some((translation) =>
        translation.title.toLowerCase().includes(search.toLowerCase())
      ),
    []
  );

  return (
    <DataTable<Tour>
      data={tours}
      isLoading={isLoading}
      columns={columns}
      statusOptions={statusOptions}
      initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
      initialSortColumn="title"
      getRowKey={(tour) => tour.uuid}
      renderCell={renderCell}
      filterByText={filterByText}
      ariaLabel="Tours list table"
      emptyLabel="No hay tours en el sistema"
      totalLabel={(count) => `${count} Tours en total`}
      topRightAction={
        <Link href="/backoffice/tours/create-tour">
          <Button
            color="secondary"
            endContent={<Icon icon="solar:clipboard-add-linear" width={20} />}
          >
            Nuevo Tour
          </Button>
        </Link>
      }
    />
  );
};

export default ToursTable;

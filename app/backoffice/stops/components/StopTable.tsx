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
import { Stop, Translation } from "@/services/stop/getStops";
import DataTable from "@/app/components/DataTable";

const columns = [
  { uid: "title", name: "NOMBRE" },
  { uid: "language_code", name: "IDIOMAS" },
  { uid: "active", name: "ESTADO", sortable: true },
  { uid: "actions", name: "ACCIONES" },
];

const statusOptions = [{ uid: "inactive", name: "Inactivo" }];

const INITIAL_VISIBLE_COLUMNS = ["title", "language_code", "active", "actions"];

const StopTable = ({
  data: stops,
  isLoading,
}: {
  data: Stop[] | [];
  isLoading: boolean;
  token: string;
  changeData: Dispatch<SetStateAction<number>>;
}) => {
  const router = useRouter();

  const renderCell = useCallback(
    (tour: Stop, columnKey: Key) => {
      const cellValue = tour[columnKey as keyof Stop];

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
          const titleStop = getTitleByLanguage(tour.translations, "es", "en");
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
                      key={`${tour.uuid}-poi-reorder`}
                      onPress={() =>
                        router.push(
                          `/backoffice/stops/edit-stop/${tour.uuid}/points-of-interest?name=${encodeURIComponent(
                            titleStop
                          )}`
                        )
                      }
                      startContent={
                        <Icon icon="solar:sort-by-time-linear" width="22" />
                      }
                    >
                      Gestionar puntos de interés
                    </DropdownItem>
                    <DropdownItem
                      key={tour.uuid}
                      onPress={() =>
                        router.push(
                          `/backoffice/stops/edit-stop/${tour.uuid}?lat=${tour.location.latitude}&lng=${tour.location.longitude}&name=${titleStop}`
                        )
                      }
                      startContent={
                        <Icon
                          icon="solar:point-on-map-line-duotone"
                          width="22"
                        />
                      }
                    >
                      Editar ubicación
                    </DropdownItem>
                  </DropdownSection>
                  <DropdownSection title="Editar traducciones">
                    {tour.translations.map((translation) => (
                      <DropdownItem
                        key={translation.language_code}
                        onPress={() =>
                          router.push(
                            `/backoffice/stops/edit-stop/${tour.uuid}/${translation.language_code}`
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
                  href={`/backoffice/stops/create-stop/${tour.uuid}?exist_langs=${existLangs}&name=${titleStop}`}
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
    (stop: Stop, search: string) =>
      stop.translations.some((translation) =>
        translation.title.toLowerCase().includes(search.toLowerCase())
      ),
    []
  );

  return (
    <DataTable<Stop>
      data={stops}
      isLoading={isLoading}
      columns={columns}
      statusOptions={statusOptions}
      initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
      initialSortColumn="title"
      getRowKey={(stop) => stop.uuid}
      renderCell={renderCell}
      filterByText={filterByText}
      ariaLabel="Stops list table"
      emptyLabel="No hay paradas en el sistema"
      totalLabel={(count) => `${count} Paradas en total`}
      topRightAction={
        <Link href="/backoffice/stops/create-stop">
          <Button
            color="secondary"
            endContent={<Icon icon="solar:clipboard-add-linear" width={20} />}
          >
            Nueva parada
          </Button>
        </Link>
      }
    />
  );
};

export default StopTable;

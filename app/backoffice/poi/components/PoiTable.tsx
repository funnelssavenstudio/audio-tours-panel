import { Dispatch, Key, SetStateAction, useCallback, useState } from "react";
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
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import flags from "@/data/flags.json";
import { DEFAULT_DISPLAY_LANGUAGE } from "@/data/language";
import { Poi, Translation } from "@/services/poi/getPois";
import { deletePoi } from "@/services/poi/deletePoi";
import DataTable from "@/app/components/DataTable";

const POI_DELETE_ALLOWED_EMAIL = "carlos@walaa.com.co";

const columns = [
  { uid: "title", name: "NOMBRE" },
  { uid: "language_code", name: "IDIOMAS" },
  { uid: "active", name: "ESTADO", sortable: true },
  { uid: "actions", name: "ACCIONES" },
];

const statusOptions = [
  { uid: "active", name: "Activo" },
  { uid: "inactive", name: "Inactivo" },
];

const INITIAL_VISIBLE_COLUMNS = ["title", "language_code", "active", "actions"];

const PoiTable = ({
  data: pois,
  isLoading,
  token,
  changeData,
}: {
  data: Poi[] | [];
  isLoading: boolean;
  token: string;
  changeData: Dispatch<SetStateAction<number>>;
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const canDeletePoi = session?.user?.email === POI_DELETE_ALLOWED_EMAIL;
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [errorMsgDelete, setErrorMsgDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    if (!selectedPoi || !token) return;
    setErrorMsgDelete(null);
    setIsDeleting(true);
    try {
      await deletePoi(token, selectedPoi.uuid);
      changeData((prev) => prev + 1);
      setSelectedPoi(null);
      onOpenChange();
    } catch (error) {
      setErrorMsgDelete(
        error instanceof Error ? error.message : "No se pudo eliminar el POI"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const renderCell = useCallback(
    (tour: Poi, columnKey: Key) => {
      const cellValue = tour[columnKey as keyof Poi];

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
          const titlePoi = getTitleByLanguage(tour.translations, "es", "en");
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
                      key={tour.uuid}
                      onPress={() =>
                        router.push(
                          `/backoffice/poi/edit-poi/${tour.uuid}?lat=${tour.location.latitude}&lng=${tour.location.longitude}&name=${titlePoi}`
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
                  <DropdownSection
                    title="Editar traducciones"
                    showDivider={canDeletePoi}
                  >
                    {tour.translations.map((translation) => (
                      <DropdownItem
                        key={translation.language_code}
                        onPress={() =>
                          router.push(
                            `/backoffice/poi/edit-poi/${tour.uuid}/${translation.language_code}`
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
                  {canDeletePoi ? (
                    <DropdownSection>
                      <DropdownItem
                        key={`delete-${tour.uuid}`}
                        className="text-danger"
                        color="danger"
                        onPress={() => {
                          setSelectedPoi(tour);
                          setErrorMsgDelete(null);
                          onOpen();
                        }}
                        startContent={
                          <Icon
                            icon="solar:trash-bin-trash-line-duotone"
                            width="20"
                          />
                        }
                      >
                        Eliminar POI
                      </DropdownItem>
                    </DropdownSection>
                  ) : null}
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
                  href={`/backoffice/poi/create-poi/${tour.uuid}?exist_langs=${existLangs}&name=${titlePoi}`}
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
    [router, canDeletePoi, onOpen]
  );

  const filterByText = useCallback(
    (poi: Poi, search: string) =>
      poi.translations.some((translation) =>
        translation.title.toLowerCase().includes(search.toLowerCase())
      ),
    []
  );

  return (
    <>
      <DataTable<Poi>
        data={pois}
        isLoading={isLoading}
        columns={columns}
        statusOptions={statusOptions}
        initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
        initialSortColumn="title"
        getRowKey={(poi) => poi.uuid}
        renderCell={renderCell}
        filterByText={filterByText}
        ariaLabel="Pois list table"
        emptyLabel="No hay pois en el sistema"
        totalLabel={(count) => `${count} Pois en total`}
        topRightAction={
          <Link href="/backoffice/poi/create-poi">
            <Button
              color="secondary"
              endContent={
                <Icon icon="solar:clipboard-add-linear" width={20} />
              }
            >
              Nuevo Poi
            </Button>
          </Link>
        }
      />
      {canDeletePoi && selectedPoi && (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
          <ModalContent>
            {(onClose) => {
              const titleEs = selectedPoi.translations.find(
                (t) => t.language_code === DEFAULT_DISPLAY_LANGUAGE
              )?.title;
              return (
                <>
                  <ModalHeader>
                    <h5 className="text-lg">¿Estás completamente seguro?</h5>
                  </ModalHeader>
                  <ModalBody>
                    <p className="text-sm">
                      Esta acción no se puede deshacer. Esto eliminará
                      permanentemente el POI{" "}
                      <span className="text-primary">
                        {titleEs || selectedPoi.uuid}
                      </span>{" "}
                      de nuestros servidores.
                    </p>
                    {errorMsgDelete && (
                      <p className="text-danger text-tiny">{errorMsgDelete}</p>
                    )}
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      color="danger"
                      variant="light"
                      onPress={onDelete}
                      isLoading={isDeleting}
                      isDisabled={isDeleting}
                    >
                      Eliminar POI
                    </Button>
                    <Button
                      color="primary"
                      onPress={() => {
                        setSelectedPoi(null);
                        setErrorMsgDelete(null);
                        onClose();
                      }}
                      isDisabled={isDeleting}
                    >
                      Cerrar
                    </Button>
                  </ModalFooter>
                </>
              );
            }}
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default PoiTable;

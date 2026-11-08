"use client";

import {
  Button,
  Input,
  Link,
  Tab,
  Tabs,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Icon } from "@iconify/react/dist/iconify.js";

import UploadAudio from "@/app/components/uploadaudio/UploadAudio";
import UploadImages, {
  PreviewFile,
} from "@/app/components/uploadimages/UploadImages";
import EditAudioCard from "@/app/components/editmedia/EditAudioCard";
import EditImagesGrid from "@/app/components/editmedia/EditImagesGrid";
import { useSession } from "next-auth/react";
import { useErrorHandler } from "@/helpers/errorsHandler";
import { createTourMedia } from "@/services/tours/createTourMedia";
import { updateTourLang } from "@/services/tours/updateTourLang";
import { useParams } from "next/navigation";
import {
  getTourDetailsByLang,
  Tour,
} from "@/services/tours/getToursDetailsByLang";
import { downloadMedia } from "@/services/common/downloadMedia";
import { DeleteMediaModal } from "@/app/components/modals/deleteMediaModal";

type TabOrder = {
  info: { next: "media" | null; prev: null };
  media: { next: null; prev: "info" };
};

type TabKey = keyof TabOrder;

export interface TourFormValues {
  external_id: string;
  language_code: string;
  title: string;
  description: string;
  latitud: string;
  longitud: string;
  images: PreviewFile[];
  audio: File | null;
}

const defaultValues: TourFormValues = {
  external_id: "",
  language_code: "",
  title: "",
  description: "",
  latitud: "",
  longitud: "",
  images: [],
  audio: null,
};

export default function CreateTour() {
  const { data: session } = useSession();
  const handleError = useErrorHandler();
  const params = useParams();
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    trigger,
  } = useForm<TourFormValues>({ defaultValues });
  const [selectedImages, setSelectedImages] = useState<PreviewFile[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabKey | null>("info");
  const [visitedTabs, setVisitedTabs] = useState<TabKey[]>(["info"]);
  const [tour, setTour] = useState<Tour | null>(null);
  const [tourImagesMap, setTourImagesMap] = useState<
    { uuid: string; name: string }[]
  >([]);
  const [deleteName, setDeleteName] = useState<string>("");
  const [deleteUuid, setDeleteUuid] = useState<string>("");
  const [deleteType, setDeleteType] = useState<"audios" | "images" | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const token = session?.user?.accessToken;
    if (!token) return;
    const fetchTourDetails = async () => {
      try {
        const fetchedTourDetails = await getTourDetailsByLang(
          token,
          params.uuid as string,
          params.lang as string
        );
        setTour(fetchedTourDetails.tour);
        setValue("title", fetchedTourDetails.tour.title);
        setValue("description", fetchedTourDetails.tour.description);
      } catch (error) {
        handleError(error);
      }
    };
    fetchTourDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.accessToken]);

  useEffect(() => {
    if (tour?.images) {
      setTourImagesMap(
        tour.images.map((image, index) => ({
          uuid: image,
          name: `Imagen de ${tour.title} ${index + 1}`,
        }))
      );
    }
  }, [tour]);

  const handleCurrentTab = async (isContinue = true) => {
    const tabOrder: TabOrder = {
      info: { next: "media", prev: null },
      media: { next: null, prev: "info" },
    };

    const fieldsToValidate: Record<TabKey, Array<keyof TourFormValues>> = {
      info: ["title", "description"],
      media: ["images", "audio"],
    };

    if (selectedTab === null) {
      return;
    }

    const nextTab = tabOrder[selectedTab].next;
    if (isContinue && nextTab) {
      const result = await trigger(fieldsToValidate[selectedTab]);
      if (result) {
        setSelectedTab(nextTab);
        setVisitedTabs((prev) =>
          prev.includes(nextTab) ? prev : [...prev, nextTab]
        );
      }
    } else if (!isContinue && tabOrder[selectedTab].prev) {
      setSelectedTab(tabOrder[selectedTab].prev);
    }
  };

  const handleDownload = async (uuidMedia: string) => {
    try {
      await downloadMedia(uuidMedia);
    } catch (error) {
      console.error("Error downloading media:", error);
    }
  };

  const onSubmit = async (data: TourFormValues) => {
    setSuccessMessage(null);

    if (!data) return;

    try {
      if (!session?.user || !session.user.accessToken) {
        throw new Error("No valid session or accessToken");
      }

      const tourUuid = params.uuid as string;
      const tourLang = params.lang as string;
      let uploadedMedia = false;

      await updateTourLang(session.user.accessToken, tourUuid, {
        language_code: tourLang,
        title: data.title,
        description: data.description,
      });

      if (data.audio) {
        const formData = new FormData();
        formData.append("audio", data.audio, data.audio.name);

        await createTourMedia(
          session.user.accessToken,
          tourUuid,
          tourLang,
          formData
        );

        uploadedMedia = true;
      }

      if (data.images.length) {
        for (const image of data.images) {
          const formData = new FormData();
          formData.append("image", image, image.name);
          await createTourMedia(
            session.user.accessToken,
            tourUuid,
            tourLang,
            undefined,
            formData
          );

          uploadedMedia = true;
        }
      }

      if (uploadedMedia) {
        const refreshedTourDetails = await getTourDetailsByLang(
          session.user.accessToken,
          tourUuid,
          tourLang
        );

        setTour(refreshedTourDetails.tour);
        setSelectedAudio(null);
        setSelectedImages([]);
        setValue("audio", null);
        setValue("images", []);
      }

      setSuccessMessage("Cambios del tour guardados correctamente");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      setSuccessMessage(null);
      handleError(error);
    }
  };

  return (
    <form className="flex flex-row gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full flex-col items-center">
        <Tabs
          aria-label="Options"
          color="primary"
          variant="underlined"
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as TabKey)}
          disabledKeys={(["info", "media"] as TabKey[]).filter(
            (k) => !visitedTabs.includes(k)
          )}
          classNames={{
            base: "w-full",
            tabList:
              "gap-6 w-full relative rounded-none p-0 border-b border-divider justify-center",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-12 data-[disabled=true]:opacity-40 data-[disabled=true]:cursor-default",
            tabContent: "group-data-[selected=true]:text-primary",
            panel: "flex w-full justify-center py-4",
          }}
        >
          <Tab
            key="info"
            title={
              <div className="flex items-center space-x-2 mx-2">
                <Icon icon="solar:book-2-line-duotone" width="24" />
                <span>1. Información</span>
              </div>
            }
          >
            <div className="flex flex-col w-full max-w-2xl gap-2">
              <div className="flex gap-4 rounded-medium bg-secondary/20 p-4 align-middle mb-4">
                <Icon
                  icon="solar:info-circle-line-duotone"
                  className="text-primary flex-shrink-0"
                  width={36}
                />
                <p className="flex items-center text-tiny">
                  Por favor, introduce el nombre y la descripción del tour.
                  Recuerda que los primeros 65 caracteres serán utilizados como
                  resumen en la aplicación.
                </p>
              </div>
              <div className="w-2/3 flex flex-col gap-4 mx-auto">
                <Controller
                  name="title"
                  control={control}
                  rules={{
                    required: "El nombre del tour es requerido",
                    minLength: {
                      value: 6,
                      message:
                        "El nombre del tour debe tener al menos 6 caracteres",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      variant="bordered"
                      label="Nombre del tour"
                      placeholder="Ingresa el nombre del tour"
                      className="max-w-full"
                      isInvalid={!!errors.title}
                      errorMessage={errors.title && errors.title.message}
                    />
                  )}
                />

                <Controller
                  name="description"
                  control={control}
                  rules={{
                    required: "La descripción del tour es requerida",
                    minLength: {
                      value: 6,
                      message:
                        "La descripción del tour debe tener al menos 6 caracteres",
                    },
                  }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      variant="bordered"
                      label="Descripción del tour"
                      placeholder="Ingresa una descripción del tour"
                      className="max-w-full"
                      isInvalid={!!errors.description}
                      errorMessage={
                        errors.description && errors.description.message
                      }
                    />
                  )}
                />
              </div>
              <div className="flex justify-end gap-6 pt-4">
                <Button color="primary" onClick={() => handleCurrentTab(true)}>
                  Continuar
                </Button>
              </div>
            </div>
          </Tab>
          <Tab
            key="media"
            title={
              <div className="flex items-center space-x-2 mx-2">
                <Icon icon="solar:airbuds-check-line-duotone" width="24" />
                <span>2. Media</span>
              </div>
            }
          >
            <div className="flex flex-col w-full max-w-2xl gap-2">
              <div className="flex gap-4 rounded-medium bg-secondary/20 p-4 items-center mb-4">
                <Icon
                  icon="solar:info-circle-line-duotone"
                  className="text-primary flex-shrink-0"
                  width={36}
                />
                <p className="text-tiny">
                  Por favor, elige las imágenes y el audio para el tour.
                  Recuerda que debes seleccionar una imagen de portada, ya que
                  será la primera que aparezca en la aplicación. Para elegirla,
                  simplemente haz clic en la estrella una vez que hayas cargado
                  la imagen. Recuerda que si quieres subir nuevas imagenes o
                  audios, debes borrar las anteriores. Tambien si quieres
                  guardar alguna puedes descargarla.
                </p>
              </div>
              <div className="w-2/3 flex flex-col gap-4 mx-auto">
                {tour?.images && tour.images.length > 0 && tourImagesMap && (
                  <>
                    <p>Imagenes cargadas</p>
                    <EditImagesGrid
                      images={tourImagesMap}
                      onDownload={(image) => handleDownload(image.uuid)}
                      onDelete={(image, index) => {
                        setDeleteName(
                          `Imagen de ${tour.title} ${index + 1}`
                        );
                        setDeleteUuid(image.uuid);
                        setDeleteType("images");
                        onOpen();
                      }}
                    />
                  </>
                )}
                {tour?.audios && tour.audios.length > 0 && (
                  <>
                    <p>Audios cargados</p>
                    {tour.audios.map((audio, index) => {
                      const audioUuid =
                        typeof audio === "string"
                          ? audio
                          : (audio as any)?.uuid;
                      if (!audioUuid) return null;
                      const audioName = `Audio de ${tour.title} ${index + 1}`;
                      return (
                        <EditAudioCard
                          key={audioUuid}
                          uuid={audioUuid}
                          name={audioName}
                          onDownload={() => handleDownload(audioUuid)}
                          onDelete={() => {
                            setDeleteName(audioName);
                            setDeleteUuid(audioUuid);
                            setDeleteType("audios");
                            onOpen();
                          }}
                        />
                      );
                    })}
                  </>
                )}
                {(!tour?.images || tour.images.length <= 0) && (
                  <>
                    <Controller
                      name="images"
                      control={control}
                      rules={{
                        required: "El archivo de audio es requerido",
                      }}
                      render={({ field }) => (
                        <UploadImages
                          selectedImages={selectedImages}
                          setSelectedImages={setSelectedImages}
                          setValue={setValue}
                        />
                      )}
                    />
                    {!!errors.images && (
                      <span className="text-tiny text-danger">
                        {errors.images && errors.images.message}
                      </span>
                    )}
                  </>
                )}
                {(!tour?.audios || tour.audios.length <= 0) && (
                  <>
                    <Controller
                      name="audio"
                      control={control}
                      rules={{
                        required: "El archivo de audio es requerido",
                      }}
                      render={({ field }) => (
                        <UploadAudio
                          selectedAudio={selectedAudio}
                          setSelectedAudio={(file: File | null) => {
                            setSelectedAudio(file);
                            setValue("audio", file);
                          }}
                          setValue={setValue}
                        />
                      )}
                    />
                    {!!errors.audio && (
                      <span className="text-tiny text-danger">
                        {errors.audio && errors.audio.message}
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="flex justify-end gap-6 pt-4">
                <Link
                  underline="hover"
                  size="sm"
                  color="foreground"
                  className="cursor-pointer"
                  onClick={() => handleCurrentTab(false)}
                >
                  <Icon icon="ic:round-arrow-back-ios" className="mr-2" />
                  Volver
                </Link>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
                >
                  Editar Tour
                </Button>
              </div>
              {successMessage && (
                <div className="p-3 bg-success/10 text-success rounded-medium text-sm mt-4">
                  {successMessage}
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>
      <DeleteMediaModal
        isOpen={isOpen}
        onOpenChange={onClose}
        type={deleteType}
        name={deleteName}
        uuid={deleteUuid}
        token={session?.user?.accessToken as string}
        setPoi={setTour}
      />
    </form>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import {
  Button,
  Chip,
  Input,
  Link,
  Tab,
  Tabs,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { Controller, set, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";

import UploadAudio from "@/app/components/uploadaudio/UploadAudio";
import UploadImages, {
  PreviewFile,
} from "@/app/components/uploadimages/UploadImages";
import EditAudioCard from "@/app/components/editmedia/EditAudioCard";
import EditImagesGrid from "@/app/components/editmedia/EditImagesGrid";
import { useParams } from "next/navigation";
import {
  getPoiDetailsByLang,
  PointOfInterest,
} from "@/services/poi/getPoiDetailsByLang";
import { useErrorHandler } from "@/helpers/errorsHandler";
import flags from "@/data/flags.json";
import { updatePoiLang } from "@/services/poi/updatePoiLang";
import { downloadMedia } from "@/services/common/downloadMedia";
import { DeleteMediaModal } from "@/app/components/modals/deleteMediaModal";
import { createPoiMedia } from "@/services/poi/createPoiMedia";

type TabOrder = {
  info: { next: "media" | null; prev: null };
  media: { next: null; prev: "info" };
};

type TabKey = keyof TabOrder;

export interface PoiFormValues {
  language_code: string;
  title: string;
  description: string;
  images: PreviewFile[];
  audio: File | null;
}

const defaultValues: PoiFormValues = {
  language_code: "",
  title: "",
  description: "",
  images: [],
  audio: null,
};

export default function EditPointOfInterestLang() {
  const { data: session } = useSession();
  const params = useParams();
  const handleError = useErrorHandler();
  const [poi, setPoi] = useState<PointOfInterest | null>(null);

  useEffect(() => {
    const token = session?.user?.accessToken;
    if (!token) return;
    const fetchPoiDetails = async () => {
      try {
        const fetchedPoiDetails = await getPoiDetailsByLang(
          token,
          params.uuid as string,
          params.lang as string
        );
        setPoi(fetchedPoiDetails.point_of_interest);
        setValue("title", fetchedPoiDetails.point_of_interest.title);
        setValue(
          "description",
          fetchedPoiDetails.point_of_interest.description
        );
        console.log("fetchedPoiDetails", fetchedPoiDetails);
      } catch (error) {
        handleError(error);
      }
    };
    fetchPoiDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.accessToken]);

  useEffect(() => {
    if (Array.isArray(poi?.images) && poi.images.length > 0) {
      const mappedImages = poi.images
        .map((image, index) => {
          const imageUuid = typeof image === "string" ? image : image?.uuid;
          if (!imageUuid) return null;
          return {
            uuid: imageUuid,
            name: `Imagen de ${poi?.title ?? "POI"} ${index + 1}`,
          };
        })
        .filter(Boolean) as { uuid: string; name: string }[];

      setPoiImagesMap(mappedImages);
    } else {
      setPoiImagesMap([]);
    }
    console.log("poi", poi);
  }, [poi]);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    getValues,
    setValue,
    setError,
    trigger,
    watch,
  } = useForm<PoiFormValues>({ defaultValues });
  const [selectedImages, setSelectedImages] = useState<PreviewFile[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabKey | null>("info");
  const [visitedTabs, setVisitedTabs] = useState<TabKey[]>(["info"]);
  const [poiDataForm, setPoiDataForm] = useState<PoiFormValues | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");
  const [deleteUuid, setDeleteUuid] = useState<string>("");
  const [deleteType, setDeleteType] = useState<"audios" | "images" | null>(
    null
  );
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [poiImagesMap, setPoiImagesMap] = useState<
    { uuid: any; name: string }[]
  >([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const poiImages = Array.isArray(poi?.images) ? poi.images : [];
  const poiAudios = Array.isArray(poi?.audios) ? poi.audios : [];

  const handleCurrentTab = async (isContinue = true) => {
    const tabOrder: TabOrder = {
      info: { next: "media", prev: null },
      media: { next: null, prev: "info" },
    };

    const fieldsToValidate: Record<TabKey, Array<keyof PoiFormValues>> = {
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

  const onSubmit = async (data: PoiFormValues) => {
    setSuccessMessage(null);

    if (data) {
      try {
        if (session?.user && session.user.accessToken) {
          const poiUuid = params.uuid as string;
          const poiLang = params.lang as string;
          let uploadedMedia = false;

          const updatePoiLangRes = await updatePoiLang(
            session.user.accessToken,
            poiUuid,
            {
              language_code: poiLang,
              title: data.title,
              description: data.description,
            }
          );
          console.log("updatePoiLangRes", updatePoiLangRes);

          if (data.audio) {
            const formData = new FormData();
            formData.append("audio", data.audio, data.audio.name);

            const createPoiAudioRes = await createPoiMedia(
              session.user.accessToken,
              poiUuid,
              poiLang,
              formData
            );

            uploadedMedia = true;
            console.log("Se cargo el audio:", createPoiAudioRes);
          }

          if (data.images.length) {
            for (const image of data.images) {
              const formData = new FormData();
              formData.append("image", image, image.name);
              const createPoiImageRes = await createPoiMedia(
                session.user.accessToken,
                poiUuid,
                poiLang,
                undefined,
                formData
              );
              uploadedMedia = true;
              console.log(
                "Se cargo la imagen:",
                createPoiImageRes,
                formData.get("image")
              );
            }
          }

          if (uploadedMedia) {
            const refreshedPoiDetails = await getPoiDetailsByLang(
              session.user.accessToken,
              poiUuid,
              poiLang
            );

            setPoi(refreshedPoiDetails.point_of_interest);
            setSelectedAudio(null);
            setSelectedImages([]);
            setValue("audio", null);
            setValue("images", []);
          }

          setSuccessMessage(
            "Cambios del punto de interés guardados correctamente"
          );
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        } else {
          console.log("No valid session or accessToken");
          throw new Error("No valid session or accessToken");
        }
      } catch (error) {
        console.log("Error in onSubmit:", error);
        console.error(error);
        setSuccessMessage(null);
        handleError(error);
      }
    }
  };

  return (
    <form className="flex flex-row gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full flex-col items-center">
        <div className="fixed z-50 bottom-8 right-8">
          <div className="flex items-center gap-2">
            <Button
              onPress={() => {
                const filteredImages = poiImagesMap?.filter(
                  (image) => image.name !== "Imagen de test español 1"
                );
                setPoiImagesMap(filteredImages);
              }}
            >
              xyz
            </Button>
            <Chip variant="faded" size="md" className="px-2">
              <strong className="mr-1">Editando:</strong> {poi?.title}
            </Chip>
            <Chip
              variant="faded"
              size="md"
              className="px-2"
              startContent={
                poi?.language_code &&
                flags[poi.language_code as keyof typeof flags] ? (
                  <Image
                    alt={poi.language_code}
                    src={flags[poi.language_code as keyof typeof flags]}
                    width={16}
                    height={16}
                    className="mx-1"
                  />
                ) : null
              }
            >
              {poi?.language_code?.toUpperCase()}
            </Chip>
          </div>
        </div>
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
            <div className="flex flex-col w-full max-w-2xl gap-4">
              <div className="flex gap-4 rounded-medium bg-secondary/20 p-4 align-middle mb-2">
                <Icon
                  icon="solar:info-circle-line-duotone"
                  className="text-primary flex-shrink-0"
                  width={36}
                />
                <p className="flex items-center text-tiny">
                  Por favor, introduce el nombre y la descripción del punto de
                  interés. Recuerda que los primeros 65 caracteres serán
                  utilizados como resumen en la aplicación.
                </p>
              </div>
              <div className="w-2/3 flex flex-col gap-4 mx-auto">
                <Controller
                  name="title"
                  control={control}
                  rules={{
                    required: "El nombre del punto de interés es requerido",
                    minLength: {
                      value: 6,
                      message:
                        "El nombre del punto de interés debe tener al menos 6 caracteres",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      variant="bordered"
                      label="Nombre del punto de interés"
                      placeholder="Ingresa el nombre del punto de interés"
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
                    required:
                      "La descripción del punto de interés es requerida",
                    minLength: {
                      value: 6,
                      message:
                        "La descripción del punto de interés debe tener al menos 6 caracteres",
                    },
                  }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      variant="bordered"
                      label="Descripción del punto de interés"
                      placeholder="Ingresa una descripción del punto de interés"
                      className="max-w-full"
                      isInvalid={!!errors.description}
                      errorMessage={
                        errors.description && errors.description.message
                      }
                    />
                  )}
                />
              </div>
              <div className="flex justify-end items-center gap-6 pt-4">
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
            <div className="flex flex-col w-full max-w-2xl gap-4">
              <div className="flex gap-4 rounded-medium bg-secondary/20 p-4 items-center mb-2">
                <Icon
                  icon="solar:info-circle-line-duotone"
                  className="text-primary flex-shrink-0"
                  width={36}
                />
                <p className="text-tiny">
                  Recuerda que si quieres subir nuevas imagenes o audios, debes
                  borrar las anteriores. Tambien si quieres guardar alguna
                  puedes descargarla.
                </p>
              </div>
              <div className="w-2/3 flex flex-col gap-4 mx-auto">
                {poiImages.length > 0 && poiImagesMap.length > 0 && (
                  <>
                    <p>Imagenes cargadas</p>
                    <EditImagesGrid
                      images={poiImagesMap}
                      onDownload={(image) => handleDownload(image.uuid)}
                      onDelete={(image, index) => {
                        setDeleteName(
                          `Imagen de ${poi?.title ?? "POI"} ${index + 1}`
                        );
                        setDeleteUuid(image.uuid);
                        setDeleteType("images");
                        onOpen();
                      }}
                    />
                  </>
                )}
                {poiAudios.length > 0 && (
                  <>
                    <p>Audios cargados</p>
                    {poiAudios.map((audio, index) => {
                      const audioUuid =
                        typeof audio === "string" ? audio : audio?.uuid;
                      if (!audioUuid) return null;
                      const audioName = `Audio de ${
                        poi?.title ?? "POI"
                      } ${index + 1}`;
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
                {poiImages.length <= 0 && (
                  <>
                    <Controller
                      name="images"
                      control={control}
                      // rules={{
                      //   required: "El archivo de audio es requerido",
                      // }}
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
                {poiAudios.length <= 0 && (
                  <>
                    <Controller
                      name="audio"
                      control={control}
                      // rules={{
                      //   required: "El archivo de audio es requerido",
                      // }}
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
              <div className="flex justify-end items-center gap-6 pt-4">
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
                  Editar Punto de Interés
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
        setPoi={setPoi}
      />
    </form>
  );
}

"use client";

import {
  Button,
  Chip,
  Input,
  Link,
  Tab,
  Tabs,
  Textarea,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Icon } from "@iconify/react/dist/iconify.js";

import SelectorLangs from "@/app/components/selectorlangs/SelectorLangs";
import UploadAudio from "@/app/components/uploadaudio/UploadAudio";
import UploadImages, {
  PreviewFile,
} from "@/app/components/uploadimages/UploadImages";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import flags from "@/data/flags.json";
import { createStopLang } from "@/services/stop/createStopLang";
import { createStopMedia } from "@/services/stop/createStopMedia";
import SuccessModal from "@/app/backoffice/stops/components/SucessModal";
import { useErrorHandler } from "@/helpers/errorsHandler";

type TabOrder = {
  language: { next: "info" | null; prev: null };
  info: { next: "media" | null; prev: "language" };
  media: { next: null; prev: "info" };
};

type TabKey = keyof TabOrder;

export interface StopFormValues {
  language_code: string;
  title: string;
  description: string;
  latitud: string;
  longitud: string;
  points_of_interest: string[];
  images: PreviewFile[];
  audio: File | null;
}

const defaultValues: StopFormValues = {
  language_code: "",
  title: "",
  description: "",
  latitud: "",
  longitud: "",
  points_of_interest: [],
  images: [],
  audio: null,
};

interface queryParams {
  exist_langs: string;
  name: string;
}

const getInitialSteps = () => [
  { label: "Creando traducción", completed: false },
  { label: "Subiendo imágenes", completed: false },
  { label: "Subiendo audio", completed: false },
];

export default function UpdateStopLang() {
  const { data: session } = useSession();
  const handleError = useErrorHandler();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    getValues,
    setValue,
    setError,
    trigger,
    watch,
  } = useForm<StopFormValues>({ defaultValues });
  const [selectedImages, setSelectedImages] = useState<PreviewFile[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabKey | null>("language");
  const [visitedTabs, setVisitedTabs] = useState<TabKey[]>(["language"]);
  const [poiDataForm, setPoiDataForm] = useState<StopFormValues | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [steps, setSteps] = useState(getInitialSteps);

  const queryParams: queryParams = {
    exist_langs: "",
    name: "",
  };

  searchParams.forEach((value, key) => {
    if (key in queryParams) {
      queryParams[key as keyof typeof queryParams] = value;
    }
  });

  const existingLangs = queryParams.exist_langs.split(",");

  const updateStep = (index: number, completed: boolean) => {
    setSteps((prevSteps) => {
      const newSteps = [...prevSteps];
      newSteps[index].completed = completed;
      return newSteps;
    });
  };

  const resetSteps = () => {
    setSteps(getInitialSteps());
  };

  const handleCurrentTab = async (isContinue = true) => {
    const tabOrder: TabOrder = {
      language: { next: "info", prev: null },
      info: { next: "media", prev: "language" },
      media: { next: null, prev: "info" },
    };

    const fieldsToValidate: Record<TabKey, Array<keyof StopFormValues>> = {
      language: ["language_code"],
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

  console.log('getValues("language_code")', getValues("language_code"));

  const onSubmit = async (data: StopFormValues) => {
    setSuccessMessage(null);

    if (data) {
      resetSteps();
      setIsModalOpen(true);
      try {
        if (session?.user && session.user.accessToken) {
          const createStopLangRes = await createStopLang(
            session.user.accessToken,
            params.uuid as string,
            {
              language_code: data.language_code,
              title: data.title,
              description: data.description,
            }
          );
          updateStep(0, true);
          if (createStopLangRes.stop_uuid && data.audio) {
            const formData = new FormData();
            formData.append("audio", data.audio, data.audio.name);

            const createPoiAudioRes = await createStopMedia(
              session.user.accessToken,
              createStopLangRes.stop_uuid,
              data.language_code,
              formData
            );
            updateStep(2, true);

            console.log("Se cargo el audio:", createPoiAudioRes);
          }
          if (createStopLangRes.stop_uuid && data.images.length) {
            for (const image of data.images) {
              const formData = new FormData();
              formData.append("image", image, image.name);
              const createPoiImageRes = await createStopMedia(
                session.user.accessToken,
                createStopLangRes.stop_uuid,
                data.language_code,
                undefined,
                formData
              );
              updateStep(1, true);
              console.log(
                "Se cargo la imagen:",
                createPoiImageRes,
                formData.get("image")
              );
            }
          }
          setSuccessMessage("Traducción de la parada creada correctamente");
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
        setIsModalOpen(false);
        setSuccessMessage(null);
        handleError(error);
      }
    }
  };

  const handleRedirect = () => {
    router.push("/backoffice/stops");
  };

  return (
    <form className="flex flex-row gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full flex-col items-center">
        <div className="fixed bottom-8 right-8">
          <div className="flex items-center gap-2">
            <Chip variant="bordered" size="md" className="px-2">
              <strong className="mr-1">Creando traducción de:</strong>{" "}
              {queryParams?.name}
            </Chip>
            {getValues("language_code") && (
              <Chip
                variant="bordered"
                size="md"
                className="px-2"
                startContent={
                  <Image
                    alt={"lang code"}
                    src={
                      flags[getValues("language_code") as keyof typeof flags]
                    }
                    width={16}
                    height={16}
                    className="mx-1"
                  />
                }
              >
                {getValues("language_code").toUpperCase()}
              </Chip>
            )}
          </div>
        </div>
        <Tabs
          aria-label="Options"
          color="primary"
          variant="underlined"
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as TabKey)}
          disabledKeys={(["language", "info", "media"] as TabKey[]).filter(
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
            key="language"
            title={
              <div className="flex items-center space-x-2 mx-2">
                <Icon icon="solar:globus-outline" width="24" />
                <span>1. Idioma</span>
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
                  Selecciona el idioma que quieres agregar a tu parada. Recuerda
                  que solo se cargarán los idiomas disponibles y habilitados en
                  la aplicación, si algun idioma esta deshabilitado es por que
                  ya existe esta traducción.
                </p>
              </div>
              <div className="w-2/3 flex flex-col gap-4 mx-auto">
                <SelectorLangs
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                  existingLangs={existingLangs}
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
            key="info"
            title={
              <div className="flex items-center space-x-2 mx-2">
                <Icon icon="solar:book-2-line-duotone" width="24" />
                <span>2. Información</span>
              </div>
            }
          >
            <div className="flex flex-col w-full max-w-2xl gap-4">
              <div className="flex gap-4 rounded-medium bg-secondary/20 p-4 align-middle mb-4">
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
                    required: "El nombre de la parada es requerido",
                    minLength: {
                      value: 6,
                      message:
                        "El nombre de la parada debe tener al menos 6 caracteres",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      variant="bordered"
                      label="Nombre de la parada"
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
                    required: "La descripción de la parada es requerida",
                    minLength: {
                      value: 6,
                      message:
                        "La descripción de la parada debe tener al menos 6 caracteres",
                    },
                  }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      variant="bordered"
                      label="Descripción de la parada"
                      placeholder="Ingresa una descripción de la parada"
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
                <span>3. Media</span>
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
                  Por favor, elige las imágenes y el audio para la parada.
                  Recuerda que debes seleccionar una imagen de portada, ya que
                  será la primera que aparezca en la aplicación. Para elegirla,
                  simplemente haz clic en la estrella una vez que hayas cargado
                  la imagen.
                </p>
              </div>
              <div className="w-2/3 flex flex-col gap-4 mx-auto">
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
                  Crear traducción de la parada
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
      <SuccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        steps={steps}
        onRedirect={handleRedirect}
        title="Guardando traducción de parada..."
        successMessage="¡Traducción creada con éxito!"
      />
    </form>
  );
}

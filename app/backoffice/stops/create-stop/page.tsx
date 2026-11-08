"use client";

import { useEffect, useState } from "react";
import { Button, Input, Link, Tab, Tabs, Textarea } from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { StopsOrPointsOfInterest } from "@/app/components/reorder/ingredients";
import { Icon } from "@iconify/react/dist/iconify.js";

import SelectorLangs from "@/app/components/selectorlangs/SelectorLangs";
import UploadImages, {
  PreviewFile,
} from "@/app/components/uploadimages/UploadImages";
import UploadAudio from "@/app/components/uploadaudio/UploadAudio";
import ReOrderList from "@/app/components/reorder/ReOrderList";
import LocationSelector from "@/app/components/map/LocationSelector";
import { useSession } from "next-auth/react";
import { createStop } from "@/services/stop/createStop";
import { createStopLang } from "@/services/stop/createStopLang";
import { createStopMedia } from "@/services/stop/createStopMedia";
import { getPois, Poi } from "@/services/poi/getPois";
import { useErrorHandler } from "@/helpers/errorsHandler";
import { addPoiToStop } from "@/services/stop/addPoiToStop";
import SuccessModal from "../components/SucessModal";
import { useRouter } from "next/navigation";

type TabOrder = {
  language: { next: "info" | null; prev: null };
  info: { next: "pointsOfInterest" | null; prev: "language" };
  pointsOfInterest: { next: "media" | null; prev: "info" };
  media: { next: null; prev: "pointsOfInterest" };
};

type TabKey = keyof TabOrder;

export interface StopFormValues {
  language_code: string;
  title: string;
  description: string;
  latitud: string;
  longitud: string;
  checkpoints: StopsOrPointsOfInterest[];
  images: PreviewFile[];
  audio: File | null;
}

const defaultValues: StopFormValues = {
  language_code: "",
  title: "",
  description: "",
  latitud: "",
  longitud: "",
  checkpoints: [],
  images: [],
  audio: null,
};

const initialPointMap = {
  lat: 37.3013417,
  lng: -97.3967412,
};

const getInitialSteps = () => [
  { label: "Creando parada", completed: false },
  { label: "Creando traducción", completed: false },
  { label: "Agregando puntos de interés", completed: false },
  { label: "Subiendo imágenes", completed: false },
  { label: "Subiendo audio", completed: false },
];

export default function CreateStop() {
  const { data: session } = useSession();
  const handleError = useErrorHandler();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [steps, setSteps] = useState(getInitialSteps);
  const methods = useForm<StopFormValues>({
    defaultValues: {
      language_code: "",
      title: "",
      description: "",
      latitud: "",
      longitud: "",
      checkpoints: [],
      images: [],
      audio: null,
    },
  });

  const {
    control,
    setValue,
    formState: { errors, isSubmitting },
    setError,
    getValues,
    handleSubmit,
    watch,
    trigger,
  } = methods;
  const [tabs, setTabs] = useState<StopsOrPointsOfInterest[]>([]);
  const [selectedImages, setSelectedImages] = useState<PreviewFile[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabKey | null>("language");
  const [visitedTabs, setVisitedTabs] = useState<TabKey[]>(["language"]);
  const [location, setLocation] = useState<{ lat: number; lng: number }>(
    initialPointMap
  );
  const [pois, setPois] = useState<Poi[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const latitud = watch("latitud");
  const longitud = watch("longitud");
  const languageCode = watch("language_code");

  useEffect(() => {
    if (latitud && longitud) {
      setLocation({ lat: parseFloat(latitud), lng: parseFloat(longitud) });
    }
  }, [latitud, longitud]);

  useEffect(() => {
    setValue("latitud", location.lat.toString());
    setValue("longitud", location.lng.toString());
  }, [location, setValue]);

  useEffect(() => {
    const token = session?.user?.accessToken;
    if (!token) return;
    const fetchPois = async () => {
      try {
        const fetchedUTours = await getPois(token);
        const selectedLanguageCode = getValues("language_code");
        const filteredPois = fetchedUTours.filter((poi) =>
          poi.translations.some(
            (translation) => translation.language_code === selectedLanguageCode
          )
        );

        if (filteredPois.length > 0) setPois(filteredPois);
      } catch (error) {
        handleError(error);
      }
    };

    if (languageCode) {
      fetchPois();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageCode]);

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
      info: { next: "pointsOfInterest", prev: "language" },
      pointsOfInterest: { next: "media", prev: "info" },
      media: { next: null, prev: "pointsOfInterest" },
    };

    const fieldsToValidate: Record<TabKey, Array<keyof StopFormValues>> = {
      language: ["language_code"],
      info: ["title", "description", "latitud", "longitud"],
      pointsOfInterest: [],
      media: ["images", "audio"],
    };

    if (selectedTab === null) {
      return;
    }

    const nextTab = tabOrder[selectedTab].next;
    if (isContinue && nextTab) {
      const result = await trigger(fieldsToValidate[selectedTab]);
      console.log("pois", pois);
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

  const onSubmit = async (data: StopFormValues) => {
    setSuccessMessage(null);

    if (data) {
      resetSteps();
      setIsModalOpen(true);
      try {
        if (session?.user && session.user.accessToken) {
          const createStopRes = await createStop(
            session.user.accessToken,
            parseFloat(data.latitud),
            parseFloat(data.longitud)
          );
          updateStep(0, true);
          console.log("createStopRes", createStopRes);

          if (createStopRes.stop_uuid) {
            const createStopLangRes = await createStopLang(
              session.user.accessToken,
              createStopRes.stop_uuid,
              {
                language_code: data.language_code,
                title: data.title,
                description: data.description,
              }
            );
            updateStep(1, true);
            console.log("createPoiLangRes", createStopLangRes);

            const addPoiToStopRes = await addPoiToStop(
              session.user.accessToken,
              createStopRes.stop_uuid,
              tabs
            );
            updateStep(2, true);
            console.log("addPoiToStopRes", addPoiToStopRes);

            if (createStopLangRes.stop_uuid && data.audio) {
              const formData = new FormData();
              formData.append("audio", data.audio, data.audio.name);

              const createPoiAudioRes = await createStopMedia(
                session.user.accessToken,
                createStopLangRes.stop_uuid,
                data.language_code,
                formData
              );
              updateStep(4, true);
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
                updateStep(3, true);
                console.log(
                  "Se cargo la imagen:",
                  createPoiImageRes,
                  formData.get("image")
                );
              }
            }
          }
          setSuccessMessage("Parada creada correctamente");
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

    console.log("tab", tabs);
    console.log("selectedAudio", selectedAudio);

    console.log(data);
  };

  const handleRedirect = () => {
    router.push("/backoffice/stops");
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
          disabledKeys={(
            [
              "language",
              "info",
              "pointsOfInterest",
              "media",
            ] as TabKey[]
          ).filter((k) => !visitedTabs.includes(k))}
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
                  Selecciona el idioma inicial de la parada, después de crearla
                  podrás asignarle más idiomas. Recuerda que solo se cargarán
                  los idiomas disponibles y habilitados en la aplicación.
                </p>
              </div>
              <div className="w-2/3 flex flex-col gap-4 mx-auto">
                <SelectorLangs
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                />
              </div>
              <div className="flex justify-end gap-6 pt-4">
                <Button color="primary" onPress={() => handleCurrentTab(true)}>
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
            <div className="flex flex-col w-full max-w-2xl gap-2">
              <div className="flex gap-4 rounded-medium bg-secondary/20 p-4 align-middle mb-4">
                <Icon
                  icon="solar:info-circle-line-duotone"
                  className="text-primary flex-shrink-0"
                  width={36}
                />
                <p className="flex items-center text-tiny">
                  Por favor, introduce el nombre y la descripción de la parada.
                  Recuerda que los primeros 65 caracteres serán utilizados como
                  resumen en la aplicación.
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
                      placeholder="Ingresa el nombre de la parada"
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
              <div className="border-medium border-default-200 rounded-medium py-3 px-4">
                <h2 className="text-sm">Selecciona una ubicación en el mapa</h2>
                <h2 className="text-sm text-default-400 pb-3">
                  Desplaza el mapa hasta el punto deseado y haz clic para
                  seleccionar la ubicación.
                </h2>
                <div className="flex gap-4 pb-4">
                  <Controller
                    name="latitud"
                    control={control}
                    rules={{
                      required: "La latitud es requerida",
                      minLength: {
                        value: 6,
                        message: "La latitud debe tener al menos 6 caracteres",
                      },
                      validate: (value) =>
                        parseFloat(value) !== initialPointMap.lat ||
                        "No puede ser igual a la latitud por defecto",
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        variant="bordered"
                        label="Latitud"
                        placeholder="Ingresa la latitud"
                        className="max-w-full"
                        isInvalid={!!errors.latitud}
                        errorMessage={errors.latitud && errors.latitud.message}
                      />
                    )}
                  />
                  <Controller
                    name="longitud"
                    control={control}
                    rules={{
                      required: "La longitud es requerida",
                      minLength: {
                        value: 6,
                        message: "La longitud debe tener al menos 6 caracteres",
                      },
                      validate: (value) =>
                        parseFloat(value) !== initialPointMap.lng ||
                        "No puede ser igual a la longitud por defecto",
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        variant="bordered"
                        label="Longitud"
                        placeholder="Ingresa la longitud"
                        className="max-w-full"
                        isInvalid={!!errors.longitud}
                        errorMessage={
                          errors.longitud && errors.longitud.message
                        }
                      />
                    )}
                  />
                </div>
                <LocationSelector
                  location={location}
                  setLocation={setLocation}
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
            key="pointsOfInterest"
            title={
              <div className="flex items-center space-x-2 mx-2">
                <Icon icon="solar:clipboard-list-line-duotone" width="24" />
                <span>3. Puntos de interés</span>
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
                  Explora, añade o elimina los puntos de interés en tu parada.
                  Recuerda que solo se cargarán aquellos relacionados con el
                  idioma de la parada que hayas elegido.
                </p>
              </div>
              <ReOrderList<StopFormValues>
                tabs={tabs}
                setTabs={setTabs}
                setValue={setValue}
                errors={errors}
                setError={setError}
                watch={watch}
                control={control}
                items={pois}
                showDragHandle={false}
                showIndex={false}
                allowEmpty
              />
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
                <span>4. Media</span>
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
                <UploadImages
                  selectedImages={selectedImages}
                  setSelectedImages={setSelectedImages}
                  setValue={setValue}
                />
                <UploadAudio
                  selectedAudio={selectedAudio}
                  setSelectedAudio={setSelectedAudio}
                  setValue={setValue}
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
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isSubmitting}
                  isDisabled={isSubmitting}
                >
                  Crear Parada
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
        title="Guardando parada..."
      />
    </form>
  );
}

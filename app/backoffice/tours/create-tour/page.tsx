"use client";

import { Button, Input, Link, Tab, Tabs, Textarea } from "@heroui/react";
import { useEffect, useState } from "react";
import { Controller, useForm, set } from "react-hook-form";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/navigation";

import { StopsOrPointsOfInterest } from "@/app/components/reorder/ingredients";
import SelectorLangs from "@/app/components/selectorlangs/SelectorLangs";
import UploadAudio from "@/app/components/uploadaudio/UploadAudio";
import UploadImages, {
  PreviewFile,
} from "@/app/components/uploadimages/UploadImages";
import LocationSelector from "@/app/components/map/LocationSelector";
import ReOrderListTour from "../components/reorder/ReOrderListTour";
import { getPois, Poi } from "@/services/poi/getPois";
import { useSession } from "next-auth/react";
import { useErrorHandler } from "@/helpers/errorsHandler";
import { getStops, Stop } from "@/services/stop/getStops";
import { createTour } from "@/services/tours/createTour";
import { createTourLang } from "@/services/tours/createTourLang";
import { createCheckpoint } from "../../../../services/checkpoints/createCheckpoint";
import { createTourMedia } from "@/services/tours/createTourMedia";
import SuccessModal from "@/app/backoffice/stops/components/SucessModal";

type TabOrder = {
  language: { next: "info" | null; prev: null };
  info: { next: "stopsAndPointsOfInterest" | null; prev: "language" };
  stopsAndPointsOfInterest: { next: "media" | null; prev: "info" };
  media: { next: null; prev: "stopsAndPointsOfInterest" };
};

type TabKey = keyof TabOrder;

type Tab = {
  label: string;
  value: string;
  type: string;
  language: string;
  description: string;
};

export interface TourFormValues {
  external_id: string;
  language_code: string;
  title: string;
  description: string;
  latitud: string;
  longitud: string;
  checkpoints?: Tab[];
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
  checkpoints: [],
  images: [],
  audio: null,
};

const initialPointMap = {
  lat: 37.3013417,
  lng: -97.3967412,
};

const getInitialSteps = () => [
  { label: "Creando tour", completed: false },
  { label: "Creando traducción", completed: false },
  { label: "Agregando paradas y puntos de interés", completed: false },
  { label: "Subiendo imágenes", completed: false },
  { label: "Subiendo audio", completed: false },
];

export default function CreateTour() {
  const { data: session } = useSession();
  const handleError = useErrorHandler();
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    getValues,
    setValue,
    setError,
    watch,
    trigger,
  } = useForm<TourFormValues>({ defaultValues });
  const [tabs, setTabs] = useState<StopsOrPointsOfInterest[]>([]);
  const [selectedImages, setSelectedImages] = useState<PreviewFile[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState<TabKey | null>("language");
  const [visitedTabs, setVisitedTabs] = useState<TabKey[]>(["language"]);
  const [location, setLocation] = useState<{ lat: number; lng: number }>(
    initialPointMap
  );
  const [items, setItems] = useState<Stop[] | Poi[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [steps, setSteps] = useState(getInitialSteps);

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

  useEffect(() => {
    const token = session?.user?.accessToken;
    if (!token) return;
    const fetchPois = async () => {
      try {
        const fetchedPois = await getPois(token);
        const selectedLanguageCode = getValues("language_code");
        const filteredPois = fetchedPois.filter((poi) =>
          poi.translations.some(
            (translation) => translation.language_code === selectedLanguageCode
          )
        );

        if (filteredPois.length > 0) {
          const mappedPois = filteredPois.map((poi) => ({
            ...poi,
            type: "Punto de interés",
          }));
          setItems((prevItems) => [...prevItems, ...mappedPois]);
        }
      } catch (error) {
        handleError(error);
      }
    };
    const fetchStops = async () => {
      try {
        const fetchedStops = await getStops(token);
        const selectedLanguageCode = getValues("language_code");
        const filteredStops = fetchedStops.filter((poi) =>
          poi.translations.some(
            (translation) => translation.language_code === selectedLanguageCode
          )
        );
        if (filteredStops.length > 0) {
          const mappedStops = filteredStops.map((stop) => ({
            ...stop,
            type: "Parada",
          }));
          setItems((prevItems) => [...prevItems, ...mappedStops]);
        }
      } catch (error) {
        handleError(error);
      }
    };

    if (languageCode) {
      fetchPois();
      fetchStops();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageCode]);

  const handleCurrentTab = async (isContinue = true) => {
    const tabOrder: TabOrder = {
      language: { next: "info", prev: null },
      info: { next: "stopsAndPointsOfInterest", prev: "language" },
      stopsAndPointsOfInterest: { next: "media", prev: "info" },
      media: { next: null, prev: "stopsAndPointsOfInterest" },
    };

    const fieldsToValidate: Record<TabKey, Array<keyof TourFormValues>> = {
      language: ["external_id", "language_code"],
      info: ["title", "description"],
      stopsAndPointsOfInterest: ["checkpoints"],
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

  const onSubmit = async (data: TourFormValues) => {
    if (data) {
      resetSteps();
      setIsModalOpen(true);
      try {
        if (session?.user && session.user.accessToken) {
          const createTourRes = await createTour(
            session.user.accessToken,
            Number(data.external_id),
            parseFloat(data.latitud),
            parseFloat(data.longitud)
          );
          updateStep(0, true);
          console.log("createStopRes", createTourRes);

          if (createTourRes.tour_uuid) {
            const createTourLangRes = await createTourLang(
              session.user.accessToken,
              createTourRes.tour_uuid,
              {
                language_code: data.language_code,
                title: data.title,
                description: data.description,
              }
            );
            updateStep(1, true);
            if (createTourLangRes.tour_uuid) {
              const createCheckpointRes = await createCheckpoint(
                session.user.accessToken,
                createTourLangRes.tour_uuid,
                data.checkpoints!
              );
              updateStep(2, true);

              console.log("Checkpoints creados:", createCheckpointRes);
            }
            if (createTourLangRes.tour_uuid && data.audio) {
              const formData = new FormData();
              formData.append("audio", data.audio, data.audio.name);

              const createPoiAudioRes = await createTourMedia(
                session.user.accessToken,
                createTourLangRes.tour_uuid,
                data.language_code,
                formData,
                undefined
              );
              updateStep(4, true);

              console.log("Se cargo el audio:", createPoiAudioRes);
            }
            if (createTourLangRes.tour_uuid && data.images.length) {
              for (const image of data.images) {
                const formData = new FormData();
                formData.append("image", image, image.name);
                const createPoiImageRes = await createTourMedia(
                  session.user.accessToken,
                  createTourLangRes.tour_uuid,
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
        } else {
          console.log("No valid session or accessToken");
          throw new Error("No valid session or accessToken");
        }
      } catch (error) {
        console.log("Error in onSubmit:", error);
        console.error(error);
        setIsModalOpen(false);
        handleError(error);
      }
    }

    console.log("tab", tabs);
    console.log("selectedAudio", selectedAudio);

    console.log(data);
  };

  const handleRedirect = () => {
    router.push("/backoffice/tours");
  };

  return (
    (<form className="flex flex-row gap-4" onSubmit={handleSubmit(onSubmit)}>
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
              "stopsAndPointsOfInterest",
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
                  Selecciona el idioma inicial del tour, después de crearlo
                  podrás asignarle más idiomas. Ingresa el Bokun ID, es el
                  identificador único de tu tour en Bokun y nos permite
                  relacionarlo con el agendamiento.
                </p>
              </div>
              <div className="w-2/3 flex flex-col gap-4 mx-auto">
                <Controller
                  name="external_id"
                  control={control}
                  rules={{
                    required: "Este campo es obligatorio",
                    minLength: {
                      value: 6,
                      message: "El Bokun ID debe tener al menos 6 números",
                    },
                    maxLength: {
                      value: 20,
                      message: "El Bokun ID no puede tener más de 20 números",
                    },
                    pattern: {
                      value: /^[0-9]*$/,
                      message: "El Bokun ID solo puede contener números",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      variant="bordered"
                      size="sm"
                      label="Bokun ID"
                      className="max-w-full"
                      isInvalid={!!errors.external_id}
                      errorMessage={
                        errors.external_id && errors.external_id.message
                      }
                    />
                  )}
                />
                <SelectorLangs
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
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
              <div className="border-medium border-default-200 rounded-medium py-3 px-4">
                <h2 className="text-sm">
                  Selecciona la ubicación de recogida del tour en el mapa
                </h2>
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
            key="stopsAndPointsOfInterest"
            title={
              <div className="flex items-center space-x-2 mx-2">
                <Icon icon="solar:clipboard-list-line-duotone" width="24" />
                <span>3. Paradas y puntos de interés</span>
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
                  Explora, añade y organiza las paradas y puntos de interés en
                  tu tour. Recuerda que solo se cargarán aquellos relacionados
                  con el idioma del tour que hayas elegido.
                </p>
              </div>
              <ReOrderListTour<TourFormValues>
                tabs={tabs}
                setTabs={setTabs}
                setValue={setValue}
                errors={errors}
                setError={setError}
                control={control}
                watch={watch}
                items={items}
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
                  Por favor, elige las imágenes y el audio para el tour.
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
                  Crear Tour
                </Button>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
      <SuccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        steps={steps}
        onRedirect={handleRedirect}
        title="Guardando tour..."
      />
    </form>)
  );
}

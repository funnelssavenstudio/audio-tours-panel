"use client";

import { useEffect, useState } from "react";
import { Button, Card, Chip, Image, Link } from "@heroui/react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";

import flags from "@/data/flags.json";
import { useErrorHandler } from "@/helpers/errorsHandler";
import ReOrderListTour, {
  Tab as CheckpointTab,
} from "../../../components/reorder/ReOrderListTour";
import { getPois, Poi } from "@/services/poi/getPois";
import { getStops, Stop } from "@/services/stop/getStops";
import { getTourDetailsByLang } from "@/services/tours/getToursDetailsByLang";
import { getTours } from "@/services/tours/getTours";
import { createCheckpoint } from "@/services/checkpoints/createCheckpoint";
import { updateCheckpoint } from "@/services/checkpoints/updateCheckpoint";

const CONFIG_LANGUAGE_CODE = "es";

interface ReorderTourCheckpointsFormValues {
  checkpoints: CheckpointTab[];
}

const defaultValues: ReorderTourCheckpointsFormValues = {
  checkpoints: [],
};

export default function ReorderTourCheckpointsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const handleError = useErrorHandler();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    setError,
    watch,
  } = useForm<ReorderTourCheckpointsFormValues>({ defaultValues });

  const [tabs, setTabs] = useState<CheckpointTab[]>([]);
  const [initialTabs, setInitialTabs] = useState<CheckpointTab[]>([]);
  const [items, setItems] = useState<Stop[] | Poi[]>([]);
  const [tourName, setTourName] = useState<string>("");
  const [tourLanguages, setTourLanguages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = session?.user?.accessToken;
    if (!token) return;

    const fetchTourCheckpoints = async () => {
      try {
        const fetchedTourDetails = await getTourDetailsByLang(
          token,
          params.uuid as string,
          CONFIG_LANGUAGE_CODE
        );
        console.log(
          "[ReorderTourCheckpoints] getTourDetailsByLang response:",
          fetchedTourDetails
        );
        console.log(
          "[ReorderTourCheckpoints] checkpoints (raw):",
          fetchedTourDetails.tour.checkpoints
        );
        const checkpoints = fetchedTourDetails.tour.checkpoints ?? [];
        const initialTabsData: CheckpointTab[] = checkpoints
          .map((item) => ({
            label: item.title,
            value: item.entity_uuid,
            checkpoint_uuid: item.uuid,
            type:
              item.type === "pointofinterest" ||
              item.type === "point_of_interest"
                ? "Punto de interés"
                : "Parada",
            language: CONFIG_LANGUAGE_CODE,
            description: "",
            fractional_index: item.fractional_index,
          }))
          // Backend convention: highest fractional_index = first stop of the tour
          // (the mobile app reads /checkpoints/{tour}/{lang} ordered DESC). The
          // dashboard visual list mirrors that: top row = first stop = highest fi.
          .sort((a, b) => {
            if (a.fractional_index! > b.fractional_index!) return -1;
            if (a.fractional_index! < b.fractional_index!) return 1;
            return 0;
          });

        setInitialTabs(initialTabsData);
        setTabs(initialTabsData);
        setValue("checkpoints", initialTabsData);
        setTourName(
          searchParams.get("name") || fetchedTourDetails.tour.title || ""
        );
      } catch (error) {
        handleError(error);
      }
    };

    const fetchTourLanguages = async () => {
      try {
        const allTours = await getTours(token);
        const thisTour = allTours?.find(
          (t) => t.uuid === (params.uuid as string)
        );
        if (thisTour) {
          setTourLanguages(
            thisTour.translations.map((t) => t.language_code)
          );
        }
      } catch (error) {
        handleError(error);
      }
    };

    const fetchPois = async () => {
      try {
        const fetchedPois = await getPois(token);
        const filteredPois = fetchedPois.filter((poi) =>
          poi.translations.some(
            (translation) =>
              translation.language_code === CONFIG_LANGUAGE_CODE
          )
        );

        if (filteredPois.length > 0) {
          const mappedPois = filteredPois.map((poi) => ({
            ...poi,
            type: "Punto de interés",
          }));
          setItems((prevItems) => {
            const newItems = [...prevItems];
            mappedPois.forEach((poi) => {
              if (!newItems.some((item) => item.uuid === poi.uuid)) {
                newItems.push(poi);
              }
            });
            return newItems;
          });
        }
      } catch (error) {
        handleError(error);
      }
    };

    const fetchStops = async () => {
      try {
        const fetchedStops = await getStops(token);
        const filteredStops = fetchedStops.filter((stop) =>
          stop.translations.some(
            (translation) =>
              translation.language_code === CONFIG_LANGUAGE_CODE
          )
        );

        if (filteredStops.length > 0) {
          const mappedStops = filteredStops.map((stop) => ({
            ...stop,
            type: "Parada",
          }));
          setItems((prevItems) => {
            const newItems = [...prevItems];
            mappedStops.forEach((stop) => {
              if (!newItems.some((item) => item.uuid === stop.uuid)) {
                newItems.push(stop);
              }
            });
            return newItems;
          });
        }
      } catch (error) {
        handleError(error);
      }
    };

    fetchTourCheckpoints();
    fetchTourLanguages();
    fetchPois();
    fetchStops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.accessToken, params.uuid]);

  const getNewCheckpoints = (
    existingCheckpoints: CheckpointTab[],
    newCheckpoints: CheckpointTab[]
  ) => {
    const existingUuids = new Set(existingCheckpoints.map((cp) => cp.value));
    return newCheckpoints.filter((tab) => !existingUuids.has(tab.value));
  };

  const onSubmit = async (data: ReorderTourCheckpointsFormValues) => {
    setSuccessMessage(null);

    try {
      const token = session?.user?.accessToken;
      if (!token) {
        throw new Error("No valid session or accessToken");
      }

      const tourUuid = params.uuid as string;
      const checkpointsData = data.checkpoints ?? [];
      const toCreate = getNewCheckpoints(initialTabs, checkpointsData).map(
        (tab) => ({ ...tab, type: tab.type ?? "Parada" })
      );

      const createdByEntityUuid = new Map<
        string,
        { checkpoint_uuid: string; checkpoint_fractional_index: string }
      >();
      if (toCreate.length > 0) {
        const createdResponses = await createCheckpoint(
          token,
          tourUuid,
          toCreate
        );
        toCreate.forEach((tab, i) => {
          const created = createdResponses[i];
          if (created?.checkpoint_uuid) {
            createdByEntityUuid.set(tab.value, created);
          }
        });
      }

      const hydratedCheckpoints: CheckpointTab[] = checkpointsData.map(
        (tab) => {
          if (tab.checkpoint_uuid) return tab;
          const created = createdByEntityUuid.get(tab.value);
          if (!created) return tab;
          return {
            ...tab,
            checkpoint_uuid: created.checkpoint_uuid,
            fractional_index: created.checkpoint_fractional_index,
          };
        }
      );

      const reorderable = hydratedCheckpoints.filter(
        (tab) => !!tab.checkpoint_uuid
      );
      if (reorderable.length > 0) {
        await updateCheckpoint(token, reorderable);
      }

      setInitialTabs(hydratedCheckpoints);
      setTabs(hydratedCheckpoints);
      setSuccessMessage("Paradas y puntos de interés actualizados correctamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setSuccessMessage(null);
      handleError(error);
    }
  };

  return (
    <form className="flex flex-row gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full flex-col items-center">
        <div className="fixed z-50 bottom-8 right-8">
          <div className="flex items-center gap-2">
            <Chip variant="faded" size="md" className="px-2">
              <strong className="mr-1">Gestionando checkpoints de:</strong>{" "}
              {tourName || "Tour"}
            </Chip>
          </div>
        </div>

        <div className="flex flex-col w-full max-w-2xl gap-2 py-4">
          <div className="flex gap-4 rounded-medium bg-secondary/20 p-4 items-center mb-4">
            <Icon
              icon="solar:info-circle-line-duotone"
              className="text-primary flex-shrink-0"
              width={36}
            />
            <p className="text-tiny">
              Añade, reordena o elimina las paradas y puntos de interés de este
              tour. Solo se listan las paradas y puntos de interés que tengan
              traducción en español.
            </p>
          </div>

          {tourLanguages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-medium bg-default-100 p-3 mb-2">
              <span className="text-tiny font-medium text-default-600">
                Idiomas del tour:
              </span>
              {tourLanguages.map((lang) => (
                <Chip
                  key={lang}
                  size="sm"
                  variant="flat"
                  startContent={
                    flags[lang as keyof typeof flags] ? (
                      <Image
                        alt={lang}
                        src={flags[lang as keyof typeof flags]}
                        width={14}
                        className="ml-1"
                      />
                    ) : undefined
                  }
                >
                  <span className="uppercase text-tiny">{lang}</span>
                </Chip>
              ))}
              <span className="text-tiny text-default-500 ml-1">
                Las paradas o POIs sin traducción en alguno de estos idiomas se
                marcan con{" "}
                <Icon
                  icon="solar:danger-triangle-bold"
                  className="inline text-warning"
                  width={14}
                />
                .
              </span>
            </div>
          )}

          <ReOrderListTour<ReorderTourCheckpointsFormValues>
            tabs={tabs}
            setTabs={setTabs}
            setValue={setValue}
            errors={errors}
            setError={setError}
            control={control}
            watch={watch}
            items={items}
            languageCode={CONFIG_LANGUAGE_CODE}
            tourLanguages={tourLanguages}
          />

          <div className="flex justify-end items-center gap-6 pt-4">
            <Link
              underline="hover"
              size="sm"
              color="foreground"
              href="/backoffice/tours"
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
              Guardar cambios
            </Button>
          </div>
          {successMessage && (
            <Card className="p-3 bg-success/10 text-success rounded-medium text-sm mt-2">
              {successMessage}
            </Card>
          )}
        </div>
      </div>
    </form>
  );
}

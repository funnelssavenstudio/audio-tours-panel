"use client";

import { useEffect, useState } from "react";
import { Button, Card, Chip, Link } from "@heroui/react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";

import { useErrorHandler } from "@/helpers/errorsHandler";
import { StopsOrPointsOfInterest } from "@/app/components/reorder/ingredients";
import { getStopDetailsByLang } from "@/services/stop/getStopDetailsByLang";
import { getPois, Poi } from "@/services/poi/getPois";
import ReOrderListStop from "../../../components/reorder/ReOrderListStop";
import { addPoiToStop } from "@/services/stop/addPoiToStop";
import { deletePoiToStop } from "@/services/stop/deletePoiToStop";

const SPANISH_LANGUAGE_CODE = "es";

interface ReorderStopPoiFormValues {
  checkpoints: StopsOrPointsOfInterest[];
}

const defaultValues: ReorderStopPoiFormValues = {
  checkpoints: [],
};

export default function ReorderStopPointsOfInterestPage() {
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
  } = useForm<ReorderStopPoiFormValues>({ defaultValues });

  const [tabs, setTabs] = useState<StopsOrPointsOfInterest[]>([]);
  const [initialTabs, setInitialTabs] = useState<StopsOrPointsOfInterest[]>([]);
  const [pois, setPois] = useState<Poi[]>([]);
  const [stopTitle, setStopTitle] = useState<string>("");
  const [stopLocation, setStopLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = session?.user?.accessToken;
        if (!token) return;

        const fetchedStopDetails = await getStopDetailsByLang(
          token,
          params.uuid as string,
          SPANISH_LANGUAGE_CODE
        );

        const initialTabsData = (
          fetchedStopDetails.stop.points_of_interest ?? []
        ).map((item) => ({
          label: item.title,
          value: item.uuid,
          language: SPANISH_LANGUAGE_CODE,
          description: item.description,
        }));

        setInitialTabs(initialTabsData);
        setTabs(initialTabsData);
        setStopTitle(searchParams.get("name") || fetchedStopDetails.stop.title);
        setStopLocation({
          lat: fetchedStopDetails.stop.location.latitude,
          lng: fetchedStopDetails.stop.location.longitude,
        });

        const fetchedPois = await getPois(token);
        const filteredPois = fetchedPois.filter((poi) =>
          poi.translations.some(
            (translation) => translation.language_code === SPANISH_LANGUAGE_CODE
          )
        );
        setPois(filteredPois);
      } catch (error) {
        handleError(error);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.uuid, session?.user?.accessToken]);

  const onSubmit = async (data: ReorderStopPoiFormValues) => {
    setSuccessMessage(null);

    try {
      const token = session?.user?.accessToken;
      if (!token) {
        throw new Error("No valid session or accessToken");
      }
      const finalTabs = data.checkpoints ?? [];
      const initialSet = new Set(initialTabs.map((tab) => tab.value));
      const finalSet = new Set(finalTabs.map((tab) => tab.value));

      const added = finalTabs.filter((tab) => !initialSet.has(tab.value));
      const removed = initialTabs.filter((tab) => !finalSet.has(tab.value));

      if (removed.length > 0) {
        await deletePoiToStop(token, params.uuid as string, removed);
      }

      if (added.length > 0) {
        await addPoiToStop(token, params.uuid as string, added);
      }

      if (added.length === 0 && removed.length === 0) {
        setSuccessMessage(
          "No hubo cambios en los puntos de interés de la parada."
        );
        return;
      }

      setTabs(finalTabs.map((tab) => ({ ...tab })));
      setInitialTabs(finalTabs.map((tab) => ({ ...tab })));
      setSuccessMessage(
        "Puntos de interés de la parada actualizados correctamente."
      );
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
        <div className="fixed z-50 bottom-8 right-8">
          <div className="flex items-center gap-2">
            <Chip variant="faded" size="md" className="px-2">
              <strong className="mr-1">Gestionando POIs de:</strong>{" "}
              {stopTitle || "Parada"}
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
              Aquí puedes agregar o quitar puntos de interés de esta parada.
              Actualmente solo se listan los puntos de interés que tengan
              traducción en español.
            </p>
          </div>

          <ReOrderListStop<ReorderStopPoiFormValues>
            tabs={tabs}
            setTabs={setTabs}
            setValue={setValue}
            errors={errors}
            setError={setError}
            watch={watch}
            control={control}
            items={pois}
            languageCode={SPANISH_LANGUAGE_CODE}
            allowEmpty
            showDragHandle={false}
          />

          <div className="flex justify-end items-center gap-6 pt-4">
            <Link
              underline="hover"
              size="sm"
              color="foreground"
              href={`/backoffice/stops/edit-stop/${params.uuid}?lat=${
                stopLocation?.lat ?? ""
              }&lng=${stopLocation?.lng ?? ""}&name=${encodeURIComponent(
                stopTitle || "Parada"
              )}`}
            >
              <Icon icon="solar:point-on-map-line-duotone" className="mr-2" />
              Editar ubicación
            </Link>
            <Link
              underline="hover"
              size="sm"
              color="foreground"
              href="/backoffice/stops"
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

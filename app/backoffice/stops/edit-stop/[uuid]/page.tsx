"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Input } from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";

import { useErrorHandler } from "@/helpers/errorsHandler";
import LocationSelector from "@/app/components/map/LocationSelector";
import { updateStop } from "@/services/stop/updateStop";

export interface StopFormValues {
  latitud: string;
  longitud: string;
}

interface queryParams {
  lat: string;
  lng: string;
  name: string;
}

export default function EditStop() {
  const { data: session } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const handleError = useErrorHandler();
  const [successMessage, setSuccessMessage] = useState<string>("");

  const queryParams: queryParams = {
    lat: "",
    lng: "",
    name: "",
  };

  searchParams.forEach((value, key) => {
    if (key in queryParams) {
      queryParams[key as keyof typeof queryParams] = value;
    }
  });

  const initialPointMap = {
    lat: parseFloat(queryParams.lat),
    lng: parseFloat(queryParams.lng),
  };

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    trigger,
    setValue,
    watch,
  } = useForm<StopFormValues>({
    defaultValues: {
      latitud: Number.isFinite(initialPointMap.lat)
        ? initialPointMap.lat.toString()
        : "",
      longitud: Number.isFinite(initialPointMap.lng)
        ? initialPointMap.lng.toString()
        : "",
    },
  });
  const [location, setLocation] = useState<{ lat: number; lng: number }>(
    initialPointMap
  );

  const latitud = watch("latitud");
  const longitud = watch("longitud");

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (latitud && longitud) {
      const lat = parseFloat(latitud);
      const lng = parseFloat(longitud);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        if (lat === location.lat && lng === location.lng) return;
        setLocation({ lat, lng });
      }
      if (errors.latitud || errors.longitud) {
        trigger(["latitud", "longitud"]);
      }
    }
  }, [latitud, longitud, trigger, errors, location.lat, location.lng]);

  const handleLocationChange = useCallback(
    (nextLocation: { lat: number; lng: number }) => {
      setLocation((prev) => {
        if (prev.lat === nextLocation.lat && prev.lng === nextLocation.lng) {
          return prev;
        }
        return nextLocation;
      });
      setValue("latitud", nextLocation.lat.toString());
      setValue("longitud", nextLocation.lng.toString());
    },
    [setValue]
  );

  const onSubmit = async (data: StopFormValues) => {
    if (!data) return;
    try {
      setSuccessMessage("");
      const lat = parseFloat(data.latitud);
      const lng = parseFloat(data.longitud);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("Verifica latitud y longitud");
      }

      if (!session?.user || !session.user.accessToken) {
        throw new Error("No valid session or accessToken");
      }

      await updateStop(
        session.user.accessToken,
        params.uuid as string,
        lat,
        lng
      );

      setSuccessMessage("Localización actualizada correctamente");
    } catch (error) {
      setSuccessMessage("");
      handleError(error);
    }
  };

  return (
    <form className="flex flex-row gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full flex-col items-center">
        <p className="text-xl font-semibold mb-4">
          Estás editando la localización de {queryParams.name}
        </p>
        <div className="flex flex-col w-full max-w-2xl gap-4">
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
                  validate: (value) =>
                    !Number.isNaN(parseFloat(value)) ||
                    "La latitud debe ser un número válido",
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
                  validate: (value) =>
                    !Number.isNaN(parseFloat(value)) ||
                    "La longitud debe ser un número válido",
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
                    errorMessage={errors.longitud && errors.longitud.message}
                  />
                )}
              />
            </div>
            <LocationSelector
              location={location}
              setLocation={handleLocationChange}
            />
          </div>
          <div className="flex justify-end items-center gap-6 pt-4">
            {successMessage && (
              <p className="text-success text-tiny">{successMessage}</p>
            )}
            <Button type="submit" color="primary" isLoading={isSubmitting}>
              Modificar localización
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

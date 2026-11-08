"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Input, Switch } from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useParams, useSearchParams } from "next/navigation";

import { useErrorHandler } from "@/helpers/errorsHandler";
import { updateTour } from "@/services/tours/updateTour";
import LocationSelector from "@/app/components/map/LocationSelector";

export interface TourFormValues {
  external_id: string;
  active: boolean;
  pickup_latitude: string;
  pickup_longitude: string;
}

interface QueryParams {
  external_id: string;
  active: string;
  name: string;
  pickup_latitude: string;
  pickup_longitude: string;
}

const initialPointMap = {
  lat: 37.3013417,
  lng: -97.3967412,
};

export default function EditTour() {
  const { data: session } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const handleError = useErrorHandler();
  const [successMessage, setSuccessMessage] = useState<string>("");

  const queryParams: QueryParams = {
    external_id: "",
    active: "",
    name: "",
    pickup_latitude: "",
    pickup_longitude: "",
  };

  searchParams.forEach((value, key) => {
    if (key in queryParams) {
      queryParams[key as keyof typeof queryParams] = value;
    }
  });

  const defaultValues: TourFormValues = {
    external_id: queryParams.external_id || "",
    active: queryParams.active === "true",
    pickup_latitude:
      queryParams.pickup_latitude || initialPointMap.lat.toString(),
    pickup_longitude:
      queryParams.pickup_longitude || initialPointMap.lng.toString(),
  };

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
    setValue,
  } = useForm<TourFormValues>({ defaultValues });
  const [location, setLocation] = useState<{ lat: number; lng: number }>(
    initialPointMap
  );

  const pickupLatitude = watch("pickup_latitude");
  const pickupLongitude = watch("pickup_longitude");

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (pickupLatitude && pickupLongitude) {
      const lat = parseFloat(pickupLatitude);
      const lng = parseFloat(pickupLongitude);

      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        if (lat === location.lat && lng === location.lng) return;
        setLocation({ lat, lng });
      }
    }
  }, [pickupLatitude, pickupLongitude, location.lat, location.lng]);

  const handleLocationChange = useCallback(
    (nextLocation: { lat: number; lng: number }) => {
      setLocation((prev) => {
        if (prev.lat === nextLocation.lat && prev.lng === nextLocation.lng) {
          return prev;
        }
        return nextLocation;
      });

      setValue("pickup_latitude", nextLocation.lat.toString());
      setValue("pickup_longitude", nextLocation.lng.toString());
    },
    [setValue]
  );

  const onSubmit = async (data: TourFormValues) => {
    if (!data) return;

    try {
      setSuccessMessage("");
      const externalId = Number(data.external_id);
      const pickupLatitudeParsed = Number(data.pickup_latitude);
      const pickupLongitudeParsed = Number(data.pickup_longitude);

      if (
        !Number.isFinite(externalId) ||
        !Number.isFinite(pickupLatitudeParsed) ||
        !Number.isFinite(pickupLongitudeParsed)
      ) {
        throw new Error("Verifica Bokun ID y coordenadas de pickup");
      }

      if (!session?.user || !session.user.accessToken) {
        throw new Error("No valid session or accessToken");
      }

      await updateTour(
        session.user.accessToken,
        params.uuid as string,
        externalId,
        data.active,
        pickupLatitudeParsed,
        pickupLongitudeParsed
      );

      setSuccessMessage("Tour actualizado correctamente");
    } catch (error) {
      setSuccessMessage("");
      handleError(error);
    }
  };

  return (
    <form className="flex flex-row gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full flex-col items-center">
        <p className="text-xl font-semibold mb-4">
          Estás editando la configuración del tour {queryParams.name}
        </p>
        <div className="flex flex-col w-full max-w-2xl gap-4">
          <div className="border-medium border-default-200 rounded-medium py-3 px-4">
            <h2 className="text-sm">
              Actualiza Bokun ID, estado y punto de recogida del tour
            </h2>
            <h2 className="text-sm text-default-400 pb-3">
              El Bokun ID debe ser numérico y te permite relacionar el tour con
              el agendamiento externo. También debes confirmar la ubicación de
              recogida en el mapa.
            </h2>
            <div className="flex flex-col gap-4 pb-4">
              <Controller
                name="external_id"
                control={control}
                rules={{
                  required: "El Bokun ID es requerido",
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
                    type="number"
                    variant="bordered"
                    label="Bokun ID"
                    placeholder="Ingresa el Bokun ID"
                    className="max-w-full"
                    isInvalid={!!errors.external_id}
                    errorMessage={
                      errors.external_id && errors.external_id.message
                    }
                  />
                )}
              />
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <div className="border-small border-divider rounded-medium p-3">
                    <Switch
                      isSelected={field.value}
                      onValueChange={field.onChange}
                    >
                      Tour activo
                    </Switch>
                  </div>
                )}
              />
              <div className="border-small border-divider rounded-medium p-3">
                <h2 className="text-sm pb-3">
                  Ubicación de recogida del tour
                </h2>
                <div className="flex gap-4 pb-4">
                  <Controller
                    name="pickup_latitude"
                    control={control}
                    rules={{
                      required: "La latitud de recogida es requerida",
                      validate: (value) =>
                        !Number.isNaN(parseFloat(value)) ||
                        "La latitud debe ser un número válido",
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        variant="bordered"
                        label="Pickup latitude"
                        placeholder="Ingresa la latitud de recogida"
                        className="max-w-full"
                        isInvalid={!!errors.pickup_latitude}
                        errorMessage={
                          errors.pickup_latitude &&
                          errors.pickup_latitude.message
                        }
                      />
                    )}
                  />
                  <Controller
                    name="pickup_longitude"
                    control={control}
                    rules={{
                      required: "La longitud de recogida es requerida",
                      validate: (value) =>
                        !Number.isNaN(parseFloat(value)) ||
                        "La longitud debe ser un número válido",
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        variant="bordered"
                        label="Pickup longitude"
                        placeholder="Ingresa la longitud de recogida"
                        className="max-w-full"
                        isInvalid={!!errors.pickup_longitude}
                        errorMessage={
                          errors.pickup_longitude &&
                          errors.pickup_longitude.message
                        }
                      />
                    )}
                  />
                </div>
                <LocationSelector
                  location={location}
                  setLocation={handleLocationChange}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center gap-6 pt-4">
            {successMessage && (
              <p className="text-success text-tiny">{successMessage}</p>
            )}
            <Button type="submit" color="primary" isLoading={isSubmitting}>
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

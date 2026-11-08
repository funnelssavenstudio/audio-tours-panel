"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Select, SelectItem, Switch } from "@heroui/react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";

import { Role, getRoles } from "@/services/common/getRoles";
import { validCountryCallingCodes } from "@/data/countryCallingCodes";
import { useErrorHandler } from "@/helpers/errorsHandler";
import { assignUserRoles, Roles } from "@/services/users/assignUserRoles";
import { User, getUsers } from "@/services/users/getUsers";
import { UpdateUserPayload, updateUser } from "@/services/users/updateUser";

interface FormValues {
  email: string;
  name: string;
  last_name: string;
  phone_number: string;
  roles: string;
  active: boolean;
}

const defaultValues: FormValues = {
  email: "",
  name: "",
  last_name: "",
  phone_number: "",
  roles: "",
  active: true,
};

const normalizeSpaces = (value: string) => value.replace(/\s+/g, " ").trim();

const sanitizeFormValues = (data: FormValues): FormValues => ({
  email: data.email.replace(/\s+/g, "").trim().toLowerCase(),
  name: normalizeSpaces(data.name),
  last_name: normalizeSpaces(data.last_name),
  phone_number: data.phone_number.replace(/\s+/g, "").trim(),
  roles: data.roles
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean)
    .join(","),
  active: data.active,
});

const getCountryCode = (value: string): string | undefined => {
  const normalizedValue = value.replace(/\s+/g, "").trim();
  return [...validCountryCallingCodes]
    .sort((a, b) => b.length - a.length)
    .find((code) => normalizedValue.startsWith(code));
};

const getRolesPayloadFromString = (rolesValue: string): Roles => {
  const rolesArray = rolesValue
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);

  return {
    administrator: rolesArray.includes("administrator"),
    tour_guide: rolesArray.includes("tour_guide"),
    tourist: rolesArray.includes("tourist"),
  };
};

const getRolesPayloadFromUser = (user: User): Roles => {
  const userRoles = user.roles ?? [];

  return {
    administrator: userRoles.includes("administrator"),
    tour_guide: userRoles.includes("tour_guide"),
    tourist: userRoles.includes("tourist"),
  };
};

export default function EditUser() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const params = useParams();
  const userUuid = params.uuid as string;
  const handleError = useErrorHandler();

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<FormValues>({ defaultValues });

  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);

  const roleOptions = useMemo(
    () =>
      availableRoles.map((role) => ({
        key: role.key,
        label:
          role.key === "administrator"
            ? "Admin"
            : role.key === "tour_guide"
            ? "Agente"
            : "Turista",
      })),
    [availableRoles]
  );

  useEffect(() => {
    if (!token || !userUuid) return;

    const fetchInitialData = async () => {
      setIsLoadingInitialData(true);
      try {
        const [rolesResponse, usersResponse] = await Promise.all([
          getRoles(token),
          getUsers(token),
        ]);

        setAvailableRoles(rolesResponse);

        const matchedUser = usersResponse.find((user) => user.uuid === userUuid);
        if (!matchedUser) {
          setErrorMessage("No se encontró el usuario a editar");
          return;
        }

        setUserToEdit(matchedUser);
        reset({
          email: matchedUser.email ?? "",
          name: matchedUser.name ?? "",
          last_name: matchedUser.last_name ?? "",
          phone_number: matchedUser.phone_number ?? "",
          roles: (matchedUser.roles ?? []).join(","),
          active: !!matchedUser.active,
        });
      } catch (error: AxiosError | any) {
        const parsedError = handleError(error);
        if (parsedError) {
          setErrorMessage(parsedError);
        }
      } finally {
        setIsLoadingInitialData(false);
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userUuid, reset]);

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  const onSubmit = async (data: FormValues) => {
    if (!token || !userUuid || !userToEdit) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const sanitizedData = sanitizeFormValues(data);

      const originalUserNormalized = sanitizeFormValues({
        email: userToEdit.email ?? "",
        name: userToEdit.name ?? "",
        last_name: userToEdit.last_name ?? "",
        phone_number: userToEdit.phone_number ?? "",
        roles: (userToEdit.roles ?? []).join(","),
        active: !!userToEdit.active,
      });

      const updatePayload: UpdateUserPayload = {};

      if (sanitizedData.email !== originalUserNormalized.email) {
        updatePayload.email = sanitizedData.email;
      }
      if (sanitizedData.name !== originalUserNormalized.name) {
        updatePayload.name = sanitizedData.name;
      }
      if (sanitizedData.last_name !== originalUserNormalized.last_name) {
        updatePayload.last_name = sanitizedData.last_name;
      }
      if (sanitizedData.phone_number !== originalUserNormalized.phone_number) {
        updatePayload.phone_number = sanitizedData.phone_number;
      }
      if (sanitizedData.active !== originalUserNormalized.active) {
        updatePayload.active = sanitizedData.active;
      }

      const hasUserChanges = Object.keys(updatePayload).length > 0;
      if (hasUserChanges) {
        await updateUser(token, userUuid, updatePayload);
      }

      const rolesPayload = getRolesPayloadFromString(sanitizedData.roles);
      const originalRolesPayload = getRolesPayloadFromUser(userToEdit);
      const hasRoleChanges =
        rolesPayload.administrator !== originalRolesPayload.administrator ||
        rolesPayload.tour_guide !== originalRolesPayload.tour_guide ||
        rolesPayload.tourist !== originalRolesPayload.tourist;

      if (hasRoleChanges) {
        await assignUserRoles(token, userUuid, rolesPayload);
      }

      if (!hasUserChanges && !hasRoleChanges) {
        setSuccessMessage("No hay cambios para guardar");
        return;
      }

      setSuccessMessage(
        `Usuario ${sanitizedData.name || userToEdit.name} actualizado correctamente`
      );
    } catch (error: AxiosError | any) {
      const parsedError = handleError(error);
      if (parsedError) {
        setErrorMessage(parsedError);
      }
    }
  };

  return (
    <form
      className="flex flex-row gap-4 justify-center items-center"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col w-full max-w-2xl gap-4">
        <div className="flex gap-4 rounded-medium bg-secondary/20 p-4 items-center mb-4">
          <Icon
            icon="solar:info-circle-line-duotone"
            className="text-primary flex-shrink-0"
            width={36}
          />
          <p className="text-tiny">
            Edita los datos del usuario y sus roles en la misma pantalla.
            Todos los campos son opcionales en el endpoint de edición. Los
            roles se actualizan en una segunda llamada y se mantienen en esta
            misma pantalla.
          </p>
        </div>

        <div className="w-2/3 flex flex-col gap-2 mx-auto">
          <Controller
            name="email"
            control={control}
            rules={{
              validate: (value) => {
                if (!value?.trim()) return true;
                return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                  value.trim()
                )
                  ? true
                  : "Por favor, introduce un email válido";
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                variant="bordered"
                placeholder="Email"
                isDisabled={isLoadingInitialData}
                isInvalid={!!errors.email || !!errorMessage}
                errorMessage={
                  errors.email?.message
                    ? errors.email.message
                    : errorMessage || null
                }
              />
            )}
          />

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                variant="bordered"
                placeholder="Nombres"
                isDisabled={isLoadingInitialData}
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            name="last_name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                variant="bordered"
                placeholder="Apellidos"
                isDisabled={isLoadingInitialData}
                isInvalid={!!errors.last_name}
                errorMessage={errors.last_name?.message}
              />
            )}
          />

          <Controller
            name="phone_number"
            control={control}
            rules={{
              validate: (value) => {
                if (!value?.trim()) return true;

                if (!/^[\d\s\+]+$/.test(value)) {
                  return "Por favor, ingresa solo números y espacios";
                }

                const normalizedValue = value.replace(/\s+/g, "").trim();
                const countryCode = getCountryCode(normalizedValue);

                if (!countryCode) {
                  return "Por favor, ingresa un prefijo de país válido, por ejemplo +51";
                }

                const phoneNumber = normalizedValue.replace(/\D/g, "");
                if (phoneNumber.length < 11) {
                  return "Por favor, ingresa un número de teléfono de al menos 11 dígitos";
                }
                if (phoneNumber.length > 12) {
                  return "Por favor, ingresa un número de teléfono de máximo 12 dígitos";
                }
                return true;
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                variant="bordered"
                placeholder="Teléfono de contacto"
                isDisabled={isLoadingInitialData}
                isInvalid={!!errors.phone_number}
                errorMessage={errors.phone_number?.message}
                onChange={(e) => {
                  const value = e.target.value;
                  const countryCode = value.split(" ")[0];

                  if (
                    (value.length === 1 ||
                      value.length === 2 ||
                      value.length === 3) &&
                    validCountryCallingCodes.includes(countryCode)
                  ) {
                    e.target.value = value + " ";
                  }

                  field.onChange(e);
                }}
              />
            )}
          />

          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <div className="border border-default-200 rounded-medium px-4 py-3">
                <Switch
                  isSelected={field.value}
                  onValueChange={field.onChange}
                  isDisabled={isLoadingInitialData}
                >
                  Usuario activo
                </Switch>
              </div>
            )}
          />

          <Controller
            name="roles"
            control={control}
            render={({ field }) => {
              const selectedKeys = new Set(
                (field.value || "")
                  .split(",")
                  .map((role) => role.trim())
                  .filter(Boolean)
              );

              return (
                <Select
                  selectionMode="multiple"
                  variant="bordered"
                  placeholder="Seleccione el/los roles del usuario"
                  aria-label="Roles del usuario"
                  isDisabled={isLoadingInitialData}
                  selectedKeys={selectedKeys}
                  isInvalid={!!errors.roles}
                  errorMessage={errors.roles?.message}
                  onSelectionChange={(keys) => {
                    if (keys === "all") {
                      field.onChange(
                        roleOptions.map((role) => role.key).join(",")
                      );
                      return;
                    }

                    field.onChange(Array.from(keys).join(","));
                  }}
                >
                  {roleOptions.map((role) => (
                    <SelectItem key={role.key} value={role.key}>
                      {role.label}
                    </SelectItem>
                  ))}
                </Select>
              );
            }}
          />

          <div className="flex items-center justify-end gap-6 pt-4">
            {successMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-success text-tiny"
              >
                {successMessage}
              </motion.p>
            )}
            <Button
              type="submit"
              color="primary"
              isDisabled={isLoadingInitialData || !userToEdit}
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { useSession } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { AxiosError } from "axios";
import { motion } from "framer-motion";

import { Role, getRoles } from "@/services/common/getRoles";
import { useErrorHandler } from "@/helpers/errorsHandler";
import { Icon } from "@iconify/react/dist/iconify.js";
import { createUser } from "@/services/users/createUser";
import { assignUserRoles } from "@/services/users/assignUserRoles";
import { validCountryCallingCodes } from "@/data/countryCallingCodes";

interface FormValues {
  email: string;
  name: string;
  last_name: string;
  password: string;
  phone_number: string;
  roles: string;
}

const defaultValues: FormValues = {
  email: "",
  name: "",
  last_name: "",
  password: "",
  phone_number: "",
  roles: "",
};

const normalizeSpaces = (value: string) => value.replace(/\s+/g, " ").trim();

const sanitizeFormValues = (data: FormValues): FormValues => ({
  email: data.email.replace(/\s+/g, "").trim().toLowerCase(),
  name: normalizeSpaces(data.name),
  last_name: normalizeSpaces(data.last_name),
  password: data.password.trim(),
  phone_number: data.phone_number.replace(/\s+/g, "").trim(),
  roles: data.roles
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean)
    .join(","),
});

const getCountryCode = (value: string): string | undefined => {
  const normalizedValue = value.replace(/\s+/g, "").trim();
  return [...validCountryCallingCodes]
    .sort((a, b) => b.length - a.length)
    .find((code) => normalizedValue.startsWith(code));
};

const CreateUser = () => {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const handleError = useErrorHandler();
  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setError,
    clearErrors,
  } = useForm<FormValues>({ defaultValues });
  const [roles, setRoles] = useState<Role[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onSubmit = async (data: FormValues) => {
    if (!token) return;

    setErrorMessage("");
    clearErrors("phone_number");
    clearErrors("email");

    try {
      const sanitizedData = sanitizeFormValues(data);
      const response = await createUser(token, sanitizedData);

      const rolesArray = sanitizedData.roles.split(",");
      const rolesObject = roles.reduce((obj: any, role: any) => {
        if (role.key) {
          obj[role.key] = rolesArray.includes(role.key);
        }
        return obj;
      }, {});

      await assignUserRoles(
        token,
        response.user_uuid,
        rolesObject
      );

      setSuccessMessage(`Usuario ${sanitizedData.name} creado correctamente`);
      reset(defaultValues);
    } catch (error: AxiosError | any) {
      console.log("error: ", error);
      const parsedError = handleError(error);
      if (parsedError) {
        const normalizedMessage = parsedError.toLowerCase();

        if (normalizedMessage.includes("teléfono")) {
          setError("phone_number", {
            type: "server",
            message: parsedError,
          });
          return;
        }

        if (normalizedMessage.includes("correo")) {
          setError("email", {
            type: "server",
            message: parsedError,
          });
          return;
        }

        setErrorMessage(parsedError);
      }
    }
  };

  useEffect(() => {
    if (!token) return;

    const fetchRoles = async () => {
      try {
        const fetchedRoles = await getRoles(token);
        setRoles(fetchedRoles);
      } catch (error: AxiosError | any) {
        console.log("error: ", error);

        handleError(error);
      }
    };
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [successMessage]);

  return (
    (<form
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
            Crea el usuario y asigna los roles, recuerda que los roles tienen
            diferentes permisos, el administrador tiene acceso al backoffice, el
            agente al apartado de agentes y el turista a la aplicación. Debes
            asignar una contraseña provisional, luego el usuario puede
            modificarla.
          </p>
        </div>
        <div className="w-2/3 flex flex-col gap-2 mx-auto">
          <Controller
            name="email"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                {...field}
                variant="bordered"
                placeholder="Email"
                isInvalid={!!errors.email || !!errorMessage}
                errorMessage={
                  errors.email?.type === "required"
                    ? "Este campo es obligatorio"
                    : errors.email?.message
                    ? errors.email?.message
                    : !!errorMessage
                    ? errorMessage
                    : null
                }
              />
            )}
          />
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                {...field}
                variant="bordered"
                placeholder="Nombres"
                isInvalid={errors.name?.type === "required"}
                errorMessage={
                  errors.name?.type === "required"
                    ? "Este campo es obligatorio"
                    : errors.name?.type === "manual"
                    ? errors.name?.message
                    : null
                }
              />
            )}
          />
          <Controller
            name="last_name"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input
                {...field}
                variant="bordered"
                placeholder="Apellidos"
                isInvalid={errors.last_name?.type === "required"}
                errorMessage={
                  errors.last_name?.type === "required"
                    ? "Este campo es obligatorio"
                    : errors.last_name?.type === "manual"
                    ? errors.last_name?.message
                    : null
                }
              />
            )}
          />
          <Controller
            name="phone_number"
            control={control}
            rules={{
              required: "Este campo es obligatorio",
              validate: (value) => {
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
                isInvalid={!!errors.phone_number}
                errorMessage={
                  errors.phone_number && errors.phone_number.message
                }
                onChange={(e) => {
                  // Si el valor ingresado no tiene un espacio, añade uno automáticamente
                  const value = e.target.value;
                  const countryCode = value.split(" ")[0];
                  if (
                    value.length === 1 &&
                    validCountryCallingCodes.includes(countryCode)
                  ) {
                    e.target.value = value + " ";
                  } else if (
                    value.length === 2 &&
                    validCountryCallingCodes.includes(countryCode)
                  ) {
                    e.target.value = value + " ";
                  } else if (
                    value.length === 3 &&
                    validCountryCallingCodes.includes(countryCode)
                  ) {
                    e.target.value = value + " ";
                  }
                  field.onChange(e); // Propaga el evento al controlador
                }}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Este campo es obligatorio",
              pattern: {
                value:
                  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                message:
                  "La contraseña debe tener al menos 8 caracteres entre ellos, mayusculas, minusculas, un número y un carácter especial",
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                variant="bordered"
                placeholder="Contraseña provisional"
                type="password"
                autoComplete="new-password"
                isInvalid={!!errors.password}
                errorMessage={errors.password && errors.password.message}
              />
            )}
          />
          <Controller
            name="roles"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                {...field}
                selectionMode="multiple"
                variant="bordered"
                placeholder="Seleccione el/los roles del usuario"
                aria-label="Roles del usuario"
                isInvalid={errors.roles?.type === "required"}
                errorMessage={
                  errors.roles?.type === "required"
                    ? "Este campo es obligatorio"
                    : errors.roles?.type === "manual"
                    ? errors.roles?.message
                    : null
                }
              >
                {roles.map((role) => (
                  <SelectItem key={role.key} value={role.key}>
                    {role.key === "administrator"
                      ? "Admin"
                      : role.key === "tour_guide"
                      ? "Agente"
                      : "Turista"}
                  </SelectItem>
                ))}
              </Select>
            )}
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
            <Button type="submit" color="primary">
              Crear usuario
            </Button>
          </div>
        </div>
      </div>
    </form>)
  );
};

export default CreateUser;

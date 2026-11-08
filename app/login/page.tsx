"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody, Input, Link } from "@heroui/react";
import { useForm, Controller } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";

import EmailIcon from "@/app/components/icons/EmailIcon";
import EyeIcon from "@/app/components/icons/EyeIcon";
import EyeSlashIcon from "@/app/components/icons/EyeSlashIcon";

import { signIn, useSession } from "next-auth/react";
import Logo from "@/app/components/icons/logo";
import { ThemeSwitcher } from "@/app/components/theme/ThemeSwitcher";
import { useRouter } from "next/navigation";
import {
  requestPasswordRecovery,
  validatePasswordRecovery,
  updatePasswordWithRecoveryToken,
  RecoveryValidateResponse,
} from "@/services/auth/passwordRecovery";

interface FormValues {
  email: string;
  password?: string;
  passwordRecovery?: string;
  recoveryToken?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const passwordPattern =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const defaultValues: FormValues = {
  email: "",
  passwordRecovery: "",
  recoveryToken: "",
  newPassword: "",
  confirmPassword: "",
};

export default function LoginForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    getValues,
    setValue,
    trigger,
  } = useForm<FormValues>({ defaultValues });

  useEffect(() => {
    if (status === "authenticated") {
      if (session && session.user?.roles?.includes("administrator")) {
        router.push("/backoffice");
      } else if (session && session.user?.roles?.includes("tour_guide")) {
        router.push("/agent");
      } else {
        router.push("/access-denied");
      }
    }
  }, [status, session, router]);

  const onSubmit = async (data: FormValues) => {
    if (data.email && data.password) {
      clearErrors("password");

      const result = await signIn("credentials", {
        redirect: false,
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("password", {
            type: "manual",
            message: "Credenciales no válidas",
          });
          return;
        }

        setError("password", {
          type: "manual",
          message: "No se pudo iniciar sesión. Intenta nuevamente.",
        });
        console.error("Error del cliente:", result.error);
      }
    }
  };

  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isRecoveryCodeSent, setIsRecoveryCodeSent] = useState(false);
  const [validatedRecovery, setValidatedRecovery] =
    useState<RecoveryValidateResponse | null>(null);
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);
  const [recoveryStatusMessage, setRecoveryStatusMessage] = useState("");
  const [recoveryErrorMessage, setRecoveryErrorMessage] = useState("");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleNewPasswordVisibility = () =>
    setIsNewPasswordVisible(!isNewPasswordVisible);
  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

  const resetRecoveryState = () => {
    setIsRecoveryCodeSent(false);
    setValidatedRecovery(null);
    setIsRecoveryLoading(false);
    setRecoveryStatusMessage("");
    setRecoveryErrorMessage("");
    clearErrors("passwordRecovery");
    clearErrors("recoveryToken");
    clearErrors("newPassword");
    clearErrors("confirmPassword");
    setValue("recoveryToken", "");
    setValue("newPassword", "");
    setValue("confirmPassword", "");
  };

  const handleContinueWithEmail = () => {
    const email = getValues("email");

    if (!emailRegex.test(email)) {
      setError("email", {
        type: "manual",
        message: "Por favor, introduce un email válido",
      });
    } else {
      setIsEmailSubmitted(true);
    }
  };

  const handleOpenRecovery = () => {
    setIsEmailSubmitted(false);
    setIsPasswordRecovery(true);
    resetRecoveryState();

    const loginEmail = getValues("email")?.trim().toLowerCase();
    if (loginEmail && emailRegex.test(loginEmail)) {
      setValue("passwordRecovery", loginEmail);
    }
  };

  const handleRequestRecovery = async () => {
    clearErrors("passwordRecovery");
    clearErrors("recoveryToken");
    clearErrors("newPassword");
    clearErrors("confirmPassword");
    setRecoveryErrorMessage("");
    setRecoveryStatusMessage("");
    setValidatedRecovery(null);
    setValue("recoveryToken", "");
    setValue("newPassword", "");
    setValue("confirmPassword", "");

    const recoveryEmail = getValues("passwordRecovery")?.trim().toLowerCase();
    if (!recoveryEmail || !emailRegex.test(recoveryEmail)) {
      setError("passwordRecovery", {
        type: "manual",
        message: "Por favor, introduce un email válido",
      });
      return;
    }

    setIsRecoveryLoading(true);
    try {
      await requestPasswordRecovery(recoveryEmail);
      setIsRecoveryCodeSent(true);
      setRecoveryStatusMessage(
        "Te enviamos un código de recuperación a tu correo."
      );
    } catch (error: any) {
      setRecoveryErrorMessage(
        error?.message || "No se pudo iniciar la recuperación."
      );
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  const handleValidateRecovery = async () => {
    clearErrors("passwordRecovery");
    clearErrors("recoveryToken");
    clearErrors("newPassword");
    clearErrors("confirmPassword");
    setRecoveryErrorMessage("");
    setRecoveryStatusMessage("");

    const recoveryEmail = getValues("passwordRecovery")?.trim().toLowerCase();
    const token = getValues("recoveryToken")?.trim();

    if (!recoveryEmail || !emailRegex.test(recoveryEmail)) {
      setError("passwordRecovery", {
        type: "manual",
        message: "Por favor, introduce un email válido",
      });
      return;
    }

    if (!token) {
      setError("recoveryToken", {
        type: "manual",
        message: "Ingresa el código de recuperación",
      });
      return;
    }

    setIsRecoveryLoading(true);
    try {
      const validateResponse = await validatePasswordRecovery(
        recoveryEmail,
        token
      );
      setValidatedRecovery(validateResponse);
      setValue(
        "passwordRecovery",
        validateResponse.user_with_details.email || recoveryEmail
      );
      setRecoveryStatusMessage(
        "Código validado correctamente. Ingresa tu nueva contraseña."
      );
    } catch (error: any) {
      setRecoveryErrorMessage(error?.message || "No se pudo validar el código.");
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    clearErrors("newPassword");
    clearErrors("confirmPassword");
    setRecoveryErrorMessage("");
    setRecoveryStatusMessage("");

    if (!validatedRecovery) {
      setRecoveryErrorMessage("Primero valida el código de recuperación.");
      return;
    }

    const formIsValid = await trigger(["newPassword", "confirmPassword"]);
    if (!formIsValid) return;

    const newPassword = getValues("newPassword")?.trim() || "";
    const confirmPassword = getValues("confirmPassword")?.trim() || "";

    if (!passwordPattern.test(newPassword)) {
      setError("newPassword", {
        type: "manual",
        message:
          "La contraseña debe tener al menos 8 caracteres entre ellos, mayusculas, minusculas, un número y un carácter especial",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Las contraseñas no coinciden",
      });
      return;
    }

    setIsRecoveryLoading(true);
    try {
      await updatePasswordWithRecoveryToken(
        validatedRecovery.user_with_details.uuid,
        newPassword,
        validatedRecovery.access_token.token
      );

      const roles = validatedRecovery.user_with_details.roles || [];
      const hasAdminRole = roles.includes("administrator");
      const hasAgentRole = roles.includes("tour_guide");

      if (!hasAdminRole && !hasAgentRole) {
        setValidatedRecovery(null);
        setIsRecoveryCodeSent(false);
        setValue("recoveryToken", "");
        setValue("newPassword", "");
        setValue("confirmPassword", "");
        setRecoveryStatusMessage(
          "Contraseña actualizada correctamente. Esta cuenta turística no tiene acceso al dashboard web."
        );
        return;
      }

      const loginResult = await signIn("credentials", {
        redirect: false,
        email: validatedRecovery.user_with_details.email,
        password: newPassword,
      });

      if (loginResult?.error) {
        setRecoveryStatusMessage(
          "Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña."
        );
        return;
      }

      setRecoveryStatusMessage("Contraseña actualizada correctamente.");

      if (hasAdminRole) {
        router.push("/backoffice");
        return;
      }
      if (hasAgentRole) {
        router.push("/agent");
        return;
      }
    } catch (error: any) {
      setRecoveryErrorMessage(
        error?.message || "No se pudo actualizar la contraseña."
      );
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  return (
    <div className="flex items-center flex-col justify-center p-4 h-full w-full ">
      <div className="flex flex-col items-center pb-6">
        <Logo width={200} height={71} />
        <p className="text-xl font-medium">Bienvenido</p>
        <p className="text-small text-default-500">
          Ingresa a tu cuenta para continuar
        </p>
      </div>
      <Card className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-3 md:px-8 py-5 shadow-small">
        <CardBody>
          <form
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !isEmailSubmitted && !isPasswordRecovery) {
                event.preventDefault();
                handleContinueWithEmail();
              }
            }}
            className="flex flex-col items-start gap-4 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {!isEmailSubmitted && !isPasswordRecovery ? (
                <motion.div
                  key="email"
                  className="flex flex-col w-full max-w-xs gap-4"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0, x: 100 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <Controller
                    name="email"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        variant="bordered"
                        label="Ingrese su email"
                        isInvalid={errors.email?.type === "required"}
                        errorMessage={
                          errors.email?.type === "required"
                            ? "Este campo es obligatorio"
                            : errors.email?.type === "manual"
                            ? errors.email?.message
                            : null
                        }
                        className="w-full form-input"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    onPress={() => {
                      handleContinueWithEmail();
                    }}
                    color="primary"
                    fullWidth={true}
                    startContent={<EmailIcon />}
                  >
                    Continuar con email
                  </Button>
                  <p className="text-center">
                    <Link
                      onClick={handleOpenRecovery}
                      underline="hover"
                      className="text-center text-xs cursor-pointer"
                    >
                      Recupera tu contraseña
                    </Link>
                  </p>
                </motion.div>
              ) : !isPasswordRecovery && isEmailSubmitted ? (
                <motion.div
                  key="password"
                  className="flex flex-col w-full max-w-xs gap-4"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0, x: -100 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <p className="cursor-pointer">
                    <Link
                      onPress={() => {
                        setIsEmailSubmitted(false);
                        setIsPasswordRecovery(false);
                        resetRecoveryState();
                      }}
                      underline="hover"
                      size="sm"
                      color="foreground"
                    >
                      <Icon icon="ic:round-arrow-back-ios" className="mr-2" />
                      Volver
                    </Link>
                  </p>
                  <Controller
                    name="password"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        variant="bordered"
                        label="Ingrese su contraseña"
                        endContent={
                          <button
                            className="focus:outline-none"
                            type="button"
                            onClick={toggleVisibility}
                          >
                            {isVisible ? (
                              <EyeSlashIcon className="text-2xl text-default-400 pointer-events-none" />
                            ) : (
                              <EyeIcon className="text-2xl text-default-400 pointer-events-none" />
                            )}
                          </button>
                        }
                        type={isVisible ? "text" : "password"}
                        isInvalid={!!errors.password}
                        errorMessage={
                          errors.password?.type === "required"
                            ? "Este campo es obligatorio"
                            : errors.password?.type === "manual"
                            ? errors.password?.message
                            : null
                        }
                        className="w-full form-input"
                      />
                    )}
                  />
                  <Button
                    type="submit"
                    color="primary"
                    fullWidth={true}
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                  >
                    Iniciar sesión
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="passwordRecovery"
                  className="flex flex-col w-full max-w-xs gap-4"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0, x: -100 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <p className="cursor-pointer">
                    <Link
                      onPress={() => {
                        setIsEmailSubmitted(false);
                        setIsPasswordRecovery(false);
                        resetRecoveryState();
                      }}
                      underline="hover"
                      size="sm"
                      color="foreground"
                    >
                      <Icon icon="ic:round-arrow-back-ios" className="mr-2" />
                      Volver
                    </Link>
                  </p>
                  <Controller
                    name="passwordRecovery"
                    control={control}
                    rules={{
                      required: "Este campo es obligatorio",
                      pattern: {
                        value: emailRegex,
                        message: "Por favor, introduce un email válido",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        variant="bordered"
                        label="Ingrese su email"
                        isInvalid={!!errors.passwordRecovery}
                        errorMessage={
                          errors.passwordRecovery?.message || null
                        }
                        className="w-full form-input"
                      />
                    )}
                  />
                  {isRecoveryCodeSent && !validatedRecovery && (
                    <Controller
                      name="recoveryToken"
                      control={control}
                      rules={{ required: "Ingresa el código de recuperación" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          variant="bordered"
                          label="Código de recuperación"
                          isInvalid={!!errors.recoveryToken}
                          errorMessage={errors.recoveryToken?.message || null}
                          className="w-full form-input"
                        />
                      )}
                    />
                  )}
                  {validatedRecovery && (
                    <>
                      <Controller
                        name="newPassword"
                        control={control}
                        rules={{
                          required: "Este campo es obligatorio",
                          pattern: {
                            value: passwordPattern,
                            message:
                              "La contraseña debe tener al menos 8 caracteres entre ellos, mayusculas, minusculas, un número y un carácter especial",
                          },
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            variant="bordered"
                            label="Ingrese su nueva contraseña"
                            endContent={
                              <button
                                className="focus:outline-none"
                                type="button"
                                onClick={toggleNewPasswordVisibility}
                              >
                                {isNewPasswordVisible ? (
                                  <EyeSlashIcon className="text-2xl text-default-400 pointer-events-none" />
                                ) : (
                                  <EyeIcon className="text-2xl text-default-400 pointer-events-none" />
                                )}
                              </button>
                            }
                            type={isNewPasswordVisible ? "text" : "password"}
                            isInvalid={!!errors.newPassword}
                            errorMessage={errors.newPassword?.message || null}
                            className="w-full form-input"
                          />
                        )}
                      />
                      <Controller
                        name="confirmPassword"
                        control={control}
                        rules={{
                          required: "Este campo es obligatorio",
                          validate: (value) => {
                            const newPassword = getValues("newPassword");
                            if ((value || "").trim() !== (newPassword || "").trim()) {
                              return "Las contraseñas no coinciden";
                            }
                            return true;
                          },
                        }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            variant="bordered"
                            label="Confirme su nueva contraseña"
                            endContent={
                              <button
                                className="focus:outline-none"
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                              >
                                {isConfirmPasswordVisible ? (
                                  <EyeSlashIcon className="text-2xl text-default-400 pointer-events-none" />
                                ) : (
                                  <EyeIcon className="text-2xl text-default-400 pointer-events-none" />
                                )}
                              </button>
                            }
                            type={isConfirmPasswordVisible ? "text" : "password"}
                            isInvalid={!!errors.confirmPassword}
                            errorMessage={errors.confirmPassword?.message || null}
                            className="w-full form-input"
                          />
                        )}
                      />
                    </>
                  )}
                  {recoveryStatusMessage ? (
                    <p className="text-success text-xs">{recoveryStatusMessage}</p>
                  ) : null}
                  {recoveryErrorMessage ? (
                    <p className="text-danger text-xs">{recoveryErrorMessage}</p>
                  ) : null}
                  <Button
                    type="button"
                    onPress={
                      validatedRecovery
                        ? handleUpdatePassword
                        : isRecoveryCodeSent
                        ? handleValidateRecovery
                        : handleRequestRecovery
                    }
                    color="primary"
                    fullWidth={true}
                    startContent={
                      validatedRecovery ? undefined : <EmailIcon />
                    }
                    isLoading={isRecoveryLoading}
                    isDisabled={isRecoveryLoading}
                  >
                    {validatedRecovery
                      ? "Cambiar contraseña"
                      : isRecoveryCodeSent
                      ? "Validar código"
                      : "Recuperar contraseña"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
          <div className="mt-4">
            <ThemeSwitcher layout="login" />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

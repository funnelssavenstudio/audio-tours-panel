"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Chip,
  Input,
  Tab,
  Tabs,
  Textarea,
  Spinner,
  ScrollShadow,
} from "@heroui/react";
import { Controller, useForm } from "react-hook-form";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { getReferenceLocales } from "@/services/languages/getReferenceLanguages";
import { createLanguage } from "@/services/languages/createLanguage";
import { useErrorHandler } from "@/helpers/errorsHandler";
import SelectorLangs from "@/app/components/selectorlangs/SelectorLangs";
import { createLocale } from "@/services/languages/createLocale";

const localeSchema = z.object({
  key: z.string(),
  value: z.string().min(1, "La traducción es requerida"),
});

const createLanguageFormSchema = z.object({
  language: z.string().min(2, "El código es requerido"),
  language_code: z.string().min(2, "El código es requerido"),
  language_uuid: z.string().optional(),
  locales: z.array(localeSchema),
});

type CreateLanguageFormData = z.infer<typeof createLanguageFormSchema>;

type TabKey = "info" | "translations";

interface CreateLanguageFormProps {
  token: string;
}

export default function CreateLanguageForm({ token }: CreateLanguageFormProps) {
  const router = useRouter();
  const handleError = useErrorHandler();
  const [selectedTab, setSelectedTab] = useState<TabKey>("info");
  const [visitedTabs, setVisitedTabs] = useState<TabKey[]>(["info"]);
  const [referenceLocales, setReferenceLocales] = useState<
    { key: string; value: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [localesStatus, setLocalesStatus] = useState<
    { status: null | "success" | "error"; message?: string }[]
  >([]);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    getValues,
    watch,
    trigger,
  } = useForm<CreateLanguageFormData>({
    resolver: zodResolver(createLanguageFormSchema),
    defaultValues: {
      locales: [],
    },
  });

  const watchedLocales = watch("locales") || [];
  const totalTranslations = referenceLocales.length;
  const completedTranslations = watchedLocales.filter(
    (locale) => locale?.value?.trim().length > 0
  ).length;
  const missingTranslations = Math.max(
    totalTranslations - completedTranslations,
    0
  );

  useEffect(() => {
    const fetchLocales = async () => {
      setIsLoading(true);
      setFormError(null);
      try {
        const refs = await getReferenceLocales(token, "en");
        setReferenceLocales(refs);
        setValue(
          "locales",
          refs.map((ref) => ({ key: ref.key, value: "" }))
        );
      } catch (error) {
        setFormError(
          handleError(error) || "Error al cargar las claves de referencia."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocales();
  }, [handleError, setValue, token]);

  useEffect(() => {
    setLocalesStatus(referenceLocales.map(() => ({ status: null })));
  }, [referenceLocales]);

  const handleCurrentTab = async (isContinue = true) => {
    console.log("data: ", getValues());

    if (selectedTab === "info" && isContinue) {
      const valid = await trigger(["language_code"]);
      if (valid) {
        setSelectedTab("translations");
        setVisitedTabs((prev) =>
          prev.includes("translations") ? prev : [...prev, "translations"]
        );
      }
    } else if (selectedTab === "translations" && !isContinue) {
      setSelectedTab("info");
    }
  };

  const onSubmit = async (data: CreateLanguageFormData) => {
    console.log("data: ", data);
    setFormError(null);

    try {
      await createLanguage(token, {
        name: data.language,
        code: data.language_code.toLowerCase(),
        active: true,
        locales: data.locales,
      });
      router.push("/backoffice/languages");
    } catch (error) {
      setFormError(handleError(error) || "Error al crear el idioma.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Cargando estructura de traducciones..." />
      </div>
    );
  }

  return (
    <form className="flex flex-row gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex w-full flex-col items-center">
        <Tabs
          aria-label="Opciones"
          color="primary"
          variant="underlined"
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as TabKey)}
          disabledKeys={(["info", "translations"] as TabKey[]).filter(
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
            key="info"
            title={
              <div className="flex items-center space-x-2 mx-2">
                <Icon icon="solar:globus-outline" width="24" />
                <span>1. Información</span>
              </div>
            }
          >
            <div className="flex flex-col w-full max-w-2xl gap-4">
              <div className="flex gap-4 rounded-medium bg-secondary/20 p-4 items-center mb-4">
                <Icon
                  icon="solar:info-circle-line-duotone"
                  className="text-primary flex-shrink-0"
                  width={36}
                />
                <p className="text-tiny">
                  Selecciona el idioma que quieres crear despues de crearlo
                  podrás crear tours en este idioma.
                </p>
              </div>
              <div className="w-2/3 flex flex-col gap-4 mx-auto">
                <SelectorLangs
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                  isActive={false}
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
            key="translations"
            title={
              <div className="flex items-center space-x-2 mx-2">
                <Icon icon="clarity:language-line" width="24" />
                <span>2. Traducciones</span>
              </div>
            }
          >
            <div className="flex flex-col w-full max-w-2xl gap-4">
              <div className="flex gap-4 rounded-medium bg-secondary/20 p-4 items-center mb-4">
                <Icon
                  icon="solar:info-circle-line-duotone"
                  className="text-primary flex-shrink-0"
                  width={36}
                />
                <p className="text-tiny">
                  Ingresa la traducción para cada clave. Puedes dejar alguna
                  pendiente y completarla luego.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Chip size="sm" variant="flat" color="primary">
                  Total: {totalTranslations}
                </Chip>
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    totalTranslations > 0 &&
                    completedTranslations === totalTranslations
                      ? "success"
                      : "warning"
                  }
                >
                  Completadas: {completedTranslations}
                </Chip>
                <Chip
                  size="sm"
                  variant="flat"
                  color={missingTranslations === 0 ? "success" : "danger"}
                >
                  Faltantes: {missingTranslations}
                </Chip>
              </div>
              {referenceLocales.map((ref, index) => (
                <Controller
                  name={`locales.${index}.value`}
                  key={ref.key}
                  control={control}
                  rules={{ required: "La traducción es requerida" }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label={`Traducción para "${ref.value}"`}
                      placeholder="Escribe la traducción aquí..."
                      variant="bordered"
                      minRows={1}
                      isInvalid={
                        !!errors.locales?.[index]?.value ||
                        localesStatus[index]?.status === "error"
                      }
                      color={
                        localesStatus[index]?.status === "success"
                          ? "success"
                          : undefined
                      }
                      errorMessage={
                        errors.locales?.[index]?.value?.message ||
                        localesStatus[index]?.message
                      }
                      onBlur={async (e) => {
                        field.onBlur();
                        const valid = await trigger(`locales.${index}.value`);
                        if (!valid) return;

                        const code = getValues("language_code");
                        const value = e.target.value;
                        const language_uuid = getValues("language_uuid");
                        const language = getValues("language");

                        const result = await createLocale(token, {
                          code,
                          key: ref.key,
                          value,
                          language_uuid,
                          language,
                        });

                        setLocalesStatus((prev) => {
                          const updated = [...prev];
                          updated[index] = {
                            status: result.success ? "success" : "error",
                            message: result.success
                              ? undefined
                              : result.message,
                          };
                          return updated;
                        });

                        if (result.success) {
                          setTimeout(() => {
                            setLocalesStatus((prev) => {
                              const updated = [...prev];
                              updated[index] = { status: null };
                              return updated;
                            });
                          }, 2000);
                        }
                      }}
                    />
                  )}
                />
              ))}
              <div className="flex justify-end gap-6 pt-4">
                <Button
                  variant="bordered"
                  onPress={() => handleCurrentTab(false)}
                  type="button"
                >
                  Volver
                </Button>
                <Button type="submit" color="primary" isLoading={isSubmitting}>
                  Crear Idioma
                </Button>
              </div>
              {formError && (
                <div className="p-3 bg-danger/10 text-danger rounded-medium text-sm mt-4">
                  {formError}
                </div>
              )}
            </div>
          </Tab>
        </Tabs>
      </div>
    </form>
  );
}

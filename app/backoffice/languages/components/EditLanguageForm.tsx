"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Chip, Spinner, Textarea, Tabs, Tab } from "@heroui/react";
import { getReferenceLocales } from "@/services/languages/getReferenceLanguages";
import { updateLocale } from "@/services/languages/updateLocale";
import { createLocale } from "@/services/languages/createLocale";

const localeSchema = z.object({
  key: z.string(),
  value: z.string().min(1, "La traducción es requerida"),
  uuid: z.string().optional(),
});

const editLanguageFormSchema = z.object({
  locales: z.array(localeSchema),
});

type EditLanguageFormData = z.infer<typeof editLanguageFormSchema>;

type CombinedLocale = {
  key: string;
  value: string;
  uuid?: string;
  referenceValue: string;
};

interface EditLanguageFormProps {
  token: string;
  languageCode: string;
  languageUuid: string;
}

export default function EditLanguageForm({
  token,
  languageCode,
  languageUuid,
}: EditLanguageFormProps) {
  const [referenceLocales, setReferenceLocales] = useState<CombinedLocale[]>([]);
  const [originalLocales, setOriginalLocales] = useState<Record<string, any>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [localesStatus, setLocalesStatus] = useState<
    { status: null | "success" | "error"; message?: string }[]
  >([]);

  const {
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
    trigger,
  } = useForm<EditLanguageFormData>({
    resolver: zodResolver(editLanguageFormSchema),
    defaultValues: { locales: [] },
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
      try {
        const baseRefs = await getReferenceLocales(token, "en");
        const langRefs = await getReferenceLocales(token, languageCode);

        const langRefsMap: Record<string, any> = {};
        langRefs.forEach((item) => {
          langRefsMap[item.key] = item;
        });
        setOriginalLocales(langRefsMap);

        const combined = baseRefs.map((ref) => ({
          key: ref.key,
          value: langRefsMap[ref.key]?.value || "",
          uuid: langRefsMap[ref.key]?.uuid,
          referenceValue: ref.value,
        }));

        setReferenceLocales(combined);
        setValue("locales", combined);
        setLocalesStatus(combined.map(() => ({ status: null })));
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocales();
  }, [token, languageCode, setValue]);

  const handleBlur = async (index: number, field: any, ref: any) => {
    field.onBlur();
    const valid = await trigger(`locales.${index}.value`);
    if (!valid) return;

    const currentValue = getValues(`locales.${index}.value`);
    const originalValue = originalLocales[ref.key]?.value || "";

    if (currentValue === originalValue && ref.uuid) return;

    try {
      if (ref.uuid) {
        await updateLocale({
          token,
          localeUuid: ref.uuid,
          value: currentValue,
        });

        setOriginalLocales((prev) => ({
          ...prev,
          [ref.key]: {
            ...(prev[ref.key] || {}),
            key: ref.key,
            uuid: ref.uuid,
            value: currentValue,
          },
        }));
      } else {
        const result = await createLocale(token, {
          code: languageCode,
          key: ref.key,
          value: currentValue,
          language_uuid: languageUuid,
        });

        if (!result.success) {
          throw new Error(result.message || "Error al guardar la traducción");
        }

        // Refresh locale uuids for newly created keys so next edits can use update.
        const refreshedLangRefs = await getReferenceLocales(token, languageCode);
        const refreshedMap: Record<string, any> = {};
        refreshedLangRefs.forEach((item) => {
          refreshedMap[item.key] = item;
        });

        setOriginalLocales((prev) => ({ ...prev, ...refreshedMap }));
        setReferenceLocales((prev) =>
          prev.map((locale) =>
            locale.key === ref.key
              ? {
                  ...locale,
                  uuid: refreshedMap[ref.key]?.uuid,
                  value: currentValue,
                }
              : locale
          )
        );
        setValue(`locales.${index}.uuid`, refreshedMap[ref.key]?.uuid);
      }

      setLocalesStatus((prev) => {
        const updated = [...prev];
        updated[index] = { status: "success" };
        return updated;
      });
      setTimeout(() => {
        setLocalesStatus((prev) => {
          const updated = [...prev];
          updated[index] = { status: null };
          return updated;
        });
      }, 2000);
    } catch (error: any) {
      setLocalesStatus((prev) => {
        const updated = [...prev];
        updated[index] = {
          status: "error",
          message: error?.message || "Error al guardar la traducción",
        };
        return updated;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Cargando traducciones..." />
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4">
      <Tabs
        aria-label="Opciones"
        color="primary"
        variant="underlined"
        selectedKey="translations"
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
          key="translations"
          title={
            <div className="flex items-center space-x-2 mx-2">
              <span>Editar Traducciones</span>
            </div>
          }
        >
          <div className="flex flex-col w-full max-w-2xl gap-4">
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
                    label={`Traducción para "${
                      ref.referenceValue || ref.key
                    }"`}
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
                    onBlur={() => handleBlur(index, field, ref)}
                  />
                )}
              />
            ))}
          </div>
        </Tab>
      </Tabs>
    </form>
  );
}

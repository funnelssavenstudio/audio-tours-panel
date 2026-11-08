import React, { useEffect, useState } from "react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  MenuTriggerAction,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useFilter } from "@react-aria/i18n";
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  Path,
  SetValueConfig,
  UseFormSetError,
  UseFormWatch,
} from "react-hook-form";
import { Poi } from "@/services/poi/getPois";
import { Stop } from "@/services/stop/getStops";
import { Tab } from "./Tab";
import { removeItem } from "./array-utils";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { deleteCheckpoint } from "@/services/checkpoints/deleteCheckpoint";

export type Tab = {
  label: string;
  value: string;
  type?: string;
  checkpoint_uuid?: string;
  language: string;
  description: string;
};

type ReorderFormValues = FieldValues & {
  checkpoints?: Tab[];
};

interface ReOrderListProps<T extends ReorderFormValues> {
  tabs: Tab[];
  setTabs: (tabs: Tab[]) => void;
  setValue: (
    name: "checkpoints",
    value: T["checkpoints"],
    options?: SetValueConfig
  ) => void;
  errors: FieldErrors<T>;
  setError: UseFormSetError<T>;
  watch: UseFormWatch<T>;
  control: Control<T, any>;
  items: Poi[] | Stop[];
  languageCode?: string;
  tourLanguages?: string[];
}

const computeMissingLanguages = (
  tourLanguages: string[],
  itemTranslations: { language_code: string }[]
): string[] => {
  if (!tourLanguages.length) return [];
  const present = new Set(itemTranslations.map((t) => t.language_code));
  return tourLanguages.filter((lang) => !present.has(lang));
};

type FieldState = {
  selectedKey: React.Key | null;
  inputValue: string;
  items: Poi[] | Stop[];
};

export default function ReOrderListTour<T extends ReorderFormValues>({
  tabs,
  setTabs,
  setValue,
  errors,
  setError,
  watch,
  control,
  items,
  languageCode: languageCodeProp,
  tourLanguages = [],
}: ReOrderListProps<T>) {
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState<Tab | null>(null);
  const [touched, setTouched] = useState(false);
  const params = useParams();
  const languageCode =
    languageCodeProp ||
    watch("language_code" as Path<T>) ||
    (params.lang as string);
  const { startsWith } = useFilter({ sensitivity: "base" });

  const [fieldState, setFieldState] = useState<FieldState>({
    selectedKey: null,
    inputValue: "",
    items,
  });

  console.log("items", items);
  console.log("tabs dentrooo", tabs);

  useEffect(() => {
    setFieldState((prev) => ({
      ...prev,
      items: prev.inputValue
        ? items.filter((item) =>
            item.translations.some((translation) =>
              startsWith(translation.title, prev.inputValue)
            )
          )
        : items,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    setValue("checkpoints", tabs as T["checkpoints"], {
      shouldValidate: true,
    });
  }, [tabs, setValue]);

  const remove = async (item: Tab, fieldOnChange: any) => {
    console.log("Intentando eliminar:", item);
    const token = session?.user?.accessToken;
    if (!token) return;
    const removeCheckpoint = deleteCheckpoint(token, item.checkpoint_uuid!);
    console.log("removeCheckpoint", removeCheckpoint);

    const updatedTabs = removeItem(tabs, item);
    console.log("Lista actualizada de tabs:", updatedTabs);
    setTouched(false);
    setTabs(updatedTabs);
    fieldOnChange(updatedTabs);
  };

  const handleAutocompleteChange = (value: string) => {
    setTouched(true);
    const newValue = items.find((item) =>
      item.translations.some((translation) => translation.title === value)
    );
    if (newValue) {
      const translation = newValue.translations.find(
        (t) => t.language_code === languageCode
      );
      if (translation && !tabs.find((tab) => tab.label === translation.title)) {
        const updatedTabs = [
          ...tabs,
          {
            label: translation.title,
            value: newValue.uuid,
            type: newValue.type,
            language: translation.language_code,
            description: translation.description,
          },
        ];
        setTimeout(() => {
          setTabs(updatedTabs);
          setSelectedTab({
            label: translation.title,
            value: newValue.uuid,
            type: newValue.type,
            language: translation.language_code,
            description: translation.description,
          });
          setTouched(false);
        }, 0);
      }
    }
  };

  const onSelectionChange = (key: React.Key | null) => {
    if (key === null) {
      return;
    }

    setFieldState((prevState) => {
      const selectedItem = prevState.items.find(
        (option) => option.uuid === key
      );
      if (selectedItem) {
        const translation = selectedItem.translations.find(
          (t) => t.language_code === languageCode
        );
        if (translation) {
          handleAutocompleteChange(translation.title);
        }
      }
      return {
        ...prevState,
        selectedKey: null,
        inputValue: "",
      };
    });
  };

  const onInputChange = (value: string) => {
    setFieldState((prevState) => ({
      inputValue: value,
      selectedKey: value === "" ? null : prevState.selectedKey,
      items: items.filter((item) =>
        item.translations.some((translation) =>
          startsWith(translation.title, value)
        )
      ),
    }));
  };

  const onOpenChange = (isOpen: boolean, menuTrigger: MenuTriggerAction) => {
    if (menuTrigger === "manual" && isOpen) {
      setFieldState((prevState) => ({
        inputValue: prevState.inputValue,
        selectedKey: prevState.selectedKey,
        items,
      }));
    }
  };

  return (
    <>
      <div className="flex gap-4 justify-center">
        <Autocomplete
          aria-label="Selector de puntos de interés o paradas."
          placeholder="Escribe para buscar..."
          items={fieldState.items}
          itemHeight={56}
          maxListboxHeight={320}
          disabledKeys={tabs.map((item) => item.value)}
          onInputChange={onInputChange}
          onSelectionChange={onSelectionChange}
          onOpenChange={onOpenChange}
          inputValue={fieldState.inputValue}
          startContent={<Icon icon="lets-icons:search" width="20" />}
          isInvalid={!!errors.checkpoints}
          errorMessage={errors.checkpoints?.message?.toString() || ""}
          className="w-2/3 pb-4"
          classNames={{
            base: "w-2/3",
            listboxWrapper: "max-h-[320px]",
            selectorButton: "text-default-500",
          }}
          inputProps={{
            classNames: {
              input: "ml-1",
              inputWrapper: "h-[48px]",
            },
          }}
          listboxProps={{
            hideSelectedIcon: true,
            itemClasses: {
              base: [
                "rounded-medium",
                "h-14",
                "text-default-500",
                "transition-opacity",
                "data-[hover=true]:text-foreground",
                "dark:data-[hover=true]:bg-default-50",
                "data-[pressed=true]:opacity-70",
                "data-[hover=true]:bg-default-200",
                "data-[selectable=true]:focus:bg-default-100",
                "data-[focus-visible=true]:ring-default-500",
              ],
              wrapper: "min-w-0",
              title: "truncate",
              description: "truncate",
            },
          }}
          popoverProps={{
            offset: 10,
            classNames: {
              base: "rounded-large",
              content: "p-1 border-small border-default-100 bg-background",
            },
          }}
          radius="full"
          variant="bordered"
        >
          {(item) => {
            const translation = item.translations.find(
              (t) => t.language_code === languageCode
            );
            const missingLanguages = computeMissingLanguages(
              tourLanguages,
              item.translations
            );

            return (
              <AutocompleteItem
                key={item.uuid}
                textValue={translation?.title || ""}
                title={
                  item.type
                    ? `${translation?.title || "Sin título"} - ${item.type}`
                    : (translation?.title ?? "Sin título")
                }
                description={
                  missingLanguages.length > 0
                    ? `⚠ Falta traducción en: ${missingLanguages
                        .map((l) => l.toUpperCase())
                        .join(", ")}`
                    : translation?.description || "Sin descripción"
                }
                className="h-14"
                classNames={{
                  wrapper: "min-w-0",
                  title: "truncate",
                  description:
                    missingLanguages.length > 0
                      ? "truncate text-warning"
                      : "truncate",
                }}
                startContent={
                  item.type === "Punto de interés" ? (
                    <Icon className="w-6 h-6" icon="solar:map-point-linear" />
                  ) : item.type === "Parada" ? (
                    <Icon className="w-6 h-6" icon="bi:sign-stop-lights" />
                  ) : null
                }
              />
            );
          }}
        </Autocomplete>
      </div>
      <Controller
        name={"checkpoints" as Path<T>}
        control={control}
        rules={{
          validate: (value) =>
            (Array.isArray(value) && value.length > 0) ||
            "Debe haber al menos un elemento",
        }}
        render={({ field }) => {
          console.log("field", field);
          const currentValue = (Array.isArray(field.value)
            ? field.value
            : []) as Tab[];

          return (
            <Reorder.Group
              as="ul"
              axis="y"
              onReorder={(e: Tab[]) => {
                field.onChange(e);
                setTabs(e);
              }}
              className="flex flex-col gap-2 w-full"
              values={currentValue}
            >
              <AnimatePresence initial={false}>
                {currentValue.map((item: Tab, index: number) => {
                  const matchedSource = items.find(
                    (i) => i.uuid === item.value
                  );
                  const missingLanguages = matchedSource
                    ? computeMissingLanguages(
                        tourLanguages,
                        matchedSource.translations
                      )
                    : [];
                  return (
                  <motion.div
                    key={item.checkpoint_uuid ?? item.value}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Tab
                      index={index}
                      item={item}
                      missingLanguages={missingLanguages}
                      isSelected={selectedTab === item}
                      onClick={() => setSelectedTab(item)}
                      onRemove={() => {
                        remove(item, field.onChange);
                      }}
                    />
                  </motion.div>
                  );
                })}
              </AnimatePresence>
            </Reorder.Group>
          );
        }}
      />
    </>
  );
}

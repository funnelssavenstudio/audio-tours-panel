import { Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import { AxiosError } from "axios";
import { Icon } from "@iconify/react/dist/iconify.js";
import { FC, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { ActiveLang, getActiveLangs } from "@/services/common/getActiveLangs";
import { useErrorHandler } from "@/helpers/errorsHandler";
import flags from "@/data/flags.json";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { TourFormValues } from "@/app/backoffice/tours/create-tour/page";
import { PoiFormValues } from "@/app/backoffice/poi/create-poi/page";

interface SelectorLangsProps {
  control: Control<TourFormValues | PoiFormValues | any, any>;
  errors: FieldErrors<TourFormValues | PoiFormValues>;
  setValue: UseFormSetValue<TourFormValues | PoiFormValues | any>;
  getValues: UseFormGetValues<TourFormValues | PoiFormValues | any>;
  existingLangs?: string[];
  isActive?: boolean;
}

const SelectorLangs: FC<SelectorLangsProps> = ({
  control,
  errors,
  setValue,
  getValues,
  existingLangs,
  isActive = true,
}) => {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const handleError = useErrorHandler();
  const [langs, setLangs] = useState<ActiveLang[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchActiveLangs = async () => {
      try {
        const fetchedLangs = await getActiveLangs(token, isActive);
        setLangs(fetchedLangs);
      } catch (error: AxiosError | any) {
        console.log("error: ", error);
        handleError(error);
      }
    };
    fetchActiveLangs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isActive]);

  return (
    <Controller
      name="language_code"
      control={control}
      rules={{ required: "El idioma es requerido" }}
      render={({ field }) => (
        <Autocomplete
          {...field}
          aria-label="Selector de idioma"
          placeholder="Escribe para buscar el idioma..."
          defaultItems={langs}
          startContent={<Icon icon="lets-icons:search" width="20" />}
          isInvalid={!!errors.language_code}
          errorMessage={errors.language_code && errors.language_code.message}
          onSelectionChange={(item) => {
            setValue("language_code", item as string);
            setValue(
              "language",
              langs.find((lang) => lang.code === item)?.name || ""
            );
            setValue(
              "language_uuid",
              langs.find((lang) => lang.code === item)?.uuid || ""
            );
          }}
          disabledKeys={existingLangs}
          selectedKey={getValues("language_code")}
          className="max-w-full pb-4"
          classNames={{
            base: "max-w-xs",
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
                "text-default-500",
                "transition-opacity",
                "data-[hover=true]:text-foreground",
                "dark:data-[hover=true]:bg-default-50",
                "data-[pressed=true]:opacity-70",
                "data-[hover=true]:bg-default-200",
                "data-[selectable=true]:focus:bg-default-100",
                "data-[focus-visible=true]:ring-default-500",
              ],
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
          {(item) => (
            <AutocompleteItem
              key={item.code}
              textValue={item.name}
              startContent={
                <Avatar
                  alt={item.code}
                  className="w-6 h-6"
                  src={flags[item.code as keyof typeof flags]}
                />
              }
            >
              <span className="text-small">{item.name}</span>
            </AutocompleteItem>
          )}
        </Autocomplete>
      )}
    />
  );
};

export default SelectorLangs;

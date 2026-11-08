import {
  Modal,
  Button,
  Select,
  ModalBody,
  SelectItem,
  DateRangePicker,
  ModalContent,
  ModalFooter,
} from "@heroui/react";
import { useForm, Controller } from "react-hook-form";

interface FilterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filters: String;
  onSubmit: (data: any) => void;
}

const animals = [
  {
    label: "Cat",
    value: "cat",
    description: "The second most popular pet in the world",
  },
  {
    label: "Dog",
    value: "dog",
    description: "The most popular pet in the world",
  },
  {
    label: "Elephant",
    value: "elephant",
    description: "The largest land animal",
  },
  { label: "Lion", value: "lion", description: "The king of the jungle" },
  { label: "Tiger", value: "tiger", description: "The largest cat species" },
  {
    label: "Giraffe",
    value: "giraffe",
    description: "The tallest land animal",
  },
  {
    label: "Dolphin",
    value: "dolphin",
    description: "A widely distributed and diverse group of aquatic mammals",
  },
  {
    label: "Penguin",
    value: "penguin",
    description: "A group of aquatic flightless birds",
  },
  {
    label: "Zebra",
    value: "zebra",
    description: "A several species of African equids",
  },
  {
    label: "Shark",
    value: "shark",
    description:
      "A group of elasmobranch fish characterized by a cartilaginous skeleton",
  },
  {
    label: "Whale",
    value: "whale",
    description: "Diverse group of fully aquatic placental marine mammals",
  },
  {
    label: "Otter",
    value: "otter",
    description: "A carnivorous mammal in the subfamily Lutrinae",
  },
  {
    label: "Crocodile",
    value: "crocodile",
    description: "A large semiaquatic reptile",
  },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onOpenChange,
  filters,
  onSubmit,
}) => {
  const { handleSubmit, control, formState } = useForm();

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top"
      size="md"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="p-6">
              <h2 className="text-lg font-semibold">Filtrar</h2>
              <p className="text-sm">
                Selecciona una o varias opciones y aplica, los resultados se
                verán reflejados en la tabla.
              </p>
              <div className="flex flex-col gap-4 pt-4">
                <Controller
                  name="animal"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select
                      labelPlacement="inside"
                      placeholder="Select an animal"
                      variant="bordered"
                      label="Select an animal"
                      className="w-full"
                      {...field}
                    >
                      {animals.map((animal) => (
                        <SelectItem key={animal.value} value={animal.value}>
                          {animal.label}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
                <Controller
                  name="dates"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <DateRangePicker
                      showMonthAndYearPickers
                      labelPlacement="inside"
                      variant="bordered"
                      label="Por fechas"
                      className="w-full"
                      {...field}
                    />
                  )}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
              <Button type="submit" color="primary">
                Aplicar filtros
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};

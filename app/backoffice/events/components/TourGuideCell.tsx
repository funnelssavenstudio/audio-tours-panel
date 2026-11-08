import React from "react";
import { Select, SelectItem, Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js"; // Asegúrate de tener @iconify/react instalado
import { Event, Translation } from "@/services/events/getEvents";

interface TourGuideCellProps {
  event: Event;
  availableGuides: { key: string; label: string }[];
  isLoadingGuideList: boolean;
  currentSelection: { eventUuid: string; guideUuid: string } | null;
  currentIsAssigning: boolean;
  onSelectGuide: (eventUuid: string, guideUuid: string | null) => void; // Permitir null para deselección si es necesario
  onAssignGuide: (eventUuid: string, guideUuid: string) => Promise<void>;
  getTitleByLanguage: (
    translations: Translation[],
    lang1: string,
    lang2: string
  ) => string;
  formatDateTime: (datetime: string) => string;
}

const TourGuideCell: React.FC<TourGuideCellProps> = ({
  event,
  availableGuides,
  isLoadingGuideList,
  currentSelection,
  currentIsAssigning,
  onSelectGuide,
  onAssignGuide,
}) => {
  const isRowSelected = currentSelection?.eventUuid === event.uuid;
  const selectedGuideKey = isRowSelected ? currentSelection.guideUuid : null;

  const cellValue = event.tour_guide;
  if (
    cellValue &&
    typeof cellValue === "object" &&
    "name" in cellValue &&
    "last_name" in cellValue
  ) {
    return <span>{`${cellValue.name} ${cellValue.last_name}`}</span>;
  }

  const handleAssignPress = async () => {
    if (selectedGuideKey) {
      try {
        await onAssignGuide(event.uuid, selectedGuideKey);
      } catch (error) {
        console.error("Error en onAssignGuide desde TourGuideCell:", error);
      }
    }
  };

  const handleSelectionChange = (keys: React.Key | Set<React.Key>) => {
    let selectedKeyValue: React.Key | null = null; // Usar React.Key temporalmente

    if (keys instanceof Set) {
      // Obtener el primer valor del Set (asumiendo selección única)
      selectedKeyValue = keys.values().next().value ?? null;
    } else if (typeof keys === "string" || typeof keys === "number") {
      // Si keys ya es una Key única
      selectedKeyValue = keys;
    }

    // Convertir la clave seleccionada a string | null antes de usarla
    const selectedKeyString: string | null =
      selectedKeyValue !== null ? String(selectedKeyValue) : null;

    if (selectedKeyString) {
      onSelectGuide(event.uuid, selectedKeyString);
    } else {
      // Opcional: Manejar deselección si el Select lo permite
      // onSelectGuide(event.uuid, null);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <Select
        aria-label="Seleccionar Guía"
        placeholder="Elige un guía"
        items={availableGuides}
        isLoading={isLoadingGuideList}
        selectedKeys={selectedGuideKey ? [selectedGuideKey] : []}
        onSelectionChange={handleSelectionChange}
        size="sm"
        className="flex-grow" // Para que ocupe el espacio disponible
        // Opcional: Añadir información del tour/fecha como descripción
        // description={`${getTitleByLanguage(event.translations, "es", "en")} - ${formatDateTime(event.datetime)}`}
      >
        {(guide) => (
          <SelectItem key={guide.key} textValue={guide.label}>
            {guide.label}
          </SelectItem>
        )}
      </Select>

      {isRowSelected && (
        <Button
          isIconOnly
          color="success"
          size="sm"
          variant="flat" // o "solid" o "light" según prefieras
          aria-label="Confirmar asignación"
          isLoading={currentIsAssigning}
          onPress={handleAssignPress}
          className="flex-shrink-0" // Para que no se encoja
        >
          {!currentIsAssigning && <Icon icon="heroicons:check-20-solid" />}
        </Button>
      )}
      {/* Placeholder para mantener el layout consistente cuando no hay botón */}
      {!isRowSelected && (
        <div
          style={{ width: "40px", height: "30px" }}
          className="flex-shrink-0"
        ></div>
      )}
    </div>
  );
};

export default TourGuideCell;

import { useState, useMemo } from "react";
import {
  Button,
  Divider,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ScrollShadow,
  Spinner,
  Chip,
  User,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Tourist } from "@/services/tickets/getTouristsByEvent";
interface TouristListModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tourists: Tourist[];
  isLoading: boolean;
  error: string | null;
}

export const TouristListModal: React.FC<TouristListModalProps> = ({
  isOpen,
  onOpenChange,
  tourists,
  isLoading,
  error,
}) => {
  const [searchValue, setSearchValue] = useState("");

  const filteredTourists = useMemo(() => {
    if (!tourists) return [];
    return tourists.filter((tourist) => {
      const fullName = `${tourist.name || ""} ${
        tourist.last_name || ""
      }`.toLowerCase();
      const email = tourist.email.toLowerCase();
      const search = searchValue.toLowerCase();
      return fullName.includes(search) || email.includes(search);
    });
  }, [tourists, searchValue]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="bottom"
      size="full"
      backdrop="blur"
      className="max-h-[70vh]"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <div className="p-5">
              <h1 className="text-xl font-bold mb-5">Lista de turistas</h1>
              <Input
                isClearable
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchValue}
                onValueChange={setSearchValue}
                className="p-2 mb-5 w-full"
                startContent={<Icon icon="solar:magnifer-linear" />}
                onClear={() => setSearchValue("")}
              />
              <ScrollShadow
                hideScrollBar
                className="max-h-[calc(70vh-180px)]" // Ajustar altura máxima para dejar espacio a header/footer/input
              >
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Spinner label="Cargando turistas..." />
                  </div>
                ) : error ? (
                  <div className="text-center text-danger p-4">{error}</div>
                ) : filteredTourists.length === 0 ? (
                  <div className="text-center text-default-500 p-4">
                    {searchValue
                      ? "No se encontraron turistas."
                      : "No hay turistas registrados para este evento."}
                  </div>
                ) : (
                  filteredTourists.map((tourist) => (
                    <div key={tourist.uuid} className="p-2">
                      <div className="flex flex-row justify-between items-center">
                        <User
                          name={`${tourist.name || ""} ${
                            tourist.last_name || ""
                          }`}
                          description={tourist.email}
                          // avatarProps={{ src: tourist.avatarUrl }} // Si tuvieras avatar
                        />
                        <Chip
                          color={tourist.checked ? "success" : "warning"}
                          variant="flat"
                          size="sm"
                          startContent={
                            tourist.checked ? (
                              <Icon icon="solar:check-circle-bold" width={16} />
                            ) : (
                              <Icon icon="solar:clock-circle-bold" width={16} />
                            )
                          }
                        >
                          {tourist.checked ? "Registrado" : "Pendiente"}
                        </Chip>
                      </div>
                      <Divider className="my-2" />
                    </div>
                  ))
                )}
              </ScrollShadow>
            </div>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

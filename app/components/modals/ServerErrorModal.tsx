import { useModal } from "@/app/contexts/ModalServerError";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

const ModalComponent = () => {
  const { isOpen, closeModal, modalContent } = useModal();

  return (
    <Modal isOpen={isOpen} onClose={closeModal} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h5 className="text-lg">¡Ups! ha ocurrido un error</h5>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm">
                El servidor ha tenido un error inesperado, por favor intenta de
                nuevo más tarde.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onPress={() => {
                  closeModal();
                }}
              >
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalComponent;

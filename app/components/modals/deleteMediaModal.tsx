import { deleteMedia } from "@/services/common/deleteMedia";
import {
  Modal,
  Button,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Dispatch, SetStateAction, useState } from "react";
import { set } from "react-hook-form";

type MediaEntity = {
  audios: any[];
  images: any[];
  [key: string]: any;
};

interface DeleteMediaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: "audios" | "images" | null;
  uuid: string;
  name: string;
  token: string;
  setPoi: Dispatch<SetStateAction<any | null>>;
}

export const DeleteMediaModal: React.FC<DeleteMediaModalProps> = ({
  isOpen,
  onOpenChange,
  type,
  uuid,
  name,
  token,
  setPoi,
}) => {
  const [errorMsgDelete, setErrorMsgDelete] = useState<string | null>("");
  const [sucessMsgDelete, setSucessMsgDelete] = useState<string | null>("");

  const handleDelete = async () => {
    try {
      await deleteMedia(token, uuid);
      setPoi((prevPoi: MediaEntity | null) => {
        if (!prevPoi || !type) return prevPoi;
        return {
          ...prevPoi,
          [type]: prevPoi[type].filter((item) => item !== uuid),
        };
      });
      setSucessMsgDelete("Archivo de media eliminado con éxito.");
      setTimeout(() => {
        setSucessMsgDelete(null);
        onOpenChange(false);
      }, 3000);
      setErrorMsgDelete(null);
    } catch (error) {
      setErrorMsgDelete("Hubo un error al eliminar el archivo.");
      setTimeout(() => {
        setErrorMsgDelete(null);
        onOpenChange(false);
      }, 3000);
      setSucessMsgDelete(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h5 className="text-lg">¿Estás completamente seguro?</h5>
            </ModalHeader>
            <ModalBody>
              <p className="text-sm">
                Esta acción no se puede deshacer. Esto eliminará permanentemente
                el archivo de media{" "}
                {<span className="text-primary">{name}</span>} de nuestros
                servidores. Recuerda que puedes descargar el archivo antes de
                eliminarlo.
              </p>
            </ModalBody>
            <ModalFooter>
              <div className="flex items-center justify-center">
                {errorMsgDelete && (
                  <p className="text-danger text-tiny">{errorMsgDelete}</p>
                )}
                {sucessMsgDelete && (
                  <p className="text-success text-tiny">{sucessMsgDelete}</p>
                )}
              </div>
              {!errorMsgDelete && !sucessMsgDelete && (
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    handleDelete();
                  }}
                >
                  Eliminar archivo de media
                </Button>
              )}
              <Button
                color="primary"
                onPress={() => {
                  onClose();
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

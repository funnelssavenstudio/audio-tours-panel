import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Modal,
  Button,
  ModalBody,
  ModalContent,
  ModalFooter,
  Card,
  CardHeader,
  Image,
} from "@heroui/react";
import {
  DropzoneInputProps,
  DropzoneRootProps,
  FileRejection,
} from "react-dropzone";

interface UploadImagesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  getRootProps: <T extends DropzoneRootProps>(props?: T | undefined) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T | undefined) => T;
  fileRejections: FileRejection[];
  acceptedFiles: File[];
  selectedImages: { name: string; size: number; preview: string }[];
  handleDeleteClick: (index: number) => void;
}

export const UploadImagesModal: React.FC<UploadImagesModalProps> = ({
  isOpen,
  onOpenChange,
  getRootProps,
  getInputProps,
  fileRejections,
  acceptedFiles,
  selectedImages,
  handleDeleteClick,
}) => {
  const tooManyFilesError = fileRejections.some(({ errors }) => {
    return errors.some((error) => error.code === "too-many-files");
  });

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      size="3xl"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="p-6">
              <h2 className="text-lg font-semibold">Subir imagen o imágenes</h2>
              <div className="flex flex-col gap-4 py-4">
                <div
                  {...getRootProps()}
                  className={`${
                    tooManyFilesError
                      ? "border-danger hover:border-danger-200 cursor-not-allowed"
                      : selectedImages.length >= 5
                      ? "border-primary hover:border-primary-200 cursor-not-allowed"
                      : "border-gray-500 hover:border-primary cursor-pointer"
                  } flex flex-col items-center justify-center h-52 overflow-hidden rounded-xl border-dashed border-2 transition-colors duration-400`}
                >
                  <input {...getInputProps()} />
                  <Icon
                    icon="solar:cloud-upload-line-duotone"
                    width={80}
                    height={80}
                    className="pb-4 text-primary"
                  />
                  {selectedImages.length < 5 &&
                    !tooManyFilesError &&
                    !(selectedImages.length + acceptedFiles.length >= 5) && (
                      <>
                        <p>Elige un archivo o arrástralo aquí.</p>
                        <span className="font-light text-xs">
                          (Selecciona un máximo de 5 imágenes)
                        </span>
                      </>
                    )}
                  {selectedImages.length >= 5 && !tooManyFilesError && (
                    <>
                      <p className="text-primary">
                        Has cargado las 5 imágenes.
                      </p>
                      <span className="font-light text-xs">
                        (Si quieres remplazar alguna, elimínala y carga la
                        nueva.)
                      </span>
                    </>
                  )}
                  {selectedImages.length + acceptedFiles.length > 5 &&
                    !tooManyFilesError && (
                      <>
                        <p className="text-danger">
                          Estas intentando cargar más de 5 imágenes.
                        </p>
                        <span className="font-light text-xs">
                          (Puedes cargar un máximo de 5 imágenes)
                        </span>
                      </>
                    )}
                  {tooManyFilesError && (
                    <>
                      <p className="text-danger">
                        Intentaste cargar mas de 5 imágenes, intenta nuevamente.
                      </p>
                      <span className="font-light text-xs">
                        (Puedes cargar un máximo de 5 imágenes)
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="gap-2 grid grid-cols-10 grid-rows-1">
                {selectedImages.map((image, index) => (
                  <Card
                    key={index}
                    className="col-span-12 sm:col-span-2 h-[100px]"
                  >
                    <CardHeader className="absolute z-10 top-1 flex-col !items-end">
                      <Button
                        isIconOnly
                        variant="flat"
                        radius="md"
                        size="sm"
                        onClick={() => handleDeleteClick(index)}
                      >
                        <Icon
                          icon="solar:trash-bin-trash-bold-duotone"
                          width="22"
                          className="text-danger absolute inset-0 m-auto"
                        />
                      </Button>
                    </CardHeader>
                    <Image
                      removeWrapper
                      isZoomed
                      alt={image.name}
                      className="z-0 w-full h-full object-cover"
                      src={image.preview}
                    />
                  </Card>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                isDisabled={selectedImages.length > 0 ? false : true}
                type="submit"
                color="primary"
                onPress={onClose}
              >
                Guardar imágenes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

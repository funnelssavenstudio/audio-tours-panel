import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  ModalBody,
  ModalContent,
  ModalFooter,
  Card,
  Divider,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  DropzoneInputProps,
  DropzoneRootProps,
  FileRejection,
} from "react-dropzone";

interface UploadAudioModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  getRootProps: <T extends DropzoneRootProps>(props?: T | undefined) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T | undefined) => T;
  fileRejections: FileRejection[];
  selectedAudio: File | null;
  handleDeleteClick: () => void;
}

export const UploadAudioModal: React.FC<UploadAudioModalProps> = ({
  isOpen,
  onOpenChange,
  getRootProps,
  getInputProps,
  fileRejections,
  selectedAudio,
  handleDeleteClick,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const tooManyFilesError = fileRejections.some(({ errors }) => {
    return errors.some((error) => error.code === "too-many-files");
  });

  useEffect(() => {
    if (selectedAudio) {
      const objectUrl = URL.createObjectURL(selectedAudio);
      if (audioRef.current) {
        audioRef.current.src = objectUrl;
      }
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedAudio]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

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
              <h2 className="text-lg font-semibold">Subir audio</h2>
              <div className="flex flex-col gap-4 py-4">
                <div
                  {...getRootProps()}
                  className={`${
                    tooManyFilesError
                      ? "border-danger hover:border-danger-200 cursor-not-allowed"
                      : selectedAudio
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
                  {!selectedAudio && !tooManyFilesError && (
                    <>
                      <p>Elige el archivo o arrástralo aquí.</p>
                      <span className="font-light text-xs">
                        (Selecciona un archivo de audio mp3.)
                      </span>
                    </>
                  )}
                  {selectedAudio && !tooManyFilesError && (
                    <>
                      <p className="text-primary">
                        Has cargado el archivo de audio.
                      </p>
                      <span className="font-light text-xs">
                        (Si quieres remplazarlo, elimínalo y carga uno nuevo.)
                      </span>
                    </>
                  )}
                </div>
              </div>
              {selectedAudio && (
                <Card className="flex flex-row items-center gap-2 px-4 py-2 w-fit">
                  <Icon
                    icon="solar:music-note-line-duotone"
                    width="20"
                    className="text-primary"
                  />
                  <p className="text-sm">
                    {`${selectedAudio?.name.slice(0, 26)}${
                      selectedAudio?.name.length > 26
                        ? "..."
                        : selectedAudio?.name
                    } - ${(selectedAudio?.size / 1048576).toFixed(2)} MB`}
                  </p>
                  <audio ref={audioRef} preload="none">
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                  <Divider orientation="vertical" />
                  <div>
                    <Button
                      isIconOnly
                      variant="light"
                      radius="md"
                      size="sm"
                      onPress={togglePlayPause}
                    >
                      <Icon
                        icon={
                          isPlaying ? "solar:pause-bold" : "solar:play-linear"
                        }
                        width="18"
                        className="text-foreground"
                      />
                    </Button>
                    <Button
                      isIconOnly
                      variant="light"
                      radius="md"
                      size="sm"
                      onPress={() => handleDeleteClick()}
                    >
                      <Icon
                        icon="solar:trash-bin-trash-bold-duotone"
                        width="18"
                        className="text-danger"
                      />
                    </Button>
                  </div>
                </Card>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                isDisabled={selectedAudio ? false : true}
                type="submit"
                color="primary"
                onPress={onClose}
              >
                Guardar audio
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

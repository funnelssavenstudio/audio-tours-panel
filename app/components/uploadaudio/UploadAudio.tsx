import { FC, useEffect, useRef, useState } from "react";
import { Button, Card, Divider, useDisclosure } from "@heroui/react";
import { useDropzone } from "react-dropzone";
import { FieldValues, UseFormSetValue } from "react-hook-form";

import { UploadAudioModal } from "./UploadAudioModal";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TourFormValues } from "@/app/backoffice/tours/create-tour/page";
import { PoiFormValues } from "@/app/backoffice/poi/create-poi/page";

interface UploadAudioProps {
  selectedAudio: File | null;
  setSelectedAudio: (file: File | null) => void;
  setValue: UseFormSetValue<TourFormValues | PoiFormValues | any>;
}

const UploadAudio: FC<UploadAudioProps> = ({
  selectedAudio,
  setSelectedAudio,
  setValue,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { getRootProps, getInputProps, acceptedFiles, fileRejections } =
    useDropzone({
      maxFiles: 1,
      multiple: false,
      accept: {
        "audio/mp3": [".mp3"],
      },
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        setSelectedAudio(file);
        setValue("audio", file);
      },
      disabled: !!selectedAudio,
    });

  const handleDeleteClick = () => {
    setSelectedAudio(null);
    setValue("audio", null);
  };

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
    <>
      <UploadAudioModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        fileRejections={[...fileRejections]}
        handleDeleteClick={handleDeleteClick}
        selectedAudio={selectedAudio}
      />
      {selectedAudio && (
        <Card className="flex flex-row justify-center items-center gap-2 px-4 py-2 w-full">
          <Icon
            icon="solar:music-note-line-duotone"
            width="20"
            className="text-primary"
          />
          <p className="text-sm">
            {`${selectedAudio?.name.slice(0, 14)}${
              selectedAudio?.name.length > 14 ? "..." : selectedAudio?.name
            } - ${(selectedAudio?.size / 1048576).toFixed(2)} MB`}
          </p>
          <audio ref={audioRef} preload="none">
            Tu navegador no soporta el elemento de audio.
          </audio>
          <div>
            <Button
              isIconOnly
              variant="light"
              radius="md"
              size="sm"
              onPress={togglePlayPause}
            >
              <Icon
                icon={isPlaying ? "solar:pause-bold" : "solar:play-linear"}
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
      {!selectedAudio && (
        <div className="inline-flex items-center rounded-medium border-small border-divider p-4">
          <Icon
            icon="solar:soundwave-line-duotone"
            width={50}
            className="text-primary flex-shrink-0"
          />
          <Divider orientation="vertical" className="mx-4" />
          <Button
            variant="ghost"
            type="button"
            onClick={onOpen}
            className="w-full"
          >
            Subir audio
          </Button>
        </div>
      )}
    </>
  );
};

export default UploadAudio;

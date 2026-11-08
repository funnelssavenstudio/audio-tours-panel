"use client";

import { FC, useRef, useState } from "react";
import { Button, Card } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

interface EditAudioCardProps {
  uuid: string;
  name: string;
  onDownload: () => void;
  onDelete: () => void;
}

const EditAudioCard: FC<EditAudioCardProps> = ({
  uuid,
  name,
  onDownload,
  onDelete,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <Card className="flex flex-row justify-between items-center gap-2 px-4 py-2 w-full">
      <div className="flex items-center gap-2 min-w-0">
        <Icon
          icon="solar:music-note-line-duotone"
          width="20"
          className="text-primary flex-shrink-0"
        />
        <p className="text-sm truncate">{name}</p>
      </div>
      <audio
        ref={audioRef}
        preload="none"
        src={`/api/media/${uuid}/download`}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
      >
        Tu navegador no soporta el elemento de audio.
      </audio>
      <div className="flex flex-shrink-0">
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
          onPress={onDownload}
        >
          <Icon
            icon="solar:file-download-line-duotone"
            width="18"
            className="text-foreground transition-colors duration-200 ease-in-out hover:text-primary"
          />
        </Button>
        <Button
          isIconOnly
          variant="light"
          radius="md"
          size="sm"
          onPress={onDelete}
        >
          <Icon
            icon="solar:trash-bin-trash-bold-duotone"
            width="18"
            className="text-danger"
          />
        </Button>
      </div>
    </Card>
  );
};

export default EditAudioCard;

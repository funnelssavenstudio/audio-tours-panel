"use client";

import { FC } from "react";
import { Button, Card, CardHeader, Image } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

export interface EditImage {
  uuid: string;
  name: string;
}

interface EditImagesGridProps {
  images: EditImage[];
  onDownload: (image: EditImage, index: number) => void;
  onDelete: (image: EditImage, index: number) => void;
}

const EditImagesGrid: FC<EditImagesGridProps> = ({
  images,
  onDownload,
  onDelete,
}) => {
  if (images.length === 0) return null;
  const [first, ...rest] = images;

  return (
    <div className="flex flex-col gap-2">
      <Card radius="lg" className="border-none h-64">
        <CardHeader className="absolute z-10 top-1 right-1 w-auto flex-row justify-end gap-1 p-1">
          <Button
            isIconOnly
            variant="flat"
            radius="md"
            size="sm"
            className="bg-black/40 text-white"
            onPress={() => onDownload(first, 0)}
          >
            <Icon icon="solar:gallery-download-line-duotone" width="18" />
          </Button>
          <Button
            isIconOnly
            variant="flat"
            radius="md"
            size="sm"
            className="bg-black/40 text-danger-300"
            onPress={() => onDelete(first, 0)}
          >
            <Icon icon="solar:trash-bin-trash-line-duotone" width="18" />
          </Button>
        </CardHeader>
        <Image
          removeWrapper
          isZoomed
          alt={first.name}
          className="z-0 w-full h-full object-cover"
          src={`/api/media/${first.uuid}/download`}
        />
      </Card>
      {rest.length > 0 && (
        <div className="gap-2 grid grid-cols-12 grid-rows-1">
          {rest.map((image, idx) => {
            const index = idx + 1;
            return (
              <Card
                key={image.uuid}
                className="col-span-12 sm:col-span-3 h-[100px]"
              >
                <CardHeader className="absolute z-10 top-1 right-1 w-auto flex-row justify-end gap-1 p-1">
                  <Button
                    isIconOnly
                    variant="flat"
                    radius="sm"
                    size="sm"
                    className="bg-black/40 text-white min-w-unit-6 w-6 h-6"
                    onPress={() => onDownload(image, index)}
                  >
                    <Icon
                      icon="solar:gallery-download-line-duotone"
                      width="14"
                    />
                  </Button>
                  <Button
                    isIconOnly
                    variant="flat"
                    radius="sm"
                    size="sm"
                    className="bg-black/40 text-danger-300 min-w-unit-6 w-6 h-6"
                    onPress={() => onDelete(image, index)}
                  >
                    <Icon icon="solar:trash-bin-trash-line-duotone" width="14" />
                  </Button>
                </CardHeader>
                <Image
                  removeWrapper
                  isZoomed
                  alt={image.name}
                  className="z-0 w-full h-full object-cover"
                  src={`/api/media/${image.uuid}/download`}
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EditImagesGrid;

import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Image,
  useDisclosure,
} from "@heroui/react";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { UploadImagesModal } from "./UploadImagesModal";
import { useDropzone } from "react-dropzone";
import { UseFormSetValue } from "react-hook-form";
import { TourFormValues } from "@/app/backoffice/tours/create-tour/page";
import { PoiFormValues } from "@/app/backoffice/poi/create-poi/page";

export interface PreviewFile extends File {
  preview: string;
}

interface UploadImagesProps {
  selectedImages: PreviewFile[];
  setSelectedImages: Dispatch<SetStateAction<PreviewFile[]>>;
  setValue: UseFormSetValue<TourFormValues | PoiFormValues | any>;
}

const UploadImages: FC<UploadImagesProps> = ({
  selectedImages,
  setSelectedImages,
  setValue,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [onAcceptedFiles, setOnAcceptedFiles] = useState([] as PreviewFile[]);

  const { getRootProps, getInputProps, acceptedFiles, fileRejections } =
    useDropzone({
      maxFiles: 5,
      multiple: true,
      accept: {
        "image/jpeg": [".jpeg", ".png"],
      },
      onDrop: (acceptedFiles) => {
        const totalFiles = selectedImages.length + acceptedFiles.length;
        if (totalFiles <= 5) {
          const newImages = acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          );
          setSelectedImages((prevImages) => [...prevImages, ...newImages]);
          setValue("images", [...selectedImages, ...newImages]);
          setOnAcceptedFiles([]);
        }
        if (totalFiles === 5) {
          setOnAcceptedFiles([]);
        }
      },
      disabled: selectedImages.length >= 5,
    });

  const handleCoverImage = (index: number) => {
    let newImages = [...selectedImages];
    let temp = newImages[0];
    newImages[0] = newImages[index];
    newImages[index] = temp;
    setSelectedImages(newImages);
  };

  const handleDeleteClick = (index: number) => {
    const newSelectedImages = [...selectedImages];
    newSelectedImages.splice(index, 1);
    setSelectedImages(newSelectedImages);
  };

  return (
    <>
      <UploadImagesModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        fileRejections={[...fileRejections]}
        acceptedFiles={onAcceptedFiles}
        handleDeleteClick={handleDeleteClick}
        selectedImages={selectedImages}
      />
      <Card isFooterBlurred radius="lg" className="border-none h-64">
        <CardHeader className="absolute z-10 top-1 flex-col !items-end">
          <Button
            variant="shadow"
            color="primary"
            radius="md"
            size="sm"
            startContent={
              <Icon
                icon="material-symbols:kid-star"
                width="22"
                className="text-white"
              />
            }
            className={`${
              selectedImages.length < 1 ? "hidden" : ""
            } pointer-events-none`}
          >
            Portada
          </Button>
        </CardHeader>
        <Image
          removeWrapper
          isZoomed
          alt="Woman listing to music"
          className="z-0 w-full h-full object-cover"
          src={
            selectedImages[0]?.preview
              ? selectedImages[0].preview
              : "/images/mock.jpg"
          }
        />
        <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
          <Button
            type="button"
            variant="flat"
            color="default"
            radius="lg"
            size="sm"
            onClick={onOpen}
            className="text-tiny text-white bg-black/20 w-full"
          >
            {selectedImages.length < 5
              ? "Subir imágenes"
              : "Modificar imágenes subidas"}
          </Button>
        </CardFooter>
      </Card>
      {selectedImages.length > 0 && (
        <div className="gap-2 grid grid-cols-12 grid-rows-1">
          {selectedImages.slice(1).map((image, index) => (
            <Card key={index} className="col-span-12 sm:col-span-3 h-[100px]">
              <CardHeader className="absolute z-10 top-1 flex-col !items-end">
                <Button
                  isIconOnly
                  variant="flat"
                  radius="md"
                  size="sm"
                  onClick={() => handleCoverImage(index + 1)}
                  className="group relative"
                >
                  <Icon
                    icon="material-symbols:kid-star-outline"
                    width="22"
                    className="text-primary absolute inset-0 m-auto group-hover:opacity-0 transition-opacity duration-600"
                  />
                  <Icon
                    icon="material-symbols:kid-star"
                    width="22"
                    className="text-primary absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity duration-600"
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
      )}
    </>
  );
};

export default UploadImages;

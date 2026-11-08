import * as React from "react";
import { Button, Card, Image, Tooltip } from "@heroui/react";
import { Reorder, useDragControls, useMotionValue } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";

import flags from "@/data/flags.json";
import { ReorderIcon } from "./ReOrderIcon";
import { useRaisedShadow } from "./array-utils";

type Tab = {
  label: string;
  value: string;
  type?: string;
  language: string;
  description: string;
};

interface Props {
  item: Tab;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onRemove: () => void;
  missingLanguages?: string[];
}

export const Tab = ({
  item,
  index,
  onClick,
  onRemove,
  isSelected,
  missingLanguages = [],
}: Props) => {
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      id={item.label}
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.15 },
      }}
      dragListener={false}
      dragControls={dragControls}
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
      style={{ boxShadow, y }}
      onPointerDown={onClick}
    >
      <Card
        className={`flex flex-row gap-4 py-2 px-4 items-center justify-between ${
          missingLanguages.length > 0 ? "border-l-4 border-warning" : ""
        }`}
      >
        <div className="flex flex-row justify-center items-center gap-2 min-w-0">
          <strong className="text-primary text-sm">{`${index + 1}. `}</strong>

          <p className="text-sm truncate">{item.label}</p>
        </div>
        <div className="flex flex-row items-center">
          {missingLanguages.length > 0 && (
            <Tooltip
              content={`Falta traducción en: ${missingLanguages
                .map((l) => l.toUpperCase())
                .join(", ")}`}
              color="warning"
              placement="top"
            >
              <div className="flex items-center gap-1 mr-2 px-2 py-1 rounded-medium bg-warning/10">
                <Icon
                  icon="solar:danger-triangle-bold"
                  className="text-warning"
                  width={14}
                />
                {missingLanguages.map((lang) =>
                  flags[lang as keyof typeof flags] ? (
                    <Image
                      key={lang}
                      alt={lang}
                      src={flags[lang as keyof typeof flags]}
                      width={14}
                      className="opacity-60 grayscale"
                    />
                  ) : (
                    <span
                      key={lang}
                      className="text-[10px] uppercase text-warning font-semibold"
                    >
                      {lang}
                    </span>
                  )
                )}
              </div>
            </Tooltip>
          )}
          {item.type === "Punto de interés" ||
          item.type === "point_of_interest" ? (
            <Icon
              className="text-default-400 w-4 h-4 mr-2"
              icon="solar:map-point-linear"
            />
          ) : item.type === "Parada" ? (
            <Icon
              className="text-default-400 w-4 h-4 mr-2"
              icon="bi:sign-stop-lights"
            />
          ) : null}
          <span className="text-tiny text-default-400 mr-2">{item.type}</span>
          <Button
            isIconOnly
            variant="light"
            onPress={() => {
              onRemove();
            }}
          >
            <Icon
              icon="solar:trash-bin-trash-bold-duotone"
              width="18"
              className="text-danger"
            />
          </Button>
          <ReorderIcon dragControls={dragControls} />
        </div>
      </Card>
    </Reorder.Item>
  );
};

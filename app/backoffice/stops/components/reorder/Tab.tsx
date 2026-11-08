import * as React from "react";
import { Button, Card } from "@heroui/react";
import { Reorder, useDragControls, useMotionValue } from "framer-motion";
import { Icon } from "@iconify/react/dist/iconify.js";

import { StopsOrPointsOfInterest } from "./ingredients";
import { ReorderIcon } from "./ReOrderIcon";
import { useRaisedShadow } from "./array-utils";

interface Props {
  item: StopsOrPointsOfInterest;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onRemove: () => void;
  showDragHandle?: boolean;
}

export const Tab = ({
  item,
  index,
  onClick,
  onRemove,
  isSelected,
  showDragHandle = true,
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
      <Card className="flex flex-row gap-4 py-2 px-4 items-center justify-between">
        <div className="flex flex-row justify-center items-center gap-2">
          <p>{item.label}</p>
        </div>
        <div className="flex flex-row items-center">
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
          {showDragHandle ? <ReorderIcon dragControls={dragControls} /> : null}
        </div>
      </Card>
    </Reorder.Item>
  );
};

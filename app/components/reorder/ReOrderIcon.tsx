import { DragControls } from "framer-motion";

interface Props {
  dragControls: DragControls;
}

export function ReorderIcon({ dragControls }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="20"
      height="20"
      onPointerDown={(event) => dragControls.start(event)}
      className="cursor-grab"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M19 10a4 4 0 1 1-8 0a4 4 0 0 1 8 0m-4 18a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 14a4 4 0 1 0 0-8a4 4 0 0 0 0 8m22-32a4 4 0 1 1-8 0a4 4 0 0 1 8 0m-4 18a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 14a4 4 0 1 0 0-8a4 4 0 0 0 0 8"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

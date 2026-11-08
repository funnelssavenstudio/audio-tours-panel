import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  ModalContent,
  ModalHeader,
  CircularProgress,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: { label: string; completed: boolean }[];
  onRedirect: () => void;
  title?: string;
  successMessage?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  steps,
  onRedirect,
  title = "Guardando...",
  successMessage = "¡Todo fue creado con éxito!",
}) => {
  const [countdown, setCountdown] = useState(3);
  const allStepsCompleted = useMemo(
    () => steps.every((step) => step.completed),
    [steps]
  );
  const onRedirectRef = useRef(onRedirect);

  useEffect(() => {
    onRedirectRef.current = onRedirect;
  }, [onRedirect]);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      return;
    }

    if (!allStepsCompleted) {
      return;
    }

    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const redirectTimer = setTimeout(() => {
      clearInterval(timer);
      onRedirectRef.current();
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [isOpen, allStepsCompleted]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h5 className="text-lg">{title}</h5>
            </ModalHeader>
            <ModalBody>
              {steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span>
                    {step.completed ? (
                      <Icon
                        icon="solar:check-circle-bold"
                        width="20px"
                        height="20px"
                        className="mx-auto text-success"
                      />
                    ) : (
                      <CircularProgress
                        aria-label="Loading..."
                        classNames={{
                          svg: "w-4 h-4",
                        }}
                        color="primary"
                      />
                    )}
                  </span>
                  <span className="text-sm">{step.label}</span>
                </div>
              ))}
            </ModalBody>
            <ModalFooter>
              {allStepsCompleted ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-center text-success">
                    {successMessage} Serás redirigido en {countdown} segundos.
                  </span>
                </div>
              ) : null}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SuccessModal;

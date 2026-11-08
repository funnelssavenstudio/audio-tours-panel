import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  FC,
} from "react";

interface ModalContextProps {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  modalContent: ModalContent | null;
}

interface ModalProviderProps {
  children: ReactNode;
}

interface ModalContent {
  title: string;
  body: string;
}

const defaultValue: ModalContextProps = {
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
  modalContent: null,
};

const ModalContext = createContext<ModalContextProps>(defaultValue);

export const ModalProvider: FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isOpen, openModal, closeModal, modalContent }),
    [isOpen, openModal, closeModal, modalContent]
  );

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

export const useModal = (): ModalContextProps => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

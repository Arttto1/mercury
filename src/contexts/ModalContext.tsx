import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  CustomModal,
  CustomModalProps,
  CustomModalButton,
} from "../components/CustomModal";

export interface ModalContextType {
  showModal: (props: Omit<CustomModalProps, "visible" | "onClose">) => void;
  hideModal: () => void;
  showImagePicker: (onCamera: () => void, onGallery: () => void) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
    type?: "info" | "warning" | "error"
  ) => void;
  showSuccess: (title: string, message?: string, onPress?: () => void) => void;
  showError: (title: string, message?: string, onPress?: () => void) => void;
  showWarning: (title: string, message?: string, onPress?: () => void) => void;
  showInfo: (title: string, message?: string, onPress?: () => void) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalProps, setModalProps] = useState<Omit<
    CustomModalProps,
    "visible" | "onClose"
  > | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showModal = (props: Omit<CustomModalProps, "visible" | "onClose">) => {
    setModalProps(props);
    setIsVisible(true);
  };

  const hideModal = () => {
    setIsVisible(false);
    // Limpa o modal após a animação
    setTimeout(() => setModalProps(null), 300);
  };

  const showImagePicker = (onCamera: () => void, onGallery: () => void) => {
    const buttons: CustomModalButton[] = [
      {
        text: "Tirar Foto",
        onPress: onCamera,
        style: "secondary",
      },
      {
        text: "Escolher da Galeria",
        onPress: onGallery,
        style: "primary",
      },
    ];

    showModal({
      title: "Selecionar Imagem",
      message: "Escolha uma opção para adicionar foto(s):",
      type: "info",
      buttons,
      showCloseButton: true,
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = "Confirmar",
    cancelText: string = "Cancelar",
    type: "info" | "warning" | "error" = "warning"
  ) => {
    const buttons: CustomModalButton[] = [
      {
        text: cancelText,
        onPress: onCancel || (() => {}),
        style: "secondary",
      },
      {
        text: confirmText,
        onPress: onConfirm,
        style: type === "error" ? "destructive" : "primary",
      },
    ];

    showModal({
      title,
      message,
      type,
      buttons,
      showCloseButton: false,
    });
  };

  const showSuccess = (
    title: string,
    message?: string,
    onPress?: () => void
  ) => {
    showModal({
      title,
      message,
      type: "success",
      buttons: onPress
        ? [{ text: "OK", onPress, style: "primary" }]
        : undefined,
    });
  };

  const showError = (title: string, message?: string, onPress?: () => void) => {
    showModal({
      title,
      message,
      type: "error",
      buttons: onPress
        ? [{ text: "OK", onPress, style: "primary" }]
        : undefined,
    });
  };

  const showWarning = (
    title: string,
    message?: string,
    onPress?: () => void
  ) => {
    showModal({
      title,
      message,
      type: "warning",
      buttons: onPress
        ? [{ text: "OK", onPress, style: "primary" }]
        : undefined,
    });
  };

  const showInfo = (title: string, message?: string, onPress?: () => void) => {
    showModal({
      title,
      message,
      type: "info",
      buttons: onPress
        ? [{ text: "OK", onPress, style: "primary" }]
        : undefined,
    });
  };

  const value: ModalContextType = {
    showModal,
    hideModal,
    showImagePicker,
    showConfirm,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      {modalProps && (
        <CustomModal {...modalProps} visible={isVisible} onClose={hideModal} />
      )}
    </ModalContext.Provider>
  );
};

export * from "./login-modal";

export interface ModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  onOpen: () => void;
}

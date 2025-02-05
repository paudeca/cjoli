import { FieldValues, Path } from "react-hook-form";

export * from "./login-modal";
export * from "./register-modal";

export interface ModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onClose: () => void;
  onOpen: () => void;
}

export interface Field<T extends FieldValues> {
  id: Path<T>;
  label: string;
  placeholder?: string;
  type:
    | "text"
    | "password"
    | "date"
    | "datetime-local"
    | "number"
    | "select"
    | "switch";
  required?: boolean;
  validate?: { id: Path<T>; message: string };
  autoFocus?: boolean;
  creatable?: boolean;
  options?: { label: string; value: string | number }[];
  onChange?: (value?: string) => void;
  testId?: string;
}

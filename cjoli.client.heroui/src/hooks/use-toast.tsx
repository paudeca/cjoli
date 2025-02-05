import { useCallback } from "react";
import { toast as toastSonner } from "sonner";
import { Chip } from "@heroui/react";

type Type = "error" | "success";

export const useToast = () => {
  const toast = useCallback(
    (type: Type, message: string) =>
      toastSonner(
        <Chip color={type == "error" ? "danger" : "success"}>{message}</Chip>
      ),
    []
  );
  return { toast };
};

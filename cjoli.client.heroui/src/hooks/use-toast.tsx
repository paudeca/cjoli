import { useCallback } from "react";
import { addToast } from "@heroui/react";

type Type = "error" | "success";
const colors: Record<string, "danger" | "success"> = {
  error: "danger",
  success: "success",
};

export const useToast = () => {
  const toast = useCallback(
    (type: Type, message: string) =>
      addToast({
        title: message,
        color: colors[type],
      }),
    []
  );
  return { toast };
};

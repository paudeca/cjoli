import { Progress } from "@heroui/react";
import { FC, ReactNode } from "react";

export const CJoliLoading: FC<{ loading: boolean; children: ReactNode }> = ({
  loading,
  children,
}) => {
  return (
    <>
      {loading && (
        <Progress
          isIndeterminate
          aria-label="Loading..."
          size="sm"
          color="primary"
        />
      )}
      {!loading && children}
    </>
  );
};

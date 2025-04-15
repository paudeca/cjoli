import { Button } from "@heroui/react";
import { FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { CJoliPopover } from "../cjoli-popover";
import { StarsIcon } from "../icons";

export const SimulPopover: FC<{
  title?: string;
  onRemove: () => Promise<void>;
}> = ({ title, onRemove }) => {
  const { t } = useTranslation();

  const handleRemove = async (close: () => void) => {
    await onRemove();
    close();
  };

  return (
    <CJoliPopover
      trigger={
        <Button
          isIconOnly
          aria-label="Team"
          color="secondary"
          size="sm"
          variant="flat"
          radius="lg"
        >
          <StarsIcon size={16} className="[&>path]:stroke-[1.5]" />
        </Button>
      }
      title={
        <div className="flex items-center">
          <StarsIcon className="me-2" />
          {title ?? t("simulation.tooltip", "Simulation")}
        </div>
      }
      body={
        <div className="p-4">
          <Trans i18nKey="simulation.removeAll">Remove all simulations</Trans>
        </div>
      }
      footer={(close) => (
        <>
          <Button onPress={close}>
            <Trans i18nKey="button.cancel">Cancel</Trans>
          </Button>
          <Button color="danger" onPress={() => handleRemove(close)}>
            <Trans i18nKey="button.delete">Delete</Trans>
          </Button>
        </>
      )}
    />
  );
};

import { Button } from "@heroui/react";
import { FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { CJoliPopover } from "../cjoli-popover";
import { HashIcon } from "../icons";

export const SimultPopover: FC<{
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
          variant="light"
          color="primary"
          size="sm"
        >
          <HashIcon
            size={16}
            className="text-default-500 [&>path]:stroke-[1.5]"
          />
        </Button>
      }
      title={title ?? t("simulation.tooltip", "Simulation")}
      body={
        <p>
          <Trans i18nKey="simulation.removeAll">Remove all simulations</Trans>
        </p>
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

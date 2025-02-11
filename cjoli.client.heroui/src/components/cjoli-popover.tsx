import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import { FC, ReactNode, useState } from "react";
import { Trans } from "react-i18next";

export const CJoliPopover: FC<{
  trigger: ReactNode;
  title: ReactNode;
  body: ReactNode;
  footer?: (close: () => void) => ReactNode;
}> = ({ trigger, title, body, footer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      placement="right"
      backdrop="blur"
      className="cjoli"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger>{trigger}</PopoverTrigger>
      <PopoverContent className="bg-transparent p-0">
        <Card className="max-w-[400px]">
          <CardHeader className="flex gap-3 bg-primary text-background">
            {title}
          </CardHeader>
          <Divider />
          <CardBody>{body}</CardBody>
          <Divider />
          <CardFooter className="grid grid-cols-2 gap-4 justify-items-end">
            {footer ? (
              footer(() => setIsOpen(false))
            ) : (
              <Button onPress={() => setIsOpen(false)}>
                <Trans i18nKey="button.close">Close</Trans>
              </Button>
            )}
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

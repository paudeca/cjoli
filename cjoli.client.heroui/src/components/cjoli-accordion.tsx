import { Accordion, AccordionItem } from "@heroui/react";
import { ReactNode } from "react";

type Item = {
  key: string;
  title?: string;
  hide?: boolean;
};

interface CJoliAccordionProps<T> {
  items: T[];
  children: (item: T) => ReactNode;
}

export const CjoliAccordion = <T extends Item>({
  items,
  children,
}: CJoliAccordionProps<T>) => {
  const keys = items.filter((i) => !i.hide).map((i) => i.key);
  return (
    <Accordion
      variant="splitted"
      selectionMode="multiple"
      defaultExpandedKeys={keys}
    >
      {items
        .filter((i) => !i.hide)
        .map((item) => (
          <AccordionItem
            key={item.key}
            title={<span className="font-semibold">{item.title}</span>}
            aria-label={item.title}
            className="px-2 md:px-4"
          >
            {children(item)}
          </AccordionItem>
        ))}
    </Accordion>
  );
};

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { FC, useState } from "react";
import { Icon } from "@iconify/react";
import { useHeader } from "@cjoli/core";
import { useTranslation } from "react-i18next";

export const LangDropdown: FC = () => {
  const { langs, lang, saveLang } = useHeader();
  const { t } = useTranslation();
  const [selectedKeys, setSelectedKeys] = useState(new Set([lang || "en"]));

  return (
    <div className="flex items-center gap-4">
      <Dropdown placement="bottom-start">
        <DropdownTrigger>
          <Icon icon={`circle-flags:lang-${lang}`} width={22} role="button" />
        </DropdownTrigger>
        <DropdownMenu
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={selectedKeys}
          onSelectionChange={(e) => {
            setSelectedKeys(e as Set<string>);
            saveLang(e.currentKey!);
          }}
          variant="flat"
          items={langs.map((l) => ({ key: l, label: t(`lang.${l}`) }))}
        >
          {(item) => (
            <DropdownItem
              key={item.key}
              startContent={
                <Icon icon={`circle-flags:lang-${item.key}`} width={22} />
              }
            >
              {item.label}
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

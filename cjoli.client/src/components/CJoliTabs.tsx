import { ReactNode } from "react";
import { Nav } from "react-bootstrap";

interface CJoliTabsProps {
  tabs: { id: string; label: ReactNode }[];
  onSelect: (key: string | null) => void;
  defaultKey?: string;
}

const CJoliTabs = ({ tabs, onSelect, defaultKey }: CJoliTabsProps) => {
  return (
    <Nav
      variant="tabs"
      defaultActiveKey={defaultKey ?? tabs[0].id}
      className="m-3"
      fill
      onSelect={onSelect}
    >
      {tabs.map((tab) => (
        <Nav.Item key={tab.id}>
          <Nav.Link eventKey={tab.id}>{tab.label}</Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  );
};

export default CJoliTabs;

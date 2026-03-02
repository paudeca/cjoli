import { ReactNode } from "react";
import { Container, Nav } from "react-bootstrap";
import styled from "@emotion/styled";

const MyNav = styled(Nav)``;

const MyContainer = styled(Container)`
  border: 1px solid black;
  border-top: 0;
  width: 434px;
`;

interface CJoliTabsProps {
  tabs: { id: string; label: ReactNode }[];
  onSelect: (key: string | null) => void;
  defaultKey?: string;
  children?: ReactNode;
}

const CJoliTabs = ({
  tabs,
  onSelect,
  defaultKey,
  children,
}: CJoliTabsProps) => {
  return (
    <>
      <MyNav
        variant="tabs"
        defaultActiveKey={defaultKey ?? tabs[0].id}
        className="mx-3"
        fill
        onSelect={onSelect}
      >
        {tabs.map((tab) => (
          <Nav.Item key={tab.id}>
            <Nav.Link eventKey={tab.id}>{tab.label}</Nav.Link>
          </Nav.Item>
        ))}
      </MyNav>
      {children && (
        <MyContainer className="mx-3 px-3 py-2">{children}</MyContainer>
      )}
    </>
  );
};

export default CJoliTabs;

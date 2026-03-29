import { ReactNode } from "react";
import { Container, Nav } from "react-bootstrap";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { useColor } from "../hooks/useColor";

const MyNav = styled(Nav)<{ color: string }>`
  & div[data-active="true"] a {
    background: ${(props) => props.color};
    color: white;
  }
  & div[data-active="false"] a {
    color: ${(props) => props.color};
  }
`;

const MyContainer = styled(Container)``;

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
  const theme = useTheme();
  const { isWhite } = useColor();

  const color = isWhite(theme.colors.secondary)
    ? theme.colors.primary
    : theme.colors.secondary;

  return (
    <>
      <MyNav
        variant="pills"
        defaultActiveKey={defaultKey ?? tabs[0].id}
        className="m-3"
        justify
        onSelect={onSelect}
        color={color}
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

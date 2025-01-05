import { Card, Table } from "react-bootstrap";
import CJoliCard from "../../components/CJoliCard";
import { Trans } from "react-i18next";
import { ReactNode } from "react";
import styled from "@emotion/styled";
import { bgSecondary } from "../../styles";

const MyTh = styled("th")`
  ${bgSecondary}
`;
const MyTd = MyTh.withComponent("td");

interface RankTableProps<T> {
  columns: {
    id: string;
    label: string;
    focus?: boolean;
    width: string;
    value: (val: T, index: number) => ReactNode;
  }[];
  datas: T[];
}

const RankTable = <T,>({ columns, datas }: RankTableProps<T>) => {
  return (
    <div className="p-2">
      <CJoliCard>
        <Card.Body>
          <Card.Title>
            <Trans i18nKey="rank.title">Ranking</Trans>
          </Card.Title>
          <Table
            striped
            bordered
            hover
            responsive
            size="sm"
            style={{ textAlign: "center" }}
          >
            <thead>
              <tr>
                {columns.map((c) =>
                  c.focus ? (
                    <MyTh key={c.id} style={{ width: c.width }}>
                      {c.label}
                    </MyTh>
                  ) : (
                    <th key={c.id} style={{ width: c.width }}>
                      {c.label}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {datas.map((data, i) => (
                <tr key={i}>
                  {columns.map((c) =>
                    c.focus ? (
                      <MyTd key={c.id}>{c.value(data, i)}</MyTd>
                    ) : (
                      <td key={c.id}>{c.value(data, i)}</td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </CJoliCard>
    </div>
  );
};

export default RankTable;

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";

export const TableMatch = () => {
  return (
    <Table isStriped isCompact aria-label="Matches" hideHeader>
      <TableHeader>
        <TableColumn>time</TableColumn>
      </TableHeader>
      <TableBody items={[{ id: 1 }]}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => <TableCell>Hello:{columnKey}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

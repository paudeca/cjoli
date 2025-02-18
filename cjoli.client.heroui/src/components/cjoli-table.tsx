import { Children, ReactElement, ReactNode } from "react";

interface CJoliTableColumn {
  children: ReactNode;
}

export const CJoliTableColumn = ({ children }: CJoliTableColumn) => {
  return (
    <th
      className="group/th px-3 h-10 align-middle bg-default-100 whitespace-nowrap text-tinify font-semibold first:rounded-s-large last:rounded-e-large"
      role="columnheader"
    >
      {children}
    </th>
  );
};

interface CJoliTableHeaderProps<T> {
  columns: T[];
  children: (column: T) => ReactElement;
}

export const CJoliTableHeader = <T extends { key: string; label: string }>({
  columns,
  children,
}: CJoliTableHeaderProps<T>) => {
  return (
    <thead className="[&>tr]:first:rounded-lg" role="rowgroup">
      <tr className="group/tr" role="row">
        {columns.map((c) => children(c))}
      </tr>
    </thead>
  );
};

export const CJoliTableRow = () => {
  return (
    <tr className="group/tr outline-none" role="row">
      ROW
    </tr>
  );
};

interface CJoliTableBodyProps<T> {
  items: T[];
  children: (item: T) => ReactNode;
}

export const CJoliTableBody = <T,>({
  items,
  children,
}: CJoliTableBodyProps<T>) => {
  return (
    <tbody role="rowgroup">
      {items.map((i) => children(i))}
      <tr className="group/tr outline-none" role="row">
        <td
          className="relative align-middle whitespace-normal text-small font-normal"
          rowSpan={2}
        >
          B
        </td>
        <td
          className="relative align-middle whitespace-normal text-small font-normal"
          colSpan={2}
        >
          C
        </td>
      </tr>
      <tr className="group/tr outline-none" role="row">
        <td className="relative align-middle whitespace-normal text-small font-normal">
          D
        </td>
        <td className="relative align-middle whitespace-normal text-small font-normal">
          E
        </td>
      </tr>
    </tbody>
  );
};

interface CJoliTableProps<T> {
  children: [ReactElement<CJoliTableHeaderProps<T>>, ReactElement];
}

export const CJoliTable = <T,>({ children }: CJoliTableProps<T>) => {
  return (
    <div className="flex-col relative gap-4 w-full">
      <div className="p-4 z-0 flex flex-col relative justify-between gap-4 bg-content1 overflow-auto rounded-large shadow-small w-full">
        <table className="min-w-full h-auto table-auto w-full" role="grid">
          {children}
        </table>
      </div>
    </div>
  );
};

import { ReactElement, ReactNode } from "react";

interface CJoliTableColumn {
  children: ReactNode;
  key: string | number;
  className?: string;
  colSpan?: number;
}

export const CJoliTableColumn = ({
  children,
  className,
  colSpan,
}: CJoliTableColumn) => {
  return (
    <th
      className={`group/th px-3 h-10 align-middle bg-default-100 whitespace-nowrap text-tiny font-semibold first:rounded-tl-large last:rounded-tr-large ${className}`}
      role="columnheader"
      colSpan={colSpan ?? 1}
    >
      {children}
    </th>
  );
};

interface CJoliTableCellProps {
  children: ReactNode;
  key: string | number;
  className?: string;
  rowSpan?: number;
  colSpan?: number;
}
export const CJoliTableCell = ({
  children,
  className,
  rowSpan,
  colSpan,
}: CJoliTableCellProps) => {
  return (
    <td
      className={`py-1 px-3 relative align-middle whitespace-normal text-small font-normal ${className}`}
      rowSpan={rowSpan ?? 1}
      colSpan={colSpan ?? 1}
    >
      {children}
    </td>
  );
};

interface CJoliTableHeaderProps<T> {
  columns: T[];
  children: (column: T) => ReactElement;
}

export const CJoliTableHeader = <T extends { key: string | number }>({
  columns,
  children,
}: CJoliTableHeaderProps<T>) => {
  return (
    <thead className="[&>tr]:first:rounded-lg" role="rowgroup">
      <tr className="group/tr" role="row">
        {columns.map((c) => children(c))}
      </tr>
      <tr className="w-px h-px block" tabIndex={-1} />
    </thead>
  );
};

interface CJoliTableRowProps<T> {
  columns: T[];
  children: (column: T) => ReactNode;
}

export const CJoliTableRow = <T,>({
  columns,
  children,
}: CJoliTableRowProps<T>) => {
  return (
    <tr className={`group/tr outline-none even:bg-default-100`} role="row">
      {columns.map((c) => children(c))}
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
  return <tbody role="rowgroup">{items.map((i) => children(i))}</tbody>;
};

interface CJoliTableProps<T> {
  children:
    | [
        ReactElement<CJoliTableHeaderProps<T>>,
        ReactElement<CJoliTableBodyProps<T>>,
      ]
    | ReactElement<CJoliTableBodyProps<T>>;
  topContent?: ReactNode;
  className?: string;
}

export const CJoliTable = <T,>({
  children,
  topContent,
  className,
}: CJoliTableProps<T>) => {
  return (
    <div className={`flex-col relative gap-4 w-full select-none ${className}`}>
      {topContent}
      <div className="p-4 z-0 flex flex-col relative justify-between gap-4 bg-content1 overflow-auto rounded-large shadow-small w-full">
        <table className="min-w-full h-auto table-auto w-full" role="grid">
          {children}
        </table>
      </div>
    </div>
  );
};

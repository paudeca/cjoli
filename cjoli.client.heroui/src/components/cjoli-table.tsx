export const CJoliTable = () => {
  return (
    <div className="flex-col relative gap-4 w-full">
      <div className="p-4 z-0 flex flex-col relative justify-between gap-4 bg-content1 overflow-auto rounded-large shadow-small w-full">
        <table className="min-w-full h-auto table-auto w-full" role="grid">
          <thead className="[&>tr]:first:rounded-lg" role="rowgroup">
            <tr className="group/tr" role="row">
              <th
                className="group/th px-3 h-10 align-middle bg-default-100 whitespace-nowrap text-tinify font-semibold first:rounded-s-large last:rounded-e-large"
                role="columnheader"
              >
                A
              </th>
              <th
                className="group/th px-3 h-10 align-middle bg-default-100 whitespace-nowrap text-tinify font-semibold first:rounded-s-large last:rounded-e-large"
                role="columnheader"
                colSpan={2}
              >
                B
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup">
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
        </table>
      </div>
    </div>
  );
};

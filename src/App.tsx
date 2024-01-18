import React from 'react';
import './App.css';
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import URL_PAIR_SERVICE from "./services/UrlPairService";
import {UrlPair} from "./types";
import {computed} from "@preact/signals-react";


export const UrlPairsTable = () => {
  //let data: Signal<UrlPair[]> = signal<UrlPair[]>([]);
  const [data, setData] = React.useState<UrlPair[]>([]);
  React.useEffect(() => {
    const getUrlsPairs = async () => {
        let res = await URL_PAIR_SERVICE.get10MostRecentUrlPairs();
        URL_PAIR_SERVICE.data.value = res.data;
        setData(res.data);
        URL_PAIR_SERVICE.shouldUpdateDataSig.value = false;
    };
    if(URL_PAIR_SERVICE.shouldUpdateDataSig.value){
      getUrlsPairs();
    }
  }, []);
  const columns: ColumnDef<UrlPair>[] = [
    {
      id: "longUrl",
      cell: ({row}) => <div className="lowercase">{row.getValue("longUrl")}</div>,
    },
    {
      id: "shortUrl",
      cell: ({row}) => <div className="lowercase">{row.getValue("shortUrl")}</div>,
    }
  ];
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
      []
  );
  const [columnVisibility, setColumnVisibility] =
      React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  /*const tableComputed = computed(()=> {
    return useReactTable({
      data: URL_PAIR_SERVICE.data.value,
      columns,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection,
      },
    });
  })*/

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
              placeholder="Filter long url..."
              value={(table.getColumn("longUrl")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                  table.getColumn("longUrl")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                          </TableHead>
                      )
                    })}
                  </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                      <TableRow
                          key={row.id}
                          data-state={"selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                              )}
                            </TableCell>
                        ))}
                      </TableRow>
                  ))
              ) : (
                  <TableRow>
                    <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
  );
}

function App() {
  const [longUrlInput, setLongUrlInput] = React.useState<string>("");
  const [shortUrlOutput, setShortUrlOutput] = React.useState<string>("");
  const generateTinyLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const res = await URL_PAIR_SERVICE.convertToTinyUrl(longUrlInput);
    const shortUrl = res.data;
    setShortUrlOutput(shortUrl);
    URL_PAIR_SERVICE.shouldUpdateDataSig.value = true;
  };
  return (
      <main
          className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 gap-8">
        <div className="w-full lg:w-1/2 max-w-md px-8 py-6 bg-white shadow-md rounded-lg dark:bg-gray-800">
          <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-white">Tiny URL Converter</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Convert your long URLs into tiny URLs</p>
          <form className="mt-8" onSubmit={generateTinyLink}>
            <div className="flex flex-col space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="url">
                Original URL
              </Label>
              <Input
                  className="px-3 py-2 text-sm w-full border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  id="url"
                  name="longUrl"
                  value={longUrlInput}
                  onChange={(event) => {
                    setLongUrlInput(event.target.value);
                    if(!longUrlInput.length){
                      setShortUrlOutput("");
                    }
                  }}
                  placeholder="Enter your URL here"
                  required
                  type="url"
              />
            </div>
            <Button
                className="w-full mt-6 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-md px-4 py-2"
                type="submit"
            >
              Convert
            </Button>
          </form>
          <div className="mt-8">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="tinyUrl">
              Tiny URL
            </Label>
            <Input
                className="px-3 py-2 text-sm w-full border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                id="tinyUrl"
                name="shortUrl"
                value={shortUrlOutput}
                placeholder="Your tiny URL will appear here"
                readOnly
                type="url"
            />
          </div>
        </div>
        <div
            className="w-full lg:w-1/2 max-w-md px-8 py-6 mt-8 lg:mt-0 bg-white shadow-md rounded-lg dark:bg-gray-800 overflow-y-auto h-[50vh]">
          <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-white">Previous Conversions</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Your past URL conversions</p>
          <UrlPairsTable/>
        </div>
      </main>
  );
}

export default App;

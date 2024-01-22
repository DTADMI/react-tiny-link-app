import React from 'react';
import './App.css';
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

import URL_PAIR_SERVICE from "./services/UrlPairService";
import {UrlPair} from "./types";
import {computed} from "@preact/signals-core";
import {useToast} from "@/components/ui/use-toast";


export const UrlPairsTable = () => {
    const { toast } = useToast();
  const [data, setData] = React.useState<UrlPair[]>([]);
  const shouldUpdateComputed = computed(() => {
    return URL_PAIR_SERVICE.shouldUpdateDataSig.value;
  })
  const [page, setPage] = React.useState<number>(1);
  const [pageCount, setPageCount] = React.useState<number>(0);
  React.useEffect(() => {
    const getUrlsPairs = async () => {
        try {
            let res = await URL_PAIR_SERVICE.getMostRecentUrlPairsPaginated(page);
            URL_PAIR_SERVICE.data.value = res.data.data;
            setPageCount(res.data._metadata.page_count);
            setData(res.data.data);
            URL_PAIR_SERVICE.shouldUpdateDataSig.value = false;
        } catch (e) {
            console.error(e);
            toast({
                title: "Uh oh! Something went wrong.😓",
                description: "There was a problem with your request.",
                variant: "destructive",
            })
        }

    };
    if(URL_PAIR_SERVICE.shouldUpdateDataSig.value){
      getUrlsPairs();
    }
  }, [page, shouldUpdateComputed.value, toast]);

  const getPreviousPage = (event: React.FormEvent) => {
      event.preventDefault();
      setPage(Math.max(1, page - 1));
      URL_PAIR_SERVICE.shouldUpdateDataSig.value = true;
  }

  const getNextPage = (event: React.FormEvent) => {
      event.preventDefault();
      setPage(Math.min(pageCount, page + 1));
      URL_PAIR_SERVICE.shouldUpdateDataSig.value = true;
  }

  return (
      <div className="w-full">
        <div className="mt-8 space-y-4">
            {data?.length ? (
                data.map((urlPair: UrlPair) => (
                    <div key={urlPair.id} className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                        <textarea
                            className="text-sm text-gray-700 dark:text-gray-200 w-full overflow-x-auto"
                            readOnly
                            value={urlPair.longUrl}
                        />
                        <Input
                            className="text-sm text-indigo-500 dark:text-indigo-400 w-full overflow-x-auto"
                            readOnly
                            type="text"
                            value={urlPair.shortUrl}
                        />
                    </div>
                ))
            ) : (
                <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
                  No results.
                </div>
            )}
        </div>
        <div className="mt-8 flex justify-between">
            <Button
                className="text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-md px-4 py-2"
                size="sm"
                onClick={(event) => getPreviousPage(event)}
                disabled={page === 1}
            >
              Previous
            </Button>
            <Button
                className="text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-md px-4 py-2"
                size="sm"
                onClick={(event) => getNextPage(event)}
                disabled={page === pageCount}
            >
              Next
            </Button>
        </div>
      </div>
  );
}

function App() {
  const [urlInput, setUrlInput] = React.useState<string>("");
  const [urlOutput, setUrlOutput] = React.useState<string>("");
const [urlInputIsValid, setUrlInputIsValid] = React.useState<boolean>(true);
const { toast } = useToast();

  const convertUrl = async (isConvertingToShort: boolean) => {
    try {
        let res;
        if(isConvertingToShort){
          res = await URL_PAIR_SERVICE.convertToTinyUrl(urlInput);
        } else {
          res = await URL_PAIR_SERVICE.convertToLongUrl(urlInput);
        }
      const convertedUrl = res.data;
      setUrlOutput(convertedUrl);
      URL_PAIR_SERVICE.shouldUpdateDataSig.value = true;
    } catch (e) {
      console.error(e);
      toast({
          title: "Uh oh! Something went wrong.😓",
          description: "There was a problem with your request.",
          variant: "destructive",
      })
    }
  };

    function isValidURL(url: string) {
        try {
            new URL(url);
            return true;
        } catch (error) {
            return false;
        }
    }
  return (
      <main
          className="flex flex-col lg:flex-row items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 gap-8">
        <div className="w-full lg:w-1/2 max-w-md px-8 py-6 bg-white shadow-md rounded-lg dark:bg-gray-800">
          <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-white">Tiny URL Converter</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Convert your URLs from long to short or short to long</p>
            <form className="mt-8">
                <div className="flex flex-col space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="urlInput">
                        URL to convert
                    </Label>
                    <Input
                        className="px-3 py-2 text-sm w-full border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        id="urlInput"
                        name="urlInput"
                        value={urlInput}
                        onChange={(event) => {
                            setUrlInput(event.target.value);
                            setUrlInputIsValid(event.target.value.length===0 || isValidURL(event.target.value));
                        }}
                        placeholder="Enter your URL to convert here"
                        required
                        type="url"
                    />
                    {!urlInputIsValid ?
                        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                            <div>Url is invalid.</div>
                        </p>
                        :
                        null
                    }
                </div>
                <div className="flex space-x-4 mt-6 mb-5">
                    <Button
                        className="w-full text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-md px-4 py-2"
                        type="button"
                        onClick={(event) => {
                            event.preventDefault();
                            convertUrl(true);
                        }}
                        disabled={urlInput.length === 0 || !isValidURL(urlInput)}
                    >
                        Convert to Short
                    </Button>
                    <Button
                        className="w-full text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-md px-4 py-2"
                        type="button"
                        onClick={(event) => {
                            event.preventDefault();
                            convertUrl(false);
                        }}
                        disabled={urlInput.length === 0 || !isValidURL(urlInput)}
                    >
                        Convert to Long
                    </Button>
                </div>
                <div className="flex flex-col space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="urlOutput">
                        Converted URL
                    </Label>
                    <Input
                        className="px-3 py-2 text-sm w-full border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        id="urlOutput"
                        name="urlOutput"
                        value={urlOutput}
                        placeholder="Your converted URLl will appear here"
                        readOnly
                        type="url"
                    />
                </div>
            </form>
        </div>
          <div
              className="w-full lg:w-1/2 max-w-md px-8 py-6 mt-8 lg:mt-0 bg-white shadow-md rounded-lg dark:bg-gray-800 overflow-y-auto h-[50vh]">
              <h2 className="text-2xl font-semibold text-center text-gray-700 dark:text-white">Previous Conversions</h2>
              <p className="text-center text-gray-500 dark:text-gray-400 mt-2">The most recently converted URLs</p>
              <UrlPairsTable/>
          </div>
      </main>
  );
}

export default App;

import env from "react-dotenv";
import axios from "axios";
import {PaginatedUrlPairsResult, UrlPair} from "../types";
import {Signal, signal} from "@preact/signals-core";

class UrlPairService {

    private API_PATH: string = "api/tinylink/urlPairs";
    shouldUpdateDataSig: Signal<boolean> = signal<boolean>(true);
    data: Signal<UrlPair[]> = signal<UrlPair[]>([]);


    public async convertToTinyUrl(longUrl: string) {
        return await axios.post<string>(`${env.REACT_TINY_LINK_API_URL}${this.API_PATH}/shortUrl`, { longUrl }, { headers: { "Content-Type": "application/json" } });
    }

    public async convertToLongUrl(shortUrl: string) {
        return await axios.post<string>(`${env.REACT_TINY_LINK_API_URL}${this.API_PATH}/longUrl`, { shortUrl }, { headers: { "Content-Type": "application/json" } });
    }

    public async getMostRecentUrlPairsPaginated(page: number) {
        return await axios.get<PaginatedUrlPairsResult>(`${env.REACT_TINY_LINK_API_URL}${this.API_PATH}?page=${page}`);
    }
}

const URL_PAIR_SERVICE = new UrlPairService();
export default URL_PAIR_SERVICE;
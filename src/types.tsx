export type UrlPair = {
    id: string;
    longUrl: string;
    shortUrl: string;
    creationDate: string;
}

export type PaginatedUrlPairsResult = {
    data: UrlPair[];
    _metadata: {
        page: number;
        per_page: number;
        page_count  : number;
        total_count: number;
    }
}
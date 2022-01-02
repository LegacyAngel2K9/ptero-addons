import useSWR from 'swr';
import http, { PaginatedResult } from '@/api/http';
import { createContext, useContext } from 'react';

interface ctx {
    page: number;
    setPage: (value: number | ((s: number) => number)) => void;
    searchFilter: string;
    setSearchFilter: (value: string | ((s: string) => string)) => void;
}

export const Context = createContext<ctx>({ page: 1, setPage: () => 1, searchFilter: '', setSearchFilter: () => '' });

export default () => {
    const { page, searchFilter } = useContext(Context);

    return useSWR<PaginatedResult<any>>([ 'server:minecraftMods', page, searchFilter ], async () => {
        const { data } = await http.get('/api/client/curse', { params: { index: page - 1 + (page - 1) * 10, pageSize: 10, gameId: 432, searchFilter, sectionId: 6, sort: 1 }, timeout: 60000 });

        return ({
            items: (data || []),
            pagination: { total: 13170, count: data.length, perPage: 10, currentPage: page, totalPages: 1317 },
        });
    });
};

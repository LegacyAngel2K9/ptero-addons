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

export default (uuid: string) => {
    const { page, searchFilter } = useContext(Context);

    return useSWR<PaginatedResult<any>>([ 'server:minecraftBukkitPlugins', page, searchFilter ], async () => {
        const { data } = await http.get('/api/client/bukkitplugin', { params: { page: page, searchFilter, uuid }, timeout: 60000 });

        return ({
            items: (data || []),
            pagination: { total: 13170, count: data.length, perPage: 20, currentPage: page, totalPages: 1317 },
        });
    });
};

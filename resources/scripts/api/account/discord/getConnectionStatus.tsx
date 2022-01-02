import http from '@/api/http';
import { DiscordConnectionResponse } from '@/components/dashboard/forms/DiscordConnect';

export default async (): Promise<DiscordConnectionResponse> => {
    const { data } = await http.get('/api/client/account/discord');
    return (data.data || []);
};

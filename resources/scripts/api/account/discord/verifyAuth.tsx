import http from '@/api/http';

export default (state: any, code: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        http.post('/api/client/account/discord/verify', { state, code })
            .then(() => resolve())
            .catch(reject);
    });
};

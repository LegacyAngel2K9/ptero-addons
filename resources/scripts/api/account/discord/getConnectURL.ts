import http from '@/api/http';

export default (): Promise<any> => {
    return new Promise((resolve, reject) => {
        http.post('/api/client/account/discord/auth').then((data) => {
            resolve(data.data || []);
        }).catch(reject);
    });
};

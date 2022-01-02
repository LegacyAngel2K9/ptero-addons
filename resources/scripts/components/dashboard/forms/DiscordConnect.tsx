import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import useSWR from 'swr';
import getConnectionStatus from '@/api/account/discord/getConnectionStatus';
import useFlash from '@/plugins/useFlash';
import Spinner from '@/components/elements/Spinner';
import { httpErrorToHuman } from '@/api/http';
import getConnectURL from '@/api/account/discord/getConnectURL';
import verifyAuth from '@/api/account/discord/verifyAuth';

export interface DiscordConnectionResponse {
    discordId: string;
}

export default () => {
    const search = window.location.search;
    const params = new URLSearchParams(search);

    const state = params.get('state');
    const code = params.get('code');

    const [ disabled, setDisabled ] = useState(false);
    const [ isVerified, setVerified ] = useState(false);

    const { clearFlashes, clearAndAddHttpError, addError, addFlash } = useFlash();
    const { data, error, mutate } = useSWR<DiscordConnectionResponse>([ '/account/discord' ], () => getConnectionStatus());

    const getUrl = () => {
        setDisabled(true);

        getConnectURL().then((data) => {
            window.location = data.data.authUrl;
        }).catch((error) => {
            setDisabled(false);
            addError({ key: 'account:discord', message: httpErrorToHuman(error) });
        });
    };

    const verifyConnection = () => {
        if (!isVerified) {
            setDisabled(true);
            setVerified(true);

            verifyAuth(state, code).then(() => {
                mutate();
                setDisabled(false);
                addFlash({ key: 'account:discord', message: 'You\'ve successfully connected your discord account with pterodactyl.', type: 'success', title: 'Success' });
            }).catch((error) => {
                setDisabled(false);
                addError({ key: 'account:discord', message: httpErrorToHuman(error) });
            });
        }
    };

    useEffect(() => {
        if (!error) {
            clearFlashes('account:discord');

            if (code !== null || state !== null) {
                verifyConnection();
            }
        } else {
            clearAndAddHttpError({ key: 'account:discord', error });
        }
    }, [ error ]);

    return (
        <div>
            {!data ?
                <div css={tw`w-full`}>
                    <Spinner size={'large'} centered />
                </div>
                :
                <>
                    <p css={tw`text-sm`}>
                        Connect your discord account with pterodactyl to get client role in our discord server.
                        {data.discordId !== null ?
                            <>
                                <br /><br />You can simply connect to another account, click to <b>CONNECTED</b> button.
                            </>
                            :
                            <></>
                        }
                    </p>
                    <div css={tw`mt-6`}>
                        <Button color={data.discordId !== null ? 'green' : 'primary'} onClick={getUrl} disabled={disabled}>
                            {data.discordId !== null ? 'CONNECTED' : 'Connect'}
                        </Button>
                    </div>
                </>
            }
        </div>
    );
};

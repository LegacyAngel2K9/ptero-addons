import React, { useContext, useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import McPluginsRow from './McPluginsRow';
import { ServerContext } from '@/state/server';
import getMinecraftPlugins, { Context as ServerPluginsContext } from '@/api/swr/getMinecraftPlugins';
import { Form, Formik } from 'formik';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import Pagination from '@/components/elements/Pagination';
interface Values {
    search: string;
}

const McPluginsBungeeSpigotContainer = () => {
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const serverId = ServerContext.useStoreState(state => state.server.data!.id);
    const { page, setPage, searchFilter, setSearchFilter } = useContext(ServerPluginsContext);

    const { data: minecraftPlugins, error, isValidating } = getMinecraftPlugins('2', uuid);
    const submit = ({ search }: Values) => {
        clearFlashes('minecraftMcPlugins');
        setSearchFilter(search);
    };
    useEffect(() => {
        if (!error) {
            clearFlashes('minecraftMcPlugins');

            return;
        }

        clearAndAddHttpError({ error, key: 'minecraftMcPlugins' });
    }, [ error ]);
    console.log(minecraftPlugins);
    if (!minecraftPlugins || (error && isValidating)) {
        return <Spinner size={'large'} centered/>;
    }
    return (
        <ServerContentBlock title={'Minecraft McVersion'}>
            <div css={tw`grid grid-cols-5 mb-8 gap-y-4 gap-x-8 mx-16`}>
                <a
                    type={'button'}
                    aria-label={'Install'}
                    href={`/server/${serverId}/plugins/spigot`}
                    css={tw`bg-neutral-900 rounded-t border-b border-black text-center h-8 p-1`}
                >
                    Spigot
                </a>

                <a
                    type={'button'}
                    aria-label={'Install'}
                    href={`/server/${serverId}/plugins/bungeespigot`}
                    css={tw`bg-neutral-900 rounded-t border-b border-black text-center h-8 p-1`}
                >
                    Bungeecord Spigot
                </a>
                <a
                    type={'button'}
                    aria-label={'Install'}
                    href={`/server/${serverId}/plugins/bungee`}
                    css={tw`bg-neutral-900 rounded-t border-b border-black text-center h-8 p-1`}
                >
                    Bungeecord (PROXY)
                </a>
                <a
                    type={'button'}
                    aria-label={'Install'}
                    href={`/server/${serverId}/plugins/bukkit`}
                    css={tw`bg-neutral-900 rounded-t border-b border-black text-center h-8 p-1`}
                >
                    Bukkit
                </a>
                <a
                    type={'button'}
                    aria-label={'Install'}
                    href={`/server/${serverId}/plugins/others`}
                    css={tw`bg-neutral-900 rounded-t border-b border-black text-center h-8 p-1`}
                >
                    Others
                </a>
            </div>
            <FlashMessageRender byKey={'minecraftMcPlugins'} css={tw`mb-4`}/>
            <Formik
                onSubmit={submit}
                initialValues={{
                    search: searchFilter,
                }}
                validationSchema={object().shape({
                    search: string().optional().min(1),
                })}
            >
                <Form css={tw`mb-3`}>
                    <Field
                        id={'search'}
                        name={'search'}
                        label={'Search'}
                        type={'text'}
                    />
                </Form>
            </Formik>
            <Pagination data={minecraftPlugins} onPageSelect={setPage}>
                {({ items }) => (
                    !items.length ?
                        <p css={tw`text-center text-sm text-neutral-300`}>
                            {page > 1 ?
                                'Looks like we\'ve run out of minecraftplugins to show you, try going back a page.'
                                :
                                'It looks like there are no minecraft plugins matching search criteria.'
                            }
                        </p>
                        :
                        items.map((minecraftPlugins, index) => <McPluginsRow
                            key={minecraftPlugins.id}
                            minecraftPlugins={minecraftPlugins}
                            uuid={uuid}
                            css={index > 0 ? tw`mt-2` : undefined}
                        />)
                )}
            </Pagination>
        </ServerContentBlock>
    );
};

export default () => {
    const [ page, setPage ] = useState<number>(1);
    const [ searchFilter, setSearchFilter ] = useState<string>('');

    return (
        <ServerPluginsContext.Provider value={{ page, setPage, searchFilter, setSearchFilter }}>
            <McPluginsBungeeSpigotContainer/>
        </ServerPluginsContext.Provider>
    );
};

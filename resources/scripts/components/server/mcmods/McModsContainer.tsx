import React, { useContext, useEffect, useState } from 'react';
import Spinner from '@/components/elements/Spinner';
import useFlash from '@/plugins/useFlash';
import { Form, Formik } from 'formik';
import FlashMessageRender from '@/components/FlashMessageRender';
import McModsRow from '@/components/server/mcmods/McModsRow';
import tw from 'twin.macro';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import getMinecraftMcMods, { Context as ServerMcModsContext } from '@/api/swr/getMinecraftMcMods';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import Pagination from '@/components/elements/PaginationMcMods';

interface Values {
    search: string;
}

const McModsContainer = () => {
    const { page, setPage, searchFilter, setSearchFilter } = useContext(ServerMcModsContext);
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { data: minecraftMcMods, error, isValidating } = getMinecraftMcMods();

    const submit = ({ search }: Values) => {
        clearFlashes('minecraftMcMods');
        setSearchFilter(search);
    };

    useEffect(() => {
        if (!error) {
            clearFlashes('minecraftMcMods');

            return;
        }

        clearAndAddHttpError({ error, key: 'minecraftMcMods' });
    }, [ error ]);

    if (!minecraftMcMods || (error && isValidating)) {
        return <Spinner size={'large'} centered/>;
    }

    return (
        <ServerContentBlock title={'Minecraft Mods'} css={tw`bg-transparent`}>
            <FlashMessageRender byKey={'minecraftMcMods'} css={tw`mb-4`}/>
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
            <Pagination data={minecraftMcMods} onPageSelect={setPage}>
                {({ items }) => (
                    !items.length ?
                        <p css={tw`text-center text-sm text-neutral-300`}>
                            {page > 1 ?
                                'Looks like we\'ve run out of CurseForge minecraft mods to show you, try going back a page.'
                                :
                                'It looks like there are no CurseForge minecraft mods matching search criteria.'
                            }
                        </p>
                        :
                        items.map((minecraftMcMods, index) => <McModsRow
                            key={minecraftMcMods.id}
                            minecraftMcMods={minecraftMcMods}
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
        <ServerMcModsContext.Provider value={{ page, setPage, searchFilter, setSearchFilter }}>
            <McModsContainer/>
        </ServerMcModsContext.Provider>
    );
};

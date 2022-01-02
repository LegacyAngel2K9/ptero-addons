import React, { useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { format, formatDistanceToNow } from 'date-fns';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import GreyRowBox from '@/components/elements/GreyRowBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ServerContext } from '@/state/server';
import Select from '@/components/elements/Select';
import http from '@/api/http';
import pullfiles from '@/api/server/files/pullFiles';

interface Props {
    minecraftMcMods: any;
    className?: string;
}

export default ({ minecraftMcMods, className }: Props) => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const [ loading, setLoading ] = useState(false);
    const { clearAndAddHttpError } = useFlash();
    let file = minecraftMcMods.latestFiles[0]?.downloadUrl;

    const realfileLength = minecraftMcMods.latestFiles[0]?.fileLength / 1000000 + 'mb';
    const fileLength = Math.round(minecraftMcMods.latestFiles[0]?.fileLength / 1000000 * 100) / 100;
    const updateSelectedFile = useCallback((v: React.ChangeEvent<HTMLSelectElement>) => {
        file = v.currentTarget.value;
        console.log(v.currentTarget.value);
    }, [ uuid, file ]);

    const installMcMods = () => {
        if (file === null || file === undefined) return;

        setLoading(true);
        http.get('/api/client/resolveRedirect', { params: { url: file } }).then(function (data) {
            const url = data.data;
            pullfiles(uuid, '/mods', url)
                .then(function () {
                    setLoading(false);
                })
                .catch(function (error) {
                    setLoading(false);
                    clearAndAddHttpError({ key: 'minecraftMcMods', error });
                });
        });
    };

    return (
        <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center`} className={className}>
            <SpinnerOverlay visible={loading || false} />
            <div css={tw`flex items-center truncate w-full md:flex-1`}>
                <div css={tw`flex flex-col truncate`}>
                    <div css={tw`flex items-center text-sm mb-1`}>
                        <div css={tw`w-10 h-10 rounded-lg bg-white border-2 border-neutral-800 overflow-hidden hidden md:block`} title={minecraftMcMods.name}>
                            <img css={tw`w-full h-full`} alt={minecraftMcMods.name} src={minecraftMcMods.attachments.filter((attachment: any) => attachment.isDefault)[0].thumbnailUrl}/>
                        </div>
                        <a href={minecraftMcMods.websiteUrl} css={tw`ml-4 break-words truncate`} title={minecraftMcMods.summary}>
                            {minecraftMcMods.name}<br/><div css={tw`text-2xs text-neutral-500`}>Description (Hover me)</div>
                        </a>
                    </div>
                    <p css={tw`mt-1 md:mt-0 text-xs truncate`}>
                        {minecraftMcMods.categories.map((category: any, index: any) => (
                            <img css={index > 0 ? tw`ml-1 w-8 h-auto inline` : tw`w-8 h-auto inline`} key={category.categoryId} src={category.avatarUrl} alt={category.name} title={category.name} />
                        ))}
                    </p>
                </div>
            </div>
            <div css={tw`flex-1 md:flex-none md:w-48 mt-4 md:mt-0 md:ml-1 md:text-center`}>
                <p css={tw`text-2xs text-neutral-500 uppercase mt-1`}>Weight of the last version</p>
                <p title={realfileLength} >
                    {fileLength}mb
                </p>
            </div>
            <div css={tw`flex-1 md:flex-none md:w-48 mt-4 md:mt-0 md:ml-5 md:text-center`}>
                <p
                    title={format(new Date(minecraftMcMods.dateReleased), 'ddd, MMMM do, yyyy HH:mm:ss')}
                    css={tw`text-sm`}
                >
                    {formatDistanceToNow(new Date(minecraftMcMods.dateReleased), { includeSeconds: true, addSuffix: true })}
                </p>
                <p css={tw`text-2xs text-neutral-500 uppercase mt-1`}>Last update</p>
            </div>
            <div css={tw`flex-1 md:flex-none md:w-48 mt-4 md:mt-0 md:ml-1 md:text-center`}>
                <Select
                    disabled={minecraftMcMods.files.fileLength < 2}
                    onChange={updateSelectedFile}
                    defaultValue={minecraftMcMods.files[0]?.id}
                >
                    {minecraftMcMods.files.map((files: any) => (
                        <option key={files.id} value={files.downloadUrl}>[{files.gameVersion[0]}] {files.displayName}</option>
                    ))}
                </Select>
            </div>
            <div css={tw`mt-4 md:mt-0 ml-6`} style={{ marginRight: '-0.5rem' }}>
                <button
                    type={'button'}
                    aria-label={'Install'}
                    css={tw`block text-sm p-1 md:p-2 text-neutral-500 hover:text-neutral-100 transition-colors duration-150 mx-4`}
                    onClick={installMcMods}
                    title="Download and Install"
                >
                    <FontAwesomeIcon icon={faDownload} />
                </button>
            </div>
        </GreyRowBox>
    );
};

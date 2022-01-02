import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import GreyRowBox from '@/components/elements/GreyRowBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ServerContext } from '@/state/server';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import updateStartupVariable from '@/api/server/updateStartupVariable';
import ConfirmationModal from '@/components/elements/ConfirmationModal';
import reinstallServer from '@/api/server/reinstallServer';
import { httpErrorToHuman } from '@/api/http';

interface Props {
    fivemartifacts: any;
    className?: string;
}
//Buyer Username: LegacyAngel2K9
//Buyer ID: 2888
//Resource Version: 1.9
//Resource Name: Pterodactyl Addon [1.X] - Artifacts Changer
//Transaction ID: 7W343408WL6021843 | Only Paid Resources
export default ({ fivemartifacts, className }: Props) => {
    const uuid = ServerContext.useStoreState(state => state.server.data!.uuid);
    const [ loading, setLoading ] = useState(false);
    const { clearAndAddHttpError } = useFlash();
    const { addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const file = 'https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/' + fivemartifacts.url;
    const [ modalVisible, setModalVisible ] = useState(false);

    const installArtifacts = () => {
        if (file === null || file === undefined) return;

        setLoading(true);
        console.log(file);
        updateStartupVariable(uuid, 'FIVEM_VERSION', fivemartifacts.version)
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ error, key: 'FiveMArtifacts' });
            })
            .then(() => {
                updateStartupVariable(uuid, 'DOWNLOAD_URL', 'https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/' + fivemartifacts.url)
                    .catch(error => {
                        console.error(error);
                        clearAndAddHttpError({ error, key: 'FiveMArtifacts' });
                    })
                    .then(() => {
                        reinstallServer(uuid)
                            .then(() => {
                                addFlash({
                                    key: 'settings',
                                    type: 'success',
                                    message: 'Artifacts change successfully',
                                });
                                addFlash({
                                    key: 'settings',
                                    type: 'success',
                                    message: 'Server reinstallation in progress...',
                                });
                            })
                            .catch(error => {
                                console.error(error);

                                addFlash({ key: 'settings', type: 'error', message: httpErrorToHuman(error) });
                            })
                            .then(() => {
                                setLoading(false);
                                setModalVisible(false);
                            });
                    });
            });
    };
    return (
        <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center`} className={className}>
            <SpinnerOverlay visible={loading || false} />
            <ConfirmationModal
                title={'Change server artifacts'}
                buttonText={'Yes, change it'}
                onConfirmed={installArtifacts}
                visible={modalVisible}
                onModalDismissed={() => setModalVisible(false)}
            >
                Your server will shut down and all of its data will be deleted. THIS ACTION IS IRREVERSIBLE. Are you sure you want to continue?
            </ConfirmationModal>
            <div css={tw`flex items-center truncate w-full md:flex-1`}>
                <div css={tw`flex flex-col truncate`}>
                    <div css={tw`flex items-center text-sm mb-1`}>
                        <div css={tw`w-10 h-10 rounded-lg bg-white border-2 border-neutral-800 overflow-hidden hidden md:block`}>
                            <img css={tw`w-full h-full`} alt={fivemartifacts.id} src={'https://cdn.discordapp.com/attachments/751908883005440071/874683743368020019/5338497-middle.png'}/>

                        </div>
                        <a href={file} css={tw`ml-4 break-words truncate`}>
                            Artifact : {fivemartifacts.number}
                        </a>
                    </div>
                </div>
            </div>
            <div css={tw`mt-4 md:mt-0 ml-6`} style={{ marginRight: '-0.5rem' }}>
                <button
                    type={'button'}
                    aria-label={'Install'}
                    css={tw`block text-sm p-1 md:p-2 text-neutral-500 hover:text-neutral-100 transition-colors duration-150 mx-4`}
                    onClick={() => setModalVisible(true)}
                >
                    <FontAwesomeIcon icon={faDownload} /> Install
                </button>
            </div>
        </GreyRowBox>
    );
};

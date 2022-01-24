import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faHistory, faTrash } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import GreyRowBox from '@/components/elements/GreyRowBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import pullFiles from '@/api/server/files/pullFiles';
import Button from '@/components/elements/Button';
import deleteFiles from '@/api/server/files/deleteFiles';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import renameFiles from '@/api/server/files/renameFiles';
import installPlugin from '@/api/server/mcplugins/installPlugin';
import uninstallPlugin from '@/api/server/mcplugins/uninstallPlugin';
import http from '@/api/http';

interface Props {
    minecraftPlugins: any;
    className?: string;
    uuid: string;
    custom: number;

}

export default ({ minecraftPlugins, className, uuid, custom }: Props) => {
    const [ loading, setLoading ] = useState(false);
    const { clearAndAddHttpError } = useFlash();
    const [ disable, setDisable ] = useState(false);
    const [ Installed, setInstalled ] = useState(minecraftPlugins.installed);
    const url = minecraftPlugins.downloadlink;

    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    function clear () {
        clearFlashes();
    }
    let iconurl = 'https://static.spigotmc.org/styles/spigot/xenresource/resource_icon.png';
    if (custom === 0 && minecraftPlugins.icon.url !== '') {
        iconurl = minecraftPlugins.icon.url;
    }
    if (custom === 1 && minecraftPlugins.icon[0]?.url !== '' && minecraftPlugins.icon[0]?.url.startsWith('http')) {
        iconurl = minecraftPlugins.icon[0]?.url;
    }
    const [ pourcentage, setpourcentage ] = useState('0%');
    const install = () => {
        setDisable(true);
        setLoading(true);
        setpourcentage('25% (Download of plugin in progress...)');
        console.log(url);
        http.get('/api/client/resolveRedirect', { params: { url } }).then(function (data) {
            let pullurl = data.data;
            if (custom === 1) {
                pullurl = url;
            } else {
                pullurl = pullurl.replace('edge', 'media');
            }
            console.log(pullurl);
            pullFiles(uuid, '/plugins', pullurl).then(() => {
                setTimeout(() => {
                    setpourcentage('75% (Rename file)');
                    console.log(pullurl.substr(pullurl.lastIndexOf('/') + 1));
                    renameFiles(uuid, '/plugins', [ { from: pullurl.substr(pullurl.lastIndexOf('/') + 1), to: minecraftPlugins.name + '.jar' } ]).then(() => {
                        setpourcentage('80%');
                    }).catch(function (error) {
                        setLoading(false);
                        setDisable(false);
                        clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
                    });
                    setpourcentage('90% (Some modification...)');
                    installPlugin(uuid, minecraftPlugins.name).then(() => {
                        addFlash({
                            key: 'minecraftMcPlugins',
                            type: 'success',
                            message: 'Plugins installed successfully',
                        });
                        setLoading(false);
                        setDisable(false);
                        setInstalled(1);
                        setTimeout(clear, 3000);
                    }).catch(function (error) {
                        setLoading(false);
                        setDisable(false);
                        clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
                    });
                }, 3000);
            }).catch(function (error) {
                setLoading(false);
                setDisable(false);
                clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
            });
        }).catch(function (error) {
            setLoading(false);
            setDisable(false);
            clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
        });
    };
    const uninstall = () => {
        setDisable(true);
        setLoading(true);
        setpourcentage('0% (Remove plugin file)');
        deleteFiles(uuid, '/plugins', [ minecraftPlugins.name + '.jar' ]).then(() => {
            setpourcentage('50% (Last modification...)');
            uninstallPlugin(uuid, minecraftPlugins.name).then(() => {
                setpourcentage('100%');
                addFlash({
                    key: 'minecraftMcPlugins',
                    type: 'success',
                    message: 'Plugins removed successfully',
                });
                setLoading(false);
                setDisable(false);
                setInstalled(0);
                setTimeout(clear, 3000);
            }).catch(function (error) {
                setLoading(false);
                setDisable(false);
                clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
            });
        }).catch(function (error) {
            setLoading(false);
            setDisable(false);
            clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
        });
    };
    const reinstall = () => {
        setDisable(true);
        setLoading(true);
        setpourcentage('0% (Check if you can remove it)');
        setpourcentage('25% (Remove plugin file)');
        deleteFiles(uuid, '/plugins', [ minecraftPlugins.name + '.jar' ]).then(() => {
            setpourcentage('40% (Some modification...)');
            uninstallPlugin(uuid, minecraftPlugins.name).then(() => {
                setpourcentage('50% (Download of plugin in progress)');
                http.get('/api/client/resolveRedirect', { params: { url } }).then(function (data) {
                    let pullurl = data.data;
                    pullurl = pullurl.replace('edge', 'media');
                    pullFiles(uuid, '/plugins', pullurl).then(() => {
                        setTimeout(() => {
                            setpourcentage('70% (Check if the plugin are in a zip)');

                            renameFiles(uuid, '/plugins', [ { from: minecraftPlugins.filename, to: minecraftPlugins.name + '.jar' } ]).then(() => {
                                setpourcentage('95% (Some modification...)');
                            }).catch(function (error) {
                                setLoading(false);
                                setDisable(false);
                                clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
                            });
                            installPlugin(uuid, minecraftPlugins.name).then(() => {
                                setpourcentage('100%');
                                addFlash({
                                    key: 'minecraftMcPlugins',
                                    type: 'success',
                                    message: 'Plugins reinstalled successfully',
                                });
                                setLoading(false);
                                setDisable(false);
                                setInstalled(1);
                                setTimeout(clear, 3000);
                            }).catch(function (error) {
                                setLoading(false);
                                setDisable(false);
                                clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
                            });
                        }, 3000);
                    }).catch(function (error) {
                        setLoading(false);
                        setDisable(false);
                        clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
                    });
                }).catch(function (error) {
                    setLoading(false);
                    setDisable(false);
                    clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
                });
            }).catch(function (error) {
                setLoading(false);
                setDisable(false);
                clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
            });
        }).catch(function (error) {
            setLoading(false);
            setDisable(false);
            clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
        });
    };
    return (
        <GreyRowBox css={tw`flex-wrap md:flex-nowrap items-center`} className={className}>
            <SpinnerOverlay visible={loading || false}>{pourcentage}</SpinnerOverlay>
            <div css={tw`flex items-center truncate w-full md:flex-1`}>
                <div css={tw`flex flex-col truncate`}>
                    <div css={tw`flex items-center text-sm mb-1`}>
                        <div css={tw`w-10 h-10 rounded-lg bg-neutral-700 border-2 border-neutral-800 overflow-hidden hidden md:block`}>
                            <img css={tw`w-full h-full`} alt={minecraftPlugins.name} src={iconurl}/>
                        </div>
                        <a href={'https://www.spigotmc.org/' + minecraftPlugins.links.discussion} target="_blank" rel="noreferrer" css={tw`ml-4 break-words truncate`}>
                            {minecraftPlugins.name}
                        </a>
                    </div>
                    {Installed === 1 &&
                        <p css={tw`text-sm`}>
                            Installed the {minecraftPlugins.installdate}
                        </p>
                    }
                </div>
            </div>
            <div css={tw`flex-1 md:flex-none md:w-96 mt-4 md:mt-0 md:ml-8 ml-4 md:text-center`}>
                <p css={tw`text-sm`}>
                    {minecraftPlugins.tag}
                </p>
            </div>
            <div css={tw`mt-4 md:mt-0 ml-6`} style={{ marginRight: '-0.5rem' }}>
                <Button
                    type={'button'}
                    color={Installed === 1 ? 'red' : 'green'}
                    onClick={() => {
                        if (Installed === 0) {
                            install();
                        } else {
                            uninstall();
                        }
                    }}
                    title={Installed === 1 ? 'Uninstall' : 'Install'}
                    disabled={disable}
                    isLoading={disable}
                >
                    <FontAwesomeIcon icon={Installed === 1 ? faTrash : faDownload} /> {Installed === 1 ? 'Uninstall' : 'Install'}
                </Button>
                {Installed === 1 &&
                <Button
                    type={'button'}
                    color={'red'}
                    css={tw`ml-2`}
                    onClick={() => reinstall()}
                    title="Reinstall"
                    disabled={disable}
                    isLoading={disable}
                >
                    <FontAwesomeIcon icon={faHistory} /> Reinstall
                </Button>
                }
            </div>
        </GreyRowBox>
    );
};

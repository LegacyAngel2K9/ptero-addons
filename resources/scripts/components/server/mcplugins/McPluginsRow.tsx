import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faHistory, faStar, faTrash } from '@fortawesome/free-solid-svg-icons';
import tw from 'twin.macro';
import useFlash from '@/plugins/useFlash';
import GreyRowBox from '@/components/elements/GreyRowBox';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import decompressFiles from '@/api/server/files/decompressFiles';
import pullFiles from '@/api/server/files/pullFiles';
import Button from '@/components/elements/Button';
import deleteFiles from '@/api/server/files/deleteFiles';
import { ApplicationStore } from '@/state';
import { Actions, useStoreActions } from 'easy-peasy';
import renameFiles from '@/api/server/files/renameFiles';
import installPlugin from '@/api/server/mcplugins/installPlugin';
import uninstallPlugin from '@/api/server/mcplugins/uninstallPlugin';

interface Props {
    minecraftPlugins: any;
    className?: string;
    uuid: string;

}

export default ({ minecraftPlugins, className, uuid }: Props) => {
    const [ loading, setLoading ] = useState(false);
    const { clearAndAddHttpError } = useFlash();
    const [ disable, setDisable ] = useState(false);
    const [ Installed, setInstalled ] = useState(minecraftPlugins.installed);

    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    function clear () {
        clearFlashes();
    }
    let iconurl = 'https://static.spigotmc.org/styles/spigot/xenresource/resource_icon.png';
    if (minecraftPlugins.icon.url !== '') {
        iconurl = 'https://www.spigotmc.org/' + minecraftPlugins.icon.url;
    }
    const [ pourcentage, setpourcentage ] = useState('0%');

    const install = () => {
        setDisable(true);
        setLoading(true);
        if (minecraftPlugins.file.type === 'external') {
            addFlash({
                key: 'minecraftMcPlugins',
                type: 'warning',
                message: 'This plugins can\'t be installed because the plugins files was not on spigotmc please install it manualy from this url https://www.spigotmc.org/' + minecraftPlugins.file.url + '. You can also see if this plugins are on bukkit with the bukkit tab.',
            });
            setLoading(false);
            setDisable(false);
            setTimeout(clear, 15000);
        } else {
            setpourcentage('25% (Download of plugin in progress...)');
            pullFiles(uuid, '/plugins', 'https://cdn.spiget.org/file/spiget-resources/' + minecraftPlugins.id + minecraftPlugins.file.type).then(() => {
                setTimeout(() => {
                    setpourcentage('40% (Check if the plugin are in a zip)');
                    if (minecraftPlugins.file.type === '.zip') {
                        setpourcentage('50% (Zip detected ! Decompresing...)');
                        decompressFiles(uuid, '/plugins', minecraftPlugins.id + '.zip').then(() => {
                            setpourcentage('60% (Remove the zip...)');
                            deleteFiles(uuid, '/plugins', [ minecraftPlugins.id + '.zip' ]).then(() => {
                                setpourcentage('80%');
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
                    } else {
                        renameFiles(uuid, '/plugins', [ { from: minecraftPlugins.id + '.jar', to: minecraftPlugins.name + '.jar' } ]).then(() => {
                            setpourcentage('80%');
                        }).catch(function (error) {
                            setLoading(false);
                            setDisable(false);
                            clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
                        });
                    }
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
        }
    };
    const uninstall = () => {
        setDisable(true);
        setLoading(true);
        setpourcentage('0% (Check if you can remove it)');
        if (minecraftPlugins.file.type === 'external') {
            addFlash({
                key: 'minecraftMcPlugins',
                type: 'warning',
                message: 'This plugins can\'t be removed because the plugins files was not on spigotmc please remove it manualy ',
            });
            setLoading(false);
            setDisable(false);
            setTimeout(clear, 15000);
        } else {
            setpourcentage('50% (Remove plugin file)');
            deleteFiles(uuid, '/plugins', [ minecraftPlugins.name + '.jar' ]).then(() => {
                setpourcentage('75% (Last modification...)');
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
        }
    };
    const reinstall = () => {
        setDisable(true);
        setLoading(true);
        setpourcentage('0% (Check if you can remove it)');
        if (minecraftPlugins.file.type === 'external') {
            addFlash({
                key: 'minecraftMcPlugins',
                type: 'warning',
                message: 'This plugins can\'t be reinstalled because the plugins files was not on spigotmc please reinstall it manualy ',
            });
            setLoading(false);
            setDisable(false);
            setTimeout(clear, 15000);
        } else {
            setpourcentage('25% (Remove plugin file)');
            deleteFiles(uuid, '/plugins', [ minecraftPlugins.name + '.jar' ]).then(() => {
                setpourcentage('40% (Some modification...)');
                uninstallPlugin(uuid, minecraftPlugins.name).then(() => {
                    setpourcentage('50% (Download of plugin in progress)');
                    pullFiles(uuid, '/plugins', 'https://cdn.spiget.org/file/spiget-resources/' + minecraftPlugins.id + minecraftPlugins.file.type).then(() => {
                        setTimeout(() => {
                            setpourcentage('70% (Check if the plugin are in a zip)');
                            if (minecraftPlugins.file.type === '.zip') {
                                setpourcentage('80% (Zip detected ! Decompresing...)');
                                decompressFiles(uuid, '/plugins', minecraftPlugins.id + '.zip').then(() => {
                                    setpourcentage('90% (Remove the zip...)');
                                    deleteFiles(uuid, '/plugins', [ minecraftPlugins.id + '.zip' ]).then(() => {
                                        setpourcentage('95% (Some modification...)');
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
                            } else {
                                renameFiles(uuid, '/plugins', [ { from: minecraftPlugins.id + '.jar', to: minecraftPlugins.name + '.jar' } ]).then(() => {
                                    setpourcentage('95% (Some modification...)');
                                }).catch(function (error) {
                                    setLoading(false);
                                    setDisable(false);
                                    clearAndAddHttpError({ key: 'minecraftMcPlugins', error });
                                });
                            }
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
        }
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
                    <p css={tw`mt-1 md:mt-0 text-xs truncate text-yellow-500`}>
                        <FontAwesomeIcon css={`${minecraftPlugins.rating.average >= 0.5 ? 'color: yellow;' : 'color: darkgray'}`} icon={faStar} />
                        <FontAwesomeIcon css={`${minecraftPlugins.rating.average >= 1.5 ? 'color: yellow;' : 'color: darkgray'}`} icon={faStar} />
                        <FontAwesomeIcon css={`${minecraftPlugins.rating.average >= 2.5 ? 'color: yellow;' : 'color: darkgray'}`} icon={faStar} />
                        <FontAwesomeIcon css={`${minecraftPlugins.rating.average >= 3.5 ? 'color: yellow;' : 'color: darkgray'}`} icon={faStar} />
                        <FontAwesomeIcon css={`${minecraftPlugins.rating.average >= 4.5 ? 'color: yellow;' : 'color: darkgray'}`} icon={faStar} />
                        {Installed === 1 &&
                        <p css={tw`text-sm`}>
                            Installed the {minecraftPlugins.installdate}
                        </p>

                        }
                    </p>
                    {minecraftPlugins.premium &&
                                        <p css={tw`mt-1 md:mt-0 text-xs truncate text-yellow-500`}>
                            PREMIUM ADDON (You can&apos;t download it here)
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
                {!minecraftPlugins.premium &&
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

                }
                {Installed === 1 && !minecraftPlugins.premium &&
                <Button
                    type={'button'}
                    color={'orange'}
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

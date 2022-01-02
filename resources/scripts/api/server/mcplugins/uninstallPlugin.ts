import http from '@/api/http';

export default (uuid: string, plugin: string) => {
    return new Promise<void>((resolve, reject) => {
        http.post('/api/client/uninstallplugin', { uuid, plugin }).then(() => resolve())
            .catch(reject);
    });
};
//Buyer Username: LegacyAngel2K9
//Buyer ID: 2888
//Resource Version: 1.0
//Resource Name: Pterodactyl Addon [1.X] - Minecraft Spigot and Bukkit Plugins installer
//Transaction ID: 4FS454932R1351155 | Only Paid Resources
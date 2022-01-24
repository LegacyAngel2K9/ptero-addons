## Welcome to Pterodactyl Addons

The following addons have been added to Pterodactyl

[Discord Role Manager [1.1]](https://pterodactylmarket.com/resource/342)<br>
[Artifacts Changer [2.0]](https://pterodactylmarket.com/resource/271)<br>
[Minecraft Mods Installer [2.0.1]](https://pterodactylmarket.com/resource/257)<br>
[Minecraft Spigot and Bukkit Plugins Installer [1.5]](https://pterodactylmarket.com/resource/326)<br>
[More Buttons [1.2]](https://pterodactylmarket.com/resource/325)<br>
[FastDownload [2.2]](https://pterodactylmarket.com/resource/163)

### Update & Install

Run this box first
```markdown
cd /var/www/pterodactyl
php artisan down
curl -L https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz | tar -xzv
curl -L https://github.com/LegacyAngel2K9/ptero-addons/releases/download/latest/ldtpa.tar.gz | tar -xzv
chmod -R 755 storage/* bootstrap/cache
composer install --no-dev --optimize-autoloader
yes
yes
yes
```

Run this box second
```markdown
yarn build:production
php artisan route:clear
php artisan cache:clear
php artisan view:clear
php artisan config:clear
php artisan migrate --seed --force
chown -R www-data:www-data *
php artisan queue:restart
php artisan up
```

### Support

Having Troubles? contact me on discord: [Legacy DEV Team](https://discord.gg/D6zhBfuTKw) just ping me (Angel)

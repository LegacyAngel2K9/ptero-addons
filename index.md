## Welcome to Pterodactyl Addons

The following addons have been added to Pterodactyl

[Discord Role Manager](https://pterodactylmarket.com/resource/342)<br>
[Artifacts Changer](https://pterodactylmarket.com/resource/271)<br>
[Minecraft Mods Installer](https://pterodactylmarket.com/resource/257)<br>
[Minecraft Spigot and Bukkit Plugins Installer](https://pterodactylmarket.com/resource/326)<br>
[More Buttons](https://pterodactylmarket.com/resource/325)<br>
[FastDownload](https://pterodactylmarket.com/resource/163)

### Update & Install

Run this box first
```markdown
cd /var/www/pterodactyl
php artisan down
curl -L https://github.com/pterodactyl/panel/releases/latest/download/panel.tar.gz | tar -xzv
chmod -R 755 storage/* bootstrap/cache
composer install --no-dev --optimize-autoloader
yes
yes
yes
```

Run this box second
```markdown
curl -L https://github.com/LegacyAngel2K9/ptero-addons/archive/refs/tags/v1.0.0.tar.gz | tar -xzv
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

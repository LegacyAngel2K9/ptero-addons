<?php

namespace Pterodactyl\Console\Commands\User;

use GuzzleHttp\Client;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use GuzzleHttp\Exception\GuzzleException;
use Pterodactyl\Repositories\Eloquent\SettingsRepository;

class ManageDiscordRoles extends Command
{
    /**
     * @var string
     */
    protected $signature = 'p:user:discord';

    /**
     * @var string
     */
    protected $description = 'Set discord roles for clients.';

    /**
     * @var SettingsRepository
     */
    protected $settings;

    /**
     * ManageDiscordRoles constructor.
     * @param SettingsRepository $settingsRepository
     */
    public function __construct(SettingsRepository $settingsRepository)
    {
        parent::__construct();

        $this->settings = $settingsRepository;
    }

    /**
     *
     */
    public function handle()
    {
        $clientIds = [];
        $exClientIds = [];
        $users = DB::table('users')->whereNotNull('discord_id')->get();

        foreach ($users as $user) {
            $servers = DB::table('servers')->where('owner_id', '=', $user->id)->get();
            $subusers = DB::table('subusers')->where('user_id', '=', $user->id)->get();
            if (count($servers) > 0 || count($subusers) > 0) {
                array_push($clientIds, $user->discord_id);
            } else {
                array_push($exClientIds, $user->discord_id);
            }
        }

        $client = new Client([
            'base_uri' => $this->settings->get('discord::botUrl', ''),
            'timeout' => 120,
            'connect_timeout' => 10,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->settings->get('discord::panelToken', ''),
                'Content-Type' => 'application/json',
            ],
        ]);

        try {
            $request = $client->request('POST', '/roles', [
                'json' => [
                    'details' => [
                        'guildId' => $this->settings->get('discord::guildId', ''),
                        'roleId' => $this->settings->get('discord::roleId', ''),
                        'exRoleId' => $this->settings->get('discord::exRoleId', ''),
                    ],
                    'clients' => $clientIds,
                    'exClients' => $exClientIds,
                ],
            ]);

            if (json_decode($request->getBody())->success != true) {
                return $this->error('Failed to manage roles.');
            }
        } catch (GuzzleException $e) {
            return $this->error('Failed to connect to discord bot.');
        }

        return $this->line('The roles successfully managed.');
    }
}

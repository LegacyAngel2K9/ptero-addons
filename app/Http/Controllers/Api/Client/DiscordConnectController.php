<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Wohali\OAuth2\Client\Provider\Discord;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Repositories\Eloquent\SettingsRepository;
use Pterodactyl\Http\Requests\Api\Client\Account\DiscordConnectRequest;

class DiscordConnectController extends ClientApiController
{
    /**
     * @var SettingsRepository
     */
    protected $settings;

    /**
     * DiscordConnectController constructor.
     * @param SettingsRepository $settingsRepository
     */
    public function __construct(SettingsRepository $settingsRepository)
    {
        parent::__construct();

        $this->settings = $settingsRepository;
    }

    /**
     * @param DiscordConnectRequest $request
     * @return array
     */
    public function index(DiscordConnectRequest $request)
    {
        return [
            'success' => true,
            'data' => [
                'discordId' => Auth::user()->discord_id,
            ],
        ];
    }

    /**
     * @param DiscordConnectRequest $request
     * @return array
     */
    public function generateAuthURL(DiscordConnectRequest $request)
    {
        $provider = new Discord([
            'clientId' => $this->settings->get('discord::clientId', ''),
            'clientSecret' => $this->settings->get('discord::secret', ''),
            'redirectUri' => route('index') . '/account',
        ]);

        $options = [
            'state' => 'OPTIONAL_CUSTOM_CONFIGURED_STATE',
            'scope' => ['identify'],
        ];

        $authUrl = $provider->getAuthorizationUrl($options);
        $state = $provider->getState();

        Cache::put('Account:Discord:' . Auth::user()->id, $state, now()->addMinutes(5));

        return [
            'success' => true,
            'data' => [
                'authUrl' => $authUrl,
            ],
        ];
    }

    /**
     * @param DiscordConnectRequest $request
     * @return array
     * @throws DisplayException
     * @throws \Illuminate\Validation\ValidationException
     * @throws \League\OAuth2\Client\Provider\Exception\IdentityProviderException
     */
    public function validateAuth(DiscordConnectRequest $request)
    {
        $this->validate($request, [
            'code' => 'required',
            'state' => 'required',
        ]);

        $code = trim(strip_tags($request->input('code', '')));
        $state = trim(strip_tags($request->input('state', '')));

        $cacheState = Cache::pull('Account:Discord:' . Auth::user()->id);

        if (is_null($cacheState)) {
            throw new DisplayException('State not found.');
        }

        if ($state !== $cacheState) {
            throw new DisplayException('Invalid auth state.');
        }

        $provider = new Discord([
            'clientId' => $this->settings->get('discord::clientId', ''),
            'clientSecret' => $this->settings->get('discord::secret', ''),
            'redirectUri' => route('index') . '/account',
        ]);

        $token = $provider->getAccessToken('authorization_code', [
            'code' => $code,
        ]);

        try {
            $user = $provider->getResourceOwner($token);

            DB::table('users')->where('id', '=', Auth::user()->id)->update([
                'discord_id' => $user->getId(),
            ]);
        } catch (\Exception $e) {
            throw new DisplayException('Failed to connect your discord account. Please try again...');
        }

        return [
            'success' => true,
            'data' => [],
        ];
    }
}

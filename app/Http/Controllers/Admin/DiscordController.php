<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Repositories\Eloquent\SettingsRepository;

class DiscordController extends Controller
{
    /**
     * @var AlertsMessageBag
     */
    protected $alert;

    /**
     * @var SettingsRepository
     */
    protected $settings;

    /**
     * DiscordController constructor.
     * @param AlertsMessageBag $alert
     * @param SettingsRepository $settingsRepository
     */
    public function __construct(AlertsMessageBag $alert, SettingsRepository $settingsRepository)
    {
        $this->alert = $alert;
        $this->settings = $settingsRepository;
    }

    /**
     * @return \Illuminate\Contracts\Foundation\Application|\Illuminate\Contracts\View\Factory|\Illuminate\Contracts\View\View
     */
    public function index()
    {
        if (empty($this->settings->get('discord::panelToken', ''))) {
            $this->settings->set('discord::panelToken', Str::random(30));
        }

        return view('admin.discord', [
            'clientId' => $this->settings->get('discord::clientId', ''),
            'secret' => $this->settings->get('discord::secret', ''),
            'guildId' => $this->settings->get('discord::guildId', ''),
            'roleId' => $this->settings->get('discord::roleId', ''),
            'exRoleId' => $this->settings->get('discord::exRoleId', ''),
            'panelToken' => $this->settings->get('discord::panelToken', ''),
            'botUrl' => $this->settings->get('discord::botUrl', ''),
        ]);
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Pterodactyl\Exceptions\Model\DataValidationException
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function save(Request $request)
    {
        $this->validate($request, [
            'clientId' => 'required',
            'clientSecret' => 'required',
            'guildId' => 'required',
            'roleId' => 'required',
            'botUrl' => 'required',
        ]);

        $this->settings->set('discord::clientId', trim(strip_tags($request->input('clientId', ''))));
        $this->settings->set('discord::secret', trim(strip_tags($request->input('clientSecret', ''))));
        $this->settings->set('discord::guildId', trim(strip_tags($request->input('guildId', ''))));
        $this->settings->set('discord::roleId', trim(strip_tags($request->input('roleId', ''))));
        $this->settings->set('discord::exRoleId', trim(strip_tags($request->input('exRoleId', ''))));
        $this->settings->set('discord::botUrl', trim(strip_tags($request->input('botUrl', ''))));

        $this->alert->success('You\'ve successfully edited the discord settings.')->flash();

        return redirect()->back();
    }
}
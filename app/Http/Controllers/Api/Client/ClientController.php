<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Pterodactyl\Models\Server;
use Pterodactyl\Models\Permission;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Pterodactyl\Models\Filters\MultiFieldServerFilter;
use Pterodactyl\Repositories\Eloquent\ServerRepository;
use Pterodactyl\Transformers\Api\Client\ServerTransformer;
use Pterodactyl\Http\Requests\Api\Client\GetServersRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Pterodactyl\Exceptions\DisplayException;


class ClientController extends ClientApiController
{
    /**
     * @var \Pterodactyl\Repositories\Eloquent\ServerRepository
     */
    private $repository;

    /**
     * ClientController constructor.
     */
    public function __construct(ServerRepository $repository)
    {
        parent::__construct();

        $this->repository = $repository;
    }

    /**
     * Return all of the servers available to the client making the API
     * request, including servers the user has access to as a subuser.
     */
    public function index(GetServersRequest $request): array
    {
        $user = $request->user();
        $transformer = $this->getTransformer(ServerTransformer::class);

        // Start the query builder and ensure we eager load any requested relationships from the request.
        $builder = QueryBuilder::for(
            Server::query()->with($this->getIncludesForTransformer($transformer, ['node']))
        )->allowedFilters([
            'uuid',
            'name',
            'external_id',
            AllowedFilter::custom('*', new MultiFieldServerFilter()),
        ]);

        $type = $request->input('type');
        // Either return all of the servers the user has access to because they are an admin `?type=admin` or
        // just return all of the servers the user has access to because they are the owner or a subuser of the
        // server. If ?type=admin-all is passed all servers on the system will be returned to the user, rather
        // than only servers they can see because they are an admin.
        if (in_array($type, ['admin', 'admin-all'])) {
            // If they aren't an admin but want all the admin servers don't fail the request, just
            // make it a query that will never return any results back.
            if (!$user->root_admin) {
                $builder->whereRaw('1 = 2');
            } else {
                $builder = $type === 'admin-all'
                    ? $builder
                    : $builder->whereNotIn('servers.id', $user->accessibleServers()->pluck('id')->all());
            }
        } elseif ($type === 'owner') {
            $builder = $builder->where('servers.owner_id', $user->id);
        } else {
            $builder = $builder->whereIn('servers.id', $user->accessibleServers()->pluck('id')->all());
        }

        $servers = $builder->paginate(min($request->query('per_page', 50), 100))->appends($request->query());

        return $this->fractal->transformWith($transformer)->collection($servers)->toArray();
    }

    /**
     * Returns all of the subuser permissions available on the system.
     *
     * @return array
     */
    public function permissions()
    {
        return [
            'object' => 'system_permissions',
            'attributes' => [
                'permissions' => Permission::permissions(),
            ],
        ];
    }
    /**
     * @throws DisplayException
     */
    public function curse(Request $request)
    {
        $headers = ['User-Agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.81 Safari/537.36'];


           $addons = Http::accept('application/json')->withHeaders($headers)->get('https://addons-ecs.forgesvc.net/api/v2/addon/search', [
            'index' => $request->index,
            'pageSize' => $request->pageSize,
            'gameId' => $request->gameId,
            'sectionId' => $request->sectionId,
            'searchFilter' => $request->searchFilter,
        ])->object();
        
        foreach ($addons as $addon) {
            $addon->files = Http::accept('application/json')->withHeaders($headers)->get("https://addons-ecs.forgesvc.net/api/v2/addon/{$addon->id}/files")->object();
            
            if ($request->sectionId == 4471) $addon->serverFiles = Cache::remember('addons.serverFiles.'.$addon->id, now()->addDays(7), function () use ($addon, $headers) {
                $tempArray = [];

                foreach ($addon->files as $addonFile) {
                    if ($addonFile->serverPackFileId != null) {
                        $serverFileDownloadUrl = Http::accept('text/plain')->withHeaders($headers)->get("https://addons-ecs.forgesvc.net/api/v2/addon/{$addon->id}/file/{$addonFile->serverPackFileId}/download-url")->body();

                    if ($serverFileDownloadUrl != null) $tempArray[] = [
                        'id' => $addonFile->serverPackFileId,
                            'displayName' => $addonFile->displayName,
                            'downloadUrl' => $serverFileDownloadUrl
                    ];
                    }
                }
                
                return $tempArray;
            });
        }
                $pteroaddon = Http::accept('application/json')->get('https://gameversion.bagou450.com/minecraft/verification.json')->object();

        if($pteroaddon->verified === false) {
            throw new DisplayException('Pirated (This addon was pirated contact me on discord Bagou450#0666 or Yotapaki#8953 for talk about that)');
        }
        return $addons;
    }
     
     public function resolveRedirect(Request $request)
     {
    $ch = curl_init();
 
    curl_setopt($ch, CURLOPT_URL, $request->url);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
 
    curl_exec($ch);
 
    $redirectedUrl = curl_getinfo($ch, CURLINFO_REDIRECT_URL);
 
    curl_close($ch);
    
    return $redirectedUrl;
     }	

    public function artifacts(Request $request)
{
$headers = ['User-Agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.81 Safari/537.36'];
             
$pteroaddon = Http::accept('application/json')->get('https://gameversion.bagou450.com/fivem/versionlistblind.json')->object();
    if($pteroaddon->verified === false) {
        throw new DisplayException('Pirated (This addon was pirated or not updated me on discord Bagou450#0666 or Yotapaki#8953 for talk about that)');
    }
 $tablo_liens=array();
 $url = 'https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/';
 $pattern = '#(?:src|href|path|xmlns(?::xsl)?)\s*=\s*(?:"|\')\s*(.+)?\s*(?:"|\')#Ui';
 $subject = file_get_contents($url);
   preg_match_all($pattern, $subject, $matches, PREG_PATTERN_ORDER);
 foreach($matches[1] as $match)
   {
     if (str_starts_with($match, './')) {
         $artifactslink = str_replace("./", "", $match);
         $artifactnumber = strtok($artifactslink, '-');
         $tablo_liens[] = array(
             "url"=>$artifactslink, 
             "number"=>$artifactnumber,
             "version"=>$artifactnumber
        );
     }
 }
 return $tablo_liens;
}
}

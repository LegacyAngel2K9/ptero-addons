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
use Pterodactyl\Http\Requests\Admin\ServerFormRequest;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Services\Servers\ServerCreationService;
use Pterodactyl\Contracts\Repository\EggRepositoryInterface;
use Pterodactyl\Models\User;
use DOMDocument;

class McPluginsController extends ClientApiController
{
    /**
     * @var \Pterodactyl\Repositories\Eloquent\ServerRepository
     */
    private $repository;
    /**
     * @var \Pterodactyl\Services\Servers\ServerCreationService
     */
    public function __construct(
        ServerRepository $repository,

        )
    {
        parent::__construct();

        $this->repository = $repository;

        
    }

   public function plugins(Request $request)
    {    	    
        if ($request->searchFilter) {
            $plugins =Http::accept('application/json')->get("https://api.spiget.org/v2/search/resources/$request->searchFilter?field=name&size=10&page=$request->page&sort=downloads/resources")->object();
            return json_encode(array_reverse($plugins));
        } else {
   	    $plugins =Http::accept('application/json')->get("https://api.spiget.org/v2/categories/$request->sectionId/resources", [
	    	'size' => 10,
            'page' => $request->page,
	    	'searchFilter' => $request->searchFilter,
            'sort' => '-downloads',
	    ])->object();
        foreach ($plugins as $key => $plugin) {
            $plugins[$key]->installed = 0;
            $plugins[$key]->installedate = date('Y-m-d H:i');
            if (DB::table('mcplugins')->where('server', '=', $request->uuid)->where('plugin', '=', $plugin->name)->get() != '[]')
            {
                $date = DB::table('mcplugins')->where('server', '=', $request->uuid)->where('plugin', '=', $plugin->name)->pluck('installdate');
                $plugins[$key]->installdate = $date;
                $plugins[$key]->installed = 1;
            }
        }
	    return json_encode($plugins);
           }
    }
    public function installplugin(Request $request) 
    {
        DB::table('mcplugins')->insert([
            'server' => $request->uuid,
            'plugin' => $request->plugin,
            'installdate' => date('Y-m-d H:i')
        ]);
    }
    public function uninstallplugin(Request $request) 
    {
        DB::table('mcplugins')->where('server', '=', $request->uuid)->where('plugin', '=', $request->plugin)->delete();
    }
    public function bukkitplugin(Request $request)
    {
        if ($request->searchFilter) {
            $url = "https://dev.bukkit.org/search?projects-page=$request->page&search=$request->searchFilter";
        } else {
            $url = "https://dev.bukkit.org/bukkit-plugins?page=$request->page";
        }
        $tablo_liens=array();
        $subject = file_get_contents($url);
        preg_match_all('/<a\s+.*?href=[\"\']?([^\"\' >]*)[\"\']?[^>]*>(.*?)<\/a>/i', $subject, $matches, PREG_PATTERN_ORDER);
        foreach($matches[1] as $match)
          {
            if (str_starts_with($match, '/projects')) {
                //Link of plugin
                    $pluginlink = $match;
                //Get download link
                  //  $headers = get_headers("https://dev.bukkit.org$pluginlink/files/latest");
                  //  $downloadurl = strstr($headers[6], "http");
                    $downloadurl = "https://dev.bukkit.org$pluginlink/files/latest";
                //Get file name 
                    $downlodedname = substr($pluginlink, strrpos($pluginlink, '/') + 1);
                //Get name
                    $first = strstr($subject, "<a href=\"$pluginlink\">");
                    $second = strstr($first, "</a>", true);
                    $third= str_replace("<a href=\"$pluginlink\">", '', $second);
                    $pluginname = $third;
                //Get plugin icon
                if ($request->searchFilter) {
                    $firsticon= strstr($subject, "<a class=\"results-image e-avatar64 \" href=\"$pluginlink\"");
                    $secondicon = strstr($firsticon, "</a>", true);
                    $thirdicon = str_replace("<a class=\"results-image e-avatar64 \" href=\"$pluginlink\"", '', $secondicon);
                    preg_match_all('#\bhttps?://[^,\s()<>]+(?:\([\w\d]+\)|([^,[:punct:]\s]|/))#', $thirdicon, $fourthicon);
                    $iconurl = str_replace('"/', "", implode(', ', $fourthicon[0]));
                } else {
                     $firsticon= strstr($subject, "<a class=\"e-avatar64 \" href=\"https://dev.bukkit.org$pluginlink\"");
                     $secondicon = strstr($firsticon, "</a>", true);
                     $thirdicon = str_replace("<a class=\"e-avatar64 \" href=\"https://dev.bukkit.org$pluginlink\"", '', $secondicon);
                     preg_match_all('#\bhttps?://[^,\s()<>]+(?:\([\w\d]+\)|([^,[:punct:]\s]|/))#', $thirdicon, $fourthicon);
                     $iconurl = str_replace('"/', "", implode(', ', $fourthicon[0]));
                }
                //Get plugin description
                if ($request->searchFilter) {
                    $firstdesc = strstr($subject, $pluginname);
                    $seconddesc = strstr($firstdesc, '<div class="results-summary">');
                    $thirddesc = strstr($seconddesc, "</div>", true);
                    $fourthdesc= str_replace('<div class="results-summary">', '', $thirddesc);
                    $fifthdesc= str_replace('<p>', '', $fourthdesc);
                    $sixthdesc = str_replace('</p>', '', $fifthdesc);
                    $desc = $sixthdesc;
                } else {
                     $firstdesc = strstr($subject, $pluginname);
                     $seconddesc = strstr($firstdesc, '<div class="description">');
                     $thirddesc = strstr($seconddesc, "</div>", true);
                     $fourthdesc= str_replace('<div class="description">', '', $thirddesc);
                     $fifthdesc= str_replace('<p>', '', $fourthdesc);
                     $sixthdesc = str_replace('</p>', '', $fifthdesc);
                     $desc = $sixthdesc;
                }
                //Check if installed
                $installed = 0;
                $installdate = date('Y-m-d H:i');
                if (DB::table('mcplugins')->where('server', '=', $request->uuid)->where('plugin', '=', $pluginname)->get() != '[]')
                {
                    $date = DB::table('mcplugins')->where('server', '=', $request->uuid)->where('plugin', '=', $pluginname)->pluck('installdate');
                    $installdate = $date;
                    $installed = 1;
                }
                //All variable in a array
                     $tablo_liens[] = array(
                         "name"=>$pluginname,
                         "downloadlink"=> $downloadurl,
                         "filename" => $downlodedname,
                         "installed" => $installed,
                         "installdate" => $installdate,
                         "links" => [
                             "discussion" => $pluginlink
     
                         ],
                         "file" => [
                             "type" => '.jar'
                         ],
                         "icon"=> [
                             "url" => $iconurl
                         ],
                         'tag' => $desc,
                    );

                
                
           
            }
        }
        return json_encode($tablo_liens);
    

    }
    public function getcustomplugins(Request $request)
    {   
        $url = $_SERVER['SERVER_NAME'];
        $plugins = Http::accept('application/json')->get("$url/pluginslist.json")->object(); 
    //Check if installed
        foreach ($plugins as $key => $plugin) {
            $plugins[$key]->installed = 0;
            $plugins[$key]->installedate = date('Y-m-d H:i');
            if (DB::table('mcplugins')->where('server', '=', $request->uuid)->where('plugin', '=', $plugin->name)->get() != '[]')
            {
                $date = DB::table('mcplugins')->where('server', '=', $request->uuid)->where('plugin', '=', $plugin->name)->pluck('installdate');
                $plugins[$key]->installdate = $date;
                $plugins[$key]->installed = 1;

            }
        }
        return json_encode($plugins);
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
}
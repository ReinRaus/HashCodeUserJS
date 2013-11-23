<HEAD><meta charset="utf-8"> </HEAD>
<pre><?php 
define("DS", DIRECTORY_SEPARATOR);
function logg($text) {
    $t=file_get_contents("log.txt");
    if (strlen($t)>"100000") $t= substr($t, 50000);
    file_put_contents("log.txt", $t."\n".$text);
};
$build= intval(file_get_contents("build.txt"));
$build++;
file_put_contents("build.txt", $build);

$salt="ewfu\x00Hjf8()\x04";
if( md5($_GET['pwd'].$salt)!= "..." ||
    !(cidr_match($_SERVER['REMOTE_ADDR'], Array("192.30.252.0/22")) ||
    $_SERVER['REMOTE_ADDR']== '127.0.0.1') ) die("Not access");
$payload= json_decode($_POST['payload']);
if ($payload->head_commit->author->name=="www-data") die(); // чтобы не зацикливало
$branch= preg_replace("/^.*?([^\/]++)$/", "$1", $payload->ref);
if ($_SERVER['REMOTE_ADDR']== '127.0.0.1') {
    $path= "c:/Users/ReinRaus/git/HashCodeUserJS/";
} else {
    $path= "/home/git/repositories/apachereps/HashCodeUserJS/";
    loggedExec("cd $path && git pull && git checkout $branch");
};
$path= str_replace("/", DS, $path);
$addons= getAddons($path);
$joinedFiles= joinFiles($path, $addons);
createForChrome ($path, $joinedFiles);
createForFirefox($path, $joinedFiles);
createForOpera  ($path, $joinedFiles);
if ($_SERVER['REMOTE_ADDR']!= '127.0.0.1') {
    loggedExec("cd $path && git commit -am \"Automatic build $build\"");
    if ($branch!="master") {
        loggedExec("cd $path && git push origin $branch && git checkout master && git branch -D $branch");
    } else {
        loggedExec("cd $path && git push");
    }
}
function loggedExec($cmd) {
    $s=exec($cmd." 2>&1", $output, $v);
    logg(var_export($output, true));
    logg($v." ".$s);
}

function getAddons($path) {
    $fullPath= filterRegexArray(getFolderList($path."addons"), "/[\\".DS."]addons[\\".DS."][^\\".DS."]+\\.js$/i");
    return array_map(function($text){return preg_replace('/^.*?([^\\'.DS.']+)$/', "$1", $text);}, $fullPath);
}

function joinFiles($path, $addons) {
    $DS= DS;
    $__addons= array_map(function($text){return preg_replace("/\\.js$/i", "", "__".$text);}, $addons);
    $result="\nvar __addons=['".implode("', '", $__addons)."'];\n";
    $result.= file_get_contents($path."userjsloader.js")."\n\n__addons=[\n\n";
    foreach ($addons as $k=>$v) {
        $content= file_get_contents("$path${DS}addons$DS$v");
        if (mb_detect_encoding($content)=='UTF-8' && substr($content, 0, 3)!="\xef\xbb\xbf") {
            $content="\xef\xbb\xbf".$content; // + BOM
            file_put_contents("$path${DS}addons$DS$v", $content);
        }
        $result.= $content.",\n\n";
    };
    $result.= "]; // end addons\naddonsLoader.initStorage();\naddonsLoader.callEventIterator('beforeInit');\n\n";
    $result= preg_replace_callback("/\[DEPLOY:image64\](.*?)\[\/DEPLOY\]/is", 
        function ($match) {
            global $path;
            return getDataURL($path.str_replace("/", DS, $match[1]));
        }, $result);
    $result= preg_replace_callback("/\[DEPLOY:build\](.*?)\[\/DEPLOY\]/is", function($match){
            global $build;
            return $build;
        }, $result);
    return $result;
};

function createForChrome($path, $joinedFiles) {
    $json= json_decode(file_get_contents($path."chromejson.txt"));
    $json->html= "<script>\n".$joinedFiles."\n</script>";
    file_put_contents($path."release".DS."ChromeDump.json", json_encode($json));
}

function createForFirefox($path, $joinedFiles) {
    $result= file_get_contents($path."userjsheaders.txt")
            ."\nfunction __extension__wrapper__(){\n"
            .$joinedFiles
            ."\n};\nvar script = document.createElement('script');\n"
            ."script.innerHTML = __extension__wrapper__.toString().replace(/^.*?\{|\}.*?$/g, '');\n"
            ."document.getElementsByTagName('head')[0].appendChild(script);\n";
    file_put_contents($path.DS."release".DS."FireFox.user.js", $result);
};

function createForOpera($path, $joinedFiles) {
    $result= file_get_contents($path.DS."release".DS."FireFox.user.js");
    file_put_contents($path.DS."release".DS."Opera.user.js", $result);
}

function getDataURL($imgPath) {
    if (preg_match("/(?:^|\/)\.\.(?:$|\/)/", $imgPath)) return "403";
    return "data:image/".array_pop(explode(".", $imgPath)).";base64,".
           base64_encode(file_get_contents($imgPath));
}

function cidr_match($ip, $ranges) {
    $ranges = (array) $ranges;
    foreach ($ranges as $range) {
        list($subnet, $mask) = explode('/', $range);
        if((ip2long($ip) & ~((1 << (32 - $mask)) - 1)) == ip2long($subnet)) {
            return true;
        }
    }
    return false;
}

function getFolderList($path) {
    $result= Array();
    if (is_dir($path)) {
        if ($dh=opendir($path)) {
            while (($f=readdir($dh)) !==false) if ($f!="." && $f!="..") {
                $result[]= $path.DS.$f;
                if (is_dir($path.DS.$f)) {
                    $recur= getFolderList($path.DS.$f);
                    foreach ($recur as $k=>$v) {
                        $result[]= $v;
                    };
                };
            };
        };
    };
    return $result;
};

function filterRegexArray($arr, $regexValue=null, $regexKey=null, $keySafe=false, $operator="&&") {
    $result= Array();
    foreach ($arr as $k=>$v) {
        if ($regexValue) {
            $fValue= preg_match($regexValue, $v);
        } else {
            $fValue= true;
        };
        if ($regexKey) {
            $fKey= preg_match($regexKey, $k);
        } else {
            $fKey= true;
        };
        if (eval("return $fValue $operator $fKey;")) if ($keySafe) {
            $result[$k]=$v;
        } else {
            $result[]= $v;
        };
    };
    return $result;
};
?></pre>
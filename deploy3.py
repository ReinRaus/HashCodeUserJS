# -*- coding:utf-8 -*-

import os, re, json, sqlite3, codecs, time, deployconfig as config, base64, sys
sys.path+= ['e:/develop/python33/Lib/site-packages/win32/', 'e:/develop/python33/Lib/site-packages/win32/lib/']

def joinFiles():
    global addons
    result="\nvar __addons=['"+"', '".join(["__"+k[::-1].replace("sj.", "", 1)[::-1] for k in addons])+"'];\n"
    with open("userjsloader.js") as f:
        result+= f.read()+"\n"
    for i in addons:
        with open("./addons/"+i, "r") as f:
            result+=f.read()+"\n"
    regex= re.compile(r'\[DEPLOY:image64\](.*?)\[/DEPLOY\]', re.I)
    match= regex.search(result)
    while match:
        result= result[:match.start()]+getDataURL(match.groups(1)[0])+result[match.end():]
        match= regex.search(result, match.end())
    return result

def getDataURL(imgPath):
    result= "data:image/"+imgPath.split(".")[-1]+";base64,"
    with open("./"+imgPath, "br") as f:
        return result+base64.b64encode(f.read()).decode('ascii')

def createForChrome():
    global joinedFiles
    with open("chromejson.txt") as f:
        chromeJson= json.loads( f.read() )
    chromeJson["html"]="<script>\n"+joinedFiles+"\n</script>"
    with open("./release/ChromeDump.json", "w") as f:
        f.write(json.dumps(chromeJson))
    if config.chromeAutoUpdate:
        chromeUpdateDb()

def createForFireFox():
    global joinedFiles
    with open("userjsheaders.txt", "br") as f:
        with open("./release/FireFox.user.js", "bw") as f2:
            f2.write(f.read()+b"\n")
            f2.write(b"function __extension__wrapper__(){\n")
            f2.write(joinedFiles.encode('utf-8'))
            f2.write(b"\n};\nvar script = document.createElement('script');\n")
            f2.write(b"script.innerHTML = __extension__wrapper__.toString().replace(/^.*?\{|\}.*?$/g, '');\n")
            f2.write(b"document.getElementsByTagName('head')[0].appendChild(script);\n")

def createForOpera(): # фиксы для оперы, пока их нет, но могут быть
    global joinedFiles
    with open("./release/FireFox.user.js", "br") as f:
        with open("./release/Opera.user.js", "bw") as f2:
            f2.write(f.read())

def chromeUpdateDb():
    conn= sqlite3.connect(config.chromePathToDb)
    c= conn.cursor()
    c.execute("SELECT value FROM ItemTable WHERE key='aaa.pweb.filters'")
    c.execute("SELECT value FROM ItemTable WHERE key='aaa.pweb.filters'")
    localstorage= json.loads(c.fetchone()[0].decode("utf-16"))
    inserted= False
    with open("./release/ChromeDump.json", "r") as f:
        newJson= json.loads(f.read())
    for i in range(len(localstorage)):
        if localstorage[i]["name"]=="HashCode Addons":
            localstorage[i]=newJson
            inserted= True
            break
    if not inserted:
        localstorage.append(newJson)
    c.execute("UPDATE ItemTable SET value=? WHERE key='aaa.pweb.filters'", [json.dumps(localstorage).encode("utf-16LE")] )
    c.execute("UPDATE ItemTable SET value=? WHERE key='aaa.pweb.filters_update_time'", [str(int(time.time()*1000)).encode("utf-16LE")] )
    conn.commit()
    c.close()
    conn.close()
    
addons= list(filter( lambda x: x[-3:]==".js", os.listdir("./addons/") ))
joinedFiles= joinFiles()
createForChrome()
createForFireFox()
createForOpera()

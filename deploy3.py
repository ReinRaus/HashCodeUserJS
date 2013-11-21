# -*- coding:utf-8 -*-

import os, re, json, sqlite3, codecs, time, base64, sys

def joinFiles():
    global addons
    result="\n"
    with open("userjsloader.js", "rb") as f:
        result+= deleteBOM(f.read( ).decode('utf-8'))+"\n\n__addons=[\n\n"
    for i in addons:
        with open("./addons/"+i, "rb") as f:
            result+= deleteBOM(f.read().decode('utf-8'))+",\n\n"
    result+= "]; // end addons\n\n"
    regex= re.compile(r'\[DEPLOY:image64\](.*?)\[/DEPLOY\]', re.I)
    match= regex.search(result)
    while match:
        result= result[:match.start()]+getDataURL(match.groups(1)[0])+result[match.end():]
        match= regex.search(result, match.end())
    return result

def deleteBOM(text):
    return text
    if text[:3]=="п»ї":
        return text[3:]
    else:
        return text
    
def getDataURL(imgPath):
    result= "data:image/"+imgPath.split(".")[-1]+";base64,"
    with open("./"+imgPath, "br") as f:
        return result+base64.b64encode(f.read()).decode('ascii')

def createForChrome():
    global joinedFiles
    with open("chromejson.txt") as f:
        chromeJson= json.loads( deleteBOM(f.read()) )
    chromeJson["html"]="<script>\n"+joinedFiles+"\n</script>"
    with open("./release/ChromeDump.json", "w") as f:
        f.write(json.dumps(chromeJson))

def createForFireFox():
    global joinedFiles
    with open("userjsheaders.txt", "br") as f:
        with open("./release/FireFox.user.js", "bw") as f2:
            f2.write(f.read()+b"\n") # BOM нужно оставить
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

    
addons= list(filter( lambda x: x[-3:]==".js", os.listdir("./addons/") ))
joinedFiles= joinFiles()
createForChrome()
createForFireFox()
createForOpera()

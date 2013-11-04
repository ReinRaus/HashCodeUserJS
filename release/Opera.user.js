// ==UserScript==
// @name            HashCode Addons 
// @include         http://hashcode.ru/*
// @include         http://meta.hashcode.ru/*
// ==/UserScript==

function __extension__wrapper__(){

var __addons=['__autocompleteWithSelection'];
var __addonsStarted= false;

function __toogleEnabled(name, value){
    value= value? "yes":"no";
    localStorage["__Enable__"+name]= value;
};

function __addonLoader() {
    __addonsStarted= true;
    var div1= document.createElement('div');
    div1.style.display="none";
    div1.id= "__div_options";
    var htmlDiv="<TABLE>";
    for (var i in __addons) {
        htmlDiv+="<TR><TD><INPUT type='checkbox' onclick='__toogleEnabled(\""+__addons[i]+"\", this.checked);' ";
        if (localStorage["__Enable__"+__addons[i]]=="yes") htmlDiv+="checked ";
        htmlDiv+="></TD><TD>"+__addons[i].replace("__", "")+"</TD></TR>";
    };
    htmlDiv+="</TABLE>";
    //console.log(htmlDiv);
    div1.innerHTML=htmlDiv;
    var img=document.createElement('img');
    img.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAIAAAADnC86AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACjSURBVFhH7dNBCsMwEEPRnif36c1yVe+rYBGKVpJNbALzURfNQB8E+mmjHd8T45e8QbirM/YI/K/28ZBUsJOoGA9JBTuJivGQVLCTqBgPSQU7iYrxkPQeWMh7PNsRll95dF28YDks2AXLo2XbB2971fgstru4++8UJSTGQ1LBTqJiPCQV7CQqxkNSwU6iYjwkFewkKsZD0qtgNKmiQRjNqK21H9+y+LNChwLDAAAAAElFTkSuQmCC";
    img.style.width=img.style.height="16px";
    img.id= "__imageIcon";
    img.onclick= function(e) {
        if (div1.style.display=="none") {
            div1.style.display="block";
        } else {
            div1.style.display="none";
        };
    };
    $(img).insertBefore($("#searchBar div a")[0]);
    $(div1).insertBefore(img);
    for (var i in __addons) {
        if (localStorage["__Enable__"+__addons[i]]=="yes") {
            window[__addons[i]]();
        }
    }
};

document.addEventListener( "DOMContentLoaded", __addonLoader, false );
var __check__Started= function(){
    if (!__addonsStarted) __addonLoader();
};
window.setTimeout(__check__Started, 300);


function __autocompleteWithSelection() {

    var arrayUnique = function(a) { // оставляет в массиве только уникальные значения
        return a.reduce(function(p, c) {
            if (p.indexOf(c) < 0) p.push(c);
            return p;
        }, []);
    };
    
    // target- поле ввода, text- полное совпадение, matchText- частичное совпадение, например
    // имея на входе "test" и "te" будет выделено "st" te[st]
    var completeSelection= function( target, text, matchText) {
        target.value=target.value.substring(0, target.adduser+1)+text+target.value.substring(target.selectionEnd);
        target.selectionStart= target.adduser+matchText.length+1;
        target.selectionEnd  = target.adduser+text.length+1;
        // console.log([value, target.adduser, target.selectionStart]);
    };
    
    var regexUsers = new RegExp("<a\\s[^>]*href\\s*=\\s*\"\/users\/\\d(?![^>]*\/(?:reputation|subscriptions)\/)[^>]*>([\\s\\S]*?)<\/a>", 'ig');
    var users = Array();
    var usersLow= Array()
    var regexLoginClear1= new RegExp("(?:^@)|\\s*\u2666+", 'ig');
    var regexLoginClear2= new RegExp("<span[^>]*>([^<]+)<\/span>", "ig");
    // сначала находим все логины, которые есть на странице и оставляем из них только уникальные в нижнем регистре
    while ( (match=regexUsers.exec(document.body.innerHTML)) != null ) {
        var userLogin= match[1].replace(regexLoginClear2, "$1").replace(regexLoginClear1, '');
        usersLow.push(userLogin.toLowerCase());
        users[userLogin.toLowerCase()]=userLogin;
    };
    usersLow= arrayUnique(usersLow);
    // если курсор ушел влево от собаки или на 30 символов правее, то перестаем отслеживать
    $("textarea").bind("keydown", function(e) {
        if (e.target.adduser>=e.target.selectionEnd || e.target.adduser+30<e.target.selectionStart) e.target.adduser= null;
    });
    $("textarea").bind("keypress", function(e){
            // нажали собаку- начали отслеживать
            if (e.charCode==64) {
                e.target.adduser=e.target.selectionStart;
            }
            // пробел
            if (e.charCode==32 && e.target.adduser!=null) {
                short=e.target.value.substring(e.target.adduser+1, e.target.selectionStart).toLowerCase();
                long= e.target.value.substring(e.target.adduser+1, e.target.selectionEnd);
                var find= null;
                nextFindIsResult= false;
                for (var i in usersLow) {
                    if (usersLow[i]==long.toLowerCase()) {
                        nextFindIsResult=true;
                        continue;
                    }
                    if (nextFindIsResult && usersLow[i].indexOf(short)==0) { 
                        find= users[usersLow[i]];
                        break;
                    }
                }
                if (nextFindIsResult && find==null) {
                    for (var i in usersLow) {
                        if (usersLow[i].indexOf(short)==0) {
                            find= users[usersLow[i]];
                            break;
                        }
                    }
                }
                //console.log([find, long, short]);
                if (find) { // если совпадение одно, то добавляем запятую и переносим курсор
                    if (find==long) find+=",";
                    completeSelection(e.target, find, short);
                    if (find==long+",") {
                        e.target.selectionStart=e.target.selectionEnd;
                        return true;
                    }
                    return false;
                }
            };
            // кнопки отличные от пробела и собаки, пытаемся найти совпадение
            if (e.target.adduser!=null && e.target.adduser<e.target.selectionStart) {
                var short= (e.target.value.substring(e.target.adduser+1, e.target.selectionStart)+String.fromCharCode(e.charCode)).toLowerCase();
                //console.log(short);
                var find= null;
                for (var i in usersLow) {
                    if (usersLow[i].indexOf(short)==0) {
                        find= users[usersLow[i]];
                        break;
                    }
                }
                if (find) {
                    completeSelection(e.target, find, short);
                    return false;
                }
            }
        }
    );
    console.log(users);
};


};
var script = document.createElement('script');
script.innerHTML = __extension__wrapper__.toString().replace(/^.*?\{|\}.*?$/g, '');
document.getElementsByTagName('head')[0].appendChild(script);

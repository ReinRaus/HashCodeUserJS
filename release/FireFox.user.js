// ==UserScript==
// @name            HashCode Addons 
// @include         http://hashcode.ru/*
// @include         http://*.hashcode.ru/*
// @include         http://bitcode.ru/*
// @include         http://rootcode.ru/*
// @include         http://*.sezn.ru/*
// @include         http://sezn.ru/*
// ==/UserScript==

function __extension__wrapper__(){

var __addons=['__autocompleteWithLinks', '__autocompleteWithSelection', '__newAnswersAndComments'];
﻿var __addonsStarted= false;

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


﻿// @author Yura Ivanov
function __autocompleteWithLinks() {
    if (typeof $ != 'undefined') {
        var currentLogin= $("#searchBar a")[0].innerHTML.toLowerCase(); // логин самого участника
        if ($("#question-table").length) {
            var users = [];
            var a = "";
            function addUser(name, link, type) {
                var regexClean= new RegExp("(?:^@)|\\s*\u2666+", 'ig');
                name = name.replace(regexClean, '');
                if (users.indexOf(link) < 0 && name.toLowerCase()!=currentLogin && name!="") {
                    users.push(link);
                    return "<li><a href='#' class='user_quote'>@" + name
                            + "</a> - " + type + "</li>";
                } else {
                    return "";
                }
            }
            $("#question-table [itemprop='author'] a").each(function(idx, u) {
                var $u = $(u);
                var link = $u.attr("href");
                var name = $u.text();
                a += addUser(name, link, "топикстартер");
            });
            $("[itemprop='comment'] [itemprop='author'] a").each(
                    function(idx, u) {
                        var $u = $(u);
                        var link = $u.attr("href");
                        var name = $u.text();
                        a += addUser(name, link, "ответил");
                    });
            $("a.userinfo").each(function(idx, u) {
                var $u = $(u);
                var link = $u.attr("href");
                var name = $u.text();
                a += addUser(name, link, "комментировал");
            });
            $("#main-body a[href^='\/users\/']").each(function(idx, u) {
                var $u = $(u);
                var link = $u.attr("href");
                var name = $u.text();
                a += addUser(name, link, "был упомянут");
            });
            var d = $("<div class='users_menu' style=''><ul>" + a
                    + "</ul></div>");
            d.insertBefore($("#editor, .commentBox"));
            $(".user_quote").click(
                    function(e) {
                        e.preventDefault();
                        var myField = $("#editor, .commentBox", $(this)
                                .closest('.users_menu').parent())[0];
                        if (myField.selectionStart
                                || myField.selectionStart == '0') {
                            var startPos = myField.selectionStart;
                            var endPos = myField.selectionEnd;
                            var myValue = (startPos > 0
                                    && myField.value.substring(startPos - 1,
                                            startPos) != ' ' ? ' ' : '')
                                    + $(this).text() + ', ';
                            myField.value = myField.value
                                    .substring(0, startPos)
                                    + myValue
                                    + myField.value.substring(endPos,
                                            myField.value.length);
                            myField.selectionStart= myField.selectionEnd= startPos+ myValue.length;
                        } else {
                            myField.value += myValue;
                            myField.selectionStart= myField.selectionEnd= myField.value.length;
                        }
                        myField.focus();
                    });
        }
    }
};
﻿function __autocompleteWithSelection() {

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
    
    var currentLogin= $("#searchBar a")[0].innerHTML.toLowerCase(); // логин самого участника
    var regexUsers = new RegExp("<a\\s[^>]*href\\s*=\\s*\"\/users\/\\d(?![^>]*\/(?:reputation|subscriptions)\/)[^>]*>([\\s\\S]*?)<\/a>", 'ig');
    var users = Array();
    var usersLow= Array()
    var regexLoginClear1= new RegExp("(?:^@)|\\s*\u2666+", 'ig');
    var regexLoginClear2= new RegExp("<span[^>]*>([^<]+)<\/span>", "ig");
    // сначала находим все логины, которые есть на странице и оставляем из них только уникальные в нижнем регистре
    while ( (match=regexUsers.exec(document.body.innerHTML)) != null ) {
        var userLogin= match[1].replace(regexLoginClear2, "$1").replace(regexLoginClear1, '');
        var userLoginLow= userLogin.toLowerCase();
        if (currentLogin != userLoginLow) { // свой логин исключаем
            usersLow.push(userLoginLow);
            users[userLoginLow]=userLogin;
        }
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
                var find= null; // результат поика в массиве
                nextFindIsResult= (short=="" && long==""); // для прокрутки пробелом, если пробел сразу после собаки, и ничем не дополнено, то дополняем первым значением из массива
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
                if (nextFindIsResult && (find==null || find=="")) {
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
};

// @author Yura Ivanov
function __newAnswersAndComments() {
  var regexURL= new RegExp("^https?://[^/]+/(?:questions|research)/.*$", "i");
  if (!regexURL.test(location.href)) return; // если не вопрос, то не работаем
  var qid = $("a.post-vote.up").attr("href").replace('/vote/', '').replace('/up', '');
  var qopened = window.localStorage.getItem('__opened_' + qid);
  var readanswers = JSON.parse(window.localStorage.getItem('__read_answers_' + qid) || "[]");
  var nowanswers = [];
  $(".answer").each(function(i, an) {
    var anid = $(an).attr('id').replace('answer-container-', '');
    nowanswers.push(anid);
    if (readanswers.indexOf(anid) < 0) {
      if (qopened) {
        $(an).css("border-left", "solid #5B9058 3px");
      }
    }
  });
  var readcomments = JSON.parse(window.localStorage.getItem('__read_comments_' + qid) || "[]");
  var nowcomments = [];
  $(".comment").each(function(i, cm) {
    var cmid = $(cm).attr('id').replace('comment-', '');
    nowcomments.push(cmid);
    if (readcomments.indexOf(cmid) < 0) {
      if (qopened) {
        $(cm).css("border-left", "solid #5B9058 3px");
      }
    }
  });
  var $nav = $("<div class='focusedAnswer' style='border:solid #5B9058 3px;position:fixed;top:31px;left:40px;padding:10px'></div>");
  $nav.append("<span>Ответы:</span>" + "<ul>" + "<li>Всего:" + nowanswers.length + "</li>" + "<li>Новых:" + (nowanswers.length - readanswers.length) + "</li>" + "</ul>" + "<span>Комментарии:</span>" + "<ul>" + "<li>Всего:" + nowcomments.length + "</li>" + "<li>Новых:" + (nowcomments.length - readcomments.length) + "</li>" + "</ul>");
  $nav.appendTo(document.body);
  window.localStorage.setItem('__read_answers_' + qid, JSON.stringify(nowanswers));
  window.localStorage.setItem('__read_comments_' + qid, JSON.stringify(nowcomments));
  window.localStorage.setItem('__opened_' + qid, true);
}

};
var script = document.createElement('script');
script.innerHTML = __extension__wrapper__.toString().replace(/^.*?\{|\}.*?$/g, '');
document.getElementsByTagName('head')[0].appendChild(script);

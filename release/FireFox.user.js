// ==UserScript==
// @name            HashCode Addons 
// @include         http://hashcode.ru/*
// @include         http://*.hashcode.ru/*
// @include         http://bitcode.ru/*
// @include         http://rootcode.ru/*
// @include         http://*.sezn.ru/*
// ==/UserScript==

function __extension__wrapper__(){

var __addons=['__autocompleteWithLinks', '__autocompleteWithSelection', '__collapseLongCodeBlock', '__newAnswersAndComments', '__sortBetter'];
﻿var __addonsStarted= false;

function __toogleEnabled(name, value){
    value= value? "yes":"no";
    localStorage["__Enable__"+name]= value;
};

function __openSettingsPage(addonName, targetItem) {
    var escapeHtml= function(text) {
      return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
    };
    $("#__div_options .addons-leftpanel tr").css("background-color", "#EEEEEE");
    targetItem.style.backgroundColor="#3060a8";
    $(".addons-page").css("display", "none");
    if ($("#__addonspage"+addonName).html()=="") {
        var html="";
        var settings= __addonsSettings.settings[addonName];
        if (settings==undefined) {
             html= "Настройки отсутствуют";
        } else {
             if (settings.title!=undefined) html+="<h3>"+settings.title+"</h3>";
             if (settings.description!=undefined) html+="<div class='addons-description'>"+settings.description+"</div>";
             if (settings.order!=undefined){
                 html+="<table>";
                 for (var i=0; i<settings.order.length; i++) {
                     var paramName= settings.order[i];
                     var paramId= "__addonsSettingsValue"+addonName+"_"+paramName;
                     var param= settings.exports[paramName];
                     html+="<tr><td>"+param.title+"</td><td>";
                     if (param.type=='text') {
                         html+="<INPUT type='text' value='"+escapeHtml(param.value)+"' name='"+paramId+"' >";
                     } else if (param.type=='checkbox') {
                         html+="<INPUT type='checkbox' name='"+paramId+"' ";
                         if (param.value!='0' && param.value!=0) html+="checked ";
                         html+=">";
                     } else if (param.type=='radio'){
                         for (var j in param.options) {
                             html+="<LABEL><INPUT type='radio' value='"+escapeHtml(j)+"' name='"+paramId+"' ";
                             if (j==param.value) html+="checked ";
                             html+=">"+param.options[j]+"</LABEL>";
                         }
                     } else if (param.type=='select') {
                         html+="<SELECT name='"+paramId+"' value='"+escapeHtml(param.value)+"'>";
                         for (var j in param.options) {
                             html+="<OPTION value='"+escapeHtml(j)+"' ";
                             if (j==param.value) html+= "selected ";
                             html+=">"+param.options[j]+"</OPTION>";
                         };
                         html+="</SELECT>";
                     };
                     html+="</td></tr>";
                 };
                 html+="</table>";
             };
        };
        $("#__addonspage"+addonName).html(html);
    }
    $("#__addonspage"+addonName).css("display", "block");
};

function __saveAddonsSettings() {
    for (var addonName in __addonsSettings.settings) {
        var settings= __addonsSettings.settings[addonName];
        for (var i in settings.exports) {
            var paramId= "__addonsSettingsValue"+addonName+"_"+i;
            var param= settings.exports[i];
            var params= document.getElementsByName(paramId);
            if (params.length>0) {
                if (param.type=='text' || param.type=='select') {
                    var value= params[0].value;
                } else if (param.type=='checkbox') {
                    var value= params[0].checked?'1':'0';
                } else if (param.type=='radio') {
                    for (var j=0; j<params.length; j++) {
                        if (params[j].checked) {
                            var value= params[j].value;
                            break;
                        }
                    }
                }
                //console.log([addonName, i, value]);
                __addonsSettings.settings[addonName].exports[i].value= value;
            }
        }
    };
    __addonsSettings.set();
    var sezn='hashcode.ru math.hashcode.ru careers.hashcode.ru russ.hashcode.ru games.sezn.ru turism.sezn.ru foto.sezn.ru hm.sezn.ru meta.hashcode.ru admin.hashcode.ru user.hashcode.ru phys.sezn.ru english.sezn.ru'.split(' ');
    var thisDomain= location.href.replace(new RegExp("^https?://([^/]+)/.*$", "i"), "\1");
    var frames={};
    window.addEventListener("message", function(message, url){
        if (message.data.substring(0, 13)=="SettingsSets:"){
            frames[message.data.substring(13)][1]=true;
        }
    });
    $("#__div_options").html("<h3>Идет сохранение настроек, это может занять некоторое время</h3><br/>Сохранено <span id='__addons_span_count'>0</span> сайтов из "+sezn.length);
    for (var i=0; i<sezn.length; i++) {
        if (location.hostname!=sezn[i]){
            var frame= document.createElement("iframe");
            frame.width=frame.height='1px';
            frame.onload= function(){
                var iframe=this;
                window.setTimeout(function(){
                        iframe.contentWindow.postMessage("SetSettings:"+JSON.stringify(__addonsSettings.settings), "*");
                    }, 1500, false);
            };
            frame.src='http://'+sezn[i]+"/about/";
            frames[sezn[i]]=[frame, false];
            document.body.appendChild(frame);
        } else {
            frames[sezn[i]]=[null, true];
        }
    };
    window.setInterval(function(){
        var count=0;
        for (var i=0; i<sezn.length; i++) {
            if (frames[sezn[i]][1]) {
                count++;
            }
        };
        $("#__addons_span_count").html(count);
        if (count==sezn.length) {
            frames[sezn[0]][1]= false; // чтобы не перезагружало бесконечно
            location.reload();
        };
    }, 1000, false);
};
function __addonsAddCSS (csstext) {
    var head = document.getElementsByTagName('head')[0]; 
    var newCss = document.createElement('style'); 
    newCss.type = "text/css"; 
    newCss.innerHTML = csstext; 
    head.appendChild(newCss); 
} 

var __addonsSettings= new (function() {
    try {
        this.settings= JSON.parse( localStorage['__addonsSettings'] );
    } catch(e) {
        console.log(e);
        this.settings= {};
        localStorage['__addonsSettings']= JSON.stringify(this.settings);
    };
    
    this.get= function (addonName) {
         if (this.settings[addonName] != undefined ) {
              return this.settings[addonName];
         } else {
              return null;
         }
    };
    
    this.set= function (addonName, settings) {
        if (addonName!=undefined && settings!=undefined) this.settings[addonName]= settings;
        localStorage['__addonsSettings']= JSON.stringify(this.settings);
    };
    
    this.getUpdatedSettings= function( addonName, defaultSettings ) { // сличает старые настройки с новыми (дефольтными) и возвращает обновленные  (только export)
         if (this.settings[addonName] != undefined ) {
              var oldSettings= this.settings[addonName]
              var newExports= {};
              var updated= false; // если что-то изменилось, то нужно сохранить
              for (var i in defaultSettings.exports) {
                  if (oldSettings.exports[i] == undefined) { // если такой настройки нет в старой (новая настройка)
                      newExports[i]= defaultSettings.exports[i];
                      updated= true;
                  } else {
                      if (defaultSettings.exports[i].type   !=oldSettings.exports[i].type ||
                          defaultSettings.exports[i].title  !=oldSettings.exports[i].title ||
                          defaultSettings.exports[i].options!=oldSettings.exports[i].options) {
                              updated=true; // сравнили все, кроме value и есть несовпадения
                      };
                      newExports[i]= defaultSettings.exports[i];
                      newExports[i].value= oldSettings.exports[i].value; 
                  }
              }
              for (var i in oldSettings.exports) {
                  if (newExports[i]==undefined) updated= true; // ключи, которых нет в новых дефольтных
              };
              if (oldSettings.title!= defaultSettings.title || oldSettings.order!= defaultSettings.order || oldSettings.description!= defaultSettings.description) {
                  oldSettings.title= defaultSettings.title;
                  oldSettings.order= defaultSettings.order;
                  oldSettings.description= defaultSettings.description;
                  updated=true;
              };
              oldSettings.exports= newExports;
              if (updated) this.set( addonName, oldSettings);
              return oldSettings;
         } else {
              this.set(addonName, defaultSettings);
              return defaultSettings;
         }
    };
})();

function __addonLoader() {
    __addonsStarted= true;
    window.addEventListener("message", function(message, url){
        if (message.data.substring(0, 12)=="SetSettings:"){
            var settings= JSON.parse(message.data.substring(12));
            for (var addonName in settings) {
                if (__addonsSettings.settings[addonName]== undefined) __addonsSettings.settings[addonName]={};
                __addonsSettings.settings[addonName].exports=settings[addonName].exports;
                __addonsSettings.settings[addonName].title=settings[addonName].title;
                __addonsSettings.settings[addonName].description=settings[addonName].description;
                __addonsSettings.settings[addonName].order=settings[addonName].order;
            }
            __addonsSettings.set();
            message.source.postMessage("SettingsSets:"+location.hostname, '*');
        }
        }, false);
    var css= "div.addons-settings {position: absolute; display:none; width:50%; height:50%; background-color: #EEEEEE; border:1px solid blue; max-width:51%; max-height:51%;} div.addons-overflow {overflow-y:auto; oferflow-x:hidden; height:90%; max-height:91%}; .addons-leftpanel {}; div.addons-itemlist {margin-left:0px; padding-left:0px; width:100%} .cursor-pointer {cursor:pointer} .addons-page {display:none}";
    __addonsAddCSS(css);
    
    var img=document.createElement('img');
    img.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAIAAAADnC86AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACjSURBVFhH7dNBCsMwEEPRnif36c1yVe+rYBGKVpJNbALzURfNQB8E+mmjHd8T45e8QbirM/YI/K/28ZBUsJOoGA9JBTuJivGQVLCTqBgPSQU7iYrxkPQeWMh7PNsRll95dF28YDks2AXLo2XbB2971fgstru4++8UJSTGQ1LBTqJiPCQV7CQqxkNSwU6iYjwkFewkKsZD0qtgNKmiQRjNqK21H9+y+LNChwLDAAAAAElFTkSuQmCC";
    img.className='cursor-pointer';
    img.style.width=img.style.height="16px";
    img.id= "__imageIcon";
    img.onclick= function(e) {
        if (div1.style.display=="block") {
            div1.style.display="none";
        } else {
            div1.style.display="block";
        };
    };
    $(img).insertBefore($("#searchBar div a")[0]);
    var imgRect= img.getBoundingClientRect();
    
    var div1= document.createElement("div");
    div1.className="addons-settings";
    div1.id= "__div_options";
    var htmlDiv="<DIV class='addons-overflow'><TABLE><TR><TD width='35%' valign=top><DIV class='addons-leftpanel'><TABLE cellspacing=0>";
    var htmlDiv2="";
    for (var i in __addons) {
        htmlDiv+="<TR class='addons-listitem' onclick='__openSettingsPage(\""+__addons[i]+"\", this);'><TD onclick='event.stopPropagation();'><INPUT type='checkbox' onclick='__toogleEnabled(\""+__addons[i]+"\", this.checked);' ";
        if (localStorage["__Enable__"+__addons[i]]=="yes") htmlDiv+="checked ";
        try {
            var name= __addonsSettings.settings[__addons[i]].title;
        } catch(e) {
            var name= __addons[i].replace("__", "");
        };
        htmlDiv+="></TD><TD class='cursor-pointer'>"+name+"</TD></TR>";
        htmlDiv2+="<DIV class='addons-page' id='__addonspage"+__addons[i]+"'></DIV>";
    };
    htmlDiv+="</TABLE></DIV></TD><TD width='*' valign=top>"+htmlDiv2+"</TD></TR></TABLE></DIV><BUTTON onclick='__saveAddonsSettings()'>Сохранить</BUTTON> <BUTTON onclick='this.parentNode.style.display=\"none\";'>Закрыть</BUTTON>";
    //console.log(htmlDiv);
    div1.style.top=(imgRect.top+imgRect.height+5)+"px";
    div1.style.left=(imgRect.left-150)+"px";
    div1.innerHTML=htmlDiv;
    document.body.appendChild(div1);
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
    var defaultSettings= {
        title: 'Список участников',
        description: 'Выводит рядом с полями для ввода ответа и комментариев плашку с никами участников, которые принимали участие в дискуссии текущего вопроса.<BR/>Вставка ника участника в поле ввода в один клик.',
        /*exports: {
        },
        order: []*/
    };
    var settings= __addonsSettings.getUpdatedSettings( arguments.callee.name, defaultSettings );
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
    var defaultSettings= {
        title: 'Автодополнение собаки по пробелу',
        description: 'Дополняет в поле ввода собаку ником участника, отметившегося на странице. Если дополнить можно несколькими вариантами, то пробел перебирает возможные продолжения. Если просто ввести собаку и нажимать пробел, то будут перебираться все ники. Если возможное продолжение только одно, то курсор переносится за него. Чтобы просто ввести собаку нужно нажать собаку и клавиши влево-вправо.',
        /*exports: {
            test3: {type:'text', value:'sdf', title:'Введите текст'},
            test2:  {type:'checkbox', value:'1', title:'Введите текст'},
            test4: {type:'radio', value:'2', title:'radio', options:{'1':'opt1', '2':'opt2'} },
            test1: {type:'select', value:'2', title:'radio', options:{'1':'sel1', '2':'sel2'} }
        },
        order: ['test2', 'test4', 'test3', 'test1']*/
    };
    var settings= __addonsSettings.getUpdatedSettings( arguments.callee.name, defaultSettings );
    
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

﻿function __collapseLongCodeBlock() {
    var defaultSettings= {
        title: 'Сворачивание длинного кода',
        description: 'К слишком большим участкам кода добавляется полоса прокрутки.',
        exports: {
            "maxheight": {"type":"text", "value":"400px", "title":"Ограничить максимальную высоту значением:"},
            "yscroll": {"type":"checkbox", "value":"0", "title":"Добавить горизонтальную прокрутку"}
        },
        order: ["maxheight", "yscroll"]
    };
    var settings= __addonsSettings.getUpdatedSettings( arguments.callee.name, defaultSettings );
    $code= $(".prettyprint");
    if ($code.length>0) {
        $code.css({
            "height":"auto",
            "max-height": settings.exports.maxheight.value,
            "overflow-y":"auto"});
        if (settings.exports.yscroll.value=="1"){
            $code.css({
                "word-wrap":"normal",
                "white-space":"pre"});
        };
    };
};
// @author Yura Ivanov
function __newAnswersAndComments() {
  var defaultSettings= {
        title: 'Подсветка новых сообщений',
        description: 'Новые ответы и комментарии выделяются цветом, что делает поиск обновлений в вопросе значительно быстрее.',
        /*exports: {
        },
        order: []*/
    };
  var settings= __addonsSettings.getUpdatedSettings( arguments.callee.name, defaultSettings );
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
 var $nav = $("<div class='boxC'></div>");
 $nav.append("<p>ответы<br>" + "<strong>всего<span style=\"letter-spacing: 0.8ex;\">&nbsp</span>: " + nowanswers.length + "</strong><br>" + "<strong>новых : " + (nowanswers.length - readanswers.length) + "</strong><br></p>" + "<p>комментарии<br>" + "<strong>всего<span style=\"letter-spacing: 0.8ex;\">&nbsp</span>: " + nowcomments.length + "</strong><br>" + "<strong>новых : " + (nowcomments.length - readcomments.length) + "</strong><br></p>");
 $nav.insertAfter(document.getElementById('CARight').children[0]);
 window.localStorage.setItem('__read_answers_' + qid, JSON.stringify(nowanswers));
 window.localStorage.setItem('__read_comments_' + qid, JSON.stringify(nowcomments));
 window.localStorage.setItem('__opened_' + qid, true);
}

﻿function __sortBetter() {
        var defaultSettings= {
            title: 'Улучшенная сортировка',
            description: 'Cортирует списки вопросов<BR/><UL><LI>Те у которых последний автор пользователь - в самый низ</LI><LI>интересные (из тэгов) в начало</LI><LI>сортируем интересные - сначала по количеству ответов, потом, по количеству голосов</LI></UL>',
            /*exports: {
            },
            order: []*/
        };
        var settings= __addonsSettings.getUpdatedSettings( arguments.callee.name, defaultSettings );
        var userlink=$('#searchBar a').first().attr('href');
        $('#listA')
                .prepend(
                                $('.short-summary.tagged-interesting')
                                        .sort(sortQuestions)
                        )
                .append($('.short-summary').has('a[href="' +userlink+ '"'));

        function sortQuestions(a,b)
        {
                var $a=$(a),
                    $b=$(b);
                return  (value($a,'status')-value($b,'status')) ||
                        (value($b,'votes')-value($a,'votes'));

                function value($s,Class) {
                        return parseInt($s.find('.'+Class+' .item-count').text());
                }
        }
}


};
var script = document.createElement('script');
script.innerHTML = __extension__wrapper__.toString().replace(/^.*?\{|\}.*?$/g, '');
document.getElementsByTagName('head')[0].appendChild(script);

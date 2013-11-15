// ==UserScript==
// @name            HashCode Addons 
// @include         http://hashcode.ru/*
// @include         http://*.hashcode.ru/*
// @include         http://bitcode.ru/*
// @include         http://rootcode.ru/*
// @include         http://*.sezn.ru/*
// ==/UserScript==

function __extension__wrapper__(){

var __addons=['__autocompleteWithLinks', '__syntaxHighlight', '__collapseLongCodeBlock', '__newAnswersAndComments', '__sortBetter', '__autocompleteWithSelection'];
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
    if (typeof $ == 'undefined') return;
    clearInterval(__checkStartedInterval);
    __addonsStarted= true;
    var build= parseInt("58");
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
var __checkStartedInterval= window.setInterval(__check__Started, 50);


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
};
﻿function __syntaxHighlight(){
  var defaultSettings= {
        title: 'Подсветка синтаксиса SyntaxHighlighter\'ом',
        description: 'Автопределение языка подсветки по тэгам вопроса\nПоддержка языков: text/plain, html+js, js, c/c++/objective-c, c#, ruby, python, php, pascal/delphi/freepascal',
        /*exports: {
        },
        order: []*/
    };
  var settings= __addonsSettings.getUpdatedSettings( arguments.callee.name, defaultSettings );
  var regexURL= new RegExp("^https?://[^/]+/(?:questions|research)/.+$", "i");
  if (!regexURL.test(location.href)) return; // если не вопрос, то не работаем
  function changeStyles(rule){
    var ss = document.styleSheets[document.styleSheets.length-1];
    ss.insertRule(rule,ss.cssRules.length);
  }
  // http://alexgorbatchev.com/SyntaxHighlighter/
  // shCore.min.js
  eval(function(e,t,r,i,s,a){if(s=function(e){return(t>e?"":s(parseInt(e/t)))+((e%=t)>35?String.fromCharCode(e+29):e.toString(36))},!"".replace(/^/,String)){for(;r--;)a[s(r)]=i[r]||s(r);i=[function(e){return a[e]}],s=function(){return"\\w+"},r=1}for(;r--;)i[r]&&(e=e.replace(RegExp("\\b"+s(r)+"\\b","g"),i[r]));return e}('K M;I(M)1S 2U("2a\'t 4k M 4K 2g 3l 4G 4H");(6(){6 r(f,e){I(!M.1R(f))1S 3m("3s 15 4R");K a=f.1w;f=M(f.1m,t(f)+(e||""));I(a)f.1w={1m:a.1m,19:a.19?a.19.1a(0):N};H f}6 t(f){H(f.1J?"g":"")+(f.4s?"i":"")+(f.4p?"m":"")+(f.4v?"x":"")+(f.3n?"y":"")}6 B(f,e,a,b){K c=u.L,d,h,g;v=R;5K{O(;c--;){g=u[c];I(a&g.3r&&(!g.2p||g.2p.W(b))){g.2q.12=e;I((h=g.2q.X(f))&&h.P===e){d={3k:g.2b.W(b,h,a),1C:h};1N}}}}5v(i){1S i}5q{v=11}H d}6 p(f,e,a){I(3b.Z.1i)H f.1i(e,a);O(a=a||0;a<f.L;a++)I(f[a]===e)H a;H-1}M=6(f,e){K a=[],b=M.1B,c=0,d,h;I(M.1R(f)){I(e!==1d)1S 3m("2a\'t 5r 5I 5F 5B 5C 15 5E 5p");H r(f)}I(v)1S 2U("2a\'t W 3l M 59 5m 5g 5x 5i");e=e||"";O(d={2N:11,19:[],2K:6(g){H e.1i(g)>-1},3d:6(g){e+=g}};c<f.L;)I(h=B(f,c,b,d)){a.U(h.3k);c+=h.1C[0].L||1}Y I(h=n.X.W(z[b],f.1a(c))){a.U(h[0]);c+=h[0].L}Y{h=f.3a(c);I(h==="[")b=M.2I;Y I(h==="]")b=M.1B;a.U(h);c++}a=15(a.1K(""),n.Q.W(e,w,""));a.1w={1m:f,19:d.2N?d.19:N};H a};M.3v="1.5.0";M.2I=1;M.1B=2;K C=/\\$(?:(\\d\\d?|[$&`\'])|{([$\\w]+)})/g,w=/[^5h]+|([\\s\\S])(?=[\\s\\S]*\\1)/g,A=/^(?:[?*+]|{\\d+(?:,\\d*)?})\\??/,v=11,u=[],n={X:15.Z.X,1A:15.Z.1A,1C:1r.Z.1C,Q:1r.Z.Q,1e:1r.Z.1e},x=n.X.W(/()??/,"")[1]===1d,D=6(){K f=/^/g;n.1A.W(f,"");H!f.12}(),y=6(){K f=/x/g;n.Q.W("x",f,"");H!f.12}(),E=15.Z.3n!==1d,z={};z[M.2I]=/^(?:\\\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\\29-26-f]{2}|u[\\29-26-f]{4}|c[A-3o-z]|[\\s\\S]))/;z[M.1B]=/^(?:\\\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\\d*|x[\\29-26-f]{2}|u[\\29-26-f]{4}|c[A-3o-z]|[\\s\\S])|\\(\\?[:=!]|[?*+]\\?|{\\d+(?:,\\d*)?}\\??)/;M.1h=6(f,e,a,b){u.U({2q:r(f,"g"+(E?"y":"")),2b:e,3r:a||M.1B,2p:b||N})};M.2n=6(f,e){K a=f+"/"+(e||"");H M.2n[a]||(M.2n[a]=M(f,e))};M.3c=6(f){H r(f,"g")};M.5l=6(f){H f.Q(/[-[\\]{}()*+?.,\\\\^$|#\\s]/g,"\\\\$&")};M.5e=6(f,e,a,b){e=r(e,"g"+(b&&E?"y":""));e.12=a=a||0;f=e.X(f);H b?f&&f.P===a?f:N:f};M.3q=6(){M.1h=6(){1S 2U("2a\'t 55 1h 54 3q")}};M.1R=6(f){H 53.Z.1q.W(f)==="[2m 15]"};M.3p=6(f,e,a,b){O(K c=r(e,"g"),d=-1,h;h=c.X(f);){a.W(b,h,++d,f,c);c.12===h.P&&c.12++}I(e.1J)e.12=0};M.57=6(f,e){H 6 a(b,c){K d=e[c].1I?e[c]:{1I:e[c]},h=r(d.1I,"g"),g=[],i;O(i=0;i<b.L;i++)M.3p(b[i],h,6(k){g.U(d.3j?k[d.3j]||"":k[0])});H c===e.L-1||!g.L?g:a(g,c+1)}([f],0)};15.Z.1p=6(f,e){H J.X(e[0])};15.Z.W=6(f,e){H J.X(e)};15.Z.X=6(f){K e=n.X.1p(J,14),a;I(e){I(!x&&e.L>1&&p(e,"")>-1){a=15(J.1m,n.Q.W(t(J),"g",""));n.Q.W(f.1a(e.P),a,6(){O(K c=1;c<14.L-2;c++)I(14[c]===1d)e[c]=1d})}I(J.1w&&J.1w.19)O(K b=1;b<e.L;b++)I(a=J.1w.19[b-1])e[a]=e[b];!D&&J.1J&&!e[0].L&&J.12>e.P&&J.12--}H e};I(!D)15.Z.1A=6(f){(f=n.X.W(J,f))&&J.1J&&!f[0].L&&J.12>f.P&&J.12--;H!!f};1r.Z.1C=6(f){M.1R(f)||(f=15(f));I(f.1J){K e=n.1C.1p(J,14);f.12=0;H e}H f.X(J)};1r.Z.Q=6(f,e){K a=M.1R(f),b,c;I(a&&1j e.58()==="3f"&&e.1i("${")===-1&&y)H n.Q.1p(J,14);I(a){I(f.1w)b=f.1w.19}Y f+="";I(1j e==="6")c=n.Q.W(J,f,6(){I(b){14[0]=1f 1r(14[0]);O(K d=0;d<b.L;d++)I(b[d])14[0][b[d]]=14[d+1]}I(a&&f.1J)f.12=14[14.L-2]+14[0].L;H e.1p(N,14)});Y{c=J+"";c=n.Q.W(c,f,6(){K d=14;H n.Q.W(e,C,6(h,g,i){I(g)5b(g){24"$":H"$";24"&":H d[0];24"`":H d[d.L-1].1a(0,d[d.L-2]);24"\'":H d[d.L-1].1a(d[d.L-2]+d[0].L);5a:i="";g=+g;I(!g)H h;O(;g>d.L-3;){i=1r.Z.1a.W(g,-1)+i;g=1Q.3i(g/10)}H(g?d[g]||"":"$")+i}Y{g=+i;I(g<=d.L-3)H d[g];g=b?p(b,i):-1;H g>-1?d[g+1]:h}})})}I(a&&f.1J)f.12=0;H c};1r.Z.1e=6(f,e){I(!M.1R(f))H n.1e.1p(J,14);K a=J+"",b=[],c=0,d,h;I(e===1d||+e<0)e=5D;Y{e=1Q.3i(+e);I(!e)H[]}O(f=M.3c(f);d=f.X(a);){I(f.12>c){b.U(a.1a(c,d.P));d.L>1&&d.P<a.L&&3b.Z.U.1p(b,d.1a(1));h=d[0].L;c=f.12;I(b.L>=e)1N}f.12===d.P&&f.12++}I(c===a.L){I(!n.1A.W(f,"")||h)b.U("")}Y b.U(a.1a(c));H b.L>e?b.1a(0,e):b};M.1h(/\\(\\?#[^)]*\\)/,6(f){H n.1A.W(A,f.2S.1a(f.P+f[0].L))?"":"(?:)"});M.1h(/\\((?!\\?)/,6(){J.19.U(N);H"("});M.1h(/\\(\\?<([$\\w]+)>/,6(f){J.19.U(f[1]);J.2N=R;H"("});M.1h(/\\\\k<([\\w$]+)>/,6(f){K e=p(J.19,f[1]);H e>-1?"\\\\"+(e+1)+(3R(f.2S.3a(f.P+f[0].L))?"":"(?:)"):f[0]});M.1h(/\\[\\^?]/,6(f){H f[0]==="[]"?"\\\\b\\\\B":"[\\\\s\\\\S]"});M.1h(/^\\(\\?([5A]+)\\)/,6(f){J.3d(f[1]);H""});M.1h(/(?:\\s+|#.*)+/,6(f){H n.1A.W(A,f.2S.1a(f.P+f[0].L))?"":"(?:)"},M.1B,6(){H J.2K("x")});M.1h(/\\./,6(){H"[\\\\s\\\\S]"},M.1B,6(){H J.2K("s")})})();1j 2e!="1d"&&(2e.M=M);K 1v=6(){6 r(a,b){a.1l.1i(b)!=-1||(a.1l+=" "+b)}6 t(a){H a.1i("3e")==0?a:"3e"+a}6 B(a){H e.1Y.2A[t(a)]}6 p(a,b,c){I(a==N)H N;K d=c!=R?a.3G:[a.2G],h={"#":"1c",".":"1l"}[b.1o(0,1)]||"3h",g,i;g=h!="3h"?b.1o(1):b.5u();I((a[h]||"").1i(g)!=-1)H a;O(a=0;d&&a<d.L&&i==N;a++)i=p(d[a],b,c);H i}6 C(a,b){K c={},d;O(d 2g a)c[d]=a[d];O(d 2g b)c[d]=b[d];H c}6 w(a,b,c,d){6 h(g){g=g||1P.5y;I(!g.1F){g.1F=g.52;g.3N=6(){J.5w=11}}c.W(d||1P,g)}a.3g?a.3g("4U"+b,h):a.4y(b,h,11)}6 A(a,b){K c=e.1Y.2j,d=N;I(c==N){c={};O(K h 2g e.1U){K g=e.1U[h];d=g.4x;I(d!=N){g.1V=h.4w();O(g=0;g<d.L;g++)c[d[g]]=h}}e.1Y.2j=c}d=e.1U[c[a]];d==N&&b!=11&&1P.1X(e.13.1x.1X+(e.13.1x.3E+a));H d}6 v(a,b){O(K c=a.1e("\\n"),d=0;d<c.L;d++)c[d]=b(c[d],d);H c.1K("\\n")}6 u(a,b){I(a==N||a.L==0||a=="\\n")H a;a=a.Q(/</g,"&1y;");a=a.Q(/ {2,}/g,6(c){O(K d="",h=0;h<c.L-1;h++)d+=e.13.1W;H d+" "});I(b!=N)a=v(a,6(c){I(c.L==0)H"";K d="";c=c.Q(/^(&2s;| )+/,6(h){d=h;H""});I(c.L==0)H d;H d+\'<17 1g="\'+b+\'">\'+c+"</17>"});H a}6 n(a,b){a.1e("\\n");O(K c="",d=0;d<50;d++)c+="                    ";H a=v(a,6(h){I(h.1i("\\t")==-1)H h;O(K g=0;(g=h.1i("\\t"))!=-1;)h=h.1o(0,g)+c.1o(0,b-g%b)+h.1o(g+1,h.L);H h})}6 x(a){H a.Q(/^\\s+|\\s+$/g,"")}6 D(a,b){I(a.P<b.P)H-1;Y I(a.P>b.P)H 1;Y I(a.L<b.L)H-1;Y I(a.L>b.L)H 1;H 0}6 y(a,b){6 c(k){H k[0]}O(K d=N,h=[],g=b.2D?b.2D:c;(d=b.1I.X(a))!=N;){K i=g(d,b);I(1j i=="3f")i=[1f e.2L(i,d.P,b.23)];h=h.1O(i)}H h}6 E(a){K b=/(.*)((&1G;|&1y;).*)/;H a.Q(e.3A.3M,6(c){K d="",h=N;I(h=b.X(c)){c=h[1];d=h[2]}H\'<a 2h="\'+c+\'">\'+c+"</a>"+d})}6 z(){O(K a=1E.36("1k"),b=[],c=0;c<a.L;c++)a[c].3s=="20"&&b.U(a[c]);H b}6 f(a){a=a.1F;K b=p(a,".20",R);a=p(a,".3O",R);K c=1E.4i("3t");I(!(!a||!b||p(a,"3t"))){B(b.1c);r(b,"1m");O(K d=a.3G,h=[],g=0;g<d.L;g++)h.U(d[g].4z||d[g].4A);h=h.1K("\\r");c.39(1E.4D(h));a.39(c);c.2C();c.4C();w(c,"4u",6(){c.2G.4E(c);b.1l=b.1l.Q("1m","")})}}I(1j 3F!="1d"&&1j M=="1d")M=3F("M").M;K e={2v:{"1g-27":"","2i-1s":1,"2z-1s-2t":11,1M:N,1t:N,"42-45":R,"43-22":4,1u:R,16:R,"3V-17":R,2l:11,"41-40":R,2k:11,"1z-1k":11},13:{1W:"&2s;",2M:R,46:11,44:11,34:"4n",1x:{21:"4o 1m",2P:"?",1X:"1v\\n\\n",3E:"4r\'t 4t 1D O: ",4g:"4m 4B\'t 51 O 1z-1k 4F: ",37:\'<!4T 1z 4S "-//4V//3H 4W 1.0 4Z//4Y" "1Z://2y.3L.3K/4X/3I/3H/3I-4P.4J"><1z 4I="1Z://2y.3L.3K/4L/5L"><3J><4N 1Z-4M="5G-5M" 6K="2O/1z; 6J=6I-8" /><1t>6L 1v</1t></3J><3B 1L="25-6M:6Q,6P,6O,6N-6F;6y-2f:#6x;2f:#6w;25-22:6v;2O-3D:3C;"><T 1L="2O-3D:3C;3w-32:1.6z;"><T 1L="25-22:6A-6E;">1v</T><T 1L="25-22:.6C;3w-6B:6R;"><T>3v 3.0.76 (72 73 3x)</T><T><a 2h="1Z://3u.2w/1v" 1F="38" 1L="2f:#3y">1Z://3u.2w/1v</a></T><T>70 17 6U 71.</T><T>6T 6X-3x 6Y 6D.</T></T><T>6t 61 60 J 1k, 5Z <a 2h="6u://2y.62.2w/63-66/65?64=5X-5W&5P=5O" 1L="2f:#3y">5R</a> 5V <2R/>5U 5T 5S!</T></T></3B></1z>\'}},1Y:{2j:N,2A:{}},1U:{},3A:{6n:/\\/\\*[\\s\\S]*?\\*\\//2c,6m:/\\/\\/.*$/2c,6l:/#.*$/2c,6k:/"([^\\\\"\\n]|\\\\.)*"/g,6o:/\'([^\\\\\'\\n]|\\\\.)*\'/g,6p:1f M(\'"([^\\\\\\\\"]|\\\\\\\\.)*"\',"3z"),6s:1f M("\'([^\\\\\\\\\']|\\\\\\\\.)*\'","3z"),6q:/(&1y;|<)!--[\\s\\S]*?--(&1G;|>)/2c,3M:/\\w+:\\/\\/[\\w-.\\/?%&=:@;]*/g,6a:{18:/(&1y;|<)\\?=?/g,1b:/\\?(&1G;|>)/g},69:{18:/(&1y;|<)%=?/g,1b:/%(&1G;|>)/g},6d:{18:/(&1y;|<)\\s*1k.*?(&1G;|>)/2T,1b:/(&1y;|<)\\/\\s*1k\\s*(&1G;|>)/2T}},16:{1H:6(a){6 b(i,k){H e.16.2o(i,k,e.13.1x[k])}O(K c=\'<T 1g="16">\',d=e.16.2x,h=d.2X,g=0;g<h.L;g++)c+=(d[h[g]].1H||b)(a,h[g]);c+="</T>";H c},2o:6(a,b,c){H\'<2W><a 2h="#" 1g="6e 6h\'+b+" "+b+\'">\'+c+"</a></2W>"},2b:6(a){K b=a.1F,c=b.1l||"";b=B(p(b,".20",R).1c);K d=6(h){H(h=15(h+"6f(\\\\w+)").X(c))?h[1]:N}("6g");b&&d&&e.16.2x[d].2B(b);a.3N()},2x:{2X:["21","2P"],21:{1H:6(a){I(a.V("2l")!=R)H"";K b=a.V("1t");H e.16.2o(a,"21",b?b:e.13.1x.21)},2B:6(a){a=1E.6j(t(a.1c));a.1l=a.1l.Q("47","")}},2P:{2B:6(){K a="68=0";a+=", 18="+(31.30-33)/2+", 32="+(31.2Z-2Y)/2+", 30=33, 2Z=2Y";a=a.Q(/^,/,"");a=1P.6Z("","38",a);a.2C();K b=a.1E;b.6W(e.13.1x.37);b.6V();a.2C()}}}},35:6(a,b){K c;I(b)c=[b];Y{c=1E.36(e.13.34);O(K d=[],h=0;h<c.L;h++)d.U(c[h]);c=d}c=c;d=[];I(e.13.2M)c=c.1O(z());I(c.L===0)H d;O(h=0;h<c.L;h++){O(K g=c[h],i=a,k=c[h].1l,j=3W 0,l={},m=1f M("^\\\\[(?<2V>(.*?))\\\\]$"),s=1f M("(?<27>[\\\\w-]+)\\\\s*:\\\\s*(?<1T>[\\\\w-%#]+|\\\\[.*?\\\\]|\\".*?\\"|\'.*?\')\\\\s*;?","g");(j=s.X(k))!=N;){K o=j.1T.Q(/^[\'"]|[\'"]$/g,"");I(o!=N&&m.1A(o)){o=m.X(o);o=o.2V.L>0?o.2V.1e(/\\s*,\\s*/):[]}l[j.27]=o}g={1F:g,1n:C(i,l)};g.1n.1D!=N&&d.U(g)}H d},1M:6(a,b){K c=J.35(a,b),d=N,h=e.13;I(c.L!==0)O(K g=0;g<c.L;g++){b=c[g];K i=b.1F,k=b.1n,j=k.1D,l;I(j!=N){I(k["1z-1k"]=="R"||e.2v["1z-1k"]==R){d=1f e.4l(j);j="4O"}Y I(d=A(j))d=1f d;Y 6H;l=i.3X;I(h.2M){l=l;K m=x(l),s=11;I(m.1i("<![6G[")==0){m=m.4h(9);s=R}K o=m.L;I(m.1i("]]\\>")==o-3){m=m.4h(0,o-3);s=R}l=s?m:l}I((i.1t||"")!="")k.1t=i.1t;k.1D=j;d.2Q(k);b=d.2F(l);I((i.1c||"")!="")b.1c=i.1c;i.2G.74(b,i)}}},2E:6(a){w(1P,"4k",6(){e.1M(a)})}};e.2E=e.2E;e.1M=e.1M;e.2L=6(a,b,c){J.1T=a;J.P=b;J.L=a.L;J.23=c;J.1V=N};e.2L.Z.1q=6(){H J.1T};e.4l=6(a){6 b(j,l){O(K m=0;m<j.L;m++)j[m].P+=l}K c=A(a),d,h=1f e.1U.5Y,g=J,i="2F 1H 2Q".1e(" ");I(c!=N){d=1f c;O(K k=0;k<i.L;k++)(6(){K j=i[k];g[j]=6(){H h[j].1p(h,14)}})();d.28==N?1P.1X(e.13.1x.1X+(e.13.1x.4g+a)):h.2J.U({1I:d.28.17,2D:6(j){O(K l=j.17,m=[],s=d.2J,o=j.P+j.18.L,F=d.28,q,G=0;G<s.L;G++){q=y(l,s[G]);b(q,o);m=m.1O(q)}I(F.18!=N&&j.18!=N){q=y(j.18,F.18);b(q,j.P);m=m.1O(q)}I(F.1b!=N&&j.1b!=N){q=y(j.1b,F.1b);b(q,j.P+j[0].5Q(j.1b));m=m.1O(q)}O(j=0;j<m.L;j++)m[j].1V=c.1V;H m}})}};e.4j=6(){};e.4j.Z={V:6(a,b){K c=J.1n[a];c=c==N?b:c;K d={"R":R,"11":11}[c];H d==N?c:d},3Y:6(a){H 1E.4i(a)},4c:6(a,b){K c=[];I(a!=N)O(K d=0;d<a.L;d++)I(1j a[d]=="2m")c=c.1O(y(b,a[d]));H J.4e(c.6b(D))},4e:6(a){O(K b=0;b<a.L;b++)I(a[b]!==N)O(K c=a[b],d=c.P+c.L,h=b+1;h<a.L&&a[b]!==N;h++){K g=a[h];I(g!==N)I(g.P>d)1N;Y I(g.P==c.P&&g.L>c.L)a[b]=N;Y I(g.P>=c.P&&g.P<d)a[h]=N}H a},4d:6(a){K b=[],c=2u(J.V("2i-1s"));v(a,6(d,h){b.U(h+c)});H b},3U:6(a){K b=J.V("1M",[]);I(1j b!="2m"&&b.U==N)b=[b];a:{a=a.1q();K c=3W 0;O(c=c=1Q.6c(c||0,0);c<b.L;c++)I(b[c]==a){b=c;1N a}b=-1}H b!=-1},2r:6(a,b,c){a=["1s","6i"+b,"P"+a,"6r"+(b%2==0?1:2).1q()];J.3U(b)&&a.U("67");b==0&&a.U("1N");H\'<T 1g="\'+a.1K(" ")+\'">\'+c+"</T>"},3Q:6(a,b){K c="",d=a.1e("\\n").L,h=2u(J.V("2i-1s")),g=J.V("2z-1s-2t");I(g==R)g=(h+d-1).1q().L;Y I(3R(g)==R)g=0;O(K i=0;i<d;i++){K k=b?b[i]:h+i,j;I(k==0)j=e.13.1W;Y{j=g;O(K l=k.1q();l.L<j;)l="0"+l;j=l}a=j;c+=J.2r(i,k,a)}H c},49:6(a,b){a=x(a);K c=a.1e("\\n");J.V("2z-1s-2t");K d=2u(J.V("2i-1s"));a="";O(K h=J.V("1D"),g=0;g<c.L;g++){K i=c[g],k=/^(&2s;|\\s)+/.X(i),j=N,l=b?b[g]:d+g;I(k!=N){j=k[0].1q();i=i.1o(j.L);j=j.Q(" ",e.13.1W)}i=x(i);I(i.L==0)i=e.13.1W;a+=J.2r(g,l,(j!=N?\'<17 1g="\'+h+\' 5N">\'+j+"</17>":"")+i)}H a},4f:6(a){H a?"<4a>"+a+"</4a>":""},4b:6(a,b){6 c(l){H(l=l?l.1V||g:g)?l+" ":""}O(K d=0,h="",g=J.V("1D",""),i=0;i<b.L;i++){K k=b[i],j;I(!(k===N||k.L===0)){j=c(k);h+=u(a.1o(d,k.P-d),j+"48")+u(k.1T,j+k.23);d=k.P+k.L+(k.75||0)}}h+=u(a.1o(d),c()+"48");H h},1H:6(a){K b="",c=["20"],d;I(J.V("2k")==R)J.1n.16=J.1n.1u=11;1l="20";J.V("2l")==R&&c.U("47");I((1u=J.V("1u"))==11)c.U("6S");c.U(J.V("1g-27"));c.U(J.V("1D"));a=a.Q(/^[ ]*[\\n]+|[\\n]*[ ]*$/g,"").Q(/\\r/g," ");b=J.V("43-22");I(J.V("42-45")==R)a=n(a,b);Y{O(K h="",g=0;g<b;g++)h+=" ";a=a.Q(/\\t/g,h)}a=a;a:{b=a=a;h=/<2R\\s*\\/?>|&1y;2R\\s*\\/?&1G;/2T;I(e.13.46==R)b=b.Q(h,"\\n");I(e.13.44==R)b=b.Q(h,"");b=b.1e("\\n");h=/^\\s*/;g=4Q;O(K i=0;i<b.L&&g>0;i++){K k=b[i];I(x(k).L!=0){k=h.X(k);I(k==N){a=a;1N a}g=1Q.4q(k[0].L,g)}}I(g>0)O(i=0;i<b.L;i++)b[i]=b[i].1o(g);a=b.1K("\\n")}I(1u)d=J.4d(a);b=J.4c(J.2J,a);b=J.4b(a,b);b=J.49(b,d);I(J.V("41-40"))b=E(b);1j 2H!="1d"&&2H.3S&&2H.3S.1C(/5s/)&&c.U("5t");H b=\'<T 1c="\'+t(J.1c)+\'" 1g="\'+c.1K(" ")+\'">\'+(J.V("16")?e.16.1H(J):"")+\'<3Z 5z="0" 5H="0" 5J="0">\'+J.4f(J.V("1t"))+"<3T><3P>"+(1u?\'<2d 1g="1u">\'+J.3Q(a)+"</2d>":"")+\'<2d 1g="17"><T 1g="3O">\'+b+"</T></2d></3P></3T></3Z></T>"},2F:6(a){I(a===N)a="";J.17=a;K b=J.3Y("T");b.3X=J.1H(a);J.V("16")&&w(p(b,".16"),"5c",e.16.2b);J.V("3V-17")&&w(p(b,".17"),"56",f);H b},2Q:6(a){J.1c=""+1Q.5d(1Q.5n()*5k).1q();e.1Y.2A[t(J.1c)]=J;J.1n=C(e.2v,a||{});I(J.V("2k")==R)J.1n.16=J.1n.1u=11},5j:6(a){a=a.Q(/^\\s+|\\s+$/g,"").Q(/\\s+/g,"|");H"\\\\b(?:"+a+")\\\\b"},5f:6(a){J.28={18:{1I:a.18,23:"1k"},1b:{1I:a.1b,23:"1k"},17:1f M("(?<18>"+a.18.1m+")(?<17>.*?)(?<1b>"+a.1b.1m+")","5o")}}};H e}();1j 2e!="1d"&&(2e.1v=1v);',62,441,"||||||function|||||||||||||||||||||||||||||||||||||return|if|this|var|length|XRegExp|null|for|index|replace|true||div|push|getParam|call|exec|else|prototype||false|lastIndex|config|arguments|RegExp|toolbar|code|left|captureNames|slice|right|id|undefined|split|new|class|addToken|indexOf|typeof|script|className|source|params|substr|apply|toString|String|line|title|gutter|SyntaxHighlighter|_xregexp|strings|lt|html|test|OUTSIDE_CLASS|match|brush|document|target|gt|getHtml|regex|global|join|style|highlight|break|concat|window|Math|isRegExp|throw|value|brushes|brushName|space|alert|vars|http|syntaxhighlighter|expandSource|size|css|case|font|Fa|name|htmlScript|dA|can|handler|gm|td|exports|color|in|href|first|discoveredBrushes|light|collapse|object|cache|getButtonHtml|trigger|pattern|getLineHtml|nbsp|numbers|parseInt|defaults|com|items|www|pad|highlighters|execute|focus|func|all|getDiv|parentNode|navigator|INSIDE_CLASS|regexList|hasFlag|Match|useScriptTags|hasNamedCapture|text|help|init|br|input|gi|Error|values|span|list|250|height|width|screen|top|500|tagName|findElements|getElementsByTagName|aboutDialog|_blank|appendChild|charAt|Array|copyAsGlobal|setFlag|highlighter_|string|attachEvent|nodeName|floor|backref|output|the|TypeError|sticky|Za|iterate|freezeTokens|scope|type|textarea|alexgorbatchev|version|margin|2010|005896|gs|regexLib|body|center|align|noBrush|require|childNodes|DTD|xhtml1|head|org|w3|url|preventDefault|container|tr|getLineNumbersHtml|isNaN|userAgent|tbody|isLineHighlighted|quick|void|innerHTML|create|table|links|auto|smart|tab|stripBrs|tabs|bloggerMode|collapsed|plain|getCodeLinesHtml|caption|getMatchesHtml|findMatches|figureOutLineNumbers|removeNestedMatches|getTitleHtml|brushNotHtmlScript|substring|createElement|Highlighter|load|HtmlScript|Brush|pre|expand|multiline|min|Can|ignoreCase|find|blur|extended|toLowerCase|aliases|addEventListener|innerText|textContent|wasn|select|createTextNode|removeChild|option|same|frame|xmlns|dtd|twice|1999|equiv|meta|htmlscript|transitional|1E3|expected|PUBLIC|DOCTYPE|on|W3C|XHTML|TR|EN|Transitional||configured|srcElement|Object|after|run|dblclick|matchChain|valueOf|constructor|default|switch|click|round|execAt|forHtmlScript|token|gimy|functions|getKeywords|1E6|escape|within|random|sgi|another|finally|supply|MSIE|ie|toUpperCase|catch|returnValue|definition|event|border|imsx|constructing|one|Infinity|from|when|Content|cellpadding|flags|cellspacing|try|xhtml|Type|spaces|2930402|hosted_button_id|lastIndexOf|donate|active|development|keep|to|xclick|_s|Xml|please|like|you|paypal|cgi|cmd|webscr|bin|highlighted|scrollbars|aspScriptTags|phpScriptTags|sort|max|scriptScriptTags|toolbar_item|_|command|command_|number|getElementById|doubleQuotedString|singleLinePerlComments|singleLineCComments|multiLineCComments|singleQuotedString|multiLineDoubleQuotedString|xmlComments|alt|multiLineSingleQuotedString|If|https|1em|000|fff|background|5em|xx|bottom|75em|Gorbatchev|large|serif|CDATA|continue|utf|charset|content|About|family|sans|Helvetica|Arial|Geneva|3em|nogutter|Copyright|syntax|close|write|2004|Alex|open|JavaScript|highlighter|July|02|replaceChild|offset|83".split("|"),0,{}));
  // shBrushPlain.min.js
  (function(){function e(){}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["text","plain"],SyntaxHighlighter.brushes.Plain=e,"undefined"!=typeof exports?exports.Brush=e:null})();
  // shBrushJScript.min.js
  (function(){function e(){var e="break case catch continue default delete do else false  for function if in instanceof new null return super switch this throw true try typeof var while with",t=SyntaxHighlighter.regexLib;this.regexList=[{regex:t.multiLineDoubleQuotedString,css:"string"},{regex:t.multiLineSingleQuotedString,css:"string"},{regex:t.singleLineCComments,css:"comments"},{regex:t.multiLineCComments,css:"comments"},{regex:/\s*#.*/gm,css:"preprocessor"},{regex:RegExp(this.getKeywords(e),"gm"),css:"keyword"}],this.forHtmlScript(t.scriptScriptTags)}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["js","jscript","javascript"],SyntaxHighlighter.brushes.JScript=e,"undefined"!=typeof exports?exports.Brush=e:null})();
  // shBrushCpp.min.js
  (function(){function e(){var e="ATOM BOOL BOOLEAN BYTE CHAR COLORREF DWORD DWORDLONG DWORD_PTR DWORD32 DWORD64 FLOAT HACCEL HALF_PTR HANDLE HBITMAP HBRUSH HCOLORSPACE HCONV HCONVLIST HCURSOR HDC HDDEDATA HDESK HDROP HDWP HENHMETAFILE HFILE HFONT HGDIOBJ HGLOBAL HHOOK HICON HINSTANCE HKEY HKL HLOCAL HMENU HMETAFILE HMODULE HMONITOR HPALETTE HPEN HRESULT HRGN HRSRC HSZ HWINSTA HWND INT INT_PTR INT32 INT64 LANGID LCID LCTYPE LGRPID LONG LONGLONG LONG_PTR LONG32 LONG64 LPARAM LPBOOL LPBYTE LPCOLORREF LPCSTR LPCTSTR LPCVOID LPCWSTR LPDWORD LPHANDLE LPINT LPLONG LPSTR LPTSTR LPVOID LPWORD LPWSTR LRESULT PBOOL PBOOLEAN PBYTE PCHAR PCSTR PCTSTR PCWSTR PDWORDLONG PDWORD_PTR PDWORD32 PDWORD64 PFLOAT PHALF_PTR PHANDLE PHKEY PINT PINT_PTR PINT32 PINT64 PLCID PLONG PLONGLONG PLONG_PTR PLONG32 PLONG64 POINTER_32 POINTER_64 PSHORT PSIZE_T PSSIZE_T PSTR PTBYTE PTCHAR PTSTR PUCHAR PUHALF_PTR PUINT PUINT_PTR PUINT32 PUINT64 PULONG PULONGLONG PULONG_PTR PULONG32 PULONG64 PUSHORT PVOID PWCHAR PWORD PWSTR SC_HANDLE SC_LOCK SERVICE_STATUS_HANDLE SHORT SIZE_T SSIZE_T TBYTE TCHAR UCHAR UHALF_PTR UINT UINT_PTR UINT32 UINT64 ULONG ULONGLONG ULONG_PTR ULONG32 ULONG64 USHORT USN VOID WCHAR WORD WPARAM WPARAM WPARAM char bool short int __int32 __int64 __int8 __int16 long float double __wchar_t clock_t _complex _dev_t _diskfree_t div_t ldiv_t _exception _EXCEPTION_POINTERS FILE _finddata_t _finddatai64_t _wfinddata_t _wfinddatai64_t __finddata64_t __wfinddata64_t _FPIEEE_RECORD fpos_t _HEAPINFO _HFILE lconv intptr_t jmp_buf mbstate_t _off_t _onexit_t _PNH ptrdiff_t _purecall_handler sig_atomic_t size_t _stat __stat64 _stati64 terminate_function time_t __time64_t _timeb __timeb64 tm uintptr_t _utimbuf va_list wchar_t wctrans_t wctype_t wint_t signed",t="break case catch class const __finally __exception __try const_cast continue private public protected __declspec default delete deprecated dllexport dllimport do dynamic_cast else enum explicit extern if for friend goto inline mutable naked namespace new noinline noreturn nothrow register reinterpret_cast return selectany sizeof static static_cast struct switch template this thread throw true false try typedef typeid typename union using uuid virtual void volatile whcar_t while",r="assert isalnum isalpha iscntrl isdigit isgraph islower isprintispunct isspace isupper isxdigit tolower toupper errno localeconv setlocale acos asin atan atan2 ceil cos cosh exp fabs floor fmod frexp ldexp log log10 modf pow sin sinh sqrt tan tanh jmp_buf longjmp setjmp raise signal sig_atomic_t va_arg va_end va_start clearerr fclose feof ferror fflush fgetc fgetpos fgets fopen fprintf fputc fputs fread freopen fscanf fseek fsetpos ftell fwrite getc getchar gets perror printf putc putchar puts remove rename rewind scanf setbuf setvbuf sprintf sscanf tmpfile tmpnam ungetc vfprintf vprintf vsprintf abort abs atexit atof atoi atol bsearch calloc div exit free getenv labs ldiv malloc mblen mbstowcs mbtowc qsort rand realloc srand strtod strtol strtoul system wcstombs wctomb memchr memcmp memcpy memmove memset strcat strchr strcmp strcoll strcpy strcspn strerror strlen strncat strncmp strncpy strpbrk strrchr strspn strstr strtok strxfrm asctime clock ctime difftime gmtime localtime mktime strftime time";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/^ *#.*/gm,css:"preprocessor"},{regex:RegExp(this.getKeywords(e),"gm"),css:"color1 bold"},{regex:RegExp(this.getKeywords(r),"gm"),css:"functions bold"},{regex:RegExp(this.getKeywords(t),"gm"),css:"keyword bold"}]}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["cpp","c"],SyntaxHighlighter.brushes.Cpp=e,"undefined"!=typeof exports?exports.Brush=e:null})();
  // shBrushCSharp.min.js
  (function(){function e(){function e(e){var t=0==e[0].indexOf("///")?"color1":"comments";return[new SyntaxHighlighter.Match(e[0],e.index,t)]}var t="abstract as base bool break byte case catch char checked class const continue decimal default delegate do double else enum event explicit extern false finally fixed float for foreach get goto if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sbyte sealed set short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using virtual void while";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,func:e},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:/@"(?:[^"]|"")*"/g,css:"string"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/^\s*#.*/gm,css:"preprocessor"},{regex:RegExp(this.getKeywords(t),"gm"),css:"keyword"},{regex:/\bpartial(?=\s+(?:class|interface|struct)\b)/g,css:"keyword"},{regex:/\byield(?=\s+(?:return|break)\b)/g,css:"keyword"}],this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags)}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["c#","c-sharp","csharp"],SyntaxHighlighter.brushes.CSharp=e,"undefined"!=typeof exports?exports.Brush=e:null})();
  // shBrushXml.min.js
  (function(){function e(){function e(e){var t=SyntaxHighlighter.Match,r=e[0],i=new XRegExp("(&lt;|<)[\\s\\/\\?]*(?<name>[:\\w-\\.]+)","xg").exec(r),s=[];if(null!=e.attributes)for(var n,a=new XRegExp("(?<name> [\\w:\\-\\.]+)\\s*=\\s*(?<value> \".*?\"|'.*?'|\\w+)","xg");null!=(n=a.exec(r));)s.push(new t(n.name,e.index+n.index,"color1")),s.push(new t(n.value,e.index+n.index+n[0].indexOf(n.value),"string"));return null!=i&&s.push(new t(i.name,e.index+i[0].indexOf(i.name),"keyword")),s}this.regexList=[{regex:new XRegExp("(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)","gm"),css:"color2"},{regex:SyntaxHighlighter.regexLib.xmlComments,css:"comments"},{regex:new XRegExp("(&lt;|<)[\\s\\/\\?]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)","sg"),func:e}]}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["xml","xhtml","xslt","html"],SyntaxHighlighter.brushes.Xml=e,"undefined"!=typeof exports?exports.Brush=e:null})();
  // shBrushCss.min.js
  (function(){function e(){function e(e){return"\\b([a-z_]|)"+e.replace(/ /g,"(?=:)\\b|\\b([a-z_\\*]|\\*|)")+"(?=:)\\b"}function t(e){return"\\b"+e.replace(/ /g,"(?!-)(?!:)\\b|\\b()")+":\\b"}var r="ascent azimuth background-attachment background-color background-image background-position background-repeat background baseline bbox border-collapse border-color border-spacing border-style border-top border-right border-bottom border-left border-top-color border-right-color border-bottom-color border-left-color border-top-style border-right-style border-bottom-style border-left-style border-top-width border-right-width border-bottom-width border-left-width border-width border bottom cap-height caption-side centerline clear clip color content counter-increment counter-reset cue-after cue-before cue cursor definition-src descent direction display elevation empty-cells float font-size-adjust font-family font-size font-stretch font-style font-variant font-weight font height left letter-spacing line-height list-style-image list-style-position list-style-type list-style margin-top margin-right margin-bottom margin-left margin marker-offset marks mathline max-height max-width min-height min-width orphans outline-color outline-style outline-width outline overflow padding-top padding-right padding-bottom padding-left padding page page-break-after page-break-before page-break-inside pause pause-after pause-before pitch pitch-range play-during position quotes right richness size slope src speak-header speak-numeral speak-punctuation speak speech-rate stemh stemv stress table-layout text-align top text-decoration text-indent text-shadow text-transform unicode-bidi unicode-range units-per-em vertical-align visibility voice-family volume white-space widows width widths word-spacing x-height z-index",i="above absolute all always aqua armenian attr aural auto avoid baseline behind below bidi-override black blink block blue bold bolder both bottom braille capitalize caption center center-left center-right circle close-quote code collapse compact condensed continuous counter counters crop cross crosshair cursive dashed decimal decimal-leading-zero default digits disc dotted double embed embossed e-resize expanded extra-condensed extra-expanded fantasy far-left far-right fast faster fixed format fuchsia gray green groove handheld hebrew help hidden hide high higher icon inline-table inline inset inside invert italic justify landscape large larger left-side left leftwards level lighter lime line-through list-item local loud lower-alpha lowercase lower-greek lower-latin lower-roman lower low ltr marker maroon medium message-box middle mix move narrower navy ne-resize no-close-quote none no-open-quote no-repeat normal nowrap n-resize nw-resize oblique olive once open-quote outset outside overline pointer portrait pre print projection purple red relative repeat repeat-x repeat-y rgb ridge right right-side rightwards rtl run-in screen scroll semi-condensed semi-expanded separate se-resize show silent silver slower slow small small-caps small-caption smaller soft solid speech spell-out square s-resize static status-bar sub super sw-resize table-caption table-cell table-column table-column-group table-footer-group table-header-group table-row table-row-group teal text-bottom text-top thick thin top transparent tty tv ultra-condensed ultra-expanded underline upper-alpha uppercase upper-latin upper-roman url visible wait white wider w-resize x-fast x-high x-large x-loud x-low x-slow x-small x-soft xx-large xx-small yellow",a="[mM]onospace [tT]ahoma [vV]erdana [aA]rial [hH]elvetica [sS]ans-serif [sS]erif [cC]ourier mono sans serif";this.regexList=[{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\#[a-fA-F0-9]{3,6}/g,css:"value"},{regex:/(-?\d+)(\.\d+)?(px|em|pt|\:|\%|)/g,css:"value"},{regex:/!important/g,css:"color3"},{regex:RegExp(e(r),"gm"),css:"keyword"},{regex:RegExp(t(i),"g"),css:"value"},{regex:RegExp(this.getKeywords(a),"g"),css:"color1"}],this.forHtmlScript({left:/(&lt;|<)\s*style.*?(&gt;|>)/gi,right:/(&lt;|<)\/\s*style\s*(&gt;|>)/gi})}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["css"],SyntaxHighlighter.brushes.CSS=e,"undefined"!=typeof exports?exports.Brush=e:null})();
  // shBrushPhp.min.js
  (function(){function e(){var e="abs acos acosh addcslashes addslashes array_change_key_case array_chunk array_combine array_count_values array_diff array_diff_assoc array_diff_key array_diff_uassoc array_diff_ukey array_fill array_filter array_flip array_intersect array_intersect_assoc array_intersect_key array_intersect_uassoc array_intersect_ukey array_key_exists array_keys array_map array_merge array_merge_recursive array_multisort array_pad array_pop array_product array_push array_rand array_reduce array_reverse array_search array_shift array_slice array_splice array_sum array_udiff array_udiff_assoc array_udiff_uassoc array_uintersect array_uintersect_assoc array_uintersect_uassoc array_unique array_unshift array_values array_walk array_walk_recursive atan atan2 atanh base64_decode base64_encode base_convert basename bcadd bccomp bcdiv bcmod bcmul bindec bindtextdomain bzclose bzcompress bzdecompress bzerrno bzerror bzerrstr bzflush bzopen bzread bzwrite ceil chdir checkdate checkdnsrr chgrp chmod chop chown chr chroot chunk_split class_exists closedir closelog copy cos cosh count count_chars date decbin dechex decoct deg2rad delete ebcdic2ascii echo empty end ereg ereg_replace eregi eregi_replace error_log error_reporting escapeshellarg escapeshellcmd eval exec exit exp explode extension_loaded feof fflush fgetc fgetcsv fgets fgetss file_exists file_get_contents file_put_contents fileatime filectime filegroup fileinode filemtime fileowner fileperms filesize filetype floatval flock floor flush fmod fnmatch fopen fpassthru fprintf fputcsv fputs fread fscanf fseek fsockopen fstat ftell ftok getallheaders getcwd getdate getenv gethostbyaddr gethostbyname gethostbynamel getimagesize getlastmod getmxrr getmygid getmyinode getmypid getmyuid getopt getprotobyname getprotobynumber getrandmax getrusage getservbyname getservbyport gettext gettimeofday gettype glob gmdate gmmktime ini_alter ini_get ini_get_all ini_restore ini_set interface_exists intval ip2long is_a is_array is_bool is_callable is_dir is_double is_executable is_file is_finite is_float is_infinite is_int is_integer is_link is_long is_nan is_null is_numeric is_object is_readable is_real is_resource is_scalar is_soap_fault is_string is_subclass_of is_uploaded_file is_writable is_writeable mkdir mktime nl2br parse_ini_file parse_str parse_url passthru pathinfo print readlink realpath rewind rewinddir rmdir round str_ireplace str_pad str_repeat str_replace str_rot13 str_shuffle str_split str_word_count strcasecmp strchr strcmp strcoll strcspn strftime strip_tags stripcslashes stripos stripslashes stristr strlen strnatcasecmp strnatcmp strncasecmp strncmp strpbrk strpos strptime strrchr strrev strripos strrpos strspn strstr strtok strtolower strtotime strtoupper strtr strval substr substr_compare",t="abstract and array as break case catch cfunction class clone const continue declare default die do else elseif enddeclare endfor endforeach endif endswitch endwhile extends final for foreach function include include_once global goto if implements interface instanceof namespace new old_function or private protected public return require require_once static switch throw try use var while xor ",r="__FILE__ __LINE__ __METHOD__ __FUNCTION__ __CLASS__";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\$\w+/g,css:"variable"},{regex:RegExp(this.getKeywords(e),"gmi"),css:"functions"},{regex:RegExp(this.getKeywords(r),"gmi"),css:"constants"},{regex:RegExp(this.getKeywords(t),"gm"),css:"keyword"}],this.forHtmlScript(SyntaxHighlighter.regexLib.phpScriptTags)}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["php"],SyntaxHighlighter.brushes.Php=e,"undefined"!=typeof exports?exports.Brush=e:null})();
  // shBrushJava.min.js
  (function(){function e(){var e="abstract assert boolean break byte case catch char class const continue default do double else enum extends false final finally float for goto if implements import instanceof int interface long native new null package private protected public return short static strictfp super switch synchronized this throw throws true transient try void volatile while";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:/\/\*([^\*][\s\S]*)?\*\//gm,css:"comments"},{regex:/\/\*(?!\*\/)\*[\s\S]*?\*\//gm,css:"preprocessor"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\b([\d]+(\.[\d]+)?|0x[a-f0-9]+)\b/gi,css:"value"},{regex:/(?!\@interface\b)\@[\$\w]+\b/g,css:"color1"},{regex:/\@interface\b/g,css:"color2"},{regex:RegExp(this.getKeywords(e),"gm"),css:"keyword"}],this.forHtmlScript({left:/(&lt;|<)%[@!=]?/g,right:/%(&gt;|>)/g})}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["java"],SyntaxHighlighter.brushes.Java=e,"undefined"!=typeof exports?exports.Brush=e:null})();
  // shBrushDelphi.min.js
  (function(){function e(){var e="abs addr and ansichar ansistring array as asm begin boolean byte cardinal case char class comp const constructor currency destructor div do double downto else end except exports extended false file finalization finally for function goto if implementation in inherited int64 initialization integer interface is label library longint longword mod nil not object of on or packed pansichar pansistring pchar pcurrency pdatetime pextended pint64 pointer private procedure program property pshortstring pstring pvariant pwidechar pwidestring protected public published raise real real48 record repeat set shl shortint shortstring shr single smallint string then threadvar to true try type unit until uses val var varirnt while widechar widestring with word write writeln xor";this.regexList=[{regex:/\(\*[\s\S]*?\*\)/gm,css:"comments"},{regex:/{(?!\$)[\s\S]*?}/gm,css:"comments"},{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\{\$[a-zA-Z]+ .+\}/g,css:"color1"},{regex:/\b[\d\.]+\b/g,css:"value"},{regex:/\$[a-zA-Z0-9]+\b/g,css:"value"},{regex:RegExp(this.getKeywords(e),"gmi"),css:"keyword"}]}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["delphi","pascal","pas"],SyntaxHighlighter.brushes.Delphi=e,"undefined"!=typeof exports?exports.Brush=e:null})();
  // shBrushPython.min.js
  (function(){function e(){var e="and assert break class continue def del elif else except exec finally for from global if import in is lambda not or pass print raise return try yield while",t="__import__ abs all any apply basestring bin bool buffer callable chr classmethod cmp coerce compile complex delattr dict dir divmod enumerate eval execfile file filter float format frozenset getattr globals hasattr hash help hex id input int intern isinstance issubclass iter len list locals long map max min next object oct open ord pow print property range raw_input reduce reload repr reversed round set setattr slice sorted staticmethod str sum super tuple type type unichr unicode vars xrange zip",r="None True False self cls class_";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLinePerlComments,css:"comments"},{regex:/^\s*@\w+/gm,css:"decorator"},{regex:/(['\"]{3})([^\1])*?\1/gm,css:"comments"},{regex:/"(?!")(?:\.|\\\"|[^\""\n])*"/gm,css:"string"},{regex:/'(?!')(?:\.|(\\\')|[^\''\n])*'/gm,css:"string"},{regex:/\+|\-|\*|\/|\%|=|==/gm,css:"keyword"},{regex:/\b\d+\.?\w*/g,css:"value"},{regex:RegExp(this.getKeywords(t),"gmi"),css:"functions"},{regex:RegExp(this.getKeywords(e),"gm"),css:"keyword"},{regex:RegExp(this.getKeywords(r),"gm"),css:"color1"}],this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags)}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["py","python"],SyntaxHighlighter.brushes.Python=e,"undefined"!=typeof exports?exports.Brush=e:null})();
  // shBrushRuby.min.js
  (function(){function e(){var e="alias and BEGIN begin break case class def define_method defined do each else elsif END end ensure false for if in module new next nil not or raise redo rescue retry return self super then throw true undef unless until when while yield",t="Array Bignum Binding Class Continuation Dir Exception FalseClass File::Stat File Fixnum Fload Hash Integer IO MatchData Method Module NilClass Numeric Object Proc Range Regexp String Struct::TMS Symbol ThreadGroup Thread Time TrueClass";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLinePerlComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\b[A-Z0-9_]+\b/g,css:"constants"},{regex:/:[a-z][A-Za-z0-9_]*/g,css:"color2"},{regex:/(\$|@@|@)\w+/g,css:"variable bold"},{regex:RegExp(this.getKeywords(e),"gm"),css:"keyword"},{regex:RegExp(this.getKeywords(t),"gm"),css:"color1"}],this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags)}"undefined"!=typeof require?SyntaxHighlighter=require("shCore").SyntaxHighlighter:null,e.prototype=new SyntaxHighlighter.Highlighter,e.aliases=["ruby","rails","ror","rb"],SyntaxHighlighter.brushes.Ruby=e,"undefined"!=typeof exports?exports.Brush=e:null})();

  var tags = $("#question-tags a").map(function(i,tag){return $(tag).text()}).get();
  var brush = "brush: plain";
  if (tags.indexOf('html')>=0 || tags.indexOf('html5')>=0)
  {
    brush = "brush: js; html-script: true";
  } else if (tags.indexOf('php')>=0)
  {
    brush = "brush: php";
  } else if (tags.indexOf('js')>=0 || tags.indexOf('javascript')>=0 || tags.indexOf('jquery')>=0)
  {
    brush = "brush: js";
  } else if (tags.indexOf('css')>=0)
  {
    brush = "brush: css";
  } else if (tags.indexOf('c++')>=0 || tags.indexOf('c')>=0 || tags.indexOf('objective-c')>=0 || tags.indexOf('qt')>=0 || tags.indexOf('xcode')>=0)
  {
    brush = "brush: cpp";
  } else if (tags.indexOf('c#')>=0)
  {
    brush = "brush: csharp";
  } else if (tags.indexOf('java')>=0 || tags.indexOf('android')>=0)
  {
    brush = "brush: java";
  } else if (tags.indexOf('pascal')>=0 || tags.indexOf('delphi')>=0 || tags.indexOf('delphi7')>=0 || tags.indexOf('freepascal')>=0)
  {
    brush = "brush: pas";
  } else if (tags.indexOf('python')>=0)
  {
    brush = "brush: py";
  } else if (tags.indexOf('ruby')>=0 || tags.indexOf('ruby-on-rails')>=0 || tags.indexOf('rails')>=0)
  {
    brush = "brush: ruby";
  }
  $("pre code").each(function(i,code){
    var pre = $(code).parent();
    $("<hashcode class='"+brush+"' style='white-space:pre;font-family:monospace'></hashcode>").html($(code).html()).insertBefore(pre);
    $(pre).remove();
  });
  SyntaxHighlighter.defaults['toolbar'] = false;
  SyntaxHighlighter.config.tagName = "hashcode";
  SyntaxHighlighter.all();
  $("head").prepend("<link>");
  var css = $("head").children(":first");
  css.attr({
        rel:  "stylesheet",
        type: "text/css",
        href: "http://cdnjs.cloudflare.com/ajax/libs/SyntaxHighlighter/3.0.83/styles/shCore.min.css"
  });
  $("head").prepend("<link>");
  css = $("head").children(":first");
  css.attr({
        rel:  "stylesheet",
        type: "text/css",
        href: "http://cdnjs.cloudflare.com/ajax/libs/SyntaxHighlighter/3.0.83/styles/shThemeDefault.min.css"
  });
  changeStyles("code {white-space: nowrap}");
  changeStyles(".syntaxhighlighter {width: 695px !important;overflow:auto !important;max-height:400px !important}");
}

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
            $(".prettyprint code").css({"white-space": "nowrap"});
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
  var regexURL= new RegExp("^https?://[^/]+/(?:questions|research)/.+$", "i");
  if (!regexURL.test(location.href)) return; // если не вопрос, то не работаем
  var $qid= $("a.post-vote.up");
  if ($qid.length==0) return; // невозможно включиться
  var qid = $qid.attr("href").replace('/vote/', '').replace('/up', '');
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


};
var script = document.createElement('script');
script.innerHTML = __extension__wrapper__.toString().replace(/^.*?\{|\}.*?$/g, '');
document.getElementsByTagName('head')[0].appendChild(script);

var __addonsStarted= false;

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
    img.src="[DEPLOY:image64]images/icon.png[/DEPLOY]";
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
    htmlDiv+="</TABLE></DIV></TD><TD width='*' valign=top>"+htmlDiv2+"</TD></TR></TABLE></DIV><BUTTON onclick='__saveAddonsSettings()'>Сохранить</BUTTON>";
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


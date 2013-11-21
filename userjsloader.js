var __addonsStarted= false;



function __openSettingsPage(addonName, targetItem) {
    var escapeHtml= function(text) {
      return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
    };
    $("#prev-selected").removeClass("addons-listitem-clicked").addClass("addons-listitem").removeAttr("id");
    targetItem.className='addons-listitem-clicked';
    targetItem.id='prev-selected';
    $(".addons-desc-bl").css("display", "none");
    if ($("#__addonspage"+addonName).html()=="") {
        var html="<div onclick='__clearClicked();' class='addons-desc-ex'>x</div>";
        var settings= __addonsSettings.settings[addonName];
        if (settings==undefined) {
             html= "<div onclick='__clearClicked();' class='addons-desc-ex'>x</div>Настройки отсутствуют";
        } else {
             if (settings.title!=undefined) html+="<h3>"+settings.title+"</h3>";
             if (settings.description!=undefined) html+="<div class='addons-description'>"+settings.description+"</div>";
             if (settings.order!=undefined){
                 for (var i=0; i<settings.order.length; i++) {
                     var paramName= settings.order[i];
                     var paramId= "__addonsSettingsValue"+addonName+"_"+paramName;
                     var param= settings.exports[paramName];
                     html+="<div><div>"+param.title+"</div><div>";
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
                     html+="</div></div>";
                 };
             };
        };
        $("#__addonspage"+addonName).html(html);
    }
    $("#__addonspage"+addonName).css("display", "block");
};

function __clearClicked() {
$(".addons-desc-bl").css("display", "none");
$("#prev-selected").removeClass("addons-listitem-clicked").addClass("addons-listitem").removeAttr("id");  
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
              if (oldSettings.exports== undefined) oldSettings.exports={};
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
    var build= parseInt("[DEPLOY:build][/DEPLOY]");
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
    var css = ".top_nav{float:left;width:680px}.img-bl,.img-bl-clicked{float:left;overflow:hidden;height:16px;width:16px;margin-left:9px;border:2px solid #F5F5F5;cursor:pointer;}.img-bl-clicked{height:18px;border-radius:10px 0px 0px 0px;}.addons-settings-img,.addons-settings-img-clicked{width:16px;height:18px;cursor:pointer;}.addons-settings{display:none;position:absolute;z-index:99;width:546px;height:268px;border-radius:10px 0px 0px 0px }.addons-overflow{overflow-y:auto;height:232px;margin-top:5px;}.addons-listitem,.addons-listitem-clicked{height:20px;width:500px;margin-top:6px;}.addons-listitem-clicked .addon-name span{color:white}.addon-checkbox,.addon-checkbox:hover{float:right; height:20px;width:20px;cursor:pointer;background-color:transparent} .addon-checkbox-clicked,.addon-checkbox-clicked:hover{float:right;height:20px;width:20px;cursor:pointer;background-color:transparent}.addon-name{float:left;height:20px;width:350px;word-wrap:break-word;background-color:transparent;text-align:left}.addon-name span{cursor:pointer}.addon-desc-ico{float:left;width:13px;margin-right:5px;text-align:center;border-radius:20px;color:#fff;font:bold 12px Arial;cursor:pointer}.addons-desc-bl{width:300px;padding:5px;word-wrap:break-word;position:absolute;top:0;left:548px;border-radius: 0px 10px 10px 0px;text-align:left;}.addons-desc-ex{font-weight: bold;float:right;color:red;cursor:pointer;}.addons-but-save,.addons-but-save:hover{float:left;width:70px;margin-top:10px;text-align:center;color:#333333;cursor:pointer;}.addons-but-save:hover{color:#000;}.addons-but-close,.addons-but-close:hover{float:left;width:60px;margin-left:10px;margin-top:10px;text-align:center;color:#333333;cursor:pointer;}.addons-but-close:hover{color:#000;}.addons-save-info{text-align:center;padding-top:10px;}.addons-save-info h3{padding-bottom:10px}";

var sezn = 'hashcode.ru math.hashcode.ru careers.hashcode.ru russ.hashcode.ru games.sezn.ru turism.sezn.ru foto.sezn.ru hm.sezn.ru meta.hashcode.ru admin.hashcode.ru user.hashcode.ru phys.sezn.ru english.sezn.ru'.split(' ');
switch (location.hostname) {
case sezn[0]:
    css += ".img-bl-clicked{border:2px solid #AF7817;background-color:#AF7817;}.addons-settings-img-clicked{background-position: 0 -15px !important;}.addons-settings {border:2px solid #AF7817;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #fbac6f;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #fbac6f;background-color:#AF7817} .addon-checkbox {background-position: 0 -45px !important;} .addon-checkbox:hover {background-position: 0 -70px !important;} .addon-checkbox-clicked{background-position: 0 -95px !important;} .addon-checkbox-clicked:hover{background-position: 0 -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #AF7817;}.addons-desc-bl{border:1px solid #AF7817;background-color:white;}.addons-but-save{border:2px solid #AF7817;background-color:#AF7817;}.addons-but-save:hover{border:2px solid #ECE5B6;background-color:#ECE5B6;}.addons-but-close{border:2px solid #AF7817;background-color:#AF7817;}.addons-but-close:hover{border:2px solid #ECE5B6;background-color:#ECE5B6;}.addons-save-info h3{border-bottom: 1px solid #fbac6f;}";
    break
case sezn[1]:
    css += ".img-bl-clicked{border:2px solid #839C12;background-color:#839C12;}.addons-settings-img{background-position: -24px 0 !important;}.addons-settings-img-clicked{background-position: -24px -15px !important;}.addons-settings {border:2px solid #839C12;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #73A873;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #7DE97D;background-color:#839C12} .addon-checkbox {background-position: -24px -45px !important;} .addon-checkbox:hover {background-position: -24px -70px !important;} .addon-checkbox-clicked{background-position: -24px -95px !important;} .addon-checkbox-clicked:hover{background-position: -24px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #839C12;}.addons-desc-bl{border:1px solid #839C12;background-color:white;}.addons-but-save{border:2px solid #839C12;background-color:#839C12;}.addons-but-save:hover{border:2px solid #CFE961;background-color:#CFE961;}.addons-but-close{border:2px solid #839C12;background-color:#839C12;}.addons-but-close:hover{border:2px solid #CFE961;background-color:#CFE961;}.addons-save-info h3{border-bottom: 1px solid #73A873;}";
    break
case sezn[3]:
    css += ".img-bl-clicked{border:2px solid #078775;background-color:#078775;}.addons-settings-img{background-position: -48px 0 !important;}.addons-settings-img-clicked{background-position: -48px -15px !important;}.addons-settings {border:2px solid #078775;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #68A79D;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #68A79D;background-color:#078775} .addon-checkbox {background-position: -48px -45px !important;} .addon-checkbox:hover {background-position: -48px -70px !important;} .addon-checkbox-clicked{background-position: -48px -95px !important;} .addon-checkbox-clicked:hover{background-position: -48px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #078775;}.addons-desc-bl{border:1px solid #839C12;background-color:white;}.addons-but-save{border:2px solid #078775;background-color:#078775;}.addons-but-save:hover{border:2px solid #5BCCBB;background-color:#5BCCBB;}.addons-but-close{border:2px solid #078775;background-color:#078775;}.addons-but-close:hover{border:2px solid #5BCCBB;background-color:#5BCCBB;}.addons-save-info h3{border-bottom: 1px solid #68A79D;}";
    break
case sezn[4]:
    css += ".img-bl-clicked{border:2px solid #7D8C8B;background-color:#7D8C8B;}.addons-settings-img{background-position: -72px 0 !important;}.addons-settings-img-clicked{background-position: -72px -15px !important;}.addons-settings {border:2px solid #7D8C8B;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #929B92;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #929B92;background-color:#7D8C8B} .addon-checkbox {background-position: -72px -45px !important;} .addon-checkbox:hover {background-position: -72px -70px !important;} .addon-checkbox-clicked{background-position: -72px -95px !important;} .addon-checkbox-clicked:hover{background-position: -72px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #7D8C8B;}.addons-desc-bl{border:1px solid #7D8C8B;background-color:white;}.addons-but-save{border:2px solid #7D8C8B;background-color:#7D8C8B;}.addons-but-save:hover{border:2px solid #AABFBD;background-color:#AABFBD;}.addons-but-close{border:2px solid #7D8C8B;background-color:#7D8C8B;}.addons-but-close:hover{border:2px solid #AABFBD;background-color:#AABFBD;}.addons-save-info h3{border-bottom: 1px solid #929B92;}";
    break
case sezn[5]:
    css += ".img-bl-clicked{border:2px solid #037f00;background-color:#037f00;}.addons-settings-img{background-position: -96px 0 !important;}.addons-settings-img-clicked{background-position: -96px -15px !important;}.addons-settings {border:2px solid #037f00;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #167516;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #167516;background-color:#037f00} .addon-checkbox {background-position: -96px -45px !important;} .addon-checkbox:hover {background-position: -96px -70px !important;} .addon-checkbox-clicked{background-position: -96px -95px !important;} .addon-checkbox-clicked:hover{background-position: -96px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #037f00;}.addons-desc-bl{border:1px solid #037f00;background-color:white;}.addons-but-save{border:2px solid #037f00;background-color:#037f00;}.addons-but-save:hover{border:2px solid #4bca5d;background-color:#4bca5d;}.addons-but-close{border:2px solid #037f00;background-color:#037f00;}.addons-but-close:hover{border:2px solid #4bca5d;background-color:#4bca5d;}.addons-save-info h3{border-bottom: 1px solid #167516;}";
    break
case sezn[6]:
    css += ".img-bl-clicked{border:2px solid #751f5b;background-color:#751f5b;}.addons-settings-img{background-position: -120px 0 !important;}.addons-settings-img-clicked{background-position: -120px -15px !important;}.addons-settings {border:2px solid #751f5b;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #72457F;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #72457F;background-color:#751f5b} .addon-checkbox {background-position: -120px -45px !important;} .addon-checkbox:hover {background-position: -120px -70px !important;} .addon-checkbox-clicked{background-position: -120px -95px !important;} .addon-checkbox-clicked:hover{background-position: -120px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #751f5b;}.addons-desc-bl{border:1px solid #751f5b;background-color:white;}.addons-but-save{border:2px solid #751f5b;background-color:#751f5b;}.addons-but-save:hover{border:2px solid #c1b7ad;background-color:#c1b7ad;}.addons-but-close{border:2px solid #751f5b;background-color:#751f5b;}.addons-but-close:hover{border:2px solid #c1b7ad;background-color:#c1b7ad;}.addons-save-info h3{border-bottom: 1px solid #72457F;}";
    break
case sezn[7]:
    css += ".img-bl-clicked{border:2px solid #cf3939;background-color:#cf3939;}.addons-settings-img{background-position: -144px 0 !important;}.addons-settings-img-clicked{background-position: -144px -16px !important;}.addons-settings {border:2px solid #cf3939;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #BD2424;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #BD2424;background-color:#cf3939} .addon-checkbox {background-position: -144px -45px !important;} .addon-checkbox:hover {background-position: -144px -70px !important;} .addon-checkbox-clicked{background-position: -144px -95px !important;} .addon-checkbox-clicked:hover{background-position: -144px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #cf3939;}.addons-desc-bl{border:1px solid #cf3939;background-color:white;}.addons-but-save{border:2px solid #cf3939;background-color:#cf3939;}.addons-but-save:hover{border:2px solid #d3dddf;background-color:#d3dddf;}.addons-but-close{border:2px solid #cf3939;background-color:#cf3939;}.addons-but-close:hover{border:2px solid #d3dddf;background-color:#d3dddf;}.addons-save-info h3{border-bottom: 1px solid #BD2424;}";
    break
case sezn[8]:
    css += ".img-bl-clicked{border:2px solid #5E7BD6;background-color:#5E7BD6;}.addons-settings-img{background-position: -168px 0 !important;}.addons-settings-img-clicked{background-position: -168px -15px !important;}.addons-settings {border:2px solid #5E7BD6;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #3F5CA8;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #3F5CA8;background-color:#5E7BD6} .addon-checkbox {background-position: -168px -45px !important;} .addon-checkbox:hover {background-position: -168px -70px !important;} .addon-checkbox-clicked{background-position: -168px -95px !important;} .addon-checkbox-clicked:hover{background-position: -168px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #5E7BD6;}.addons-desc-bl{border:1px solid #5E7BD6;background-color:white;}.addons-but-save{border:2px solid #5E7BD6;background-color:#5E7BD6;}.addons-but-save:hover{border:2px solid #A4B1DD;background-color:#A4B1DD;}.addons-but-close{border:2px solid #5E7BD6;background-color:#5E7BD6;}.addons-but-close:hover{border:2px solid #A4B1DD;background-color:#A4B1DD;}.addons-save-info h3{border-bottom: 1px solid #3F5CA8;}";
    break
case sezn[9]:
    css += ".img-bl-clicked{border:2px solid #A68221;background-color:#A68221;}.addons-settings-img{background-position: -192px 0 !important;}.addons-settings-img-clicked{background-position: -192px -15px !important;}.addons-settings {border:2px solid #A68221;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #B19E3A;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #B19E3A;background-color:#A68221} .addon-checkbox {background-position: -192px -45px !important;} .addon-checkbox:hover {background-position: -192px -70px !important;} .addon-checkbox-clicked{background-position: -192px -95px !important;} .addon-checkbox-clicked:hover{background-position: -192px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #A68221;}.addons-desc-bl{border:1px solid #A68221;background-color:white;}.addons-but-save{border:2px solid #A68221;background-color:#A68221;}.addons-but-save:hover{border:2px solid #E5D095;background-color:#E5D095;}.addons-but-close{border:2px solid #A68221;background-color:#A68221;}.addons-but-close:hover{border:2px solid #E5D095;background-color:#E5D095;}.addons-save-info h3{border-bottom: 1px solid #B19E3A;}";
    break
case sezn[10]:
    css += ".img-bl-clicked{border:2px solid #839C12;background-color:#839C12;}.addons-settings-img{background-position: -216px 0 !important;}.addons-settings-img-clicked{background-position: -216px -15px !important;}.addons-settings {border:2px solid #839C12;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #4E9E4E;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #4E9E4E;background-color:#839C12} .addon-checkbox {background-position: -216px -45px !important;} .addon-checkbox:hover {background-position: -216px -70px !important;} .addon-checkbox-clicked{background-position: -216px -95px !important;} .addon-checkbox-clicked:hover{background-position: -216px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #839C12;}.addons-desc-bl{border:1px solid #839C12;background-color:white;}.addons-but-save{border:2px solid #839C12;background-color:#839C12;}.addons-but-save:hover{border:2px solid #90c235;background-color:#90c235;}.addons-but-close{border:2px solid #839C12;background-color:#839C12;}.addons-but-close:hover{border:2px solid #90c235;background-color:#90c235;}.addons-save-info h3{border-bottom: 1px solid #4E9E4E;}";
    break
case sezn[11]:
    css += ".img-bl-clicked{border:2px solid #146695;background-color:#146695;}.addons-settings-img{background-position: -240px 0 !important;}.addons-settings-img-clicked{background-position: -240px -15px !important;}.addons-settings {border:2px solid #146695;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #42679E;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #42679E;background-color:#146695} .addon-checkbox {background-position: -240px -45px !important;} .addon-checkbox:hover {background-position: -240px -70px !important;} .addon-checkbox-clicked{background-position: -240px -95px !important;} .addon-checkbox-clicked:hover{background-position: -240px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #146695;}.addons-desc-bl{border:1px solid #146695;background-color:white;}.addons-but-save{border:2px solid #146695;background-color:#146695;}.addons-but-save:hover{border:2px solid #a2e4fe;background-color:#a2e4fe;}.addons-but-close{border:2px solid #146695;background-color:#146695;}.addons-but-close:hover{border:2px solid #a2e4fe;background-color:#a2e4fe;}.addons-save-info h3{border-bottom: 1px solid #42679E;}";
    break
case sezn[12]:
    css += ".img-bl-clicked{border:2px solid #bd0e27;background-color:#bd0e27;}.addons-settings-img{background-position: -264px 0 !important;}.addons-settings-img-clicked{background-position: -264px -15px !important;}.addons-settings {border:2px solid #bd0e27;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #913030;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #913030;background-color:#bd0e27} .addon-checkbox {background-position: -264px -45px !important;} .addon-checkbox:hover {background-position: -264px -70px !important;} .addon-checkbox-clicked{background-position: -264px -95px !important;} .addon-checkbox-clicked:hover{background-position: -264px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #bd0e27;}.addons-desc-bl{border:1px solid #bd0e27;background-color:white;}.addons-but-save{border:2px solid #bd0e27;background-color:#bd0e27;}.addons-but-save:hover{border:2px solid #7c9dd2;background-color:#7c9dd2;}.addons-but-close{border:2px solid #bd0e27;background-color:#bd0e27;}.addons-but-close:hover{border:2px solid #7c9dd2;background-color:#7c9dd2;}.addons-save-info h3{border-bottom: 1px solid #913030;}";
    break
}
    __addonsAddCSS(css);
    
 var img_div = document.createElement('div');
 img_div.className = "img-bl";
 var toplink_div = document.createElement('div');
 toplink_div.className = "toplink_bl";
 var img = document.createElement('div');
 img.className = "addons-settings-img";
 var img_src = "url(http://i.imgur.com/MzRiTMT.png) no-repeat";
 $(img).css("background", img_src);
 img.onclick = function (e) {
     if (div1.style.display == "block") {
         div1.style.display = "none";
         $(".img-bl-clicked").removeClass("img-bl-clicked").addClass("img-bl");
         $(".addons-settings-img-clicked").removeClass("addons-settings-img-clicked").addClass("addons-settings-img");
     } else {
         __clearClicked();
         div1.style.display = "block";
         $(".img-bl").removeClass("img-bl").addClass("img-bl-clicked");
         $(".addons-settings-img").removeClass("addons-settings-img").addClass("addons-settings-img-clicked");
     };
 };
 $(img_div).insertAfter($("#searchBar div a")[0]);
 img_div.appendChild(img);
 $("#searchBar div a, #searchBar div span").wrapAll("<div class='top_nav'></div>");
 var imgRect = img.getBoundingClientRect();

 var div1 = document.createElement("div");
 div1.className = "addons-settings";
 div1.id = "__div_options";
 var htmlDiv = "<DIV class='addons-overflow'>";
 var htmlDiv2 = "";

 for (var i in __addons) {
     try {
         var name = __addonsSettings.settings[__addons[i]].title;
     } catch (e) {
         var name = __addons[i].replace("__", "");
     };
     htmlDiv += "<DIV class='addons-listitem' onclick='__openSettingsPage(\"" + __addons[i] + "\", this);'><SPAN class='addon-desc-ico'>?</SPAN><DIV class='addon-name'><SPAN>" + name + "</SPAN></DIV>";
     htmlDiv += "<DIV id=\"" + __addons[i] + "\" class='addon-checkbox'  onclick='event.stopPropagation();__toogleEnabled(\"" + __addons[i] + "\", this);' style='background: \"" + img_src + "\"'></DIV></DIV>";
     htmlDiv2 += "<DIV class='addons-desc-bl' id='__addonspage" + __addons[i] + "'></DIV>";
 };
 htmlDiv += "</DIV><DIV>" + htmlDiv2 + "</DIV><DIV class='addons-but-save' onclick='__saveAddonsSettings()'>Сохранить</DIV> <DIV class='addons-but-close' onclick='this.parentNode.style.display=\"none\";$(\".img-bl-clicked\").removeClass(\"img-bl-clicked\").addClass(\"img-bl\");$(\".addons-settings-img-clicked\").removeClass(\"addons-settings-img-clicked\").addClass(\"addons-settings-img\");'>Закрыть</DIV>";
 //console.log(htmlDiv);
 div1.style.left = ((imgRect.left + (window.pageXOffset || document.body.scrollLeft) - (document.body.clientLeft || 0)) - 532) + "px";
 div1.innerHTML = htmlDiv;
 img_div.appendChild(div1);
 for (var i in __addons) {
     $('#' + __addons[i] + '').css("background", img_src);
     if (localStorage["__Enable__" + __addons[i]] == "yes") {
         window[__addons[i]]();
         $('#' + __addons[i] + '').removeClass("addon-checkbox").addClass("addon-checkbox-clicked");
     } else $('#' + __addons[i] + '').removeClass("addon-checkbox-clicked").addClass("addon-checkbox");
 }
 };//////тествафцфцвыуа

document.addEventListener( "DOMContentLoaded", __addonLoader, false );
var __check__Started= function(){
    if (!__addonsStarted) __addonLoader();
};
var __checkStartedInterval= window.setInterval(__check__Started, 50);


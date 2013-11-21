// ==UserScript==
// @name            HashCode Addons 
// @include         http://hashcode.ru/*
// @include         http://*.hashcode.ru/*
// @include         http://bitcode.ru/*
// @include         http://rootcode.ru/*
// @include         http://*.sezn.ru/*
// ==/UserScript==

function __extension__wrapper__(){

﻿addonsLoader= {
    /** Все аддоны как объекты */
    addons: {},
    /** Произошел ли запуск аддонов */
    started: false,
    interval: null,
    checkStarted: function() {
        if (!this.started) addonsLoader.init();
    },
    storage: null,
    /** Можно ли отложить сохранение storage, или выполнять немедленно */
    delayedSave: true,
    commitStorage: function() {
        this.delayedSave= false;
        this.saveStorage();
    },
    
    init: function() {
        if (typeof($)=="undefined" || this==document) return;
        window.clearInterval(this.interval);
        this.started= true;
        for (var i in __addons) {
            this.addons[__addons[i].name]= __addons[i];
        };
        try {
            this.storage= JSON.parse( localStorage['__addonsSettings'] );
            if ( typeof(this.storage.enabledAddons)=="undefined" || typeof(this.storage.addonsSettings)=="undefined" ) throws();
        } catch(e) {
            console.log( "Ошибка при загрузке данных\n"+ localStorage['__addonsSettings']);
            this.storage= { enabledAddons:{}, addonsSettings:{} };
            this.saveStorage();
        };
        var build= parseInt("[DEPLOY:build][/DEPLOY]");
        window.addEventListener("message", this.setSettingsListener, false);
        this.API.addCSS(this.getCssByDomain(location.hostname));
        
        var img_div = document.createElement('div');
        img_div.className = "img-bl";
        var toplink_div = document.createElement('div');
        toplink_div.className = "toplink_bl";
        var img = document.createElement('div');
        img.className = "addons-settings-img";
        var img_src = "url(data:image/png;base64,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) no-repeat";
        $(img).css("background", img_src);
        img.onclick = function (e) {
            if (div1.style.display == "block") {
                div1.style.display = "none";
                $(".img-bl-clicked").removeClass("img-bl-clicked").addClass("img-bl");
                $(".addons-settings-img-clicked").removeClass("addons-settings-img-clicked").addClass("addons-settings-img");
            } else {
                window.addonsLoader.clearClicked();
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
            htmlDiv += "<DIV class='addons-listitem' onclick='window.addonsLoader.openSettingsPage(\"" + __addons[i].name + "\", this);'><SPAN class='addon-desc-ico'>?</SPAN><DIV class='addon-name'><SPAN>" + __addons[i].title + "</SPAN></DIV>";
            htmlDiv += "<DIV id=\"" + __addons[i].name + "\" class='addon-checkbox'  onclick='event.stopPropagation();__toogleEnabled(\"" + __addons[i].name + "\", this);' style='background: \"" + img_src + "\"'></DIV></DIV>";
            htmlDiv2 += "<DIV class='addons-desc-bl' id='__addonspage" + __addons[i].name + "'></DIV>";
        };
        htmlDiv += "</DIV><DIV>" + htmlDiv2 + "</DIV><DIV class='addons-but-save' onclick='window.addonsLoader.migrateStorageToSezn()'>Сохранить</DIV> <DIV class='addons-but-close' onclick='this.parentNode.style.display=\"none\";$(\".img-bl-clicked\").removeClass(\"img-bl-clicked\").addClass(\"img-bl\");$(\".addons-settings-img-clicked\").removeClass(\"addons-settings-img-clicked\").addClass(\"addons-settings-img\");'>Закрыть</DIV>";
        //console.log(htmlDiv);
        div1.style.left = ((imgRect.left + (window.pageXOffset || document.body.scrollLeft) - (document.body.clientLeft || 0)) - 532) + "px";
        div1.innerHTML = htmlDiv;
        img_div.appendChild(div1);
        for (var i in __addons) {
            $('#' + __addons[i].name + '').css("background", img_src);
            if (this.storage.enabledAddons[__addons[i].name] == "yes") {
                __addons[i].run();
                $('#' + __addons[i].name + '').removeClass("addon-checkbox").addClass("addon-checkbox-clicked");
            } else $('#' + __addons[i].name + '').removeClass("addon-checkbox-clicked").addClass("addon-checkbox");
        }
        this.commitStorage();
    },
    
    /** Создает уникальные имена для настроек. Так как эта функция будет присвоена объекту-аддону, то this это ссылка на объект-аддон. */
    namesResolver: function(name) {
            return this.name+"_setting_"+name;
    },
    
    /** Отрисовщик блока настроек по-умолчанию, возвращает HTML блока настроек, получает уже имеющийся HTML. Так как эта функция будет присвоена объекту-аддону, то this это ссылка на объект-аддон. */
    defaultDrawer: function(html) {
        var API= window.addonsLoader.API;
        if (typeof(this.settings)=="undefined") {
             html+= "<div onclick='window.addonsLoader.clearClicked();' class='addons-desc-ex'>x</div>Настройки отсутствуют";
        } else {
             if (typeof(this.settings.title)=="undefined") html+="<h3>"+this.settings.title+"</h3>";
             if (typeof(this.settings.description)=="undefined") html+="<div class='addons-description'>"+this.settings.description+"</div>";
             if (typeof(this.settings.exports)=="undefined"){
                 for (var i=0; i<this.settings.exports.length; i++) {
                     var param= this.settings.exports[i];
                     var paramId= this.namesResolver(param.name);
                     var paramValue= this.settings[param.name];
                     html+="<div><div>"+param.title+"</div><div>";
                     if (param.type=='text') {
                         html+="<INPUT type='text' value='"+API.escapeHtml(paramValue)+"' name='"+paramId+"' >";
                     } else if (param.type=='checkbox') {
                         html+="<INPUT type='checkbox' name='"+paramId+"' ";
                         if (paramValue!='0' && paramValue!=0) html+="checked ";
                         html+=">";
                     } else if (param.type=='radio'){
                         for (var j in param.options) {
                             html+="<LABEL><INPUT type='radio' value='"+escapeHtml(j)+"' name='"+paramId+"' ";
                             if (j==paramValue) html+="checked ";
                             html+=">"+param.options[j]+"</LABEL>";
                         }
                     } else if (param.type=='select') {
                         html+="<SELECT name='"+paramId+"' value='"+escapeHtml(paramValue)+"'>";
                         for (var j in param.options) {
                             html+="<OPTION value='"+escapeHtml(j)+"' ";
                             if (j==paramValue) html+= "selected ";
                             html+=">"+param.options[j]+"</OPTION>";
                         };
                         html+="</SELECT>";
                     };
                     html+="</div></div>";
                 };
             };
        };
        return html;
    },
    
    /** Показывает страницу настроек аддона. Если страница пуста вызывает отрисовщик, если отрисовщика нет, то назначает отрисовщик по-умолчанию. */
    openSettingsPage: function(addonName, targetItem) {
        console.log(addonName);
        $("#prev-selected").removeClass("addons-listitem-clicked").addClass("addons-listitem").removeAttr("id");
        targetItem.className='addons-listitem-clicked';
        targetItem.id='prev-selected';
        $(".addons-desc-bl").css("display", "none");
        if ($("#__addonspage"+addonName).html()=="") {
            console.log(this); // TODO
            if (typeof(this.addons[addonName].namesResolver)!="function") this.addons[addonName].namesResolver= this.namesResolver;
            if (typeof(this.addons[addonName].drawer)!="function") this.addons[addonName].drawer= this.defaultDrawer;
            $("#__addonspage"+addonName).html(
                this.addons[addonName].drawer("<div onclick='__clearClicked();' class='addons-desc-ex'>x</div>") );
        };
    },
    
    /** Сохраняет storage, если нельзя отложить (микрооптимизация) */
    saveStorage: function() {
        if (!this.delayedSave) {
            localStorage['__addonsSettings']= JSON.stringify(this.storage);
        };
    },
    /** включается в аддон как saveSettings */
    saveAddonSettings: function() {
        window.addonsLoader.storage[this.name]=this.settings;
        window.addonsLoader.saveStorage();
    },
    /** слушает когда придет сообщение установить настройки (используется в iframe для миграции) */
    setSettingsListener: function(message, url){
        if (message.data.substring(0, 12)=="SetSettings:"){
            this.storage= JSON.parse(message.data.substring(12));
            this.saveStorage();
            message.source.postMessage("SettingsSets:"+location.hostname, '*');
        }
    },
    
    sezn: 'hashcode.ru math.hashcode.ru careers.hashcode.ru russ.hashcode.ru games.sezn.ru turism.sezn.ru foto.sezn.ru hm.sezn.ru meta.hashcode.ru admin.hashcode.ru user.hashcode.ru phys.sezn.ru english.sezn.ru'.split(' '),
    
    migrateStorageToSezn: function() {
        var frames={};
        window.addEventListener("message", function(message, url){
            if (message.data.substring(0, 13)=="SettingsSets:"){
                frames[message.data.substring(13)][1]=true;
            }
        });
        $("#__div_options").html("<h3>Идет сохранение настроек, это может занять некоторое время</h3><br/>Сохранено <span id='__addons_span_count'>0</span> сайтов из "+sezn.length);
        for (var i=0; i<this.sezn.length; i++) {
            if (location.hostname!=this.sezn[i]){
                var frame= document.createElement("iframe");
                frame.width=frame.height='1px';
                frame.onload= function(){
                    var iframe=this;
                    window.setTimeout(function(){
                            console.log(this.storage); // TODO проверить, удалить
                            iframe.contentWindow.postMessage("SetSettings:"+JSON.stringify(this.storage), "*");
                        }, 1500, false);
                };
                frame.src='http://'+this.sezn[i]+"/about/";
                frames[this.sezn[i]]=[frame, false];
                document.body.appendChild(frame);
            } else {
                frames[this.sezn[i]]=[null, true];
            }
        };
        var framesChecker= function(){
            var count=0;
            for (var i=0; i<this.sezn.length; i++) {
                if (frames[this.sezn[i]][1]) {
                    count++;
                }
            };
            $("#__addons_span_count").html(count);
            if (count==this.sezn.length) {
                window.clearInterval(intervalFramesCheck);
                location.reload();
            };
        };
        var intervalFramesCheck= window.setInterval(framesChecker, 1000, false);
    },
    
    clearClicked: function() {
        $(".addons-desc-bl").css("display", "none");
        $("#prev-selected").removeClass("addons-listitem-clicked").addClass("addons-listitem").removeAttr("id");
    },
    
    getCssByDomain: function (domain) {
        var css = ".top_nav{float:left;width:680px}.img-bl,.img-bl-clicked{float:left;overflow:hidden;height:16px;width:16px;margin-left:9px;border:2px solid #F5F5F5;cursor:pointer;}.img-bl-clicked{height:18px;border-radius:10px 0px 0px 0px;}.addons-settings-img,.addons-settings-img-clicked{width:16px;height:18px;cursor:pointer;}.addons-settings{display:none;position:absolute;z-index:99;width:546px;height:268px;border-radius:10px 0px 0px 0px }.addons-overflow{overflow-y:auto;height:232px;margin-top:5px;}.addons-listitem,.addons-listitem-clicked{height:20px;width:500px;margin-top:6px;}.addons-listitem-clicked .addon-name span{color:white}.addon-checkbox,.addon-checkbox:hover{float:right; height:20px;width:20px;cursor:pointer;background-color:transparent} .addon-checkbox-clicked,.addon-checkbox-clicked:hover{float:right;height:20px;width:20px;cursor:pointer;background-color:transparent}.addon-name{float:left;height:20px;width:350px;word-wrap:break-word;background-color:transparent;text-align:left}.addon-name span{cursor:pointer}.addon-desc-ico{float:left;width:13px;margin-right:5px;text-align:center;border-radius:20px;color:#fff;font:bold 12px Arial;cursor:pointer}.addons-desc-bl{width:300px;padding:5px;word-wrap:break-word;position:absolute;top:0;left:548px;border-radius: 0px 10px 10px 0px;text-align:left;}.addons-desc-ex{font-weight: bold;float:right;color:red;cursor:pointer;}.addons-but-save,.addons-but-save:hover{float:left;width:70px;margin-top:10px;text-align:center;color:#333333;cursor:pointer;}.addons-but-save:hover{color:#000;}.addons-but-close,.addons-but-close:hover{float:left;width:60px;margin-left:10px;margin-top:10px;text-align:center;color:#333333;cursor:pointer;}.addons-but-close:hover{color:#000;}.addons-save-info{text-align:center;padding-top:10px;}.addons-save-info h3{padding-bottom:10px}";
        switch (domain) {
            case this.sezn[0]:
                css += ".img-bl-clicked{border:2px solid #AF7817;background-color:#AF7817;}.addons-settings-img-clicked{background-position: 0 -15px !important;}.addons-settings {border:2px solid #AF7817;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #fbac6f;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #fbac6f;background-color:#AF7817} .addon-checkbox {background-position: 0 -45px !important;} .addon-checkbox:hover {background-position: 0 -70px !important;} .addon-checkbox-clicked{background-position: 0 -95px !important;} .addon-checkbox-clicked:hover{background-position: 0 -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #AF7817;}.addons-desc-bl{border:1px solid #AF7817;background-color:white;}.addons-but-save{border:2px solid #AF7817;background-color:#AF7817;}.addons-but-save:hover{border:2px solid #ECE5B6;background-color:#ECE5B6;}.addons-but-close{border:2px solid #AF7817;background-color:#AF7817;}.addons-but-close:hover{border:2px solid #ECE5B6;background-color:#ECE5B6;}.addons-save-info h3{border-bottom: 1px solid #fbac6f;}";
                break
            case this.sezn[1]:
                css += ".img-bl-clicked{border:2px solid #839C12;background-color:#839C12;}.addons-settings-img{background-position: -24px 0 !important;}.addons-settings-img-clicked{background-position: -24px -15px !important;}.addons-settings {border:2px solid #839C12;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #73A873;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #7DE97D;background-color:#839C12} .addon-checkbox {background-position: -24px -45px !important;} .addon-checkbox:hover {background-position: -24px -70px !important;} .addon-checkbox-clicked{background-position: -24px -95px !important;} .addon-checkbox-clicked:hover{background-position: -24px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #839C12;}.addons-desc-bl{border:1px solid #839C12;background-color:white;}.addons-but-save{border:2px solid #839C12;background-color:#839C12;}.addons-but-save:hover{border:2px solid #CFE961;background-color:#CFE961;}.addons-but-close{border:2px solid #839C12;background-color:#839C12;}.addons-but-close:hover{border:2px solid #CFE961;background-color:#CFE961;}.addons-save-info h3{border-bottom: 1px solid #73A873;}";
                break
            case this.sezn[3]:
                css += ".img-bl-clicked{border:2px solid #078775;background-color:#078775;}.addons-settings-img{background-position: -48px 0 !important;}.addons-settings-img-clicked{background-position: -48px -15px !important;}.addons-settings {border:2px solid #078775;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #68A79D;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #68A79D;background-color:#078775} .addon-checkbox {background-position: -48px -45px !important;} .addon-checkbox:hover {background-position: -48px -70px !important;} .addon-checkbox-clicked{background-position: -48px -95px !important;} .addon-checkbox-clicked:hover{background-position: -48px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #078775;}.addons-desc-bl{border:1px solid #839C12;background-color:white;}.addons-but-save{border:2px solid #078775;background-color:#078775;}.addons-but-save:hover{border:2px solid #5BCCBB;background-color:#5BCCBB;}.addons-but-close{border:2px solid #078775;background-color:#078775;}.addons-but-close:hover{border:2px solid #5BCCBB;background-color:#5BCCBB;}.addons-save-info h3{border-bottom: 1px solid #68A79D;}";
                break
            case this.sezn[4]:
                css += ".img-bl-clicked{border:2px solid #7D8C8B;background-color:#7D8C8B;}.addons-settings-img{background-position: -72px 0 !important;}.addons-settings-img-clicked{background-position: -72px -15px !important;}.addons-settings {border:2px solid #7D8C8B;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #929B92;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #929B92;background-color:#7D8C8B} .addon-checkbox {background-position: -72px -45px !important;} .addon-checkbox:hover {background-position: -72px -70px !important;} .addon-checkbox-clicked{background-position: -72px -95px !important;} .addon-checkbox-clicked:hover{background-position: -72px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #7D8C8B;}.addons-desc-bl{border:1px solid #7D8C8B;background-color:white;}.addons-but-save{border:2px solid #7D8C8B;background-color:#7D8C8B;}.addons-but-save:hover{border:2px solid #AABFBD;background-color:#AABFBD;}.addons-but-close{border:2px solid #7D8C8B;background-color:#7D8C8B;}.addons-but-close:hover{border:2px solid #AABFBD;background-color:#AABFBD;}.addons-save-info h3{border-bottom: 1px solid #929B92;}";
                break
            case this.sezn[5]:
                css += ".img-bl-clicked{border:2px solid #037f00;background-color:#037f00;}.addons-settings-img{background-position: -96px 0 !important;}.addons-settings-img-clicked{background-position: -96px -15px !important;}.addons-settings {border:2px solid #037f00;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #167516;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #167516;background-color:#037f00} .addon-checkbox {background-position: -96px -45px !important;} .addon-checkbox:hover {background-position: -96px -70px !important;} .addon-checkbox-clicked{background-position: -96px -95px !important;} .addon-checkbox-clicked:hover{background-position: -96px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #037f00;}.addons-desc-bl{border:1px solid #037f00;background-color:white;}.addons-but-save{border:2px solid #037f00;background-color:#037f00;}.addons-but-save:hover{border:2px solid #4bca5d;background-color:#4bca5d;}.addons-but-close{border:2px solid #037f00;background-color:#037f00;}.addons-but-close:hover{border:2px solid #4bca5d;background-color:#4bca5d;}.addons-save-info h3{border-bottom: 1px solid #167516;}";
                break
            case this.sezn[6]:
                css += ".img-bl-clicked{border:2px solid #751f5b;background-color:#751f5b;}.addons-settings-img{background-position: -120px 0 !important;}.addons-settings-img-clicked{background-position: -120px -15px !important;}.addons-settings {border:2px solid #751f5b;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #72457F;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #72457F;background-color:#751f5b} .addon-checkbox {background-position: -120px -45px !important;} .addon-checkbox:hover {background-position: -120px -70px !important;} .addon-checkbox-clicked{background-position: -120px -95px !important;} .addon-checkbox-clicked:hover{background-position: -120px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #751f5b;}.addons-desc-bl{border:1px solid #751f5b;background-color:white;}.addons-but-save{border:2px solid #751f5b;background-color:#751f5b;}.addons-but-save:hover{border:2px solid #c1b7ad;background-color:#c1b7ad;}.addons-but-close{border:2px solid #751f5b;background-color:#751f5b;}.addons-but-close:hover{border:2px solid #c1b7ad;background-color:#c1b7ad;}.addons-save-info h3{border-bottom: 1px solid #72457F;}";
                break
            case this.sezn[7]:
                css += ".img-bl-clicked{border:2px solid #cf3939;background-color:#cf3939;}.addons-settings-img{background-position: -144px 0 !important;}.addons-settings-img-clicked{background-position: -144px -16px !important;}.addons-settings {border:2px solid #cf3939;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #BD2424;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #BD2424;background-color:#cf3939} .addon-checkbox {background-position: -144px -45px !important;} .addon-checkbox:hover {background-position: -144px -70px !important;} .addon-checkbox-clicked{background-position: -144px -95px !important;} .addon-checkbox-clicked:hover{background-position: -144px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #cf3939;}.addons-desc-bl{border:1px solid #cf3939;background-color:white;}.addons-but-save{border:2px solid #cf3939;background-color:#cf3939;}.addons-but-save:hover{border:2px solid #d3dddf;background-color:#d3dddf;}.addons-but-close{border:2px solid #cf3939;background-color:#cf3939;}.addons-but-close:hover{border:2px solid #d3dddf;background-color:#d3dddf;}.addons-save-info h3{border-bottom: 1px solid #BD2424;}";
                break
            case this.sezn[8]:
                css += ".img-bl-clicked{border:2px solid #5E7BD6;background-color:#5E7BD6;}.addons-settings-img{background-position: -168px 0 !important;}.addons-settings-img-clicked{background-position: -168px -15px !important;}.addons-settings {border:2px solid #5E7BD6;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #3F5CA8;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #3F5CA8;background-color:#5E7BD6} .addon-checkbox {background-position: -168px -45px !important;} .addon-checkbox:hover {background-position: -168px -70px !important;} .addon-checkbox-clicked{background-position: -168px -95px !important;} .addon-checkbox-clicked:hover{background-position: -168px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #5E7BD6;}.addons-desc-bl{border:1px solid #5E7BD6;background-color:white;}.addons-but-save{border:2px solid #5E7BD6;background-color:#5E7BD6;}.addons-but-save:hover{border:2px solid #A4B1DD;background-color:#A4B1DD;}.addons-but-close{border:2px solid #5E7BD6;background-color:#5E7BD6;}.addons-but-close:hover{border:2px solid #A4B1DD;background-color:#A4B1DD;}.addons-save-info h3{border-bottom: 1px solid #3F5CA8;}";
                break
            case this.sezn[9]:
                css += ".img-bl-clicked{border:2px solid #A68221;background-color:#A68221;}.addons-settings-img{background-position: -192px 0 !important;}.addons-settings-img-clicked{background-position: -192px -15px !important;}.addons-settings {border:2px solid #A68221;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #B19E3A;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #B19E3A;background-color:#A68221} .addon-checkbox {background-position: -192px -45px !important;} .addon-checkbox:hover {background-position: -192px -70px !important;} .addon-checkbox-clicked{background-position: -192px -95px !important;} .addon-checkbox-clicked:hover{background-position: -192px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #A68221;}.addons-desc-bl{border:1px solid #A68221;background-color:white;}.addons-but-save{border:2px solid #A68221;background-color:#A68221;}.addons-but-save:hover{border:2px solid #E5D095;background-color:#E5D095;}.addons-but-close{border:2px solid #A68221;background-color:#A68221;}.addons-but-close:hover{border:2px solid #E5D095;background-color:#E5D095;}.addons-save-info h3{border-bottom: 1px solid #B19E3A;}";
                break
            case this.sezn[10]:
                css += ".img-bl-clicked{border:2px solid #839C12;background-color:#839C12;}.addons-settings-img{background-position: -216px 0 !important;}.addons-settings-img-clicked{background-position: -216px -15px !important;}.addons-settings {border:2px solid #839C12;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #4E9E4E;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #4E9E4E;background-color:#839C12} .addon-checkbox {background-position: -216px -45px !important;} .addon-checkbox:hover {background-position: -216px -70px !important;} .addon-checkbox-clicked{background-position: -216px -95px !important;} .addon-checkbox-clicked:hover{background-position: -216px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #839C12;}.addons-desc-bl{border:1px solid #839C12;background-color:white;}.addons-but-save{border:2px solid #839C12;background-color:#839C12;}.addons-but-save:hover{border:2px solid #90c235;background-color:#90c235;}.addons-but-close{border:2px solid #839C12;background-color:#839C12;}.addons-but-close:hover{border:2px solid #90c235;background-color:#90c235;}.addons-save-info h3{border-bottom: 1px solid #4E9E4E;}";
                break
            case this.sezn[11]:
                css += ".img-bl-clicked{border:2px solid #146695;background-color:#146695;}.addons-settings-img{background-position: -240px 0 !important;}.addons-settings-img-clicked{background-position: -240px -15px !important;}.addons-settings {border:2px solid #146695;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #42679E;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #42679E;background-color:#146695} .addon-checkbox {background-position: -240px -45px !important;} .addon-checkbox:hover {background-position: -240px -70px !important;} .addon-checkbox-clicked{background-position: -240px -95px !important;} .addon-checkbox-clicked:hover{background-position: -240px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #146695;}.addons-desc-bl{border:1px solid #146695;background-color:white;}.addons-but-save{border:2px solid #146695;background-color:#146695;}.addons-but-save:hover{border:2px solid #a2e4fe;background-color:#a2e4fe;}.addons-but-close{border:2px solid #146695;background-color:#146695;}.addons-but-close:hover{border:2px solid #a2e4fe;background-color:#a2e4fe;}.addons-save-info h3{border-bottom: 1px solid #42679E;}";
                break
            case this.sezn[12]:
                css += ".img-bl-clicked{border:2px solid #bd0e27;background-color:#bd0e27;}.addons-settings-img{background-position: -264px 0 !important;}.addons-settings-img-clicked{background-position: -264px -15px !important;}.addons-settings {border:2px solid #bd0e27;background-color: #EEEEEE;}.addons-listitem {border-bottom: 1px solid #913030;background-color:white}.addons-listitem-clicked{border-bottom: 1px solid #913030;background-color:#bd0e27} .addon-checkbox {background-position: -264px -45px !important;} .addon-checkbox:hover {background-position: -264px -70px !important;} .addon-checkbox-clicked{background-position: -264px -95px !important;} .addon-checkbox-clicked:hover{background-position: -264px -120px !important;}.addon-desc-ico{border: 1px solid #ccc;background: #bd0e27;}.addons-desc-bl{border:1px solid #bd0e27;background-color:white;}.addons-but-save{border:2px solid #bd0e27;background-color:#bd0e27;}.addons-but-save:hover{border:2px solid #7c9dd2;background-color:#7c9dd2;}.addons-but-close{border:2px solid #bd0e27;background-color:#bd0e27;}.addons-but-close:hover{border:2px solid #7c9dd2;background-color:#7c9dd2;}.addons-save-info h3{border-bottom: 1px solid #913030;}";
                break
        }
        return css;
    },
    
    API: {
        escapeHtml: function(text) {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },
        addCSS: function(csstext) {
            var head = document.getElementsByTagName('head')[0]; 
            var newCss = document.createElement('style'); 
            newCss.type = "text/css"; 
            newCss.innerHTML = csstext; 
            head.appendChild(newCss); 
        } 
    }
}

document.addEventListener( "DOMContentLoaded", addonsLoader.init, false );
addonsLoader.interval= window.setInterval(addonsLoader.checkStarted, 50);

__addons=[

﻿{
    name: 'sortBetter',
    title: 'Улучшенная сортировка',
    description: 'Cортирует списки вопросов<BR/><UL><LI>Те у которых последний автор пользователь - в самый низ</LI><LI>интересные (из тэгов) в начало</LI><LI>сортируем интересные - сначала по количеству ответов, потом, по количеству голосов</LI></UL>',
    run: function() {
        var userlink=$('#searchBar a').first().attr('href');
        $('#listA')
            .prepend(
                $('.short-summary.tagged-interesting')
                .sort(sortQuestions)
            )
            .append($('.short-summary').has('a[href="' +userlink+ '"'));

        function sortQuestions(a,b) {
            var $a=$(a),
            $b=$(b);
            return  (value($a,'status')-value($b,'status')) ||
                    (value($b,'votes')-value($a,'votes'));

            function value($s,Class) {
                return parseInt($s.find('.'+Class+' .item-count').text());
            }
        }
    }
}
,

]; // end addons


};
var script = document.createElement('script');
script.innerHTML = __extension__wrapper__.toString().replace(/^.*?\{|\}.*?$/g, '');
document.getElementsByTagName('head')[0].appendChild(script);

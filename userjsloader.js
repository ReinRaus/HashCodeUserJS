addonsLoader= {
    /** Все аддоны как объекты */
    addons: {},
    /** Произошел ли запуск аддонов */
    started: false,
    interval: null,
    checkStarted: function() {
        if (!this.started) addonsLoader.init();
    },
    storage: null,
    storageOnlyExports: null,
    /** Можно ли отложить сохранение storage, или выполнять немедленно */
    delayedSave: true,
    /** Это сделано из-за того, что при инициализации каждый аддон может изменить настройки и запросить их сохранение. Чтобы много раз не сериализовать одно и тоже при инициализации сохранение откладывается, а в конце инициализации все сразу сохраняется. Во всех остальных случаях предпочтительно сразу сохранять настройки. */
    commitStorage: function() {
        this.delayedSave= false;
        this.saveStorage();
    },
    initStorage: function() {
        try {
            this.storage= JSON.parse( localStorage['__addonsSettings'] );
            if ( typeof(this.storage.enabledAddons)=="undefined" || typeof(this.storage.addonsSettings)=="undefined" ) throws();
        } catch(e) {
            console.log( "Ошибка при загрузке данных\n"+ localStorage['__addonsSettings']);
            this.storage= { enabledAddons:{}, addonsSettings:{} };
            this.saveStorage();
        };
        var addonsSettings= this.storage.addonsSettings;
        for (var i in __addons) {
            if (typeof(addonsSettings[__addons[i].name])=="undefined") {
                addonsSettings[__addons[i].name]= {};
            }
            for (var j in addonsSettings[__addons[i].name]) {
                __addons[i].settings[j]= addonsSettings[__addons[i].name][j]; // переносим сохраненные настройки в аддон
            }
            for (var j in __addons[i].settings) {
                if (typeof(addonsSettings[__addons[i].name][j])=="undefined") {
                    addonsSettings[__addons[i].name][j]= __addons[i].settings[j]; // переносим значения по-умолчанию в сохраненные настройки
                }
            }
        }
    },

    init: function() {
        if (typeof($)=="undefined") return;
        window.clearInterval(this.interval);
        this.started= true;
        for (var i in __addons) {
            this.addons[__addons[i].name]= __addons[i]; // TODO реализовать это в деплое. Читать name и сразу формировать addons, __addons убрать вовсе
            __addons[i].saveSettings= this.saveAddonSettings; // TODO нужно наследование, а не это
            if (typeof(this.addons[__addons[i].name].namesResolver)!="function") this.addons[__addons[i].name].namesResolver= this.namesResolver;
            if (typeof(this.addons[__addons[i].name].drawer)!="function") this.addons[__addons[i].name].drawer= this.defaultDrawer;
        };
        var build= parseInt("[DEPLOY:build][/DEPLOY]"); // версия вставляется сбощиком
        window.addEventListener("message", this.setSettingsListener, false);
        this.API.addCSS(this.getCssByDomain(location.hostname));

        this.callEventIterator("beforeDraw");

        var img_div = document.createElement('div');
        img_div.className = "img-bl";
        var img = document.createElement('div');
        img.className = "addons-settings-img";
        var img_src = "url([DEPLOY:image64]images/bg_sprite.png[/DEPLOY]) no-repeat";
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
        $("#searchBar div a, #searchBar div span").not("#searchBar div a .score").wrapAll("<div class='top_nav'></div>");
        var imgRect = img.getBoundingClientRect();

        var div1 = document.createElement("div");
        div1.className = "addons-settings";
        div1.id = "__div_options";
        var htmlDiv = "<DIV class='addons-overflow'>";
        var htmlDiv2 = "";

        for (var i in __addons) {
            htmlDiv += "<DIV class='addons-listitem' onclick='window.addonsLoader.openSettingsPage(\"" + __addons[i].name + "\", this);'><SPAN class='addon-desc-ico'>?</SPAN><DIV class='addon-name'><SPAN>" + __addons[i].title + "</SPAN></DIV>";
            htmlDiv += "<DIV id=\"" + __addons[i].name + "\" class='addon-checkbox'  onclick='event.stopPropagation();window.addonsLoader.toogleAddonEnabled(\"" + __addons[i].name + "\", this);' style='background: \"" + img_src + "\"'></DIV></DIV>";
            htmlDiv2 += "<DIV class='addons-desc-bl' id='__addonspage" + __addons[i].name + "'></DIV>";
        };
        htmlDiv += "</DIV><DIV>" + htmlDiv2 + "</DIV><DIV class='addons-but-save' onclick='window.addonsLoader.migrateStorageToSezn()'>Сохранить</DIV> <DIV class='addons-but-close' onclick='this.parentNode.style.display=\"none\";$(\".img-bl-clicked\").removeClass(\"img-bl-clicked\").addClass(\"img-bl\");$(\".addons-settings-img-clicked\").removeClass(\"addons-settings-img-clicked\").addClass(\"addons-settings-img\");'>Закрыть</DIV>";
        //console.log(htmlDiv);
        div1.style.left = ((imgRect.left + (window.pageXOffset || document.body.scrollLeft) - (document.body.clientLeft || 0)) - 532) + "px";
        div1.innerHTML = htmlDiv;
        img_div.appendChild(div1);

        this.callEventIterator("afterDraw");

        for (var i in __addons) {
            $('#' + __addons[i].name + '').css("background", img_src);
            if (this.storage.enabledAddons[__addons[i].name] == "yes") {
                __addons[i].run();
                $('#' + __addons[i].name + '').removeClass("addon-checkbox").addClass("addon-checkbox-clicked");
            } else $('#' + __addons[i].name + '').removeClass("addon-checkbox-clicked").addClass("addon-checkbox");
        }
        this.commitStorage();

        this.callEventIterator("afterInit");
    },

    /** Создает уникальные имена для настроек. Так как эта функция будет присвоена объекту-аддону, то this это ссылка на объект-аддон. */
    namesResolver: function(name) {
            return this.name+"_setting_"+name;
    },

    /** Отрисовщик блока настроек по-умолчанию, возвращает HTML блока настроек, получает уже имеющийся HTML. Так как эта функция будет присвоена объекту-аддону, то this это ссылка на объект-аддон. */
    defaultDrawer: function(html) {
        var API= window.addonsLoader.API;
        if (typeof(this.title)!="undefined") html+="<h3>"+this.title+"</h3>";
        if (typeof(this.description)!="undefined") html+="<div class='addons-description'>"+this.description+"</div>";
        if (typeof(this.exports)!="undefined"){
            for (var i=0; i<this.exports.length; i++) {
                var param= this.exports[i];
                var paramId= this.namesResolver(param.name);
                var paramValue= this.settings[param.name];
                if (typeof(param.title)!="undefined") html+="<div><div>"+param.title+"</div><div>";
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
                } else if (param.type=='textarea') {
                    html+="<TEXTAREA name='"+paramId+"'>"+escapeHtml(paramValue)+"</TEXTAREA>";
                };
                html+="</div></div>";
            };
        };
        return html;
    },

    /** Показывает страницу настроек аддона. Если страница пуста вызывает отрисовщик, если отрисовщика нет, то назначает отрисовщик по-умолчанию. */
    openSettingsPage: function(addonName, targetItem) {
        $("#prev-selected").removeClass("addons-listitem-clicked").addClass("addons-listitem").removeAttr("id");
        targetItem.className='addons-listitem-clicked';
        targetItem.id='prev-selected';
        $(".addons-desc-bl").css("display", "none");
        if ($("#__addonspage"+addonName).html()=="") {
            $("#__addonspage"+addonName).html(
                this.addons[addonName].drawer("<div onclick='window.addonsLoader.clearClicked();' class='addons-desc-ex'>x</div>") );
        };
        $("#__addonspage"+addonName).css("display", "block");
    },

    /** Сохраняет storage, если нельзя отложить (микрооптимизация) */
    saveStorage: function() {
        if (!this.delayedSave) {
            localStorage['__addonsSettings']= JSON.stringify(this.storage);
        };
    },
    /** включается в аддон как saveSettings */
    saveAddonSettings: function() {
        window.addonsLoader.storage.addonsSettings[this.name]=this.settings;
        window.addonsLoader.saveStorage();
    },
    /** слушает когда придет сообщение установить настройки (используется в iframe для миграции) */
    setSettingsListener: function(message, url){
        if (message.data.substring(0, 12)=="SetSettings:"){
            var storageOnlyExports= JSON.parse(message.data.substring(12));
            for (var i in storageOnlyExports){
                for (var j in storageOnlyExports[i]) {
                    window.addonsLoader.storage.addonsSettings[i][j]= storageOnlyExports[i][j];
                };
            };
            window.addonsLoader.commitStorage();
            message.source.postMessage("SettingsSets:"+location.hostname, '*');
        }
    },

    sezn: 'hashcode.ru math.hashcode.ru careers.hashcode.ru russ.hashcode.ru games.sezn.ru turism.sezn.ru foto.sezn.ru hm.sezn.ru meta.hashcode.ru admin.hashcode.ru user.hashcode.ru phys.sezn.ru english.sezn.ru'.split(' '),

    migrateStorageToSezn: function() {
        this.storageOnlyExports={};
        for (var i in this.addons) {
            this.storageOnlyExports[i]= {};
            for (var settingId in this.addons[i].exports) {
                var setting= this.addons[i].exports[settingId];
                var resolvedName= this.addons[i].namesResolver(setting.name);
                var inputs= document.getElementsByName(resolvedName);
                if (inputs.length==0) continue;
                if ( setting.type=="text" || setting.type=="textarea" || setting.type=="select" ) {
                    var value= inputs[0].value;
                } else if ( setting.type=="checkbox") {
                    var value= inputs[0].checked ? '1':'0';
                } else if ( setting.type=="radio") {
                    for (var j=0; j<params.length; j++) {
                        if (inputs[j].checked) {
                            var value= params[j].value;
                            break;
                        }
                    }
                } else {
                    var value= this.storage.addonsSettings[i][setting.name];
                }
                this.storageOnlyExports[i][setting.name]= value;
                this.storage.addonsSettings[i][setting.name]=value;
            };
        };
        this.commitStorage();
        var frames={};
        window.addEventListener("message", function(message, url){
            if (message.data.substring(0, 13)=="SettingsSets:"){
                frames[message.data.substring(13)][1]=true;
            }
        });
        $("#__div_options").html("<div class='addons-save-info'><h3>Идет сохранение настроек, это может занять некоторое время</h3><br/>Сохранено <span id='__addons_span_count'>0</span> сайтов из "+this.sezn.length+ "</div>");
        for (var i=0; i<this.sezn.length; i++) {
            if (location.hostname!=this.sezn[i]){
                var frame= document.createElement("iframe");
                frame.width=frame.height='1px';
                frame.onload= function(){
                    var iframe=this;
                    window.setTimeout(function(){
                            iframe.contentWindow.postMessage("SetSettings:"+JSON.stringify(window.addonsLoader.storageOnlyExports), "*");
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
            for (var i=0; i<window.addonsLoader.sezn.length; i++) {
                if (frames[window.addonsLoader.sezn[i]][1]) {
                    count++;
                }
            };
            $("#__addons_span_count").html(count);
            if (count==window.addonsLoader.sezn.length) {
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
    toogleAddonEnabled: function(addonName, targetNode){
        this.storage.enabledAddons[addonName]= this.storage.enabledAddons[addonName]=="yes" ? "no":"yes";
        if ( this.storage.enabledAddons[addonName]=="yes" ) {
            $(targetNode).removeClass("addon-checkbox").addClass("addon-checkbox-clicked");
        } else {
            $(targetNode).removeClass("addon-checkbox-clicked").addClass("addon-checkbox");
        }
        this.saveStorage();
    },

    callEventIterator: function(nameEvent) {
        for (var i in __addons) {
            if ( typeof(__addons[i][nameEvent])=="function") __addons[i][nameEvent]();
        }
    },

    getCssByDomain: function (domain) {
        if (domain=="localhost") domain= "meta.hashcode.ru";
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
        },
        addStyleSheet: function(url) {
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.href = url;
            link.rel = "stylesheet";
            link.type = "text/css";
            head.appendChild(link);
        },
        arrayUnique: function(a) { // оставляет в массиве только уникальные значения
            return a.reduce(function(p, c) {
                if (p.indexOf(c) < 0) p.push(c);
                return p;
            }, []);
        }
    }
}

document.addEventListener( "DOMContentLoaded", addonsLoader.checkStarted, false );
addonsLoader.interval= window.setInterval(addonsLoader.checkStarted, 50);

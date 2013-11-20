function __developerMode() {

    var defaultSettings= {
        title: 'Режим разработчика',
        description: 'Вы можете сами создавать новые аддоны. Если Вы хотите отредактировать аддон, который входит в состав основной сборки, то нужно при создании нового аддона выбрать аддон на основе которого хотите создать. После этого отключите встроенный аддон, а новый будет загружаться автоматически.<br/>В настоящий момент нельзя смотреть страницу настроек таких скриптов- они всегда используют настройки по-умолчанию.<br/>Все созданные таким образом скрипты загружаются всегда. После того, как закончите творить новый аддон, сохраните его в отдельный файл в utf-8+BOM и сделайте pull request в репозиторий.<br/>Если произошла ошибка, то объект ошибки можно найти в консоли.',
        exports: {
            scripts:{type:"text", value:"[]", title:"нет в ордер, не показываются"},
            lastOpened:{type:"text", value:0, title:"hidden"},
            maxHighlightLength:{type:"text", value:Infinity, title:"Максимальная подсвечиваемая длина<br/><small>(в символах или Infinity)</small>"},
            settings:{type:"text", value:"{}", title:""}
        },
        order: ["maxHighlightLength"]
    };
    var addonName= arguments.callee.name;
    var settings= __addonsSettings.getUpdatedSettings( addonName, defaultSettings );
    var scripts= JSON.parse(settings.exports.scripts.value);
    var lastOpened= settings.exports.lastOpened.value;
    var css= "div.addons-DM {left: 5px; width: 98%; max-width:100%; max-height:100%;} img.addons-DM-icon {width:16px; height:16px; margin-right:10px} div.addons-DM-new {position:relative; top:30px; left:10px;}";
    __addonsAddCSS(css);
    
    var escapeHtml= function(text) {
      return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
    };
    
    var saveSettings= function(scripts, lastOpened, reloadPage){
        if (scripts!=null) settings.exports.scripts.value= JSON.stringify(scripts);
        if (lastOpened!=null) settings.exports.lastOpened.value= lastOpened;
        __addonsSettings.set(addonName, settings);
        if (reloadPage) location.reload();
    };
    
    var img= document.createElement("img");
    img.src="[DEPLOY:image64]images/iconDM.png[/DEPLOY]";
    img.className='cursor-pointer addons-DM-icon'; // из лоадера
    img.onclick= function(e) {
        div1.style.display= div1.style.display=="block" ? "none":"block";
    };
    $(img).insertBefore($("#__imageIcon")[0]);
    var imgRect= img.getBoundingClientRect();
    
    var div1= document.createElement('div');
    div1.className="addons-settings addons-DM"; // из лоадера
    div1.style.top=(imgRect.top+imgRect.height+5)+"px";
    div1.style.height= "90%";
    
    var html= "<TABLE style='width:100%'><TR><TD width='*'><BUTTON onclick='$(\".addons-DM .addons-DM-new\").css(\"display\", \"block\");'>Новый...</BUTTON> <SELECT id='__addons_DM_selectScript' style='min-width:70px'>";
    for (var i in scripts) {
        html+="<OPTION value='"+i+"' "+(i==parseInt(lastOpened) ? "selected='selected' >":">")+scripts[i].replace(/^[\s\S]*?function\s+([^\(]+)\([\s\S]*$/, "$1")+"</OPTION>";
    };
    html+="</SELECT> <BUTTON id='__addons_DM_saveScript'>Сохранить</BUTTON> <BUTTON id='__addons_DM_saveAndUpdateScript'>Сохранить и обновить</BUTTON></TD><TD><BUTTON id='__addons_DM_deleteScript'>Удалить</BUTTON></TD></TR></TABLE><DIV class='addons-overflow'>";
    // блок с новым скриптом
    html+="<DIV class='addons-settings addons-DM-new addons-overflow'><TABLE><TR><TD><INPUT type=radio name=addons_DM_new_blank value=blank checked >Чистый</TD><TD><INPUT type=text value='Имя функции' ></TD></TR><TR><TD><INPUT type=radio name=addons_DM_new_blank value=clone >На основе</TD><TD><SELECT>";
    for (var i in __addons) {
        var addon= __addonsSettings.settings[__addons[i]];
        var title= addon == undefined ? __addons[i] : addon.title;
        html+="<OPTION value='"+__addons[i]+"'>"+title+"</OPTION>";
    };
    html+="</SELECT></TD></TR></TABLE><BUTTON id='__addons_DM_createNew' >Создать</BUTTON><BUTTON onclick='$(\".addons-DM .addons-DM-new\").css(\"display\", \"none\");' >Закрыть</BUTTON></DIV>";
    // блок с CodeMirror
    html+="<DIV style='width:100%; height:100%' id='__CodeMirrorArea' ></DIV>";
    
    div1.innerHTML= html;
    document.body.appendChild(div1);
    
    var linkSS= document.createElement('link');
    linkSS.rel= "stylesheet";
    linkSS.type= "text/css";
    linkSS.href="http://localhost/temp/codemirror319/lib/codemirror.css";
    document.getElementsByTagName('head')[0].appendChild(linkSS);
    var script1= document.createElement("script");
    script1.src='http://localhost/temp/codemirror319/lib/codemirror.js';
    document.getElementsByTagName('head')[0].appendChild(script1);
        
    var editor; // глобалим
    var initCodeMirror= function(){
        img.onclick(); // наглый хак, но почему-то не происходит отрисовка CodeMirror в скрытый блок
        editor = CodeMirror(document.getElementById("__CodeMirrorArea"), {
            value: scripts[lastOpened]==undefined? 'Чтобы создать новый скрипт нажмите New':scripts[lastOpened],
            lineNumbers: true,
            maxHighlightLength: settings.exports.maxHighlightLength.value=="Infinity"?Infinity:parseInt(settings.exports.maxHighlightLength.value)
        });
        editor.display.scroller.parentNode.style.height="100%";
        img.onclick();
    };
    var fixSlowLoading= function() {
        if (typeof(CodeMirror)=="undefined") return;
        var script2= document.createElement("script");
        script2.src='http://localhost/temp/codemirror319/mode/javascript/javascript.js';
        document.getElementsByTagName('head')[0].appendChild(script2);
        window.setTimeout(initCodeMirror, 50);
        clearInterval(interval);
    };
    var interval= window.setInterval(fixSlowLoading, 50);
    
    $("#__addons_DM_createNew").bind('click', function(){
        var name=$(".addons-DM-new input[type='text']")[0].value.replace(/^\s+|\s+$/, '');
        var blankInputs= $(".addons-DM-new input[type='radio']");
        for (var i =0; i<blankInputs.length; i++) if (blankInputs[i].checked) var blank=blankInputs[i].value;
        if (blank=="clone") {
            var text= window[$(".addons-DM-new select")[0].value].toString();
        } else {
            if (name=="") {
                alert("Имя не задано");
                return
            };
            var text="function "+name+"() {\n    var defaultSettings= {\n        title: '',\n        description: '',\n        exports: {\n        },\n        order: []\n    };\n    var settings= __addonsSettings.getUpdatedSettings( arguments.callee.name, defaultSettings );\n};\n";
        };
        scripts.push(text);
        saveSettings(scripts, lastOpened, true);
    });
    $('#__addons_DM_selectScript').bind("change", function(){
        scripts[lastOpened]= editor.doc.getValue();
        lastOpened= parseInt(this.value);
        saveSettings(null, lastOpened, false);
        if (typeof(editor)!= "undefined") editor.doc.setValue( scripts[lastOpened] );
    });
    $('#__addons_DM_deleteScript').bind("click", function() {
        var item= parseInt($('#__addons_DM_selectScript')[0].value);
        lastOpened= 0;
        scripts= scripts.slice(0, item).concat(scripts.slice(item+1));
        saveSettings(scripts, lastOpened, true);
    });
    $("#__addons_DM_saveScript").bind("click", function() {
        scripts[lastOpened]= editor.doc.getValue();
        saveSettings(scripts, lastOpened, false);
    });
    $("#__addons_DM_saveAndUpdateScript").bind("click", function() {
        scripts[lastOpened]= editor.doc.getValue();
        saveSettings(scripts, lastOpened, true);
    });
    
    var glush= "var __addonsSettings=new (function () {this.settings={}; this.get=function(addonName) {return this.settings[addonName];}; this.set= function(){}; this.getUpdatedSettings= function(addonName, defaultSettings) {this.settings[addonName]= defaultSettings;return defaultSettings;};})();"
    for (var i in scripts) {
        console.log('Запуск функции '+ $("#__addons_DM_selectScript option")[i].innerHTML);
        var scr= document.createElement('script');
        scr.innerHTML=glush+"\n("+scripts[i].replace(/\}[^\}]*?$/, "})();");
        document.getElementsByTagName('head')[0].appendChild(scr);
    };
};

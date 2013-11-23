{
    name: 'developerMode',
    title: 'Режим разработчика',
    description: 'Вы можете сами создавать новые аддоны. Если Вы хотите отредактировать аддон, который входит в состав основной сборки, то нужно при создании нового аддона выбрать аддон на основе которого хотите создать, при этом не забывайте, что <b>name</b> должны быть уникальны. После этого отключите встроенный аддон, а новый будет загружаться автоматически.<br/>В настоящий момент нельзя смотреть страницу настроек таких скриптов- они всегда используют настройки по-умолчанию.<br/>Все созданные таким образом скрипты загружаются всегда. После того, как закончите творить новый аддон, сохраните его в отдельный файл в utf-8+BOM и сделайте pull request в репозиторий.<br/>Если произошла ошибка, то объект ошибки можно найти в консоли.<br/>Можно самому задать путь к CDN для CodeMirror (например выложить на localhost). Требуются файлы: [codemirror.js, codemirror.css, mode/javascript/javascript.js]',
    settings: {
        scripts: "[]",
        lastOpened: "0",
        maxHighlightLength: "Infinity",
        fontSize: '14px',
        settings: "{}",
        codeMirrorCDN: "http://cdnjs.cloudflare.com/ajax/libs/codemirror/3.19.0/"
    },
    exports: [
        {name:'scripts', type:'hidden'},
        {name:'lastOpened', type:'hidden'},
        {name:'settings', type:'hidden'},
        {name:'fontSize', type:"text", title:'Размер шрифта в редакторе'},
        {name:'maxHighlightLength', type:'text',title:"Максимальная подсвечиваемая длина<br/><small>(в символах или Infinity)</small>"},
        {name:'codeMirrorCDN', type:"text", title:'Code Mirror CDN'}
    ],
    run: function() {
        var scripts= JSON.parse(this.settings.scripts);
        var lastOpened= parseInt(this.settings.lastOpened);
        var thisAddon= this;
        var settings= this.settings;
        var css= "div.addons-DM {left: 5px; width: 98%; max-width:100%; max-height:100%;} img.addons-DM-icon {width:16px; height:16px; margin-right:10px} div.addons-DM-new {position:relative; top:30px; left:10px;}";
        window.addonsLoader.API.addCSS(css);
        
        var saveData= function(scripts, lastOpened, reloadPage){
            // TODO проверять уникальность name
            if (scripts!=null) settings.scripts= JSON.stringify(scripts);
            if (lastOpened!=null) settings.lastOpened= lastOpened.toString();
            thisAddon.saveSettings();
            if (reloadPage) location.reload();
        };
        
        var img= document.createElement("img");
        img.src="[DEPLOY:image64]images/iconDM.png[/DEPLOY]";
        img.className='cursor-pointer addons-DM-icon'; // из лоадера
        img.onclick= function(e) {
            div1.style.display= div1.style.display=="block" ? "none":"block";
        };
        $(img).insertBefore($("a")[0]);
        var imgRect= img.getBoundingClientRect();
        
        var div1= document.createElement('div');
        div1.className="addons-settings addons-DM"; // из лоадера
        div1.style.top=(imgRect.top+imgRect.height+5)+"px";
        div1.style.height= "90%";
        
        var html= "<TABLE style='width:100%'><TR><TD width='*'><BUTTON onclick='$(\".addons-DM .addons-DM-new\").css(\"display\", \"block\");'>Новый...</BUTTON> <SELECT id='__addons_DM_selectScript' style='min-width:70px'>";
        for (var i in scripts) {
            html+="<OPTION value='"+i+"' "+(i==lastOpened ? "selected='selected' >":">")+this.getTextAddonParam(scripts[i], 'title')+"</OPTION>";
        };
        html+="</SELECT> <BUTTON id='__addons_DM_saveScript'>Сохранить</BUTTON> <BUTTON id='__addons_DM_saveAndUpdateScript'>Сохранить и обновить</BUTTON></TD><TD><BUTTON id='__addons_DM_deleteScript'>Удалить</BUTTON></TD></TR></TABLE><DIV class='addons-overflow'>";
        // блок с новым скриптом
        html+="<DIV class='addons-settings addons-DM-new addons-overflow'><TABLE><TR><TD valign=top><INPUT type=radio name=addons_DM_new_blank value=blank checked >Чистый</TD><TD>Уникальный <b>name</b><BR/><INPUT type=text value='name' ><BR/>Заголовок <b>title</b><BR/><INPUT type=text value='title' ><BR/>Описание <b>description</b><BR/><INPUT type=text value='description' ></TD></TR><TR><TD><INPUT type=radio name=addons_DM_new_blank value=clone >На основе</TD><TD><SELECT>";
        for (var i in window.addonsLoader.addons) {
            var title= typeof(window.addonsLoader.addons[i].title)=="undefined" ? i:window.addonsLoader.addons[i].title;
            html+="<OPTION value='"+i+"'>"+title+"</OPTION>";
        };
        html+="</SELECT></TD></TR></TABLE><BUTTON id='__addons_DM_createNew' >Создать</BUTTON><BUTTON onclick='$(\".addons-DM .addons-DM-new\").css(\"display\", \"none\");' >Закрыть</BUTTON></DIV>";
        // блок с CodeMirror
        html+="<DIV style='width:100%; height:100%' id='__CodeMirrorArea' ></DIV>";
        
        div1.innerHTML= html;
        document.body.appendChild(div1);
        
        var linkSS= document.createElement('link');
        linkSS.rel= "stylesheet";
        linkSS.type= "text/css";
        linkSS.href= settings.codeMirrorCDN+"codemirror.css";
        document.getElementsByTagName('head')[0].appendChild(linkSS);
        var script1= document.createElement("script");
        script1.src= settings.codeMirrorCDN+'codemirror.js';
        document.getElementsByTagName('head')[0].appendChild(script1);
            
        var editor; // глобалим
        var initCodeMirror= function(){
            img.onclick(); // наглый хак, но почему-то не происходит отрисовка CodeMirror в скрытый блок
            editor = CodeMirror(document.getElementById("__CodeMirrorArea"), {
                value: typeof(scripts[lastOpened])=="undefined"? 'Чтобы создать новый скрипт нажмите "Новый..."':scripts[lastOpened],
                lineNumbers: true,
                maxHighlightLength: settings.maxHighlightLength=="Infinity"?Infinity:parseInt(settings.maxHighlightLength)
            });
            editor.display.scroller.parentNode.style.height="100%";
            editor.display.scroller.style.fontSize= settings.fontSize;
            img.onclick();
        };
        var fixSlowLoading= function() {
            if (typeof(CodeMirror)=="undefined") return;
            var script2= document.createElement("script");
            script2.src= settings.codeMirrorCDN+'mode/javascript/javascript.js';
            document.getElementsByTagName('head')[0].appendChild(script2);
            window.setTimeout(initCodeMirror, 50);
            clearInterval(interval);
        };
        var interval= window.setInterval(fixSlowLoading, 50);
        
        $("#__addons_DM_createNew").bind('click', function(){
            var $inputs= $(".addons-DM-new input[type='text']");
            var name= $inputs[0].value.replace(/^\s+|\s+$/, '');
            var blankInputs= $(".addons-DM-new input[type='radio']");
            for (var i =0; i<blankInputs.length; i++) if (blankInputs[i].checked) var blank=blankInputs[i].value;
            if (blank=="clone") {
                var text= window[$(".addons-DM-new select")[0].value].toString();
            } else {
                if (name=="") {
                    alert("Имя не задано");
                    return
                };
                var text="{\n    name: '"+name+"',\n    title: '"+$inputs[1].value+"',\n    description: '"+$inputs[2].value+"',\n    run: function() {\n        \n    }\n}";
            };
            scripts.push(text);
            saveData(scripts, lastOpened, true);
        });
        $('#__addons_DM_selectScript').bind("change", function(){
            scripts[lastOpened]= editor.doc.getValue();
            lastOpened= parseInt(this.value);
            saveData(null, lastOpened, false);
            if (typeof(editor)!= "undefined") editor.doc.setValue( scripts[lastOpened] );
        });
        $('#__addons_DM_deleteScript').bind("click", function() {
            var item= parseInt($('#__addons_DM_selectScript')[0].value);
            lastOpened= 0;
            delete window.addonsLoader.storage.addonsSettings[thisAddon.getTextAddonParam(scripts[item], 'name')]
            scripts= scripts.slice(0, item).concat(scripts.slice(item+1));
            saveData(scripts, lastOpened, true);
        });
        $("#__addons_DM_saveScript").bind("click", function() {
            scripts[lastOpened]= editor.doc.getValue();
            saveData(scripts, lastOpened, false);
        });
        $("#__addons_DM_saveAndUpdateScript").bind("click", function() {
            scripts[lastOpened]= editor.doc.getValue();
            saveData(scripts, lastOpened, true);
        });
    },
    
    beforeInit: function(){
        var scripts= JSON.parse(this.settings.scripts);
        var scr= document.createElement('script');
        scr.innerHTML= "\nwindow.__addons.push(\n\n"+scripts.join(',\n\n')+"\n\n);\nconsole.log (addonsLoader.started);";
        document.head.appendChild(scr);
    },
    
    getTextAddonParam: function(text, param) {
        return text.replace(new RegExp("^[\\s\\S]*?\\b"+param+"\\b[^:]*?:\\s*(?:'((?:\\\\[\\s\\S]|[^'])+)'|\"((?:\\\\[\\s\\S]|[^\"])+)\")[\\s\\S]*$"), "$1$2"); // TODO переписать хранение аддонов в scripts на ассоциативный массив
    }
}
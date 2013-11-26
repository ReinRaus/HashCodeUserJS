{
    name: 'developerMode',
    title: 'Режим разработчика',
    description: 'Вы можете сами создавать новые аддоны. Не забывайте, что <b>name</b> должны быть уникальны.<br/>После того, как закончите творить новый аддон, сохраните его в отдельный файл в utf-8+BOM и сделайте pull request в репозиторий.<br/>Если произошла ошибка, то объект ошибки можно найти в консоли.<br/>Можно самому задать путь к CDN для ACE (например выложить на localhost).<BR/>Для задания параметров проверки JSLint используйте комментарии globals и jslint перед кодом аддона. О том, как правильно составить такой комментарий Вы можете прочесть в документации JSLint.',
    settings: {
        scripts: "[]",
        lastOpened: "0",
        fontSize: '14px',
        settings: "{}",
        aceCDN: "http://raw.github.com/ajaxorg/ace-builds/master/src-noconflict/",
        jslintCDN: 'http://raw.github.com/douglascrockford/JSLint/master/'
    },
    exports: [
        {name:'scripts', type:'hidden'},
        {name:'lastOpened', type:'hidden'},
        {name:'settings', type:'hidden'},
        {name:'fontSize', type:"text", title:'Размер шрифта в редакторе'},
        {name:'aceCDN', type:"text", title:'ACE CDN'},
        {name:'jslintCDN', type:"text", title:'JSlint CDN'}
    ],
    run: function() {
        var scripts= JSON.parse(this.settings.scripts);
        var lastOpened= parseInt(this.settings.lastOpened);
        var thisAddon= this;
        var settings= this.settings;
        var css= "div.addons-DM {left: 5px; width: 98%; max-width:100%; max-height:100%;} img.addons-DM-icon {width:16px; height:16px; margin-right:10px} div.addons-DM-new {position:relative; top:30px; left:10px; height:250px}";
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
        
        var lockScroll = function(event) {
            window.scrollTo(0, 0);
            event ? event.preventDefault() : window.event.returnValue = false;
        };
        img.onclick= function(e) {
            div1.style.display= div1.style.display=="block" ? "none":"block";
            var array = ['DOMMouseScroll', 'mousewheel', 'scroll'];
            if (div1.style.display=="block") {
                for (var i=0; i<array.length; i++) {
                    window.addEventListener(array[i], lockScroll, false);
                }
            } else {
                for (var i=0; i<array.length; i++) {
                    window.removeEventListener(array[i], lockScroll, false);
                }
            }
        };
        $(img).insertBefore($("a")[0]);
        var imgRect= img.getBoundingClientRect();
        
        var div1= document.createElement('div');
        div1.className="addons-settings addons-DM"; // из лоадера
        div1.style.top=(imgRect.top+imgRect.height+5)+"px";
        div1.style.height= "90%";
        
        var html= "<TABLE style='width:100%'><TR><TD width='*'><BUTTON onclick='$(\".addons-DM .addons-DM-new\").css(\"display\", \"block\");$(\"#__EditorArea\").css(\"display\", \"none\");'>Новый...</BUTTON> <SELECT id='__addons_DM_selectScript' style='min-width:70px'>";
        for (var i in scripts) {
            html+="<OPTION value='"+i+"' "+(i==lastOpened ? "selected='selected' >":">")+this.getTextAddonParam(scripts[i], 'title')+"</OPTION>";
        };
        html+="</SELECT> <BUTTON id='__addons_DM_saveScript'>Сохранить</BUTTON> <BUTTON id='__addons_DM_saveAndUpdateScript'>Сохранить и обновить</BUTTON> <BUTTON id='__addons_DM_check'>Проверить</BUTTON></TD><TD><BUTTON id='__addons_DM_deleteScript'>Удалить</BUTTON></TD></TR></TABLE><DIV class='addons-overflow'>";
        // блок с новым скриптом
        html+="<DIV class='addons-settings addons-DM-new addons-overflow'><TABLE><TR><TD valign=top><INPUT type=radio name=addons_DM_new_blank value=blank checked >Чистый</TD><TD>Уникальный <b>name</b><BR/><INPUT type=text value='name' ><BR/>Заголовок <b>title</b><BR/><INPUT type=text value='title' ><BR/>Описание <b>description</b><BR/><INPUT type=text value='description' ></TD></TR><TR><TD><INPUT type=radio name=addons_DM_new_blank value=clone >На основе</TD><TD><SELECT>";
        for (var i in window.addonsLoader.addons) {
            var title= typeof(window.addonsLoader.addons[i].title)=="undefined" ? i:window.addonsLoader.addons[i].title;
            html+="<OPTION value='"+i+"'>"+title+"</OPTION>";
        };
        html+="</SELECT></TD></TR></TABLE><BUTTON id='__addons_DM_createNew' >Создать</BUTTON><BUTTON onclick='$(\".addons-DM .addons-DM-new\").css(\"display\", \"none\");$(\"#__EditorArea\").css(\"display\", \"block\");' >Закрыть</BUTTON></DIV>";
        // блок с редактором кода
        html+="<DIV style='width:100%; height:100%' id='__EditorArea' ></DIV><DIV style='width:100%; height:100%; display:none' id='__JSLintReport' ></DIV>";
        
        div1.innerHTML= html;
        document.body.appendChild(div1);
        
        var script1= document.createElement("script");
        script1.src= settings.aceCDN+'ace.js';
        document.getElementsByTagName('head')[0].appendChild(script1);
        var script2= document.createElement("script");
        script2.src= settings.jslintCDN+'jslint.js';
        document.getElementsByTagName('head')[0].appendChild(script2);
        
        var editor; // глобалим
        var fixSlowLoading= function() {
            if (typeof(ace)=="undefined") return;
            clearInterval(interval);
            document.getElementById('__EditorArea').style.fontSize= settings.fontSize;
            editor= ace.edit("__EditorArea");
            editor.setValue(typeof(scripts[lastOpened])=="undefined"? 'Чтобы создать новый скрипт нажмите "Новый..."':scripts[lastOpened]);
            editor.setTheme("ace/theme/eclipse");
            editor.getSession().setUseWorker(false);
            editor.getSession().setMode("ace/mode/javascript");
            editor.selection.clearSelection();
            $('.ace_content').css({'height':'auto'});
        };
        var interval= window.setInterval(fixSlowLoading, 50);
        
        $("#__addons_DM_createNew").bind('click', function(){
            var $inputs= $(".addons-DM-new input[type='text']");
            var name= $inputs[0].value.replace(/^\s+|\s+$/, '');
            var blankInputs= $(".addons-DM-new input[type='radio']");
            for (var i =0; i<blankInputs.length; i++) if (blankInputs[i].checked) var blank=blankInputs[i].value;
            if (blank=="clone") {
                alert( "К сожалению в настоящее время возможность недоступна. Возьмите исходный код из репозитория.");
                return;
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
            scripts[lastOpened]= editor.getValue();
            lastOpened= parseInt(this.value);
            saveData(null, lastOpened, false);
            if (typeof(editor)!= "undefined") editor.setValue( scripts[lastOpened] );
        });
        $('#__addons_DM_deleteScript').bind("click", function() {
            var item= parseInt($('#__addons_DM_selectScript')[0].value);
            lastOpened= 0;
            delete window.addonsLoader.storage.addonsSettings[thisAddon.getTextAddonParam(scripts[item], 'name')]
            scripts= scripts.slice(0, item).concat(scripts.slice(item+1));
            saveData(scripts, lastOpened, true);
        });
        $("#__addons_DM_saveScript").bind("click", function() {
            scripts[lastOpened]= editor.getValue();
            saveData(scripts, lastOpened, false);
        });
        $("#__addons_DM_saveAndUpdateScript").bind("click", function() {
            scripts[lastOpened]= editor.getValue();
            saveData(scripts, lastOpened, true);
        });
        $("#__addons_DM_check").bind("click", function() {
            if ($("#__JSLintReport").css('display')=='block') {
                this.innerHTML= 'Проверить';
                $("#__JSLintReport").css({display: 'none'});
                $("#__EditorArea").css({display: 'block'});
            } else {
                this.innerHTML= 'Закрыть JSLint';
                var comms= /^((?:\s+|\/\*{1,2}[\s\S]*?\*\/|\/\/[^\n]*|\/)*){/.exec(editor.getValue());
                comms= comms==null ? "":comms[1];
                console.log(comms+"var addon = "+editor.getValue().substr(comms.length)+";");
                JSLINT(comms+"var addon = "+editor.getValue().substr(comms.length)+";");
                $("#__EditorArea").css({display: 'none'});
                $("#__JSLintReport").css({display: 'block'}).html(JSLINT.error_report(JSLINT.data()));
            };
        });
    },
    
    beforeInit: function(){
        var scripts= JSON.parse(this.settings.scripts);
        var scr= document.createElement('script');
        scr.innerHTML= "\nwindow.__addons.push(\n\n"+scripts.join(',\n\n')+"\n\n);\nif (!window.addonsLoader.started) {window.addonsLoader.initStorage();} else {console.log('Извините. Не успели внедрить режим разработчика.');};\n";
        document.head.appendChild(scr);
    },
    
    getTextAddonParam: function(text, param) {
        return text.replace(new RegExp("^[\\s\\S]*?\\b"+param+"\\b[^:]*?:\\s*(?:'((?:\\\\[\\s\\S]|[^'])+)'|\"((?:\\\\[\\s\\S]|[^\"])+)\")[\\s\\S]*$"), "$1$2"); // TODO переписать хранение аддонов в scripts на ассоциативный массив
    }
}
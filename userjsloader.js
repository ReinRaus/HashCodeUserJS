var __addonsStarted= false;

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
    img.src="[DEPLOY:image64]images/icon.png[/DEPLOY]";
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


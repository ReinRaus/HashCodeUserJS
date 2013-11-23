{
    name: 'autocompleteWithSelection',
    title: 'Автодополнение собаки по пробелу',
    description: 'Дополняет в поле ввода собаку ником участника, отметившегося на странице. Если дополнить можно несколькими вариантами, то пробел перебирает возможные продолжения. Если просто ввести собаку и нажимать пробел, то будут перебираться все ники. Если возможное продолжение только одно, то курсор переносится за него. Чтобы просто ввести собаку нужно нажать собаку и клавиши влево-вправо.',
    run: function() {    
        /** target- поле ввода, text- полное совпадение, matchText- частичное совпадение, например имея на входе "test" и "te" будет выделено "st" te[st] */
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
        usersLow= window.addonsLoader.API.arrayUnique(usersLow);
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
        ); // $ textarea bind
    }
}
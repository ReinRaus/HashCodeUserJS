﻿{
    name: 'SearchFromGoogle',
    title: 'Поиск от Google',
    description: 'Из строки поиска поиск будет осуществляться при помощи запроса вида <br/><pre>site:hashcode.ru запрос</pre><br/>что дает более релевантные результаты.',
    settings: {
      
    },
    exports: [],
    run: function() {
        $('#searchBar').submit(function () {
            location.href= "http://google.ru/search?q=site%3A"+location.hostname+"%20"+this.q.value;
            return false;
        });
    } 
}
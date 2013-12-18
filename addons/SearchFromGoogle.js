{
    name: 'SearchFromGoogle',
    title: 'Поиск от Google',
    description: 'Из строки поиска поиск будет осуществляться при помощи запроса вида <br/><pre>site:hashcode.ru запрос</pre><br/>что дает более релевантные результаты.',
    settings: {
      
    },
    exports: [],
    run: function() {
        $('#searchBar')[0].action= 'http://google.ru/';
        $('#searchBar').submit(function () {
            location.href= "http://google.ru/search?q=site%3Ahashcode.ru%20"+this.q.value;
            return false;
        });
    } 
}
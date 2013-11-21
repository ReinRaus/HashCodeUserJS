{
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

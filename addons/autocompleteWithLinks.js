// @author Yura Ivanov
function __autocompleteWithLinks() {
    if (typeof $ != 'undefined') {
        if ($("#question-table").length) {
            var users = [];
            var a = "";
            function addUser(name, link, type) {
                name = name.replace(/@| ♦+/, '');
                if (users.indexOf(link) < 0) {
                    users.push(link);
                    return "<li><a href='#' class='user_quote'>@" + name
                            + "</a> - " + type + "</li>";
                } else {
                    return "";
                }
            }
            $("#question-table [itemprop='author'] a").each(function(idx, u) {
                var $u = $(u);
                var link = $u.attr("href");
                var name = $u.text();
                a += addUser(name, link, "топикстартер");
            });
            $("[itemprop='comment'] [itemprop='author'] a").each(
                    function(idx, u) {
                        var $u = $(u);
                        var link = $u.attr("href");
                        var name = $u.text();
                        a += addUser(name, link, "ответил");
                    });
            $("a.userinfo").each(function(idx, u) {
                var $u = $(u);
                var link = $u.attr("href");
                var name = $u.text();
                a += addUser(name, link, "комментировал");
            });
            $("#main-body a[href^='\/users\/']").each(function(idx, u) {
                var $u = $(u);
                var link = $u.attr("href");
                var name = $u.text();
                a += addUser(name, link, "был упомянут");
            });
            var d = $("<div class='users_menu' style=''><ul>" + a
                    + "</ul></div>");
            d.insertBefore($("#editor, .commentBox"));
            $(".user_quote").click(
                    function(e) {
                        e.preventDefault();
                        var myField = $("#editor, .commentBox", $(this)
                                .closest('.users_menu').parent())[0];
                        if (myField.selectionStart
                                || myField.selectionStart == '0') {
                            var startPos = myField.selectionStart;
                            var endPos = myField.selectionEnd;
                            var myValue = (startPos > 0
                                    && myField.value.substring(startPos - 1,
                                            startPos) != ' ' ? ' ' : '')
                                    + $(this).text() + ', ';
                            myField.value = myField.value
                                    .substring(0, startPos)
                                    + myValue
                                    + myField.value.substring(endPos,
                                            myField.value.length);
                        } else {
                            myField.value += myValue;
                        }
                        myField.focus();
                    });
        }
    }
};
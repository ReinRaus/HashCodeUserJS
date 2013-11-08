// @author Yura Ivanov
function __newAnswersAndComments() {
  var defaultSettings= {
        title: 'Подсветка новых сообщений',
        description: 'Новые ответы и комментарии выделяются цветом, что делает поиск обновлений в вопросе значительно быстрее.',
        /*exports: {
        },
        order: []*/
    };
  var settings= __addonsSettings.getUpdatedSettings( arguments.callee.name, defaultSettings );
  var regexURL= new RegExp("^https?://[^/]+/(?:questions|research)/.*$", "i");
  if (!regexURL.test(location.href)) return; // если не вопрос, то не работаем
  var qid = $("a.post-vote.up").attr("href").replace('/vote/', '').replace('/up', '');
  var qopened = window.localStorage.getItem('__opened_' + qid);
  var readanswers = JSON.parse(window.localStorage.getItem('__read_answers_' + qid) || "[]");
  var nowanswers = [];
  $(".answer").each(function(i, an) {
    var anid = $(an).attr('id').replace('answer-container-', '');
    nowanswers.push(anid);
    if (readanswers.indexOf(anid) < 0) {
      if (qopened) {
        $(an).css("border-left", "solid #5B9058 3px");
      }
    }
  });
  var readcomments = JSON.parse(window.localStorage.getItem('__read_comments_' + qid) || "[]");
  var nowcomments = [];
  $(".comment").each(function(i, cm) {
    var cmid = $(cm).attr('id').replace('comment-', '');
    nowcomments.push(cmid);
    if (readcomments.indexOf(cmid) < 0) {
      if (qopened) {
        $(cm).css("border-left", "solid #5B9058 3px");
      }
    }
  });
  var $nav = $("<div class='focusedAnswer' style='border:solid #5B9058 3px;position:fixed;top:31px;left:40px;padding:10px'></div>");
  $nav.append("<span>Ответы:</span>" + "<ul>" + "<li>Всего:" + nowanswers.length + "</li>" + "<li>Новых:" + (nowanswers.length - readanswers.length) + "</li>" + "</ul>" + "<span>Комментарии:</span>" + "<ul>" + "<li>Всего:" + nowcomments.length + "</li>" + "<li>Новых:" + (nowcomments.length - readcomments.length) + "</li>" + "</ul>");
  $nav.appendTo(document.body);
  window.localStorage.setItem('__read_answers_' + qid, JSON.stringify(nowanswers));
  window.localStorage.setItem('__read_comments_' + qid, JSON.stringify(nowcomments));
  window.localStorage.setItem('__opened_' + qid, true);
}
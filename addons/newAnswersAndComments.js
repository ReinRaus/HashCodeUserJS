// @author Yura Ivanov
function __newAnswersAndComments() {
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
 var $nav = $("<div class='boxC'></div>");
 $nav.append("<p>ответы<br>" + "<strong>всего<span style=\"letter-spacing: 0.8ex;\">&nbsp</span>: " + nowanswers.length + "</strong><br>" + "<strong>новых  " + (nowanswers.length - readanswers.length) + "</strong><br></p>" + "<p>комментарии<br>" + "<strong>всего<span style=\"letter-spacing: 0.8ex;\">&nbsp</span>: " + nowcomments.length + "</strong><br>" + "<strong>новых  " + (nowcomments.length - readcomments.length) + "</strong><br></p>");
 $nav.insertAfter(document.getElementById('CARight').children[0]);
 window.localStorage.setItem('__read_answers_' + qid, JSON.stringify(nowanswers));
 window.localStorage.setItem('__read_comments_' + qid, JSON.stringify(nowcomments));
 window.localStorage.setItem('__opened_' + qid, true);
}

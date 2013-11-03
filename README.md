HashCodeUserJS
==============

HashCode.ru UserJS

Данный проект представляет собой модификации сайта hashcode.ru посредством внедрения пользовательских скриптов на страницу.

В данный момент поддерживаются три браузера:
- Google Chrome. Дамп правила для его расширения Персональный веб
  https://chrome.google.com/webstore/detail/personalized-web/plcnnpdmhobdfbponjpedobekiogmbco
- Mozilla FireFox. UserJS для расширения GreaseMonkey
  https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/
- Opera на движке WebKit. UserJS для расширения ViolentMonkey
  https://addons.opera.com/ru/extensions/details/violent-monkey/?display=ru
  
После установки слева от Вашего ника появляется иконка приложения. Нажатие на нее ведет к доступным настройкам.

Желающих присоединиться к разработке прошу ознакомиться с NOTE.
Хочу отметить, что разработка ведется очень легко- чтобы сделать новую функциональность
для ХэшКода нужно всего лишь написать одну функцию, которая будет исполняться в контексте
самого сайта, а скрипт deploy.py сам соберет релизы под поддерживаемые браузеры.
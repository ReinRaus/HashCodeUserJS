function __collapseLongCodeBlock() {
    var defaultSettings= {
        title: 'Сворачивание длинного кода',
        description: 'К слишком большим участкам кода добавляется полоса прокрутки.',
        exports: {
            "maxheight": {"type":"text", "value":"400px", "title":"Ограничить максимальную высоту значением:"},
            "yscroll": {"type":"checkbox", "value":"0", "title":"Добавить горизонтальную прокрутку"}
        },
        order: ["maxheight", "yscroll"]
    };
    var settings= __addonsSettings.getUpdatedSettings( arguments.callee.name, defaultSettings );
    $code= $(".prettyprint");
    if ($code.length>0) {
        $code.css({
            "height":"auto",
            "max-height": settings.exports.maxheight.value,
            "overflow-y":"auto"});
        if (settings.exports.yscroll.value=="1"){
            $code.css({
                "word-wrap":"normal",
                "white-space":"pre"});
        };
    };
};
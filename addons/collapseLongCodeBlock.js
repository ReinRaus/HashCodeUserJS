{
    name: 'collapseLongCodeBlock',
    title: 'Сворачивание длинного кода',
    description: 'К слишком большим участкам кода добавляется полоса прокрутки.',
    settings: {
        maxheight: "400px",
        yscroll: "0"
    },
    exports: [
        {name: "maxheight", type: "text", title: "Ограничить максимальную высоту значением:"},
        {name: "yscroll", type: "checkbox", title: "Добавить горизонтальную прокрутку"}
    ],
    run: function() {
        $code= $(".prettyprint");
        if ($code.length>0) {
            $code.css({
                "height":"auto",
                "max-height": this.settings.maxheight,
                "overflow-y":"auto"});
            if (this.settings.yscroll=="1"){
                $(".prettyprint code").css({"white-space": "nowrap"});
            }
        }
    }
}
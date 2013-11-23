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
        window.addonsLoader.API.addCSS(".prettyprint , .syntaxhighlighter {height:auto !important;max-height: "+parseInt(this.settings.maxheight)+"px !important;overflow-y:auto !important}");
        if (this.settings.yscroll=="1"){
            window.addonsLoader.API.addCSS(".prettyprint code {white-space: nowrap}");
        }
    }
}
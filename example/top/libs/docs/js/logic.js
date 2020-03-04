/*
 * route 
 */  
function route(params) {
    // Check if layout_main exists
    if(!Top.Dom.selectById('layout_main')){
        var layout_content = Top.Dom.selectById("layout_content");
        layout_content.src('html/layout_content.html', function(){
            route(params);
        });
        return;
    }

    // Check lnb Menu
    Top.Controller.get('lnbController').on_route(params);

    var layout_main = Top.Dom.selectById("layout_main");
    if(params.main === 'widgets'){
        if(params.sub === ''){
            layout_main.src('html/layout_intro.html', function(){
                layout_main.append('html/layout_widget_list.html');
            });
        }
        else if(params.sub === "graph") {
            layout_main.src('html/widgets/graph_desc.html');
        }
        else{
            layout_main.src('html/layout_widget.html');
        }
    }
    else if(params.main === 'style'){
        if(params.sub === ''){
            layout_main.src('html/layout_intro.html', function(){
                layout_main.append('html/style/shadow_dom.html');
            });
        }
        else{
            layout_main.src('html/style/' + params.sub + '.html');
        }
    }
    else if(params.main === 'demo'){
        if(params.sub === ''){
            layout_main.src('html/layout_intro.html');
        }
        else{
            layout_main.src("html/demo/code.html");
            Top.Controller.get("demoController").initDemoCode(params.sub);
        }
    }
    else if(params.main === 'api'){
        if(params.sub === ''){
            layout_main.src('html/layout_intro.html');
        }
        else{
            layout_main.src('html/layout_api.html');
        }
    }
    else if(params.main === 'framework'){
        if(params.sub === ''){
            layout_main.src('html/layout_intro.html');
        }
        else{
            layout_main.src('html/' + params.main + '/' + params.sub + '.html');
        }
    }
    else if(params.main === 'chart'){
        if(params.sub === ''){
            layout_main.src('html/layout_intro.html');
        }
        else{
            layout_main.src('html/' + params.main + '/' + params.sub + '.html');
        }
    }
    else if(params.main === 'test'){
        if(params.sub === ''){
            layout_main.src('html/layout_intro.html');
        }
        else{
            layout_main.src('html/layout_test.html');
            docsData.setValue('namespace', params.sub);
        }
    }
}


/*
 * 상단 탭 GNB
 */
function tabOnSelect(e, tab) {
    if (Top.curRoute.params !== undefined && Top.curRoute.params.main === tab.getSelectedTab().id) return;
    Top.App.routeTo(tab.getSelectedTab().id);
}


/*
 * 좌측 메뉴 LNB
 */
Top.Controller.create('lnbController', {
    init: function(widget){
        var params = Top.curRoute.params;
        widget.setProperties({'items': lnbMenuData[params.main]});
        widget.open(lnbMenuData['widgets_reverse'][params.sub] || params.sub);
        this.lnb_menu = widget;
    },
    on_route: function(params){
        var menu = this.lnb_menu;
        var params_before = {main: Top.curRoute.before.split('/')[1], sub: Top.curRoute.before.split('/')[2]};

        // 상단 탭 이동
        if(params_before.main !== params.main) {
            menu.setProperties({'items': lnbMenuData[params.main]});
        }

        // widget depth있는 menu에서 없는 menu로 이동할 떄 selected 중복되는 문제
        if(lnbMenuData['widgets_reverse'][params_before.sub] && !lnbMenuData['widgets_reverse'][params.sub]){
            menu.deSelect();
            menu.close(lnbMenuData['widgets_reverse'][params_before.sub]);
            menu.open(lnbMenuData['widgets_reverse'][params.sub] || params.sub);
        }
    }
});



/*
 * 메인 화면 버튼
 */
Top.Controller.create('startButtonController', {
    over: function(event, widget){
        this.rename(widget, "hovered");
    },
    down: function(event, widget){
        this.rename(widget, "pressed")
    },
    leave: function(event, widget){
        this.rename(widget, "normal")
    },
    // ex) res/js_web_btn_start_normal.png -> res/js_web_btn_start_hovered.png
    rename: function(widget, to){
        var src = widget.getSrc().split('_');
        src[4] = to + ".png";
        widget.setSrc(src.join('_'));
    }
});


/*
 * 페이지별 메인 화면
 */
Top.Controller.create('indexController', {
    init: function(widget){
        var path = Top.curRoute.params.main;
        widget.selectById('title').setText(titleData.getValue(path).title);
        widget.selectById('title-desc').setText(titleData.getValue(path).desc);
    }
})

/*
 * Widget list 
 * generate widget list from lnbMenuata
 */
Top.Controller.create('widgetListController', {
    init: function(widget){
        var _this = this;
        var widget_list = lnbMenuData.widgets;
        var br = document.createElement('BR'); // sixth button line-break
        var btn_property = {'layout-width': '177px', 'layout-height': "50px", 'margin': "0px 20px 20px 0px"};
        var etc_index = 0;
        widget_list.forEach(function(w){
            if(w.children){
                var box = widget.selectById(w.id + '_box');
                w.children.forEach(function(i, index){
                    var btn = Top.Widget.create('top-button');
                    btn.setProperties($.extend({'text': i.text, 'on-click': i.selected}, btn_property));
                    btn.addClass('box_item');
                    box.addWidget(btn);
                    if((index + 1) % 6 == 0) {
                        box.complete();
                        box = widget.selectById(w.id + '_box2');
                    }
                });
                box.complete();
            }
            else{
                if(etc_index + 1 <= 6){
                    var box = widget.selectById('ETC_box');
                }
                else if(etc_index + 1 <= 12){
                    var box = widget.selectById('ETC_box2');
                }
                else if(etc_index + 1 <= 18){
                    var box = widget.selectById('ETC_box3');
                }
                etc_index += 1;
                var btn = Top.Widget.create('top-button');
                btn.setProperties($.extend({'text': w.text, 'on-click': w.selected}, btn_property));
                btn.addClass('box_item');
                box.addWidget(btn);
                box.complete();
            }
        });
        widget.complete();
    },
    gen_row: function(widget, title, item_list){
        var tv = Top.Widget.create('top-textview');
        tv.setProperties({'text': title, 'text-size': '30px', 'layout-height': "30px", "margin": "70px 50px 0px 50px", "text-style":"bold", 'layout-horizontal-alignment': "left"});
        widget.addWidget(tv);
        widget.addWidget(Top.Widget.create('top-linearlayout'));
        var c = Top.Widget.create('top-linearlayout');
        c.setProperties({'horizontal-alignment': "left", 'margin': "30px 0px 0px 90px", 'border-width': '0px'});
        widget.addWidget(c);
        item_list.forEach(function(w){
            var text = w.text;
            var btn = Top.Widget.create('top-button');
            btn.setProperties({'text': text, 'layout-height': "30px", 'text-size': "15px", 'margin': "5px", 'on-click': w.selected});
            btn.addClass('violet');
            c.addWidget(btn);
        });
        c.complete();
    }
});


/*
 * /widget 페이지 logic
 */  
Top.Controller.create('widgetInfoController', {
    init: function(widget) {
        var widget_name = Top.curRoute.params.sub;
        docsData.setValue('namespace', widget_name.replace(/^./, widget_name[0].toUpperCase()));
        // set code editor, example
        this.setExampleHtml(widget, widget_name); 

        // set overview, selectbox version, property-desc items
        var version = docsData.version;
        query_data('overview', widget_name);
        var select_box = widget.selectById('version_box');
        select_box.setProperties({'selected-text': version});
        this.makePropertyDescItems(widget_name);
        
        // set property, method, event data table
        this.setDataTable(widget_name);
    },
    setExampleHtml: function(widget, widget_name){
        var url = "html/widgets/" + widget_name + ".html";
        widget.selectById('example_view').src(url);
        Top.Ajax.execute({
            url: url,
            type: "GET",
            success: function(data, textStatus, jqXHR) {
                widget.selectById('example_editor').setText(data);
            }
        });
    },
    setDataTable: function(widget_name){
        // set property, event, method table
        query_data('property', widget_name);
        query_data('event', widget_name);
        query_data('method', widget_name);
    },
    onVersionChange: function(event, widget){
        var version = widget.getValue();
        var widget_name = Top.curRoute.params.sub;
        docsData.setValue('version', version);
        query_data('overview', widget_name);
        this.setDataTable(widget_name);
    },
    makePropertyDescItems: function(widget_name){
        if(['menu', 'spinner', 'chart'].includes(widget_name)){
           var url = 'html/widgets/' + widget_name + '_desc.html';
           Top.Dom.selectById('layout_main').append(url);
        }
    }
});


/*
 * /api 페이지 logic
 */  
Top.Controller.create('apiInfoController', {
    init: function(widget) {
        var api_name = Top.curRoute.params.sub;
        docsData.setValue('namespace',  api_name.replace(/^./, api_name[0].toUpperCase()));
        // set overview, selectbox version, table items
        var version = docsData.version;
        query_data('overview', api_name);
        query_data('method', api_name); 
        select_box = widget.selectById('version_box');
        select_box.setProperties({'selected-text': version});
    },
    onVersionChange: function(event, widget){
        var version = widget.getValue();
        var api_name = docsData.getValue('namespace');
        docsData.setValue('version', version);
        query_data('method', api_name); 
    }
});


/*
 * /demo 페이지 logic
 */  
Top.Controller.create("demoController", {
    init: function(widget) {
        Top.Data.create("demoCode", {
            html: "",
            js: ""
        });
    },
    initDemoCode: function(selected) {
        var _this = this;
        this.onInit(function() {
            if (selected === "hello") {
                var htmlUrl = "html/demo/helloworld.html";
                var jsUrl = "js/demo/helloworld.js";
            } else if (selected === "addressbook") {
                var htmlUrl = "html/demo/addressbook.html";
                var jsUrl = "js/demo/addressbook.js";
            } else if (selected === "chart") {
                var htmlUrl = "html/demo/chart.html";
                var jsUrl = "js/demo/tutorialChart.js";
            }
            Top.Ajax.execute({
                url: htmlUrl,
                success: function(data) {
                    _this.demoCode.setValue("html", data);
                }
            });
            Top.Ajax.execute({
                url: jsUrl,
                success: function(data) {
                    _this.demoCode.setValue("js", data);
                }
            });
        });
    },
    runDemoCode: function() {
        $('head').append("<script>" + this.demoCode.js + "</script>");
        Top.Dom.selectById("demoResult").html(this.demoCode.html);
    }
});


/*
 * data/{version}/ 에 있는 docsData에 ajax 요청
 */
function query_data(data_type, namespace){
    docsData.setValue(data_type, []);
    var version = docsData.version;
    if(namespace === 'throbber') return; // throbber 는 위젯이 아니지만 example 보여주기 위해 
    // 데이터 없을 시 ajax 요청후 recursion
    if(docsData.data[version] === undefined){
        Top.Ajax.execute({
            url: 'data/' + version + '/data.dump.json',
            type: 'GET',
            success: function(data){
                docsData.data[version] = JSON.parse(data);
                query_data(data_type, namespace);
            }
        });
        return;
    }
    docsData.setValue(data_type, docsData.data[version][namespace][data_type]);
    if(data_type === 'overview' && !docsData.data[version][namespace].overview) docsData.setValue('overview', docsData.namespace); // overview data 없는 경우
}


/*
 * test 페이지
 */
Top.Controller.create("testController", {
    init: function(widget){
        var version = docsData.version;
        var select_box = widget.selectById('version_box');
        select_box.setProperties({'selected-text': version});
        this.setData(version);
    },
    setData: function(version){
        var namespace = docsData.namespace;
        var url = 'data/' + version + '/summary.json';
        Top.Ajax.execute({
            url: url,
            type: "GET",
            success: function(data, textStatus, jqXHR) {
                var summary_data = JSON.parse(data)[namespace];
                if(summary_data === undefined){
                    summary_data = {event:'', method:'', property:''};
                };
                var task_list = ['property', 'method', 'event'];
                task_list.forEach(function(task){
                    var item = summary_data[task];
                    docsData.setValue(task, item);
                    Top.Dom.selectById(task).setText(task + ': ' + + item.length + ' comments');
                })
                docsData.setValue('version', version);
            }
        });
    },
    onVersionChange: function(event, widget){
        var version = widget.getValue();
        this.setData(version);
    }
});


/*
 * Initialize docs data
 */
Top.Ajax.execute({
    url: "data/version_list.json",
    type: "GET",
    success: function(data, textStatus, jqXHR) {
        var version_list =  eval(data);
        var latest_version =  version_list.slice(-1)[0];
        docsData.setValue('version_list',version_list);
        docsData.setValue('version', latest_version);
    }
});
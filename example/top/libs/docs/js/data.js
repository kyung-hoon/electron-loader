/*
 * 상단 GNB data 
 */
Top.Data.create('gnbTabData', {
    items:[
        { id: "/widgets/", text: "Widgets" },
        { id: "/chart/", text: "Chart" },
        { id: "/style/", text: "Style" },
        { id: "/framework/", text: "Framework" },
        { id: "/api/", text: "API" },
        // { id: "/demo/", text: "Demo" }
    ]
});

/*
 * 좌측 LNB menu data
 */
Top.Data.create('lnbMenuData', {
    framework: [
        { text: "Application", selected: "/framework/application" },
        // { text: "Widget", selected: "/framework/widget" },
        { text: "Controller", selected: "/framework/controller" },
        { text: "Data", selected: "/framework/data" },
        { text: "Event", selected: "/framework/event" },
        { text: "Routing", selected: "/framework/routing" },
        { text: "Ajax", selected: "/framework/ajax" },
        { text: "i18n", selected: "/framework/i18n" }
    ],
    chart: [
        { text: "Options", selected: "/chart/option" },
        { text: "APIs", selected: "/chart/api" },
    ],
    widgets: [
        { text: "Layout", id: 'layout',
          children: [
              {
                "text": "Layout", 
                "id": "layout",
                "selected": "/widgets/layout"
              },
              {
                "text": "LinearLayout",
                "selected": "/widgets/linearlayout",
                "id": "linearlayout"
              },
              {
                "text": "FrameLayout",
                "selected": "/widgets/framelayout",
                "id": "framelayout"
              },
              {
                "text": "TabLayout",
                "selected": "/widgets/tablayout",
                "id": "tablayout"
              },
              {
                "text": "AccordionLayout",
                "selected": "/widgets/accordionlayout",
                "id": "accordionlayout"
              },
              {
                "text": "ScrollLayout",
                "selected": "/widgets/scrolllayout",
                "id": "scrolllayout"
              },
              {
                "text": "GridLayout",
                "selected": "/widgets/gridlayout",
                "id": "gridlayout"
              },
              {
                "text": "SplitterLayout",
                "selected": "/widgets/splitterlayout",
                "id": "splitterlayout"
              },
              {
                "text": "AbsoluteLayout",
                "selected": "/widgets/absolutelayout",
                "id": "absolutelayout"
              },
              {
                "text": "FoldingLayout",
                "selected": "/widgets/foldinglayout",
                "id": "foldinglayout"
              },
              {
                "text": "AccordionTab",
                "selected": "/widgets/accordiontab",
                "id": "accordiontab"
              },
              {
                "text": "DockLayout",
                "selected": "/widgets/docklayout",
                "id": "docklayout"
              }
          ]},
        { text: "Container", id: 'container',
          children: [
              { text: "TableView", id: 'tableview', selected: "/widgets/tableview" },
              { text: "ListView", id: 'listview', selected: "/widgets/listview" },
              { text: "SelectBox", id: 'selectbox', selected: "/widgets/selectbox" },
              { text: "TreeView", id: 'treeview', selected: "/widgets/treeview" },
              { text: "Panel", id: 'panel', selected: "/widgets/panel" },
              { text: "Dialog", id: 'dialog', selected: "/widgets/dialog" },
              { text: "WidgetItem", id: 'widgetitem', selected:"/widgets/widgetitem" },
        ]}, 
        { text: "Button", id: 'button',
          children: [
              { id:'button', text: "Button", selected: "/widgets/button" },
              { id: 'toggle', text: "Toggle", selected: "/widgets/toggle" },
              { id: 'switch', text: "Switch", selected: "/widgets/switch" },
              { id: 'imagebutton', text: "ImageButton", selected: "/widgets/imagebutton" },
        ]}, 
        { text: "Controls", id: 'controls',
          children: [
              { text: "CheckBox", id: 'checkbox', selected: "/widgets/checkbox" },
              { text: "RadioButton", id: 'radiobutton', selected: "/widgets/radiobutton" },
              { text: "Spinner", id: 'spinner', selected: "/widgets/spinner" },
              { text: "ButtonGroup", id: 'buttongroup', selected: "/widgets/buttongroup" },
        ]},
        { text: "Text", id: 'text',
          children: [
              { text: "TextField", id: 'textfield', selected: "/widgets/textfield" },
              { text: "TextArea", id: 'textarea', selected: "/widgets/textarea" },
              { text: "TextView", id: 'textview', selected: "/widgets/textview" },
              { text: "CodeEditor", id: 'codeeditor', selected: "/widgets/codeeditor" },
              { text: "HtmlEditor", id: 'htmleditor', selected: "/widgets/htmleditor" },
        ]},
        { text: "Menu", id: 'menu',
          children: [
              { text: "Menu", id: 'menu', selected: "/widgets/menu" },
              { text: "BreadCrumb", id: 'breadcrumb', selected: "/widgets/breadcrumb" },
              { text: "ContextMenu", id: 'contextmenu', selected: "/widgets/contextmenu" },
              { text: "SideMenu", id: 'sidemenu', selected: "/widgets/sidemenu" },
        ]},
        { text: "View", id: 'view',
          children: [
              { text: "ImageView", id: 'imageview', selected: "/widgets/imageview" },
              { text: "VideoView", id: 'videoview', selected: "/widgets/videoview" },
              { text: "WebView", id: 'webview', selected: "/widgets/webview" },
        ]}, 
        { text: "Bar", id: 'bar',
          children: [
              { text: "Slider", id: 'slider', selected: "/widgets/slider" },
              { text: "ProgressBar", id: 'progressbar', selected: "/widgets/progressbar" },
        ]},
        { text: "Dashboard", id: 'dashboard', selected:"/widgets/dashboard" },
        { text: "Icon", id: 'icon', selected: "/widgets/icon" },
        { text: "AlarmBadge", id: 'alarmbadge', selected: "/widgets/alarmbadge" },
        { text: "Page", id: 'page', selected: "/widgets/page" },
        { text: "DatePicker", id: 'datepicker', selected: "/widgets/datepicker" },
        { text: "Notification", id: 'notification', selected: "/widgets/notification" },
        { text: "Pagination", id: 'pagination', selected: "/widgets/pagination" },
        { text: "Chart", id: 'chart', selected: "/widgets/chart" },
        { text: "Graph", id: 'graph', selected: "/widgets/graph" },
        { text: "Colorpicker", id: 'colorpicker', selected: "/widgets/colorpicker" },
        { text: "Chip", id: 'chip', selected: "/widgets/chip" },
        { text: "ImageSlider", id: 'imageslider', selected: "/widgets/imageslider" },
        { text: "Popover", id: 'popover', selected: "/widgets/popover" },
        { text: "Stepper", id: 'stepper', selected: "/widgets/stepper" },
        { text: "Throbber", id: 'throbber', selected: "/widgets/throbber" },
        { text: "Ajax", id: 'ajax', selected: "/widgets/top_ajax" },
        { text: "Timer", id: 'timer', selected: "/widgets/timer" }
    ],
    widgets_reverse: {
		"layout": "layout",
		"linearlayout": "layout",
		"framelayout": "layout",
		"tablayout": "layout",
		"accordionlayout": "layout",
		"scrolllayout": "layout",
		"gridlayout": "layout",
		"splitterlayout": "layout",
		"absolutelayout": "layout",
		"foldinglayout": "layout",
		"accordiontab": "layout",
		"docklayout": "layout",
		"tableview": "container",
		"listview": "container",
		"selectbox": "container",
		"treeview": "container",
		"panel": "container",
		"dialog": "container",
		"widgetitem": "container",
		"button": "button",
		"toggle": "button",
		"switch": "button",
		"imagebutton": "button",
		"checkbox": "controls",
		"radiobutton": "controls",
		"spinner": "controls",
		"textfield": "text",
		"textarea": "text",
		"textview": "text",
		"codeeditor": "text",
		"htmleditor": "text",
		"menu": "menu",
		"breadcrumb": "menu",
		"contextmenu": "menu",
		"sidemenu": "menu",
		"imageview": "view",
		"videoview": "view",
		"webview": "view",
		"slider": "bar",
		"progressbar": "bar",
	},
    api: [
        { text: "Top", selected: "/api/top" },
        { text: "Top.Action", selected: "/api/action" },
        { text: "Top.Ajax", selected: "/api/ajax" },
        { text: "Top.App", selected: "/api/app" },
        { text: "Top.Data", selected: "/api/data" },
        { text: "Top.Dom", selected: "/api/dom" },
        { text: "Top.Controller", selected: "/api/controller" },
        { text: "Top.Model", selected: "/api/model" },
        { text: "Top.Model.Controller", selected: "/api/modelcontroller" },
        { text: "Top.Widget", selected: "/api/widget" },
        { text: "Top.Loader", selected: "/api/loader" },
        { text: "Top.DataController", selected: "/api/datacontroller" },
        { text: "Top.Device", selected: "/api/device"},
        { text: "Top.Device.RestAPI", selected: "/api/restapi" },
        { text: "Top.Device.FileChooser", selected: "/api/filechooser" },
        { text: "Top.Module", selected: "/api/module" },
        { text: "Top.URIHelper", selected: "/api/urihelper" },
        { text: "Top.Util", selected: "/api/util" },
        { text: "Top.Util.Browser", selected: "/api/browser" },
        { text: "Top.Excel", selected: "/api/excel" },
        { text: "Top.i18n", selected: "/api/i18n" },
        { text: "Top.LiveReload", selected: "/api/livereload" },
        { text: "Top.RawManager", selected: "/api/rawmanager" },
        { text: "Top.ValuesManager", selected: "/api/valuesmanager" },
        { text: "Top.ContextMenu", selected: "/api/top_contextmenu" },
    ],
    style: [
        { text: "Widget", selected: "/style/widgets"},
        { text: "Layouts", selected: "/style/layouts" },
        { text: "Container", selected: "/style/container" },
        { text: "Button", selected: "/style/button" },
        { text: "Text", selected: "/style/text" },
    ],
    demo: [
        { text: "Hello, world!", selected: "/demo/hello" },
        { text: "Address book", selected: "/demo/addressbook" },
        { text: "Chart", selected: "/demo/chart" }
    ],
    test: [
        { text: "src/widget/top-*.js", children:[
            {"text":"absolutelayout","selected": "/test/absolutelayout"},
            {"text":"accordionlayout","selected": "/test/accordionlayout"},
            {"text":"accordiontab","selected": "/test/accordiontab"},
            {"text":"top_ajax","selected": "/test/top_ajax"},
            {"text":"alarmbadge","selected": "/test/alarmbadge"},
            {"text":"breadcrumb","selected": "/test/breadcrumb"},
            {"text":"button","selected": "/test/button"},
            {"text":"chart","selected": "/test/chart"},
            {"text":"checkbehavior","selected": "/test/checkbehavior"},
            {"text":"checkbox","selected": "/test/checkbox"},
            {"text":"chip","selected": "/test/chip"},
            {"text":"codeeditor","selected": "/test/codeeditor"},
            {"text":"colorpicker","selected": "/test/colorpicker"},
            {"text":"commonstylebehavior","selected": "/test/commonstylebehavior"},
            {"text":"containerbehavior","selected": "/test/containerbehavior"},
            {"text":"contextmenu","selected": "/test/contextmenu"},
            {"text":"controlbehavior","selected": "/test/controlbehavior"},
            {"text":"databehavior","selected": "/test/databehavior"},
            {"text":"datepicker","selected": "/test/datepicker"},
            {"text":"devicebehavior","selected": "/test/devicebehavior"},
            {"text":"dialog","selected": "/test/dialog"},
            {"text":"docklayout","selected": "/test/docklayout"},
            {"text":"elementbehavior","selected": "/test/elementbehavior"},
            {"text":"eventbehavior","selected": "/test/eventbehavior"},
            {"text":"foldinglayout","selected": "/test/foldinglayout"},
            {"text":"framelayout","selected": "/test/framelayout"},
            {"text":"graphnavigator","selected": "/test/graphnavigator"},
            {"text":"graph","selected": "/test/graph"},
            {"text":"gridlayout","selected": "/test/gridlayout"},
            {"text":"groupbehavior","selected": "/test/groupbehavior"},
            {"text":"htmleditor","selected": "/test/htmleditor"},
            {"text":"i18nbehavior","selected": "/test/i18nbehavior"},
            {"text":"icon","selected": "/test/icon"},
            {"text":"imagebutton","selected": "/test/imagebutton"},
            {"text":"imageslider","selected": "/test/imageslider"},
            {"text":"imageview","selected": "/test/imageview"},
            {"text":"layoutbehavior","selected": "/test/layoutbehavior"},
            {"text":"layout","selected": "/test/layout"},
            {"text":"linearlayout","selected": "/test/linearlayout"},
            {"text":"listview","selected": "/test/listview"},
            {"text":"menubehavior","selected": "/test/menubehavior"},
            {"text":"menu","selected": "/test/menu"},
            {"text":"notification","selected": "/test/notification"},
            {"text":"page","selected": "/test/page"},
            {"text":"pagination","selected": "/test/pagination"},
            {"text":"panel","selected": "/test/panel"},
            {"text":"popover","selected": "/test/popover"},
            {"text":"progressbar","selected": "/test/progressbar"},
            {"text":"radiobutton","selected": "/test/radiobutton"},
            {"text":"rangebehavior","selected": "/test/rangebehavior"},
            {"text":"resourcebehavior","selected": "/test/resourcebehavior"},
            {"text":"scrolllayout","selected": "/test/scrolllayout"},
            {"text":"selectbox","selected": "/test/selectbox"},
            {"text":"sidemenu","selected": "/test/sidemenu"},
            {"text":"slider","selected": "/test/slider"},
            {"text":"spinner","selected": "/test/spinner"},
            {"text":"splitterlayout","selected": "/test/splitterlayout"},
            {"text":"stepper","selected": "/test/stepper"},
            {"text":"switch","selected": "/test/switch"},
            {"text":"tablayout","selected": "/test/tablayout"},
            {"text":"tableview","selected": "/test/tableview"},
            {"text":"textbehavior","selected": "/test/textbehavior"},
            {"text":"textarea","selected": "/test/textarea"},
            {"text":"textfield","selected": "/test/textfield"},
            {"text":"textview","selected": "/test/textview"},
            {"text":"toggle","selected": "/test/toggle"},
            {"text":"treeview","selected": "/test/treeview"},
            {"text":"videoview","selected": "/test/videoview"},
            {"text":"webview","selected": "/test/webview"},
            {"text":"widget","selected": "/test/widget"},
            {"text":"customwidget","selected": "/test/customwidget"},
            {"text":"widgetitem","selected": "/test/widgetitem"},
        ]},
        { text: "src/core/top-core.js", children:[
            {"text":"top","selected": "/test/top"},
            {"text":"app","selected": "/test/app"},
            {"text":"action","selected": "/test/action"},
            {"text":"data","selected": "/test/data"},
            {"text":"model","selected": "/test/model"},
            {"text":"modelcontroller","selected": "/test/modelcontroller"},
            {"text":"datacontroller","selected": "/test/datacontroller"},
            {"text":"dom","selected": "/test/dom"},
            {"text":"ajax","selected": "/test/ajax"},
            {"text":"device","selected": "/test/device"},
            {"text":"restapi","selected": "/test/restapi"},
            {"text":"filechooser","selected": "/test/filechooser"},
            {"text":"controller","selected": "/test/controller"},
            {"text":"module","selected": "/test/module"},
            {"text":"util","selected": "/test/util"},
            {"text":"browser","selected": "/test/browser"},
            {"text":"i18n","selected": "/test/i18n"},
            {"text":"livereload","selected": "/test/livereload"},
            {"text":"drawablemanager","selected": "/test/drawablemanager"},
            {"text":"rawmanager","selected": "/test/rawmanager"},
            {"text":"valuesmanager","selected": "/test/valuesmanager"},
            {"text":"top_contextmenu","selected": "/test/top_contextmenu"},
            {"text":"loader","selected": "/test/loader"},
            {"text":"excel","selected": "/test/excel"}
        ]}
    ]    
});

/* 
 * 각 페이지별 intro title
 */
Top.Data.create('titleData', {
    widgets: {title: "Widgets", desc: "Enjoy TOP.js's smart widgets"},
    framework: {title: "Framework", desc: ""},
    chart:  {title: "Chart", desc: "Let experience optimal TOPchart"},
    api: {title: "API", desc: ""},
    demo: {title: "Demo" , desc: "Demo"},
    style: {title: "CSS", desc: "Encapsulated style with Shadow DOM and you can customize style with easy class names"},
    test: {title: "Test page", desc: "This is docs data test page"}
})

/*
 * docs data
 */
Top.Data.create('docsData', {
    version: '', // 현재 보고 있는 버전 
    version_list: [], // 사용 가능한 버전 리스트
    namespace: "",
    overview: '', // 현재 버전과 위젯에 해당하는 설명
    property: [], // 현재 버전과 위젯에 해당하는 property json
    event: [], // 현재 버전과 위젯에 해당하는 event json
    method: [], // 현재 버전과 위젯에 해당하는 method json
    data: {} // 전체 데이터 파일, data.dump.json
});


/* 
 * chart
 */
Top.Data.create('chartData', {
    chart_option : [
        { 'Option': 'title', 'Description': '차트 제목 관련 속성', 'Example': 'title: {text: \'Chart title\', align: \'center\', margin: {top: 3, right: 20, bottom: 10, left: 20}}' },
        { 'Option': 'chart', 'Description': '일반적인 차트 속성: 전체적인 부분, Plot 부분에 적용되는 속성', 'Example': 'chart: {type:\'area\', margin:{top: 3, right: 20, bottom: 10, left: 20}, backgroundColor:\'#FCFFC5\', borderColor:\'#BFAA0C\', borderWidth: 3, plotBackgroundColor:\'#5F571B\', plotShadow: true}' },
        { 'Option': 'legend', 'Description': 'Legend 관련 속성', 'Example': 'legend: {enabled: true, hide: false, x: 100, y: 30, align: \'center\', layout: \'vertical\', itemDistance: 10}' },
        { 'Option': 'xAxis', 'Description': 'x축 관련 속성', 'Example': 'xAxis: {show: true, categories: [\'Jan\', \'Feb\', \'Mar\', \'Apr\', \'May\', \'Jun\', \'Jul\', \'Aug\', \'Sep\', \'Oct\', \'Nov\', \'Dec\']}' },
        { 'Option': 'yAxis', 'Description': 'y축 관련 속성', 'Example': 'yAxis: {show: true, max: 100, min : 10}' },
        { 'Option': 'tooltip', 'Description': '데이터 마우스오버 시 Tooltip 관련 속성', 'Example': 'tooltip: {show: true, grouped: true}' },
        { 'Option': 'credits', 'Description': 'Credits 관련 속성', 'Example': ' credits: {enabled: true, href: \'http://kr.tmaxsoft.com/main.do\', text: \'© Topcharts\'}' },
        { 'Option': 'colors', 'Description': '차트에 그려지는 데이터 색상', 'Example': 'colors: [\'#168F56\', \'#FF5C7D\',\'#4572A7\',\'#E4902A\']' },
        { 'Option': 'series', 'Description': '차트 데이터 배열', 'Example': 'series: [{name:"A", data: [30, 20, 10, 20, 30, 40, 3]}, {name:"B", data: [40, 10, 60, 43, 36, 5, 22]}]' },
        { 'Option': 'labels', 'Description': '차트 label', 'Example': 'labels: [{text: "chart_label1", x:20 , y:40 }, {text: "chart_label2", x:80 , y:40}]' },
        { 'Option': 'grid', 'Description': '차트 Grid 관련 속성', 'Example': 'grid: {x: {show: false}, y: {lines :[{value: 17, text: \'Label on 17\'}]}}' },
    ]
});


/* 
 * graph
 */
Top.Data.create('graphData', {
    style_style_options : [{
        'Classification': '',
        'Property Name': '',
        'Description': ''
    }, {
        'Classification': 'Node',
        'Property Name': 'width, height',
        'Description': 'Node를 구성하는 도형의 크기'
    }, {
        'Classification': '',
        'Property Name': 'shape',
        'Description': 'Node를 구성하는 도형의 모양; rectangle, ellipse, trinagle, pentagon, hexagon, star, diamond, polygon, etc.'
    }, {
        'Classification': '',
        'Property Name': 'background-color, background-opacity',
        'Description': 'Node를 구성하는 도형의 색 및 opacity (0~1)'
    }, {
        'Classification': '',
        'Property Name': 'border-width, border-color, border-opacity',
        'Description': 'Node 테두리의 style'
    }, {
        'Classification': '',
        'Property Name': 'border-style',
        'Description': 'Node 테두리 선 style; solid, dotted, dashed or double'
    }, {
        'Classification': '',
        'Property Name': 'padding-left, padding-right, padding-top, padding-bottom',
        'Description': 'Node를 구성하는 도형의 색 및 opacity '
    }, {
        'Classification': '',
        'Property Name': 'background-image',
        'Description': 'Node를 채울 image file'
    }, {
        'Classification': '',
        'Property Name': 'backgroun-image-opacity, background-width, background-height',
        'Description': 'Node background-image의 style'
    }, {
        'Classification': '',
        'Property Name': '',
        'Description': ''
    }, {
        'Classification': 'Edge',
        'Property Name': 'width',
        'Description': 'Edge line의 width'
    }, {
        'Classification': '',
        'Property Name': 'line-color, line-style',
        'Description': 'Edge line의 색상 및 style; solid, dotted, dashed'
    }, {
        'Classification': '',
        'Property Name': 'curve-style',
        'Description': 'Edge line의 커브 종류; haystack (default), bezier, unbundled-bezier, segments (of straight lines)'
    }, {
        'Classification': '',
        'Property Name': '(pos)-arrow-color, (pos)-arrow-shape, (pos)-arrow',
        'Description': 'Edge 화살표의 style; pos : source, mid-source, target, mid-target'
    }, {
        'Classification': '',
        'Property Name': '',
        'Description': ''
    }, {
        'Classification': 'Visibility',
        'Property Name': 'z-index',
        'Description': 'Element들의 z-index. Edge들은 z-index가 높아도 node들 아래에 위치'
    }, {
        'Classification': '',
        'Property Name': '',
        'Description': ''
    }, {
        'Classification': 'Labels',
        'Property Name': 'label, source-label, target-label',
        'Description': 'Texts for labels; edge는 자기 자신의 label 외에 source-label, target-label도 가질 수 있음'
    }, {
        'Classification': '',
        'Property Name': 'color, text-opacity, font-family, font-size, font-weight, etc.',
        'Description': 'Label font styling'
    }, {
        'Classification': '',
        'Property Name': 'text-halign, text-walign',
        'Description': 'Node label text의 정렬; halign - left, center or right; valign - top, center or bottom'
    }, {
        'Classification': '',
        'Property Name': 'source-text-offset, target-text-offset',
        'Description': 'Edge의 source-label, target-label에 대한 위치 offset'
    }, {
        'Classification': '',
        'Property Name': 'text-background-color, text-background-opacity',
        'Description': 'Label text background에 대한 styling'
    }, {
        'Classification': '',
        'Property Name': 'text-border-opacity, text-0border-color, text-border-width',
        'Description': 'Label text border에 대한 styling'
    }],
    style_selector_options : [{
        'Classification': 'Elements',
        'Selector Notation': 'node',
        'Description': 'node들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': 'edge',
        'Description': 'edge들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': '*',
        'Description': 'node, edge 가리지 않고 element 선택'
    }, {
        'Classification': '',
        'Selector Notation': '',
        'Description': ''
    }, {
        'Classification': 'Data',
        'Selector Notation': '[attribute]',
        'Description': '명시한 attribute를 가진 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': '[^attribute]',
        'Description': '명시한 attribute를 갖고 있지 않은 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': '[attribute = value]',
        'Description': 'attribute의 값이 명시한 값과 같은 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': '[attribute != value]',
        'Description': 'attribute의 값이 명시한 값과 다른 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': '[attribute > value] etc.',
        'Description': 'attribute의 값이 주어진 값보다 큰 element들을 선택( < , >= , <= 등 가능)'
    }, {
        'Classification': '',
        'Selector Notation': '',
        'Description': ''
    }, {
        'Classification': 'Compound Nodes',
        'Selector Notation': 'node1 > node',
        'Description': 'node1의 direct child인 node들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': 'node1 node',
        'Description': 'node1의 descendants인 node들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': '',
        'Description': ''
    }, {
        'Classification': 'State',
        'Selector Notation': ':animated',
        'Description': '현재 animate 되고 있는 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':unanimated',
        'Description': '현재 animate 되고 있지 않은 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':selected',
        'Description': '현재 select 된 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':unselected',
        'Description': '현재 select 되지 않은 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':selectable',
        'Description': 'selectable 한 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':unselectable',
        'Description': 'selectable 하지 않은 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':locked',
        'Description': '현재 상태가 locked 인 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':unlocked',
        'Description': '현재 상태가 locked 이지 않은 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':visible',
        'Description': '현재 visible한 (i.e. visibility: visible or display: element) element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':hidden',
        'Description': '현재 상태가 hidden인 (i.e. visibility: hidden or display: none) element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':transparent',
        'Description': '현재 transparent한 (i.e. opacity: 0) 인 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':backrounding',
        'Description': '현재 background image를 loading 하고 있는 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':nonbackgrounding',
        'Description': 'background image가 없거나 background image를 이미 load한 element들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':parent',
        'Description': '하나 이상의 child node를 가진 node들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':child or :nonorphan',
        'Description': 'parent node를 가진 node들을 선택'
    }, {
        'Classification': '',
        'Selector Notation': ':orphan',
        'Description': 'parent가 없는 node들을 선택'
    }],
    style_options : [{
        'Option Name': 'selector',
        'Description': 'Style을 적용할 대상에 대한 css-like selector',
        'Example': 'selector : \'node\', selector : \':selected\''
    }, {
        'Option Name': 'style',
        'Description': 'selector로 선택한 대상에 적용할 css-like style',
        'Example': 'style : { \'background - color\' : \'gray\' , \'border-color\' : \'black\' }'
    }],
    layout_common_options : [
        { 'Option Name': 'zoom', 'Description': 'viewport zoom level의 초기값', 'Type': 'number', 'Default': 'undefined' },
        { 'Option Name': 'pan', 'Description': 'viewport pan 위치의 초기값', 'Type': 'Object - x, y', 'Default': 'undefined' },
        { 'Option Name': 'fit', 'Description': 'graph를 viewport 안에 맞춰 그릴 것인지의 여부', 'Type': 'Boolean', 'Default': 'true' },
        { 'Option Name': 'padding', 'Description': 'viewport 내부 padding', 'Type': 'number', 'Default': '30' },
        { 'Option Name': 'boundingBox', 'Description': 'layout이 위치할 viewport 내부의 가상의 상자', 'Type': 'Object - x, y, w, h', 'Default': 'undefined' },
        { 'Option Name': 'animate', 'Description': 'node transition을 애니메이션으로 보여줄 지의 여부', 'Type': 'Boolean', 'Default': 'false' },
        { 'Option Name': 'anmiationDuration', 'Description': 'node transition에 소요되는 시간', 'Type': 'number', 'Default': '500' },
        { 'Option Name': 'anmiationEasing', 'Description': 'node transition에 easing을 부여할 지의 여부', 'Type': 'function(params) {}', 'Default': 'undefined' },
        { 'Option Name': 'ready', 'Description': 'layout이 초기 위치를 확정한 직후의 callback', 'Type': 'function() {}', 'Default': 'undefined' },
        { 'Option Name': 'stop', 'Description': 'node, edge 배치를 모두 마친 후의 callback', 'Type': 'function() {}', 'Default': 'undefined' },
    ],
    elements_options : [{
        'Attribute Name': 'group',
        'Type': 'String',
        'Description': '\'nodes\' for a node, \'edges\' for an edge'
    }, {
        'Attribute Name': 'data',
        'Type': 'Object - id, parent (optional for some nodes)',
        'Description': 'information for each element'
    }, {
        'Attribute Name': 'scratch',
        'Type': 'Object',
        'Description': 'scratchpad data, usually temporary ones'
    }, {
        'Attribute Name': 'position',
        'Type': 'Object - x, y',
        'Description': 'position of the node'
    }, {
        'Attribute Name': 'selectable',
        'Type': 'Boolean',
        'Description': 'whether it can be selected (default true)'
    }, {
        'Attribute Name': 'selected',
        'Type': 'Boolean',
        'Description': 'whether it is selected on init (default false)'
    }, {
        'Attribute Name': 'locked',
        'Type': 'Boolean',
        'Description': 'whether its position is immutable (default false)'
    }, {
        'Attribute Name': 'grabbable',
        'Type': 'Boolean',
        'Description': 'whether it can be grabbed and moved by user (default true)'
    }, {
        'Attribute Name': 'class',
        'Type': 'String',
        'Description': 'User-defined class of the node'
    }, {
        'Attribute Name': 'source (for edges)',
        'Type': 'String',
        'Description': 'id of the source node of the edge'
    }, {
        'Attribute Name': 'target (for edges)',
        'Type': 'String',
        'Description': 'id of the target node of the edge'
    }],
    layout_options : [{
        'Layout Name': 'null',
        'Description': '배치 규칙 없음; 모든 node를 (0,0)에 배치',
        'Example': '{ name: \'null\'}'
    }, {
        'Layout Name': 'random',
        'Description': 'Node들을 viewport에 무작위로 배치',
        'Example': '{ name: \'random\'}'
    }, {
        'Layout Name': 'preset',
        'Description': 'Node들의 위치 정보를 일일이 지정하여 배치',
        'Example': '{ name: \'preset\', positions: {\'node1\' : { x: 10, y: 20}, \'node2\' : {x: 20, y:10}}}'
    }, {
        'Layout Name': 'grid',
        'Description': 'Node들을 격자에 맞추어 배치',
        'Example': '{ name: \'grid\', avoidOverlap: true, avoidOverlapPadding: 10, rows: 4, cols: 5}'
    }, {
        'Layout Name': 'circle',
        'Description': 'Node들을 원 위에 배치',
        'Example': '{ name: \'circle\', avoidOverlap: true, radius: 100, startAngle: Math.PI, clockwise: true, sort: function() {}}'
    }, {
        'Layout Name': 'concentric',
        'Description': 'Node들을 두 개 이상의 동심원 위에 배치',
        'Example': '{ name: \'concentric\', equidistant: false, minNodeSpacing: 10, concentric: function(node) { return node.degree(); }'
    }, {
        'Layout Name': 'breadthfirst',
        'Description': 'Node들의 hierearchy를 분석하여 tree 형태로 배치',
        'Example': '{ name: \'breadthfirst\', directed: true, circle: false, roots: undefined}'
    }, {
        'Layout Name': 'cose or cose-bilkent',
        'Description': 'Compound String Embedder: Node들 사이의 인력과 척력을 시뮬레이션하여 배치',
        'Example': '{ name: \'cose\', refresh: 20, componenetSpacing: 100, nodeRepulsion: function(node) { return 400000; }, numIter: 1000, initialTemp: 200, coolingFactor: 0.95 }'
    }],
    properties_graph: [
        { 'Property': 'elements', 'Description': 'node들과 edge들의 정보 및 연결 관계에 대한 정보', 'Example': '' },
        { 'Property': 'layout', 'Description': 'node들과 edge들의 배치를 명시', 'Example': '' },
        { 'Property': 'style', 'Description': 'node들과 edge들의 style에 관한 설정', 'Example': '' }
    ]
});



/*
 * framework
 */
Top.Data.create('frameworkData', {
    framework_app_create_config : [
        { "Property": "name", "Type": "String", "Description": "Application 이름으로 브라우저 타이틀에 표시" },
        { "Property": "indexPageId", "Type": "String", "Description": "Application이 실행될 때 로딩할 첫 페이지의 id (*필수 입력)" },
        { "Property": "version", "Type": "String", "Description": "버전명" },
        { "Property": "developer", "Type": "String", "Description": "개발자명" },
        { "Property": "js", "Type": "Array", "Description": "사용자 JS 파일 경로 리스트" },
        { "Property": "css", "Type": "Array", "Description": "사용자 CSS 파일 경로 리스트" }
    ],
    framework_i18n_load : [
        { "Setting": "name", "Type": "String", "Description": "로드할 JSON 파일명 (필수 입력)" },
        { "Setting": "path", "Type": "String", "Description": "로드할 JSON이 저장된 경로 (default: '')" },
        { "Setting": "language", "Type": "String", "Description": "로드할 언어 (필수 입력)" },
        { "Setting": "callback", "Type": "Function", "Description": "로드가 완료된 후 호출할 사용자 정의 callback 함수 (default: null)" },
        { "Setting": "checkDefaultLanguage", "Type": "Boolean", "Description": "true일 경우 [path]/[name]_[shortLanguage].json 및 [path]/[name].json 탐색 (default: false)" }
    ],
    framework_customwidget_create : [
        { "Property": "template", "Type": "String", "Description": "생성할 위젯의 template 또는 template 파일 경로 (필수 입력)" },
        { "Property": "init", "Type": "Function", "Description": "생성 완료 후 호출 될 사용자 init 함수" }
    ]
});
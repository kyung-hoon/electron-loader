/*
 * accordionlayout, tablayout
 */
var test_tabs2 = [
    { id: "tabs2-1", text: "General" },
    { id: "tabs2-2", text: "Roles" },
    { id: "tabs2-3", text: "System Privileges" },
    { id: "tabs2-4", text: "Object Privileges" }
];
var test_tabs1 = [
    { id: "tabs1-1", text: "DB1", icon: "icon-circle", iconColor: "#e31b23" },
    { id: "tabs1-2", text: "DB2", icon: "icon-expert", iconColor: "#e27725" },
    { id: "tabs1-3", text: "DB3", icon: "icon-info", iconColor: "#edba00" },
    { id: "tabs1-4", text: "DB4", icon: "icon-info", iconColor: "#73b944" },
    { id: "tabs1-5", text: "DB5", icon: "icon-circle", iconColor: "#c3c3c3" },
    { id: "tabs1-6", text: "DB6", icon: "icon-expert", iconColor: "#4085ee" },
    { id: "tabs1-7", text: "DB7", icon: "icon-info", iconColor: "#e31b23" },
    { id: "tabs1-8", text: "DB8", icon: "icon-info", iconColor: "#e27725" },
    { id: "tabs1-9", text: "DB9", icon: "icon-circle", iconColor: "#edba00" },
    { id: "tabs1-10", text: "DB10", icon: "icon-expert", iconColor: "#73b944" },
    { id: "tabs1-11", text: "DB11", icon: "icon-info", iconColor: "#c3c3c3" },
    { id: "tabs1-12", text: "DB12", icon: "icon-info", iconColor: "#4085ee" },
];
var test_tabs3 = [
    { id: "tabs3-1", text: "Basic Info" },
    { id: "tabs3-2", text: "TaskRelation" },
    { id: "tabs3-3", text: "Attachment" },
    { id: "tabs3-4", text: "History" }
];
var test_tabs4 = [
    { id: "tabs4-1", text: "All Metric" },
    { id: "tabs4-2", text: "CPU" },
    { id: "tabs4-3", text: "Memory" },
    { id: "tabs4-4", text: "Network" },
    { id: "tabs4-5", text: "Disk" },
];


/*
 * breadcrumb
 */
var test_breadcrumb_node = [
    { "text": "docs", "selected": "/docs" },
    { "text": "widgets", "selected": "/widgets/intro" },
    { "text": "breadcrumb", "selected": "/widgets/breadcrumb" }
];




/*
 * chart
 */
var line_data = [
    { name: "A", data: [30, 20, 10, 20, 30, 40, 3] },
    { name: "B", data: [40, 10, 60, 43, 36, 5, 22] }
];
var line_option = {
    title: {
        text: 'Line type Chart',
        margin: {
            bottom: 0
        },
        align: 'center',
    },
    colors: ['#CC0000', '#3399FF'],
    // xAxis: {
    //     categories: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
    // }
};
var column_option = {
    title: {
        text: 'Column type Chart',
        margin: {
            bottom: 0
        },
        align: 'center',
    },
    colors: ['#CC0000', '#3399FF'],
    xAxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
    }
};
var scatter_option = {
    xAxis: {
        tick: {
            fit: false
        }
    }
};
var circular_data = [
        { name: "A", data: [80] }
];
var bar_data = [
        { name: "B", data: [30] }
];
var column_data = [
        { name: "recovery_space", data: [85] }
];
var area_data = [{
    name: "sessions1",
    data: [
        [0, 30],
        [1, 28],
        [2, 20],
        [3, 35],
        [4, 30],
        [5, 35],
        [6, 30],
        [7, 20],
        [8, 33],
        [9, 22],
        [10, 30],
        [11, 18]
    ]//{name:"sessions2", data: [16,20,7,15,11,18,7,9,7,18,5,12]}
}];
var donut_data = [
    { name: "sessions1", data: [30] },
    { name: "sessions2", data: [40] },
    { name: "sessions3", data: [50] },
    { name: "sessions4", data: [60] }

];
var scatter_data = [{name:'Female',data:[[161.2,51.6],[167.5,59.0],[159.5,49.2],[157.0,63.0],[155.8,53.6],[170.0,59.0],[159.1,47.6],[166.0,69.8],
                    [176.2,66.8],[160.2,75.2],[172.5,55.2],[170.9,54.2],[172.9,62.5],[153.4,42.0],[160.0,50.0],[147.2,49.8],[168.2,49.2],[175.0,73.2],
                    [157.0,47.8],[167.6,68.8],[159.5,50.6],[175.0,82.5],[166.8,57.2],[176.5,87.8],[170.2,72.8],[174.0,54.5],[173.0,59.8],[179.9,67.3],
                    [170.5,67.8],[160.0,47.0],[154.4,46.2],[162.0,55.0],[176.5,83.0],[160.0,54.4],[152.0,45.8],[162.1,53.6],[170.0,73.2],[160.2,52.1],
                    [161.3,67.9],[166.4,56.6],[168.9,62.3],[163.8,58.5],[167.6,54.5],[160.0,50.2],[161.3,60.3],[167.6,58.3],[165.1,56.2],[160.0,50.2],
                    [170.0,72.9],[157.5,59.8],[167.6,61.0],[160.7,69.1],[163.2,55.9],[152.4,46.5],[157.5,54.3],[168.3,54.8],[180.3,60.7],[165.5,60.0],
                    [165.0,62.0],[164.5,60.3],[156.0,52.7],[160.0,74.3],[163.0,62.0],[165.7,73.1],[161.0,80.0],[162.0,54.7],[166.0,53.2],[174.0,75.7],
                    [172.7,61.1],[167.6,55.7],[151.1,48.7],[164.5,52.3],[163.5,50.0],[152.0,59.3],[169.0,62.5],[164.0,55.7],[161.2,54.8],[155.0,45.9],
                    [170.0,70.6],[176.2,67.2],[170.0,69.4],[162.5,58.2],[170.3,64.8],[164.1,71.6],[169.5,52.8],[163.2,59.8],[154.5,49.0],[159.8,50.0],
                    [173.2,69.2],[170.0,55.9],[161.4,63.4],[169.0,58.2],[166.2,58.6],[159.4,45.7],[162.5,52.2],[159.0,48.6],[162.8,57.8],[159.0,55.6],
                    [179.8,66.8],[162.9,59.4],[161.0,53.6],[151.1,73.2],[168.2,53.4],[168.9,69.0],[173.2,58.4],[171.8,56.2],[178.0,70.6],[164.3,59.8],
                    [163.0,72.0],[168.5,65.2],[166.8,56.6],[172.7,105.2],[163.5,51.8],[169.4,63.4],[167.8,59.0],[159.5,47.6],[167.6,63.0],[161.2,55.2],
                    [160.0,45.0],[163.2,54.0],[162.2,50.2],[161.3,60.2],[149.5,44.8],[157.5,58.8],[163.2,56.4],[172.7,62.0],[155.0,49.2],[156.5,67.2],
                    [164.0,53.8],[160.9,54.4],[162.8,58.0],[167.0,59.8],[160.0,54.8],[160.0,43.2],[168.9,60.5],[158.2,46.4],[156.0,64.4],[160.0,48.8],
                    [167.1,62.2],[158.0,55.5],[167.6,57.8],[156.0,54.6],[162.1,59.2],[173.4,52.7],[159.8,53.2],[170.5,64.5],[159.2,51.8],[157.5,56.0],
                    [161.3,63.6],[162.6,63.2],[160.0,59.5],[168.9,56.8],[165.1,64.1],[162.6,50.0],[165.1,72.3],[166.4,55.0],[160.0,55.9],[152.4,60.4],
                    [170.2,69.1],[162.6,84.5],[170.2,55.9],[158.8,55.5],[172.7,69.5],[167.6,76.4],[162.6,61.4],[167.6,65.9],[156.2,58.6],[175.2,66.8],
                    [172.1,56.6],[162.6,58.6],[160.0,55.9],[165.1,59.1],[182.9,81.8],[166.4,70.7],[165.1,56.8],[177.8,60.0],[165.1,58.2],[175.3,72.7],
                    [154.9,54.1]]},
                    {name:'Male',data:[[174.0,65.6],[175.3,71.8],[193.5,80.7],[186.5,72.6],[187.2,78.8],[181.5,74.8],[184.0,86.4],[184.5,78.4],
                    [175.0,62.0],[184.0,81.6],[180.0,76.6],[177.8,83.6],[192.0,90.0],[176.0,74.6],[174.0,71.0],[184.0,79.6],[192.7,93.8],[171.5,70.0],
                    [173.0,72.4],[176.0,85.9],[176.0,78.8],[180.5,77.8],[172.7,66.2],[176.0,86.4],[173.5,81.8],[178.0,89.6],[180.3,82.8],[180.3,76.4],
                    [164.5,63.2],[173.0,60.9],[183.5,74.8],[175.5,70.0],[188.0,72.4],[189.2,84.1],[172.8,69.1],[170.0,59.5],[182.0,67.2],[170.0,61.3],
                    [177.8,68.6],[184.2,80.1],[186.7,87.8],[171.4,84.7],[172.7,73.4],[175.3,72.1],[180.3,82.6],[182.9,88.7],[188.0,84.1],[177.2,94.1],
                    [172.1,74.9],[167.0,59.1],[169.5,75.6],[174.0,86.2],[172.7,75.3],[182.2,87.1],[164.1,55.2],[163.0,57.0],[171.5,61.4],[184.2,76.8],
                    [174.0,86.8],[174.0,72.2],[177.0,71.6],[186.0,84.8],[167.0,68.2],[171.8,66.1],[182.0,72.0],[167.0,64.6],[177.8,74.8],[164.5,70.0],
                    [192.0,101.6],[175.5,63.2],[171.2,79.1],[181.6,78.9],[167.4,67.7],[181.1,66.0],[177.0,68.2],[174.5,63.9],[177.5,72.0],[170.5,56.8],
                    [182.4,74.5],[197.1,90.9],[180.1,93.0],[175.5,80.9],[180.6,72.7],[184.4,68.0],[175.5,70.9],[180.6,72.5],[177.0,72.5],[177.1,83.4],
                    [181.6,75.5],[176.5,73.0],[175.0,70.2],[174.0,73.4],[165.1,70.5],[177.0,68.9],[192.0,102.3],[176.5,68.4],[169.4,65.9],[182.1,75.7],
                    [179.8,84.5],[175.3,87.7],[184.9,86.4],[177.3,73.2],[167.4,53.9],[178.1,72.0],[168.9,55.5],[157.2,58.4],[180.3,83.2],[170.2,72.7],
                    [177.8,64.1],[172.7,72.3],[165.1,65.0],[186.7,86.4],[165.1,65.0],[174.0,88.6],[175.3,84.1],[185.4,66.8],[177.8,75.5],[180.3,93.2],
                    [180.3,82.7],[177.8,58.0],[177.8,79.5],[177.8,78.6],[177.8,71.8],[177.8,116.4],[163.8,72.2],[188.0,83.6],[198.1,85.5],[175.3,90.9],
                    [166.4,85.9],[190.5,89.1],[166.4,75.0],[177.8,77.7],[179.7,86.4],[172.7,90.9],[190.5,73.6],[185.4,76.4],[168.9,69.1],[167.6,84.5],
                    [175.3,64.5],[170.2,69.1],[190.5,108.6],[177.8,86.4],[190.5,80.9],[177.8,87.7],[184.2,94.5],[176.5,80.2],[177.8,72.0]]}];


/*
 * chip
 */
var chip_items = [{
    "text": "yang",
    "value": "2016016",
    "icon": "icon-0"
}, {
    "text": "yang",
    "value": "2016016",
    "icon": "icon-loading"
}];



/*
 * contextmenu
 */
var test_contextmenu_item = [{
    text: "Mornitoring",
    icon: "icon-monitoring",
    id: "menu-1",
    divider: true,
    children: [{
        text: "Overview",
        id: "menu-1-1",
        divider: true,
        children: [{
            text: "Cluster1",
            id: "menu-1-1-1"
        }, {
            text: "Cluster2",
            id: "menu-1-1-2"
        }]
    }, {
        text: "Real Time Analysis",
        id: "menu-1-2"
    }, {
        "text": "menu1-3",
        id: "menu-1-3"
    }]
}, {
    text: "Administrator",
    id: "menu-2",
    icon: "icon-expert",
    children: [{
        text: "User & Security",
        id: "menu-2-1",
        children: [{
            id: "menu-2-1-1",
            text: "text1",
            depth: "3"
        }]
    }, {
        text: "Schema Object",
        id: "menu-2-2",
        children: [{
            text: "text2",
            id: "menu-2-2-1",
            depth: "3"
        }]
    }, {
        id: "menu-2-3",
        "text": "Storage",
        "depth": "2",
    }, ]
}];


/*
 * dialog
 */
function openDialog(e, widget) {
    if (widget.id === "popup_01") {
        Top.Dom.selectById("dialog_test1").open();
    } else {
        Top.Dom.selectById("dialog_test2").open();
    }
}

/*
 * notification
 */
function openNotification() {
    Top.Dom.selectById("notification_test1").open();
    Top.Dom.selectById("notification_test2").open();
    Top.Dom.selectById("notification_test3").open();
    Top.Dom.selectById("notification_test4").open();
}

/*
 * dashboard
 */
var testCardList = [{
    id: "card01",
    name: "card 01",
    html: "html/sample/cardSample.html",
    title: "Card #1"
}, {
    id: "card02",
    name: "card 02",
    html: "<top-linearlayout layout-width='100%' layout-height='100%' orientation='vertical'><top-textview text='Card #2' text-size='15px'></top-textview><top-textview text='Card Layout Text Button Widget'></top-textview><top-button text='Card Layout Test Button Click Widget'></top-button></top-linearlayout>"
}, {
    id: "card03",
    name: "card 03",
    html: "html/sample/chartSample.html",
    title: "Card #3"
}, {
    id: "card04",
    name: "card 04",
    html: "<top-imageview src='res/top.png' layout-width='100%' layout-height='100%' margin='5px'></top-imageview>"
}, {
    id: "card05",
    name: "card 05",
    html: "<top-linearlayout layout-width='100%' layout-height='100%''><top-chart type='column' series='line_data' option='line_option'></top-chart></top-linearlayout>"
}];


/*
 * selectbox, tableview
 */
	var test_nodes = [{text:"Seoul",value:"su"},{text:"Incheon",value:"ic"},{text:"Bundang",value:"bd"},{text:"Daegu",value:"dg"},{text:"Busan",value:"bs"}];
var test_items = [
    { 'name': 'Kim', 'age': '20', 'location': 'Seoul' },
    { 'name': 'Lee', 'age': '25', 'location': 'Busan' },
    { 'name': 'Park', 'age': '30', 'location': 'Incheon' },
    { 'name': 'Choi', 'age': '35', 'location': 'Bundang' },
    { 'name': 'Jung', 'age': '40', 'location': 'Daegu' },
];
var test_header_option={
  "0":{
    "check":{"layout-width":"100px",text:"체크컬럼",visible:true},
    "index":{"layout-width":"100px",text:"인덱스컬럼",reverse:true,visible:true},
    "0":{text:"이름", "layout-width":"100px"},
    "1":{text:"나이", "layout-width":"150px"},
    "2":{text:"지역", "layout-width":"200px"},
  }
}
var test_column_option = {
    "0": {
      text:"{name}",
        width: "20%",
        align: "left"
    },
    "1": {
        type: "textfield",
        property: {
          "layout-width": "50%",
          "text":'{age}',
        },
        width: "50%",
    },
    "2": {
        type: "selectbox",
        property: {
          "layout-width": "100%",
          "selected-text":'{location}',
            "nodes": test_nodes,
        },
    }
};

/*
 * throbber / loader
 */
function startLoader(num) {
    var size = "";
    if(num == 1)
        size = "small";
    else if(num == 2)
        size = "large";
    else
        size = undefined;

    Top.Loader.start(size);
    setTimeout("Top.Loader.stop();", 2000);
};


/*
 * treeview
 */
 var test_treenodes = [{
    id: "Tmax_Group",
    text: "Tmax group",
    icon: "icon-folder",
    children: [{
        id: "TmaxSoft",
        text: "TmaxSoft",
        icon: "icon-search",
        children: [{
            id: "TP",
            text: "TP"
        }, {
            id: "EP",
            text: "EP"
        }, {
            id: "PM",
            text: "PM"
        }]
    }, {
        id: "TmaxData",
        text: "TmaxData",
        image: "./res/graph.png",
        children: [{
            id: "DB1",
            text: "DB1"
        }, {
            id: "DB2",
            text: "DB2"
        }, {
            id: "DB3",
            text: "DB3"
        }]
    }, {
        id: "TmaxGlobal",
        text: "TmaxGlobal",
        children: [{
            id: "USA",
            text: "USA"
        }, {
            id: "Japan",
            text: "Japan"
        }, {
            id: "CHN",
            text: "CHN"
        }]
    }]

}];
var tree_option = {
    node: {
        checkable: true,
        editable: true,
        deletable: true,
        draggable: true
    },
    view: {
        expand: true
    }

};


/*
 * menu
 */
var test_nodes1 = [
    { "text": "Look,if you have" },
    { "text": "One shot" },
    { "text": "One opportunity" },
    { "text": "To seize" },
    { "text": "everything you" },
    { "text": "Wanted-One moment" },
    { "text": "Would you capture it" },
    { "text": "Or just let it slip?" }
];
var test_nodes2 = [{
    text: "A class",
    icon: "icon-expert",
    children: [
        { text: "Mr. Top" },
        { text: "Ms. Tos" },
        { text: "Docter. Jeus", selected: "/widgets/menu" }
    ]
}, {
    text: "Web Site",
    icon: "icon-file",
    children: [
        { text: "Naver", selected: "http://www.naver.com" },
        { text: "Google", selected: "http://www.google.com" },
    ]
}];
var changeMenuType = function(event, widget) {
    var thisMenu;

    Top.Dom.selectById("test_menu1").setVisible("none");
    Top.Dom.selectById("test_menu2").setVisible("none");
    Top.Dom.selectById("test_menu3").setVisible("none");
    Top.Dom.selectById("test_menu4").setVisible("none");
    Top.Dom.selectById("test_menu5").setVisible("none");
    Top.Dom.selectById("test_menu6").setVisible("none");
    Top.Dom.selectById("test_menu7").setVisible("none");
    Top.Dom.selectById("test_menu8").setVisible("none");


    if (widget.id === "floatingButton") thisMenu = Top.Dom.selectById("test_menu1");
    else if (widget.id === "sideButton_1") thisMenu = Top.Dom.selectById("test_menu2");
    else if (widget.id === "sideButton_2") thisMenu = Top.Dom.selectById("test_menu3");
    else if (widget.id === "dropdownButton") thisMenu = Top.Dom.selectById("test_menu4");
    else if (widget.id === "drawerButton") thisMenu = Top.Dom.selectById("test_menu5");
    else if (widget.id === "headerButton_1") thisMenu = Top.Dom.selectById("test_menu6");
    else if (widget.id === "headerButton_2") thisMenu = Top.Dom.selectById("test_menu7");
    else if (widget.id === "cascadingButton") thisMenu = Top.Dom.selectById("test_menu8");

    thisMenu.setVisible("visible");
};

/*  stepper */
var test_labels = ["First", "Second", "Third"];
var stepper_next = function() {
    Top.Dom.selectById('stepper').next();
};
var stepper_prev = function() {
    Top.Dom.selectById('stepper').prev();
}

/*
 * timer
 */
function startTimer() {
    Top.Dom.selectById("timer1").start();
}


/*
 * graph
 */
var layout_table_option = {
    'Layout Name': {
        width: '10%',
        align: 'center'
    },
    'Description': {
        width: '35%',
        align: 'center'
    },
    'Example': {
        width: '45%'
    }
}
var layout_common_table_option = {
    'Option Name': {
        width: '20%',
        align: 'center'
    },
    'Description': {
        width: '60%',
        align: 'center'
    },
    'Type': {
        width: '20%',
        align: 'center'
    },
    'Default': {
        width: '15%',
        align: 'center'
    }
}
var style_style_table_option = {
    'Classification': {
        width: '10%',
        align: 'center'
    },
    'Property Name': {
        width: '40%',
        align: 'center'
    },
    'Description': {
        width: '50%'
    }
};
var simple_graph_options = Top.Data.create({
    styles: [{
        selector: 'node',
        style: {
            'width': '40px',
            'height': '40px',
            //'shape':'hexagon',
            'background-color': 'gray',
            'border-color': 'black',
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'font-size': '12px',
            'font-color': '#3c454a',
            'font-weight': 600
        }
    }, {
        selector: 'edge',
        style: {
            'width': 1,
            'line-color': '#717578',
            'curve-style': 'unbundled-bezier',
            'control-point-distances': 120,
            'control-point-weights': 0.1,
            'opacity': 0.5
        }
    }, {
        selector: ':selected',
        style: {
            'background-color': 'green',
            'line-color': 'black',
            'target-arrow-color': 'black',
            'source-arrow-color': 'black',
            'opacity': 1,
        }
    }, {
        selector: '.faded',
        style: {
            'opacity': 0.25,
            'text-opacity': 0
        }
    }],
    elements: [{
        group: 'nodes',
        data: {
            id: 'n0',
            label: 'node #1'
        }
    }, {
        group: 'nodes',
        data: {
            id: 'n1',
            label: 'node #2'
        }
    }, {
        group: 'edges',
        data: {
            id: 'e0',
            source: 'n0',
            target: 'n1'
        }
    }],
    layout: {
        name: 'cose'
    }
});
var style_table_option = {
    'Option Name': {
        width: '20%',
        align: 'center'
    },
    'Description': {
        width: '45%',
        align: 'center'
    },
    'Example': {
        width: '35%'
    }
};

var style_selector_table_option = {
    'Classification': {
        width: '20%',
        align: 'center'
    },
    'Selector Notation': {
        width: '12%'
    },
    'Description': {
        width: '68%'
    }
};
/*
 * buttongroup
 */
var buttons = [
    { id: "radio1", value: "Radio1", status: "normal" },
    { id: "radio2", value: "Radio2", status: "selected" },
    { id: "radio3", value: "Radio3", status: "disabled" },
    { id: "radio4", value: "Radio4", status: "normal" }
];

/*
 * Style Tab
 */
var class_linearlayout = [{
    "Class": "top-linearlayout-root"
}];
var class_layout = [{
    "Class": "top-layout-root"
}];
var class_tablayout = [
    { "Class": "top-tablayout-root" },
    { "Class": "top-tablayout-container" },
    { "Class": "top-tablayout-tab" },
    { "Class": "top-tablayout-title" },
    { "Class": "top-tablayout-close" },
    { "Class": "tab_0" },
    { "Class": "tab_1" },
    { "Class": "last" },
    { "Class": "tab_icon" },
    { "Class": "tab_image" },
    { "Class": "closable" },
    { "Class": "tab_paginate-container" },
    { "Class": "prev" },
    { "Class": "next" },
    { "Class": "list" },
    { "Class": "tab_paginate-list" },
    { "Class": "list_item" },
    { "Class": "close_btn" },
]
var sample_tab = [
    { id: "tab1", text: "DB1", icon: "icon-circle", iconColor: "#ff0000", closable: true },
    { id: "tab2", text: "DB2", image: "res/logo.png" },
    { id: "tab3", text: "DB3", icon: "icon-info", iconColor: "#73b944" }
];
var class_tableview = [
    { "Class": "top-tableview-root" },
    { "Class": "top-tableview" },
    { "Class": "top-tableview-length" },
    { "Class": "top-tableview-pager" },
    { "Class": "top-tableview-result" },
    { "Class": "number" },
    { "Class": "top-tableview-scroll" },
    { "Class": "top-tableview-scrollHead" },
    { "Class": "top-tableview-scrollHeadInner" },
    { "Class": "head" },
    { "Class": "head-row" },
    { "Class": "head-cell" },
    { "Class": "top-tableview-scrollBody" },
    { "Class": "body" },
    { "Class": "body-row" },
    { "Class": "body-cell" },
    { "Class": "odd" },
    { "Class": "even" },
];
var sample_items = [
    { 'name': 'Kim', 'age': '20', 'location': 'Seoul' },
    { 'name': 'Lee', 'age': '25', 'location': 'Busan' },
    { 'name': 'Park', 'age': '30', 'location': 'Incheon' },
    { 'name': 'Choi', 'age': '35', 'location': 'Bundang' },
    { 'name': 'Jung', 'age': '40', 'location': 'Daegu' },
    { 'name': 'Baek', 'age': '30', 'location': 'Incheon' },
    { 'name': 'Choi', 'age': '22', 'location': 'Seoul' },
    { 'name': 'Min', 'age': '40', 'location': 'Daegu' },

];
var class_listview = [
    { "Class": "top-listview-root" },
    { "Class": "top-listview-container" },
    { "Class": "top-listview-list" },
    { "Class": "row_0" },
    { "Class": "row_1" },
    { "Class": "first-child" },
    { "Class": "last-child" },
];
var class_selectbox = [
    { "Class": "top-selectbox-root" },
    { "Class": "top-selectbox-container" },
    { "Class": "top-selectbox-options" },
    { "Class": "top-selectbox-option" },
    { "Class": "top-selectbox-icon" },
    { "Class": "title" },
    { "Class": "option_0" },
    { "Class": "option_1" },
    { "Class": "option_2" },
];
var class_treeview = [
    { "Class": "top-treeview-root" },
    { "Class": "top-treeview-container" },
    { "Class": "top-treeview-list" },
    { "Class": "top-treeview-button" },
    { "Class": "top-treeview-item" },
];
var class_panel = [
    { "Class": "top-panel-root" },
    { "Class": "top-panel-title-layout" },
    { "Class": "top-panel-title" },
    { "Class": "top-panel-content" },
];
var class_button = [
    { "Class": "top-button-root" },
    { "Class": "top-button-icon" },
];
var class_checkbox = [
    { "Class": "top-checkbox-text" },
];
var class_radiobutton = [
    { "Class": "top-radiobutton-text" },
];
var class_toggle = [
    { "Class": "top-toggle-root" },
    { "Class": "top-toggle-background" },
    { "Class": "top-toggle-handle" },
];
var class_switch = [
    { "Class": "top-switch-root" },
    { "Class": "top-switch-container" },
    { "Class": "top-switch-handle-on" },
    { "Class": "top-switch-handle-off" },
    { "Class": "top-switch-background" },
];

var class_imagebutton = [
    { "Class": "top-imagebutton-root" },
];

var class_textfield = [
    { "Class": "top-textfield-root" },
    { "Class": "top-textfield-title" },
    { "Class": "top-textfield-text" },
    { "Class": "top-textfield-alert" },
];
var class_textarea = [
    { "Class": "top-textarea-root" },
];
var class_textview = [
    { "Class": "top-textview-root" },
    { "Class": "top-textview-url" },
];
var checkClassName = function(index, data, checked) {
    var checkedElement = Top.Dom.selectById('sample_' + this.id).getElement('.' + data['Class']);
    if (checked) {
        for (var i = 0; i < checkedElement.length; i++) checkedElement[i].style.border = "5px solid red";
    } else {
        for (var i = 0; i < checkedElement.length; i++) checkedElement[i].style.border = "";
    }
}

/*
 * framework
 */
 Top.App.onBeforeLoad(function() {
    Top.CustomWidget.create('top-inputbutton', {
        template: '<top-textfield text={{textfield-text}}></top-textfield><top-button text={{button-text}} event-mouse-click={{event-mouse-click}} margin="5px"></top-button>',
        init: function() {

        },
        getText: function() {
            return this.getChildren('top-textfield')[0].getText();
        }
    });

    Top.CustomWidget.create('draggable-div', {
        template: '<div style="background-color:{{background-color}}; width:{{layout-width}}; height:{{layout-height}}; padding:0.5em; font-size:initial;"><p>Drag me around</p></div>',
        init: function() {
            $(this.template.querySelector("div")).draggable();
        }
    });

    Top.CustomWidget.create('custom-menu', {
        template: 'framework/template.html',
        init: function() {
            $(this.template.querySelector("#menu")).menu();
        }
    });
});

function onBtnClick_inputButton1() {
    var text = Top.Dom.selectById("inputButton1").getText();
    alert(text);
}

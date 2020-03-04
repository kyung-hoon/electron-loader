var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
    var TopCreator = function TopCreator() {
        function TopInstance() {}

        TopInstance.version = '';

        TopInstance.getVersion = function () {
            return this.version;
        };
        TopInstance.setVersion = function (version) {
            this.version = version;
        };

        TopInstance.isUI = function () {
            return true;
        };

        TopInstance.isStandalone = false;
        TopInstance.libsPath = "";
        TopInstance.configs = {};
        TopInstance.events = {
            onCreate: [],
            onBeforeLoad: [],
            onLoad: [],
            onRouteActivate: function onRouteActivate() {
                return true;
            },
            onRouteDeactivate: function onRouteDeactivate() {
                return true;
            },
            onWidgetAttach: {},
            onWidgetDetach: {},
            onLibsLoad: {}
        };
        TopInstance.rootDom = null;
        TopInstance.routes = {};
        TopInstance.modules = {};
        TopInstance.pages = {};
        TopInstance.pageSrcMap = {};
        TopInstance.curPage = null;
        TopInstance.curRoute = {};
        TopInstance.AppController = {};
        TopInstance.addAppControllerFunction = function (data) {
            TopInstance.Util.__deepMerge(TopInstance.AppController, data);
        };

        return TopInstance;
    };

    TopUI = {};
    TopUI = TopCreator();
    getTopUI = function getTopUI() {
        return TopUI;
    };

    if ((typeof Top === 'undefined' ? 'undefined' : _typeof(Top)) === 'object' || typeof Top === 'function') {
        TopV5 = {};
        TopV5 = TopCreator();
        getTop = function getTop() {
            return TopV5;
        };
    } else {
        Top = {};
        Top = TopCreator();
        getTop = function getTop() {
            return Top;
        };
    }

    getTop().isUI = function () {
        return false;
    };

    var AppCreator = function AppCreator(topInstance) {
        App.prototype = Object.create(topInstance.prototype);
        App.prototype.constructor = App;
        App.checkLocationHash = false;
        App.calledPopstate = false;
        App.dialogList = {};
        App.dialogArray = [];
        App.dialogByBrowserBack = false;

        function App() {}

        App.create = function (options) {
            options = options || {};
            options.config = options.config || undefined;
            this.__initLibsPath();
            this.__initVersion();
            this.__renderApp(options);
        };

        App.__initLibsPath = function () {
            var file = document.getElementById('top.js');
            if (!file) return;
            var path = file.src;
            topInstance.isStandalone = path.startsWith('file://');
            var fileName = topInstance.Util.getFileName(path);
            topInstance.libsPath = path.split(fileName)[0];
        };

        App.__initVersion = function () {
            topInstance.Ajax.execute(topInstance.libsPath + "version", {
                success: function success(data) {
                    topInstance.setVersion(data);
                }
            });
        };

        App.__renderApp = function (options) {
            var _this2 = this;

            var appDiv = document.createElement('div');
            appDiv.classList.add('top-app');
            appDiv.style.width = '100%';
            appDiv.style.height = '100%';
            document.body.innerHTML = '';
            document.body.appendChild(appDiv);
            topInstance.rootDom = appDiv;
            ReactDOM.render(React.createElement(TopApp, { rootLayoutId: null }), topInstance.rootDom);
            this.__initConfigs(options.config, function () {
                _this2.__initRoute(options.route, function () {
                    _this2.__initEvent(options.event);
                    _this2.__initModule(options.module);

                    _this2.__load();
                });
            });
        };

        App.__initConfigs = function (configs, next) {
            if (typeof configs === 'string') {
                var _this = this;
                topInstance.Ajax.execute(configs, {
                    success: function success(data) {
                        topInstance.configs = JSON.parse(data);
                        _this.__postInitConfigs(next);
                    }
                });
            } else if ((typeof configs === 'undefined' ? 'undefined' : _typeof(configs)) === 'object') {
                var keys = Object.keys(configs);
                for (var i = 0, len = keys.length; i < len; i++) {
                    var key = keys[i];
                    var value = configs[key];
                    topInstance.configs[key] = value;
                }
                this.__postInitConfigs(next);
            } else {
                console.error("Config is not defined.");
            }
        };

        App.__postInitConfigs = function (next) {
            var _this3 = this;

            this.__loadStyle(function () {
                _this3.__loadUserStyle(function () {
                    _this3.__loadUserLogic(function () {
                        next();
                    });
                });
            });
        };

        App.getConfig = function (key) {
            return topInstance.configs[key];
        };

        App.getConfigs = function () {
            return topInstance.configs;
        };

        App.setTitle = function (title) {
            document.title = title;
        };

        App.renderRootLayout = function (path, callback) {
            topInstance.Render.AppDom.__initSrc(path, callback);
        };

        App.onBeforeLoad = function (func) {
            topInstance.events.onBeforeLoad.push(func);
        };

        App.onLoad = function (func) {
            if (this.isLoaded()) {
                func();
            } else {
                topInstance.events.onLoad.push(func);
            }
        };

        App.isLoaded = function () {
            return this.loaded;
        };

        App.__load = function () {
            if (location.hash === "") {
                this.__callEvent(topInstance.events["onCreate"]);
            }
            this.loaded = true;
            this.__callEvent(topInstance.events["onBeforeLoad"]);
            this.__callEvent(topInstance.events["onLoad"]);
            if (this.__compatibleWithTOP() && location.hash) {
                this.__routeReplace(location.hash.replace("#!", ""));
            }
        };

        App.__loadStyle = function (next) {
            if (topInstance.configs.loadStyleSeparately === true || topInstance.configs.loadStyleSeparately === "true") {
                var link = document.createElement('link');
                link.href = topInstance.libsPath + 'css/top-common.css';
                link.rel = 'stylesheet';
                document.head.appendChild(link);

                link = document.createElement('link');
                if (topInstance.Util.Browser.isIE()) {
                    link.href = topInstance.libsPath + 'css/top-common_ie.css';
                } else {
                    link.href = topInstance.libsPath + 'css/top-common_chrome.css';
                }
                link.rel = 'stylesheet';
                document.head.appendChild(link);

                var dir = topInstance.libsPath + "css/widget";
                var fileextension = ".css";
                var i = 0;
                $.ajax({
                    url: dir,
                    success: function success(data) {
                        $(data).find("a:contains(" + fileextension + ")").each(function () {
                            var filename = topInstance.libsPath + "css/widget/" + this.text;
                            if (this.text.endsWith("_ie.css") && !topInstance.Util.Browser.isIE() || this.text.endsWith("_chrome.css") && topInstance.Util.Browser.isIE()) {
                                return;
                            }
                            link = document.createElement('link');
                            link.href = filename;
                            link.rel = 'stylesheet';
                            i++;
                            if (i === 60) link.onload = next;
                            document.head.appendChild(link);
                        });
                    }
                });
            } else {
                var link = document.createElement('link');
                if (topInstance.Util.Browser.isIE()) {
                    link.href = topInstance.libsPath + 'css/top_ie.css';
                } else {
                    link.href = topInstance.libsPath + 'css/top.css';
                }
                link.rel = 'stylesheet';
                link.onload = next;
                document.head.appendChild(link);
            }
            if (topInstance.configs.deploy === undefined || topInstance.configs.deploy.useDefaultFont !== "false" && topInstance.configs.deploy.useDefaultFont !== false) {
                this.__loadFont();
            }
        };

        App.__loadFont = function () {
            var link = document.createElement('link');
            link.href = topInstance.libsPath + 'css/font.css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        };

        App.__loadUserStyle = function (next) {
            if (_typeof(topInstance.configs.css) === 'object') {
                var styleList = topInstance.configs.css.filter(function (value) {
                    return typeof value === 'string' && !value.includes("_ie.css");
                });
                if (topInstance.Util.Browser.isIE()) {
                    styleList = styleList.concat(topInstance.configs.css.filter(function (value) {
                        return typeof value === 'string' && value.includes("_ie.css");
                    }));
                    if (_typeof(topInstance.configs.cssIE) === 'object' && topInstance.configs.cssIE.length > 0) {
                        styleList = styleList.concat(topInstance.configs.cssIE);
                    }
                }
            }
            if ((typeof styleList === 'undefined' ? 'undefined' : _typeof(styleList)) === 'object') {
                var len = styleList.length;
                if (len === 0) {
                    next();
                } else {
                    var cnt = 0;
                    for (var i = 0; i < len; i++) {
                        this.__loadExternalStyle(styleList[i], function () {
                            cnt++;
                            if (cnt === len) next();
                        });
                    }
                }
            } else if (styleList === undefined) {
                next();
            } else {
                console.error('Config error: css or cssIE must be an array.');
                next();
            }
        };

        App.__loadUserLogic = function (next) {
            if (_typeof(topInstance.configs.js) === 'object') {
                var logicList = topInstance.configs.js;
                var len = logicList.length;
                var cnt = 0;
                var _this = this;
                for (var i = 0, len = logicList.length; i < len; i++) {
                    this.__loadExternalScript(logicList[i], function () {
                        cnt++;
                        if (cnt === len) {
                            topInstance.__isLoadedUserLogic = true;
                            if (typeof next === 'function') next();
                        }
                    });
                }
            } else if (topInstance.configs.js === undefined) {
                topInstance.__isLoadedUserLogic = true;
                if (typeof next === 'function') next();
            } else {
                console.error('Config error: js must be an array.');
                topInstance.__isLoadedUserLogic = true;
                if (typeof next === 'function') next();
            }
        };

        App.__loadViewControllerFile = function (viewControllerPaths, onLoad, param) {
            var cnt = 0;
            for (var i = 0, len = viewControllerPaths.length; i < len; i++) {
                this.__loadExternalScript(viewControllerPaths[i], function () {
                    cnt++;
                    if (cnt === len) {
                        onLoad(param);
                    }
                }, function () {
                    cnt++;
                    if (cnt === len) {
                        onLoad(param);
                    }
                });
            }
        };

        App.__loadExternalScript = function (url, onload, onerror) {
            if (this.__useCommonLogic() && url.startsWith("src/common")) {
                onload();
                return;
            }
            if (this.__externalScriptList && this.__externalScriptList.has(url)) {
                onload();
                return;
            }
            var script = document.createElement('script');
            script.id = url;
            script.src = url;
            script.onload = onload;
            script.onerror = onerror;
            script.async = false;
            script.charset = "utf-8";
            document.head.appendChild(script);
            if (this.__externalScriptList === undefined) {
                this.__externalScriptList = new Map();
            }
            this.__externalScriptList.set(url);
        };

        App.__loadExternalHtml = function (url, onload) {
            var link = document.createElement('link');
            link.rel = 'import';
            link.href = url;
            link.onload = onload;
            document.head.appendChild(link);
        };

        App.__loadExternalStyle = function (url, onload) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = onload;
            document.head.appendChild(link);
        };

        App.__initModule = function (module) {
            if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) !== 'object') return;
            topInstance.modules = module;
        };

        App.__initEvent = function (events) {
            if ((typeof events === 'undefined' ? 'undefined' : _typeof(events)) !== 'object') return;
            var len = Object.keys(events).length;
            for (var i = 0; i < len; i++) {
                var key = Object.keys(events)[i];
                var value = events[key];
                if (topInstance.events[key]) {
                    topInstance.events[key].push(value);
                }
            }
        };

        App.__initDebug = function (settings) {
            if ((typeof settings === 'undefined' ? 'undefined' : _typeof(settings)) !== 'object') return;
            if (_typeof(settings.livereload) === 'object' && topInstance.Util.Browser.isChrome()) {
                this.__initLiveReload(settings.livereload);
            }
        };

        App.__initLiveReload = function (userOptions) {
            var options = {
                "host": "localhost",
                "port": "52790"
            };
            Object.assign(options, userOptions);
            var liveReload = topInstance.LiveReload.create({ "options": options });
            if (liveReload.WebSocket != null) {
                liveReload.connect();
            }
        };

        App.addEvent = function (event) {
            this.__initEvent(event);
        };

        App.__callEvent = function (events, params) {
            if ((typeof events === 'undefined' ? 'undefined' : _typeof(events)) === 'object') {
                for (var i = 0, len = events.length; i < len; i++) {
                    this.__callEventImpl(events[i], params);
                }
            } else if (typeof events === 'function') {
                this.__callEventImpl(events, params);
            } else if (typeof events === 'string') {
                var fn = topInstance.Util.namespace(events);
                if (typeof fn === 'function') fn();
            }
        };

        App.__callEventImpl = function (eventFunc, params) {
            if (typeof eventFunc === 'string') {
                if (location.hash == "") {
                    topInstance.Util.namespace(eventFunc)(params);
                }
            } else {
                eventFunc(params);
            }
        };

        App.__pageLoad = function (page) {
            page.setProperties({
                loaded: true
            });
        };

        App.__activatePage = function (page) {
            topInstance.curPage = page;
            page.setProperties({ activated: true });
        };

        App.__deactivatePage = function (page) {
            page.setProperties({ activated: false });
        };

        App.__activateLayoutById = function (layoutId) {
            topInstance.Render.AppDom.setState({});
        };

        App.__deactivatePageById = function (pageId) {
            this.__deactivatePage(topInstance.Dom.selectById(pageId));
        };

        App.__initRoute = function (routings, next) {
            if (typeof routings === 'string') {
                var _this = this;
                topInstance.Ajax.execute(routings, {
                    success: function success(data) {
                        var dataObj = JSON.parse(data);
                        var routerInfo = topInstance.Util.__deepCopy(dataObj);
                        var result = _this.__initParseRouter(routerInfo);
                        _this.__initObjectDepth(result, 0);
                        topInstance.events["onCreate"] = topInstance.Util.namespace(result.defaultRouterPath);
                        _this.setTitle(result.title);
                        topInstance.routes = _this.__createRoutes(result);
                        topInstance.routes["enableReactivate"] = result.enableReactivate;
                        _this.__postInitRoute();
                        data = null;
                        next();
                    }
                });
            } else if ((typeof routings === 'undefined' ? 'undefined' : _typeof(routings)) === 'object') {
                var routerInfo = topInstance.Util.__deepCopy(routings);
                var result = this.__initParseRouter(routerInfo);
                this.__initObjectDepth(result, 0);
                topInstance.events["onCreate"] = topInstance.Util.namespace(result.defaultRouterPath);
                this.setTitle(result.title);
                topInstance.routes = this.__createRoutes(result);
                topInstance.routes["enableReactivate"] = result.enableReactivate;
                this.__postInitRoute();
                next();
            } else {
                this.__postInitRoute();
                next();
            }
        };

        App.addRoute = function (routings) {
            if (typeof routings === 'string') {
                var _this = this;
                topInstance.Ajax.execute(routings, {
                    success: function success(data) {
                        var dataObj = JSON.parse(data);
                        _this.__initObjectDepth(dataObj, 0);
                        Object.assign(topInstance.routes, _this.__createRoutes(dataObj));
                    }
                });
            } else if ((typeof routings === 'undefined' ? 'undefined' : _typeof(routings)) === 'object') {
                this.__initObjectDepth(routings, 0);
                Object.assign(topInstance.routes, this.__createRoutes(routings));
            }
        };

        App.removeRoute = function (path) {
            delete topInstance.routes[path];
        };

        App.__initParseRouter = function (routerInfo) {
            var _this = this;
            var rObj = {};
            routerInfo.routerItem.map(function (data) {
                if (data.routerType === "package") {
                    data = _this.__searchPathRoute(data);
                }
                rObj[data.path] = {};
                rObj[data.path] = data;
                if (!rObj[data.path].parentInfo && !routerInfo.resourceType) rObj[data.path].parentInfo = routerInfo;
                if (data.routerItem && data.routerItem.length > 0) {
                    rObj[data.path]["routerItem"] = _this.__initParseRouter(data);
                }
            });
            if (routerInfo.nodeType) {
                rObj["defaultRouterPath"] = routerInfo.defaultRouterPath;
                rObj["otherwiseRouterPath"] = routerInfo.otherwiseRouterPath;
                rObj["enableReactivate"] = routerInfo.enableReactivate;
                rObj["title"] = routerInfo.title;
                rObj["icon"] = routerInfo.icon;
            }
            return rObj;
        };

        App.__searchPathRoute = function (route) {
            if (route.path === undefined) {
                if (route.routerItem && route.routerItem.length > 0) {
                    var _this = this;
                    for (var i = 0; i < route.routerItem.length; i++) {
                        route.routerItem[i].parentInfo = route;
                        return _this.__searchPathRoute(route.routerItem[i]);
                    }
                }
            } else {
                return route;
            }
        };
        App.__makePackageRoute = function (route, childrenCallback) {
            if (route.parentInfo) {
                var routeFunction = function routeFunction() {
                    if (route.onActivate) {
                        route.onActivate = topInstance.Util.namespace(route.onActivate);
                        route.onActivate.call();
                    }
                    if (route.parentLayoutId && route.layoutFileName) {
                        getTop().Dom.selectById(route.parentLayoutId).src(route.layoutFileName, function () {
                            if (route.onRender) route.onRender();
                            typeof childrenCallback === 'function' ? childrenCallback() : null;
                            route.__dest;
                        }, route.enableRerender);
                    }
                };
                return topInstance.App.__makePackageRoute(route.parentInfo, routeFunction);
            } else {
                var routeActivateFunction = function routeActivateFunction() {
                    if (route.onActivate) {
                        route.onActivate = topInstance.Util.namespace(route.onActivate);
                        route.onActivate.call();
                    }
                    if (route.layoutFileName) {
                        topInstance.App.renderRootLayout(route.layoutFileName, function () {
                            if (route.onRender) route.onRender();
                            typeof childrenCallback === 'function' ? childrenCallback() : null;
                        });
                    }
                };
                return routeActivateFunction;
            }
        };

        App.__initObjectDepth = function (object, level) {
            object.__depth = level;
            level++;
            for (var key in object) {
                if (!key.startsWith("/")) continue;
                if (object[key].routerItem && _typeof(object[key].routerItem) === 'object') {
                    this.__initObjectDepth(object[key].routerItem, level);
                }
            }
        };

        App.__createRoutes = function (routeInfo) {
            var routes = {};
            var keys = Object.keys(routeInfo);
            for (var i = 0, len = keys.length; i < len; i++) {
                var from = keys[i];

                if (from === "defaultRouterPath" || from === "otherwiseRouterPath" || from === "enableReactivate" || from === "title" || from === "icon" || from === "index" || from === "level") {
                    continue;
                }
                var to = routeInfo[from];
                if (from !== '__depth' && (typeof to === 'undefined' ? 'undefined' : _typeof(to)) !== 'object') {
                    var temp = to;
                    to = {};
                    to.onActivate = temp;
                }
                if (typeof to.onActivate === 'function') {
                    to.__dest = this.__makeDestFunction(to, from, routeInfo.__depth);
                } else if (typeof topInstance.Util.namespace(to.onActivate) === 'function') {
                    to.__dest = this.__makeDestFunction(to, from, routeInfo.__depth);
                } else if (typeof to.onActivate === 'string') {
                        to.__dest = this.__makeDestFunction(to, from, routeInfo.__depth);
                    } else if (to.onActivate === undefined) {
                        to.onActivate = function (params, data, next) {
                            next();
                        };
                        to.__dest = this.__makeDestFunction(to, from, routeInfo.__depth);
                    } else {
                        console.error("Routing error: '" + to.onActivate + "' is not defined.");
                    }
                routes[from] = {};
                routes[from].dest = to.__dest;
                if (_typeof(to.routerItem) === 'object') {
                    routes[from].routerItem = this.__createRoutes(to.routerItem);
                }
            }
            return routes;
        };

        App.__postInitRoute = function () {
            topInstance.routes["/"] = {};
            topInstance.routes["/"].dest = function () {
                window.location = document.location.origin + document.location.pathname;
            };
        };

        App.__routeToBack = function (beforePath) {
            var _this4 = this;

            var route = this.__searchRoute(topInstance.routes, beforePath);
            if (beforePath !== '/' && route !== undefined && typeof route.dest === 'function') {
                if (!topInstance.Dom.selectById(topInstance.curRoute.beforeRootLayout)) {
                    topInstance.curPage.src(topInstance.curRoute.beforeRootLayout + '.html', function () {
                        _this4.routeTo(beforePath);
                    });
                }
            } else if (beforePath === '/') {
                this.routeTo(beforePath);
            } else {
                this.back();
            }
        };

        App.__popstate = function (event) {
            if (event.state && event.state.path) {
                this.__routeReplace(event.state.path);
            } else if (location.hash) {
                this.checkLocationHash = true;
                this.__routeReplace(location.hash.replace("#!", ""));
            } else if (location.hash === "") {
                this.__routeReplace();
            }
            if (this.isPushState && this.onPopStateCallback) {
                this.onPopStateCallback(event);
            }
        };

        App.routeTo = function (path, data, __popstate) {
            if (topInstance.configs.appRouting !== false) {
                var route = this.__searchRoute(topInstance.routes, path);
                if (route !== undefined && typeof route.dest === 'function') {
                    route.dest(path, data, __popstate);
                } else if (Array.isArray(route)) {
                    var i = 0;
                    var makeNext = function makeNext() {
                        i++;
                        if (i < route.length - 1) {
                            return route[i].dest(path, data, __popstate, makeNext);
                        } else if (i === route.length - 1) {
                            return route[i].dest(path, data, __popstate);
                        }
                    };
                    route[0].dest(path, data, __popstate, makeNext);
                } else if (path.indexOf("#") !== -1) {
                    var routePath = "";
                    routePath += topInstance.curRoute.path;
                    routePath += path;
                    if (routePath.substring(0, 2) === "//") {
                        routePath = routePath.substring(1, routePath.length);
                    }
                    if (this.checkLocationHash) {
                        window.history.pushState({ path: routePath }, "", "#!" + routePath);
                    } else {
                        var originRoute = routePath.split('#')[0];
                        window.history.pushState({ path: originRoute }, "", "#!" + originRoute);
                        this.reload();
                    }
                } else {
                    this.App.__notFoundPage(path);
                }
                this.checkLocationHash = false;
            }
        };

        App.__notFoundPage = function (path) {
            var _this = this;
            var pageSource404 = _this.page404 || 'page/contents_404.html';
            var imageSource404 = _this.image404 || "page/res/error_img_404.png";
            console.error("Routing error: " + path + " is not defined.");
            topInstance.curRoute.before = topInstance.curRoute.path;
            topInstance.curRoute.path = path;
            topInstance.curRoute.act = null;
            topInstance.curRoute.deact = null;
            topInstance.curRoute.data = null;
            topInstance.curRoute.params = null;
            var rootLayout = topInstance.curPage.template.children;
            if (rootLayout.length > 0) {
                if (rootLayout[0].id.indexOf("Top_404_error_layout") === -1) {
                    topInstance.curRoute.beforeRootLayout = rootLayout[0].id;
                } else {
                    topInstance.curRoute.beforeRootLayout = topInstance.curRoute.beforeRootLayout;
                }
            } else {
                topInstance.curRoute.beforeRootLayout = topInstance.curPage.template.src.split("?")[0].split(".")[0];
            }
            if (!this.checkLocationHash) window.history.pushState({ path: path }, "", "#!" + path);
            if (topInstance.curPage.getVisible() !== "visible" || topInstance.curPage.getVisible() !== true || topInstance.curPage.getVisible() !== "true") {
                topInstance.curPage.setVisible("visible");
            }
            topInstance.curPage.src(topInstance.libsPath + pageSource404, function () {
                var layout = topInstance.curPage.selectById('Top_404_error_layout');
                if (topInstance.curPage.selectById('imageError404')) topInstance.curPage.selectById('imageError404').setSrc(topInstance.libsPath + imageSource404);
                if (!_this.fn404_back) {
                    _this.fn404_back = function (layout) {
                        layout.selectById('backButton_404').setProperties({ 'on-click': 'getTop().App.__routeToBack(getTop().curRoute.before)' });
                    };
                }
                if (!_this.fn404) {
                    _this.fn404 = function (layout) {
                        layout.selectById('mainButton_404').setProperties({ 'on-click': "getTop().App.routeTo('/')" });
                    };
                }
                _this.fn404_back(layout);
                _this.fn404(layout);
            });
        };

        App.onLoad404 = function (fn) {
            this.fn404 = fn;
        };

        App.reset404 = function (pageSrc, imageSrc) {
            this.page404 = pageSrc;
            this.image404 = imageSrc;
        };

        App.load404Page = function () {
            this.__notFoundPage('/404');
        };

        App.__notAccessPage = function (path) {
            var _this = this;
            var pageSource403 = _this.page403 || 'page/contents_403.html';
            var imageSource403 = _this.image403 || "page/res/error_img_403.png";
            console.error("Access error: You are not authorized to view this page");
            topInstance.curRoute.before = topInstance.curRoute.path;
            topInstance.curRoute.path = path;
            topInstance.curRoute.act = null;
            topInstance.curRoute.deact = null;
            topInstance.curRoute.data = null;
            topInstance.curRoute.params = null;
            var rootLayout = topInstance.curPage.template.children;
            if (rootLayout.length > 0) {
                if (rootLayout[0].id.indexOf("Top_403_error_layout") === -1) {
                    topInstance.curRoute.beforeRootLayout = rootLayout[0].id;
                } else {
                    topInstance.curRoute.beforeRootLayout = topInstance.curRoute.beforeRootLayout;
                }
            } else {
                topInstance.curRoute.beforeRootLayout = topInstance.curPage.template.src.split("?")[0].split(".")[0];
            }
            if (!this.checkLocationHash) window.history.pushState({ path: path }, "", "#!" + path);
            if (topInstance.curPage.getVisible() !== "visible" || topInstance.curPage.getVisible() !== true || topInstance.curPage.getVisible() !== "true") {
                topInstance.curPage.setVisible("visible");
            }
            topInstance.curPage.src(topInstance.libsPath + pageSource403, function () {
                var layout = topInstance.curPage.selectById('Top_403_error_layout');
                if (topInstance.curPage.selectById('imageError403')) topInstance.curPage.selectById('imageError403').setSrc(topInstance.libsPath + imageSource403);

                if (!_this.fn403_back) {
                    _this.fn403_back = function (layout) {
                        layout.selectById('backButton_403').setProperties({ 'on-click': 'getTop().App.__routeToBack(getTop().curRoute.before)' });
                    };
                }
                if (!_this.fn403) {
                    _this.fn403 = function (layout) {
                        layout.selectById('mainButton_403').setProperties({ 'on-click': "getTop().App.routeTo('/')" });
                    };
                }
                _this.fn403_back(layout);
                _this.fn403(layout);
            });
        };

        App.reset403 = function (pageSrc, imageSrc) {
            this.page403 = pageSrc;
            this.image403 = imageSrc;
        };

        App.load403Page = function (fn) {
            this.fn403 = fn;
            this.__notAccessPage();
        };

        App.__routeReplace = function (path) {
            if (path != null) {
                this.routeTo(path, undefined, true);
            } else if (this.isPushState) {
                this.checkLocationHash = false;
            } else {
                var dest = topInstance.routes["/"].dest;
                dest();
                this.checkLocationHash = false;
            }
        };

        App.back = function () {
            window.history.back();
        };

        App.forward = function () {
            window.history.forward();
        };

        App.reload = function (forcedReload) {
            window.location.reload(forcedReload);
        };

        App.openWindow = function (path, name, features) {
            if (path.includes('http')) {
                window.open(path, name, features);
            } else {
                var location = window.location.origin + window.location.pathname + "#!";
                window.open(location + path, name, features);
            }
        };

        App.pushState = function (state, title, url) {
            this.isPushState = true;
            window.history.pushState(state, title, url);
        };

        App.onPopState = function (callback) {
            this.onPopStateCallback = callback;
        };

        App.__makeDestFunction = function (to, from, depth) {
            return function (path, data, popstate, next) {
                if (typeof topInstance.curRoute.deact === 'function') {
                    var deactivate = topInstance.curRoute.deact();
                    if (deactivate !== undefined && !deactivate) {
                        return false;
                    }
                }
                if (typeof to.onDeactivate === 'string') {
                    to.onDeactivate = topInstance.Util.namespace(to.onDeactivate);
                }
                if (typeof to.onDeactivate === 'function') {
                    topInstance.curRoute.deact = to.onDeactivate;
                } else {
                    topInstance.curRoute.deact = function () {};
                }
                if (typeof topInstance.Util.namespace(to.onActivate) === 'function') {
                    if (to.routerType === "package") {
                        var temp = to;
                        to = {};
                        to.onActivate = topInstance.App.__makePackageRoute(temp);
                    } else {
                        to.onActivate = topInstance.Util.namespace(to.onActivate);
                    }
                } else if (typeof to.onActivate === 'string' && to.routerType === "general" && topInstance.Render.AppDom) {
                    var layoutId = to.onActivate;
                    to.onActivate = function () {
                        topInstance.App.renderRootLayout(layoutId);
                    };
                }
                var params = {};
                var paramKeys = from.split('/');
                paramKeys.splice(0, 1);
                var values = path.split('/');
                values.splice(0, 1);
                if (to.type === "POST" || to.type === "post") {
                    var query = {};
                    var lastIndex = values.length - 1;
                    if (values[lastIndex].includes("?")) {
                        var queryString = values[values.length - 1].split("?")[1];
                        var queryList = queryString.split("&");
                        for (var i = 0, len = queryList.length; i < len; i++) {
                            var queryValue = queryList[i].split("=");
                            if (queryValue[0] !== "") query[queryValue[0]] = queryValue[1];
                        }
                        values[lastIndex] = values[lastIndex].replace("?" + queryString, "");
                    }
                }
                if (paramKeys.length === 1) {
                    for (var i = 0, len = values.length; i < len; i++) {
                        if (paramKeys[0] === values[i]) {
                            params['_default' + i] = values[i];
                        }
                    }
                    if (Object.keys(params).length === 0) {
                        params[paramKeys[0].replace(':', '')] = values[depth];
                    }
                    var pathLen = depth + 1;
                } else if (paramKeys.length > 1) {
                    for (var i = 0, len = values.length; i < len; i++) {
                        if (paramKeys[i].indexOf(':') !== -1) {
                            params[paramKeys[i].replace(':', '')] = values[i];
                        } else {
                            params['_default' + i] = values[i];
                        }
                    }
                    var pathLen = values.length;
                }
                var routePath = "";
                for (var i = 0; i < pathLen; i++) {
                    routePath += "/" + values[i];
                }
                if (popstate !== true && next === undefined) {
                    window.history.pushState({ path: routePath }, "", "#!" + routePath);
                }
                topInstance.curRoute.before = topInstance.curRoute.path;
                topInstance.curRoute.path = routePath;
                topInstance.curRoute.act = to.onActivate;
                topInstance.curRoute.data = data;
                if (depth === 0) topInstance.curRoute.params = {};
                Object.assign(topInstance.curRoute.params, params);
                if (query) topInstance.curRoute.query = query;
                if (!topInstance.routes.enableReactivate) {
                    if (path !== topInstance.curRoute.before) {
                        to.onActivate.call(window, params, data, next);
                    } else {
                        topInstance.curRoute.path = path;
                    }
                } else {
                    to.onActivate.call(window, params, data, next);
                }
            };
        };

        App.__searchRoute = function (routeObj, path, __fromInner) {
            if (path.includes("?")) path = path.split("?")[0];
            if (routeObj === undefined) return undefined;
            if (routeObj[path] !== undefined) {
                return routeObj[path];
            }
            var parts = path.split('/');
            parts.splice(0, 1);
            var pattern = "";
            for (var i = 0, len = parts.length; i < len; i++) {
                pattern += '\/:([a-zA-Z0-9]+)';
            }
            var keys = Object.keys(routeObj);
            for (var i = 0, len = keys.length; i < len; i++) {
                var match = keys[i].match(pattern);
                if (match) {
                    return routeObj[match[0]];
                }
            }
            if (!__fromInner) return this.__searchInnerRoute(parts);
        };

        App.__searchInnerRoute = function (parts) {
            var routes = [];
            var routerItem = this.__searchRoute(topInstance.routes, '/' + parts[0], true);
            if (parts.length > 1 && parts[0].length === 0) return undefined;
            if (routerItem !== undefined) {
                routes.push(routerItem);
            } else {
                return undefined;
            }
            for (var i = 1, len = parts.length; i < len; i++) {
                if (routes[i - 1] !== undefined) routes.push(this.__searchRoute(routes[i - 1].routerItem, '/' + parts[i], true));
            }
            return routes;
        };

        App.__showPage = function (pageId) {
            topInstance.curPage.setProperties({ activated: false });
            var page = topInstance.pages[pageId];

            page.setProperties({ activated: true });
        };

        App.__useCommonLogic = function () {
            return topInstance.configs.deploy && (topInstance.configs.deploy.common === "true" || topInstance.configs.deploy.common === true);
        };

        App.__compatibleWithTOP = function () {
            return topInstance.configs.compatibleWithTOP === "true" || topInstance.configs.compatibleWithTOP === true;
        };

        App.__useCommonLogic = function () {
            return topInstance.configs.deploy && (topInstance.configs.deploy.common === "true" || topInstance.configs.deploy.common === true);
        };

        return App;
    };
    getTop().App = AppCreator(getTop());

    window.addEventListener("popstate", function (event) {
        if (getTop().configs.closeDialogToBrowserBack && getTop().App.dialogArray.length > 0) {
            getTop().App.dialogArray[topInstance.dialogArray.length - 1].close();
        } else {
            getTop().App.calledPopstate = true;
            getTop().App.__popstate(event);
        }
    });

    window.addEventListener("hashchange", function (event) {
        if (getTop().App.calledPopstate !== true) {
            getTop().App.__popstate(event);
        }
        getTop().App.calledPopstate = false;
    });

    var DataCreator = function DataCreator(topInstance) {
        Data.prototype = Object.create(topInstance.prototype);
        Data.prototype.constructor = Data;

        Data.map = {};
        Data.prototype.__boundWidgets = {};
        Data.prototype.__initialValues = {};
        Data.prototype.__isBackward = false;
        Data.prototype.__modelInfo = {};

        function Data(obj, name) {
            Object.assign(this, obj);
            this.id = topInstance.Util.guid();
            this.__boundWidgets = {};
            this.__name = name;

            this.__initialValues = this.getValues();
        }

        Data.create = function (name, data) {
            if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object' && data === undefined) {
                return new Data(name, '');
            } else if (typeof name === 'string' && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
                if (topInstance.ViewController.current === undefined) {
                    window[name] = new Data(data, name);
                } else {
                    if (topInstance.ViewController.__map[topInstance.ViewController.current][name] === undefined) {
                        var dataImpl = new Data(data, name);
                        this.map[name] = dataImpl;
                        topInstance.ViewController.__map[topInstance.ViewController.current][name] = dataImpl;
                    }
                }
            } else {
                console.error('Type error: Top.Data.create(string, object)');
            }
        };

        Data.prototype.__addBoundWidget = function (valuePath, widgetId, prop) {
            valuePath = valuePath.split('+')[0];
            var bindingInfo = {};
            bindingInfo.widgetId = widgetId;
            bindingInfo.property = prop;
            bindingInfo.valuePath = valuePath;
            var parts = valuePath.split('.');
            var bindingPath = parts[0];
            if (this.__boundWidgets[bindingPath] === undefined) this.__boundWidgets[bindingPath] = [];
            if (this.__hasBindingInfo(bindingPath, bindingInfo) === false) {
                this.__boundWidgets[bindingPath].push(bindingInfo);
            }
            for (var i = 1, len = parts.length; i < len; i++) {
                bindingPath += '.' + parts[i];
                if (this.__boundWidgets[bindingPath] === undefined) this.__boundWidgets[bindingPath] = [];
                if (this.__hasBindingInfo(bindingPath, bindingInfo) === false) {
                    this.__boundWidgets[bindingPath].push(bindingInfo);
                }
            }
        };

        Data.prototype.__hasBindingInfo = function (path, info) {
            var widgets = this.__boundWidgets[path];
            for (var i = 0, len = widgets.length; i < len; i++) {
                if (widgets[i].widgetId === info.widgetId && widgets[i].property === info.property && widgets[i].valuePath === info.valuePath) {
                    return true;
                }
            }
            return false;
        };

        Data.prototype.__updateBoundWidgets = function (key, __fromWidgetId, __fromViewControllerWidgetId) {
            if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                for (var i = 0, len = key.length; i < len; i++) {
                    this.__updateBoundWidgetsImpl(key[i], __fromWidgetId, __fromViewControllerWidgetId);
                }
            } else {
                this.__updateBoundWidgetsImpl(key, __fromWidgetId, __fromViewControllerWidgetId);
            }
        };

        Data.prototype.__updateBoundWidgetsImpl = function (key, __fromWidgetId, __fromViewControllerWidgetId) {
            var key = this.__searchBoundKey(key);
            if (this.__boundWidgets && this.__boundWidgets[key]) {
                var bindingInfoList = this.__boundWidgets[key];
                for (var i = 0, len = bindingInfoList.length; i < len; i++) {
                    var bindingInfo = bindingInfoList[i];

                    if (__fromWidgetId && bindingInfo['widgetId'] == __fromWidgetId) continue;else if (__fromViewControllerWidgetId && bindingInfo["widgetId"] != __fromViewControllerWidgetId) continue;

                    var widget = topInstance.Dom.selectById(bindingInfo['widgetId']);

                    if (bindingInfo['__isInitCalled'] === undefined) bindingInfo['__isInitCalled'] = true;

                    var prop = bindingInfo['property'];
                    var value = prop === 'items' ? this.getValue(bindingInfo['valuePath'].split('+')[0]) : this.getValue(bindingInfo['valuePath']);
                    var obj = {};
                    obj[prop] = value;
                    if (widget) widget.setProperties(obj);
                }
            }
        };

        Data.prototype.__searchBoundKey = function (key) {
            var parts = key.split('.');
            var path = key;
            var boundKey = '';
            if (this.__boundWidgets[path]) {
                boundKey = path;
            } else {
                for (var i = 1, len = parts.length; i < len; i++) {
                    var pos = path.lastIndexOf(parts[len - i]);
                    path = path.substring(0, pos - 1);
                    if (this.__boundWidgets[path] && this.__hasValuePath(this.__boundWidgets[path], path)) {
                        boundKey = path;
                        break;
                    }
                }
            }
            return boundKey;
        };

        Data.prototype.__hasValuePath = function (list, valuePath) {
            for (var i = 0, len = list.length; i < len; i++) {
                if (list[i].valuePath == valuePath) {
                    return true;
                }
            }
            return false;
        };

        Data.prototype.getValues = function () {
            var values = {};
            var keys = Object.keys(this);
            for (var i = 0, len = keys.length; i < len; i++) {
                if (keys[i] != 'id' && keys[i] != '__boundWidgets' && keys[i] != '__initialValues' && keys[i] != '__isBackward' && typeof this[keys[i]] !== 'function') {
                    values[keys[i]] = JSON.parse(JSON.stringify(this[keys[i]]));
                }
            }
            return values;
        };

        Data.prototype.getValue = function (path) {
            if (this.__isBackward) {
                if (!path.startsWith('data.')) path = 'data.' + path;
            }

            var value = this;
            var arrPath = path.split('.');
            for (var i = 0, len = arrPath.length; i < len; i++) {
                if (value[arrPath[i]] !== undefined) {
                    value = value[arrPath[i]];
                } else {
                    return;
                }
            }
            return value;
        };

        Data.prototype.__getValueWithConverter = function (path) {
            var fields = path.split('+')[0];
            var converter = topInstance.Util.namespace(path.split('+')[1]);
            var value = this.getValue(fields);
            if (typeof converter.convert === 'function') {
                return converter.convert(value);
            } else {
                return value;
            }
        };

        Data.prototype.getData = function (keys) {
            return this[keys];
        };

        Data.prototype.setData = function (values) {
            if (this.__isBackward) {
                var keys = Object.keys(values);
                for (var i = 0, len = keys.length; i < len; i++) {
                    this['data'][keys[i]] = values[keys[i]];
                }
                this.__updateBoundWidgets('data.' + keys);
            } else if (arguments.length === 2 && typeof arguments[0] === 'string' && _typeof(arguments[1]) === 'object') {
                this.setValue(arguments[0], arguments[1]);
            } else {
                this.setValues(values);
            }
            this.__updateRelationsBinding();
        };

        Data.prototype.setValues = function (values) {
            var keys = Object.keys(values);
            for (var i = 0, len = keys.length; i < len; i++) {
                if (keys[i] != 'id' && keys[i] != '__boundWidgets' && keys[i] != '__initialValues') {
                    this[keys[i]] = values[keys[i]];
                }
            }
            this.__updateBoundWidgets(keys);
            this.__updateRelationsBinding();
        };

        Data.prototype.setValue = function (path, value, __fromWidgetId) {
            if (this.__isBackward && !path.startsWith('data.')) {
                path = 'data.' + path;
            }
            var arrPath = path.split('.');
            var base = this;
            for (var i = 0, len = arrPath.length - 1; i < len; i++) {
                base = base[arrPath[i]] = base[arrPath[i]] || {};
            }
            base[arrPath[len]] = value;
            this.__updateBoundWidgets(path, __fromWidgetId);
            this.__updateRelationsBinding();
        };

        Data.prototype.addValue = function (path, value) {
            if (this.__isBackward && !path.startsWith('data.')) {
                path = 'data.' + path;
            }
            var arrPath = path.split('.');
            var base = this;
            for (var i = 0, len = arrPath.length - 1; i < len; i++) {
                base = base[arrPath[i]] = base[arrPath[i]] || {};
            }
            if (Array.isArray(base[arrPath[len]])) {
                if (value instanceof topInstance.Data) {
                    base[arrPath[len]].push(value.getValues());
                } else {
                    base[arrPath[len]].push(value);
                }
            }
            this.__updateBoundWidgets(path);
            this.__updateRelationsBinding();
        };

        Data.prototype.removeValue = function (path, index) {
            if (this.__isBackward && !path.startsWith('data.')) {
                path = 'data.' + path;
            }
            var arrPath = path.split('.');
            var base = this;
            for (var i = 0, len = arrPath.length - 1; i < len; i++) {
                base = base[arrPath[i]] = base[arrPath[i]] || {};
            }
            if (this.__isBackward && index >= 0) {
                base[arrPath[len]].splice(index, 1);
            } else {
                if (Array.isArray(base)) {
                    base.splice(arrPath[len], 1);
                } else {
                    delete base[arrPath[len]];
                }
            }
            this.__updateBoundWidgets(path);
            this.__updateRelationsBinding();
        };

        Data.prototype.reset = function (path) {
            if (typeof path === 'string') {
                if (this.__isBackward && !path.startsWith('data.')) {
                    path = 'data.' + path;
                }
                var arrPath = path.split('.');
                var base = this;
                var initialBase = JSON.parse(JSON.stringify(this.__initialValues));
                for (var i = 0, len = arrPath.length - 1; i < len; i++) {
                    base = base[arrPath[i]] = base[arrPath[i]] || {};
                    initialBase = initialBase[arrPath[i]] = initialBase[arrPath[i]] || {};
                }
                base[arrPath[len]] = initialBase[arrPath[len]];
                this.__updateBoundWidgets(path);
            } else {
                var keys = Object.keys(this.__initialValues);
                for (var i = 0, len = keys.length; i < len; i++) {
                    this[keys[i]] = this.__initialValues[keys[i]];
                }
                this.__updateBoundWidgets(keys);
            }
            this.__updateRelationsBinding();
        };

        Data.prototype.update = function (path) {
            if (typeof path === 'string') {
                this.__updateBoundWidgets(path);
            }
            this.__updateRelationsBinding();
        };

        Data.prototype.setModel = function (field, modelId) {
            var arrPath = field.split('.');
            var obj;
            if (arrPath.length == 1) {
                this.__modelInfo[arrPath[0]] = {};
                this.__modelInfo[arrPath[0]]['modelId'] = modelId;
            } else {
                if (this.__modelInfo[arrPath[0]]) obj = this.__modelInfo[arrPath[0]];else {
                    this.__modelInfo[arrPath[0]] = {};
                    obj = this.__modelInfo[arrPath[0]];
                }

                for (var i = 1, len = arrPath.length - 1; i < len; i++) {
                    if (obj[arrPath[i]] === undefined) {
                        obj[arrPath[i]] = {};
                    }
                    obj = obj[arrPath[i]];
                }
                obj[arrPath[len]] = {};
                obj[arrPath[len]]['modelId'] = modelId;
            }
        };

        Data.prototype.getModel = function () {
            return this.__modelInfo;
        };

        Data.prototype.setRelations = function (relations) {
            this.relations = relations;
        };

        Data.prototype.getRelations = function () {
            return this.relations;
        };

        Data.prototype.getDataByRelations = function (relationsId) {
            var relations = this.getRelationsById(relationsId);
            if (this[this.__toInstanceId(relationsId)] === undefined) {
                this[this.__toInstanceId(relationsId)] = this.__makeDataByRelations(relations);
            }
            return this.__toInstanceId(relationsId);
        };

        Data.prototype.getRelationsById = function (relationsId) {
            for (var i = 0, len = this.relations.length; i < len; i++) {
                if (this.relations[i].id === relationsId) {
                    return this.relations[i];
                }
            }
        };

        Data.prototype.__makeDataByRelations = function (relations) {
            var relation = relations.Relation;
            var rootId = relation[0].parentId;
            var path = rootId;
            for (var i = 0, len = relation.length; i < len; i++) {
                if (rootId === relation[i].childId) {
                    rootId = relation[i].parentId;
                    path = rootId.concat('.').concat(path);
                } else {
                    path = path.concat('.').concat(relation[i].childId);
                }
                var _this = this;
                var parents = JSON.parse(JSON.stringify(this.getValue(rootId)));
                parents.forEach(function (parent) {
                    var children = _this.getValue(relation[i].childId);
                    children.forEach(function (child) {
                        if (parent[relation[i].parentField] === child[relation[i].childField]) {
                            if (_typeof(parent[relation[i].childId]) !== 'object') parent[relation[i].childId] = [];
                            parent[relation[i].childId].push(JSON.parse(JSON.stringify(child)));
                        }
                    });
                });
            }
            relations.rootId = rootId;
            this.__setRelationModel(path);
            this.__modelInfo[this.__toInstanceId(relations.id)] = this.getModel()[rootId];
            return parents;
        };

        Data.prototype.__setRelationModel = function (path) {
            var keys = path.split('.');
            var key = keys[0];
            this.setModel(key, this.getModel()[keys[0]].modelId);
            for (var i = 1, len = keys.length; i < len; i++) {
                key = key.concat('.').concat(keys[i]);
                this.setModel(key, this.getModel()[keys[i]].modelId);
            }
        };

        Data.prototype.getRootId = function (relationsId) {
            for (var i = 0, len = this.relations.length; i < len; i++) {
                if (this.relations[i].id === relationsId) {
                    return this.relations[i].rootId;
                }
            }
        };

        Data.prototype.__toInstanceId = function (relationsId) {
            return '__relations__'.concat(relationsId);
        };

        Data.prototype.__updateRelationsBinding = function () {
            var relations = this.getRelations();
            if (relations !== undefined) {
                for (var i = 0, len = relations.length; i < len; i++) {
                    var instanceId = this.__toInstanceId(relations[i].id);
                    this[instanceId] = this.__makeDataByRelations(relations[i]);
                    this.__updateBoundWidgets(instanceId);
                }
            }
        };

        Data.prototype.__clearBindingInfo = function (valuePath, widgetId) {
            valuePath = valuePath.split('+')[0];
            var parts = valuePath.split('.');
            var bindingPath = parts[0];
            var bindingInfoList = this.__boundWidgets[bindingPath];
            if (bindingInfoList === undefined) return;
            for (var i = bindingInfoList.length - 1; i >= 0; i--) {
                if (bindingInfoList[i].widgetId === widgetId) {
                    bindingInfoList.splice(i, 1);
                }
            }
            for (var j = 1, len2 = parts.length; j < len2; j++) {
                bindingPath += '.' + parts[j];
                bindingInfoList = this.__boundWidgets[bindingPath];
                for (var i = bindingInfoList.length - 1; i >= 0; i--) {
                    if (bindingInfoList[i].widgetId === widgetId) {
                        bindingInfoList.splice(i, 1);
                    }
                }
            }
        };

        Data.prototype.map = function (callback) {
            var data = this.getValues();
            delete data['__name'];
            var array = Object.values(data);
            return array.map(function (item, index, array) {
                return callback(item, index, array);
            });
        };

        Data.__modelList = {};

        Data.createModel = function (packageName, id, dataFields) {
            this.__modelList[id] = dataFields;
            this.createClass(packageName, id, Object.keys(dataFields));
        };

        Data.getDataModel = function (id) {
            return this.__modelList[id];
        };

        Data.__classList = {};

        Data.createClass = function (packageName, id, fieldNames) {
            var paths = packageName.split('.');
            var path = paths[0];
            window[path] = window[path] || {};
            var pkg = window[path];
            for (var i = 1, len = paths.length; i < len; i++) {
                pkg[paths[i]] = pkg[paths[i]] || {};
                pkg = pkg[paths[i]];
            }
            pkg[id] = {};
            pkg[id].class = id;
            for (var i = 0, len = fieldNames.length; i < len; i++) {
                pkg[id][fieldNames[i]] = '';
            }
            this.__classList[id] = pkg[id];
        };

        Data.getClass = function (className) {
            return this.__classList[className];
        };

        Data.toTreeNodes = function (origin, keyMap) {
            if (!keyMap.hasOwnProperty('id') || !keyMap.hasOwnProperty('level')) return;
            var data = [];
            var lowData = {};
            var rootLevel = 1;
            for (var i = 0, len = origin.length; i < len; i++) {
                if (origin[i][keyMap.level] === 0 || origin[i][keyMap.level] === '0') {
                    rootLevel = 0;
                    break;
                }
            }
            for (i = 0, len = origin.length; i < len; i++) {
                var level = Number.isInteger(origin[i][keyMap.level]) === true ? origin[i][keyMap.level] : parseInt(origin[i][keyMap.level]);
                if (level === rootLevel) {
                    data.push({
                        id: origin[i][keyMap.id],
                        text: origin[i][keyMap.text]
                    });
                    this.__copyProperties(data[data.length - 1], origin[i], keyMap);
                } else if (level > rootLevel) {
                    if (lowData[level] === undefined) lowData[level] = [];
                    lowData[level].push(origin[i]);
                }
            }
            var levels = Object.keys(lowData);
            for (i = 0, len = levels.length; i < len; i++) {
                var curData = lowData[levels[i]];
                for (var j = 0, len2 = curData.length; j < len2; j++) {
                    var parent = this.__searchObjectById(data, curData[j][keyMap.parentId]);
                    if (parent !== undefined) {
                        this.__addChildNode(parent, curData[j], keyMap);
                    }
                }
            }
            return data;
        };

        Data.syncTreeNodes = function (nodes) {
            for (var i = 0; i < nodes.length; i++) {
                syncChildren(nodes[i].children, nodes[i]);
            }

            function syncChildren(childrenArr, upperNode) {
                var childrenLength = childrenArr.length;
                var currentPath = '';
                if (upperNode.path == '') {
                    currentPath = upperNode.id;
                } else {
                    currentPath = upperNode.path + '.' + upperNode.id;
                }
                var currentLevel = parseInt(upperNode.level) + 1;
                for (var i = 0; i < childrenLength; i++) {
                    var currentNode = childrenArr[i];
                    currentNode.path = currentPath;
                    currentNode.level = currentLevel;
                    currentNode.parentId = upperNode.id;
                    var childrenOfcurrentNode = currentNode.children;
                    if (childrenOfcurrentNode != null && (typeof childrenOfcurrentNode === 'undefined' ? 'undefined' : _typeof(childrenOfcurrentNode)) == 'object' && childrenOfcurrentNode.length >= 1) {
                        syncChildren(childrenOfcurrentNode, currentNode);
                    }
                }
            }
        };

        Data.__addChildNode = function (parent, child, keyMap) {
            if (parent.children === undefined) {
                parent.children = [];
            }
            if (child[keyMap.seq]) {
                var index = parseInt(child[keyMap.seq]) - 1;
                parent.children.splice(index, 0, {
                    id: child[keyMap.id],
                    text: child[keyMap.text]
                });
                var i = parent.children.length <= index ? parent.children.length - 1 : index;
                this.__copyProperties(parent.children[i], child, keyMap);
            } else {
                parent.children.push({
                    id: child[keyMap.id],
                    text: child[keyMap.text]
                });
                this.__copyProperties(parent.children[parent.children.length - 1], child, keyMap);
            }
        };

        Data.__searchObjectById = function (array, id) {
            var result;
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i].id === id) {
                    return array[i];
                } else if (_typeof(array[i].children) === 'object') {
                    result = this.__searchObjectById(array[i].children, id);
                    if (result) {
                        return result;
                    }
                }
            }
        };

        Data.__copyProperties = function (target, source, keyMap) {
            var keys = Object.keys(keyMap);
            for (var i = 0, len = keys.length; i < len; i++) {
                var key = keys[i];
                if (key !== 'id' && key !== 'text' && key !== 'children') {
                    target[keys[i]] = source[keyMap[keys[i]]];
                }
            }
        };

        return Data;
    };

    getTopUI().Data = DataCreator(getTopUI());
    getTop().Data = DataCreator(getTop());

    var DomCreator = function DomCreator(topInstance) {
        Dom.prototype = Object.create(topInstance.prototype);
        Dom.prototype.constructor = Dom;

        function Dom() {}

        Dom.__selectImpl = function (element) {
            return element.topWidget.getTemplate();
        };

        Dom.selectById = function (id) {
            if (!id || id === '') return null;
            if (!document.getElementById(id)) return null;
            return document.getElementById(id).topWidget;
        };

        Dom.remove = function (id) {
            var element = document.getElementById(id);
            if (!element) return;
            var topWidget = element.topWidget;
            if (topWidget) {
                topWidget.getLayoutParent().removeWidget(topWidget);
            } else {
                element.remove();
            }
        };

        return Dom;
    };

    getTopUI().Dom = DomCreator(getTopUI());
    getTop().Dom = DomCreator(getTop());

    var ViewControllerCreator = function ViewControllerCreator(topInstance) {
        ViewController.prototype = Object.create(topInstance.prototype);
        ViewController.prototype.constructor = ViewController;
        ViewController.prototype.__boundWidget = null;
        ViewController.prototype.__loadEvents = new Map();
        ViewController.prototype.__initEvents = [];
        ViewController.prototype.__loaded = false;

        function ViewController(obj) {
            Object.assign(this, obj);
        }

        ViewController.__map = {};

        ViewController.prototype.__setBoundWidget = function (widget) {
            topInstance.ViewController.current = this.getName();
            this.__boundWidget = widget;
            this.__callLoadEvents();
            if (typeof this.__init === 'function') {
                topInstance.ViewController.setCurrent(this);
                this.__init();
            }
            this.__loaded = true;
            this.__callInitEvents();
        };

        ViewController.prototype.__callLoadEvents = function () {
            if (!this.hasOwnProperty("__loadEvents")) return;
            this.__loadEvents.forEach(function (load) {
                load();
            });
        };

        ViewController.prototype.__callInitEvents = function () {
            this.__initEvents.forEach(function (load) {
                load();
            });

            this.__initEvents = new Map();
        };

        ViewController.prototype.onInit = function (callback) {
            if (typeof callback === 'function') {
                this.__initEvents.push(callback);
            }
        };

        ViewController.prototype.isLoaded = function () {
            return this.__loaded;
        };

        ViewController.prototype.getName = function () {
            return this.__name;
        };

        ViewController.prototype.getBoundWidget = function () {
            return this.__boundWidget;
        };

        ViewController.create = function (name, viewController) {
            if (typeof name === 'string' && (typeof viewController === 'undefined' ? 'undefined' : _typeof(viewController)) === 'object') {
                if (_typeof(this.__map[name]) === 'object') {
                    this.__map[name] = Object.assign(this.__map[name], viewController);
                } else {
                    if (typeof viewController.init === 'function') {
                        viewController.__init = viewController.init;
                        delete viewController.init;
                    }
                    var viewControllerImpl = new ViewController(viewController);
                    viewControllerImpl.__name = name;
                    viewControllerImpl.__children = new Map();
                    viewControllerImpl.getParentViewController = function (parentName) {
                        var sourceName = viewControllerImpl.__name;
                        var viewControllerList = topInstance.viewController.__map;
                        var sourceParent = viewControllerList[sourceName].__parent;
                        if (parentName !== undefined && viewControllerList[parentName] !== undefined) {
                            if (sourceName === parentName) {
                                return viewControllerList[sourceName];
                            } else {
                                var __trackParentRecursive = function __trackParentRecursive(source, target) {
                                    var sourceParentName = viewControllerList[source].__parent;
                                    if (sourceParentName === undefined) {
                                        console.error(target + ' is not Parent ViewController.');
                                    }
                                    if (sourceParentName !== undefined && sourceParentName === target) {
                                        return viewControllerList[sourceParentName];
                                    } else if (sourceParentName !== undefined && sourceParentName !== target) {
                                        return __trackParentRecursive(sourceParent, parentName);
                                    }
                                };

                                return __trackParentRecursive(sourceName, parentName);
                            }
                        } else {
                            console.error('Parent View Controller is not defined.');
                        }
                    };
                    this.__map[name] = viewControllerImpl;
                }
            } else {
                console.error('Type error: Top.ViewController.create(string, object)');
            }
        };

        ViewController.onLoad = function (node, viewController, callback) {
            if (!viewController.hasOwnProperty("__loadEvents")) {
                viewController.__loadEvents = new Map();
            }

            viewController.__loadEvents.set(node, callback);
        };

        ViewController.removeOnLoad = function (node, viewController) {
            if (viewController && viewController.hasOwnProperty("__loadEvents") && viewController.__loadEvents.has(node)) viewController.__loadEvents.delete(node);
        };

        ViewController.setCurrent = function (viewController) {
            this.__curViewController = viewController;
        };

        ViewController.getCurrent = function () {
            return this.__curViewController;
        };

        return ViewController;
    };

    getTopUI().ViewController = ViewControllerCreator(getTopUI());
    getTop().ViewController = ViewControllerCreator(getTop());

    var AjaxCreator = function AjaxCreator(topInstance) {
        Ajax.prototype = Object.create(topInstance.prototype);
        Ajax.prototype.constructor = Ajax;

        function Ajax() {}

        Ajax.execute = function (url, settings) {
            if ((typeof url === 'undefined' ? 'undefined' : _typeof(url)) === 'object' && typeof settings === 'undefined') {
                var settings = url;
                url = settings.url;
            }
            if (topInstance.configs && topInstance.configs['isStandalone'] === true || topInstance.isStandalone) {
                var regex = new RegExp("^(http|https|data|chrome|chrome-extension)://", "i");
                if (!regex.test(url)) {
                    this.executeStandalone(url, settings);
                    return;
                }
            }
            var type = settings.type ? settings.type : 'get';
            var async = settings.async !== undefined ? settings.async : true;
            var responseType = settings.dataType !== undefined ? settings.dataType : '';
            var _headers = settings.headers;
            var _beforeSend = settings.beforeSend;
            var _success = settings.success;
            var _error = settings.error;
            var _complete = settings.complete;
            if (type.toLowerCase() === 'get' && settings.data) {
                url += this.toQueryString(settings.data);
            }
            var xhr = new XMLHttpRequest();
            xhr.open(type, url, async);
            if (async) xhr.responseType = responseType;
            if (_headers !== undefined && _headers !== null && (typeof _headers === 'undefined' ? 'undefined' : _typeof(_headers)) === 'object') {
                for (i in _headers) {
                    xhr.setRequestHeader(i, _headers[i]);
                }
            }
            if (_beforeSend !== undefined && typeof _beforeSend === 'function') {
                var result = _beforeSend(xhr);
                if (result !== undefined && !result) {
                    return false;
                }
            }
            var contentType = typeof settings.contentType === 'string' ? settings.contentType : 'application/json';
            xhr.setRequestHeader('Content-Type', contentType);
            xhr.onload = function () {
                if (xhr.status === 200) {
                    if (typeof xhr.response === 'string' && !xhr.response.startsWith('<') && typeof settings.response === 'string') {
                        var dataName = topInstance.Util.getDataName(settings.response);
                        if (dataName) {
                            var dataObj = topInstance.Util.namespace(dataName);
                            if (dataObj instanceof topInstance.Data) {
                                var path = settings.response.split(dataName + '.')[1];
                                dataObj.setValue(path, xhr.response);
                            }
                        }
                    }
                    if (typeof _success === 'function') _success(xhr.response, xhr.status, xhr);
                } else {
                    if (typeof _error === 'function') _error(xhr, xhr.status);
                }
                if (typeof _complete === 'function') _complete(xhr, xhr.status);
            };
            if ((type.toLowerCase() === 'post' || type.toLowerCase() === 'put' || type.toLowerCase() === 'delete') && settings.data) {
                var data = typeof settings.data === 'string' ? settings.data : JSON.stringify(settings.data);
                xhr.send(data);
            } else {
                xhr.send();
            }
        };

        Ajax.executeStandalone = function (url, settings) {
            if ((typeof url === 'undefined' ? 'undefined' : _typeof(url)) === 'object' && typeof settings === 'undefined') {
                var settings = url;
                url = settings.url;
            }
            var res_key;

            if (url.includes('/src')) {
                res_key = url.substring(url.indexOf('src'));
            } else if (url.includes('?')) {
                res_key = url.substring(0, url.indexOf('?'));
            } else if (url.endsWith('version')) {
                res_key = 'version';
            } else {
                res_key = url;
            }
            var type = settings.type ? settings.type : "get";
            var async = settings.async !== undefined ? settings.async : true;
            var responseType = settings.dataType !== undefined ? settings.dataType : "";
            var _beforeSend = settings.beforeSend;
            var _success = settings.success;
            var _error = settings.error;
            var _complete = settings.complete;
            if (type.toLowerCase() === "get" && settings.data) {
                url += this.toQueryString(settings.data);
            }
            var xhr = undefined;
            if (window[res_key]) {
                xhr = { response: window[res_key], responseURL: res_key, status: 200, xhr: '' };
            } else {
                xhr = { response: null, status: 404, xhr: '' };
            }
            if (_beforeSend !== undefined && typeof _beforeSend === "function") {
                _beforeSend(xhr);
            }
            if (typeof xhr.response === 'string' && !xhr.response.startsWith("<") && typeof settings.response === 'string') {
                var dataName = topInstance.Util.getDataName(settings.response);
                if (dataName) {
                    var dataObj = topInstance.Util.namespace(dataName);
                    if (dataObj instanceof getTop().Data) {
                        var path = settings.response.split(dataName + '.')[1];
                        dataObj.setValue(path, xhr.response);
                    }
                }
            }
            if (xhr.status === 200) {
                if (typeof _success === 'function') _success(xhr.response, xhr.status, xhr);
            } else if (xhr.status === 404) {
                if (typeof _error === 'function') _error(xhr.response, xhr.status, xhr);
            }
            if (typeof _complete === 'function') _complete(xhr, xhr.status);
        };

        Ajax.executeById = function (id) {
            topInstance.Dom.selectById(id).execute();
        };

        Ajax.get = function (url, request, response, onSuccess, onFail) {
            var settings = {};
            settings.type = 'get';
            settings.data = request;
            settings.response = response;
            settings.success = onSuccess;
            settings.error = onFail;
            this.execute(url, settings);
        };

        Ajax.post = function (url, request, response, onSuccess, onFail) {
            var settings = {};
            settings.type = 'post';
            settings.data = request;
            settings.response = response;
            settings.success = onSuccess;
            settings.error = onFail;
            this.execute(url, settings);
        };

        Ajax.toQueryString = function (data) {
            if (typeof data === 'string') {
                return '?' + data;
            } else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
                return '?' + $.param(data);
            }
        };

        return Ajax;
    };

    getTopUI().Ajax = AjaxCreator(getTopUI());
    getTop().Ajax = AjaxCreator(getTop());

    var UtilCreator = function UtilCreator(topInstance) {
        Util.prototype = Object.create(topInstance.prototype);
        Util.prototype.constructor = Util;

        function Util() {}

        Util.guid = function () {
            return 'zxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c === 'x' ? r : r & 0x3 | 0x8;
                return v.toString(16);
            });
        };

        Util.getFileExtension = function (fileName) {
            return fileName.split('.').pop();
        };

        Util.getFileName = function (path) {
            return path.split(/(\\|\/)/g).pop();
        };

        Util.namespace = function (string, widget) {
            if (!string) {
                return undefined;
            } else if (typeof string !== 'string') {
                return null;
            } else if (this.__isUrl(string)) {
                return function () {
                    topInstance.App.routeTo(string);
                };
            } else {
                return this.__stringToObject(string, widget);
            }
        };

        Util.getDataName = function (path, widget) {
            var parts = path.split('.');
            var dataName = '';
            for (var i = 0, len = parts.length; i < len; i++) {
                if (dataName === '') {
                    dataName = dataName.concat(parts[i]);
                } else {
                    dataName = dataName.concat('.' + parts[i]);
                }
                if (this.namespace(dataName, widget) instanceof topInstance.Data) {
                    return dataName;
                }
            }
            return '';
        };

        Util.__stringToObject = function (str, widget) {
            if (widget !== undefined) {
                var widgetViewController = this.__searchViewController(widget);
                if (widgetViewController !== undefined) {
                    if (widgetViewController !== topInstance.AppController) {
                        var result = this.__searchObject(widgetViewController, str);
                        if (result === undefined) {
                            return this.__setSearchScope(str);
                        } else {
                            return result;
                        }
                    } else {
                        return this.__setSearchScope(str);
                    }
                } else {
                    return this.__setSearchScope(str);
                }
            } else {
                return this.__setSearchScope(str);
            }
        };

        Util.__searchViewController = function (widget) {
            var viewController;
            while (widget.state.viewController === undefined) {
                widget = widget.getLayoutParent();
                if (widget instanceof TopApp && !widget.state.viewController || widget instanceof TopLayoutEditor) {
                    return topInstance.AppController;
                }
            }
            viewController = topInstance.ViewController.__map[widget.state.viewController];
            return viewController;
        };

        Util.__setSearchScope = function (data) {
            var result = this.__searchObject(topInstance.AppController, data);
            if (result === undefined) {
                return this.__searchObject(window, data);
            } else {
                return result;
            }
        };

        Util.__convertQuotes = function (data) {
            if (data.charAt(1) === "\'") {
                data = data.replace(/\'/g, '"');
                return data;
            } else {
                return data;
            }
        };

        Util.__searchObject = function (base, str) {
            var object = base;
            var parts = str.split('.');
            for (var i = 0; i < parts.length; i++) {
                if (typeof object[parts[i]] === 'undefined') {
                    return undefined;
                }
                object = object[parts[i]];
            }
            return object;
        };

        Util.toCamelCase = function (string) {
            return string.replace(/-([a-z])/g, function (g) {
                return g[1].toUpperCase();
            });
        };

        Util.toDash = function (string) {
            return string.replace(/([A-Z])/g, function ($1) {
                return "-" + $1.toLowerCase();
            });
        };

        Util.capitalizeFirstLetter = function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };

        Util.decapitalizeFirstLetter = function (string) {
            return string.charAt(0).toLowerCase() + string.slice(1);
        };

        Util.__isStyleProperty = function (property) {
            var styleRegexp = /^(opacity|background|backgroundColor|backgroundImage|tileMode|maxWidth|minWidth|maxHeight|minHeight|lineHeight|padding|margin|visible|display|zIndex|float|position|horizontalAlignment|verticalAlignment|layoutHorizontalAlignment|layoutVerticalAlignment|layoutHeight|layoutWidth|layoutTop|layoutLeft|layoutRight|layoutBottom|borderWidth|borderBottomWidth|borderLeftWidth|borderRightWidth|borderTopWidth|borderStyle|borderColor|borderRadius|verticalScroll|horizontalScroll|textSize|textColor)$/;
            return styleRegexp.test(property);
        };

        Util.__isTopWidget = function (tagName) {
            if (tagName) {
                var name = tagName.toLowerCase();
            }
            return (/^top-[a-zA-Z]*/.test(name) && topInstance.Render.topWidgets[name] !== undefined || topInstance.Render.topWidgets[name] !== undefined && topInstance.Render.topWidgets[name].isCustomType === true
            );
        };

        Util.__isUrl = function (str) {
            var IS_HTTP = /^(f|ht)tps?:\/\//i;
            return str.startsWith("/") || IS_HTTP.test(str);
        };

        Util.__getViewControllerPath = function (strLayout) {
            var matchedDefault = strLayout.match(/"viewControllerPath":"([^"]*)"/);
            var matchedAfter = strLayout.match(/"viewControllerPath": "([^"]*)"/);
            if (matchedDefault) {
                return matchedDefault[1].split(",");
            } else if (matchedAfter) {
                return matchedAfter[1].split(",");
            } else {
                return undefined;
            }
        };

        Util.__getViewControllerName = function (strLayout) {
            var matchedDefault = strLayout.match(/"viewController":"([^"]*)"/);
            var matchedAfter = strLayout.match(/"viewController": "([^"]*)"/);
            if (matchedDefault) {
                return matchedDefault[1];
            } else if (matchedAfter) {
                return matchedAfter[1];
            } else {
                return undefined;
            }
        };

        Util.__getRawValue = function (str) {
            if (str.startsWith('@raw')) {
                str = str.split('?')[0];
                var id = str.substr(str.indexOf('/') + 1);
                return topInstance.RawManager.get(id.split('.')[0]);
            } else {
                return str;
            }
        };

        Util.__getPropConfigs = function (widget) {
            return topInstance.Render.topWidgets[widget.props.tagName].propConfigs;
        };

        Util.__validateProperties = function (key, value, config, widgets) {
            var convertedValue = value;

            if (config.type === undefined) {
                return convertedValue;
            }

            if (config.type instanceof Array) {
                var returnFlag = true;
                for (var i = 0; i < config.type.length; i++) {
                    if ((typeof convertedValue === 'undefined' ? 'undefined' : _typeof(convertedValue)) === _typeof(config.type[i]())) {
                        config.type = config.type[i];
                        returnFlag = false;
                        break;
                    }

                    if (_typeof(config.type[i]()) === 'object') {
                        if (typeof convertedValue === 'string' && (convertedValue.startsWith('{') || convertedValue.startsWith('['))) {
                            config.type = config.type[i];
                            returnFlag = false;
                            break;
                        }
                    }
                }

                if (returnFlag) return convertedValue;
            }

            if (_typeof(config.type()) === 'object' || typeof config.type() === 'function') {
                convertedValue = this.__validateObjectProperty(key, value, config, widgets);
            } else if ((typeof convertedValue === 'undefined' ? 'undefined' : _typeof(convertedValue)) !== _typeof(config.type())) {
                    console.debug('PropertyWarning: type of property \'' + key + '\' given as \'' + this.capitalizeFirstLetter(typeof convertedValue === 'undefined' ? 'undefined' : _typeof(convertedValue)) + '\' should be \'' + this.capitalizeFirstLetter(_typeof(config.type())) + '\'. Automatically changed to \'' + this.capitalizeFirstLetter(_typeof(config.type())) + '\'.');
                    if (typeof config.type() === 'boolean') {
                        if (convertedValue === 'true') convertedValue = true;else if (convertedValue === 'false') convertedValue = false;else convertedValue = config.type(convertedValue);
                    } else {
                        convertedValue = config.type(convertedValue);
                    }
                }

            if (config.options && config.options.indexOf(convertedValue) < 0) {
                console.debug('PropertyWarning: property \'' + key + '\' given as \'' + convertedValue + '\' should be one of [' + config.options + ']. ' + 'Automatically changed to \'' + config.default + '\'.');
                convertedValue = config.default;
            }

            if (config.convert && typeof config.convert === 'function') {
                convertedValue = config.convert(convertedValue);
            }
            return convertedValue;
        };

        Util.__validateObjectProperty = function (prop, object, config, widget) {
            function printWarning(key, prop, shape) {
                if (!shape) {
                    console.debug('PropertyWarning: property \'' + prop + '\' has no config.');
                } else if (key) {
                    console.debug('PropertyWarning: key \'' + key + '\' is not suitable key for property \'' + prop + '\'.');
                } else {
                    console.debug('PropertyWarning: \'' + object + '\' is not object for property \'' + prop + '\'.');
                }
            }

            var convertedObject = object;

            if ((typeof convertedObject === 'undefined' ? 'undefined' : _typeof(convertedObject)) !== _typeof(config.type())) {
                if (typeof convertedObject === 'string') {
                    if (convertedObject.startsWith('{') || convertedObject.startsWith('[')) {
                        try {
                            convertedObject = JSON.parse(this.__convertQuotes(convertedObject));
                        } catch (e) {
                            convertedObject = eval("(" + convertedObject + ")");
                        }
                    } else {
                        convertedObject = this.namespace(convertedObject, widget) || convertedObject;
                    }

                    if ((typeof convertedObject === 'undefined' ? 'undefined' : _typeof(convertedObject)) !== _typeof(config.type())) {
                        printWarning(null, prop);
                        convertedObject = [convertedObject];
                    }
                } else if (typeof convertedObject === 'number') {
                    convertedObject = [convertedObject];
                }
            }

            if (convertedObject instanceof Array) {
                for (var i = 0; i < convertedObject.length; i++) {
                    if (!config.arrayOf) break;
                    convertedObject[i] = config.arrayOf(convertedObject[i]);
                }
            } else if (convertedObject instanceof Object) {
                for (var key in convertedObject) {
                    if (!config.shape) {
                        printWarning(key, prop, null);
                        break;
                    }
                    if (!config.shape[key]) {
                        printWarning(key, prop);
                        continue;
                    }

                    convertedObject[key] = this.__validateProperties(key, convertedObject[key], config.shape[key], widget);
                }
            }
            console.debug('final result: ', convertedObject);
            return convertedObject;
        };

        Util.__gatherPropertyAliases = function () {
            for (var widget in topInstance.Render.topWidgets) {
                if (topInstance.Render.topWidgets[widget] && topInstance.Render.topWidgets[widget].propConfigs) {
                    var configs = topInstance.Render.topWidgets[widget].propConfigs;
                    configs['__propertyAliases'] = new Map();
                    for (var prop in configs) {
                        if (configs[prop].aliases) {
                            var aliases = configs[prop].aliases;
                            var _iteratorNormalCompletion = true;
                            var _didIteratorError = false;
                            var _iteratorError = undefined;

                            try {
                                for (var _iterator = aliases[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    var alias = _step.value;

                                    configs['__propertyAliases'].set(alias, prop);
                                }
                            } catch (err) {
                                _didIteratorError = true;
                                _iteratorError = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion && _iterator.return) {
                                        _iterator.return();
                                    }
                                } finally {
                                    if (_didIteratorError) {
                                        throw _iteratorError;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        Util.__setDefaultProperties = function (properties, configs) {
            var newState = Object.assign({}, properties);
            for (var key in configs) {
                if (newState[key] === undefined && configs[key].default !== undefined) {
                    console.debug('PropertyWarning: property \'' + key + '\' given as \'' + newState[key] + '\' should have value. ' + 'Automatically changed to \'' + configs[key].default + '\'.');
                    newState[key] = configs[key].default;
                }
            }
            return newState;
        };

        Util.__convertProperties = function (properties, configs, widget) {
            var convertedProperties = {};
            if (configs) {
                var __configs = $.extend(true, {}, configs);
            }
            var keys = Object.keys(properties);
            for (var i = 0, len = keys.length; i < len; i++) {
                var attrName = keys[i];
                if (attrName.includes('-')) {
                    attrName = attrName.replace(/-([a-z])/g, function (g) {
                        return g[1].toUpperCase();
                    });
                }
                if (configs && configs['__propertyAliases'] && configs['__propertyAliases'].get(attrName)) {
                    console.debug('PropertyWarning: property \'' + attrName + '\' is an alias of \'' + configs['__propertyAliases'].get(attrName) + '\'. Automatically changed to \'' + configs['__propertyAliases'].get(attrName) + '\'.');
                    convertedProperties[configs['__propertyAliases'].get(attrName)] = properties[keys[i]];
                    properties[configs['__propertyAliases'].get(attrName)] = properties[keys[i]];
                    attrName = configs['__propertyAliases'].get(attrName);
                } else {
                    convertedProperties[attrName] = properties[keys[i]];
                }
                if (configs && configs[attrName]) {
                    convertedProperties[attrName] = this.__validateProperties(attrName, convertedProperties[attrName], __configs[attrName], widget);
                }
                var resourcePattern = /^@(string|color|dimen|raw|drawable|style|theme)(\/[a-zA-Z0-9_]+)+$/gm;
                var originValue = properties[keys[i]];
                if (resourcePattern.test(properties[keys[i]])) {
                    var modifiedValue;
                    var resourceType = originValue.split('/')[0];
                    var resourceId = originValue.substr(originValue.indexOf('/') + 1);
                    switch (resourceType) {
                        case '@drawable':
                            {
                                modifiedValue = topInstance.DrawableManager.get(resourceId);
                                break;
                            }
                        case '@raw':
                            {
                                modifiedValue = topInstance.RawManager.get(resourceId);
                                break;
                            }
                        default:
                            {
                                resourceId = resourceId.substr(0, resourceId.lastIndexOf('/'));
                                var resourceName = originValue.split('/');
                                resourceName = resourceName[resourceName.length - 1];

                                switch (resourceType) {
                                    case '@string':
                                        {
                                            modifiedValue = topInstance.ValuesManager.get('strings', resourceId)[resourceName];
                                            break;
                                        }
                                    case '@color':
                                        {
                                            modifiedValue = topInstance.ValuesManager.get('colors', resourceId)[resourceName];
                                            break;
                                        }
                                    case '@dimen':
                                        {
                                            modifiedValue = topInstance.ValuesManager.get('dimen', resourceId)[resourceName];
                                            break;
                                        }
                                }
                            }
                    }
                    convertedProperties[attrName] = modifiedValue;
                }
            }
            return convertedProperties;
        };

        Util.__addClassToClassList = function (classList, classString, toggleClassList) {
            if (toggleClassList) toggleClassList.forEach(function (c) {
                if (classList.indexOf(c) > 0) classList.splice(classList.indexOf(c), 1);
            });
            if (classString && !classList.includes(classString)) classList.push(classString);
            return classList;
        };

        Util.__classListToClassString = function (array) {
            var str = '';
            for (var i = 0; i < array.length; i++) {
                if (i === 0) str = array[i];else str = str + ' ' + array[i];
            }
            return str;
        };

        Util.__classStringToClassList = function (classString, classList) {
            if (!classList) var classList = [];
            if (classString) classString.split(' ').forEach(function (c) {
                if (!classList.includes(c)) classList.push(c);
            });
            return classList;
        };

        Util.__deepCopy = function (data) {
            var result, i;
            if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) !== 'object') return data;
            if (!data) return data;
            if (data.constructor === Array) {
                result = [];
                for (i = 0; i < data.length; i++) {
                    result[i] = this.__deepCopy(data[i]);
                }
                return result;
            }
            result = {};
            for (i in data) {
                result[i] = this.__deepCopy(data[i]);
            }
            return result;
        };

        Util.__deepMerge = function (source, target) {
            for (var data in target) {
                try {
                    if (target[data].constructor === Object) {
                        source[data] = this.__deepMerge(source[data], target[data]);
                    } else {
                        source[data] = target[data];
                    }
                } catch (e) {
                    source[data] = target[data];
                }
            }
            return source;
        };

        return Util;
    };

    getTopUI().Util = UtilCreator(getTopUI());
    getTop().Util = UtilCreator(getTop());

    var BrowserCreator = function BrowserCreator(topInstance) {
        Browser.prototype = Object.create(topInstance.Util.prototype);
        Browser.prototype.constructor = Browser;

        function Browser() {}

        Browser.detectBrowser = function () {
            var agent = navigator.userAgent.toLowerCase(),
                name = navigator.appName,
                browser = '';

            if (agent.indexOf('togate') > -1) {
                browser = 'togate';
            } else if (name === 'Microsoft Internet Explorer' || agent.indexOf('trident') > -1 || agent.indexOf('edge/') > -1) {
                browser = 'ie';
                if (name === 'Microsoft Internet Explorer') {
                    agent = /msie ([0-9]{1,}[\.0-9]{0,})/.exec(agent);
                    browser += parseInt(agent[1]);
                } else {
                    if (agent.indexOf('trident') > -1) {
                        browser += 11;
                    } else if (agent.indexOf('edge/') > -1) {
                        browser = 'edge';
                    }
                }
            } else if (agent.indexOf('safari') > -1) {
                if (agent.indexOf('opr') > -1) {
                    browser = 'opera';
                } else if (agent.indexOf('chrome') > -1) {
                    browser = 'chrome';
                } else if (agent.indexOf('crios') > -1) {
                    browser = 'crios';
                } else {
                    browser = 'safari';
                }
            } else if (agent.indexOf('firefox') > -1) {
                browser = 'firefox';
            }

            if (agent.indexOf('windows') > -1) {
                browser += ' windows';
            }
            if (agent.indexOf('linux') > -1) {
                browser += ' linux';
            }
            if (agent.indexOf('macintosh') > -1) {
                browser += ' macosx';
            }
            if (agent.indexOf('samsung') > -1) {
                browser += ' samsung';
            }
            if (agent.indexOf('ipad') > -1 || agent.indexOf('iphone') > -1) {
                browser += ' ios';
            }
            if (agent.indexOf('android') > -1) {
                browser += ' android';
            }
            if (agent.indexOf('mobile') > -1) {
                browser += ' mobile';
            }
            if (agent.indexOf('applewebkit') > -1) {
                browser += ' webkit';
            }

            if (agent.indexOf('kakaotalk') > -1) {
                browser += ' kakaotalk';
            }
            return browser;
        };

        Browser.isWindows = function () {
            return this.detectBrowser().indexOf('windows') > -1;
        };

        Browser.isLinux = function () {
            return this.detectBrowser().indexOf('linux') > -1;
        };

        Browser.isMacOSX = function () {
            return this.detectBrowser().indexOf('macosx') > -1;
        };

        Browser.isSamsung = function () {
            return this.detectBrowser().indexOf('samsung') > -1;
        };

        Browser.isOpera = function () {
            return this.detectBrowser().indexOf('opera') > -1;
        };

        Browser.isFirefox = function () {
            return this.detectBrowser().indexOf('firefox') > -1;
        };

        Browser.isSafari = function () {
            return this.detectBrowser().indexOf('safari') > -1;
        };

        Browser.isWebkit = function () {
            return this.detectBrowser().indexOf('webkit') > -1;
        };

        Browser.isIE = function () {
            return this.detectBrowser().indexOf('ie') > -1;
        };

        Browser.isEdge = function () {
            return this.detectBrowser().indexOf('edge') > -1;
        };

        Browser.isChrome = function () {
            return this.detectBrowser().indexOf('chrome') > -1 || this.detectBrowser().indexOf('crios') > -1;
        };

        Browser.isCriOS = function () {
            return this.detectBrowser().indexOf('crios') > -1;
        };

        Browser.isKakaotalk = function () {
            return this.detectBrowser().indexOf('kakaotalk') > -1;
        };

        Browser.isBlink = function () {
            return (this.isChrome() || this.isOpera()) && !!window.CSS;
        };

        Browser.isTogate = function () {
            return this.detectBrowser().indexOf('togate') > -1;
        };

        Browser.isIOS = function () {
            return this.detectBrowser().indexOf('ios') > -1;
        };

        Browser.isAndroid = function () {
            return this.detectBrowser().indexOf('android') > -1;
        };

        Browser.isMobile = function () {
            return this.detectBrowser().indexOf('mobile') > -1;
        };

        Browser.getIEVersion = function () {
            var word;

            var agent = navigator.userAgent.toLowerCase();

            if (navigator.appName == "Microsoft Internet Explorer") word = "msie ";else if (agent.search("trident") > -1) word = "trident/.*rv:";else if (agent.search("edge/") > -1) word = "edge/";else return 100;

            var reg = new RegExp(word + "([0-9]{1,})(\\.{0,}[0-9]{0,1})");

            if (reg.exec(agent) != null) return parseFloat(RegExp.$1 + RegExp.$2);

            return 100;
        };

        return Browser;
    };

    getTopUI().Util.Browser = BrowserCreator(getTopUI());
    getTop().Util.Browser = BrowserCreator(getTop());

    var DrawableManagerCreator = function DrawableManagerCreator(topInstance) {
        DrawableManager.prototype = Object.create(topInstance.prototype);
        DrawableManager.prototype.constructor = DrawableManager;

        function DrawableManager() {}

        DrawableManager.__map = {};

        DrawableManager.create = function (obj) {
            Object.assign(DrawableManager.__map, obj);
        };

        DrawableManager.get = function (id) {
            return DrawableManager.__map[id];
        };

        return DrawableManager;
    };

    getTopUI().DrawableManager = DrawableManagerCreator(getTopUI());
    getTop().DrawableManager = DrawableManagerCreator(getTop());

    var RawManagerCreator = function RawManagerCreator(topInstance) {
        RawManager.prototype = Object.create(topInstance.prototype);
        RawManager.prototype.constructor = RawManager;

        function RawManager() {}

        RawManager.__map = {};

        RawManager.create = function (obj) {
            var keys = Object.keys(obj);
            var newObj = {};
            for (var i = 0, len = keys.length; i < len; i++) {
                newObj[keys[i].split('.')[0]] = obj[keys[i]];
            }
            Object.assign(RawManager.__map, newObj);
        };

        RawManager.get = function (id) {
            return RawManager.__map[id];
        };

        return RawManager;
    };

    getTopUI().RawManager = RawManagerCreator(getTopUI());
    getTop().RawManager = RawManagerCreator(getTop());

    var ValuesManagerCreator = function ValuesManagerCreator(topInstance) {
        ValuesManager.prototype = Object.create(topInstance.prototype);
        ValuesManager.prototype.constructor = ValuesManager;

        function ValuesManager() {}

        ValuesManager.__map = {
            'strings': {},
            'colors': {},
            'dimens': {}
        };

        ValuesManager.create = function (type, obj) {
            Object.assign(ValuesManager.__map[type], obj);
        };

        ValuesManager.get = function (type, id) {
            return ValuesManager.__map[type][id];
        };

        return ValuesManager;
    };

    getTopUI().ValuesManager = ValuesManagerCreator(getTopUI());
    getTop().ValuesManager = ValuesManagerCreator(getTop());

    var EventManagerCreator = function EventManagerCreator(topInstance) {
        EventManager.prototype = Object.create(topInstance.prototype);
        EventManager.prototype.constructor = EventManager;
        EventManager.prototype.events = {};
        EventManager.prototype.eventList = {};
        EventManager.prototype.shortCut = false;

        function EventManager() {}

        EventManager.__getEvent = function (type, target) {
            var eventList = EventManager.prototype.eventList;
            if (target.topWidget) {
                return eventList[type].get(target.topWidget.getTemplate());
            } else {
                return eventList[type].get(target);
            }
        };

        EventManager.__findEvent = function (e, lastEventFlag) {
            var type = e.type;
            var target = e.target;
            var callback = EventManager.__getEvent(type, target);
            var event = $.extend({}, e);

            event.top_stop_propagation = false;
            event.stopPropagation = function () {
                this.top_stop_propagation = true;
            };

            if (lastEventFlag) {
                EventManager.lastEvent = target;
                lastEventFlag = false;
            }

            if (callback) {
                callback(event);
            }
            if (event.top_stop_propagation || !event.target || !event.target.tagName) {
                return;
            }

            if (event.path.length > 1) {
                event.target = event.path[1];
                event.path.shift();
            } else if (event.target.parentNode) {
                event.target = event.target.parentNode;
            }

            lastEventFlag = event.target.tagName && event.target.tagName.startsWith("TOP") && lastEventFlag === undefined ? true : lastEventFlag;
            EventManager.__findEvent(event, lastEventFlag);
        };

        EventManager.__findKeyEvent = function (e, lastEvent) {
            var type = e.type;
            var target = e.target;
            var callback = EventManager.__getEvent(type, target);
            var event = $.extend({}, e);

            if (!lastEvent && document.activeElement !== undefined && document.activeElement.tagName !== 'BODY') {
                lastEvent = EventManager.__findTopDom(document.activeElement);
            }

            if (lastEvent === undefined) {
                lastEvent = EventManager.lastEvent;
            }

            if (event.target.tagName === "BODY") {
                event.target = lastEvent;
            }

            event.top_stop_propagation = false;
            event.stopPropagation = function () {
                this.top_stop_propagation = true;
            };

            if (callback) {
                callback(event);
            }
            if (!lastEvent || event.top_stop_propagation) {
                return;
            }

            var dom = EventManager.__findTopDom(lastEvent.parentNode);
            if (dom === false) {
                return;
            }
            EventManager.__findKeyEvent(event, dom);
        };

        EventManager.on = function (event, element, callback) {
            var eventList = this.prototype.eventList;
            var callbackFunc = event.startsWith('key') ? this.__findKeyEvent : this.__findEvent;
            document.addEventListener(event, callbackFunc, { capture: true });

            eventList[event] = this.prototype.eventList[event] || new Map();
            eventList[event].set(element, callback);
        };

        EventManager.off = function (event, element) {
            var eventList = this.prototype.eventList;
            eventList[event].delete(element);

            if (eventList[event].size <= 0) {
                document.removeEventListener(event, null);
            }
        };

        EventManager.dispatchEvent = function (event, targetComponent) {
            Object.defineProperty(event, 'target', { writable: false, enumerable: true, value: targetComponent.getTopElement() });
            document.dispatchEvent(event);
        };

        EventManager.__findTopDom = function (dom) {
            if (!dom || !dom.tagName) {
                return false;
            }
            if (dom.tagName.startsWith('TOP')) {
                return dom;
            }
            return this.__findTopDom(dom.parentNode);
        };

        EventManager.addShortcut = function (key, callback) {
            if (this.prototype.shortCut === false) {
                this.__addEvent('keydown', null, true);
                this.prototype.shortCut = true;
            }
            var events = this.prototype.events;
            var keys = key.split('+');
            var new_key = new Array();
            for (var i = 0; i < keys.length; i++) {
                switch (keys[i].toLowerCase()) {
                    case 'ctrl':
                        new_key[0] = 'ctrl';
                        break;
                    case 'alt':
                        new_key[1] = 'alt';
                        break;
                    case 'shift':
                        new_key[2] = 'shift';
                        break;
                    default:
                        if (parseInt(keys[i].toLowerCase()) > 300) new_key[3] = parseInt(keys[i].toLowerCase());else new_key[3] = keys[i].toLowerCase();
                }
            }
            new_key = new_key.filter(Boolean).toString();
            events[new_key] = callback;
        };

        EventManager.__findShorcut = function (e) {
            var key_string = '';
            if (e.ctrlKey === true) {
                key_string += 'ctrl,';
            }
            if (e.altKey === true) {
                key_string += 'alt,';
            }
            if (e.shiftKey === true) {
                key_string += 'shift,';
            }
            if (e.keyCode > 47 && e.keyCode < 91) {
                key_string += String.fromCharCode(e.keyCode);
            } else {
                key_string += e.keyCode.toString();
            }
            key_string = key_string.toLowerCase();
            var events = EventManager.prototype.events;
            if (events[key_string] !== undefined) {
                var callback = events[key_string];
                callback(e);
            }
        };

        EventManager.__addEvent = function (type, callback, shortCut) {
            if (type.startsWith('key')) {
                if (shortCut === true) {
                    document.addEventListener(type, this.__findShorcut);
                } else {
                    document.addEventListener(type, this.__findKeyEvent);
                }
            } else document.addEventListener(type, this.__findEvent);
        };

        return EventManager;
    };

    getTopUI().EventManager = EventManagerCreator(getTopUI());
    getTop().EventManager = EventManagerCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopLayoutEditor = function (_React$Component) {
    _inherits(TopLayoutEditor, _React$Component);

    function TopLayoutEditor(props) {
        _classCallCheck(this, TopLayoutEditor);

        var _this = _possibleConstructorReturn(this, (TopLayoutEditor.__proto__ || Object.getPrototypeOf(TopLayoutEditor)).call(this, props));

        _this.state = {};
        for (var key in _this.props) {
            _this.state[key] = _this.props[key];
        }
        _this.layoutChild = [];
        getTopUI().Render.LayoutEditorDom = _this;
        return _this;
    }

    _createClass(TopLayoutEditor, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            if (this.getElement()) getTopUI().Render.setRootDocument(this.getElement());
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            if (this.getElement()) getTopUI().Render.setRootDocument(this.getElement());
        }
    }, {
        key: "getElement",
        value: function getElement() {
            if (ReactDOM.findDOMNode(this)) return ReactDOM.findDOMNode(this).parentNode;
            return null;
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            if (this.props.json) {
                return React.createElement(TopSrcComponent, { json: this.props.json, parent: this, _top: getTopUI() });
            }
            var children = React.Children.map(this.state.children, function (child, index) {
                return React.cloneElement(child, {
                    index: index,
                    layoutParent: _this2,
                    layoutFunction: function layoutFunction() {}
                });
            });
            return children;
        }
    }, {
        key: "addWidget",
        value: function addWidget(widget) {
            this.setState(function (state, props) {
                var changedchilds = [];
                Object.assign(changedchilds, state.children);
                if (widget.getReactElement()) {
                    changedchilds.push(widget.getReactElement());
                } else {
                    changedchilds.push(React.createElement(getTopUI().Render.topWidgets[widget.getTemplate().props.tagName], widget.getTemplate().state, widget.getTemplate().state.children));
                }
                return {
                    children: changedchilds
                };
            });
        }
    }]);

    return TopLayoutEditor;
}(React.Component);var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopApp = function (_React$Component) {
    _inherits(TopApp, _React$Component);

    function TopApp(props) {
        _classCallCheck(this, TopApp);

        var _this2 = _possibleConstructorReturn(this, (TopApp.__proto__ || Object.getPrototypeOf(TopApp)).call(this, props));

        _this2.state = {
            json: undefined,
            children: _this2.props.children,
            viewController: undefined
        };
        _this2.layoutChild = [];
        getTop().Render.AppDom = _this2;
        _this2.__initSrc();
        return _this2;
    }

    _createClass(TopApp, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.getElement()) getTop().Render.setRootDocument(this.getElement());
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            if (this.getElement()) getTop().Render.setRootDocument(this.getElement());
        }
    }, {
        key: 'getElement',
        value: function getElement() {
            if (ReactDOM.findDOMNode(this)) return ReactDOM.findDOMNode(this).parentNode;
            return null;
        }
    }, {
        key: '__initSrc',
        value: function __initSrc(path, callback) {
            var rootLayoutId = path || this.props.rootLayoutId;
            if (typeof rootLayoutId === 'string') {
                var _this = this;
                if (getTop().Util.getFileExtension(rootLayoutId) !== 'html' && getTop().Util.getFileExtension(rootLayoutId) !== 'json') rootLayoutId = rootLayoutId.concat('.json');
                getTop().Ajax.execute(rootLayoutId, {
                    success: function success(data, textStatus, jqXHR) {
                        var viewControllerPath = getTop().Util.__getViewControllerPath(data);
                        if (viewControllerPath) viewControllerPath = [getTop().Util.__getViewControllerPath(data)[0] + "?" + getTop().Util.guid()];
                        if (getTop().App.__useCommonLogic() === true && viewControllerPath !== undefined) {
                            var viewControllerName = getTop().Util.__getViewControllerName(data);
                            getTop().App.__loadViewControllerFile(viewControllerPath, function (_data) {
                                var fileExtension = getTop().Util.getFileExtension(jqXHR.responseURL);
                                _this.__onSuccessSrcLoad(_data, fileExtension, callback, viewControllerName, viewControllerPath);
                                _data = null;
                            }, data);
                        } else {
                            var fileExtension = getTop().Util.getFileExtension(jqXHR.responseURL);
                            _this.__onSuccessSrcLoad(data, fileExtension, callback);
                        }
                    },
                    complete: function complete() {
                        if (_this.__redrawChild !== undefined) {
                            for (var i = 0; i < _this.__redrawChild.length; i++) {
                                _this.__redrawChild[i]();
                            }
                        }
                    }
                });
            }
        }
    }, {
        key: '__onSuccessSrcLoad',
        value: function __onSuccessSrcLoad(data, fileExtension, callback, viewControllerData, viewControllerPathData) {
            if (fileExtension === 'json') {
                if (viewControllerData && viewControllerPathData) {
                    this.setState({
                        json: data,
                        viewController: viewControllerData,
                        viewControllerPath: viewControllerPathData
                    });
                } else {
                    this.setState({
                        json: data
                    });
                }
            } else {
                this.appendHtmlString(data);
            }
            if (typeof callback === 'function') callback();
        }
    }, {
        key: 'appendHtmlString',
        value: function appendHtmlString(htmlString) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = htmlString;
            var newChild = [];
            for (var i = 0; i < wrapper.children.length; i++) {
                newChild.push(this.initializeHtmlObjects(wrapper.children[i]));
            }
            this.setState(function (state, props) {
                return {
                    children: newChild
                };
            });
        }
    }, {
        key: 'initializeHtmlObjects',
        value: function initializeHtmlObjects(child) {
            var _this = this;
            var attrs = Array.prototype.slice.call(child.attributes);
            var props = {
                key: child.tagName.toUpperCase() + '-' + getTop().Render.top_index
            };
            getTop().Render.top_index++;

            attrs.map(function (attr) {
                return props[getTop().Util.toCamelCase(attr.name)] = attr.value;
            });

            if (!props.id) {
                props.id = getTop().Util.guid();
            }

            if (!!props.class) {
                props.className = props.class;
                delete props.class;
            }

            var children = [];
            for (var i = 0; i < child.children.length; i++) {
                children.push(this.initializeHtmlObjects(child.children[i]));
            }
            props.children = children;
            var comp = getTop().Render.topWidgets[child.tagName.toLowerCase()];

            return React.createElement(comp, props, children);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            if (this.state.json) {
                return React.createElement(TopSrcComponent, { json: this.state.json, parent: this, _top: getTop(), viewController: this.state.viewController, viewControllerPath: this.state.viewControllerPath });
            }
            var children = React.Children.map(this.state.children, function (child, index) {
                return React.cloneElement(child, {
                    index: index,
                    layoutParent: _this3,
                    layoutFunction: function layoutFunction() {}
                });
            });
            if (children) return children;else return null;
        }
    }]);

    return TopApp;
}(React.Component);var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopIconImage = function (_React$Component) {
	_inherits(TopIconImage, _React$Component);

	function TopIconImage(props) {
		_classCallCheck(this, TopIconImage);

		return _possibleConstructorReturn(this, (TopIconImage.__proto__ || Object.getPrototypeOf(TopIconImage)).call(this, props));
	}

	_createClass(TopIconImage, [{
		key: 'render',
		value: function render() {
			var iconClass = classNames('top-icon-image', this.__isTopIcon() ? this.props.icon : '');

			return React.createElement('i', { style: this.props.style, className: iconClass });
		}
	}, {
		key: '__isTopIcon',
		value: function __isTopIcon() {
			var topIconList = ['icon-apply', 'icon-arrow_potab_down', 'icon-close_window', 'icon-h_window', 'icon-question', 'icon-bell', 'icon-info', 'icon-circle_check', 'icon-circle', 'icon-monitoring', 'icon-arrow_down', 'icon-arrow_up', 'icon-arrow_left', 'icon-arrow_right', 'icon-expert', 'icon-db_connection', 'icon-setting', 'icon-arrow_filled_down', 'icon-arrow_filled_left', 'icon-arrow_filled_right', 'icon-arrow_filled_up', 'icon-arrow_thin_first', 'icon-arrow_thin_last', 'icon-arrows_left', 'icon-arrows_left_thin', 'icon-arrows_right', 'icon-arrows_right_thin', 'icon-check', 'icon-file', 'icon-folder2', 'icon-lock', 'icon-unlock', 'icon-radio_button', 'icon-radio_button_sel', 'icon-search', 'icon-square', 'icon-square_check', 'icon-square_line', 'icon-handler', 'icon-hamburger_menu2', 'icon-database', 'icon-ellipsis', 'icon-horizontal_line', 'icon-lock_standby_last', 'icon-lock_standby', 'icon-lock_arrow', 'icon-refresh', 'icon-Critical', 'icon-fatal', 'icon-menu_list', 'icon-menu_card', 'icon-command2', 'icon-desktop', 'icon-refresh2', 'icon-info2', 'icon-inventory2', 'icon-notebook', 'icon-horizontal_line_bold', 'icon-topology_i_webtob', 'icon-topology_application', 'icon-topology_cds', 'icon-topology_container', 'icon-topology_coreswitch', 'icon-topology_edgeswitch', 'icon-topology_externalgateway', 'icon-topology_generalhost', 'icon-topology_generalhost2', 'icon-minimap', 'icon-camera', 'icon-topology', 'icon-topology_jeus', 'icon-topology_masterhost', 'icon-topology_po', 'icon-topology_service', 'icon-n_window', 'icon-topology_servicegroup', 'icon-topology_tibero', 'icon-topology_web2b', 'icon-tree', 'icon-v_window', 'icon-tree_menu', 'icon-administrator_02', 'icon-bookmark', 'icon-won', 'icon-won-line', 'icon-won_shape', 'icon-zoom_in', 'icon-zoom_out', 'icon-accordion_select', 'icon-accordion_unselect', 'icon-add', 'icon-administrator', 'icon-card', 'icon-time', 'icon-line', 'icon-confirm', 'icon-cloud_bad', 'icon-arrow_potab_up', 'icon-calendar1', 'icon-canceled', 'icon-cart', 'icon-chart_defined', 'icon-chart_error', 'icon-chart_failed', 'icon-chart_running', 'icon-chart_stop', 'icon-chart_terminating', 'icon-cloud_good', 'icon-download_xml', 'icon-chart_waiting', 'icon-clone', 'icon-cloud_logo', 'icon-expand', 'icon-copy', 'icon-cpu', 'icon-delete', 'icon-deploy', 'icon-dollar', 'icon-extract', 'icon-edit', 'icon-fit_round', 'icon-fold_btn', 'icon-info_02', 'icon-message', 'icon-ellipsis_vertical_big', 'icon-ellipsis_vertical_small', 'icon-fit', 'icon-message_02', 'icon-fold', 'icon-lnb_appframework', 'icon-lnb_backup', 'icon-lnb_cds', 'icon-lnb_container', 'icon-lnb_dashboard', 'icon-lnb_database', 'icon-lnb_filesystem', 'icon-lnb_metereing', 'icon-lnb_network', 'icon-loading', 'icon-loading_narrow', 'icon-memory', 'icon-analysis', 'icon-minus_round_square', 'icon-minus_square', 'icon-minus_thick', 'icon-minus_thin', 'icon-play_pause', 'icon-play_resume', 'icon-play_stop', 'icon-circle_save', 'icon-plus_round_square', 'icon-plus_square', 'icon-plus_thick', 'icon-plus_thin', 'icon-project', 'icon-service', 'icon-topology_i_application', 'icon-topology_i_container', 'icon-topology_i_coreswitch', 'icon-topology_i_edgeswitch', 'icon-topology_i_externalgateway', 'icon-topology_i_generalhost', 'icon-topology_i_generalhost2', 'icon-topology_i_jeus', 'icon-topology_i_masterhost', 'icon-topology_i_po', 'icon-topology_i_service', 'icon-topology_i_servicegroup', 'icon-topology_i_tibero', 'icon-circle_search', 'icon-move', 'icon-circle_move', 'icon-circle_question', 'icon-4', 'icon-5', 'icon-1', 'icon-2', 'icon-3', 'icon-question_02', 'icon-recommend', 'icon-speaker', 'icon-unfold', 'icon-upload_xml', 'icon-topology_backhend', 'icon-topology_server', 'icon-close', 'icon-accordion_action', 'icon-minus_shape', 'icon-plus_shape', 'icon-0', 'icon-9', 'icon-6', 'icon-7', 'icon-8', 'icon-topology_autoscalling', 'icon-topology_i_server', 'icon-topology_rmiserver', 'icon-topology_webserver', 'icon-topology_messagequeue', 'icon-topology_httpserver', 'icon-topology_database', 'icon-topology_i_backhend', 'icon-topology_linenfill', 'icon-chart_bar2', 'icon-topology_line', 'icon-ofmanager', 'icon-csp', 'icon-topology_i_router', 'icon-topology_i_computingnode', 'icon-topology_i_storagenode', 'icon-collapse_all', 'icon-expand_all', 'icon-redo', 'icon-undo', 'icon-topology_router', 'icon-topology_storagenode', 'icon-topology_computingnode', 'icon-infrastructure', 'icon-bigdata', 'icon-development', 'icon-mainframe_to_cloud', 'icon-middleware', 'icon-cloud_management', 'icon-communication_group', 'icon-sorting', 'icon-storage_db', 'icon-storage_file', 'icon-star', 'icon-tenant', 'icon-ip', 'icon-download', 'icon-shared', 'icon-ordering', 'icon-read', 'icon-unread', 'icon-reply', 'icon-apply2', 'icon-extract2', 'icon-add2', 'icon-detail', 'icon-arrows_up', 'icon-arrows_down', 'icon-arrow_num_filled_down', 'icon-arrow_num_filled_up', 'icon-command', 'icon-eventhistory', 'icon-inventory', 'icon-policy', 'icon-prozone_arrow_down_circleline', 'icon-prozone_arrow_right2', 'icon-prozone_arrow_up_circleline', 'icon-prozone_bell', 'icon-prozone_critical', 'icon-prozone_disk', 'icon-prozone_file', 'icon-prozone_inactive_circle', 'icon-start', 'icon-tcc_help', 'icon-prozone_member', 'icon-prozone_time', 'icon-prozone_total', 'icon-storage_block', 'icon-storage_object', 'icon-switch', 'icon-template', 'icon-application', 'icon-cds_square_check_line', 'icon-compute', 'icon-controller', 'icon-dns', 'icon-groupmapping', 'icon-image', 'icon-pronet_coreswitch', 'icon-pronet_edgeswitch', 'icon-prozone_delete', 'icon-prozone_header_arrow_left', 'icon-prozone_start', 'icon-rulegroup', 'icon-snapshot', 'icon-storage', 'icon-attach', 'icon-prozone_arrow_left', 'icon-prozone_arrow_right', 'icon-prozone_recommend', 'icon-prozone_tenant', 'icon-node', 'icon-resource', 'icon-rule', 'icon-server', 'icon-server2', 'icon-session', 'icon-setting2', 'icon-prozone_paasta', 'icon-layout_07', 'icon-layout_08', 'icon-layout_09', 'icon-master', 'icon-monitoring_2', 'icon-chart_pie', 'icon-chart_scatter', 'icon-chart_scatter2', 'icon-chart_stackedcolumn', 'icon-chart_table', 'icon-chart_table2', 'icon-clock', 'icon-cluster', 'icon-folder', 'icon-layout_01', 'icon-layout_02', 'icon-layout_03', 'icon-layout_04', 'icon-layout_05', 'icon-layout_06', 'icon-chart_heatmap', 'icon-chart_line', 'icon-chart_line2', 'icon-chart_line3', 'icon-prozone_cdsmaster', 'icon-prozone_close', 'icon-prozone_dbmanagement', 'icon-prozone_Inframanagement', 'icon-prozone_paas', 'icon-prozone_wasmanagement', 'icon-calendar2', 'icon-chart_area', 'icon-chart_area1', 'icon-chart_area2', 'icon-chart_area3', 'icon-chart_bar', 'icon-chart_bar-line', 'icon-chart_bar-line2', 'icon-chart_donut', 'icon-cds_desktop', 'icon-cds_pool', 'icon-check_all', 'icon-disconnect', 'icon-download2', 'icon-lm_job', 'icon-lm_provisioning', 'icon-paas_product_cluster', 'icon-prozone_date', 'icon-uncheck_all', 'icon-upload', 'icon-prozone_manual', 'icon-chart_pie2', 'icon-gpu', 'icon-prozone_info_circleline', 'icon-prozone_warmevent', 'icon-ic_software', 'icon-lm_machine', 'icon-ic_password_hide', 'icon-ic_password_show', 'icon-prozone_edit', 'icon-prozone_acl', 'icon-lms_issue_license', 'icon-work_add', 'icon-work_add_people', 'icon-work_bookmark', 'icon-work_box', 'icon-work_calendar', 'icon-work_cancel', 'icon-work_check', 'icon-work_close', 'icon-work_commat', 'icon-work_comment', 'icon-work_dashboard', 'icon-work_delete', 'icon-work_document', 'icon-work_download', 'icon-work_edit', 'icon-work_email', 'icon-work_exit', 'icon-work_explain', 'icon-work_filter1', 'icon-work_folder', 'icon-work_format_list', 'icon-work_home', 'icon-work_horizon', 'icon-work_img_file', 'icon-work_important', 'icon-work_info', 'icon-filter', 'icon-filter_setting', 'icon-pin', 'icon-work_like', 'icon-work_lock', 'icon-work_menu', 'icon-work_mobile', 'icon-work_next', 'icon-work_noti_off', 'icon-work_noti_on', 'icon-work_office', 'icon-work_open', 'icon-work_people', 'icon-work_person', 'icon-work_phone', 'icon-work_pin', 'icon-work_previous', 'icon-work_search', 'icon-work_send', 'icon-work_settings', 'icon-work_share', 'icon-work_smile', 'icon-work_sorting_down', 'icon-work_sorting_up', 'icon-work_star', 'icon-work_tocell', 'icon-work_topoint', 'icon-work_toword', 'icon-work_vertical', 'icon-work_video', 'icon-work_video_file', 'icon-work_view1', 'icon-work_window1', 'icon-palette_absolutelayout', 'icon-palette_alarmbadge', 'icon-palette_breadcrumb', 'icon-palette_button', 'icon-palette_chart', 'icon-palette_checkbox', 'icon-palette_chip', 'icon-palette_colorpicker', 'icon-palette_customwidgetholder', 'icon-palette_dashboard', 'icon-palette_datepicker1', 'icon-palette_foldinglayout', 'icon-palette_framelayout', 'icon-palette_gridlayout', 'icon-palette_htmleditor1', 'icon-palette_icon', 'icon-palette_imagebutton', 'icon-palette_imageview', 'icon-palette_include', 'icon-palette_linearlayout', 'icon-palette_listview', 'icon-palette_menuholder', 'icon-palette_pagination', 'icon-palette_panel', 'icon-palette_progressbar', 'icon-palette_radiobutton', 'icon-palette_selectbox', 'icon-palette_slider', 'icon-palette_spinner', 'icon-palette_splitterlayout', 'icon-palette_stepper', 'icon-palette_switch', 'icon-palette_tablayout', 'icon-palette_tableview', 'icon-palette_textarea', 'icon-palette_textfield', 'icon-palette_textview', 'icon-palette_treeview', 'icon-window_maximum', 'icon-window_original', 'icon-work_attachfile', 'icon-work_calendar_add', 'icon-work_calendar_start', 'icon-work_checklist', 'icon-work_color', 'icon-work_company1', 'icon-work_complete_state', 'icon-work_crown', 'icon-work_exchange', 'icon-work_expand', 'icon-work_filter', 'icon-work_folder_add', 'icon-work_folder_del', 'icon-work_location', 'icon-work_maximum', 'icon-work_minimum', 'icon-work_module', 'icon-work_notebook', 'icon-work_pdf', 'icon-work_save', 'icon-work_stack', 'icon-work_tag', 'icon-work_tag_add', 'icon-work_top', 'icon-work_view', 'icon-work_window', 'icon-work_window_h', 'icon-work_zip', 'icon-work_note', 'icon-work_schedule', 'icon-work_conference_share', 'icon-work_conference_tmaxcloud', 'icon-work_mic_off1', 'icon-work_mic_on', 'icon-work_video_off1', 'icon-work_volume_01', 'icon-work_volume_02', 'icon-work_volume_03', 'icon-work_calendar_end', 'icon-work_company', 'icon-work_emoji_1', 'icon-work_emoji_2', 'icon-work_emoji_3', 'icon-work_help1', 'icon-work_notice', 'icon-work_private1', 'icon-work_recent', 'icon-work_tconference', 'icon-work_tphone', 'icon-work_tstudy', 'icon-calendar', 'icon-palette_accordionlayout', 'icon-palette_codeditor', 'icon-palette_datepicker', 'icon-palette_flowlayout', 'icon-palette_htmleditor', 'icon-palette_videoview', 'icon-palette_webview', 'icon-work_conference_fit', 'icon-work_conference_reduction', 'icon-work_addressbook', 'icon-work_folder_file_location', 'icon-work_mic_off', 'icon-work_restartsvg', 'icon-work_video_off', 'icon-work_view_3panel', 'icon-work_help', 'icon-work_quick', 'icon-cloud_cluster_group', 'icon-cloud_db', 'icon-cloud_domain', 'icon-hyper_bar_chart', 'icon-hyper_boxplot', 'icon-hyper_bubble_chart', 'icon-hyper_converge_gateway', 'icon-hyper_data_manipulation', 'icon-hyper_data_object', 'icon-hyper_data_prep', 'icon-hyper_data_source', 'icon-hyper_data_table', 'icon-hyper_datajob', 'icon-hyper_diverge_gateway', 'icon-hyper_histogtam', 'icon-hyper_line_chart', 'icon-hyper_machine_learning', 'icon-hyper_panmode', 'icon-hyper_pie_chart', 'icon-hyper_scatterplot', 'icon-hyper_servicejob', 'icon-hyper_SQLquery', 'icon-hyper_stream_object', 'icon-hyper_timeout', 'icon-hyper_timer', 'icon-hyper_user_defined', 'icon-hyper_validation', 'icon-hyper_virtual_model', 'icon-hyper_virtual_table', 'icon-hyper_zoom_actual', 'icon-hyper_zoom_fit', 'icon-hyper_zoomin', 'icon-hyper_zoomout', 'icon-work_align_bottom', 'icon-work_align_left', 'icon-work_align_middle', 'icon-work_align_right', 'icon-work_align_top', 'icon-work_chart', 'icon-work_collapse', 'icon-work_double_arrow', 'icon-work_menu_hide', 'icon-work_menu_open', 'icon-work_noti_fail', 'icon-work_noti_info', 'icon-work_noti_warning', 'icon-work_number', 'icon-work_picture', 'icon-work_private', 'icon-work_redo', 'icon-work_run', 'icon-work_stop', 'icon-work_table', 'icon-work_text', 'icon-work_time', 'icon-work_tmaxcloudspace', 'icon-work_txt', 'icon-work_undo', 'icon-work_web', 'icon-work_app_ic_tconference', 'icon-work_app_ic_tdrive', 'icon-work_app_ic_tmail1', 'icon-work_app_ic_tnote', 'icon-work_app_ic_tschedule', 'icon-work_app_ic_ttalk', 'icon-work_app_ic_ttask', 'icon-work_folder_locationsvg', 'icon-soft_both', 'icon-soft_dev', 'icon-soft_inbound', 'icon-soft_ops', 'icon-soft_outbound', 'icon-cloud_mapping', 'icon-cloud_switch', 'icon-lnb_customer', 'icon-lnb_host', 'icon-lnb_import', 'icon-lnb_partner', 'icon-lnb_pipeline', 'icon-lnb_virtualmachine', 'icon-work_app_ic_add', 'icon-work_app_ic_cloudoffice', 'icon-work_app_ic_dashboard', 'icon-soft_keyboard', 'icon-work_app_ic_hyperstudio', 'icon-work_app_ic_tmail', 'icon-work_camera', 'icon-work_cloudmeeting_leader', 'icon-work_file_error', 'icon-work_tuser', 'icon-work_window_division1', 'icon-work_window_division2', 'icon-work_window', 'icon-work_app_ic_hypercloud', 'icon-work_admin_authority', 'icon-work_admin_data', 'icon-work_admin_fee', 'icon-work_admin_log', 'icon-work_admin_notice', 'icon-work_admin_security', 'icon-work_admin_service', 'icon-work_admin_setting_company', 'icon-work_admin_statistics', 'icon-soft_chart_bar', 'icon-soft_chart_graph', 'icon-cloud_admin_administrator', 'icon-cloud_admin_flag', 'icon-cloud_admin_mountainflag', 'icon-cloud_admin_vhost', 'icon-cloud_endpoint', 'icon-work_new-window', 'icon-work_copy', 'icon-work_cutting', 'icon-work_paste'];
			document.abc = topIconList.slice();

			return topIconList.includes(this.props.icon) ? true : false;
		}
	}]);

	return TopIconImage;
}(React.Component);var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function TopSrcComponent(props) {

    function appendJson(json) {
        if (typeof json === 'string') var jsonObj = JSON.parse(json);else if ((typeof json === 'undefined' ? 'undefined' : _typeof(json)) === 'object') var jsonObj = json;else return null;
        var newChild = [];
        if (jsonObj.rootLayout) for (var i = 0; i < jsonObj.rootLayout.length; i++) {
            newChild.push(initializeJsonObjects(jsonObj.rootLayout[i], true, i));
        } else for (var i = 0; i < jsonObj.length; i++) {
            newChild.push(initializeJsonObjects(jsonObj[i], true, i));
        }
        props.parent.state.children = newChild;
        return newChild;
    }

    function initializeJsonObjects(child, isRoot, index) {
        var _this = this;
        var attrs = Object.keys(child);
        var newprops = {
            key: 'TOP-' + child.nodeType.toUpperCase() + '-' + props._top.Render.top_index
        };
        if (isRoot) {
            newprops.index = index;
            newprops.layoutParent = props.parent;
            newprops.layoutFunction = props.layoutFunction;
            newprops.viewController = props.viewController;
            newprops.viewControllerPath = props.viewControllerPath;
        }
        props._top.Render.top_index++;

        for (var i = 0; i < attrs.length; i++) {
            newprops[attrs[i]] = child[attrs[i]];
        }

        if (!newprops.id) {
            newprops.id = props._top.Util.guid();
        }

        if (!!newprops.class) {
            newprops.className = newprops.class;
            delete newprops.class;
        }

        var children = [];
        if (child.children) for (var i = 0; i < child.children.length; i++) {
            children.push(initializeJsonObjects(child.children[i]));
        }
        newprops.children = children;
        var comp = props._top.Render.topWidgets['top-' + child.nodeType.toLowerCase()];

        return React.createElement(comp, newprops, children);
    }

    return appendJson(props.json);
}function WidgetNameBlock(props) {

    function renderTextBlock(props) {
        var wrapperStyle = {
            display: 'flex',
            width: '100%',
            height: '100%'
        };
        var dashboardTextStyle = {
            fontSize: 'large',
            margin: 'auto'
        };
        return React.createElement(
            'div',
            { style: wrapperStyle },
            React.createElement(
                'span',
                { style: dashboardTextStyle },
                props.widgetName
            )
        );
    }

    return renderTextBlock(props);
}var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopWidgetBehavior = function (_React$Component) {
    _inherits(TopWidgetBehavior, _React$Component);

    function TopWidgetBehavior(props) {
        _classCallCheck(this, TopWidgetBehavior);

        var _this2 = _possibleConstructorReturn(this, (TopWidgetBehavior.__proto__ || Object.getPrototypeOf(TopWidgetBehavior)).call(this, props));

        _this2.initTop();
        _this2.initState();
        _this2.initParent();
        _this2.topClassList = [];
        _this2.userClassList = [];
        _this2.userClassList = _this2._top.Util.__classStringToClassList(_this2.state.class, _this2.userClassList);
        _this2.__initialClassname();
        _this2.setPropertiesCallback = [];
        return _this2;
    }

    _createClass(TopWidgetBehavior, [{
        key: 'initTop',
        value: function initTop() {
            if (getTop().Render.topWidgets[this.props.tagName] && this instanceof getTop().Render.topWidgets[this.props.tagName] === true) {
                this._top = getTop();
            } else if (getTopUI().Render.topWidgets[this.props.tagName] && this instanceof getTopUI().Render.topWidgets[this.props.tagName] === true) {
                this._top = getTopUI();
            } else console.error('widget does not exist');
        }
    }, {
        key: 'initState',
        value: function initState() {
            this.state = this._top.Util.__setDefaultProperties(this.props, this._top.Util.__getPropConfigs(this));
            this.state = this._top.Util.__convertProperties(this.state, this._top.Util.__getPropConfigs(this), this);
        }
    }, {
        key: 'initParent',
        value: function initParent() {
            if (this.props.layoutParent && this.props.layoutParent instanceof TopLayoutBehavior) {
                if (this.props.layoutParent.layoutChild.length <= this.props.index) this.props.layoutParent.layoutChild.push(this);else {
                    this.props.layoutParent.layoutChild.splice(this.props.index, 0, this);
                }
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            console.debug('Unmount', this.props.id);
            if (this.props.layoutParent && this.props.layoutParent instanceof TopLayoutBehavior) {
                if (this.props.layoutParent.layoutChild.indexOf(this) >= 0) this.props.layoutParent.layoutChild.splice(this.props.layoutParent.layoutChild.indexOf(this), 1);
            }
        }
    }, {
        key: '__updateProperties',
        value: function __updateProperties(properties) {
            this.__updatePropertiesImpl(this._top.Util.__convertProperties(properties, this._top.Util.__getPropConfigs(this), this));
        }
    }, {
        key: '__updatePropertiesImpl',
        value: function __updatePropertiesImpl(properties) {
            var _this = this;
            var keys = Object.keys(properties);
            for (var i = 0, len = keys.length; i < len; i++) {
                if (!this.isStateDifferent(keys[i], properties)) continue;
                (function (j) {
                    var funcName = '__update' + _this._top.Util.capitalizeFirstLetter(keys[j]);
                    if (typeof _this[funcName] === 'function') {
                        _this.setPropertiesCallback.push(function () {
                            _this[funcName]();
                        });
                    } else if (_this._top.Util.__isStyleProperty(keys[j])) {
                        _this.setPropertiesCallback.push(function () {
                            _this.updateStyle(keys[j]);
                        });
                    } else if (keys[j].startsWith('on')) {
                        _this.__addEventByAttr(_this._top.Util.decapitalizeFirstLetter(keys[j].substring(2, keys[j].length)));
                    }
                })(i);
            }
            this.setState(function (state, props) {
                var newState = {};
                Object.assign(newState, state);
                for (var i = 0; i < keys.length; i++) {
                    newState[keys[i]] = properties[keys[i]];
                }
                return newState;
            });
        }
    }, {
        key: 'addClassToTopClassList',
        value: function addClassToTopClassList(className) {
            if (!this.topClassList.includes(className)) {
                this.topClassList.push(className);
            }
        }
    }, {
        key: 'removeClassFromTopClassList',
        value: function removeClassFromTopClassList(className) {
            while (this.topClassList.includes(className)) {
                var index = this.topClassList.indexOf(className);
                this.topClassList.splice(index, 1);
            }
        }
    }, {
        key: 'makeTopTagClassString',
        value: function makeTopTagClassString() {
            var string = this._top.Util.__classListToClassString(this.userClassList);
            var _this = this;
            this.topClassList.forEach(function (c) {
                if (!_this.userClassList.includes(c)) string = string + ' ' + c;
            });
            return string.trim();
        }
    }, {
        key: '__initialClassname',
        value: function __initialClassname() {}
    }, {
        key: '__updateClass',
        value: function __updateClass() {
            this.userClassList = [];
            this.userClassList = this._top.Util.__classStringToClassList(this.state.class, this.userClassList);
            this.__initialClassname();
        }
    }, {
        key: 'getLayoutParent',
        value: function getLayoutParent() {
            return this.state.layoutParent;
        }
    }]);

    return TopWidgetBehavior;
}(React.Component);

TopWidgetBehavior.propConfigs = {
    id: {
        type: String
    },

    class: {
        type: String,
        aliases: ['className']
    }
};

TopWidgetBehavior.defaultProps = {};

(function () {

    var WidgetCreator = function WidgetCreator(topInstance) {
        Widget.prototype = Object.create(topInstance.prototype);
        Widget.prototype.constructor = Widget;

        function Widget(element, props, childs) {
            if (element) var reactElement = element.props.layoutParent.state.children[element.props.index];else props.dynamicWidget = this;
            var template = element;
            this.setReactElement = function (element) {
                reactElement = element;
            };

            this.getReactElement = function () {
                return reactElement;
            };

            this.setTemplate = function (_template) {
                template = _template;
            };

            this.getTemplate = function () {
                return template;
            };
        }

        Widget.prototype.APIcall = function (funcName) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            if (this.getTemplate() === undefined) {
                this.getElement().onAttach.push(function () {
                    this.getTemplate()[funcName].call(this.getTemplate(), args);
                });
                return undefined;
            } else {
                return this.getTemplate().func;
            }
        };

        Widget.create = function (tagName, props, childs, __element) {
            var type = this.getType(tagName);
            var parentType = this.getParentType(type);
            if (parentType !== null) {
                var creator = this[parentType][type];
            } else {
                var creator = this[type];
            }

            if (typeof creator === 'function') {
                if (!props) {
                    props = { id: topInstance.Util.guid() };
                } else if (!props.id) {
                    props.id = topInstance.Util.guid();
                }
                if (__element && __element.key) props.key = __element.key;else props.key = tagName.toUpperCase() + '-' + topInstance.Render.top_index;
                topInstance.Render.top_index++;
                if (childs === undefined) {
                    props['children'] = [];
                    childs = [];
                }
                var widget = creator.create(__element, props, childs);
            } else {
                var customType = topInstance.Util.capitalizeFirstLetter(topInstance.Util.toCamelCase(tagName));
                if (this[customType] !== undefined) {
                    var widget = this[customType].create(__element);
                } else {
                    console.error('Type error: ' + tagName + ' is not defined.');
                    return undefined;
                }
            }
            return widget;
        };

        Widget.getType = function (tagName) {
            if (topInstance.Render.topWidgets[tagName] === undefined) {
                return null;
            } else if (tagName === 'top-graph-navigator') {
                return 'GraphNavigator';
            } else if (topInstance.Render.topWidgets[tagName].isCustomType) {
                return topInstance.Util.capitalizeFirstLetter(topInstance.Util.toCamelCase(tagName));
            } else if (tagName.startsWith('top-')) {
                return topInstance.Util.capitalizeFirstLetter(tagName.split('-')[1]);
            } else {
                return null;
            }
        };

        Widget.getParentType = function (type) {
            var layouts = ['Absolutelayout', 'Linearlayout', 'Framelayout', 'Docklayout', 'Gridlayout', 'Tablayout', 'Scrolllayout', 'Form', 'Foldinglayout', 'Layout', 'Splitterlayout', 'Flowlayout', 'Page', 'Panel'];
            var containers = ['Listview', 'Tableview', 'Selectbox', 'Treeview', 'Accordionlayout'];
            var menu = ['Contextmenu'];
            if (layouts.includes(type)) {
                return 'Layout';
            } else if (containers.includes(type)) {
                return 'Container';
            } else if (menu.includes(type)) {
                return 'Menu';
            } else {
                return null;
            }
        };

        Widget.prototype.setProperties = function (properties) {
            if (this.getTemplate()) this.getTemplate().__updateProperties(properties);
            var element = this.getReactElement();
            if (element) {
                this.setReactElement(React.cloneElement(element, topInstance.Util.__convertProperties(properties, topInstance.Util.__getPropConfigs(element), element)));
            }
        };

        Widget.prototype.getLayoutParent = function () {
            return this.getTemplate().getLayoutParent();
        };

        Widget.prototype.getParent = function () {
            return this.getLayoutParent().dom.top.topWidget;
        };

        Widget.prototype.isAttached = function () {
            if (this.getTemplate() && this.getTemplate().__isAttached === true) return true;
            return false;
        };

        Widget.prototype.getElementForSize = function () {
            return this.getTemplate().getElementForSize();
        };

        Widget.prototype.getProperties = function (key) {
            if (key === undefined) {
                return Object.assign({}, this.getTemplate().state);
            }
            if (key.includes('-')) {
                key = key.replace(/-([a-z])/g, function (g) {
                    return g[1].toUpperCase();
                });
            }
            if (!this.getTemplate()) return undefined;
            if (key === 'data' && this.getTemplate().props.tagName === 'top-tableview') return this.getItems();

            if (this.getTemplate().state[key] !== undefined) return this.getTemplate().state[key];else return undefined;
        };

        return Widget;
    };

    getTopUI().Widget = WidgetCreator(getTopUI());
    getTop().Widget = WidgetCreator(getTop());
})();var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopElementBehavior = function (_TopWidgetBehavior) {
    _inherits(TopElementBehavior, _TopWidgetBehavior);

    function TopElementBehavior(props) {
        _classCallCheck(this, TopElementBehavior);

        var _this = _possibleConstructorReturn(this, (TopElementBehavior.__proto__ || Object.getPrototypeOf(TopElementBehavior)).call(this, props));

        _this.dom = {};
        _this.initDomRef();
        _this.initializeViewController();
        return _this;
    }

    _createClass(TopElementBehavior, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            console.debug('mount', this.props.id);
            this.__isAttached = true;
            if (typeof this.__layoutAttached === 'function') this.__layoutAttached();
            this.__componentDidMount();
            if (typeof this.state.onAttached === 'function') this.state.onAttached();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _get(TopElementBehavior.prototype.__proto__ || Object.getPrototypeOf(TopElementBehavior.prototype), 'componentWillUnmount', this).call(this);
            this.__isAttached = false;
            this.__componentWillUnmount();
            this.unMountViewController();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            if (this.getLayoutParent()) {
                if (this.getLayoutParent().shouldComplete) {
                    this.getLayoutParent().complete();
                    this.getLayoutParent().shouldComplete = false;
                }
            }
            this.__componentDidUpdate();
            console.debug('Update', this.props.id);
        }
    }, {
        key: 'isStateDifferent',
        value: function isStateDifferent(key, nextState) {
            if (_typeof(this.state[key]) === 'object' && _typeof(nextState[key]) === 'object') {
                if (!objectCompare(this.state[key], nextState[key])) {
                    console.debug('shouldUpdate', this.props.id);
                    return true;
                }
            } else if (this.state[key] !== nextState[key]) {
                console.debug('shouldUpdate', this.props.id);
                return true;
            }

            function objectCompare(obj1, obj2) {
                try {
                    return JSON.stringify(obj1) === JSON.stringify(obj2);
                } catch (e) {
                    return obj1 === obj2;
                }
            }
            return false;
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            for (var key in nextState) {
                if (this.isStateDifferent(key, nextState)) {
                    return true;
                }
            }
            return false;
        }
    }, {
        key: 'getTopElement',
        value: function getTopElement() {
            return this.dom.top;
        }
    }, {
        key: 'getElement',
        value: function getElement() {
            return this.dom.root;
        }
    }, {
        key: 'getElementForSize',
        value: function getElementForSize() {
            return this.getElement();
        }
    }, {
        key: 'initDomRef',
        value: function initDomRef() {
            var _this2 = this;

            this.dom.top = null;
            this.setTopRef = function (element) {
                _this2.dom.top = element;
                if (element) if (_this2.props.dynamicWidget) {
                    _this2.dom.top.topWidget = _this2.props.dynamicWidget;
                    _this2.dom.top.topWidget.setTemplate(_this2);
                } else {
                    _this2.dom.top.topWidget = _this2._top.Widget.create(_this2.props.tagName, undefined, undefined, _this2);
                }
            };
            this.__initDomRef();
        }
    }, {
        key: 'initializeViewController',
        value: function initializeViewController() {
            var viewController;
            if (this.state.viewController) {
                viewController = this._top.ViewController.__map[this.state.viewController];
                if (viewController && !viewController.__loaded) {
                    viewController.__setBoundWidget(this);
                }
            }
        }
    }, {
        key: 'unMountViewController',
        value: function unMountViewController() {
            if (this.state.viewController && this._top.ViewController.__map[this.state.viewController] && this._top.ViewController.__map[this.state.viewController].__loaded && this._top.Util.__searchViewController(this)) {
                var parentViewController = this._top.Util.__searchViewController(this).__parent ? this._top.Util.__searchViewController(this).__parent : undefined;
                var viewController = this.state.viewController;
                var viewControllerPath = this.props.viewControllerPath;
                if (viewController !== undefined && this._top.ViewController.__map[parentViewController] !== undefined && this._top.ViewController.__map[parentViewController] !== undefined) {
                    this._top.ViewController.__map[parentViewController].__children.delete(viewController);
                }
                if (viewController !== undefined && viewControllerPath !== undefined && this._top.App.__externalScriptList && this._top.App.__externalScriptList.has(viewControllerPath[0])) {
                    this._top.App.__externalScriptList.delete(viewControllerPath);
                    var script = document.getElementById(viewControllerPath);
                    document.head.removeChild(script);
                    this._top.ViewController.__map[viewController].__loaded = false;
                    delete this._top.ViewController.__map[viewController];
                }
            }
        }
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this3 = this;

            this.dom.root = null;
            this.setRootRef = function (element) {
                _this3.dom.root = element;
            };
        }
    }, {
        key: 'render',
        value: function render() {
            console.debug('render', this.props.id);
            if (this.reRenderFlag) {
                this.__componentWillUpdate();
            }
            this.reRenderFlag = true;
            for (var i = 0; i < this.setPropertiesCallback.length; i++) {
                this.setPropertiesCallback[i]();
            }this.setPropertiesCallback = [];
            if (typeof this.props.layoutFunction === 'function') this.props.layoutFunction.call(this);

            return this.__render();
        }
    }]);

    return TopElementBehavior;
}(TopWidgetBehavior);

TopElementBehavior.propConfigs = Object.assign({}, TopWidgetBehavior.propConfigs, {
    onDetach: {
        type: Function
    },

    onAttach: {
        type: Function
    }
});

TopElementBehavior.defaultProps = Object.assign({}, TopWidgetBehavior.defaultProps, {});var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopControlBehavior = function (_TopElementBehavior) {
    _inherits(TopControlBehavior, _TopElementBehavior);

    function TopControlBehavior(props) {
        _classCallCheck(this, TopControlBehavior);

        var _this2 = _possibleConstructorReturn(this, (TopControlBehavior.__proto__ || Object.getPrototypeOf(TopControlBehavior)).call(this, props));

        _this2.__initViewController();
        return _this2;
    }

    _createClass(TopControlBehavior, [{
        key: "__initViewController",
        value: function __initViewController() {
            if (this._top.App.isLoaded()) {
                this.__initViewControllerImpl();
            } else {
                var _this = this;
                this._top.App.onLoad(function () {
                    _this.__initViewControllerImpl();
                });
            }
        }
    }, {
        key: "__initViewControllerImpl",
        value: function __initViewControllerImpl() {
            var viewController = this._top.Util.__searchViewController(this);
            if (viewController !== undefined) {
                if (viewController instanceof this._top.ViewController === false || viewController instanceof this._top.ViewController === true && viewController.isLoaded() === true) {} else {
                    var _this = this;
                    _this._top.ViewController.onLoad(_this, viewController, function () {});
                }
            }
        }
    }]);

    return TopControlBehavior;
}(TopElementBehavior);

TopControlBehavior.propConfigs = Object.assign({}, TopElementBehavior.propConfigs, {});var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopDataBehavior = function (_TopControlBehavior) {
    _inherits(TopDataBehavior, _TopControlBehavior);

    function TopDataBehavior(props) {
        _classCallCheck(this, TopDataBehavior);

        var _this = _possibleConstructorReturn(this, (TopDataBehavior.__proto__ || Object.getPrototypeOf(TopDataBehavior)).call(this, props));

        _this.__isBoundData = {};
        _this.__initBoundData();
        return _this;
    }

    _createClass(TopDataBehavior, [{
        key: '__initBoundData',
        value: function __initBoundData() {
            if (typeof this.state.data === 'string') this.state.dataModel = JSON.parse(this._top.Util.__convertQuotes(this.state.data));
            if (typeof this.state.dataModel === 'string') this.state.dataModel = JSON.parse(this._top.Util.__convertQuotes(this.state.dataModel));

            if (this.state.dataModel === undefined || this.state.dataModel === "") return;

            this.__boundData = {};
            var convertedDataModel = this._top.Util.__convertProperties(this.state.dataModel, this._top.Util.__getPropConfigs(this), this);
            for (var prop in convertedDataModel) {
                var valuePath = this.state.dataModel[this._top.Util.toDash(prop)];
                var dataName = this._top.Util.getDataName(valuePath, this);
                var data = this._top.Util.namespace(dataName, this);
                var splitValues = valuePath.split(dataName + '.');
                if (splitValues.length > 1) {
                    splitValues.shift();
                    valuePath = splitValues.join(dataName + '.');
                } else {
                    valuePath = splitValues[1];
                }
                if (data === undefined || !data.hasOwnProperty('id')) return;

                this.__addBoundData(prop, dataName, valuePath);

                if (valuePath.includes('+')) {
                    var converter = this._top.Util.namespace(valuePath.split('+')[1], this);
                    this.__boundData["DataConverter"] = converter;
                }

                if (prop === 'items') {
                    this.state[prop] = this.state.dataModel[this._top.Util.toDash(prop)].split('+')[0];
                } else {
                    var originValue = data.getValue(valuePath.split('+')[0]);
                    originValue = this.__getValueByDataConverter(originValue);
                    this.state[prop] = originValue;
                }

                this.state = this._top.Util.__convertProperties(this.state, this._top.Util.__getPropConfigs(this), this);

                if (this.__isBoundData[prop] !== true) {
                    data.__addBoundWidget(valuePath, this.state.id, prop);
                    this.__isBoundData[prop] = true;
                }
            }
        }
    }, {
        key: '__addBoundData',
        value: function __addBoundData(prop, dataName, valuePath) {
            var bindingInfo = {};
            bindingInfo.dataName = dataName;
            bindingInfo.valuePath = valuePath;
            this.__boundData[prop] = this.__boundData[prop] || [];
            this.__boundData[prop].push(bindingInfo);
        }
    }, {
        key: '__updateBoundData',
        value: function __updateBoundData(key, __widgetId) {
            if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                for (var i = 0, len = key.length; i < len; i++) {
                    this.__updateBoundDataImpl(key[i], __widgetId);
                }
            } else {
                this.__updateBoundDataImpl(key, __widgetId);
            }
        }
    }, {
        key: '__updateBoundDataImpl',
        value: function __updateBoundDataImpl(key, __widgetId) {
            if (this.__boundData && this.__boundData[key]) {
                var bindingInfoList = this.__boundData[key];

                for (var i = 0, len = bindingInfoList.length; i < len; i++) {
                    var data = this._top.Util.namespace(bindingInfoList[i].dataName, this);
                    var valuePath = bindingInfoList[i].valuePath;

                    if (valuePath.includes('+')) {
                        valuePath = valuePath.split('+')[0];
                    }

                    if (key === 'items') {
                        if (typeof this[key] === 'string') {
                            data.setValue(valuePath, this._top.Util.namespace(this.state[key], this), __widgetId);
                        } else {
                            data.setValue(valuePath, this.state[key], __widgetId);
                        }
                    } else {
                        var convertedValue = this[key];
                        if (this.__boundData['DataConverter']) {
                            var fnConvert = typeof this.__boundData['DataConverter'].convertBack === 'function' ? this.__boundData['DataConverter'].convertBack : this.__boundData['DataConverter'].convert;
                            convertedValue = fnConvert(this.state[key]);
                        }
                        data.setValue(valuePath, convertedValue, __widgetId);
                    }
                }
            }
        }
    }, {
        key: 'updateData',
        value: function updateData(key) {
            if (this.__boundData) {
                if (key) {
                    this.__updateBoundData(key, this.id);
                } else {
                    var keys = Object.keys(this.__boundData);
                    this.__updateBoundData(keys, this.id);
                }
            }
        }
    }, {
        key: '__clearBindingInfo',
        value: function __clearBindingInfo() {
            if (_typeof(this.__boundData) === 'object') {
                var keys = Object.keys(this.__boundData);
                for (var i = 0, len = keys.length; i < len; i++) {
                    this.__isBoundData[keys[i]] = false;
                    var bindingInfoList = this.__boundData[keys[i]];
                    for (var j = 0, len = bindingInfoList.length; j < len; j++) {
                        var data = this._top.Util.namespace(bindingInfoList[j].dataName, this);
                        var valuePath = bindingInfoList[j].valuePath;
                        if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && typeof data.__clearBindingInfo === 'function') data.__clearBindingInfo(valuePath, this.id);
                    }
                }
            }
        }
    }, {
        key: '__updateData',
        value: function __updateData() {
            if (typeof this.state.data === 'string') this.state.dataModel = JSON.parse(this._top.Util.__convertQuotes(this.state.data));
            if (typeof this.state.dataModel === 'string') this.state.dataModel = JSON.parse(this._top.Util.__convertQuotes(this.state.dataModel));

            for (var prop in this.state.dataModel) {
                this.__isBoundData[prop] = undefined;
            }

            this.__initBoundData(true);
        }
    }, {
        key: '__updateDataModel',
        value: function __updateDataModel() {
            if (typeof this.state.dataModel === 'string') this.state.dataModel = JSON.parse(this._top.Util.__convertQuotes(this.state.dataModel));
            for (var prop in this.state.dataModel) {
                this.__isBoundData[prop] = undefined;
            }

            this.__initBoundData(true);
        }
    }, {
        key: '__getValueByDataConverter',
        value: function __getValueByDataConverter(value, params) {
            if (!this.__boundData || this.__boundData && !this.__boundData["DataConverter"]) return value;
            return this.__boundData["DataConverter"].convert(value, params);
        }
    }, {
        key: '__setValueByDataConverter',
        value: function __setValueByDataConverter(value, params) {
            if (!this.__boundData || this.__boundData && !this.__boundData["DataConverter"]) return value;
            return this.__boundData["DataConverter"].convertBack(value, params);
        }
    }]);

    return TopDataBehavior;
}(TopControlBehavior);

TopDataBehavior.propConfigs = Object.assign({}, TopControlBehavior.propConfigs, {
    dataModel: {
        type: Object
    }
});

TopDataBehavior.defaultProps = Object.assign({}, TopControlBehavior.defaultProps, {});var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopCommonstyleBehavior = function (_TopDataBehavior) {
    _inherits(TopCommonstyleBehavior, _TopDataBehavior);

    function TopCommonstyleBehavior(props) {
        _classCallCheck(this, TopCommonstyleBehavior);

        var _this = _possibleConstructorReturn(this, (TopCommonstyleBehavior.__proto__ || Object.getPrototypeOf(TopCommonstyleBehavior)).call(this, props));

        _this.topTagStyle = {};
        _this.topStyle = {};
        _this[_this.getPaddingStyleObjectKey()] = {};
        _this.updateStyle();
        console.debug('constructor', _this.props.id);
        return _this;
    }

    _createClass(TopCommonstyleBehavior, [{
        key: 'updateStyle',
        value: function updateStyle(keys) {
            var layoutRenderFlag = false;
            if (keys != null && (typeof keys === 'undefined' ? 'undefined' : _typeof(keys)) === 'object') {
                for (var i = 0; i < keys.length; i++) {
                    if (!layoutRenderFlag) {
                        if (keys[i] === 'layoutAlignParent' || keys[i] === 'layoutRow' || keys[i] === 'layoutColumn' || keys[i] === 'layoutRowSpan' || keys[i] === 'layoutColumnSpan' || keys[i] === 'layoutTop' || keys[i] === 'layoutLeft' || keys[i] === 'layoutRight' || keys[i] === 'layoutBottom' || keys[i] === 'layoutTabName' || keys[i] === 'layoutTabIcon' || keys[i] === 'layoutTabDisabled' || keys[i] === 'layoutWeight' || keys[i] === 'layoutHorizontalAlignment' || keys[i] === 'layoutVerticalAlignment') {
                            layoutRenderFlag = true;
                            break;
                        }
                    }
                }
                if (layoutRenderFlag) {}
            } else if (typeof keys === 'string') {
                var stylekeyMap = [['textColor', 'color'], ['textSize', 'fontSize'], ['horizontalAlignment', 'textAlign'], ['layoutVerticalAlignment', 'verticalAlign']];
                for (var j = 0; j < stylekeyMap.length; j++) {
                    if (keys === stylekeyMap[j][0]) {
                        keys = stylekeyMap[j][1];
                        if (keys === 'overflowX' || keys === 'overflowY') {
                            if (this.state[stylekeyMap[j][0]] === 'true' || this.state[stylekeyMap[j][0]] === true) this.state[stylekeyMap[j][0]] = 'auto';else if (this.state[stylekeyMap[j][0]] === 'false' || this.state[stylekeyMap[j][0]] === false) this.state[stylekeyMap[j][0]] = 'hidden';
                        }
                        this.setTopStyle(keys, this.state[stylekeyMap[j][0]]);
                        return;
                    }
                }
                this.setTopStyle(keys, this.state[keys]);
                if ((keys === 'margin' || keys === 'padding') && typeof this.__updateHighlightConfig === 'function') {
                    this.__updateHighlightConfig();
                }
                return;
            }

            this.updatePositionValue();
            this.__updateVisible();
            this.__updateLayoutWidth();
            this.__updateLayoutHeight();
            this.__updateLayoutTop();
            this.__updateLayoutLeft();
            this.__updateLayoutRight();
            this.__updateLayoutBottom();
            this.__updateDisabled();

            this.setTopStyle('maxWidth', this.state.maxWidth);
            this.setTopStyle('minWidth', this.state.minWidth);
            this.setTopStyle('maxHeight', this.state.maxHeight);
            this.setTopStyle('minHeight', this.state.minHeight);
            this.setTopStyle('lineHeight', this.state.lineHeight);

            this.setTopStyle('background', this.state.background);
            this.setTopStyle('backgroundColor', this.state.backgroundColor);
            this.__updateBackgroundImage();
            this.__updateOpacity();
            this.setTopStyle('margin', this.state.margin);
            this.__updatePadding();
            this.setTopStyle('color', this.state.textColor);
            this.setTopStyle('fontSize', this.state.textSize);
            this.__updateBorder();
            this.__updateBorderStyle();
            this.__updateBorderWidth();
            this.__updateBorderTopWidth();
            this.__updateBorderBottomWidth();
            this.__updateBorderLeftWidth();
            this.__updateBorderRightWidth();
            this.__updateBorderColor();
            this.__updateBorderTopColor();
            this.__updateBorderBottomColor();
            this.__updateBorderLeftColor();
            this.__updateBorderRightColor();
            this.setTopStyle('borderRadius', this.state.borderRadius);
            this.setTopStyle('zIndex', this.state.zIndex);
            this.setTopStyle('position', this.state.position);
            this.setTopStyle('float', this.state.float);
            this.setTopStyle('cursor', this.state.cursor);
            this.setTopStyle('textAlign', this.state.horizontalAlignment);
            this.setTopStyle('verticalAlign', this.state.layoutVerticalAlignment);

            this.__updateHorizontalScroll();
            this.__updateVerticalScroll();
        }
    }, {
        key: 'updatePositionValue',
        value: function updatePositionValue() {
            this.splitMargin();
        }
    }, {
        key: '__updateVisible',
        value: function __updateVisible() {
            if (typeof this.__updateVisibleInternal === 'function') this.__updateVisibleInternal();

            if (this.state.visible === true || this.state.visible === 'true') this.state.visible = 'visible';
            if (this.state.visible === false || this.state.visible === 'false') this.state.visible = 'hidden';
            this.__updateDisplay();

            this.setTopStyle('visibility', this.state.visible);
        }
    }, {
        key: '__updateDisplay',
        value: function __updateDisplay() {
            if (this.state.display === 'none' || this.state.visible == 'none') {
                this.setTopStyle('display', 'none');
            } else {
                this.removeTopStyle('display');
            }
        }
    }, {
        key: 'splitMargin',
        value: function splitMargin() {
            if (this.state.margin) {
                var temp = this.state.margin.split(' ');
                if (temp.length == 1) {
                    this.state.marginTop = this.state.marginRight = this.state.marginBottom = this.state.marginLeft = temp[0];
                } else if (temp.length == 2) {
                    this.state.marginTop = this.state.marginBottom = temp[0];
                    this.state.marginRight = this.state.marginLeft = temp[1];
                } else if (temp.length == 4) {
                    this.state.marginTop = temp[0];
                    this.state.marginRight = temp[1];
                    this.state.marginBottom = temp[2];
                    this.state.marginLeft = temp[3];
                }
            } else {
                if (!this.state.marginTop) this.state.marginTop = 0;
                if (!this.state.marginRight) this.state.marginRight = 0;
                if (!this.state.marginBottom) this.state.marginBottom = 0;
                if (!this.state.marginLeft) this.state.marginLeft = 0;
            }
        }
    }, {
        key: '__updatePadding',
        value: function __updatePadding() {
            this.setStyleValue(this.getPaddingStyleObjectKey(), 'padding', this.state.padding.paddingString);
        }
    }, {
        key: 'getPaddingStyleObjectKey',
        value: function getPaddingStyleObjectKey() {
            return 'topStyle';
        }
    }, {
        key: '__updateBorder',
        value: function __updateBorder() {
            if (this.state.border) {
                this.setTopStyle('border', this.state.border.borderString);
            } else {
                this.removeTopStyle('border');
            }
        }
    }, {
        key: '__updateBorderStyle',
        value: function __updateBorderStyle() {
            if (this.state.borderStyle) {
                this.setTopStyle('borderStyle', this.state.borderStyle);
            } else {
                this.removeTopStyle('borderStyle');
            }
        }
    }, {
        key: '__updateBorderWidth',
        value: function __updateBorderWidth() {
            if (this.state.borderWidth.borderWidthString) {
                this.setTopStyle('borderWidth', this.state.borderWidth.borderWidthString);
            } else {
                this.removeTopStyle('borderWidth');
            }
        }
    }, {
        key: '__updateBorderTopWidth',
        value: function __updateBorderTopWidth() {
            if (this.state.borderTopWidth) {
                this.setTopStyle('borderTopWidth', this.state.borderTopWidth);
            } else {
                this.removeTopStyle('borderTopWidth');
            }
        }
    }, {
        key: '__updateBorderBottomWidth',
        value: function __updateBorderBottomWidth() {
            if (this.state.borderBottomWidth) {
                this.setTopStyle('borderBottomWidth', this.state.borderBottomWidth);
            } else {
                this.removeTopStyle('borderBottomWidth');
            }
        }
    }, {
        key: '__updateBorderLeftWidth',
        value: function __updateBorderLeftWidth() {
            if (this.state.borderLeftWidth) {
                this.setTopStyle('borderLeftWidth', this.state.borderLeftWidth);
            } else {
                this.removeTopStyle('borderLeftWidth');
            }
        }
    }, {
        key: '__updateBorderRightWidth',
        value: function __updateBorderRightWidth() {
            if (this.state.borderRightWidth) {
                this.setTopStyle('borderRightWidth', this.state.borderRightWidth);
            } else {
                this.removeTopStyle('borderRightWidth');
            }
        }
    }, {
        key: '__updateBorderColor',
        value: function __updateBorderColor() {
            if (this.state.borderColor) {
                this.setTopStyle('borderColor', this.state.borderColor);
            } else {
                this.removeTopStyle('borderColor');
            }
        }
    }, {
        key: '__updateBorderTopColor',
        value: function __updateBorderTopColor() {
            if (this.state.borderTopColor) {
                this.setTopStyle('borderTopColor', this.state.borderTopColor);
            } else {
                this.removeTopStyle('borderTopColor');
            }
        }
    }, {
        key: '__updateBorderBottomColor',
        value: function __updateBorderBottomColor() {
            if (this.state.borderBottomColor) {
                this.setTopStyle('borderBottomColor', this.state.borderBottomColor);
            } else {
                this.removeTopStyle('borderBottomColor');
            }
        }
    }, {
        key: '__updateBorderLeftColor',
        value: function __updateBorderLeftColor() {
            if (this.state.borderLeftColor) {
                this.setTopStyle('borderLeftColor', this.state.borderLeftColor);
            } else {
                this.removeTopStyle('borderLeftColor');
            }
        }
    }, {
        key: '__updateBorderRightColor',
        value: function __updateBorderRightColor() {
            if (this.state.borderRightColor) {
                this.setTopStyle('borderRightColor', this.state.borderRightColor);
            } else {
                this.removeTopStyle('borderRightColor');
            }
        }
    }, {
        key: '__updateLayoutWidth',
        value: function __updateLayoutWidth(layoutWidth) {
            if (!layoutWidth && !this.state.layoutWidth) return;
            if (!layoutWidth) layoutWidth = this.state.layoutWidth;

            if (layoutWidth && layoutWidth.endsWith('%')) {
                var boxing = parseInt(this.state.marginRight) + parseInt(this.state.marginLeft);
                if (boxing > 0) {
                    layoutWidth = 'calc(' + layoutWidth + ' - ' + boxing + 'px)';
                }
            }

            if (this.__isAttached && this.getLayoutParent() && typeof this.getLayoutParent().setShouldComplete === 'function') this.getLayoutParent().setShouldComplete(this, 'layoutWidth');
            if (layoutWidth === 'match_parent') return;

            this.setTopStyle('width', layoutWidth);
        }
    }, {
        key: '__updateLayoutHeight',
        value: function __updateLayoutHeight(layoutHeight) {
            if (!layoutHeight && !this.state.layoutHeight) return;
            if (!layoutHeight) layoutHeight = this.state.layoutHeight;

            if (layoutHeight.endsWith('%')) {
                var boxing = parseInt(this.state.marginTop) + parseInt(this.state.marginBottom);
                if (boxing > 0) {
                    layoutHeight = 'calc(' + layoutHeight + ' - ' + boxing + 'px)';
                }
            }

            if (this.__isAttached && this.getLayoutParent() && typeof this.getLayoutParent().setShouldComplete === 'function') this.getLayoutParent().setShouldComplete(this, 'layoutHeight');
            if (layoutHeight === 'match_parent') return;

            this.setTopStyle('height', layoutHeight);
        }
    }, {
        key: '__updateLayoutTop',
        value: function __updateLayoutTop() {
            if (!this.props.layoutParent || this.props.layoutParent && this.props.layoutParent.props.tagName != 'top-absolutelayout') {
                this.setTopStyle('top', this.state.layoutTop);
            } else if (this.props.layoutParent && this.props.layoutParent.props.tagName === 'top-absolutelayout') {
                var pPaddingTop = parseFloat(this.props.layoutParent.state.padding.paddingTop) || 0;
                if (this.state.layoutTop && this.state.layoutTop.includes('%')) {
                    var layoutTop = 'calc(' + this.state.layoutTop + ' + ' + pPaddingTop + 'px)';
                } else {
                    var layoutTop = (parseInt(this.state.layoutTop) || 0) + pPaddingTop + 'px';
                }
                this.setTopTagStyle('top', layoutTop);
            }
        }
    }, {
        key: '__updateLayoutLeft',
        value: function __updateLayoutLeft() {
            if (!this.props.layoutParent || this.props.layoutParent && this.props.layoutParent.props.tagName != 'top-absolutelayout') {
                this.setTopStyle('left', this.state.layoutLeft);
            } else if (this.props.layoutParent && this.props.layoutParent.props.tagName === 'top-absolutelayout') {
                var pPaddingLeft = parseFloat(this.props.layoutParent.state.padding.paddingLeft) || 0;
                if (this.state.layoutLeft && this.state.layoutLeft.includes('%')) {
                    var layoutLeft = 'calc(' + this.state.layoutLeft + ' + ' + pPaddingLeft + 'px)';
                } else {
                    var layoutLeft = (parseInt(this.state.layoutLeft) || 0) + pPaddingLeft + 'px';
                }
                this.setTopTagStyle('left', layoutLeft);
            }
        }
    }, {
        key: '__updateLayoutRight',
        value: function __updateLayoutRight() {
            if (!this.props.layoutParent || this.props.layoutParent && this.props.layoutParent.props.tagName != 'top-absolutelayout') {
                this.setTopStyle('right', this.state.layoutRight);
            } else if (this.props.layoutParent && this.props.layoutParent.props.tagName === 'top-absolutelayout') {
                var pPaddingRight = parseFloat(this.props.layoutParent.state.padding.paddingRight) || 0;
                if (this.state.layoutRight && this.state.layoutRight.includes('%')) {
                    var layoutRight = 'calc(' + this.state.layoutRight + ' + ' + pPaddingRight + 'px)';
                } else {
                    var layoutRight = (parseInt(this.state.layoutRight) || 0) + pPaddingRight + 'px';
                }
                if (!this.state.layoutLeft && this.state.layoutRight) this.removeTopTagStyle('left');
                this.setTopTagStyle('right', layoutRight);
            }
        }
    }, {
        key: '__updateLayoutBottom',
        value: function __updateLayoutBottom() {
            if (!this.props.layoutParent || this.props.layoutParent && this.props.layoutParent.props.tagName != 'top-absolutelayout') {
                this.setTopStyle('bottom', this.state.layoutBottom);
            } else if (this.props.layoutParent && this.props.layoutParent.props.tagName === 'top-absolutelayout') {
                var pPaddingBottom = parseFloat(this.props.layoutParent.state.padding.paddingBottom) || 0;
                if (this.state.layoutBottom && this.state.layoutBottom.includes('%')) {
                    var layoutBottom = 'calc(' + this.state.layoutBottom + ' + ' + pPaddingBottom + 'px)';
                } else {
                    var layoutBottom = (parseInt(this.state.layoutBottom) || 0) + pPaddingBottom + 'px';
                }
                if (!this.state.layoutTop && this.state.layoutBottom) this.removeTopTagStyle('top');
                this.setTopTagStyle('bottom', layoutBottom);
            }
        }
    }, {
        key: '__updateBackgroundImage',
        value: function __updateBackgroundImage() {
            var bImage = this.state.backgroundImage;

            if (this.state.backgroundImage != null) {
                if (!this.state.backgroundImage.includes('url(')) {
                    if (this.state.backgroundImage.includes('@drawable')) {
                        bImage = this._top.DrawableManager.get(this.state.backgroundImage.replace('@drawable/', ''));
                    }
                    bImage = 'url(' + bImage + ')';
                }
                this.setTopStyle('backgroundImage', bImage);
                if (this.state.tileMode == null || this.state.tileMode === '') this.state.tileMode = 'stretch';

                if (this.state.tileMode === 'stretch') this.setTopStyle('backgroundSize', 'cover');else {
                    this.setTopStyle('backgroundRepeat', this.state.tileMode);
                }
            }
        }
    }, {
        key: '__updateDisabled',
        value: function __updateDisabled() {
            if (this.props.layoutParent) {
                this.__derivedDisabled = this.props.layoutParent.state.disabled === true ? true : this.props.layoutParent.__derivedDisabled;
            } else {
                this.__derivedDisabled = this.state.disabled;
            }
            if (this.__calculateDerivedDisabled() === true) {
                this.addClassToTopClassList('disabled');
            } else {
                this.removeClassFromTopClassList('disabled');
            }
        }
    }, {
        key: '__updateOpacity',
        value: function __updateOpacity() {
            var opacity = this.state.opacity;
            if (opacity) {
                if (typeof opacity === 'string') {
                    if (opacity.endsWith('%')) {
                        opacity = Number(opacity.slice(0, opacity.indexOf('%'))) / 100.0;
                    } else {
                        opacity = Number(opacity);
                    }
                }
                this.setTopStyle('opacity', opacity);
            } else {
                this.removeTopStyle('opacity');
            }
        }
    }, {
        key: '__calculateDerivedDisabled',
        value: function __calculateDerivedDisabled() {
            return this.__derivedDisabled === true ? true : this.state.disabled === true ? true : false;
        }
    }, {
        key: '__updateHorizontalScroll',
        value: function __updateHorizontalScroll() {
            var horizontalScroll = this.state.horizontalScroll;
            if (this.state.horizontalScroll === 'true' && this.props.tagName !== 'top-tableview') horizontalScroll = 'auto';
            if (this.state.horizontalScroll === 'false') horizontalScroll = 'hidden';
            this.setTopStyle('overflowX', horizontalScroll);
        }
    }, {
        key: '__updateVerticalScroll',
        value: function __updateVerticalScroll() {
            var verticalScroll = this.state.verticalScroll;
            if (this.state.verticalScroll === 'true') verticalScroll = 'auto';
            if (this.state.verticalScroll === 'false') verticalScroll = 'hidden';
            this.setTopStyle('overflowY', verticalScroll);
        }
    }, {
        key: 'setTopStyle',
        value: function setTopStyle(key, value) {
            if (this.__isAttached) {
                var changedStyle = {};
                Object.assign(changedStyle, this.topStyle);
                if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                    var keys = Object.keys(properties);
                    for (var i = 0, len = keys.length; i < len; i++) {
                        changedStyle[keys[i]] = key[keys[i]];
                    }
                } else {
                    changedStyle[key] = value;
                }
                this.topStyle = changedStyle;
            } else {
                this.topStyle[key] = value;
            }
        }
    }, {
        key: 'setStyleValue',
        value: function setStyleValue(styleObjectKey, key, value) {
            if (this.__isAttached) {
                var changedStyle = {};
                Object.assign(changedStyle, this[styleObjectKey]);
                if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                    var keys = Object.keys(properties);
                    for (var i = 0, len = keys.length; i < len; i++) {
                        changedStyle[keys[i]] = key[keys[i]];
                    }
                } else {
                    changedStyle[key] = value;
                }
                this[styleObjectKey] = changedStyle;
            } else {
                this[styleObjectKey][key] = value;
            }
        }
    }, {
        key: 'removeTopStyle',
        value: function removeTopStyle(key) {
            if (this.__isAttached) {
                var changedStyle = {};
                Object.assign(changedStyle, this.topStyle);
                delete changedStyle[key];
                this.topStyle = changedStyle;
            } else {
                delete this.topStyle[key];
            }
        }
    }, {
        key: 'setTopTagStyle',
        value: function setTopTagStyle(key, value) {
            if (this.__isAttached) {
                var changedTopTagStyle = {};
                Object.assign(changedTopTagStyle, this.topTagStyle);
                if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                    var keys = Object.keys(properties);
                    for (var i = 0, len = keys.length; i < len; i++) {
                        changedTopTagStyle[keys[i]] = key[keys[i]];
                    }
                } else {
                    changedTopTagStyle[key] = value;
                }
                this.topTagStyle = changedTopTagStyle;
            } else {
                this.topTagStyle[key] = value;
            }
        }
    }, {
        key: 'removeTopTagStyle',
        value: function removeTopTagStyle(key) {
            if (this.__isAttached) {
                var changedTopTagStyle = {};
                Object.assign(changedTopTagStyle, this.topTagStyle);
                delete changedTopTagStyle[key];
                this.topTagStyle = changedTopTagStyle;
            } else {
                delete this.topTagStyle[key];
            }
        }
    }, {
        key: 'getValidBorderTopWidth',
        value: function getValidBorderTopWidth() {
            if (this.state.borderTopWidth) return this.state.borderTopWidth;else if (this.state.borderWidth) return this.state.borderWidth.borderTopWidth;else if (this.state.border) return this.state.border.borderTopWidth;
            return undefined;
        }
    }, {
        key: 'getValidBorderBottomWidth',
        value: function getValidBorderBottomWidth() {
            if (this.state.borderBottomWidth) return this.state.borderBottomWidth;else if (this.state.borderWidth) return this.state.borderWidth.borderBottomWidth;else if (this.state.border) return this.state.border.borderBottomWidth;
            return undefined;
        }
    }, {
        key: 'getValidBorderLeftWidth',
        value: function getValidBorderLeftWidth() {
            if (this.state.borderLeftWidth) return this.state.borderLeftWidth;else if (this.state.borderWidth) return this.state.borderWidth.borderLeftWidth;else if (this.state.border) return this.state.border.borderLeftWidth;
            return undefined;
        }
    }, {
        key: 'getValidBorderRightWidth',
        value: function getValidBorderRightWidth() {
            if (this.state.borderRightWidth) return this.state.borderRightWidth;else if (this.state.borderWidth) return this.state.borderWidth.borderRightWidth;else if (this.state.border) return this.state.border.borderRightWidth;
            return undefined;
        }
    }]);

    return TopCommonstyleBehavior;
}(TopDataBehavior);

TopCommonstyleBehavior.propConfigs = Object.assign({}, TopDataBehavior.propConfigs, {
    layoutVerticalAlignment: {
        type: String,
        options: ['top', 'middle', 'bottom']
    },

    layoutHorizontalAlignment: {
        type: String,
        options: ['left', 'center', 'right']
    },

    padding: {
        type: String,
        default: '',
        convert: function convert(value) {
            var temp = value.split(' ');
            var paddingTop = paddingRight = paddingBottom = paddingLeft = '0';
            if (temp.length == 1) {
                paddingTop = paddingRight = paddingBottom = paddingLeft = temp[0];
            } else if (temp.length == 2) {
                paddingTop = paddingBottom = temp[0];
                paddingRight = paddingLeft = temp[1];
            } else if (temp.length == 4) {
                paddingTop = temp[0];
                paddingRight = temp[1];
                paddingBottom = temp[2];
                paddingLeft = temp[3];
            }
            return {
                paddingString: value,
                paddingTop: paddingTop,
                paddingRight: paddingRight,
                paddingBottom: paddingBottom,
                paddingLeft: paddingLeft
            };
        }
    },

    border: {
        type: String,
        default: '',
        convert: function convert(value) {
            var tmpBorder = value.split(' ');
            var borderStyle, borderWidth, borderColor;
            if (tmpBorder.length == 1) {
                if (getTopUI().BorderManager.isGlobalValue(tmpBorder[0])) {
                    return {
                        borderString: value,
                        borderStyle: borderStyle,
                        borderTopStyle: borderStyle,
                        borderBottomStyle: borderStyle,
                        borderLeftStyle: borderStyle,
                        borderRightStyle: borderStyle,
                        borderWidth: borderWidth,
                        borderTopWidth: borderWidth,
                        borderBottomWidth: borderWidth,
                        borderLeftWidth: borderWidth,
                        borderRightWidth: borderWidth,
                        borderColor: borderColor,
                        borderTopColor: borderColor,
                        borderBottomColor: borderColor,
                        borderLeftColor: borderColor,
                        borderRightColor: borderColor
                    };
                } else if (getTopUI().BorderManager.isBorderStyle(tmpBorder[0])) {
                    borderStyle = tmpBorder[0];
                } else if (getTopUI().BorderManager.isBorderWidth(tmpBorder[0])) {
                    borderWidth = tmpBorder[0];
                } else {
                    borderColor = tmpBorder[0];
                }
            } else if (tmpBorder.length == 2) {
                var split = getTopUI().BorderManager.splitBorder(tmpBorder);
                borderStyle = split.borderStyle;
                borderWidth = split.borderWidth;
                borerColor = split.borderColor;
            } else if (tmpBorder.length == 3) {
                var split = getTopUI().BorderManager.splitBorder(tmpBorder);
                borderStyle = split.borderStyle;
                borderWidth = split.borderWidth;
                borerColor = split.borderColor;
            }

            return {
                borderString: value,
                borderStyle: borderStyle,
                borderTopStyle: borderStyle,
                borderBottomStyle: borderStyle,
                borderLeftStyle: borderStyle,
                borderRightStyle: borderStyle,
                borderWidth: borderWidth,
                borderTopWidth: borderWidth,
                borderBottomWidth: borderWidth,
                borderLeftWidth: borderWidth,
                borderRightWidth: borderWidth,
                borderColor: borderColor,
                borderTopColor: borderColor,
                borderBottomColor: borderColor,
                borderLeftColor: borderColor,
                borderRightColor: borderColor
            };
        }
    },

    borderWidth: {
        type: String,
        default: '',
        convert: function convert(value) {
            var borderWidth = getTopUI().BorderManager.splitBorderWidth(value);
            return {
                borderWidthString: value,
                borderTopWidth: borderWidth.borderTopWidth,
                borderBottomWidth: borderWidth.borderBottomWidth,
                borderLeftWidth: borderWidth.borderLeftWidth,
                borderRightWidth: borderWidth.borderRightWidth
            };
        }
    },

    borderTopWidth: {
        type: String
    },

    borderBottomWidth: {
        type: String
    },

    borderLeftWidth: {
        type: String
    },

    borderRightWidth: {
        type: String
    },

    borderStyle: {
        type: String
    },

    borderTopStyle: {
        type: String,
        options: ['', 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit', 'initial', 'unset']
    },

    borderBottomStyle: {
        type: String,
        options: ['', 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit', 'initial', 'unset']
    },

    borderLeftStyle: {
        type: String,
        options: ['', 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit', 'initial', 'unset']
    },

    borderRightStyle: {
        type: String,
        options: ['', 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit', 'initial', 'unset']
    },

    borderColor: {
        type: String
    },

    borderTopColor: {
        type: String
    },

    borderBottomColor: {
        type: String
    },

    borderLeftColor: {
        type: String
    },

    borderRightColor: {
        type: String
    },

    visible: {
        type: String
    },

    zIndex: {
        type: Number
    },

    margin: {
        type: String
    },

    marginTop: {
        type: String
    },

    marginRight: {
        type: String
    },

    marginBottom: {
        type: String
    },

    marginLeft: {
        type: String
    },

    opacity: {
        type: Number
    },

    background: {
        type: String
    },

    backgroundColor: {
        type: String
    },

    backgroundImage: {
        type: String
    },

    tileMode: {
        type: String
    },

    maxWidth: {
        type: String
    },

    minWidth: {
        type: String
    },

    maxHeight: {
        type: String
    },

    minHeight: {
        type: String
    },

    layoutHeight: {
        type: String
    },

    layoutWidth: {
        type: String
    },

    layoutAlignParent: {
        type: String
    },

    layoutRow: {
        type: Number
    },

    layoutColumn: {
        type: Number
    },

    layoutRowSpan: {
        type: Number
    },

    layoutColumnSpan: {
        type: Number
    },

    layoutTop: {
        type: String
    },

    layoutLeft: {
        type: String
    },

    layoutRight: {
        type: String
    },

    layoutBottom: {
        type: String
    },

    layoutTabName: {
        type: String
    },

    layoutTabIcon: {
        type: String
    },

    layoutTabDisabled: {
        type: Boolean,
        value: false
    },

    layoutWeight: {
        type: Number
    },

    tabIndex: {
        type: Number,
        value: 0
    }
});

(function () {
    var PropertyManagerCreator = function PropertyManagerCreator(topInstance) {
        PropertyManager.prototype = Object.create(topInstance.prototype);
        PropertyManager.prototype.constructor = PropertyManager;

        function PropertyManager() {}
        return PropertyManager;
    };

    var BorderManagerCreator = function BorderManagerCreator(topInstance) {
        BorderManager.prototype = Object.create(topInstance.PropertyManager.prototype);
        BorderManager.prototype.constructor = BorderManager;
        BorderManager.borderStyleOptions = ['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];
        BorderManager.borderGlobalOptions = ['inherit', 'initial', 'unset'];
        BorderManager.borderWidthOptions = ['thin', 'medium', 'thick'];

        function BorderManager() {}

        BorderManager.splitBorder = function (borer) {
            var styleAlreadyChecked = false,
                widthAlreadyChecked = false,
                colorAlreadyChecked = false;
            var borderStyle, borderWidth, borderColor;
            for (var i = 0; i < borer.length; i++) {
                if (!styleAlreadyChecked && this.isBorderStyle(borer[i])) {
                    borderStyle = borer[i];
                    styleAlreadyChecked = true;
                } else if (!widthAlreadyChecked && this.isBorderWidth(borer[i])) {
                    borderWidth = borer[i];
                    widthAlreadyChecked = true;
                } else if (!colorAlreadyChecked) {
                    borderColor = borer[i];
                }
            }
            return { borderStyle: borderStyle, borderWidth: borderWidth, borderColor: borderColor };
        };

        BorderManager.splitBorderWidth = function (borderWidth) {
            var tmpBorderWidth = borderWidth.split(' ');
            var borderTopWidth, borderBottomWidth, borderLeftWidth, borderRightWidth;
            if (tmpBorderWidth.length == 1) {
                if (this.isGlobalValue(tmpBorderWidth[0])) {
                    return {
                        borderTopWidth: borderTopWidth,
                        borderBottomWidth: borderBottomWidth,
                        borderLeftWidth: borderLeftWidth,
                        borderRightWidth: borderRightWidth
                    };
                } else if (this.isBorderWidth(tmpBorderWidth[0])) {
                    borderTopWidth = tmpBorderWidth[0];
                    borderBottomWidth = tmpBorderWidth[0];
                    borderLeftWidth = tmpBorderWidth[0];
                    borderRightWidth = tmpBorderWidth[0];
                }
            } else if (tmpBorderWidth.length === 2) {
                if (this.isBorderWidth(tmpBorderWidth[0])) {
                    borderTopWidth = tmpBorderWidth[0];
                    borderBottomWidth = tmpBorderWidth[0];
                }
                if (this.isBorderWidth(tmpBorderWidth[1])) {
                    borderLeftWidth = tmpBorderWidth[1];
                    borderRightWidth = tmpBorderWidth[1];
                }
            } else if (tmpBorderWidth.length === 3) {
                if (this.isBorderWidth(tmpBorderWidth[0])) {
                    borderTopWidth = tmpBorderWidth[0];
                }
                if (this.isBorderWidth(tmpBorderWidth[1])) {
                    borderLeftWidth = tmpBorderWidth[1];
                    borderRightWidth = tmpBorderWidth[1];
                }
                if (this.isBorderWidth(tmpBorderWidth[2])) {
                    borderBottomWidth = tmpBorderWidth[2];
                }
            } else if (tmpBorderWidth.length === 4) {
                if (this.isBorderWidth(tmpBorderWidth[0])) {
                    borderTopWidth = tmpBorderWidth[0];
                }
                if (this.isBorderWidth(tmpBorderWidth[1])) {
                    borderRightWidth = tmpBorderWidth[1];
                }
                if (this.isBorderWidth(tmpBorderWidth[2])) {
                    borderBottomWidth = tmpBorderWidth[2];
                }
                if (this.isBorderWidth(tmpBorderWidth[3])) {
                    borderLeftWidth = tmpBorderWidth[3];
                }
            }
            return {
                borderTopWidth: borderTopWidth,
                borderBottomWidth: borderBottomWidth,
                borderLeftWidth: borderLeftWidth,
                borderRightWidth: borderRightWidth
            };
        };

        BorderManager.isGlobalValue = function (style) {
            return this.borderGlobalOptions.includes(style);
        };

        BorderManager.isBorderStyle = function (style) {
            return this.borderStyleOptions.includes(style);
        };

        BorderManager.isBorderWidth = function (style) {
            if (this.borderWidthOptions.includes(style) || parseFloat(style) >= 0 || parseFloat(style) <= 0) return true;
            return false;
        };

        return BorderManager;
    };

    getTopUI().PropertyManager = PropertyManagerCreator(getTopUI());
    getTopUI().BorderManager = BorderManagerCreator(getTopUI());
})();

TopCommonstyleBehavior.defaultProps = Object.assign({}, TopDataBehavior.defaultProps, {});var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopTextstyleBehavior = function (_TopCommonstyleBehavi) {
    _inherits(TopTextstyleBehavior, _TopCommonstyleBehavi);

    function TopTextstyleBehavior(props) {
        _classCallCheck(this, TopTextstyleBehavior);

        var _this = _possibleConstructorReturn(this, (TopTextstyleBehavior.__proto__ || Object.getPrototypeOf(TopTextstyleBehavior)).call(this, props));

        _this.__updateTextStyle();
        return _this;
    }

    _createClass(TopTextstyleBehavior, [{
        key: '__updateTextStyle',
        value: function __updateTextStyle() {
            if (this.state.textStyle === undefined) return;
            if (this.state.textStyle === 'none' || this.state.textStyle === '') {
                this.removeTopStyle('fontWeight');
                this.removeTopStyle('fontStyle');
                this.removeTopStyle('textDecoration');
                return;
            }

            var textStyleArray = this.state.textStyle.split('|');

            for (var i = 0; i < textStyleArray.length; i++) {
                textStyleArray[i] = textStyleArray[i].replace(/ /g, '');

                if (textStyleArray[i] === 'bold') {
                    this.removeTopStyle('fontWeight');
                    this.setTopStyle('fontWeight', 'bold');
                }
                if (textStyleArray[i] === 'italic') {
                    this.removeTopStyle('fontStyle');
                    this.setTopStyle('fontStyle', 'italic');
                }
                if (textStyleArray[i] === 'underline') {
                    this.removeTopStyle('textDecoration');
                    this.setTopStyle('textDecoration', 'underline');
                }
            }
        }
    }, {
        key: 'setTopTextStyle',
        value: function setTopTextStyle(key, value) {
            var changedStyle = {};
            Object.assign(changedStyle, this.topTextStyle);
            if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                var keys = Object.keys(properties);
                for (var i = 0, len = keys.length; i < len; i++) {
                    changedStyle[keys[i]] = key[keys[i]];
                }
            } else {
                changedStyle[key] = value;
            }
            this.topTextStyle = changedStyle;
        }
    }, {
        key: 'removeTopTextStyle',
        value: function removeTopTextStyle(key) {
            this.setTopTextStyle(key, undefined);
        }
    }]);

    return TopTextstyleBehavior;
}(TopCommonstyleBehavior);

TopTextstyleBehavior.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {
    textSize: {
        type: String
    },

    textColor: {
        type: String
    },

    textStyle: {
        type: String
    }
});

TopTextstyleBehavior.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {});var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopEventBehavior = function (_TopTextstyleBehavior) {
    _inherits(TopEventBehavior, _TopTextstyleBehavior);

    function TopEventBehavior(props) {
        _classCallCheck(this, TopEventBehavior);

        var _this2 = _possibleConstructorReturn(this, (TopEventBehavior.__proto__ || Object.getPrototypeOf(TopEventBehavior)).call(this, props));

        _this2.event = {};
        _this2.__initCommonEvent();
        return _this2;
    }

    _createClass(TopEventBehavior, [{
        key: '__initCommonEvent',
        value: function __initCommonEvent() {
            if (!this._top.isUI()) {
                this.__addEventByAttr('keydown');
                this.__addEventByAttr('keypress');
                this.__addEventByAttr('keyup');
                this.__addEventByAttr('mouseenter');
                this.__addEventByAttr('mouseover');
                this.__addEventByAttr('mousemove');
                this.__addEventByAttr('mousedown');
                this.__addEventByAttr('mouseup');
                this.__addEventByAttr('click');
                this.__addEventByAttr('input');
                this.__addEventByAttr('clear');
                this.__addEventByAttr('dblclick');
                this.__addEventByAttr('contextmenu');
                this.__addEventByAttr('wheel');
                this.__addEventByAttr('mouseleave');
                this.__addEventByAttr('pointerlockchange');
                this.__addEventByAttr('pointerlockerror');
                this.__addEventByAttr('dragstart');
                this.__addEventByAttr('drag');
                this.__addEventByAttr('dragend');
                this.__addEventByAttr('dragenter');
                this.__addEventByAttr('dragover');
                this.__addEventByAttr('dragleave');
                this.__addEventByAttr('drop');
                this.__addEventByAttr('copy');
                this.__addEventByAttr('paste');
                this.__addEventByAttr('focus');
                this.__addEventByAttr('blur');
                this.__addEventByAttr('error');
                if (typeof this.__initEventInternal === 'function') this.__initEventInternal();
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _get(TopEventBehavior.prototype.__proto__ || Object.getPrototypeOf(TopEventBehavior.prototype), 'componentWillUnmount', this).call(this);
            this.__clearEvents();
        }
    }, {
        key: '__addEventByAttr',
        value: function __addEventByAttr(type) {
            var attrName = 'on'.concat(this._top.Util.capitalizeFirstLetter(type));
            if (!this.state[attrName]) return;
            var fnName = type.concat('_anonymous');
            var _this = this;
            this.event[fnName] = function (event) {
                if (_this.__calculateDerivedDisabled() === true) return;
                var fn = _this.state[attrName];
                if (typeof _this.getEventParameter === 'function') event.topParameter = _this.getEventParameter(event);
                if (event.topParameter !== undefined) {
                    event.state = fn.call(_this._top.Util.__searchViewController(_this), event, _this.getTopElement().topWidget, event.topParameter);
                } else if (_typeof(event.detail) === 'object') {
                    event.state = fn.call(_this._top.Util.__searchViewController(_this), event, _this.getTopElement().topWidget, event.detail);
                } else {
                    event.state = fn.call(_this._top.Util.__searchViewController(_this), event, _this.getTopElement().topWidget);
                }
            };
            this.__addEventListener(type, this.event[fnName]);
        }
    }, {
        key: '__removeEventByAttr',
        value: function __removeEventByAttr(type) {
            var attrName = 'on'.concat(this._top.Util.capitalizeFirstLetter(type));
            if (!this.state[attrName]) return;
            var fnName = type.concat('_anonymous');
            delete this.event[fnName];
            this.__removeEventListener(type);
        }
    }, {
        key: '__addEventListener',
        value: function __addEventListener(type, listener) {
            this._top.EventManager.on(type, this, listener);
        }
    }, {
        key: '__removeEventListener',
        value: function __removeEventListener(type) {
            this._top.EventManager.off(type, this);
        }
    }, {
        key: '__clearEvents',
        value: function __clearEvents() {
            var _this3 = this;

            if (!this._top.isUI()) {
                Object.keys(this.event).forEach(function (fnName) {
                    _this3.__removeEventByAttr(fnName.split('_')[0]);
                });
            }
        }
    }, {
        key: '__dispatchEvent',
        value: function __dispatchEvent(event) {
            this._top.EventManager.dispatchEvent(event, this);
        }
    }]);

    return TopEventBehavior;
}(TopTextstyleBehavior);

TopEventBehavior.propConfigs = Object.assign({}, TopTextstyleBehavior.propConfigs, {
    disabled: {
        type: Boolean,
        default: false
    },

    tooltip: {
        type: String
    },

    tooltipTop: {
        type: String
    },

    tooltipBottom: {
        type: String
    },

    tooltipLeft: {
        type: String
    },

    tooltipRight: {
        type: String
    },

    menuId: {
        type: String,
        aliases: ['menu']
    },

    popoverId: {
        type: String
    },

    popoverTrigger: {
        type: String,
        value: 'click'
    },

    popoverTarget: {
        type: String
    },

    dialogId: {
        type: String
    },

    dialogTrigger: {
        type: String
    },

    notificationId: {
        type: String
    },

    notificationTrigger: {
        type: String
    },

    onKeydown: {
        type: Function
    },

    onKeypress: {
        type: Function
    },

    onKeyup: {
        type: Function
    },

    onMouseenter: {
        type: Function
    },

    onMouseover: {
        type: Function
    },

    onMousemove: {
        type: Function
    },

    onMousedown: {
        type: Function
    },

    onMouseup: {
        type: Function
    },

    onClick: {
        type: Function
    },

    onDblclick: {
        type: Function
    },

    onContextmenu: {
        type: Function
    },

    onWheel: {
        type: Function
    },

    onMouseleave: {
        type: Function
    },

    onPointerlockchange: {
        type: Function
    },

    onPointerlockerror: {
        type: Function
    },

    onDragstart: {
        type: Function
    },

    onDrag: {
        type: Function
    },

    onDragend: {
        type: Function
    },

    onDragenter: {
        type: Function
    },

    onDragover: {
        type: Function
    },

    onDragleave: {
        type: Function
    },

    onDrop: {
        type: Function
    },

    onCopy: {
        type: Function
    },

    onPaste: {
        type: Function
    },

    onFocus: {
        type: Function
    },

    onBlur: {
        type: Function
    },

    widgetDraggable: {
        type: Boolean,
        default: true
    }
});

TopEventBehavior.defaultProps = Object.assign({}, TopTextstyleBehavior.defaultProps, {});var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _defineProperty = function(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopContainerBehavior = function (_TopEventBehavior) {
  _inherits(TopContainerBehavior, _TopEventBehavior);

  function TopContainerBehavior(props) {
    _classCallCheck(this, TopContainerBehavior);

    var _this2 = _possibleConstructorReturn(this, (TopContainerBehavior.__proto__ || Object.getPrototypeOf(TopContainerBehavior)).call(this, props));

    _this2.initialLayout();
    return _this2;
  }

  _createClass(TopContainerBehavior, [{
    key: "initialLayout",
    value: function initialLayout() {
      this.itemLayoutDom = this.state.children;
    }
  }, {
    key: "initializeHtmlObjects",
    value: function initializeHtmlObjects(child) {
      var _this = this;
      var attrs = Array.prototype.slice.call(child.attributes);
      var props = {
        key: child.tagName.toUpperCase() + "-" + this._top.Render.top_index
      };
      this._top.Render.top_index++;

      attrs.map(function (attr) {
        return props[_this._top.Util.toCamelCase(attr.name)] = attr.value;
      });

      if (!props.id) {
        props.id = this._top.Util.guid();
      }

      if (!!props.class) {
        props.className = props.class;
        delete props.class;
      }

      var children = [];
      for (var i = 0; i < child.children.length; i++) {
        children.push(this.initializeHtmlObjects(child.children[i]));
      }
      props.children = children;
      var comp = this._top.Render.topWidgets[child.tagName.toLowerCase()];

      return React.createElement(comp, props, children);
    }
  }]);

  return TopContainerBehavior;
}(TopEventBehavior);

TopContainerBehavior.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {});

TopContainerBehavior.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {});

(function () {
  var ContainerCreator = function ContainerCreator(topInstance) {
    Container.prototype = Object.create(topInstance.Widget.prototype);
    Container.prototype.constructor = Container;

    function Container() {
      topInstance.Widget.apply(this, arguments);
    }

    Container.prototype.getItems = function () {
      var items;
      if (!this.getTemplate()) return undefined;
      if (typeof this.getTemplate().state.items === "string") items = topInstance.Util.namespace(this.getTemplate().state.items, this.getTemplate());else items = this.getTemplate().state.items;
      return items;
    };

    return Container;
  };

  getTopUI().Widget.Container = ContainerCreator(getTopUI());
  getTop().Widget.Container = ContainerCreator(getTop());
})();

var ContainerBody = function (_React$Component) {
  _inherits(ContainerBody, _React$Component);

  function ContainerBody(props) {
    _classCallCheck(this, ContainerBody);

    var _this3 = _possibleConstructorReturn(this, (ContainerBody.__proto__ || Object.getPrototypeOf(ContainerBody)).call(this, props));

    _this3.scrollChange = function () {
      _this3.setState({ from: _this3.from, from2: _this3.from2 });
    };

    _this3.state = Object.assign({}, props, {
      from: 0,
      from2: 0
    });

    _this3.timer = null;return _this3;
  }

  _createClass(ContainerBody, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.__bindEvent();
      this.itemdrag();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {}
  }, {
    key: "calrownum",
    value: function calrownum(y) {
      var rnum = 0;
      this.state.rowinfo.every(function (rows, rowsindex) {
        return rows.every(function (obj, ridx) {
          rnum = rowsindex;
          return obj.top < y;
        });
      });
      return rnum + 1;
    }
  }, {
    key: "calcolnum",
    value: function calcolnum(x) {
      var cnum = 0;
      this.state.columninfo[this.state.columninfo.length - 1].every(function (obj, cidx) {
        cnum = cidx;
        return obj.left <= x;
      });
      return cnum + 1;
    }
  }, {
    key: "__SettingVirtual",
    value: function __SettingVirtual(top, left) {
      if (top) {
        this.from = this.calrownum(top);
      } else {
        this.from = 0;
      }

      if (left) {
        this.from2 = this.calcolnum(left);
      } else {
        this.from2 = 0;
      }
    }
  }, {
    key: "scrollhandler",
    value: function scrollhandler() {
      var top = event.srcElement.scrollTop;
      var left = event.srcElement.scrollLeft;
      this.__SettingVirtual(top, left);
      if (this.props.sync) {
        this.props.sync();
      }
      if (this.from == this.prevfrom && this.from2 == this.prevfrom2) {
        return;
      }
      this.prevfrom = this.from;
      this.prevfrom2 = this.from2;
      this.scrollChange();
    }
  }, {
    key: "itemdrag",
    value: function itemdrag() {
      if (!this.props["item-drag"]) {
        return;
      }
      var _this = this.Conbody;
      var listUI = this;
      if (true) {
        var li_Cells = _this.getElementsByClassName("top-listview-list");
        var listbox = this.Conbody;

        if (this.__uiDragstartListener === undefined) {
          this.__uiDragstartListener = function (ev) {
            ev.dataTransfer.setData("text", ev.target.getAttribute("data-index"));
          };
        }
        if (this.__uiDropListener === undefined) {
          this.__uiDropListener = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();

            var target = _this.li;
            if (!target) {
              return;
            }
            target.classList.remove("rowabove");

            var start_Index = parseInt(ev.dataTransfer.getData("text"));
            var end_index = parseInt(target.getAttribute("data-index"));
            if (start_Index == end_index) {
              return;
            }

            if (listUI.staticitem) {
              var datas = listUI.state.widgetItems;
            } else {
              var datas = listUI.state.data;
            }
            var einfo = listUI.state.rowinfo;

            if (start_Index > end_index) {
              datas.splice(end_index + 1, 0, datas[start_Index]);
              datas.splice(start_Index + 1, 1);
              einfo.splice(end_index + 1, 0, einfo[start_Index]);
              einfo.splice(start_Index + 1, 1);
            } else {
              datas.splice(end_index + 1, 0, datas[start_Index]);
              datas.splice(start_Index, 1);
              einfo.splice(end_index + 1, 0, einfo[start_Index]);
              einfo.splice(start_Index, 1);
            }
            listUI.setState({
              data: datas,
              event: einfo
            });
          };
        }
        if (this.__uiDragoverListener === undefined) {
          this.__uiDragoverListener = function (ev) {
            ev.preventDefault();
            var oldTarget = _this.querySelector(".rowabove");
            if (oldTarget) oldTarget.classList.remove("rowabove");
            var newtarget = ev.target;
            while (true) {
              if (newtarget.tagName == undefined || newtarget.tagName == null) {
                return;
              }
              if (newtarget.className.includes("column_list")) {
                break;
              }
              newtarget = newtarget.parentNode;
            }

            if (newtarget) newtarget.classList.add("rowabove");

            _this.li = newtarget;
          };
        }

        if (this.__uiout === undefined) {
          this.__uiout = function (ev) {
            ev.preventDefault();
            var oldTarget = _this.querySelector(".rowabove");
            if (oldTarget) oldTarget.classList.remove("rowabove");
          };
        }

        for (var i = 0; i < li_Cells.length; i++) {
          li_Cells[i].draggable = true;
          li_Cells[i].addEventListener("dragstart", this.__uiDragstartListener);
        }

        if (listbox) {
          listbox.removeEventListener("dragover", this.__uiDragoverListener);
          listbox.addEventListener("dragover", this.__uiDragoverListener);
          listbox.removeEventListener("drop", this.__uiDropListener);
          listbox.addEventListener("drop", this.__uiDropListener);
          listbox.removeEventListener("mouseleave", this.__uiout);
          listbox.addEventListener("mouseleave", this.__uiout);
        }
      }
    }
  }, {
    key: "__renderLayout",
    value: function __renderLayout(childs) {
      var _this4 = this;

      return this.state.rowpointer.map(function (rowgroup, index) {
        var dataobj = _this4.state.datapointer[index];
        return rowgroup.map(function (rowinfo, rowinfoIndex) {
          return _this4.__renderData(rowinfo, dataobj, index, rowinfoIndex);
        });
      });
    }
  }, {
    key: "__bindEvent",
    value: function __bindEvent() {
      var _this5 = this;

      var _top = this.props._top;

      if (_top) {
        _top.EventManager.on("scroll", this.Conbody, function (event) {
          return _this5.scrollhandler(event);
        });
      }
    }
  }, {
    key: "__makeCell",
    value: function __makeCell(cellinfo, rowinfo, index, dataIndex, cidx, rowinfoIndex) {
      var ckey = "cell-" + cidx;
      var visible = cellinfo.visible;
      var CellWidth = ~~cellinfo.width;
      var CellHeight = ~~rowinfo.height;

      if (cellinfo.colspan > 1) {
        var colspan = cellinfo.colspan;
        for (var i = 1; i < colspan; i++) {
          CellWidth += ~~this.state.columninfo[rowinfoIndex][cidx + i].width;
          this.state.columninfo[rowinfoIndex][cidx + i].visible = "hidden";
        }
      }

      if (cellinfo.rowspan > 1) {
        var rowspan = cellinfo.rowspan;
        for (var k = 1; k < rowspan; k++) {
          CellHeight += ~~this.state.rowinfo[index][rowinfoIndex + k].height;
          this.state.columninfo[rowinfoIndex + k][cidx].visible = "hidden";
        }
      }

      if (cellinfo.colspan > 1 && cellinfo.rowspan > 1) {
        var _colspan = cellinfo.colspan;
        var _rowspan = cellinfo.rowspan;
        for (var _i = 1; _i < _colspan; _i++) {
          for (var _k = 1; _k < _rowspan; _k++) {
            this.state.columninfo[rowinfoIndex + _k][cidx + _i].visible = "hidden";
          }
        }
      }

      var testTxt = "";
      if (this.props.isHead && cellinfo.headText) {
        testTxt = cellinfo.headText;
      } else {
        testTxt = this.state.data[index][cellinfo.accessor];
      }

      var pivot = this.state.pivot ? this.state.pivot : 0;
      return React.createElement(
        ContainerCell,
        {
          key: ckey,
          visible: visible,
          cellinfo: cellinfo,
          left: cellinfo.left,
          json: cellinfo.json,
          cidx: cidx,
          "data-index": dataIndex,
          width: CellWidth,
          height: CellHeight
        },
        this.state.cellrenderer && this.state.cellrenderer({
          dataIndex: dataIndex,
          cidx: cidx + pivot,
          text: testTxt,
          ckey: ckey,
          rowinfoIndex: rowinfoIndex
        }),
        cellinfo.sort && React.createElement(ContainerSort, {
          accessor: cellinfo.accessor }),
        cellinfo.filter && React.createElement(ContainerFilter, {
          accessor: cellinfo.accessor })
      );
    }
  }, {
    key: "__renderData",
    value: function __renderData(rowinfo, data, index, rowinfoIndex) {
      var _this6 = this;

      var vindex = index + this.from;
      var dataIndex = rowinfo.dataIndex;
      var listId = "list_" + dataIndex;
      var renderkey = "row_" + dataIndex + "_" + rowinfoIndex;
      var rowHeight = rowinfo.height;
      var toppos = rowinfo.top;
      var classRow = "";

      return React.createElement(
        ContainerRow,
        {
          key: renderkey,
          id: listId,
          toppos: toppos,
          isTable: this.props.isTable,
          className: classRow,
          dataIndex: dataIndex,
          rowinfoIndex: rowinfoIndex,
          "row-height": rowHeight
        },
        this.state.columninfo[rowinfoIndex].map(function (cellinfo, cidx) {
          if (cidx >= _this6.from2 && cidx < _this6.to2) {
            return _this6.__makeCell(cellinfo, rowinfo, vindex, dataIndex, cidx, rowinfoIndex);
          }
        })
      );
    }
  }, {
    key: "__datacut",
    value: function __datacut() {
      this.rownum = this.calrownum(parseInt(this.props["viewport-height"]));
      this.colnum = this.calcolnum(parseInt(this.props["viewport-width"]));
      this.from = Math.max(0, this.state.from - 1 - this.props.overscan);
      this.from2 = Math.max(0, this.state.from2 - 2 - this.props.overscan);
      this.to = this.state.from + this.rownum + this.props.overscan;
      this.to2 = this.state.from2 + this.colnum + this.props.overscan;

      this.state.datapointer = this.props.data.slice(this.from, this.to);
      this.state.rowpointer = this.props.rowinfo.slice(this.from, this.to);
    }
  }, {
    key: "render",
    value: function render() {
      var _this7 = this;

      if (this.props.isEmpty) {
        return React.createElement("div", null);
      }
      this.state.rowinfo = this.props.rowinfo;
      this.state.columninfo = this.props.columninfo;
      this.state.data = this.props.data;
      this.state["viewport-height"] = this.props["viewport-height"];
      this.state["viewport-width"] = this.props["viewport-width"];

      this.__datacut();
      var style = {
        height: this.state["viewport-height"],
        width: this.state["viewport-width"]
      };

      var classvp = classNames({
        containerframe: true
      });
      var totalh = this.props.rowinfo[this.props.rowinfo.length - 1][this.props.rowinfo[0].length - 1].bottom;
      var totalw = this.state.columninfo[0][this.state.columninfo[0].length - 1].right;

      var stylevp = {
        height: totalh,
        width: totalw
      };

      var _state = this.state,
          dataRole = _state.dataRole,
          dataInset = _state.dataInset,
          className = _state.className;

      return React.createElement(
        "div",
        {
          onScroll: function onScroll(e) {
            e.preventDefault();
          },
          style: style,
          className: className,
          "data-role": dataRole,
          "data-inset": dataInset,
          ref: function ref(_ref2) {
            _this7.Conbody = _ref2;
          }
        },
        React.createElement(
          "div",
          {
            className: classvp,
            style: stylevp,
            ref: function ref(_ref) {
              _this7.Viewport = _ref;
            }
          },
          this.__renderLayout(this.props.children)
        )
      );
    }
  }]);

  return ContainerBody;
}(React.Component);

var ContainerRow = function (_React$Component2) {
  _inherits(ContainerRow, _React$Component2);

  function ContainerRow(props) {
    _classCallCheck(this, ContainerRow);

    var _this8 = _possibleConstructorReturn(this, (ContainerRow.__proto__ || Object.getPrototypeOf(ContainerRow)).call(this, props));

    _this8.state = Object.assign({}, props);
    _this8.context = null;
    _this8.myRef = React.createRef();
    return _this8;
  }

  _createClass(ContainerRow, [{
    key: "__bindEvent",
    value: function __bindEvent() {
      var _props = this.props,
          dataIndex = _props.dataIndex,
          rowinfoIndex = _props.rowinfoIndex;
      var _context = this.context,
          _top = _context._top,
          selectBody = _context.selectBody;

      if (this.props.isTable) {
        _top.EventManager.on("click", this.myRef.current, function (event) {
          return selectBody(event, dataIndex, rowinfoIndex);
        });
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.__bindEvent();
    }
  }, {
    key: "render",
    value: function render() {
      var _this9 = this;

      var _props2 = this.props,
          dataIndex = _props2.dataIndex,
          rowinfoIndex = _props2.rowinfoIndex;

      var toppos = this.props["toppos"] + "px";
      var style = {
        transform: "translateY(" + toppos + ")"
      };
      return React.createElement(
        ContainerContext.Consumer,
        null,
        function (context) {
          var _classNames;

          _this9.context = context;
          return React.createElement(
            "div",
            {
              style: style,
              "data-index": _this9.props["data-index"],
              className: classNames((_classNames = {
                selected: _this9.props.isTable ? context.eventinfo[dataIndex][rowinfoIndex].selected : false
              }, _defineProperty(_classNames, "row_" + dataIndex, true), _defineProperty(_classNames, "top-row", true), _classNames)),
              id: _this9.state.id,
              ref: _this9.myRef
            },
            _this9.props.children
          );
        }
      );
    }
  }]);

  return ContainerRow;
}(React.Component);

var ContainerCell = function (_React$Component3) {
  _inherits(ContainerCell, _React$Component3);

  function ContainerCell(props) {
    _classCallCheck(this, ContainerCell);

    var _this10 = _possibleConstructorReturn(this, (ContainerCell.__proto__ || Object.getPrototypeOf(ContainerCell)).call(this, props));

    _this10.state = Object.assign({}, props);
    _this10.myRef = React.createRef();
    return _this10;
  }

  _createClass(ContainerCell, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.props.cellinfo._ref = this.myRef.current;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.props.cellinfo._ref = this.myRef.current;
    }
  }, {
    key: "render",
    value: function render() {
      var _this11 = this;

      var leftpos = this.props["left"] + "px";
      var style = {
        transform: "translateX(" + leftpos + ")",
        visibility: this.props["visible"],
        height: this.props["height"] + "px",
        width: this.props["width"]
      };
      var classCell = classNames({
        selected: this.props.selected,
        column: true,
        "top-cell": true
      });
      return React.createElement(
        ContainerContext.Consumer,
        null,
        function (context) {
          return React.createElement(
            "div",
            {
              "data-index": _this11.props["data-index"],
              style: style,
              className: classCell,
              ref: _this11.myRef
            },
            _this11.props.children,
            _this11.props.json && React.createElement(TopSrcComponent, {
              json: _this11.props.json,
              parent: context._root,
              _top: context._top })
          );
        }
      );
    }
  }]);

  return ContainerCell;
}(React.Component);

var Containercheckbox = function (_React$Component4) {
  _inherits(Containercheckbox, _React$Component4);

  function Containercheckbox(props) {
    _classCallCheck(this, Containercheckbox);

    var _this12 = _possibleConstructorReturn(this, (Containercheckbox.__proto__ || Object.getPrototypeOf(Containercheckbox)).call(this, props));

    _this12.state = Object.assign({}, props);
    _this12.myRef = React.createRef();
    _this12.context = null;
    return _this12;
  }

  _createClass(Containercheckbox, [{
    key: "__bindEvent",
    value: function __bindEvent() {
      var _props3 = this.props,
          dataIndex = _props3.dataIndex,
          rowinfoIndex = _props3.rowinfoIndex;
      var _context2 = this.context,
          _top = _context2._top,
          checkHeeadtoBody = _context2.checkHeeadtoBody,
          checkBodytoHead = _context2.checkBodytoHead;

      if (this.props.isHead) {
        _top.EventManager.on("click", this.myRef.current, function (event) {
          return checkHeeadtoBody(event, dataIndex, rowinfoIndex);
        });
      } else {
        _top.EventManager.on("click", this.myRef.current, function (event) {
          return checkBodytoHead(event, dataIndex, rowinfoIndex);
        });
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.__bindEvent();
    }
  }, {
    key: "render",
    value: function render() {
      var _this13 = this;

      var style = {
        position: "absolute",
        top: "25%",
        left: "45%"
      };
      var classchk = classNames({});
      var _props4 = this.props,
          dataIndex = _props4.dataIndex,
          rowinfoIndex = _props4.rowinfoIndex;

      return React.createElement(
        ContainerContext.Consumer,
        null,
        function (context) {
          _this13.context = context;
          return React.createElement("input", {
            style: style,
            type: "checkbox",
            onChange: function onChange(e) {
              e.preventDefault();
            },
            checked: _this13.props.isHead ? context.headeventinfo[dataIndex][rowinfoIndex].checked : context.eventinfo[dataIndex][rowinfoIndex].checked,
            ref: _this13.myRef
          });
        }
      );
    }
  }]);

  return Containercheckbox;
}(React.Component);

var Resizerbox = function (_React$Component5) {
  _inherits(Resizerbox, _React$Component5);

  function Resizerbox(props) {
    _classCallCheck(this, Resizerbox);

    var _this14 = _possibleConstructorReturn(this, (Resizerbox.__proto__ || Object.getPrototypeOf(Resizerbox)).call(this, props));

    _this14.state = Object.assign({
      hover: false
    }, props);
    return _this14;
  }

  _createClass(Resizerbox, [{
    key: "makeresizer",
    value: function makeresizer() {
      var _this15 = this;

      var Draggable = ReactDraggable;
      return this.props.columninfo.map(function (column, index) {
        var style = {
          height: _this15.props.height + "px"
        };
        return React.createElement(
          Draggable,
          {
            key: index,
            axis: "x",
            handle: ".resizer",
            position: { x: column.right, y: 0 },
            onStart: _this15.props.dragStart,
            onDrag: _this15.props.dragOver,
            onStop: _this15.props.dragEnd.bind(_this15, index)
          },
          React.createElement("div", {
            style: style,
            className: "resizer",
            onMouseEnter: _this15.toggleHover,
            onMouseLeave: _this15.toggleHover
          })
        );
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this16 = this;

      var test = {
        position: "relative",
        zIndex: 1
      };
      return React.createElement(
        "div",
        {
          style: test,
          className: "resizerbox",
          ref: function ref(_ref3) {
            _this16.box = _ref3;
          }
        },
        ">",
        this.makeresizer()
      );
    }
  }]);

  return Resizerbox;
}(React.Component);

var ContainerSort = function (_React$Component6) {
  _inherits(ContainerSort, _React$Component6);

  function ContainerSort(props) {
    _classCallCheck(this, ContainerSort);

    var _this17 = _possibleConstructorReturn(this, (ContainerSort.__proto__ || Object.getPrototypeOf(ContainerSort)).call(this, props));

    _this17.change = function (event) {
      _this17.setState({
        di: (_this17.state.di + 1) % 3
      });
    };

    _this17.context = null;
    _this17.state = {
      di: 0,
      gi: ["◾", "🔽", "🔼"]
    };
    _this17.sortbtn = React.createRef();
    return _this17;
  }

  _createClass(ContainerSort, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.__bindEvent();
    }
  }, {
    key: "__bindEvent",
    value: function __bindEvent() {
      var _this18 = this;

      var accessor = this.props.accessor;
      var _context3 = this.context,
          _top = _context3._top,
          sortChange = _context3.sortChange;

      _top.EventManager.on("click", this.sortbtn.current, function (event) {
        _this18.change(event);
        sortChange(event, _this18.state.di, _this18.props.accessor);
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this19 = this;

      var style = {};
      var _state2 = this.state,
          di = _state2.di,
          gi = _state2.gi;

      return React.createElement(
        ContainerContext.Consumer,
        null,
        function (context) {
          _this19.context = context;
          return React.createElement(
            "span",
            {
              ref: _this19.sortbtn
            },
            gi[di]
          );
        }
      );
    }
  }]);

  return ContainerSort;
}(React.Component);

var ContainerFilter = function (_React$Component7) {
  _inherits(ContainerFilter, _React$Component7);

  function ContainerFilter(props) {
    _classCallCheck(this, ContainerFilter);

    var _this20 = _possibleConstructorReturn(this, (ContainerFilter.__proto__ || Object.getPrototypeOf(ContainerFilter)).call(this, props));

    _this20.context = null;
    _this20.state = {
      keyword: ''
    };
    _this20.filterbtn = React.createRef();
    return _this20;
  }

  _createClass(ContainerFilter, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.__bindEvent();
    }
  }, {
    key: "__bindEvent",
    value: function __bindEvent() {
      var _this21 = this;

      var accessor = this.props.accessor;
      var _context4 = this.context,
          _top = _context4._top,
          filterChange = _context4.filterChange;

      _top.EventManager.on("blur", this.filterbtn.current, function (event) {
        filterChange(event, _this21.state.keyword, _this21.props.accessor);
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this22 = this;

      var style = {};
      return React.createElement(
        ContainerContext.Consumer,
        null,
        function (context) {
          _this22.context = context;
          return React.createElement(
            "form",
            null,
            React.createElement("input", {
              ref: _this22.filterbtn,
              value: _this22.state.keyword,
              onChange: function onChange(e) {
                _this22.setState({
                  keyword: e.target.value
                });
                e.preventDefault();
              }
            })
          );
        }
      );
    }
  }]);

  return ContainerFilter;
}(React.Component);var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopContentBehavior = function (_TopEventBehavior) {
    _inherits(TopContentBehavior, _TopEventBehavior);

    function TopContentBehavior(props) {
        _classCallCheck(this, TopContentBehavior);

        return _possibleConstructorReturn(this, (TopContentBehavior.__proto__ || Object.getPrototypeOf(TopContentBehavior)).call(this, props));
    }

    return TopContentBehavior;
}(TopEventBehavior);

TopContentBehavior.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {
    verticalAlignment: {
        type: String,
        options: ['top', 'middle', 'bottom']
    },

    horizontalAlignment: {
        type: String,
        options: ['left', 'center', 'right']
    }
});

TopContentBehavior.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {});var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopTextBehavior = function (_TopContentBehavior) {
    _inherits(TopTextBehavior, _TopContentBehavior);

    function TopTextBehavior(props) {
        _classCallCheck(this, TopTextBehavior);

        return _possibleConstructorReturn(this, (TopTextBehavior.__proto__ || Object.getPrototypeOf(TopTextBehavior)).call(this, props));
    }

    return TopTextBehavior;
}(TopContentBehavior);

TopTextBehavior.propConfigs = Object.assign({}, TopContentBehavior.propConfigs, {
    text: {
        type: String
    }
});

TopTextBehavior.defaultProps = Object.assign({}, TopContentBehavior.defaultProps, {});var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopInputBehavior = function (_TopTextBehavior) {
    _inherits(TopInputBehavior, _TopTextBehavior);

    function TopInputBehavior(props) {
        _classCallCheck(this, TopInputBehavior);

        var _this = _possibleConstructorReturn(this, (TopInputBehavior.__proto__ || Object.getPrototypeOf(TopInputBehavior)).call(this, props));

        _this.__updateReadonly();
        return _this;
    }

    _createClass(TopInputBehavior, [{
        key: '__updateReadonly',
        value: function __updateReadonly() {
            if (this.state.readonly === true) {
                this.addClassToTopClassList('readonly');
            } else {
                this.removeClassFromTopClassList('readonly');
            }
        }
    }, {
        key: 'handleChange',
        value: function handleChange(e) {
            this.setState({
                text: e.target.value
            });
        }
    }]);

    return TopInputBehavior;
}(TopTextBehavior);

TopInputBehavior.propConfigs = Object.assign({}, TopTextBehavior.propConfigs, {
    hint: {
        type: String
    },

    hintRemoveTiming: {
        type: String,
        default: "click"
    },

    imeMode: {
        type: String,
        default: "auto"
    },

    readonly: {
        type: Boolean,
        default: false
    },

    onChange: {
        type: Function
    }
});

TopInputBehavior.defaultProps = Object.assign({}, TopTextBehavior.defaultProps, {});var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopAutocompleteBehavior = function (_TopInputBehavior) {
    _inherits(TopAutocompleteBehavior, _TopInputBehavior);

    function TopAutocompleteBehavior(props) {
        _classCallCheck(this, TopAutocompleteBehavior);

        return _possibleConstructorReturn(this, (TopAutocompleteBehavior.__proto__ || Object.getPrototypeOf(TopAutocompleteBehavior)).call(this, props));
    }

    return TopAutocompleteBehavior;
}(TopInputBehavior);

TopAutocompleteBehavior.propConfigs = Object.assign({}, TopInputBehavior.propConfigs, {
    autoComplete: {
        type: String
    },

    autoCompleteOption: {
        type: String
    },

    autoCompleteAlign: {
        type: String,
        default: "bl"
    },

    autoCompleteMaxHeight: {
        type: String
    },

    supportEmpty: {
        type: Boolean,
        default: false
    },

    maxLength: {
        type: Number
    },

    onSelect: {
        type: Function
    }
});

TopAutocompleteBehavior.defaultProps = Object.assign({}, TopInputBehavior.defaultProps, {});var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopCheckBehavior = function (_TopTextBehavior) {
    _inherits(TopCheckBehavior, _TopTextBehavior);

    function TopCheckBehavior(props) {
        _classCallCheck(this, TopCheckBehavior);

        return _possibleConstructorReturn(this, (TopCheckBehavior.__proto__ || Object.getPrototypeOf(TopCheckBehavior)).call(this, props));
    }

    _createClass(TopCheckBehavior, [{
        key: '__initEventInternal',
        value: function __initEventInternal() {
            this.__addEventByAttr('change');
        }
    }, {
        key: '__updateChecked',
        value: function __updateChecked() {
            this.__dispatchEvent(new Event('change'));
        }
    }, {
        key: '__isCheckedTrue',
        value: function __isCheckedTrue() {
            if (this.state.trueValue === this.state.checked) return true;else return false;
        }
    }]);

    return TopCheckBehavior;
}(TopTextBehavior);

TopCheckBehavior.propConfigs = Object.assign({}, TopTextBehavior.propConfigs, {
    checked: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    checkPosition: {
        type: String,
        options: ['left', 'right'],
        default: 'left'
    },

    trueValue: {
        default: true
    },

    falseValue: {
        default: false
    },

    onChange: {
        type: Function
    },

    groupId: {
        type: String
    }
});

TopCheckBehavior.defaultProps = Object.assign({}, TopTextBehavior.defaultProps, {});var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopLayoutBehavior = function (_TopContentBehavior) {
    _inherits(TopLayoutBehavior, _TopContentBehavior);

    function TopLayoutBehavior(props) {
        _classCallCheck(this, TopLayoutBehavior);

        var _this2 = _possibleConstructorReturn(this, (TopLayoutBehavior.__proto__ || Object.getPrototypeOf(TopLayoutBehavior)).call(this, props));

        _this2.layoutChild = [];
        _this2.shouldComplete = false;
        return _this2;
    }

    _createClass(TopLayoutBehavior, [{
        key: '__layoutAttached',
        value: function __layoutAttached() {
            this.__initSrc();
        }
    }, {
        key: '__initSrc',
        value: function __initSrc(callback) {
            if (typeof this.state.src === 'string') {
                var src = this.state.src;
                if (this._top.Util.getFileExtension(src) !== 'html' && this._top.Util.getFileExtension(src) !== 'json') src = src.concat('.json');
                this.__loadSrcFile(src, callback);
            }
        }
    }, {
        key: '__loadSrcFile',
        value: function __loadSrcFile(filePath, callback) {
            var _this = this;
            this._top.Ajax.execute(filePath, {
                success: function success(data, textStatus, jqXHR) {
                    var fileExtension = _this._top.Util.getFileExtension(jqXHR.responseURL);
                    var viewControllerName = _this._top.Util.__getViewControllerName(data);
                    if (viewControllerName !== undefined && _this._top.ViewController.__map[_this.state.viewController] !== undefined && _this._top.ViewController.__map[viewControllerName] === undefined) {
                        _this._top.ViewController.__map[_this.state.viewController].__children.set(viewControllerName);
                    }
                    var viewControllerPath = _this._top.Util.__getViewControllerPath(data);
                    if (viewControllerPath) viewControllerPath = [viewControllerPath[0] + "?" + getTop().Util.guid()];
                    if (_this._top.App.__useCommonLogic() === true && viewControllerPath !== undefined) {
                        _this._top.App.__loadViewControllerFile(viewControllerPath, function (_data) {
                            _this.__onSuccessSrcLoad(_data, fileExtension, callback, viewControllerName, viewControllerPath);
                            if (_this.state.viewController !== undefined) {
                                _this._top.ViewController.__map[viewControllerName].__parent = _this.state.viewController;
                            }
                            _data = null;
                        }, data);
                    } else {
                        _this.__onSuccessSrcLoad(data, fileExtension, callback);
                        data = null;
                    }
                },
                complete: function complete() {
                    if (_this.__redrawChild !== undefined) {
                        for (var i = 0; i < _this.__redrawChild.length; i++) {
                            _this.__redrawChild[i]();
                        }
                    }
                }
            });
        }
    }, {
        key: '__onSuccessSrcLoad',
        value: function __onSuccessSrcLoad(data, fileExtension, callback, viewController, viewContrllerPathData) {
            var _this3 = this;

            if (fileExtension === 'json') {
                this.setState(function (state, props) {
                    return {
                        children: React.createElement(TopSrcComponent, { json: data, parent: _this3, _top: _this3._top, viewController: viewController, viewControllerPath: viewContrllerPathData })
                    };
                });
            } else {
                this.appendHtmlString(data);
            }
            if (typeof callback === 'function') callback();
        }
    }, {
        key: 'appendHtmlString',
        value: function appendHtmlString(htmlString) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = htmlString;
            var newChild = [];
            for (var i = 0; i < wrapper.children.length; i++) {
                newChild.push(this.initializeHtmlObjects(wrapper.children[i]));
            }
            this.setState(function (state, props) {
                return {
                    children: newChild
                };
            }, function () {
                this.complete();
            });
        }
    }, {
        key: 'initializeHtmlObjects',
        value: function initializeHtmlObjects(child) {
            var _this = this;
            var attrs = Array.prototype.slice.call(child.attributes);
            var props = {
                key: child.tagName.toUpperCase() + '-' + this._top.Render.top_index
            };
            this._top.Render.top_index++;

            attrs.map(function (attr) {
                return props[_this._top.Util.toCamelCase(attr.name)] = attr.value;
            });

            if (!props.id) {
                props.id = this._top.Util.guid();
            }

            if (!!props.class) {
                props.className = props.class;
                delete props.class;
            }

            var children = [];
            for (var i = 0; i < child.children.length; i++) {
                children.push(this.initializeHtmlObjects(child.children[i]));
            }
            props.children = children;
            var comp = this._top.Render.topWidgets[child.tagName.toLowerCase()];

            return React.createElement(comp, props, children);
        }
    }, {
        key: '__updateDisabled',
        value: function __updateDisabled() {
            if (this.props.layoutParent) {
                this.__derivedDisabled = this.props.layoutParent.state.disabled === true ? true : this.props.layoutParent.__derivedDisabled;
            } else {
                this.__derivedDisabled = this.state.disabled;
            }
            if (this.state.children.length > 0) {
                var disabled = this.__calculateDerivedDisabled();
                if (this.layoutChild) this.layoutChild.forEach(function (c) {
                    c.__updateDisabled();
                });
            }
        }
    }, {
        key: '__updateLayoutWidth',
        value: function __updateLayoutWidth(layoutWidth) {
            if (!layoutWidth) layoutWidth = this.state.layoutWidth;

            if (layoutWidth == null && this.props.tagName !== "top-foldinglayout") {
                layoutWidth = '100%';
            }

            if (layoutWidth && layoutWidth.endsWith('%')) {
                var boxing = parseInt(this.state.marginRight) + parseInt(this.state.marginLeft);
                if (boxing > 0) {
                    layoutWidth = 'calc(' + layoutWidth + ' - ' + boxing + 'px)';
                }
            }

            if (layoutWidth === 'match_parent') return;

            this.setTopStyle('width', layoutWidth);
        }
    }, {
        key: '__updateTextSize',
        value: function __updateTextSize() {
            this.setTopStyle('fontSize', '0');
        }
    }, {
        key: 'addWidget',
        value: function addWidget(widget, i) {
            var _this4 = this;

            this.setState(function (state, props) {
                var changedchilds = [];
                Object.assign(changedchilds, state.children);
                if (widget.getReactElement()) {
                    if (typeof i === "number") changedchilds.splice(i, 0, widget.getReactElement());else changedchilds.push(widget.getReactElement());
                } else {
                    if (typeof i === "number") changedchilds.splice(i, 0, React.createElement(_this4._top.Render.topWidgets[widget.getTemplate().props.tagName], widget.getTemplate().state, widget.getTemplate().state.children));else changedchilds.push(React.createElement(_this4._top.Render.topWidgets[widget.getTemplate().props.tagName], widget.getTemplate().state, widget.getTemplate().state.children));
                }
                return {
                    children: changedchilds
                };
            });
        }
    }, {
        key: 'removeWidget',
        value: function removeWidget(widget) {
            var _this5 = this;

            this.setState(function (state, props) {
                var changedchilds = [];
                Object.assign(changedchilds, state.children);
                if (widget.getReactElement() && changedchilds.indexOf(widget.getReactElement()) > -1) changedchilds.splice(changedchilds.indexOf(widget.getReactElement()), 1);else if (_this5.layoutChild.indexOf(widget.getTemplate()) > -1) changedchilds.splice(_this5.layoutChild.indexOf(widget.getTemplate()), 1);
                return {
                    children: changedchilds
                };
            });
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.layoutChild = [];
            this.setState({
                children: []
            });
        }
    }, {
        key: 'complete',
        value: function complete() {}
    }]);

    return TopLayoutBehavior;
}(TopContentBehavior);

TopLayoutBehavior.propConfigs = Object.assign({}, TopContentBehavior.propConfigs, {
    textSize: {
        type: String,
        default: '0'
    },

    src: {
        type: String
    },

    srcLoad: {
        type: Function
    }
});

TopLayoutBehavior.defaultProps = Object.assign({}, TopContentBehavior.defaultProps, {
    children: []
});

(function () {

    var LayoutBehaviorCreator = function LayoutBehaviorCreator(topInstance) {
        Layout.prototype = Object.create(topInstance.Widget.prototype);
        Layout.prototype.constructor = Layout;

        function Layout(element, props, childs) {
            topInstance.Widget.apply(this, arguments);
        }

        Layout.prototype.append = function (layoutString, callback) {
            var fileExtension = topInstance.Util.getFileExtension(layoutString);
            if (fileExtension === 'html' || fileExtension === 'json') {
                this.getTemplate().__loadSrcFile(layoutString);
            } else {
                try {
                    JSON.parse(layoutString);
                    fileExtension = 'json';
                } catch (e) {
                    fileExtension = 'html';
                }
                this.getTemplate().__onSuccessSrcLoad(layoutString, fileExtension);
                if (typeof callback === 'function') callback();
            }
        };

        Layout.prototype.html = function (htmlString) {
            this.getTemplate().__onSuccessSrcLoad(htmlString, 'html');
        };

        Layout.prototype.json = function (jsonString) {
            this.getTemplate().__onSuccessSrcLoad(jsonString, 'json');
        };

        Layout.prototype.load = function (name, callback) {
            if (typeof topInstance.configs.jsPath === 'string') {
                this.src(name + '.html', topInstance.configs.jsPath + '/' + name + '.js', callback);
            } else {
                this.src(name + '.html', name + '.js', callback);
            }
        };

        Layout.prototype.src = function (layoutFile, callback, reRender) {
            if (!layoutFile) return;
            if (topInstance.Util.getFileExtension(layoutFile) !== 'html' && topInstance.Util.getFileExtension(layoutFile) !== 'json') {
                layoutFile = layoutFile.concat('.json');
            }
            if (reRender === undefined || typeof reRender !== 'boolean') reRender = true;
            var viewController = topInstance.Util.__searchViewController(this.getTemplate()).__name;
            var viewControllerInfo = viewController ? viewController : null;
            this.getTemplate().setState({
                src: layoutFile,
                viewController: viewControllerInfo
            });
            var layoutFileName = topInstance.Util.getFileName(layoutFile);
            var rootDomId = layoutFileName.split('?')[0].split('.')[0];
            var rootDom = topInstance.Dom.selectById(rootDomId);
            if (!reRender) {
                if (!rootDom) {
                    this.getTemplate().__initSrc(callback);
                } else {
                    if (typeof callback === 'function') callback();
                }
            } else {
                this.getTemplate().__initSrc(callback);
            }
        };

        Layout.prototype.addWidget = function (widget, i) {
            this.getTemplate().addWidget(widget, i);
        };

        Layout.prototype.removeWidget = function (widget) {
            this.getTemplate().removeWidget(widget);
        };

        Layout.prototype.clear = function () {
            this.getTemplate().clear();
        };

        Layout.prototype.complete = function () {
            this.getTemplate().complete();
        };

        return Layout;
    };

    getTopUI().Widget.Layout = LayoutBehaviorCreator(getTopUI());
    getTop().Widget.Layout = LayoutBehaviorCreator(getTop());
})();var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopMaskBehavior = function (_TopAutocompleteBehav) {
    _inherits(TopMaskBehavior, _TopAutocompleteBehav);

    function TopMaskBehavior(props) {
        _classCallCheck(this, TopMaskBehavior);

        return _possibleConstructorReturn(this, (TopMaskBehavior.__proto__ || Object.getPrototypeOf(TopMaskBehavior)).call(this, props));
    }

    return TopMaskBehavior;
}(TopAutocompleteBehavior);

TopMaskBehavior.propConfigs = Object.assign({}, TopAutocompleteBehavior.propConfigs, {
    preventKey: {
        type: Boolean,
        default: false
    },

    preset: {
        type: String
    },

    format: {
        type: String
    },

    formatOption: {
        type: Object
    },

    pattern: {
        type: String
    }
});

TopMaskBehavior.defaultProps = Object.assign({}, TopAutocompleteBehavior.defaultProps, {});var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopMenuBehavior = function (_TopEventBehavior) {
    _inherits(TopMenuBehavior, _TopEventBehavior);

    function TopMenuBehavior(props) {
        _classCallCheck(this, TopMenuBehavior);

        var _this = _possibleConstructorReturn(this, (TopMenuBehavior.__proto__ || Object.getPrototypeOf(TopMenuBehavior)).call(this, props));

        _this.menuData = {
            menuItems: []
        };
        return _this;
    }

    _createClass(TopMenuBehavior, [{
        key: "initMenuItems",
        value: function initMenuItems() {
            this.menuData.menuItems = $(this.childRoot).children("top-menuitem");
            for (var i = 0; i < this.menuData.menuItems.length; i++) {
                this.menuData.menuItems[i].menuWidget = this;
            }
            if (this.state.items && this.menuData.menuItems && this.menuData.menuItems.length === 1) {
                this.state.menuLayout = this.menuData.menuItems[0].innerHTML;
            }
        }
    }, {
        key: "clearMenuItems",
        value: function clearMenuItems() {
            if (this.tagName === "TOP-MENU") var myNode = this.childRoot.firstElementChild;else var myNode = this.childRoot;
            while (myNode && myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
        }
    }, {
        key: "setItems",
        value: function setItems(items, indexKey, depth) {
            if (!depth) depth = 1;
            for (var i = 0; i < items.length; i++) {
                var isSelected = false;
                if (indexKey !== undefined) {
                    items[i].indexKey = indexKey + '_' + i;
                } else {
                    items[i].indexKey = i.toString();
                }
                if (!items[i].hasOwnProperty('depth')) {
                    items[i].depth = depth;
                }
                this.state.selectedItems.map(function (itemObj) {
                    if (itemObj.indexKey === items[i].indexKey) {
                        isSelected = true;
                    }
                });
                if (this.state.selectedKey === items[i].indexKey) {
                    this.selected = items[i];
                }
                if (isSelected) {
                    items[i].selected = true;
                } else {
                    items[i].selected = false;
                }
                if (items[i].hasOwnProperty('children')) {
                    this.setItems(items[i].children, items[i].indexKey, depth + 1);
                }
            }
        }
    }, {
        key: "complete",
        value: function complete() {}
    }]);

    return TopMenuBehavior;
}(TopEventBehavior);

var TopMenuNav = function (_React$Component) {
    _inherits(TopMenuNav, _React$Component);

    function TopMenuNav(props) {
        _classCallCheck(this, TopMenuNav);

        return _possibleConstructorReturn(this, (TopMenuNav.__proto__ || Object.getPrototypeOf(TopMenuNav)).call(this, props));
    }

    _createClass(TopMenuNav, [{
        key: "__renderArrow",
        value: function __renderArrow(item, isParent) {
            var topClass = this.props.topClass;
            var arrowKey = "arrow_" + item.indexKey;
            var arrowClass = classNames({
                'icon-arrow_filled_right': item.selected,
                'icon-arrow_filled_left': !item.selected
            });
            arrowClass += " " + topClass + "_arrow";

            return React.createElement(
                "i",
                { key: arrowKey, className: arrowClass },
                " "
            );
        }
    }, {
        key: "__getAnchor",
        value: function __getAnchor(item) {
            var depth = item.depth;
            var topClass = this.props.topClass;
            var id = item.id ? topClass + "_" + item.id : '';
            var itemClass = topClass + "_item_inner inner_depth" + depth + " " + id;
            var iconClass = topClass + "_icon icon_depth" + depth + " " + (item.icon ? item.icon : '');
            var textClass = topClass + "_text text_depth" + depth;
            var iconStyle = {};

            if (!item.icon) iconStyle['paddingRight'] = '0px';
            return React.createElement(
                "a",
                { key: 'a', className: itemClass },
                React.createElement("i", { key: 'icon', className: iconClass, style: iconStyle }),
                React.createElement(
                    "span",
                    { key: 'text', className: textClass },
                    item.text
                )
            );
        }
    }, {
        key: "__renderLiDom",
        value: function __renderLiDom() {
            var _this3 = this;

            var items = this.props.items;
            return items.map(function (item, index, array) {
                var isParent = item.children && item.children.length ? true : false;
                var selected = item.selected ? 'selected' : '';
                var depth = "depth" + item.depth;
                var liKey = "li_" + item.indexKey;
                var topClass = _this3.props.topClass;
                var openClass = selected ? topClass + "_open" : topClass + "_collapsed";
                var parentClass = isParent ? topClass + "_parent " + openClass : '';
                var liClass = topClass + "_item " + parentClass;

                liClass += " " + depth + " " + topClass + "_" + liKey + " " + selected;
                return React.createElement(
                    "li",
                    { key: liKey, className: liClass },
                    _this3.__getAnchor(item),
                    isParent ? _this3.__renderArrow(item) : ''
                );
            });
        }
    }, {
        key: "render",
        value: function render() {
            var ulStyle = {
                display: this.props.isOpened ? 'block' : 'none',
                top: this.props.top,
                left: this.props.left
            };
            var depth = "depth" + this.props.depth;
            return React.createElement(
                "ul",
                { style: ulStyle, className: "ul_" + depth },
                this.__renderLiDom(this.props.items)
            );
        }
    }]);

    return TopMenuNav;
}(React.Component);

TopMenuBehavior.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {});

TopMenuBehavior.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {});var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopResourceBehavior = function (_TopEventBehavior) {
    _inherits(TopResourceBehavior, _TopEventBehavior);

    function TopResourceBehavior(props) {
        _classCallCheck(this, TopResourceBehavior);

        return _possibleConstructorReturn(this, (TopResourceBehavior.__proto__ || Object.getPrototypeOf(TopResourceBehavior)).call(this, props));
    }

    return TopResourceBehavior;
}(TopEventBehavior);

TopResourceBehavior.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {
    src: {
        type: String
    },

    onError: {
        type: Function
    }
});

TopResourceBehavior.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {});var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopAbsolutelayoutUI = function (_TopLayoutBehavior) {
    _inherits(TopAbsolutelayoutUI, _TopLayoutBehavior);

    function TopAbsolutelayoutUI(props) {
        _classCallCheck(this, TopAbsolutelayoutUI);

        return _possibleConstructorReturn(this, (TopAbsolutelayoutUI.__proto__ || Object.getPrototypeOf(TopAbsolutelayoutUI)).call(this, props));
    }

    _createClass(TopAbsolutelayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__updatePadding',
        value: function __updatePadding() {
            _get(TopAbsolutelayoutUI.prototype.__proto__ || Object.getPrototypeOf(TopAbsolutelayoutUI.prototype), '__updatePadding', this).call(this);
            if (this.__isAttached === true) this.layoutChild.forEach(function (c) {
                console.debug('update child', c);
                c.__updateLayoutTop();
                c.__updateLayoutLeft();
                c.__updateLayoutRight();
                c.__updateLayoutBottom();
                c.forceUpdate();
            });
        }
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this2 = this;

            if (children) {
                children = React.Children.map(children, function (child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this2,
                        layoutFunction: function layoutFunction() {
                            this.topTagStyle.position = 'absolute';
                            this.topTagStyle.display = 'inline-block';
                            this.topTagStyle.verticalAlign = 'top';

                            var pWrapWidth = this.props.layoutParent.state.layoutWidth === 'wrap_content' || this.props.layoutParent.state.layoutWidth === 'auto',
                                pWrapHeight = this.props.layoutParent.state.layoutHeight === 'wrap_content' || this.props.layoutParent.state.layoutHeight === 'auto';

                            var pPaddingWidth = (parseInt(this.props.layoutParent.state.paddingRight) || 0) + (parseInt(this.props.layoutParent.state.paddingLeft) || 0),
                                pPaddingHeight = (parseInt(this.props.layoutParent.state.paddingTop) || 0) + (parseInt(this.props.layoutParent.state.paddingBottom) || 0);

                            if (this.state.layoutWidth === 'match_parent') {
                                if (pWrapWidth) {
                                    this.__updateLayoutWidth(parseInt(this.state.marginRight) + parseInt(this.state.marginLeft) + 'px');
                                } else {
                                    this.setTopTagStyle('width', 'calc(100% - ' + pPaddingWidth + 'px)');
                                    this.__updateLayoutWidth('100%');
                                }
                            } else if (this.state.layoutWidth && this.state.layoutWidth.includes('%')) {
                                this.setTopTagStyle('width', 'calc(' + this.state.layoutWidth + ' - ' + pPaddingWidth + 'px)');
                                this.__updateLayoutWidth('100%');
                            }
                            if (this.state.layoutHeight === 'match_parent') {
                                if (pWrapHeight) {
                                    this.__updateLayoutHeight(parseInt(this.state.marginTop) + parseInt(this.state.marginBottom) + 'px');
                                } else {
                                    this.setTopTagStyle('height', 'calc(100% - ' + pPaddingHeight + 'px)');
                                    this.__updateLayoutHeight('100%');
                                }
                            } else if (this.state.layoutHeight && this.state.layoutHeight.includes('%')) {
                                this.setTopTagStyle('height', 'calc(' + this.state.layoutHeight + ' - ' + pPaddingHeight + 'px)');
                                this.__updateLayoutHeight('100%');
                            }
                        }
                    });
                });
            }
            return children;
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-absolutelayout',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-absolutelayout-root', style: this.topStyle },
                    this.__setWrapperStyle(this.state.children)
                )
            );
        }
    }]);

    return TopAbsolutelayoutUI;
}(TopLayoutBehavior);

var TopAbsolutelayout = function (_TopAbsolutelayoutUI) {
    _inherits(TopAbsolutelayout, _TopAbsolutelayoutUI);

    function TopAbsolutelayout() {
        _classCallCheck(this, TopAbsolutelayout);

        return _possibleConstructorReturn(this, (TopAbsolutelayout.__proto__ || Object.getPrototypeOf(TopAbsolutelayout)).apply(this, arguments));
    }

    return TopAbsolutelayout;
}(TopAbsolutelayoutUI);

TopAbsolutelayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {});

TopAbsolutelayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-absolutelayout'
});

TopAbsolutelayout.propConfigs = Object.assign({}, TopAbsolutelayoutUI.propConfigs, {});

TopAbsolutelayout.defaultProps = Object.assign({}, TopAbsolutelayoutUI.defaultProps, {});

(function () {

    var AbsolutelayoutCreator = function AbsolutelayoutCreator(topInstance) {
        Absolutelayout.prototype = Object.create(topInstance.Widget.Layout.prototype);
        Absolutelayout.prototype.constructor = Absolutelayout;

        function Absolutelayout(element, props, childs) {
            topInstance.Widget.Layout.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-absolutelayout']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-absolutelayout'], props, childs));
            }
        }

        Absolutelayout.create = function (element, props, childs) {
            return new Absolutelayout(element, props, childs);
        };

        return Absolutelayout;
    };

    getTopUI().Widget.Layout.Absolutelayout = AbsolutelayoutCreator(getTopUI());
    getTop().Widget.Layout.Absolutelayout = AbsolutelayoutCreator(getTop());
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _defineProperty = function(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopAccordionlayoutUI = function (_TopContainerBehavior) {
    _inherits(TopAccordionlayoutUI, _TopContainerBehavior);

    function TopAccordionlayoutUI(props) {
        _classCallCheck(this, TopAccordionlayoutUI);

        return _possibleConstructorReturn(this, (TopAccordionlayoutUI.__proto__ || Object.getPrototypeOf(TopAccordionlayoutUI)).call(this, props));
    }

    _createClass(TopAccordionlayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initProperties',
        value: function __initProperties() {
            this.tabs = this.state.tabs;
            this.dom.active = null;
        }
    }, {
        key: '__render',
        value: function __render() {
            this.__initProperties();
            return React.createElement(
                'top-accordionlayout',
                { id: this.state.id, ref: this.setTopRef, 'class': 'accordion_01 ' + this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-accordionlayout-root', style: this.topStyle },
                    this.__renderlayout(this.itemLayoutDom)
                )
            );
        }
    }, {
        key: '__renderlayout',
        value: function __renderlayout(children) {
            var _this3 = this;

            if (this.tabs) {
                return this.tabs.map(function (item, index) {
                    var childrenString = _this3.htmlToReactDom(item.html);
                    var titleText = item.text ? item.text : '';
                    var info = {
                        id: item.id,
                        titleText: titleText,
                        index: index,
                        icon: item.icon
                    };
                    return _this3.__renderContainers(childrenString, info);
                });
            }
        }
    }, {
        key: '__renderContainers',
        value: function __renderContainers(children, info) {
            var hasUserIcon = info.icon ? true : false;
            var container = classNames({
                'top-accordionlayout-container': true
            });
            var title = classNames({
                'top-accordionlayout-title': true
            });
            var content = classNames({
                'top-accordionlayout-content': true
            });
            var icon = classNames({
                'top-accordionlayout-icon': true
            });
            var userIcon = classNames(_defineProperty({
                'top-accordionlayout-userIcon': true
            }, '' + info.icon, hasUserIcon));
            var contentStyle = {
                display: 'none'
            };
            var tabId = classNames(_defineProperty({}, 'top-accordionlayout_' + info.id, true));
            var divKey = tabId;
            return React.createElement(
                'div',
                { className: container, id: info.id, key: divKey },
                React.createElement(
                    'a',
                    { className: title },
                    React.createElement('i', { className: userIcon }),
                    React.createElement('i', { className: icon }),
                    info.titleText
                ),
                React.createElement(
                    'div',
                    { className: content, style: contentStyle },
                    this.__renderChilds(children)
                )
            );
        }
    }, {
        key: '__renderChilds',
        value: function __renderChilds(childs, data) {
            var _this = this;

            function replaceBindingProp(tagName, properties, data, rowIndex) {
                var dataFieldRegExp = new RegExp('{[\\w.]+}', 'g');
                var matches = [];
                var newProps = {};
                if (!properties.id) newProps.id = _this._top.Util.guid() + '_' + rowIndex;else newProps.id = properties.id + '_' + rowIndex;
                for (var key in properties) {
                    if (key === 'children') {
                        var value = [];
                        var newChilds = [];
                        for (var i = 0; i < properties[key].length; i++) {
                            value.push(replaceBindingProp(properties[key][i].props.tagName, properties[key][i].props, data, i));
                            newChilds.push(replaceBindingProp(properties[key][i].props.tagName, properties[key][i].props, data, i));
                        }
                    } else if (key === 'id') {
                        continue;
                    } else {
                        if (typeof properties[key] === 'string') matches = properties[key].match(dataFieldRegExp);
                        if (matches && matches.length === 1) {
                            var fieldName = matches[0].substring(1, matches[0].length - 1);
                            var value = data[fieldName];
                        } else {
                            var value = properties[key];
                        }
                    }
                    newProps[key] = value;
                }
                return _this._top.Widget.create(tagName, newProps, newChilds).getReactElement();
            }
            return childs.map(function (child, index, array) {
                return replaceBindingProp(child.props.tagName, child.props, data, index);
            });
        }
    }, {
        key: 'htmlToReactDom',
        value: function htmlToReactDom(htmlString) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = htmlString;
            var newChild = [];
            for (var i = 0; i < wrapper.children.length; i++) {
                newChild.push(this.initializeHtmlObjects(wrapper.children[i]));
            }
            return newChild;
        }
    }]);

    return TopAccordionlayoutUI;
}(TopContainerBehavior);

var TopAccordionlayout = function (_TopAccordionlayoutUI) {
    _inherits(TopAccordionlayout, _TopAccordionlayoutUI);

    function TopAccordionlayout(props) {
        _classCallCheck(this, TopAccordionlayout);

        return _possibleConstructorReturn(this, (TopAccordionlayout.__proto__ || Object.getPrototypeOf(TopAccordionlayout)).call(this, props));
    }

    _createClass(TopAccordionlayout, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopAccordionlayout.prototype.__proto__ || Object.getPrototypeOf(TopAccordionlayout.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent();
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            this._top.EventManager.on("click", this.dom.root, this.clickcallback.bind(this));
        }
    }, {
        key: 'clickcallback',
        value: function clickcallback(event) {
            var _this = this;
            var target = event.srcElement;
            var targetName = '';
            while (true) {
                if (target.tagName == undefined || target.tagName == null) {
                    return;
                }
                var classList = this._top.Util.__classStringToClassList(target.className);
                if (classList.includes('top-accordionlayout-title') && classList.includes('active')) {
                    targetName = 'titleActive';
                    break;
                } else if (classList.includes('top-accordionlayout-title') && !classList.includes('active')) {
                    targetName = 'titleNonActive';
                    break;
                }
                target = target.parentNode;
            };
            if (targetName === 'titleActive') {
                var container = target.parentNode,
                    content = container.children[1];

                $(content).slideUp();

                var closed = target.parentNode.id;
                target.classList.remove('active');
                this.selected = undefined;
                this.dom.active = undefined;
            } else if (targetName === 'titleNonActive') {
                var container = target.parentNode,
                    content = container.children[1];

                $(content).slideDown();

                if (this.state.autoClose && this.dom.active) {
                    var activeTitle = this.dom.active,
                        activeContent = activeTitle.parentNode.children[1];
                    activeTitle.classList.remove('active');
                    $(activeContent).slideUp();
                }

                target.classList.add('active');
                this.dom.active = target;
                this.selected = target.parentNode.id;
            }
        }
    }, {
        key: 'selectTab',
        value: function selectTab(tabIdOrIndex) {
            var tabs = this.tabs;
            if (typeof tabIdOrIndex === 'number') {
                var tabsLength = tabs.length;
                var index = tabIdOrIndex;
                if (tabsLength === 0 || tabsLength < index) return;else {
                    var id = tabs[index].id;
                    var selectedTab = this.dom.root.querySelector('#' + id);
                }
            } else {
                var selectedTab = this.dom.root.querySelector('#' + tabIdOrIndex);
            }
            if (selectedTab) {
                var selectedTitle = selectedTab.querySelector('.top-accordionlayout-title');
                if (!selectedTitle.classList.contains('active')) selectedTitle.click();
            }
        }
    }, {
        key: 'closeTab',
        value: function closeTab() {
            var selectedTab = this.dom.active;
            if (!selectedTab) return;
            selectedTab.click();
        }
    }, {
        key: 'addTab',
        value: function addTab(tabInfo) {
            if (this.tabs) {
                var tabs = JSON.parse(JSON.stringify(this.tabs));
                tabs.push(tabInfo);
                this.setState({
                    tabs: tabs
                });
            }
        }
    }, {
        key: 'removeTab',
        value: function removeTab(tabId) {
            var index = undefined,
                tabs = JSON.parse(JSON.stringify(this.tabs));
            for (var i = 0, len = tabs.length; i < len; i++) {
                if (tabs[i].id === tabId) {
                    index = i;
                    break;
                }
            }
            if (index !== undefined) {
                tabs.splice(index, 1);
                this.setState({
                    tabs: tabs
                });
            }
        }
    }, {
        key: 'getSelectedIndex',
        value: function getSelectedIndex() {
            var selectedId = this.selected;
            var tabs = this.tabs;
            var selectedIndex = 0;
            if (selectedId) {
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i].id === selectedId) selectedIndex = i;
                }
                return selectedIndex;
            } else {
                return undefined;
            }
        }
    }, {
        key: 'setContentSrc',
        value: function setContentSrc(tabId, htmlFile) {
            var _this = this;
            if (this._top.Util.getFileExtension(htmlFile) === 'html') {
                this._top.Ajax.execute(htmlFile, {
                    success: function success(data) {
                        _this.setContentHtml(tabId, data);
                    }
                });
            }
        }
    }, {
        key: 'setContentHtml',
        value: function setContentHtml(tabId, htmlString) {
            var index = undefined;
            for (var i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i].id === tabId) {
                    index = i;
                }
            }
            if (index !== undefined) {
                var tabs = JSON.parse(JSON.stringify(this.tabs));
                tabs[index].html = htmlString;
                this.setState({
                    tabs: tabs
                });
            }
        }
    }, {
        key: 'removeContent',
        value: function removeContent(tabId) {
            var index = undefined;
            for (var i = 0; i < this.tabs.length; i++) {
                if (this.tabs[i].id === tabId) {
                    index = i;
                }
            }
            if (index !== undefined) {
                var tabs = JSON.parse(JSON.stringify(this.tabs));
                tabs[index].html = '';
                this.setState({
                    tabs: tabs
                });
            }
        }
    }]);

    return TopAccordionlayout;
}(TopAccordionlayoutUI);

TopAccordionlayoutUI.propConfigs = Object.assign({}, TopContainerBehavior.propConfigs, {
    tabs: {
        type: Array,
        arrayOf: Object
    },

    selected: {
        type: String
    },

    autoClose: {
        type: Boolean,
        options: [true, false],
        default: true
    },

    onSelect: {
        type: Function
    },

    onClose: {
        type: Function
    }
});

TopAccordionlayoutUI.defaultProps = Object.assign({}, TopContainerBehavior.defaultProps, {
    tagName: 'top-accordionlayout'
});

TopAccordionlayout.propConfigs = Object.assign({}, TopAccordionlayoutUI.propConfigs, {});

TopAccordionlayout.defaultProps = Object.assign({}, TopAccordionlayoutUI.defaultProps, {});
(function () {
    var AccordionlayoutCreator = function AccordionlayoutCreator(topInstance) {
        Accordionlayout.prototype = Object.create(topInstance.Widget.Container.prototype);
        Accordionlayout.prototype.constructor = Accordionlayout;

        function Accordionlayout(element, props) {
            topInstance.Widget.Container.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-accordionlayout']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-accordionlayout'], props));
            }
        }

        Accordionlayout.create = function (element, props) {
            return new Accordionlayout(element, props);
        };

        Accordionlayout.prototype.setContentHtml = function (tabId, htmlString) {
            this.template.setContentHtml(tabId, htmlString);
        };

        Accordionlayout.prototype.setContentSrc = function (tabId, htmlFile) {
            this.template.setContentSrc(tabId, htmlFile);
        };

        Accordionlayout.prototype.removeContent = function (tabId) {
            this.template.removeContent(tabId);
        };

        Accordionlayout.prototype.selectTab = function (tabIdOrIndex) {
            this.template.selectTab(tabIdOrIndex);
        };

        Accordionlayout.prototype.closeTab = function () {
            this.template.closeTab();
        };

        Accordionlayout.prototype.getSelectedTab = function () {
            var index = this.template.getSelectedIndex();
            var tabs = this.template.tabs;
            if (index !== undefined) {
                return tabs[index];
            } else {
                return undefined;
            }
        };

        Accordionlayout.prototype.getSelectedId = function () {
            return this.template.selected;
        };

        Accordionlayout.prototype.getSelectedIndex = function () {
            var index = this.template.getSelectedIndex();
            if (index !== undefined) {
                return index;
            } else {
                return undefined;
            }
        };

        Accordionlayout.prototype.getTabs = function () {
            var tabs = this.template.tabs;
            return tabs;
        };

        Accordionlayout.prototype.append = function (htmlString, tabInfo) {
            var _this = this.getTemplate();
            if (_this._top.Util.getFileExtension(htmlString) === 'html') {
                _this._top.Ajax.execute(htmlString, {
                    success: function success(data) {
                        tabInfo.html = data;
                        var tabs = JSON.parse(JSON.stringify(_this.tabs));
                        tabs.push(tabInfo);
                        _this.setState({
                            tabs: tabs
                        });
                    }
                });
            } else {
                tabInfo.html = htmlString;
                var tabs = JSON.parse(JSON.stringify(_this.tabs));
                tabs.push(tabInfo);
                _this.setState({
                    tabs: tabs
                });
            }
        };

        Accordionlayout.prototype.addTab = function (tabInfo) {
            this.template.addTab(tabInfo);
        };

        Accordionlayout.prototype.removeTab = function (tabId) {
            this.template.removeTab(tabId);
        };
        return Accordionlayout;
    };

    getTopUI().Widget.Container.Accordionlayout = AccordionlayoutCreator(getTopUI());
    getTop().Widget.Container.Accordionlayout = AccordionlayoutCreator(getTop());
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopAlarmbadgeUI = function (_TopTextBehavior) {
	_inherits(TopAlarmbadgeUI, _TopTextBehavior);

	function TopAlarmbadgeUI(props) {
		_classCallCheck(this, TopAlarmbadgeUI);

		return _possibleConstructorReturn(this, (TopAlarmbadgeUI.__proto__ || Object.getPrototypeOf(TopAlarmbadgeUI)).call(this, props));
	}

	_createClass(TopAlarmbadgeUI, [{
		key: '__componentDidMount',
		value: function __componentDidMount() {}
	}, {
		key: '__componentDidUpdate',
		value: function __componentDidUpdate() {}
	}, {
		key: '__componentWillUpdate',
		value: function __componentWillUpdate() {}
	}, {
		key: '__componentWillUnmount',
		value: function __componentWillUnmount() {}
	}, {
		key: '__initialClassname',
		value: function __initialClassname() {
			var classTest = /(badge_01)|(badge_02)|(badge_03)/g;
			if (!classTest.test(this._top.Util.__classListToClassString(this.userClassList))) {
				this._top.Util.__addClassToClassList(this.userClassList, 'badge_01');
			}
		}
	}, {
		key: '__setIconClass',
		value: function __setIconClass() {
			return classNames('top-alarmbadge-icon', this.state.icon);
		}
	}, {
		key: '__setIconStyle',
		value: function __setIconStyle() {
			return { color: this.state.iconColor || '' };
		}
	}, {
		key: '__setTextClass',
		value: function __setTextClass() {
			return classNames('top-alarmbadge-text', this.state.type);
		}
	}, {
		key: '__setTextStyle',
		value: function __setTextStyle() {
			return { color: this.state.textColor || '' };
		}
	}, {
		key: '__render',
		value: function __render() {
			return React.createElement(
				'top-alarmbadge',
				{
					id: this.state.id,
					ref: this.setTopRef,
					'class': this.makeTopTagClassString(),
					style: this.topTagStyle },
				React.createElement(
					'div',
					{
						id: this.state.id,
						ref: this.setRootRef,
						className: 'top-alarmbadge-root',
						alt: this.state.description,
						disabled: this.__calculateDerivedDisabled(),
						style: this.topStyle },
					React.createElement('span', { className: this.__setIconClass(), style: this.__setIconStyle() }),
					React.createElement(
						'span',
						{ className: this.__setTextClass(), style: this.__setTextStyle() },
						this.state.text
					)
				)
			);
		}
	}]);

	return TopAlarmbadgeUI;
}(TopTextBehavior);

var TopAlarmbadge = function (_TopAlarmbadgeUI) {
	_inherits(TopAlarmbadge, _TopAlarmbadgeUI);

	function TopAlarmbadge(props) {
		_classCallCheck(this, TopAlarmbadge);

		return _possibleConstructorReturn(this, (TopAlarmbadge.__proto__ || Object.getPrototypeOf(TopAlarmbadge)).call(this, props));
	}

	_createClass(TopAlarmbadge, [{
		key: '__render',
		value: function __render() {
			return _get(TopAlarmbadge.prototype.__proto__ || Object.getPrototypeOf(TopAlarmbadge.prototype), '__render', this).call(this);
		}
	}]);

	return TopAlarmbadge;
}(TopAlarmbadgeUI);

TopAlarmbadgeUI.propConfigs = Object.assign({}, TopTextBehavior.propConfigs, {
	icon: {
		type: String,
		options: ['icon-apply', 'icon-arrow_potab_down', 'icon-close_window', 'icon-h_window', 'icon-question', 'icon-bell', 'icon-info', 'icon-circle_check', 'icon-circle', 'icon-monitoring', 'icon-arrow_down', 'icon-arrow_up', 'icon-arrow_left', 'icon-arrow_right', 'icon-expert', 'icon-db_connection', 'icon-setting', 'icon-arrow_filled_down', 'icon-arrow_filled_left', 'icon-arrow_filled_right', 'icon-arrow_filled_up', 'icon-arrow_thin_first', 'icon-arrow_thin_last', 'icon-arrows_left', 'icon-arrows_left_thin', 'icon-arrows_right', 'icon-arrows_right_thin', 'icon-check', 'icon-file', 'icon-folder2', 'icon-lock', 'icon-unlock', 'icon-radio_button', 'icon-radio_button_sel', 'icon-search', 'icon-square', 'icon-square_check', 'icon-square_line', 'icon-handler', 'icon-hamburger_menu2', 'icon-database', 'icon-ellipsis', 'icon-horizontal_line', 'icon-lock_standby_last', 'icon-lock_standby', 'icon-lock_arrow', 'icon-refresh', 'icon-Critical', 'icon-fatal', 'icon-menu_list', 'icon-menu_card', 'icon-command2', 'icon-desktop', 'icon-refresh2', 'icon-info2', 'icon-inventory2', 'icon-notebook', 'icon-horizontal_line_bold', 'icon-topology_i_webtob', 'icon-topology_application', 'icon-topology_cds', 'icon-topology_container', 'icon-topology_coreswitch', 'icon-topology_edgeswitch', 'icon-topology_externalgateway', 'icon-topology_generalhost', 'icon-topology_generalhost2', 'icon-minimap', 'icon-camera', 'icon-topology', 'icon-topology_jeus', 'icon-topology_masterhost', 'icon-topology_po', 'icon-topology_service', 'icon-n_window', 'icon-topology_servicegroup', 'icon-topology_tibero', 'icon-topology_web2b', 'icon-tree', 'icon-v_window', 'icon-tree_menu', 'icon-administrator_02', 'icon-bookmark', 'icon-won', 'icon-won-line', 'icon-won_shape', 'icon-zoom_in', 'icon-zoom_out', 'icon-accordion_select', 'icon-accordion_unselect', 'icon-add', 'icon-administrator', 'icon-card', 'icon-time', 'icon-line', 'icon-confirm', 'icon-cloud_bad', 'icon-arrow_potab_up', 'icon-calendar1', 'icon-canceled', 'icon-cart', 'icon-chart_defined', 'icon-chart_error', 'icon-chart_failed', 'icon-chart_running', 'icon-chart_stop', 'icon-chart_terminating', 'icon-cloud_good', 'icon-download_xml', 'icon-chart_waiting', 'icon-clone', 'icon-cloud_logo', 'icon-expand', 'icon-copy', 'icon-cpu', 'icon-delete', 'icon-deploy', 'icon-dollar', 'icon-extract', 'icon-edit', 'icon-fit_round', 'icon-fold_btn', 'icon-info_02', 'icon-message', 'icon-ellipsis_vertical_big', 'icon-ellipsis_vertical_small', 'icon-fit', 'icon-message_02', 'icon-fold', 'icon-lnb_appframework', 'icon-lnb_backup', 'icon-lnb_cds', 'icon-lnb_container', 'icon-lnb_dashboard', 'icon-lnb_database', 'icon-lnb_filesystem', 'icon-lnb_metereing', 'icon-lnb_network', 'icon-loading', 'icon-loading_narrow', 'icon-memory', 'icon-analysis', 'icon-minus_round_square', 'icon-minus_square', 'icon-minus_thick', 'icon-minus_thin', 'icon-play_pause', 'icon-play_resume', 'icon-play_stop', 'icon-circle_save', 'icon-plus_round_square', 'icon-plus_square', 'icon-plus_thick', 'icon-plus_thin', 'icon-project', 'icon-service', 'icon-topology_i_application', 'icon-topology_i_container', 'icon-topology_i_coreswitch', 'icon-topology_i_edgeswitch', 'icon-topology_i_externalgateway', 'icon-topology_i_generalhost', 'icon-topology_i_generalhost2', 'icon-topology_i_jeus', 'icon-topology_i_masterhost', 'icon-topology_i_po', 'icon-topology_i_service', 'icon-topology_i_servicegroup', 'icon-topology_i_tibero', 'icon-circle_search', 'icon-move', 'icon-circle_move', 'icon-circle_question', 'icon-4', 'icon-5', 'icon-1', 'icon-2', 'icon-3', 'icon-question_02', 'icon-recommend', 'icon-speaker', 'icon-unfold', 'icon-upload_xml', 'icon-topology_backhend', 'icon-topology_server', 'icon-close', 'icon-accordion_action', 'icon-minus_shape', 'icon-plus_shape', 'icon-0', 'icon-9', 'icon-6', 'icon-7', 'icon-8', 'icon-topology_autoscalling', 'icon-topology_i_server', 'icon-topology_rmiserver', 'icon-topology_webserver', 'icon-topology_messagequeue', 'icon-topology_httpserver', 'icon-topology_database', 'icon-topology_i_backhend', 'icon-topology_linenfill', 'icon-chart_bar2', 'icon-topology_line', 'icon-ofmanager', 'icon-csp', 'icon-topology_i_router', 'icon-topology_i_computingnode', 'icon-topology_i_storagenode', 'icon-collapse_all', 'icon-expand_all', 'icon-redo', 'icon-undo', 'icon-topology_router', 'icon-topology_storagenode', 'icon-topology_computingnode', 'icon-infrastructure', 'icon-bigdata', 'icon-development', 'icon-mainframe_to_cloud', 'icon-middleware', 'icon-cloud_management', 'icon-communication_group', 'icon-sorting', 'icon-storage_db', 'icon-storage_file', 'icon-star', 'icon-tenant', 'icon-ip', 'icon-download', 'icon-shared', 'icon-ordering', 'icon-read', 'icon-unread', 'icon-reply', 'icon-apply2', 'icon-extract2', 'icon-add2', 'icon-detail', 'icon-arrows_up', 'icon-arrows_down', 'icon-arrow_num_filled_down', 'icon-arrow_num_filled_up', 'icon-command', 'icon-eventhistory', 'icon-inventory', 'icon-policy', 'icon-prozone_arrow_down_circleline', 'icon-prozone_arrow_right2', 'icon-prozone_arrow_up_circleline', 'icon-prozone_bell', 'icon-prozone_critical', 'icon-prozone_disk', 'icon-prozone_file', 'icon-prozone_inactive_circle', 'icon-start', 'icon-tcc_help', 'icon-prozone_member', 'icon-prozone_time', 'icon-prozone_total', 'icon-storage_block', 'icon-storage_object', 'icon-switch', 'icon-template', 'icon-application', 'icon-cds_square_check_line', 'icon-compute', 'icon-controller', 'icon-dns', 'icon-groupmapping', 'icon-image', 'icon-pronet_coreswitch', 'icon-pronet_edgeswitch', 'icon-prozone_delete', 'icon-prozone_header_arrow_left', 'icon-prozone_start', 'icon-rulegroup', 'icon-snapshot', 'icon-storage', 'icon-attach', 'icon-prozone_arrow_left', 'icon-prozone_arrow_right', 'icon-prozone_recommend', 'icon-prozone_tenant', 'icon-node', 'icon-resource', 'icon-rule', 'icon-server', 'icon-server2', 'icon-session', 'icon-setting2', 'icon-prozone_paasta', 'icon-layout_07', 'icon-layout_08', 'icon-layout_09', 'icon-master', 'icon-monitoring_2', 'icon-chart_pie', 'icon-chart_scatter', 'icon-chart_scatter2', 'icon-chart_stackedcolumn', 'icon-chart_table', 'icon-chart_table2', 'icon-clock', 'icon-cluster', 'icon-folder', 'icon-layout_01', 'icon-layout_02', 'icon-layout_03', 'icon-layout_04', 'icon-layout_05', 'icon-layout_06', 'icon-chart_heatmap', 'icon-chart_line', 'icon-chart_line2', 'icon-chart_line3', 'icon-prozone_cdsmaster', 'icon-prozone_close', 'icon-prozone_dbmanagement', 'icon-prozone_Inframanagement', 'icon-prozone_paas', 'icon-prozone_wasmanagement', 'icon-calendar2', 'icon-chart_area', 'icon-chart_area1', 'icon-chart_area2', 'icon-chart_area3', 'icon-chart_bar', 'icon-chart_bar-line', 'icon-chart_bar-line2', 'icon-chart_donut', 'icon-cds_desktop', 'icon-cds_pool', 'icon-check_all', 'icon-disconnect', 'icon-download2', 'icon-lm_job', 'icon-lm_provisioning', 'icon-paas_product_cluster', 'icon-prozone_date', 'icon-uncheck_all', 'icon-upload', 'icon-prozone_manual', 'icon-chart_pie2', 'icon-gpu', 'icon-prozone_info_circleline', 'icon-prozone_warmevent', 'icon-ic_software', 'icon-lm_machine', 'icon-ic_password_hide', 'icon-ic_password_show', 'icon-prozone_edit', 'icon-prozone_acl', 'icon-lms_issue_license', 'icon-work_add', 'icon-work_add_people', 'icon-work_bookmark', 'icon-work_box', 'icon-work_calendar', 'icon-work_cancel', 'icon-work_check', 'icon-work_close', 'icon-work_commat', 'icon-work_comment', 'icon-work_dashboard', 'icon-work_delete', 'icon-work_document', 'icon-work_download', 'icon-work_edit', 'icon-work_email', 'icon-work_exit', 'icon-work_explain', 'icon-work_filter1', 'icon-work_folder', 'icon-work_format_list', 'icon-work_home', 'icon-work_horizon', 'icon-work_img_file', 'icon-work_important', 'icon-work_info', 'icon-filter', 'icon-filter_setting', 'icon-pin', 'icon-work_like', 'icon-work_lock', 'icon-work_menu', 'icon-work_mobile', 'icon-work_next', 'icon-work_noti_off', 'icon-work_noti_on', 'icon-work_office', 'icon-work_open', 'icon-work_people', 'icon-work_person', 'icon-work_phone', 'icon-work_pin', 'icon-work_previous', 'icon-work_search', 'icon-work_send', 'icon-work_settings', 'icon-work_share', 'icon-work_smile', 'icon-work_sorting_down', 'icon-work_sorting_up', 'icon-work_star', 'icon-work_tocell', 'icon-work_topoint', 'icon-work_toword', 'icon-work_vertical', 'icon-work_video', 'icon-work_video_file', 'icon-work_view1', 'icon-work_window1', 'icon-palette_absolutelayout', 'icon-palette_alarmbadge', 'icon-palette_breadcrumb', 'icon-palette_button', 'icon-palette_chart', 'icon-palette_checkbox', 'icon-palette_chip', 'icon-palette_colorpicker', 'icon-palette_customwidgetholder', 'icon-palette_dashboard', 'icon-palette_datepicker1', 'icon-palette_foldinglayout', 'icon-palette_framelayout', 'icon-palette_gridlayout', 'icon-palette_htmleditor1', 'icon-palette_icon', 'icon-palette_imagebutton', 'icon-palette_imageview', 'icon-palette_include', 'icon-palette_linearlayout', 'icon-palette_listview', 'icon-palette_menuholder', 'icon-palette_pagination', 'icon-palette_panel', 'icon-palette_progressbar', 'icon-palette_radiobutton', 'icon-palette_selectbox', 'icon-palette_slider', 'icon-palette_spinner', 'icon-palette_splitterlayout', 'icon-palette_stepper', 'icon-palette_switch', 'icon-palette_tablayout', 'icon-palette_tableview', 'icon-palette_textarea', 'icon-palette_textfield', 'icon-palette_textview', 'icon-palette_treeview', 'icon-window_maximum', 'icon-window_original', 'icon-work_attachfile', 'icon-work_calendar_add', 'icon-work_calendar_start', 'icon-work_checklist', 'icon-work_color', 'icon-work_company1', 'icon-work_complete_state', 'icon-work_crown', 'icon-work_exchange', 'icon-work_expand', 'icon-work_filter', 'icon-work_folder_add', 'icon-work_folder_del', 'icon-work_location', 'icon-work_maximum', 'icon-work_minimum', 'icon-work_module', 'icon-work_notebook', 'icon-work_pdf', 'icon-work_save', 'icon-work_stack', 'icon-work_tag', 'icon-work_tag_add', 'icon-work_top', 'icon-work_view', 'icon-work_window', 'icon-work_window_h', 'icon-work_zip', 'icon-work_note', 'icon-work_schedule', 'icon-work_conference_share', 'icon-work_conference_tmaxcloud', 'icon-work_mic_off1', 'icon-work_mic_on', 'icon-work_video_off1', 'icon-work_volume_01', 'icon-work_volume_02', 'icon-work_volume_03', 'icon-work_calendar_end', 'icon-work_company', 'icon-work_emoji_1', 'icon-work_emoji_2', 'icon-work_emoji_3', 'icon-work_help1', 'icon-work_notice', 'icon-work_private1', 'icon-work_recent', 'icon-work_tconference', 'icon-work_tphone', 'icon-work_tstudy', 'icon-calendar', 'icon-palette_accordionlayout', 'icon-palette_codeditor', 'icon-palette_datepicker', 'icon-palette_flowlayout', 'icon-palette_htmleditor', 'icon-palette_videoview', 'icon-palette_webview', 'icon-work_conference_fit', 'icon-work_conference_reduction', 'icon-work_addressbook', 'icon-work_folder_file_location', 'icon-work_mic_off', 'icon-work_restartsvg', 'icon-work_video_off', 'icon-work_view_3panel', 'icon-work_help', 'icon-work_quick', 'icon-cloud_cluster_group', 'icon-cloud_db', 'icon-cloud_domain', 'icon-hyper_bar_chart', 'icon-hyper_boxplot', 'icon-hyper_bubble_chart', 'icon-hyper_converge_gateway', 'icon-hyper_data_manipulation', 'icon-hyper_data_object', 'icon-hyper_data_prep', 'icon-hyper_data_source', 'icon-hyper_data_table', 'icon-hyper_datajob', 'icon-hyper_diverge_gateway', 'icon-hyper_histogtam', 'icon-hyper_line_chart', 'icon-hyper_machine_learning', 'icon-hyper_panmode', 'icon-hyper_pie_chart', 'icon-hyper_scatterplot', 'icon-hyper_servicejob', 'icon-hyper_SQLquery', 'icon-hyper_stream_object', 'icon-hyper_timeout', 'icon-hyper_timer', 'icon-hyper_user_defined', 'icon-hyper_validation', 'icon-hyper_virtual_model', 'icon-hyper_virtual_table', 'icon-hyper_zoom_actual', 'icon-hyper_zoom_fit', 'icon-hyper_zoomin', 'icon-hyper_zoomout', 'icon-work_align_bottom', 'icon-work_align_left', 'icon-work_align_middle', 'icon-work_align_right', 'icon-work_align_top', 'icon-work_chart', 'icon-work_collapse', 'icon-work_double_arrow', 'icon-work_menu_hide', 'icon-work_menu_open', 'icon-work_noti_fail', 'icon-work_noti_info', 'icon-work_noti_warning', 'icon-work_number', 'icon-work_picture', 'icon-work_private', 'icon-work_redo', 'icon-work_run', 'icon-work_stop', 'icon-work_table', 'icon-work_text', 'icon-work_time', 'icon-work_tmaxcloudspace', 'icon-work_txt', 'icon-work_undo', 'icon-work_web', 'icon-work_app_ic_tconference', 'icon-work_app_ic_tdrive', 'icon-work_app_ic_tmail', 'icon-work_app_ic_tnote', 'icon-work_app_ic_tschedule', 'icon-work_app_ic_ttalk', 'icon-work_app_ic_ttask', 'icon-work_folder_locationsvg', 'icon-soft_both', 'icon-soft_dev', 'icon-soft_inbound', 'icon-soft_ops', 'icon-soft_outbound', 'icon-cloud_mapping', 'icon-cloud_switch', 'icon-lnb_customer', 'icon-lnb_host', 'icon-lnb_import', 'icon-lnb_partner', 'icon-lnb_pipeline', 'icon-lnb_virtualmachine', 'icon-work_app_ic_add', 'icon-work_app_ic_cloudoffice', 'icon-work_app_ic_dashboard', 'icon-soft_keyboard']
	},

	type: {
		type: String,
		options: ['fatal', 'critical', 'warning', 'normal', 'down', 'informative'],
		default: 'informative'
	},

	iconColor: {
		type: String
	}
});

TopAlarmbadgeUI.defaultProps = Object.assign({}, TopTextBehavior.defaultProps, {
	tagName: 'top-alarmbadge'
});

TopAlarmbadge.propConfigs = Object.assign({}, TopAlarmbadgeUI.propConfigs, {});

TopAlarmbadge.defaultProps = Object.assign({}, TopAlarmbadgeUI.defaultProps, {});

(function () {
	var AlarmbadgeCreator = function AlarmbadgeCreator(topInstance) {
		Alarmbadge.prototype = Object.create(topInstance.Widget.prototype);
		Alarmbadge.prototype.constructor = Alarmbadge;

		function Alarmbadge(element, props) {
			topInstance.Widget.apply(this, arguments);
			if (element instanceof topInstance.Render.topWidgets['top-alarmbadge']) {
				this.setTemplate(element);
			} else {
				this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-alarmbadge'], props));
			}
		}

		Alarmbadge.create = function (element, props) {
			return new Alarmbadge(element, props);
		};

		return Alarmbadge;
	};

	getTopUI().Widget.Alarmbadge = AlarmbadgeCreator(getTopUI());
	getTop().Widget.Alarmbadge = AlarmbadgeCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopBreadcrumbUI = function (_TopContentBehavior) {
    _inherits(TopBreadcrumbUI, _TopContentBehavior);

    function TopBreadcrumbUI(props) {
        _classCallCheck(this, TopBreadcrumbUI);

        var _this2 = _possibleConstructorReturn(this, (TopBreadcrumbUI.__proto__ || Object.getPrototypeOf(TopBreadcrumbUI)).call(this, props));

        _this2.state.behindNodes = [];
        _this2.state.frontNodes = _this2.state.nodes;
        _this2.standardIndex = 0;
        _this2.listTop = 0;
        return _this2;
    }

    _createClass(TopBreadcrumbUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            if (this.state.type === '2line' && this.layoutWidth) {
                this.__setNodesForList();
                this.setState({
                    frontNodes: this.frontNodes,
                    behindNodes: this.behindNodes
                });
            }
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'getElement',
        value: function getElement() {
            return this.dom.container;
        }
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this3 = this;

            _get(TopBreadcrumbUI.prototype.__proto__ || Object.getPrototypeOf(TopBreadcrumbUI.prototype), '__initDomRef', this).call(this);
            this.dom.container = null;
            this.setContainerRef = function (element) {
                _this3.dom.container = element;
            };
        }
    }, {
        key: '__setNodesForList',
        value: function __setNodesForList() {
            var _this4 = this;

            var dividerWidth = 10;
            var frontNodes = [];
            var behindNodes = [];
            var sumWidth = 0;

            for (var i = this.dom.textContainers.length - 1; i !== 0; i--) {
                var con = this.dom.textContainers[i];
                var width = con.textContainerDom.getBoundingClientRect().width + dividerWidth;
                var newWidth = sumWidth + width;
                if (newWidth > this.layoutWidth) {
                    this.standardIndex = i;
                    break;
                } else {
                    sumWidth = newWidth;
                }
            }
            this.state.nodes.map(function (node, index, array) {
                if (index < _this4.standardIndex) {
                    behindNodes.push(node);
                } else {
                    frontNodes.push(node);
                }
            });
            this.frontNodes = frontNodes;
            this.behindNodes = behindNodes;
        }
    }, {
        key: '__renderSingleLineNodes',
        value: function __renderSingleLineNodes() {
            var _this5 = this;

            var nodes = this.state.nodes;
            return nodes.map(function (node, index, array) {
                var nodeSpanClass = index < array.length - 1 ? 'top-breadcrumb-default' : 'top-breadcrumb-current';
                return [node.selected ? React.createElement(
                    'a',
                    { key: _this5.state.id + '_node_' + index, href: node.selected.startsWith('/') ? 'javascript:getTop().App.routeTo("' + node.selected + '")' : node.selected },
                    React.createElement(
                        'span',
                        { key: _this5.state.id + '_node_' + index, className: nodeSpanClass },
                        node.text
                    )
                ) : React.createElement(
                    'span',
                    { key: _this5.state.id + '_node_' + index, className: nodeSpanClass },
                    node.text
                ), index < array.length - 1 && React.createElement(
                    'span',
                    { key: _this5.state.id + '_divider_' + index, className: 'top-breadcrumb-divider' },
                    '>'
                )];
            });
        }
    }, {
        key: '__renderDoubleLineNodes',
        value: function __renderDoubleLineNodes() {
            var _this6 = this;

            var nodes = this.state.frontNodes;
            this.dom.textContainers = [];

            var isCurrent = false;

            var href = '';
            return nodes.map(function (node, index, array) {
                if (index === array.length - 1) {
                    isCurrent = true;
                }
                var trueIndex = _this6.standardIndex + index;
                var key = 'TextContainer_' + trueIndex;
                return React.createElement(TopBreadcrumbTextContainer, {
                    text: node.text,
                    subtext: node.subtext,
                    index: trueIndex,
                    isCurrent: isCurrent,
                    href: href,
                    key: key,
                    ref: function ref(_ref) {
                        return _this6.dom.textContainers.push(_ref);
                    } });
            });
        }
    }, {
        key: '__renderList',
        value: function __renderList() {
            var behindNodes = this.state.behindNodes;

            var forList = true;
            var href = '';

            return behindNodes.map(function (node, index, array) {
                var listName = 'list_' + index;
                var listClass = 'top-breadcrumb-list ' + listName;
                var key = 'TextContainer_' + index;
                return React.createElement(
                    'li',
                    { className: listClass, key: listName },
                    React.createElement(TopBreadcrumbTextContainer, {
                        text: node.text,
                        subtext: node.subtext,
                        index: index,
                        key: key,
                        href: href,
                        forList: forList })
                );
            });
        }
    }, {
        key: '__renderButtonContainer',
        value: function __renderButtonContainer() {
            var isButtonNeeded = this.state.behindNodes.length;
            var display = this.state.isButtonOpened ? 'block' : 'none';
            var ulStyle = {
                display: display,
                top: this.listTop
            };

            if (isButtonNeeded) {
                return [React.createElement(
                    'ul',
                    { className: 'top-breadcrumb-list-container', style: ulStyle, key: 'buttonUl' },
                    this.__renderList()
                ), React.createElement(
                    'div',
                    { className: 'top-breadcrumb-button', key: 'buttonContainer' },
                    React.createElement('span', { className: 'top-breadcrumb-button-icon icon-arrow_filled_down' })
                )];
            }
        }
    }, {
        key: '__renderNodes',
        value: function __renderNodes() {
            if (this.state.type === '1line') {
                var containerClass = classNames({
                    'top-breadcrumb-container': true,
                    'basic': true
                });
                return React.createElement(
                    'div',
                    { ref: this.setContainerRef, className: containerClass },
                    this.__renderSingleLineNodes()
                );
            } else {
                var buttonContainerClass = classNames({
                    'top-breadcrumb-button-container': true,
                    'top-breadcrumb-list_collapsed': !this.state.isButtonOpened,
                    'top-breadcrumb-list_open': this.state.isButtonOpened,
                    'active': this.state.isButtonOpened
                });
                var containerClass = classNames({
                    'top-breadcrumb-container': true,
                    'doubleLine': true,
                    'withButton': this.state.withButton
                });
                return [React.createElement(
                    'div',
                    { className: buttonContainerClass, key: 'buttonContainer' },
                    this.__renderButtonContainer()
                ), React.createElement(
                    'div',
                    { ref: this.setContainerRef, className: containerClass, key: 'container' },
                    this.__renderDoubleLineNodes()
                )];
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            if (this.state.layoutWidth) {
                this.layoutWidth = this.state.layoutWidth.split('px')[0] * 1;
            }
            return React.createElement(
                'top-breadcrumb',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { ref: this.setRootRef, className: 'top-breadcrumb-root', style: this.topStyle },
                    this.__renderNodes()
                )
            );
        }
    }]);

    return TopBreadcrumbUI;
}(TopContentBehavior);

var TopBreadcrumb = function (_TopBreadcrumbUI) {
    _inherits(TopBreadcrumb, _TopBreadcrumbUI);

    function TopBreadcrumb(props) {
        _classCallCheck(this, TopBreadcrumb);

        var _this7 = _possibleConstructorReturn(this, (TopBreadcrumb.__proto__ || Object.getPrototypeOf(TopBreadcrumb)).call(this, props));

        _this7.handlerForButtonClick = function (target) {
            if (_this7.state.isButtonOpened) {
                _this7.setState({
                    isButtonOpened: false
                });
            } else {
                _this7.listTop = target.getBoundingClientRect().top + target.getBoundingClientRect().height + 'px';
                _this7.setState({
                    isButtonOpened: true
                });
            }
        };

        return _this7;
    }

    _createClass(TopBreadcrumb, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopBreadcrumb.prototype.__proto__ || Object.getPrototypeOf(TopBreadcrumb.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent();
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            this._top.EventManager.on("click", this.dom.root, this.clickcallback.bind(this));
        }
    }, {
        key: 'clickcallback',
        value: function clickcallback(event) {
            var _this = this;
            var target = event.srcElement;
            var targetName = '';
            while (true) {
                var classList = this._top.Util.__classStringToClassList(target.className);
                if (target.tagName == undefined || target.tagName == null) {
                    return;
                }
                if (classList.includes('top-breadcrumb-button')) {
                    targetName = 'Button';
                    break;
                }
                target = target.parentNode;
            };

            if (target && targetName) {
                var eventHandlerName = 'handlerFor' + targetName + 'Click';
                this[eventHandlerName](target);
            }
        }
    }]);

    return TopBreadcrumb;
}(TopBreadcrumbUI);

var TopBreadcrumbTextContainer = function (_React$Component) {
    _inherits(TopBreadcrumbTextContainer, _React$Component);

    function TopBreadcrumbTextContainer(props) {
        _classCallCheck(this, TopBreadcrumbTextContainer);

        return _possibleConstructorReturn(this, (TopBreadcrumbTextContainer.__proto__ || Object.getPrototypeOf(TopBreadcrumbTextContainer)).call(this, props));
    }

    _createClass(TopBreadcrumbTextContainer, [{
        key: 'render',
        value: function render() {
            var _this9 = this;

            var containerClass = classNames({
                'top-breadcrumb-text-container': true,
                'current': this.props.isCurrent,
                'default': !this.props.isCurrent
            });
            containerClass += ' index_' + this.props.index;

            var textClass = classNames({
                'top-breadcrumb-current': this.props.isCurrent,
                'top-breadcrumb-default': !this.props.isCurrent
            });
            var aKey = 'textContainer_' + this.props.index;
            var dividerKey = 'divider' + this.props.index;
            var subtextClass = textClass + ' subtext';
            textClass += ' text';

            var href = this.props.href;

            return [React.createElement(
                'a',
                { className: containerClass, key: aKey, ref: function ref(_ref2) {
                        return _this9.textContainerDom = _ref2;
                    } },
                React.createElement(
                    'div',
                    { className: 'texts' },
                    React.createElement(
                        'div',
                        { className: textClass },
                        this.props.text
                    ),
                    React.createElement(
                        'div',
                        { className: subtextClass },
                        this.props.subtext
                    )
                )
            ), this.props.isCurrent || this.props.forList ? '' : React.createElement('div', { className: 'top-breadcrumb-divider icon-arrows_right_thin', key: dividerKey })];
        }
    }]);

    return TopBreadcrumbTextContainer;
}(React.Component);

TopBreadcrumbUI.propConfigs = Object.assign({}, TopContentBehavior.propConfigs, {
    type: {
        type: String,
        default: '1line',
        options: ['2line', '1line']
    },

    nodes: {
        type: Array,
        arrayOf: Object,
        default: []
    },

    textMaxWidth: {
        type: String
    },

    listLocation: {
        type: String,
        options: ['bl', 'br', 'tl', 'tr']
    },

    listMaxHeight: {
        type: String
    },

    onChange: {
        type: Function
    }
});

TopBreadcrumbUI.defaultProps = Object.assign({}, TopContentBehavior.defaultProps, {
    tagName: 'top-breadcrumb'
});

TopBreadcrumb.propConfigs = Object.assign({}, TopBreadcrumbUI.propConfigs, {});

TopBreadcrumb.defaultProps = Object.assign({}, TopBreadcrumbUI.defaultProps, {});

(function () {

    var BreadcrumbCreator = function BreadcrumbCreator(topInstance) {
        Breadcrumb.prototype = Object.create(topInstance.Widget.prototype);
        Breadcrumb.prototype.constructor = Breadcrumb;

        function Breadcrumb(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-breadcrumb']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-breadcrumb'], props));
            }
        }

        Breadcrumb.create = function (element, props) {
            return new Breadcrumb(element, props);
        };

        return Breadcrumb;
    };

    getTopUI().Widget.Breadcrumb = BreadcrumbCreator(getTopUI());
    getTop().Widget.Breadcrumb = BreadcrumbCreator(getTop());
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopButtonUI = function (_TopTextBehavior) {
	_inherits(TopButtonUI, _TopTextBehavior);

	function TopButtonUI(props) {
		_classCallCheck(this, TopButtonUI);

		return _possibleConstructorReturn(this, (TopButtonUI.__proto__ || Object.getPrototypeOf(TopButtonUI)).call(this, props));
	}

	_createClass(TopButtonUI, [{
		key: '__componentDidMount',
		value: function __componentDidMount() {}
	}, {
		key: '__componentDidUpdate',
		value: function __componentDidUpdate() {}
	}, {
		key: '__componentWillUpdate',
		value: function __componentWillUpdate() {}
	}, {
		key: '__componentWillUnmount',
		value: function __componentWillUnmount() {}
	}, {
		key: '__setTabIndex',
		value: function __setTabIndex() {
			var disabled = this.state.disabled;
			return disabled ? -1 : this.state.tabIndex;
		}
	}, {
		key: '__renderLabel',
		value: function __renderLabel() {
			var topLabelClass = classNames('top-button-text', { 'multi-line': this.state.multiLine });
			return React.createElement(
				'label',
				{ className: topLabelClass, key: 'label' },
				this.state.text
			);
		}
	}, {
		key: '__renderSpan',
		value: function __renderSpan() {
			var icon = this.state.icon,
			    image = this.state.image;

			var topSpanStyle = {};
			if (icon) {
				topSpanStyle['width'] = this.state.textSize;
				topSpanStyle[this.state.iconPosition === 'left' ? 'marginRight' : 'marginLeft'] = '6px';
				return React.createElement(TopIconImage, { icon: icon, style: topSpanStyle, key: 'span' });
			} else {
				var topSpanClass = classNames('top-button-image', this.state.iconPosition);
				topSpanStyle['backgroundImage'] = 'url(' + image + ')';
				return React.createElement('span', { className: topSpanClass, style: topSpanStyle, key: 'span' });
			}
		}
	}, {
		key: '__renderLabelSpan',
		value: function __renderLabelSpan() {
			var isSpan = !!(this.state.icon || this.state.image),
			    iconPosition = this.state.iconPosition;
			var labelSpan = [this.__renderLabel()];

			if (isSpan) {
				if (iconPosition === 'left') labelSpan.unshift(this.__renderSpan());else labelSpan.push(this.__renderSpan());
			}

			return labelSpan;
		}
	}, {
		key: '__render',
		value: function __render() {
			return React.createElement(
				'top-button',
				{
					id: this.state.id,
					ref: this.setTopRef,
					'class': this.makeTopTagClassString(),
					style: this.topTagStyle },
				React.createElement(
					'button',
					{
						id: this.state.id,
						ref: this.setRootRef,
						className: 'top-button-root',
						type: 'button',
						tabIndex: this.__setTabIndex(),
						style: this.topStyle },
					this.__renderLabelSpan(),
					React.createElement('div', { className: 'top-button-tooltip-wrapper' })
				)
			);
		}
	}]);

	return TopButtonUI;
}(TopTextBehavior);

var TopButton = function (_TopButtonUI) {
	_inherits(TopButton, _TopButtonUI);

	function TopButton(props) {
		_classCallCheck(this, TopButton);

		return _possibleConstructorReturn(this, (TopButton.__proto__ || Object.getPrototypeOf(TopButton)).call(this, props));
	}

	_createClass(TopButton, [{
		key: '__componentDidMount',
		value: function __componentDidMount() {}
	}, {
		key: '__componentDidUpdate',
		value: function __componentDidUpdate() {}
	}, {
		key: '__componentWillUpdate',
		value: function __componentWillUpdate() {}
	}, {
		key: '__componentWillUnmount',
		value: function __componentWillUnmount() {}
	}, {
		key: 'focus',
		value: function focus() {
			var root = this.dom.root;
			root.focus();
		}
	}, {
		key: 'blur',
		value: function blur() {
			var root = this.dom.root;
			root.blur();
		}
	}, {
		key: '__setLoading',
		value: function __setLoading(value) {
			if (value) {
				this.addClassToTopClassList('btn_loading');
				this.setTopStyle('opacity', 0.5);
			} else {
				this.removeClassFromTopClassList('btn_loading');
				this.setTopStyle('opacity', '');
			}
			this.__updateProperties({ disabled: value });
		}
	}, {
		key: '__render',
		value: function __render() {
			return _get(TopButton.prototype.__proto__ || Object.getPrototypeOf(TopButton.prototype), '__render', this).call(this);
		}
	}]);

	return TopButton;
}(TopButtonUI);

TopButtonUI.propConfigs = Object.assign({}, TopTextBehavior.propConfigs, {
	iconPosition: {
		type: String,
		options: ['left', 'right'],
		default: 'left'
	},

	icon: {
		type: String
	},

	image: {
		type: String
	}
});

TopButtonUI.defaultProps = Object.assign({}, TopTextBehavior.defaultProps, {
	tagName: 'top-button'
});

TopButton.propConfigs = Object.assign({}, TopButtonUI.propConfigs, {});

TopButton.defaultProps = Object.assign({}, TopButtonUI.defaultProps, {});

(function () {
	var ButtonCreator = function ButtonCreator(topInstance) {
		Button.prototype = Object.create(topInstance.Widget.prototype);
		Button.prototype.constructor = Button;

		function Button(element, props) {
			topInstance.Widget.apply(this, arguments);
			if (element instanceof topInstance.Render.topWidgets['top-button']) {
				this.setTemplate(element);
			} else {
				this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-button'], props));
			}
		}

		Button.create = function (element, props) {
			return new Button(element, props);
		};

		Button.prototype.setLoading = function (value) {
			value = value === undefined ? true : value;
			this.getTemplate().__setLoading(value);
		};

		return Button;
	};

	getTopUI().Widget.Button = ButtonCreator(getTopUI());
	getTop().Widget.Button = ButtonCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopCalendarUI = function (_TopEventBehavior) {
    _inherits(TopCalendarUI, _TopEventBehavior);

    function TopCalendarUI(props) {
        _classCallCheck(this, TopCalendarUI);

        return _possibleConstructorReturn(this, (TopCalendarUI.__proto__ || Object.getPrototypeOf(TopCalendarUI)).call(this, props));
    }

    _createClass(TopCalendarUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__renderCalendar',
        value: function __renderCalendar() {
            return React.createElement(WidgetNameBlock, { widgetName: 'Calendar' });
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-calendar',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-calendar-root', style: this.topStyle },
                    this.__renderCalendar()
                )
            );
        }
    }]);

    return TopCalendarUI;
}(TopEventBehavior);

var TopCalendar = function (_TopCalendarUI) {
    _inherits(TopCalendar, _TopCalendarUI);

    function TopCalendar() {
        _classCallCheck(this, TopCalendar);

        return _possibleConstructorReturn(this, (TopCalendar.__proto__ || Object.getPrototypeOf(TopCalendar)).apply(this, arguments));
    }

    return TopCalendar;
}(TopCalendarUI);

TopCalendarUI.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {});

TopCalendarUI.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {
    tagName: 'top-calendar'
});

TopCalendar.propConfigs = Object.assign({}, TopCalendarUI.propConfigs, {});

TopCalendar.defaultProps = Object.assign({}, TopCalendarUI.defaultProps, {});

(function () {

    var CalendarCreator = function CalendarCreator(topInstance) {
        Calendar.prototype = Object.create(topInstance.Widget.prototype);
        Calendar.prototype.constructor = Calendar;

        function Calendar(element, props, childs) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-calendar']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-calendar'], props, childs));
            }
        }

        Calendar.create = function (element, props, childs) {
            return new Calendar(element, props, childs);
        };

        return Calendar;
    };

    getTopUI().Widget.Calendar = CalendarCreator(getTopUI());
    getTop().Widget.Calendar = CalendarCreator(getTop());
})();var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopChartUI = function (_TopEventBehavior) {
    _inherits(TopChartUI, _TopEventBehavior);

    function TopChartUI(props) {
        _classCallCheck(this, TopChartUI);

        var _this2 = _possibleConstructorReturn(this, (TopChartUI.__proto__ || Object.getPrototypeOf(TopChartUI)).call(this, props));

        _this2.chart = null;
        return _this2;
    }

    _createClass(TopChartUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.__initChart();
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initChart',
        value: function __initChart() {
            var _this = this;

            this.__renderChart();
        }
    }, {
        key: '__renderChart',
        value: function __renderChart() {
            var root = this.dom.root,
                width = root.offsetWidth,
                height = root.offsetHeight,
                title = this.state.title || '',
                option = this.state.option,
                series = this._top.Util.__deepCopy(this.state.series),
                default_option = {
                chart: {
                    type: this.state.type,
                    width: width,
                    height: height
                },
                title: {
                    text: title
                },
                series: series
            };

            if (option) {
                this.__mergeOption(default_option, option);
            }
            this.chart = $(root).topcharts(default_option);
        }
    }, {
        key: '__updateSeries',
        value: function __updateSeries() {
            var chart = this.chart,
                series = this.state.series;
            var isRedraw = false;

            for (var i = 0, len = series.length; i < len; i++) {
                if (i === len - 1) isRedraw = true;
                chart.addSeries(series[i], isRedraw);
            }
        }
    }, {
        key: '__updateOption',
        value: function __updateOption() {
            this.chart.setOption(this.state.option);
        }
    }, {
        key: '__mergeOption',
        value: function __mergeOption(base, extend) {
            for (var key in extend) {
                if (_typeof(extend[key]) === 'object' && !Array.isArray(extend[key])) {
                    if (!base[key]) {
                        base[key] = {};
                    }
                    this.__mergeOption(base[key], extend[key]);
                } else {
                    base[key] = extend[key];
                }
            }
        }
    }, {
        key: '__setRootSize',
        value: function __setRootSize() {
            var max = '100%';
            if (!this.topTagStyle.layoutWidth) {
                this.setTopStyle('width', max);
                this.setTopTagStyle('width', max);
            }
            if (!this.topTagStyle.layoutHeight) {
                this.setTopStyle('height', max);
                this.setTopTagStyle('height', max);
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            this.__setRootSize();

            return React.createElement(
                'top-chart',
                {
                    id: this.state.id,
                    ref: this.setTopRef,
                    'class': this.makeTopTagClassString(),
                    style: this.topTagStyle },
                React.createElement('div', {
                    id: this.state.id,
                    ref: this.setRootRef,
                    className: 'top-chart-root',
                    disabled: this.__calculateDerivedDisabled(),
                    style: this.topStyle })
            );
        }
    }]);

    return TopChartUI;
}(TopEventBehavior);

var TopChart = function (_TopChartUI) {
    _inherits(TopChart, _TopChartUI);

    function TopChart() {
        _classCallCheck(this, TopChart);

        return _possibleConstructorReturn(this, (TopChart.__proto__ || Object.getPrototypeOf(TopChart)).apply(this, arguments));
    }

    return TopChart;
}(TopChartUI);

TopChartUI.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {
    type: {
        type: String,
        default: 'line',
        options: ['line', 'spline', 'area', 'step', 'area-step', 'area-spline', 'circulargauge', 'angulargauge', 'columngauge', 'bargauge', 'donut', 'pie', 'bar', 'column', 'scatter', 'boxplot', 'bubble', 'equalizer']
    },

    title: {
        type: String
    },

    series: {
        type: Array,
        arrayOf: Object
    },

    option: {
        type: Object
    }
});

TopChartUI.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {
    tagName: 'top-chart'
});

TopChart.propConfigs = Object.assign({}, TopChartUI.propConfigs, {});

TopChart.defaultProps = Object.assign({}, TopChartUI.defaultProps, {});

(function () {
    var ChartCreator = function ChartCreator(topInstance) {
        Chart.prototype = Object.create(topInstance.Widget.prototype);
        Chart.prototype.constructor = Chart;

        function Chart(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-chart']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-chart'], props));
            }
        }

        Chart.create = function (element, props) {
            return new Chart(element, props);
        };

        return Chart;
    };

    getTopUI().Widget.Chart = ChartCreator(getTopUI());
    getTop().Widget.Chart = ChartCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopCheckboxUI = function (_TopCheckBehavior) {
    _inherits(TopCheckboxUI, _TopCheckBehavior);

    function TopCheckboxUI(props) {
        _classCallCheck(this, TopCheckboxUI);

        return _possibleConstructorReturn(this, (TopCheckboxUI.__proto__ || Object.getPrototypeOf(TopCheckboxUI)).call(this, props));
    }

    _createClass(TopCheckboxUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'getElement',
        value: function getElement() {
            return this.dom.check;
        }
    }, {
        key: 'getElementForSize',
        value: function getElementForSize() {
            return this.dom.text;
        }
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;

            _get(TopCheckboxUI.prototype.__proto__ || Object.getPrototypeOf(TopCheckboxUI.prototype), '__initDomRef', this).call(this);
            this.dom.check = null;
            this.dom.text = null;
            this.setCheckRef = function (element) {
                _this2.dom.check = element;
            };
            this.setTextRef = function (element) {
                _this2.dom.text = element;
            };
        }
    }, {
        key: '__render',
        value: function __render() {
            var topDisabled = this.__calculateDerivedDisabled();
            var topLabelClass = 'top-checkbox-text ' + this.state.checkPosition + ' ' + (topDisabled ? 'disabled ' : '');

            if (this.__isCheckedTrue()) {
                topLabelClass += 'checked';
            }

            return React.createElement(
                'top-checkbox',
                {
                    id: this.state.id,
                    ref: this.setTopRef,
                    'class': this.makeTopTagClassString(),
                    disabled: topDisabled,
                    style: this.topTagStyle },
                React.createElement('input', {
                    className: 'top-checkbox-check',
                    ref: this.setCheckRef,
                    type: 'checkbox',
                    name: this.state.groupId,
                    checked: this.__isCheckedTrue(),
                    disabled: topDisabled,
                    onChange: function onChange(e) {
                        e.preventDefault();
                    } }),
                React.createElement(
                    'label',
                    {
                        className: topLabelClass,
                        ref: this.setTextRef,
                        disabled: topDisabled,
                        style: this.topStyle },
                    this.state.checkPosition === 'left' && React.createElement('i', { className: 'top-checkbox-icon' }),
                    React.createElement(
                        'span',
                        { style: this.topTextStyle },
                        this.state.text
                    ),
                    this.state.checkPosition === 'right' && React.createElement('i', { className: 'top-checkbox-icon' })
                )
            );
        }
    }]);

    return TopCheckboxUI;
}(TopCheckBehavior);

var TopCheckbox = function (_TopCheckboxUI) {
    _inherits(TopCheckbox, _TopCheckboxUI);

    function TopCheckbox() {
        _classCallCheck(this, TopCheckbox);

        return _possibleConstructorReturn(this, (TopCheckbox.__proto__ || Object.getPrototypeOf(TopCheckbox)).apply(this, arguments));
    }

    _createClass(TopCheckbox, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopCheckbox.prototype.__proto__ || Object.getPrototypeOf(TopCheckbox.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent();
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            var _this4 = this;

            this._top.EventManager.on('click', this.dom.text, function (event) {
                if (_this4.__isCheckedTrue()) _this4.setState({ 'checked': _this4.state.falseValue });else _this4.setState({ 'checked': _this4.state.trueValue });
                _this4.__updateChecked();
            });
        }
    }]);

    return TopCheckbox;
}(TopCheckboxUI);

TopCheckboxUI.propConfigs = Object.assign({}, TopCheckBehavior.propConfigs, {});

TopCheckboxUI.defaultProps = Object.assign({}, TopCheckBehavior.defaultProps, {
    tagName: 'top-checkbox'
});

TopCheckbox.propConfigs = Object.assign({}, TopCheckboxUI.propConfigs, {});

TopCheckbox.defaultProps = Object.assign({}, TopCheckboxUI.defaultProps, {});

(function () {

    var CheckboxCreator = function CheckboxCreator(topInstance) {
        Checkbox.prototype = Object.create(topInstance.Widget.prototype);
        Checkbox.prototype.constructor = Checkbox;

        function Checkbox(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-checkbox']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-checkbox'], props));
            }
        }

        Checkbox.create = function (element, props) {
            return new Checkbox(element, props);
        };

        Checkbox.prototype.isChecked = function () {
            return this.getTemplate().__isCheckedTrue();
        };

        return Checkbox;
    };

    getTopUI().Widget.Checkbox = CheckboxCreator(getTopUI());
    getTop().Widget.Checkbox = CheckboxCreator(getTop());
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopChipUI = function (_TopAutocompleteBehav) {
    _inherits(TopChipUI, _TopAutocompleteBehav);

    function TopChipUI(props) {
        _classCallCheck(this, TopChipUI);

        return _possibleConstructorReturn(this, (TopChipUI.__proto__ || Object.getPrototypeOf(TopChipUI)).call(this, props));
    }

    _createClass(TopChipUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__renderChips',
        value: function __renderChips() {
            var _this2 = this;

            var chipItems = JSON.parse(JSON.stringify(this.state.chipItems));
            if (!chipItems) return;

            var clearFlag = this.state.clear;
            return chipItems.map(function (item, index, array) {
                var topIconClass = 'top-chip-icon ' + item.icon;
                var key = 'top-chip-box_' + index;
                return React.createElement(TopChipComponent, {
                    index: index,
                    item: item,
                    id: _this2.state.id,
                    key: key });
            });
        }
    }, {
        key: '__render',
        value: function __render() {
            var iconClass = 'top-chip-icon ' + this.state.icon;

            return React.createElement(
                'top-chip',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-chip-root', disabled: this.__calculateDerivedDisabled(), style: this.topStyle },
                    React.createElement(
                        'form',
                        { autoComplete: 'off', onSubmit: function onSubmit(e) {
                                e.preventDefault();
                            } },
                        this.__renderChips(),
                        React.createElement('input', { className: 'top-chip-text', type: 'text' }),
                        React.createElement('span', { className: iconClass })
                    )
                )
            );
        }
    }]);

    return TopChipUI;
}(TopAutocompleteBehavior);

var TopChip = function (_TopChipUI) {
    _inherits(TopChip, _TopChipUI);

    function TopChip(props) {
        _classCallCheck(this, TopChip);

        var _this3 = _possibleConstructorReturn(this, (TopChip.__proto__ || Object.getPrototypeOf(TopChip)).call(this, props));

        _this3.handlerForCloseBtnClick = function (target) {
            var content = target.parentNode.parentNode;
            var index = content.className.split('index_')[1] * 1;

            _this3.close(index);
        };

        _this3.handlerForSpanIconClick = function (target) {
            console.log('click event!');
            _this3.__dispatchEvent(new Event('iconclick'));
        };

        return _this3;
    }

    _createClass(TopChip, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopChip.prototype.__proto__ || Object.getPrototypeOf(TopChip.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent();
        }
    }, {
        key: '__initEventInternal',
        value: function __initEventInternal() {
            this.__addEventByAttr('iconclick');
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            this._top.EventManager.on("click", this.dom.root, this.clickcallback.bind(this));
        }
    }, {
        key: '__updateChipItems',
        value: function __updateChipItems() {
            this.originItem = JSON.parse(JSON.stringify(this.state.chipItems));
        }
    }, {
        key: 'clickcallback',
        value: function clickcallback(event) {
            var target = event.srcElement;
            var targetName = '';
            while (true) {
                var classList = this._top.Util.__classStringToClassList(target.className);
                if (target.tagName == undefined || target.tagName == null) {
                    return;
                }
                if (classList.includes('top-chip-close')) {
                    targetName = 'CloseBtn';
                    break;
                } else if (classList.includes('top-chip-icon') && target.tagName === 'SPAN') {
                    targetName = 'SpanIcon';
                    break;
                }
                target = target.parentNode;
            };

            if (target && targetName) {
                var eventHandlerName = 'handlerFor' + targetName + 'Click';
                this[eventHandlerName](target);
            }
        }
    }, {
        key: 'add',
        value: function add(item) {
            if (!item) return;

            var chipItems = JSON.parse(JSON.stringify(this.state.chipItems));

            chipItems.push(item);
            this.setState({
                chipItems: chipItems
            });
        }
    }, {
        key: 'close',
        value: function close(index) {
            if (typeof index !== 'number' || index > this.state.chipItems.length) return;

            var chipItems = JSON.parse(JSON.stringify(this.state.chipItems));

            chipItems.splice(index, 1);
            this.setState({
                chipItems: chipItems
            });
        }
    }]);

    return TopChip;
}(TopChipUI);

var TopChipComponent = function (_React$Component) {
    _inherits(TopChipComponent, _React$Component);

    function TopChipComponent(props) {
        _classCallCheck(this, TopChipComponent);

        return _possibleConstructorReturn(this, (TopChipComponent.__proto__ || Object.getPrototypeOf(TopChipComponent)).call(this, props));
    }

    _createClass(TopChipComponent, [{
        key: 'render',
        value: function render() {
            var item = this.props.item;
            var index = this.props.index;
            var topIconClass = 'top-chip-icon ' + item.icon;
            var key = this.props.id + '_item_' + index;
            var chipBoxClass = 'top-chip-box index_' + index;
            var chipContentClass = 'top-chip-content index_' + index;
            return React.createElement(
                'div',
                { className: chipBoxClass, id: key, key: key },
                React.createElement(
                    'div',
                    { className: chipContentClass },
                    item.icon && React.createElement('i', { key: key + '_icon', className: topIconClass }),
                    React.createElement(
                        'span',
                        { key: key + '_span' },
                        item.text
                    ),
                    React.createElement('i', { key: key + '_closeBtn', className: 'top-chip-close' })
                )
            );
        }
    }]);

    return TopChipComponent;
}(React.Component);

TopChipUI.propConfigs = Object.assign({}, TopAutocompleteBehavior.propConfigs, {
    chipItems: {
        type: Array,
        arrayOf: Object,
        default: []
    },

    clear: {
        type: Boolean,
        default: true,
        options: [true, false]
    },

    icon: {
        type: String,
        default: ''
    },

    onIconclick: {
        type: Function
    },

    onAdd: {
        type: Function
    },

    keyCode: {
        type: String
    },

    onClose: {
        type: Function
    },
    draggable: {
        type: Boolean,
        value: false
    },
    hint: {
        type: String,
        aliases: ['emptyMessage']
    }
});

TopChipUI.defaultProps = Object.assign({}, TopAutocompleteBehavior.defaultProps, {
    tagName: 'top-chip'
});

TopChip.propConfigs = Object.assign({}, TopChipUI.propConfigs, {});

TopChip.defaultProps = Object.assign({}, TopChipUI.defaultProps, {});

(function () {

    var ChipCreator = function ChipCreator(topInstance) {
        Chip.prototype = Object.create(topInstance.Widget.prototype);
        Chip.prototype.constructor = Chip;

        function Chip(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-chip']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-chip'], props));
            }
        }

        Chip.create = function (element, props) {
            return new Chip(element, props);
        };

        return Chip;
    };

    getTopUI().Widget.Chip = ChipCreator(getTopUI());
    getTop().Widget.Chip = ChipCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopColorpickerUI = function (_TopEventBehavior) {
    _inherits(TopColorpickerUI, _TopEventBehavior);

    function TopColorpickerUI(props) {
        _classCallCheck(this, TopColorpickerUI);

        var _this = _possibleConstructorReturn(this, (TopColorpickerUI.__proto__ || Object.getPrototypeOf(TopColorpickerUI)).call(this, props));

        _this.__updateAlpha();
        return _this;
    }

    _createClass(TopColorpickerUI, [{
        key: "__componentDidMount",
        value: function __componentDidMount() {}
    }, {
        key: "__componentDidUpdate",
        value: function __componentDidUpdate() {}
    }, {
        key: "__componentWillUpdate",
        value: function __componentWillUpdate() {}
    }, {
        key: "__componentWillUnmount",
        value: function __componentWillUnmount() {}
    }, {
        key: "getElement",
        value: function getElement() {
            return this.dom.button;
        }
    }, {
        key: "__initDomRef",
        value: function __initDomRef() {
            var _this2 = this;

            _get(TopColorpickerUI.prototype.__proto__ || Object.getPrototypeOf(TopColorpickerUI.prototype), "__initDomRef", this).call(this);
            this.dom.button = null;
            this.setButtonRef = function (element) {
                _this2.dom.button = element;
            };
        }
    }, {
        key: "__rgbToHex",
        value: function __rgbToHex(R, G, B) {
            return this.__toHex(R) + this.__toHex(G) + this.__toHex(B);
        }
    }, {
        key: "__toHex",
        value: function __toHex(n) {
            n = parseInt(n, 10);
            if (isNaN(n)) return "00";
            n = Math.max(0, Math.min(n, 255));
            return "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16);
        }
    }, {
        key: "__hexToRgb",
        value: function __hexToRgb(hex) {
            hex = hex.replace("#", "");
            var value = hex.match(/[a-f\d]/gi);

            if (value.length == 3) hex = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];

            value = hex.match(/[a-f\d]{2}/gi);
            if (value === null) {
                return {
                    r: 0,
                    g: 0,
                    b: 0
                };
            }
            var r = parseInt(value[0], 16);
            var g = parseInt(value[1], 16);
            var b = parseInt(value[2], 16);
            return {
                r: r,
                g: g,
                b: b
            };
        }
    }, {
        key: "__rgbToHsv",
        value: function __rgbToHsv(R, G, B) {
            var rr,
                gg,
                bb,
                r = R / 255,
                g = G / 255,
                b = B / 255,
                h,
                s,
                v = Math.max(r, g, b),
                diff = v - Math.min(r, g, b),
                diffc = function diffc(c) {
                return (v - c) / 6 / diff + 1 / 2;
            };

            if (diff == 0) {
                h = s = 0;
            } else {
                s = diff / v;
                rr = diffc(r);
                gg = diffc(g);
                bb = diffc(b);

                if (r === v) {
                    h = bb - gg;
                } else if (g === v) {
                    h = 1 / 3 + rr - bb;
                } else if (b === v) {
                    h = 2 / 3 + gg - rr;
                }
                if (h < 0) {
                    h += 1;
                } else if (h > 1) {
                    h -= 1;
                }
            }
            return {
                h: Math.round(h * 360),
                s: Math.round(s * 100),
                v: Math.round(v * 100)
            };
        }
    }, {
        key: "__hsvToRgb",
        value: function __hsvToRgb(h, s, v) {
            var r, g, b;
            var i;
            var f, p, q, t;

            h = Math.max(0, Math.min(359, h));
            s = Math.max(0, Math.min(100, s));
            v = Math.max(0, Math.min(100, v));

            s /= 100;
            v /= 100;

            if (s === 0) {
                r = g = b = v;
                return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
            }
            if (v === 0) {
                return { r: 0, g: 0, b: 0 };
            }

            h /= 60;
            i = Math.floor(h);
            f = h - i;
            p = v * (1 - s);
            q = v * (1 - s * f);
            t = v * (1 - s * (1 - f));

            switch (i) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;

                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;

                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;

                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;

                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;

                default:
                    r = v;
                    g = p;
                    b = q;
            }
            return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
        }
    }, {
        key: "__rgbToRgba",
        value: function __rgbToRgba(r, g, b) {
            var a = this.state.rgba ? this.state.rgba.a : this.state.alpha ? this.state.alpha : 1;
            return { r: r, g: g, b: b, a: a };
        }
    }, {
        key: "__updateAlpha",
        value: function __updateAlpha() {
            if (this.state.alpha) {
                this.state.__color.a = this.state.alpha;
            }
        }
    }, {
        key: "__getRgbaString",
        value: function __getRgbaString() {
            return "rgba(" + this.state.__color.r + "," + this.state.__color.g + "," + this.state.__color.b + "," + this.state.__color.a + ")";
        }
    }, {
        key: "__setColor",
        value: function __setColor() {
            if (this.state.rgba) {
                return this.state.rgba;
            }
            if (this.state.rgb) {
                return this.__rgbToRgba(this.state.rgb.r, this.state.rgb.g, this.state.rgb.b);
            }
            if (this.state.hsv) {
                var rgb = this.__hsvToRgb(this.state.hsv.h, this.state.hsv.s, this.state.hsv.v);
                return this.__rgbToRgba(rgb.r, rgb.g, rgb.b);
            }
            if (this.state.hex) {
                var rgb = this.__hexToRgb(this.state.hex);
                return this.__rgbToRgba(rgb.r, rgb.g, rgb.b);
            }
            return this.state.__color;
        }
    }, {
        key: "__renderPreview",
        value: function __renderPreview() {
            this.setTopStyle('backgroundColor', this.__getRgbaString());
        }
    }, {
        key: "__render",
        value: function __render() {
            this.state.__color = this.__setColor();
            this.__renderPreview();
            return React.createElement(
                "top-colorpicker",
                { id: this.state.id, ref: this.setTopRef, "class": this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement("button", { id: this.state.id, ref: this.setButtonRef, className: "top-colorpicker-button", type: "button", disabled: this.__calculateDerivedDisabled(), style: this.topStyle })
            );
        }
    }]);

    return TopColorpickerUI;
}(TopEventBehavior);

var TopColorpicker = function (_TopColorpickerUI) {
    _inherits(TopColorpicker, _TopColorpickerUI);

    function TopColorpicker() {
        _classCallCheck(this, TopColorpicker);

        return _possibleConstructorReturn(this, (TopColorpicker.__proto__ || Object.getPrototypeOf(TopColorpicker)).apply(this, arguments));
    }

    return TopColorpicker;
}(TopColorpickerUI);

TopColorpickerUI.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {
    hex: {
        type: String,
        convert: function convert(value) {
            if (!value) return value;
            value = value.replace(/#/, '');
            var isHexNumber = value.match(/[A-Fa-f0-9]{6}/g);
            return isHexNumber ? value : 'ffffff';
        }
    },

    rgb: {
        type: Object
    },

    rgba: {
        type: Object,
        default: { a: 1 }
    },

    hsv: {
        type: Object
    },
    alpha: {
        type: Number,
        default: 1
    },
    __color: {
        type: Object,
        default: { r: 255, g: 255, b: 255, a: 1 }
    },

    onSelect: {
        type: Function
    }
});

TopColorpickerUI.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {
    tagName: 'top-colorpicker'
});

TopColorpicker.propConfigs = Object.assign({}, TopColorpickerUI.propConfigs, {});

TopColorpicker.defaultProps = Object.assign({}, TopColorpickerUI.defaultProps, {});

(function () {

    var ColorpickerCreator = function ColorpickerCreator(topInstance) {
        Colorpicker.prototype = Object.create(topInstance.Widget.prototype);
        Colorpicker.prototype.constructor = Colorpicker;

        function Colorpicker(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-colorpicker']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-colorpicker'], props));
            }
        }

        Colorpicker.create = function (element, props) {
            return new Colorpicker(element, props);
        };

        return Colorpicker;
    };

    getTopUI().Widget.Colorpicker = ColorpickerCreator(getTopUI());
    getTop().Widget.Colorpicker = ColorpickerCreator(getTop());
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopContextmenuUI = function (_TopMenuBehavior) {
    _inherits(TopContextmenuUI, _TopMenuBehavior);

    function TopContextmenuUI(props) {
        _classCallCheck(this, TopContextmenuUI);

        var _this = _possibleConstructorReturn(this, (TopContextmenuUI.__proto__ || Object.getPrototypeOf(TopContextmenuUI)).call(this, props));

        _this.state.selectedItems = [];
        _this.state.selectedKey = '';
        _this.selected = {};
        return _this;
    }

    _createClass(TopContextmenuUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__setItems',
        value: function __setItems(items) {
            var _this2 = this;

            if (!items) {
                return;
            }
            var newItems = [];
            var oneLevelParent = {};
            var twoLevelParent = {};
            var oneLevelIndex = -1;
            var twoLevelIndex = -1;
            var threeLevelIndex = -1;

            items.map(function (item, index, array) {
                var isSelected = false;
                var newItem = {
                    depth: item.level,
                    text: item.text,
                    id: item.id,
                    icon: item.icon
                };

                var isParent = false;
                if (index < array.length - 1 && item.level < array[index + 1].level) {
                    isParent = true;
                    if (items.level === 2) {
                        oneLevelParent = newItem;
                    } else if (items.level === 3) {
                        twoLevelParent = newItem;
                    }
                }

                if (item.level === 1) {
                    oneLevelIndex++;
                    if (isParent) newItem.children = [];
                    newItem.indexKey = oneLevelIndex.toString();
                    newItems.push(newItem);
                    oneLevelParent = newItem;
                    twoLevelIndex = -1;
                } else if (item.level === 2) {
                    twoLevelIndex++;
                    if (isParent) newItem.children = [];
                    newItem.indexKey = oneLevelIndex + '_' + twoLevelIndex;
                    threeLevelIndex = -1;
                    twoLevelParent = newItem;
                    oneLevelParent.children.push(newItem);
                } else if (item.level === 3) {
                    threeLevelIndex++;
                    newItem.indexKey = oneLevelIndex + '_' + twoLevelIndex + '_' + threeLevelIndex;
                    twoLevelParent.children.push(newItem);
                }

                _this2.state.selectedItems.map(function (itemObj) {
                    if (itemObj.indexKey === newItem.indexKey) {
                        isSelected = true;
                    }
                });

                if (_this2.state.selectedKey === newItem.indexKey) {
                    _this2.selected = newItem;
                }
                if (isSelected) {
                    newItem.selected = true;
                } else {
                    newItem.selected = false;
                }
            });
            return newItems;
        }
    }, {
        key: '__renderMenu',
        value: function __renderMenu(items, isOpened, indexKey, top, left) {
            var _this3 = this;

            if (!items) return;
            var navs = [];
            depth = items[0].depth;

            navs.push(React.createElement(TopMenuNav, { key: indexKey, topClass: 'top-contextmenu', top: top, left: left, isOpened: isOpened, depth: depth, items: items }));
            navs.push(items.map(function (item, index, array) {
                var isParent = item.children && item.children.length ? true : false;
                var top, left;
                var depth = item.depth;
                var isOpened = item.selected ? true : false;
                var indexKey = 'childOf_' + item.indexKey;
                _this3.state.selectedItems.map(function (selectedItem) {
                    if (selectedItem.indexKey === item.indexKey) {
                        top = selectedItem.top;
                        left = selectedItem.left;
                    }
                });
                return _this3.__renderMenu(item.children, isOpened, indexKey, top, left);
            }));
            return navs;
        }
    }, {
        key: '__render',
        value: function __render() {
            this.items = this.__setItems(this.state.items);

            var containerClass = classNames({
                'top-contextmenu-container': true,
                'open': this.state.isOpened,
                'close': !this.state.isOpened
            });
            return React.createElement(
                'top-contextmenu',
                { ref: this.setTopRef, id: this.state.id, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { ref: this.setRootRef, className: 'top-contextmenu-root', id: this.state.id, disabled: this.__calculateDerivedDisabled(), style: this.topStyle },
                    React.createElement(
                        'div',
                        { className: containerClass },
                        this.__renderMenu(this.items, this.state.isOpened, 'mainNav')
                    )
                )
            );
        }
    }]);

    return TopContextmenuUI;
}(TopMenuBehavior);

var TopContextmenu = function (_TopContextmenuUI) {
    _inherits(TopContextmenu, _TopContextmenuUI);

    function TopContextmenu(props) {
        _classCallCheck(this, TopContextmenu);

        var _this4 = _possibleConstructorReturn(this, (TopContextmenu.__proto__ || Object.getPrototypeOf(TopContextmenu)).call(this, props));

        _this4.handlerForLiClick = function (target) {
            var classList = _this4._top.Util.__classStringToClassList(target.className);
            var indexKey = target.className.split('top-contextmenu_li_')[1].split(' ')[0],
                keys = indexKey.split('_');
            var selectedLength = _this4.state.selectedItems.length,
                depth = keys.length,
                shorterLength = selectedLength > depth ? depth : selectedLength;

            var ul = target.parentNode;
            var ulBorder = window.getComputedStyle(ul, null).getPropertyValue('border').split('px')[0] * 1;

            var top = target.getBoundingClientRect().top - ulBorder + 'px';
            var left = target.getBoundingClientRect().left + target.offsetWidth - ulBorder + 'px';

            var selectedItems = [];
            for (var i = 0; i < shorterLength; i++) {
                if (_this4.state.selectedItems[i].index == keys[i]) {
                    var obj = {
                        index: _this4.state.selectedItems[i].index,
                        indexKey: _this4.state.selectedItems[i].indexKey,
                        top: _this4.state.selectedItems[i].top,
                        left: _this4.state.selectedItems[i].left
                    };

                    selectedItems.push(obj);
                }
            }

            var targetObj = {
                index: keys[keys.length - 1],
                indexKey: indexKey,
                top: top,
                left: left
            };

            if (depth === selectedItems.length) {
                selectedItems[depth - 1] = targetObj;
            } else {
                selectedItems.push(targetObj);
            }
            _this4.setState({
                selectedKey: indexKey,
                selectedItems: selectedItems
            });
        };

        return _this4;
    }

    _createClass(TopContextmenu, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopContextmenu.prototype.__proto__ || Object.getPrototypeOf(TopContextmenu.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent();
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            this._top.EventManager.on("click", this.dom.root, this.clickcallback.bind(this));
        }
    }, {
        key: 'clickcallback',
        value: function clickcallback(event) {
            var target = event.srcElement;
            var targetName = '';
            while (true) {
                var classList = this._top.Util.__classStringToClassList(target.className);
                if (target.tagName == undefined || target.tagName == null) {
                    return;
                }
                if (classList.includes('top-contextmenu_item')) {
                    targetName = 'Li';
                    break;
                }
                target = target.parentNode;
            };

            if (target && targetName) {
                var eventHandlerName = 'handlerFor' + targetName + 'Click';
                this[eventHandlerName](target);
            }
        }
    }, {
        key: 'open',
        value: function open() {
            this.setState({
                isOpened: true
            });
        }
    }, {
        key: 'close',
        value: function close() {
            this.setState({
                selectedItems: [],
                isOpened: false
            });
        }
    }]);

    return TopContextmenu;
}(TopContextmenuUI);

TopContextmenuUI.propConfigs = Object.assign({}, TopMenuBehavior.propConfigs, {
    items: {
        type: Array,
        arrayOf: Object,
        default: []
    },

    onOpen: {
        type: Function
    },

    onClose: {
        type: Function
    },

    onItemclick: {
        type: Function
    },

    closedOnClickoutside: {
        type: Boolean,
        default: true
    }
});

TopContextmenuUI.defaultProps = Object.assign({}, TopMenuBehavior.defaultProps, {
    tagName: 'top-contextmenu'
});

(function () {
    var ContextmenuCreator = function ContextmenuCreator(topInstance) {
        Contextmenu.prototype = Object.create(topInstance.Widget.prototype);
        Contextmenu.prototype.constructor = Contextmenu;

        function Contextmenu(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-contextmenu']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-contextmenu'], props));
            }
        }

        Contextmenu.create = function (element, props) {
            return new Contextmenu(element, props);
        };

        Contextmenu.prototype.open = function (e) {
            this.getTemplate().open(e);
        };

        Contextmenu.prototype.close = function () {
            this.getTemplate().close();
        };

        Contextmenu.prototype.isOpened = function () {
            return this.getTemplate().state.isOpened;
        };
        return Contextmenu;
    };

    getTopUI().Widget.Contextmenu = ContextmenuCreator(getTopUI());
    getTop().Widget.Contextmenu = ContextmenuCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopDashboardUI = function (_TopEventBehavior) {
    _inherits(TopDashboardUI, _TopEventBehavior);

    function TopDashboardUI(props) {
        _classCallCheck(this, TopDashboardUI);

        return _possibleConstructorReturn(this, (TopDashboardUI.__proto__ || Object.getPrototypeOf(TopDashboardUI)).call(this, props));
    }

    _createClass(TopDashboardUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__renderDashboard',
        value: function __renderDashboard() {
            return React.createElement(WidgetNameBlock, { widgetName: 'Dashboard' });
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-dashboard',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-dashboard-root', style: this.topStyle },
                    this.__renderDashboard()
                )
            );
        }
    }]);

    return TopDashboardUI;
}(TopEventBehavior);

var TopDashboard = function (_TopDashboardUI) {
    _inherits(TopDashboard, _TopDashboardUI);

    function TopDashboard() {
        _classCallCheck(this, TopDashboard);

        return _possibleConstructorReturn(this, (TopDashboard.__proto__ || Object.getPrototypeOf(TopDashboard)).apply(this, arguments));
    }

    return TopDashboard;
}(TopDashboardUI);

TopDashboardUI.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {});

TopDashboardUI.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {
    tagName: 'top-dashboard'
});

TopDashboard.propConfigs = Object.assign({}, TopDashboardUI.propConfigs, {});

TopDashboard.defaultProps = Object.assign({}, TopDashboardUI.defaultProps, {});

(function () {

    var DashboardCreator = function DashboardCreator(topInstance) {
        Dashboard.prototype = Object.create(topInstance.Widget.prototype);
        Dashboard.prototype.constructor = Dashboard;

        function Dashboard(element, props, childs) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-dashboard']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-dashboard'], props, childs));
            }
        }

        Dashboard.create = function (element, props, childs) {
            return new Dashboard(element, props, childs);
        };

        return Dashboard;
    };

    getTopUI().Widget.Dashboard = DashboardCreator(getTopUI());
    getTop().Widget.Dashboard = DashboardCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopDatepickerUI = function (_TopInputBehavior) {
    _inherits(TopDatepickerUI, _TopInputBehavior);

    function TopDatepickerUI(props) {
        _classCallCheck(this, TopDatepickerUI);

        return _possibleConstructorReturn(this, (TopDatepickerUI.__proto__ || Object.getPrototypeOf(TopDatepickerUI)).call(this, props));
    }

    _createClass(TopDatepickerUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'handleChange',
        value: function handleChange(e) {
            this.setState({
                date: e.target.value
            });
        }
    }, {
        key: '__render',
        value: function __render() {
            var _this2 = this;

            var topDisabled = this.__calculateDerivedDisabled();

            return React.createElement(
                'top-datepicker',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-datepicker-root', style: this.topStyle },
                    React.createElement('input', { className: 'top-datepicker-input', disabled: topDisabled, value: this.state.date, onChange: function onChange(e) {
                            _this2.handleChange(e);
                        } }),
                    React.createElement('i', { className: 'top-datepicker-icon' })
                )
            );
        }
    }]);

    return TopDatepickerUI;
}(TopInputBehavior);

var TopDatepicker = function (_TopDatepickerUI) {
    _inherits(TopDatepicker, _TopDatepickerUI);

    function TopDatepicker() {
        _classCallCheck(this, TopDatepicker);

        return _possibleConstructorReturn(this, (TopDatepicker.__proto__ || Object.getPrototypeOf(TopDatepicker)).apply(this, arguments));
    }

    return TopDatepicker;
}(TopDatepickerUI);

TopDatepickerUI.propConfigs = Object.assign({}, TopInputBehavior.propConfigs, {
    date: {
        type: String,
        default: ''
    },

    maxDate: {
        type: String
    },

    minDate: {
        type: String
    },

    format: {
        type: String,
        default: "yyyy-mm-dd"
    },

    yearNavigator: {
        type: Boolean,
        default: true
    },

    yearRange: {
        type: String,
        default: "-5:+5"
    },

    firstDay: {
        type: Number,
        default: 0
    },

    dayNamesMin: {
        type: Array,
        default: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },

    monthNamesMin: {
        type: Array,
        default: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
    },

    containerAlign: {
        type: String,
        default: "bl"
    },

    fromDatepicker: {
        type: String
    },

    toDatepicker: {
        type: String
    },

    selectType: {
        type: String,
        default: "day"
    },

    inline: {
        type: Boolean,
        default: false
    },

    autoFormat: {
        type: Boolean,
        default: true
    },

    onSelect: {
        type: Function
    }
});

TopDatepickerUI.defaultProps = Object.assign({}, TopInputBehavior.defaultProps, {
    tagName: 'top-datepicker'
});

TopDatepicker.propConfigs = Object.assign({}, TopDatepickerUI.propConfigs, {});

TopDatepicker.defaultProps = Object.assign({}, TopDatepickerUI.defaultProps, {});

(function () {

    var DatepickerCreator = function DatepickerCreator(topInstance) {
        Datepicker.prototype = Object.create(topInstance.Widget.prototype);
        Datepicker.prototype.constructor = Datepicker;

        function Datepicker(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-datepicker']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-datepicker'], props));
            }
        }

        Datepicker.create = function (element, props) {
            return new Datepicker(element, props);
        };

        return Datepicker;
    };

    getTopUI().Widget.Datepicker = DatepickerCreator(getTopUI());
    getTop().Widget.Datepicker = DatepickerCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _defineProperty = function(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopDialogUI = function (_TopLayoutBehavior) {
    _inherits(TopDialogUI, _TopLayoutBehavior);

    function TopDialogUI(props) {
        _classCallCheck(this, TopDialogUI);

        return _possibleConstructorReturn(this, (TopDialogUI.__proto__ || Object.getPrototypeOf(TopDialogUI)).call(this, props));
    }

    _createClass(TopDialogUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initialClassname',
        value: function __initialClassname() {
            var classTest = /(popup_01)|(popup_02)|(popup_03)/g;
            if (!classTest.test(this._top.Util.__classListToClassString(this.userClassList))) {
                this._top.Util.__addClassToClassList(this.userClassList, 'popup_01');
            }
        }
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;

            _get(TopDialogUI.prototype.__proto__ || Object.getPrototypeOf(TopDialogUI.prototype), '__initDomRef', this).call(this);
            this.dom.close = null;
            this.setCloseRef = function (element) {
                _this2.dom.close = element;
            };
        }
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this3 = this;

            if (children) {
                children = React.Children.map(children, function (child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this3,
                        layoutFunction: function layoutFunction() {
                            this.topTagStyle.display = 'block';
                            if (this.state.layoutWidth === 'match_parent') this.__updateLayoutWidth('100%');
                            if (this.state.layoutHeight === 'match_parent') this.__updateLayoutHeight('100%');
                        }
                    });
                });
            }
            return children;
        }
    }, {
        key: '__renderDialogRoot',
        value: function __renderDialogRoot() {
            var rootClass = classNames(_defineProperty({
                'top-dialog-root': true
            }, '' + this.userClassList, true));
            var width = this.state.layoutWidth;
            var height = this.state.layoutHeight;

            if (parseInt(this.state.layoutWidth) > 0) {
                isFixedWidthDialog = true;
            } else {
                width = 'auto';
                if (this.state.resizable === true) {
                    isFixedWidthDialog = true;
                }
            }

            if (parseInt(this.state.layoutHeight) > 80 || typeof this.state.layoutHeight === "string" && this.state.layoutHeight.includes("%")) {
                isFixedHeightDialog = true;
            } else {
                height = 'auto';
                if (this.state.resizable === true) {
                    isFixedHeightDialog = true;
                }
            }

            var contentClass = classNames({
                'top-dialog-content': true,
                'fixed-width-dialog': isFixedWidthDialog,
                'fixed-height-dialog': isFixedHeightDialog
            });

            this.setTopStyle('width', width);
            this.setTopStyle('height', height);

            this.setTopStyle('top', '0px');

            return React.createElement(DialogRootComponent, Object.assign({}, this.state, {
                parent: this,
                _top: this._top,
                dom: this.dom,
                contentClass: contentClass,
                rootClass: rootClass
            }));
        }
    }, {
        key: '__renderDialog',
        value: function __renderDialog() {
            return React.createElement(
                'top-dialog',
                { id: this.state.id, ref: this.setTopRef,
                    'class': this.makeTopTagClassString(),
                    disabled: this.__calculateDerivedDisabled(),
                    style: this.topTagStyle
                },
                this.__renderDialogRoot()
            );
        }
    }, {
        key: '__render',
        value: function __render() {
            return this.__renderDialog();
        }
    }]);

    return TopDialogUI;
}(TopLayoutBehavior);

var DialogRootComponent = function (_React$Component) {
    _inherits(DialogRootComponent, _React$Component);

    function DialogRootComponent(props) {
        _classCallCheck(this, DialogRootComponent);

        return _possibleConstructorReturn(this, (DialogRootComponent.__proto__ || Object.getPrototypeOf(DialogRootComponent)).call(this, props));
    }

    _createClass(DialogRootComponent, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.parent instanceof TopDialog) {
                this.__bindEvent();
            }
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            var _this5 = this;

            this.props._top.EventManager.on('click', this.props.dom.close, function (event) {
                _this5.props.parent.__close();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { ref: this.props.parent.setRootRef, className: this.props.rootClass, style: this.props.parent.topStyle },
                React.createElement(DialogTitleComponent, this.props),
                React.createElement(
                    'div',
                    { className: this.props.contentClass },
                    this.props.parent.__setWrapperStyle(this.props.children)
                )
            );
        }
    }]);

    return DialogRootComponent;
}(React.Component);

var DialogTitleComponent = function (_React$Component2) {
    _inherits(DialogTitleComponent, _React$Component2);

    function DialogTitleComponent(props) {
        _classCallCheck(this, DialogTitleComponent);

        return _possibleConstructorReturn(this, (DialogTitleComponent.__proto__ || Object.getPrototypeOf(DialogTitleComponent)).call(this, props));
    }

    _createClass(DialogTitleComponent, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'top-dialog-title-layout' },
                React.createElement(
                    'span',
                    { className: 'top-dialog-title' },
                    this.props.title
                ),
                React.createElement(DialogCloseButtonComponent, this.props)
            );
        }
    }]);

    return DialogTitleComponent;
}(React.Component);

var DialogCloseButtonComponent = function (_React$Component3) {
    _inherits(DialogCloseButtonComponent, _React$Component3);

    function DialogCloseButtonComponent() {
        _classCallCheck(this, DialogCloseButtonComponent);

        return _possibleConstructorReturn(this, (DialogCloseButtonComponent.__proto__ || Object.getPrototypeOf(DialogCloseButtonComponent)).apply(this, arguments));
    }

    _createClass(DialogCloseButtonComponent, [{
        key: 'render',
        value: function render() {
            return React.createElement('button', {
                ref: this.props.parent.setCloseRef,
                className: 'top-dialog-close'
            });
        }
    }]);

    return DialogCloseButtonComponent;
}(React.Component);

var TopDialog = function (_TopDialogUI) {
    _inherits(TopDialog, _TopDialogUI);

    function TopDialog() {
        _classCallCheck(this, TopDialog);

        return _possibleConstructorReturn(this, (TopDialog.__proto__ || Object.getPrototypeOf(TopDialog)).apply(this, arguments));
    }

    _createClass(TopDialog, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopDialog.prototype.__proto__ || Object.getPrototypeOf(TopDialog.prototype), '__componentDidMount', this).call(this);
        }
    }, {
        key: '__open',
        value: function __open() {
            this.__updateProperties({ 'isOpened': true });
        }
    }, {
        key: '__close',
        value: function __close() {
            this.__updateProperties({ 'isOpened': false });
        }
    }, {
        key: '__updateIsOpened',
        value: function __updateIsOpened() {}
    }, {
        key: '__renderOverlay',
        value: function __renderOverlay() {
            return ReactDOM.createPortal(React.createElement('div', { className: 'top-dialog-overlay' }), document.body);
        }
    }, {
        key: '__renderDialogRoot',
        value: function __renderDialogRoot() {
            if (this.state.isOpened) {
                return _get(TopDialog.prototype.__proto__ || Object.getPrototypeOf(TopDialog.prototype), '__renderDialogRoot', this).call(this);
            } else {
                return null;
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            return [this.state.isOpened && this.__renderOverlay(), ReactDOM.createPortal(this.__renderDialog(), document.body)];
        }
    }]);

    return TopDialog;
}(TopDialogUI);

TopDialogUI.propConfigs = Object.assign({}, TopCheckBehavior.propConfigs, {
    title: {
        type: String
    },

    closable: {
        type: Boolean,
        default: true
    },

    resizable: {
        type: Boolean,
        default: false,
        options: [true, false]
    },

    maxMinButton: {
        type: Boolean,
        default: false
    },
    minWidth: {
        type: String,
        default: '100px'
    },
    minHeight: {
        type: String,
        default: '100px'
    }

});

TopDialogUI.defaultProps = Object.assign({}, TopCheckBehavior.defaultProps, {
    tagName: 'top-dialog'
});

TopDialog.propConfigs = Object.assign({}, TopDialogUI.propConfigs, {
    isOpened: {
        type: Boolean,
        default: false
    },

    onOpen: {
        type: Function
    },

    onClose: {
        type: Function
    },

    movable: {
        type: Boolean,
        default: true
    },

    closableOnOverlayClick: {
        type: Boolean,
        default: false
    },

    modeless: {
        type: Boolean,
        default: false
    }
});

TopDialog.defaultProps = Object.assign({}, TopDialogUI.defaultProps, {});

(function () {

    var DialogCreator = function DialogCreator(topInstance) {
        Dialog.prototype = Object.create(topInstance.Widget.prototype);
        Dialog.prototype.constructor = Dialog;

        function Dialog(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-dialog']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-dialog'], props));
            }
        }

        Dialog.create = function (element, props) {
            return new Dialog(element, props);
        };

        Dialog.prototype.open = function () {
            this.getTemplate().__open();
        };

        Dialog.prototype.close = function () {
            this.getTemplate().__close();
        };

        return Dialog;
    };

    getTopUI().Widget.Dialog = DialogCreator(getTopUI());
    getTop().Widget.Dialog = DialogCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopFlowlayoutUI = function (_TopLayoutBehavior) {
    _inherits(TopFlowlayoutUI, _TopLayoutBehavior);

    function TopFlowlayoutUI(props) {
        _classCallCheck(this, TopFlowlayoutUI);

        return _possibleConstructorReturn(this, (TopFlowlayoutUI.__proto__ || Object.getPrototypeOf(TopFlowlayoutUI)).call(this, props));
    }

    _createClass(TopFlowlayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this2 = this;

            if (children) {
                children = React.Children.map(children, function (child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this2,
                        layoutFunction: function layoutFunction() {
                            this.addClassToTopClassList('flow-child');
                            this.topStyle.verticalAlign = 'top';
                            if (this.state.layoutWidth === 'match_parent') this.__updateLayoutWidth("100%");
                            if (this.state.layoutHeight === 'match_parent') this.__updateLayoutHeight("100%");
                        }
                    });
                });
            }
            return children;
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-flowlayout',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-flowlayout-root', style: this.topStyle },
                    this.__setWrapperStyle(this.state.children)
                )
            );
        }
    }]);

    return TopFlowlayoutUI;
}(TopLayoutBehavior);

var TopFlowlayout = function (_TopFlowlayoutUI) {
    _inherits(TopFlowlayout, _TopFlowlayoutUI);

    function TopFlowlayout() {
        _classCallCheck(this, TopFlowlayout);

        return _possibleConstructorReturn(this, (TopFlowlayout.__proto__ || Object.getPrototypeOf(TopFlowlayout)).apply(this, arguments));
    }

    return TopFlowlayout;
}(TopFlowlayoutUI);

TopFlowlayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {});

TopFlowlayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-flowlayout'
});

TopFlowlayout.propConfigs = Object.assign({}, TopFlowlayoutUI.propConfigs, {});

TopFlowlayout.defaultProps = Object.assign({}, TopFlowlayoutUI.defaultProps, {});

(function () {

    var FlowlayoutCreator = function FlowlayoutCreator(topInstance) {
        Flowlayout.prototype = Object.create(topInstance.Widget.Layout.prototype);
        Flowlayout.prototype.constructor = Flowlayout;

        function Flowlayout(element, props, childs) {
            topInstance.Widget.Layout.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-flowlayout']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-flowlayout'], props, childs));
            }
        }

        Flowlayout.create = function (element, props, childs) {
            return new Flowlayout(element, props, childs);
        };

        return Flowlayout;
    };

    getTopUI().Widget.Layout.Flowlayout = FlowlayoutCreator(getTopUI());
    getTop().Widget.Layout.Flowlayout = FlowlayoutCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopFoldinglayoutUI = function (_TopLayoutBehavior) {
    _inherits(TopFoldinglayoutUI, _TopLayoutBehavior);

    function TopFoldinglayoutUI(props) {
        _classCallCheck(this, TopFoldinglayoutUI);

        return _possibleConstructorReturn(this, (TopFoldinglayoutUI.__proto__ || Object.getPrototypeOf(TopFoldinglayoutUI)).call(this, props));
    }

    _createClass(TopFoldinglayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.oriWidth = this.state.layoutWidth;
            this.oriHeight = this.state.layoutHeight;
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'renderLayout',
        value: function renderLayout() {}
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;

            _get(TopFoldinglayoutUI.prototype.__proto__ || Object.getPrototypeOf(TopFoldinglayoutUI.prototype), '__initDomRef', this).call(this);
            this.dom.element = null;
            this.dom.sub = null;
            this.setElementRef = function (element) {
                _this2.dom.element = element;
            };
            this.setSubRef = function (element) {
                _this2.dom.sub = element;
            };
        }
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this3 = this;

            if (children) {
                children = React.Children.map(children, function (child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this3,
                        layoutFunction: function layoutFunction() {
                            this.setTopTagStyle('verticalAlign', 'top');
                        }
                    });
                });
            }
            return children;
        }
    }, {
        key: '__callParentAdjust',
        value: function __callParentAdjust() {
            if (this.state.layoutParent && this.state.layoutParent.dom.top.tagName === "TOP-LINEARLAYOUT") {
                this.state.layoutParent.adjusted = false;
                this.state.layoutParent.complete();
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            var topRootClass = 'top-foldinglayout-root ' + this.state.orientation;
            topRootClass += this.state.isOpened == true ? ' open ' : ' close ';

            return React.createElement(
                'top-foldinglayout',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: topRootClass, style: this.topStyle },
                    React.createElement(
                        'div',
                        { ref: this.setElementRef, className: 'top-foldinglayout-element' },
                        this.__setWrapperStyle(this.state.children)
                    ),
                    React.createElement(
                        'div',
                        { ref: this.setSubRef, className: 'top-foldinglayout-sub' },
                        React.createElement(
                            'center',
                            null,
                            React.createElement('i', { ref: 'open', className: 'top-foldinglayout-icon' })
                        )
                    )
                )
            );
        }
    }]);

    return TopFoldinglayoutUI;
}(TopLayoutBehavior);

var TopFoldinglayout = function (_TopFoldinglayoutUI) {
    _inherits(TopFoldinglayout, _TopFoldinglayoutUI);

    function TopFoldinglayout(props) {
        _classCallCheck(this, TopFoldinglayout);

        return _possibleConstructorReturn(this, (TopFoldinglayout.__proto__ || Object.getPrototypeOf(TopFoldinglayout)).call(this, props));
    }

    _createClass(TopFoldinglayout, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopFoldinglayout.prototype.__proto__ || Object.getPrototypeOf(TopFoldinglayout.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent();
        }
    }, {
        key: '__initEventInternal',
        value: function __initEventInternal() {
            this.__addEventByAttr('open');
            this.__addEventByAttr('close');
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            this._top.EventManager.on("click", this.dom.sub, this.btnClick.bind(this));
        }
    }, {
        key: 'folding',
        value: function folding() {
            if (this.state.isOpened == false) {
                if (this.state.orientation == 'horizontal') {
                    if (!this.state.expansion) {
                        if (!this.oriWidth || this.oriWidth === 'auto' || this.oriWidth === 'wrap_content') this.state.expansion = '';else this.state.expansion = this.oriWidth;
                    }
                    this.setTopStyle('width', this.state.expansion);
                    this.state.layoutWidth = this.state.expansion;
                } else {
                    if (!this.oriHeight || this.oriHeight === 'auto' || this.oriHeight === 'wrap_content') this.state.expansion = '';else this.state.expansion = this.oriHeight;
                    this.setTopStyle('height', this.state.expansion);
                    this.state.layoutHeight = this.state.expansion;
                }
            } else {
                if (this.state.orientation == 'horizontal') {
                    if (!this.oriHeight || this.oriHeight === 'auto' || this.oriHeight === 'wrap_content') {
                        this.setTopStyle('height', this.dom.root.clientHeight - parseFloat(this.state.padding.paddingTop) - parseFloat(this.state.padding.paddingBottom) + 'px');
                    }
                    this.setTopStyle('width', this.state.reduction);
                    this.state.layoutWidth = this.state.reduction;
                } else {
                    if (!this.oriWidth || this.oriWidth === 'auto' || this.oriWidth === 'wrap_content') {
                        this.setTopStyle('width', this.dom.root.clientWidth - parseFloat(this.state.padding.paddingLeft) - parseFloat(this.state.padding.paddingRight) + 'px');
                    }
                    this.setTopStyle('height', this.state.reduction);
                    this.state.layoutHeight = this.state.reduction;
                }
            }
            this.__callParentAdjust();
        }
    }, {
        key: 'btnClick',
        value: function btnClick() {
            this.folding();
            if (this.state.isOpened === true) {
                this.setState({
                    isOpened: false
                });
                this.__dispatchEvent(new Event('close'));
            } else {
                this.setState({
                    isOpened: true
                });
                this.__dispatchEvent(new Event('open'));
            }
        }
    }]);

    return TopFoldinglayout;
}(TopFoldinglayoutUI);

TopFoldinglayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {
    orientation: {
        type: String,
        options: ["horizontal", "vertical"],
        default: "horizontal"
    },

    reduction: {
        type: String,
        default: "0px"
    },

    expansion: {
        type: String
    },

    onOpen: {
        type: Function
    },

    onClose: {
        type: Function
    },

    isOpened: {
        type: String,
        options: [true, false],
        default: true
    }
});

TopFoldinglayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-foldinglayout'
});
TopFoldinglayout.propConfigs = Object.assign({}, TopFoldinglayoutUI.propConfigs, {});
TopFoldinglayout.defaultProps = Object.assign({}, TopFoldinglayoutUI.defaultProps, {});

(function () {

    var FoldinglayoutCreator = function FoldinglayoutCreator(topInstance) {
        Foldinglayout.prototype = Object.create(topInstance.Widget.Layout.prototype);
        Foldinglayout.prototype.constructor = Foldinglayout;

        function Foldinglayout(element, props, childs) {
            topInstance.Widget.Layout.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-foldinglayout']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-foldinglayout'], props, childs));
            }
        }

        Foldinglayout.create = function (element, props, childs) {
            return new Foldinglayout(element, props, childs);
        };

        Foldinglayout.prototype.open = function () {
            this.getTemplate().state.isOpened = true;
            return this.getTemplate().btnClick();
        };

        Foldinglayout.prototype.close = function () {
            this.getTemplate().state.isOpened = false;
            return this.getTemplate().btnClick();
        };
        return Foldinglayout;
    };

    getTopUI().Widget.Layout.Foldinglayout = FoldinglayoutCreator(getTopUI());
    getTop().Widget.Layout.Foldinglayout = FoldinglayoutCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopFramelayoutUI = function (_TopLayoutBehavior) {
    _inherits(TopFramelayoutUI, _TopLayoutBehavior);

    function TopFramelayoutUI(props) {
        _classCallCheck(this, TopFramelayoutUI);

        return _possibleConstructorReturn(this, (TopFramelayoutUI.__proto__ || Object.getPrototypeOf(TopFramelayoutUI)).call(this, props));
    }

    _createClass(TopFramelayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this2 = this;

            if (children) {
                children = React.Children.map(children, function (child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this2,
                        layoutFunction: function layoutFunction() {
                            this.topTagStyle.position = 'absolute';
                            this.topTagStyle.display = 'inline-block';
                            this.topTagStyle.verticalAlign = 'top';

                            var pWrapWidth = this.props.layoutParent.state.layoutWidth === 'wrap_content' || this.props.layoutParent.state.layoutWidth === 'auto',
                                pWrapHeight = this.props.layoutParent.state.layoutHeight === 'wrap_content' || this.props.layoutParent.state.layoutHeight === 'auto';

                            var pPaddingWidth = (parseInt(this.props.layoutParent.state.paddingRight) || 0) + (parseInt(this.props.layoutParent.state.paddingLeft) || 0),
                                pPaddingHeight = (parseInt(this.props.layoutParent.state.paddingTop) || 0) + (parseInt(this.props.layoutParent.state.paddingBottom) || 0);

                            if (this.state.layoutWidth === 'match_parent') {
                                if (pWrapWidth) {
                                    this.__updateLayoutWidth(parseInt(this.state.marginRight) + parseInt(this.state.marginLeft) + 'px');
                                } else {
                                    this.setTopTagStyle('width', 'calc(100% - ' + pPaddingWidth + 'px)');
                                    this.__updateLayoutWidth('100%');
                                }
                            } else if (this.state.layoutWidth && this.state.layoutWidth.includes('%')) {
                                this.setTopTagStyle('width', 'calc(' + this.state.layoutWidth + ' - ' + pPaddingWidth + 'px)');
                                this.__updateLayoutWidth('100%');
                            }
                            if (this.state.layoutHeight === 'match_parent') {
                                if (pWrapHeight) {
                                    this.__updateLayoutHeight(parseInt(this.state.marginTop) + parseInt(this.state.marginBottom) + 'px');
                                } else {
                                    this.setTopTagStyle('height', 'calc(100% - ' + pPaddingHeight + 'px)');
                                    this.__updateLayoutHeight('100%');
                                }
                            } else if (this.state.layoutHeight && this.state.layoutHeight.includes('%')) {
                                this.setTopTagStyle('height', 'calc(' + this.state.layoutHeight + ' - ' + pPaddingHeight + 'px)');
                                this.__updateLayoutHeight('100%');
                            }
                        }
                    });
                });
            }
            return children;
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-framelayout',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-framelayout-root', style: this.topStyle },
                    this.__setWrapperStyle(this.state.children)
                )
            );
        }
    }]);

    return TopFramelayoutUI;
}(TopLayoutBehavior);

var TopFramelayout = function (_TopFramelayoutUI) {
    _inherits(TopFramelayout, _TopFramelayoutUI);

    function TopFramelayout() {
        _classCallCheck(this, TopFramelayout);

        return _possibleConstructorReturn(this, (TopFramelayout.__proto__ || Object.getPrototypeOf(TopFramelayout)).apply(this, arguments));
    }

    return TopFramelayout;
}(TopFramelayoutUI);

TopFramelayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {});

TopFramelayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-framelayout'
});

TopFramelayout.propConfigs = Object.assign({}, TopFramelayoutUI.propConfigs, {});

TopFramelayout.defaultProps = Object.assign({}, TopFramelayoutUI.defaultProps, {});

(function () {

    var FramelayoutCreator = function FramelayoutCreator(topInstance) {
        Framelayout.prototype = Object.create(topInstance.Widget.Layout.prototype);
        Framelayout.prototype.constructor = Framelayout;

        function Framelayout(element, props, childs) {
            topInstance.Widget.Layout.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-framelayout']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-framelayout'], props, childs));
            }
        }

        Framelayout.create = function (element, props, childs) {
            return new Framelayout(element, props, childs);
        };

        return Framelayout;
    };

    getTopUI().Widget.Layout.Framelayout = FramelayoutCreator(getTopUI());
    getTop().Widget.Layout.Framelayout = FramelayoutCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopGridlayoutUI = function (_TopLayoutBehavior) {
    _inherits(TopGridlayoutUI, _TopLayoutBehavior);

    function TopGridlayoutUI(props) {
        _classCallCheck(this, TopGridlayoutUI);

        return _possibleConstructorReturn(this, (TopGridlayoutUI.__proto__ || Object.getPrototypeOf(TopGridlayoutUI)).call(this, props));
    }

    _createClass(TopGridlayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'renderLayout',
        value: function renderLayout() {}
    }, {
        key: '__render',
        value: function __render() {}
    }]);

    return TopGridlayoutUI;
}(TopLayoutBehavior);

var TopGridlayout = function (_TopGridlayoutUI) {
    _inherits(TopGridlayout, _TopGridlayoutUI);

    function TopGridlayout() {
        _classCallCheck(this, TopGridlayout);

        return _possibleConstructorReturn(this, (TopGridlayout.__proto__ || Object.getPrototypeOf(TopGridlayout)).apply(this, arguments));
    }

    return TopGridlayout;
}(TopGridlayoutUI);

TopGridlayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {
    cols: {
        type: Number,
        default: 1
    },

    rows: {
        type: Number,
        default: 1
    },

    cellWidth: {
        type: Number,
        default: 0
    },

    cellHeight: {
        type: Number,
        default: 0
    }
});

TopGridlayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-gridlayout'
});

TopGridlayout.propConfigs = Object.assign({}, TopGridlayoutUI.propConfigs, {});

TopGridlayout.defaultProps = Object.assign({}, TopGridlayoutUI.defaultProps, {});

(function () {

    var GridlayoutCreator = function GridlayoutCreator(topInstance) {
        Gridlayout.prototype = Object.create(topInstance.Widget.Layout.prototype);
        Gridlayout.prototype.constructor = Gridlayout;

        function Gridlayout(element, props, childs) {
            topInstance.Widget.Layout.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-gridlayout']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-gridlayout'], props, childs));
            }
        }

        Gridlayout.create = function (element, props, childs) {
            return new Gridlayout(element, props, childs);
        };

        return Gridlayout;
    };

    getTopUI().Widget.Layout.Gridlayout = GridlayoutCreator(getTopUI());
    getTop().Widget.Layout.Gridlayout = GridlayoutCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopHtmleditorUI = function (_TopInputBehavior) {
    _inherits(TopHtmleditorUI, _TopInputBehavior);

    function TopHtmleditorUI(props) {
        _classCallCheck(this, TopHtmleditorUI);

        return _possibleConstructorReturn(this, (TopHtmleditorUI.__proto__ || Object.getPrototypeOf(TopHtmleditorUI)).call(this, props));
    }

    _createClass(TopHtmleditorUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.__initHtmleditor();
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {
            this.htmlEditor.setOptions({
                width: this.state.layoutWidth || 'auto',
                height: this.state.layoutHeight || '100px'
            });
        }
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initHtmleditor',
        value: function __initHtmleditor() {
            this.htmlEditor = TOP_SUNEDITOR.create(this.dom.root, this.__makeOptions());
        }
    }, {
        key: '__makeOptions',
        value: function __makeOptions() {
            var buttonList = [];
            if (this.state.font) buttonList.push('font');
            if (this.state.fontSize) buttonList.push('fontSize');
            if (this.state.fontColor) buttonList.push('fontColor');
            if (this.state.bold) buttonList.push('bold');
            if (this.state.italic) buttonList.push('italic');
            if (this.state.underline) buttonList.push('underline');
            if (this.state.strike) buttonList.push('strike');
            if (this.state.subscript) buttonList.push('subscript');
            if (this.state.superscript) buttonList.push('superscript');
            if (this.state.outdent) buttonList.push('outdent');
            if (this.state.indent) buttonList.push('indent');
            if (this.state.align) buttonList.push('align');
            if (this.state.list) buttonList.push('list');
            if (this.state.link) buttonList.push('link');
            if (this.state.removeFormat) buttonList.push('removeFormat');
            if (this.state.horizontalRule) buttonList.push('horizontalRule');
            if (this.state.table) buttonList.push('table');
            if (this.state.image) buttonList.push('image');
            if (this.state.video) buttonList.push('video');
            if (this.state.codeView) buttonList.push('codeView');
            if (this.state.print) buttonList.push('print');
            if (this.state.save) buttonList.push('save');
            if (this.state.redo) buttonList.push('redo');
            if (this.state.undo) buttonList.push('undo');
            return {
                minHeight: '100px',
                buttonList: [buttonList],
                fontSize: this.state.fontSizes,
                resizingBar: false,
                lang: SUNEDITOR_LANG.ko
            };
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-htmleditor',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement('textarea', { id: this.state.id, ref: this.setRootRef, className: 'top-htmleditor-root', disabled: this.__calculateDerivedDisabled(), style: this.topStyle })
            );
        }
    }]);

    return TopHtmleditorUI;
}(TopInputBehavior);

var TopHtmleditor = function (_TopHtmleditorUI) {
    _inherits(TopHtmleditor, _TopHtmleditorUI);

    function TopHtmleditor() {
        _classCallCheck(this, TopHtmleditor);

        return _possibleConstructorReturn(this, (TopHtmleditor.__proto__ || Object.getPrototypeOf(TopHtmleditor)).apply(this, arguments));
    }

    return TopHtmleditor;
}(TopHtmleditorUI);

TopHtmleditorUI.propConfigs = Object.assign({}, TopInputBehavior.propConfigs, {
    font: {
        type: Boolean,
        default: true
    },

    fontSize: {
        type: Boolean,
        default: true
    },

    fontSizes: {
        type: Array
    },

    fontColor: {
        type: Boolean,
        default: true
    },

    bold: {
        type: Boolean,
        default: true
    },

    italic: {
        type: Boolean,
        default: true
    },

    underline: {
        type: Boolean,
        default: true
    },

    list: {
        type: Boolean,
        default: true
    },

    subscript: {
        type: Boolean,
        default: true
    },

    superscript: {
        type: Boolean,
        default: true
    },

    indent: {
        type: Boolean,
        default: true
    },

    outdent: {
        type: Boolean,
        default: true
    },

    align: {
        type: Boolean,
        default: true
    },

    strike: {
        type: Boolean,
        default: true
    },

    link: {
        type: Boolean,
        default: true
    },

    removeFormat: {
        type: Boolean,
        default: true
    },

    horizontalRule: {
        type: Boolean,
        default: true
    },

    codeView: {
        type: Boolean,
        default: true
    },

    table: {
        type: Boolean,
        default: true
    },

    image: {
        type: Boolean,
        default: true
    },

    video: {
        type: Boolean,
        default: true
    },

    print: {
        type: Boolean,
        default: true
    },

    save: {
        type: Boolean,
        default: true
    },

    redo: {
        type: Boolean,
        default: true
    },

    undo: {
        type: Boolean,
        default: true
    },

    clear: {
        type: Boolean,
        default: true
    },

    cut: {
        type: Boolean,
        default: true
    },

    copy: {
        type: Boolean,
        default: true
    },

    paste: {
        type: Boolean,
        default: true
    },

    text: {
        type: String
    },

    html: {
        type: String
    }
});

TopHtmleditorUI.defaultProps = Object.assign({}, TopInputBehavior.defaultProps, {
    tagName: 'top-htmleditor'
});

TopHtmleditor.propConfigs = Object.assign({}, TopHtmleditorUI.propConfigs, {});

TopHtmleditor.defaultProps = Object.assign({}, TopHtmleditorUI.defaultProps, {});

(function () {

    var HtmleditorCreator = function HtmleditorCreator(topInstance) {
        Htmleditor.prototype = Object.create(topInstance.Widget.prototype);
        Htmleditor.prototype.constructor = Htmleditor;

        function Htmleditor(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-htmleditor']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-htmleditor'], props));
            }
        }

        Htmleditor.create = function (element, props) {
            return new Htmleditor(element, props);
        };

        return Htmleditor;
    };

    getTopUI().Widget.Htmleditor = HtmleditorCreator(getTopUI());
    getTop().Widget.Htmleditor = HtmleditorCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopIconUI = function (_TopContentBehavior) {
	_inherits(TopIconUI, _TopContentBehavior);

	function TopIconUI(props) {
		_classCallCheck(this, TopIconUI);

		return _possibleConstructorReturn(this, (TopIconUI.__proto__ || Object.getPrototypeOf(TopIconUI)).call(this, props));
	}

	_createClass(TopIconUI, [{
		key: '__componentDidMount',
		value: function __componentDidMount() {
			this.dom.content.style.lineHeight = this.dom.root.offsetHeight + 'px';
		}
	}, {
		key: '__componentDidUpdate',
		value: function __componentDidUpdate() {}
	}, {
		key: '__componentWillUpdate',
		value: function __componentWillUpdate() {}
	}, {
		key: '__componentWillUnmount',
		value: function __componentWillUnmount() {}
	}, {
		key: '__updateByClassList',
		value: function __updateByClassList() {}
	}, {
		key: '__initDomRef',
		value: function __initDomRef() {
			var _this2 = this;

			_get(TopIconUI.prototype.__proto__ || Object.getPrototypeOf(TopIconUI.prototype), '__initDomRef', this).call(this);
			this.dom.content = null;
			this.setContentRef = function (element) {
				_this2.dom.content = element;
			};
		}
	}, {
		key: '__classifyUserClass',
		value: function __classifyUserClass() {
			var userClassList = this.userClassList,
			    checkReg = /(icon-[A-Za-z0-9_-]+)/gm;
			var topContent = '',
			    iconClassCount = 0;

			for (var i = 0, len = userClassList.length; i < len; i++) {
				if (userClassList[i].match(checkReg)) {
					iconClassCount++;
					if (iconClassCount === 2) topContent = userClassList[i];
					if (iconClassCount > 1) this.userClassList[i] = null;
				}
			}

			return classNames('top-icon-content', '' + topContent);
		}
	}, {
		key: '__setContentStyle',
		value: function __setContentStyle() {
			var topContentStyle = {};
			topContentStyle['fontSize'] = this.state.contentSize || '';
			topContentStyle['color'] = this.state.contentColor;

			return topContentStyle;
		}
	}, {
		key: '__render',
		value: function __render() {
			var contentClass = this.__classifyUserClass();

			return React.createElement(
				'top-icon',
				{
					id: this.state.id,
					ref: this.setTopRef,
					'class': this.makeTopTagClassString(),
					style: this.topTagStyle },
				React.createElement(
					'span',
					{
						id: this.state.id,
						ref: this.setRootRef,
						className: 'top-icon-root',
						disabled: this.__calculateDerivedDisabled(),
						style: this.topStyle },
					React.createElement('i', { className: contentClass, ref: this.setContentRef, style: this.__setContentStyle() })
				)
			);
		}
	}]);

	return TopIconUI;
}(TopContentBehavior);

var TopIcon = function (_TopIconUI) {
	_inherits(TopIcon, _TopIconUI);

	function TopIcon(props) {
		_classCallCheck(this, TopIcon);

		return _possibleConstructorReturn(this, (TopIcon.__proto__ || Object.getPrototypeOf(TopIcon)).call(this, props));
	}

	_createClass(TopIcon, [{
		key: '__render',
		value: function __render() {
			return _get(TopIcon.prototype.__proto__ || Object.getPrototypeOf(TopIcon.prototype), '__render', this).call(this);
		}
	}]);

	return TopIcon;
}(TopIconUI);

TopIconUI.propConfigs = Object.assign({}, TopContentBehavior.propConfigs, {
	contentColor: {
		type: String,
		value: '#ffffff'
	},

	contentSize: {
		type: String
	}
});

TopIconUI.defaultProps = Object.assign({}, TopContentBehavior.defaultProps, {
	tagName: 'top-icon'
});

TopIcon.propConfigs = Object.assign({}, TopIconUI.propConfigs, {});

TopIcon.defaultProps = Object.assign({}, TopIconUI.defaultProps, {});

(function () {
	var IconCreator = function IconCreator(topInstance) {
		Icon.prototype = Object.create(topInstance.Widget.prototype);
		Icon.prototype.constructor = Icon;

		function Icon(element, props) {
			topInstance.Widget.apply(this, arguments);
			if (element instanceof topInstance.Render.topWidgets['top-icon']) {
				this.setTemplate(element);
			} else {
				this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-icon'], props));
			}
		}

		Icon.create = function (element, props) {
			return new Icon(element, props);
		};

		return Icon;
	};

	getTopUI().Widget.Icon = IconCreator(getTopUI());
	getTop().Widget.Icon = IconCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopImagebuttonUI = function (_TopResourceBehavior) {
    _inherits(TopImagebuttonUI, _TopResourceBehavior);

    function TopImagebuttonUI(props) {
        _classCallCheck(this, TopImagebuttonUI);

        return _possibleConstructorReturn(this, (TopImagebuttonUI.__proto__ || Object.getPrototypeOf(TopImagebuttonUI)).call(this, props));
    }

    _createClass(TopImagebuttonUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-imagebutton',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement('input', { id: this.state.id, ref: this.setRootRef, className: 'top-imagebutton-root', type: 'image', src: this.state.src, alt: this.state.description, disabled: this.__calculateDerivedDisabled(), style: this.topStyle })
            );
        }
    }]);

    return TopImagebuttonUI;
}(TopResourceBehavior);

var TopImagebutton = function (_TopImagebuttonUI) {
    _inherits(TopImagebutton, _TopImagebuttonUI);

    function TopImagebutton() {
        _classCallCheck(this, TopImagebutton);

        return _possibleConstructorReturn(this, (TopImagebutton.__proto__ || Object.getPrototypeOf(TopImagebutton)).apply(this, arguments));
    }

    return TopImagebutton;
}(TopImagebuttonUI);

TopImagebuttonUI.propConfigs = Object.assign({}, TopResourceBehavior.propConfigs, {});

TopImagebuttonUI.defaultProps = Object.assign({}, TopResourceBehavior.defaultProps, {
    tagName: 'top-imagebutton'
});

TopImagebutton.propConfigs = Object.assign({}, TopImagebuttonUI.propConfigs, {});

TopImagebutton.defaultProps = Object.assign({}, TopImagebuttonUI.defaultProps, {});

(function () {

    var ImagebuttonCreator = function ImagebuttonCreator(topInstance) {
        Imagebutton.prototype = Object.create(topInstance.Widget.prototype);
        Imagebutton.prototype.constructor = Imagebutton;

        function Imagebutton(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-imagebutton']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-imagebutton'], props));
            }
        }

        Imagebutton.create = function (element, props) {
            return new Imagebutton(element, props);
        };

        return Imagebutton;
    };

    getTopUI().Widget.Imagebutton = ImagebuttonCreator(getTopUI());
    getTop().Widget.Imagebutton = ImagebuttonCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopImagesliderUI = function (_TopResourceBehavior) {
    _inherits(TopImagesliderUI, _TopResourceBehavior);

    function TopImagesliderUI(props) {
        _classCallCheck(this, TopImagesliderUI);

        return _possibleConstructorReturn(this, (TopImagesliderUI.__proto__ || Object.getPrototypeOf(TopImagesliderUI)).call(this, props));
    }

    _createClass(TopImagesliderUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.__initBxSlider();
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;

            _get(TopImagesliderUI.prototype.__proto__ || Object.getPrototypeOf(TopImagesliderUI.prototype), '__initDomRef', this).call(this);
            this.dom.ul = null;
            this.setUlRef = function (element) {
                _this2.dom.ul = element;
            };
        }
    }, {
        key: '__initWidgetItems',
        value: function __initWidgetItems() {
            var _this3 = this;

            var widgetItems = this.state.children;
            return widgetItems.map(function (item, index, array) {
                return React.createElement(
                    'i',
                    { key: _this3.state.id + '_item_' + index },
                    React.createElement('img', { src: item.props.src, url: item.props.src })
                );
            });
        }
    }, {
        key: '__initBxSlider',
        value: function __initBxSlider() {
            var widgetItems = this.state.children;
            if (widgetItems.length > 0) {
                $(this.dom.ul).bxSlider({
                    mode: this.state.mode,
                    auto: this.state.autoSlide,
                    speed: this.state.speed,
                    startSlide: this.state.startSlide,
                    randomStart: this.state.randomStart,
                    wrapperClass: "top-imageslider-container",
                    nextText: '',
                    prevText: ''
                });
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-imageslider',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-imageslider-root', disabled: this.__calculateDerivedDisabled(), style: this.topStyle },
                    React.createElement(
                        'ul',
                        { className: 'top-imageslider-ul', ref: this.setUlRef },
                        this.__initWidgetItems()
                    )
                )
            );
        }
    }]);

    return TopImagesliderUI;
}(TopResourceBehavior);

var TopImageslider = function (_TopImagesliderUI) {
    _inherits(TopImageslider, _TopImagesliderUI);

    function TopImageslider() {
        _classCallCheck(this, TopImageslider);

        return _possibleConstructorReturn(this, (TopImageslider.__proto__ || Object.getPrototypeOf(TopImageslider)).apply(this, arguments));
    }

    return TopImageslider;
}(TopImagesliderUI);

TopImagesliderUI.propConfigs = Object.assign({}, TopResourceBehavior.propConfigs, {
    mode: {
        type: String,
        default: "horizontal",
        options: ["horizontal", "vertical", "fade"]
    },

    autoSlide: {
        type: Boolean,
        default: false,
        options: [true, false]
    },

    speed: {
        type: Number,
        default: 500
    },

    startSlide: {
        type: Number,
        default: 0
    },

    randomStart: {
        type: Boolean,
        default: false,
        options: [true, false]
    },

    onItemClick: {
        type: Function
    }
});

TopImagesliderUI.defaultProps = Object.assign({}, TopResourceBehavior.defaultProps, {
    tagName: 'top-imageslider'
});

TopImageslider.propConfigs = Object.assign({}, TopImagesliderUI.propConfigs, {});

TopImageslider.defaultProps = Object.assign({}, TopImagesliderUI.defaultProps, {});

(function () {

    var ImagesliderCreator = function ImagesliderCreator(topInstance) {
        Imageslider.prototype = Object.create(topInstance.Widget.prototype);
        Imageslider.prototype.constructor = Imageslider;

        function Imageslider(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-imageslider']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-imageslider'], props));
            }
        }

        Imageslider.create = function (element, props) {
            return new Imageslider(element, props);
        };

        return Imageslider;
    };

    getTopUI().Widget.Imageslider = ImagesliderCreator(getTopUI());
    getTop().Widget.Imageslider = ImagesliderCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopImageviewUI = function (_TopResourceBehavior) {
    _inherits(TopImageviewUI, _TopResourceBehavior);

    function TopImageviewUI(props) {
        _classCallCheck(this, TopImageviewUI);

        return _possibleConstructorReturn(this, (TopImageviewUI.__proto__ || Object.getPrototypeOf(TopImageviewUI)).call(this, props));
    }

    _createClass(TopImageviewUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-imageview',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement('img', { id: this.state.id, ref: this.setRootRef, className: 'top-imageview-root', src: this.state.src, alt: this.state.description, disabled: this.__calculateDerivedDisabled(), style: this.topStyle })
            );
        }
    }]);

    return TopImageviewUI;
}(TopResourceBehavior);

var TopImageview = function (_TopImageviewUI) {
    _inherits(TopImageview, _TopImageviewUI);

    function TopImageview() {
        _classCallCheck(this, TopImageview);

        return _possibleConstructorReturn(this, (TopImageview.__proto__ || Object.getPrototypeOf(TopImageview)).apply(this, arguments));
    }

    return TopImageview;
}(TopImageviewUI);

TopImageviewUI.propConfigs = Object.assign({}, TopResourceBehavior.propConfigs, {});

TopImageviewUI.defaultProps = Object.assign({}, TopResourceBehavior.defaultProps, {
    tagName: 'top-imageview'
});

TopImageview.propConfigs = Object.assign({}, TopImageviewUI.propConfigs, {});

TopImageview.defaultProps = Object.assign({}, TopImageviewUI.defaultProps, {});

(function () {

    var ImageviewCreator = function ImageviewCreator(topInstance) {
        Imageview.prototype = Object.create(topInstance.Widget.prototype);
        Imageview.prototype.constructor = Imageview;

        function Imageview(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-imageview']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-imageview'], props));
            }
        }

        Imageview.create = function (element, props) {
            return new Imageview(element, props);
        };

        return Imageview;
    };

    getTopUI().Widget.Imageview = ImageviewCreator(getTopUI());
    getTop().Widget.Imageview = ImageviewCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopLayoutUI = function (_TopLayoutBehavior) {
    _inherits(TopLayoutUI, _TopLayoutBehavior);

    function TopLayoutUI(props) {
        _classCallCheck(this, TopLayoutUI);

        return _possibleConstructorReturn(this, (TopLayoutUI.__proto__ || Object.getPrototypeOf(TopLayoutUI)).call(this, props));
    }

    _createClass(TopLayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this2 = this;

            if (children) {
                children = React.Children.map(children, function (child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this2,
                        layoutFunction: function layoutFunction() {
                            this.topTagStyle.width = '100%';
                            this.topTagStyle.height = '100%';
                            this.topTagStyle.display = 'block';
                            if (this.state.layoutWidth === 'match_parent') this.__updateLayoutWidth('100%');
                            if (this.state.layoutHeight === 'match_parent') this.__updateLayoutHeight('100%');
                        }
                    });
                });
            }
            return children;
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-layout',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-layout-root', style: this.topStyle },
                    this.__setWrapperStyle(this.state.children)
                )
            );
        }
    }]);

    return TopLayoutUI;
}(TopLayoutBehavior);

var TopLayout = function (_TopLayoutUI) {
    _inherits(TopLayout, _TopLayoutUI);

    function TopLayout() {
        _classCallCheck(this, TopLayout);

        return _possibleConstructorReturn(this, (TopLayout.__proto__ || Object.getPrototypeOf(TopLayout)).apply(this, arguments));
    }

    return TopLayout;
}(TopLayoutUI);

TopLayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {});

TopLayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-layout'
});

TopLayout.propConfigs = Object.assign({}, TopLayoutUI.propConfigs, {});

TopLayout.defaultProps = Object.assign({}, TopLayoutUI.defaultProps, {});

(function () {

    var LayoutCreator = function LayoutCreator(topInstance) {
        Layout.prototype = Object.create(topInstance.Widget.Layout.prototype);
        Layout.prototype.constructor = Layout;

        function Layout(element, props, childs) {
            topInstance.Widget.Layout.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-layout']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-layout'], props, childs));
            }
        }

        Layout.create = function (element, props, childs) {
            return new Layout(element, props, childs);
        };

        return Layout;
    };

    getTopUI().Widget.Layout.Layout = LayoutCreator(getTopUI());
    getTop().Widget.Layout.Layout = LayoutCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopLinearlayoutUI = function (_TopLayoutBehavior) {
    _inherits(TopLinearlayoutUI, _TopLayoutBehavior);

    function TopLinearlayoutUI(props) {
        _classCallCheck(this, TopLinearlayoutUI);

        var _this2 = _possibleConstructorReturn(this, (TopLinearlayoutUI.__proto__ || Object.getPrototypeOf(TopLinearlayoutUI)).call(this, props));

        _this2.mountFlag = false;
        _this2.state.offsetHeight = 0;
        _this2.reRenderChildFlag = false;
        return _this2;
    }

    _createClass(TopLinearlayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.__setWidgetSize();
            if (this.mountFlag === true && this.state.orientation === 'horizontal') {
                var height = this.getElementForSize().clientHeight - parseFloat(this.state.padding.paddingTop || '0') - parseFloat(this.state.padding.paddingBottom || '0');
                this.setState({
                    offsetHeight: height
                });
            }
            this.__setWidgetWeight();
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {
            if (this.reRenderChildFlag) {
                this.__reRenderChild();
                this.reRenderChildFlag = false;
            }
            if (this.props.layoutParent) {
                var height = this.getElementForSize().clientHeight - parseFloat(this.state.padding.paddingTop || '0') - parseFloat(this.state.padding.paddingBottom || '0');
                if ((this.mountFlag === true || this.state.offsetHeight !== height) && this.state.orientation === 'horizontal') {
                    this.setState({
                        offsetHeight: height
                    });
                }
            }
            this.__setWidgetWeight();
        }
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {
            this.mountFlag = false;
        }
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'setShouldComplete',
        value: function setShouldComplete(child, key) {
            if (this.state.orientation === 'horizontal') {
                if (key === 'layoutWidth') this.shouldComplete = true;
            } else if (this.state.orientation === 'vertical') {
                if (key === 'layoutHeight') this.shouldComplete = true;
            }
        }
    }, {
        key: '__updateOrientation',
        value: function __updateOrientation() {
            this.reRenderChildFlag = true;
        }
    }, {
        key: '__updateVerticalAlignment',
        value: function __updateVerticalAlignment() {
            this.reRenderChildFlag = true;
        }
    }, {
        key: '__updateHorizontalAlignment',
        value: function __updateHorizontalAlignment() {
            this.reRenderChildFlag = true;
        }
    }, {
        key: '__reRenderChild',
        value: function __reRenderChild() {
            this.__setWidgetSize();
            this.layoutChild.forEach(function (c) {
                console.debug('update child', c);
                c.forceUpdate();
            });
        }
    }, {
        key: 'renderLayout',
        value: function renderLayout() {
            this.topStyle.overflow = 'hidden';
            if (this.state.orientation === 'vertical') {
                this.removeTopStyle('whiteSpace');
            } else {
                this.setTopStyle('whiteSpace', 'nowrap');
            }
            this.__setLineHeight();
        }
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this3 = this;

            if (children) {
                children = React.Children.map(children, function (child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this3,
                        layoutFunction: function layoutFunction() {
                            if (this.props.layoutParent.state.orientation === 'vertical') {
                                this.removeClassFromTopClassList('linear-child-horizontal');
                                this.addClassToTopClassList('linear-child-vertical');

                                if (this.state.layoutWidth === 'match_parent') this.__updateLayoutWidth('100%');

                                var height = this.state.layoutHeight;
                                var horizontalAlignment = this.props.layoutParent.state.horizontalAlignment || 'left';
                                if (this.state.layoutHorizontalAlignment) horizontalAlignment = this.state.layoutHorizontalAlignment;
                                this.setTopTagStyle('textAlign', horizontalAlignment);
                                if (height && height.includes('%')) {
                                    this.setTopTagStyle('height', height);
                                    if (height.includes('%')) {
                                        this.__updateLayoutHeight('100%');
                                    }
                                }
                                this.removeTopTagStyle('lineHeight');
                            } else {
                                this.removeClassFromTopClassList('linear-child-vertical');
                                this.addClassToTopClassList('linear-child-horizontal');

                                if (this.state.layoutHeight === 'match_parent') this.__updateLayoutHeight('100%');

                                this.removeTopTagStyle('textAlign');
                                var verticalAlignment = this.props.layoutParent.state.verticalAlignment || 'top';
                                if (!this.state.layoutVerticalAlignment) {
                                    this.setTopStyle('verticalAlign', verticalAlignment);
                                }
                                this.setTopTagStyle('lineHeight', 'normal');
                            }
                        }
                    });
                });
            }
            return children;
        }
    }, {
        key: '__setLineHeight',
        value: function __setLineHeight() {
            if (this.state.orientation === 'vertical') {
                if (this.topStyle.lineHeight !== 'normal') {
                    this.removeTopStyle('lineHeight');
                }
                return;
            }
            if (this.state.offsetHeight === 0) {
                this.mountFlag = true;
                return;
            }

            if (this.state.offsetHeight > 0) {
                this.setTopStyle('lineHeight', this.state.offsetHeight + 'px');
            }
        }
    }, {
        key: '__setWidgetSize',
        value: function __setWidgetSize() {
            if (this.state.children.length <= 0) return;
            var _this = this;

            var pHorizontal = this.state.orientation === 'horizontal';

            var pWrapWidth = !this.state.layoutWidth || this.state.layoutWidth === 'auto',
                pWrapHeight = !this.state.layoutHeight || this.state.layoutHeight === 'auto';

            this.wSum = 0, this.hSum = 0, this.weightSum = 0;

            if (this.state.orientation === 'horizontal') {
                for (var i = 0, len = this.state.children.length; i < len; i++) {
                    (function (j) {
                        var item = _this.layoutChild[j];
                        var itemLayoutWidth = item.state.layoutWidth;

                        if (_this.layoutChild.length === 1 && (!itemLayoutWidth || itemLayoutWidth === 'auto' || itemLayoutWidth === 'wrap_content')) {
                            return;
                        }

                        var iWidth = parseFloat(itemLayoutWidth);
                        if (!isNaN(iWidth)) {
                            var computedStyle = window.getComputedStyle(item.getElementForSize());
                            if (parseFloat(item.state.padding.paddingLeft || '0') + parseFloat(item.state.padding.paddingRight || '0') + parseFloat(item.getValidBorderLeftWidth()) + parseFloat(item.getValidBorderRightWidth()) > iWidth) iWidth = parseFloat(item.state.padding.paddingLeft || '0') + parseFloat(item.state.padding.paddingRight || '0') + parseFloat(item.getValidBorderLeftWidth()) + parseFloat(item.getValidBorderRightWidth());
                            iWidth += parseFloat(item.state.marginLeft) + parseFloat(item.state.marginRight);
                            item.actualWidth = iWidth;
                            _this.wSum += iWidth;
                        } else if (!itemLayoutWidth || itemLayoutWidth === 'auto' || itemLayoutWidth === 'wrap_content') {
                            if (typeof item.getElementForSize === 'function') {
                                var computedStyle = window.getComputedStyle(item.getElementForSize());
                                iWidth = parseFloat(computedStyle.width) || 0;
                                iWidth += parseFloat(item.state.marginLeft) + parseFloat(item.state.marginRight);
                                item.actualWidth = iWidth;
                                _this.wSum += iWidth;
                            }
                        } else if (itemLayoutWidth === 'match_parent') {
                            var computedStyle = window.getComputedStyle(item.getElementForSize());
                            var iMargin = parseFloat(item.state.marginRight) + parseFloat(item.state.marginLeft);
                            if (pWrapWidth) {
                                var changedWidth = iMargin + 'px';
                            } else {
                                _this.wSum += iMargin;
                                var changedWidth = _this.wSum > 0 ? 'calc(100% - ' + _this.wSum + 'px)' : '100%';
                            }

                            item.setTopStyle('width', changedWidth);

                            item.forceUpdate();

                            if (!item.state.layoutWeight) {
                                _this.weightSum = 0;
                                return;
                            }
                            _this.wSum += iMargin;
                        }

                        var iWeight = parseFloat(item.state.layoutWeight);

                        if (!isNaN(iWeight)) _this.weightSum += iWeight;
                    })(i);
                }
            } else {
                for (var i = 0, len = this.state.children.length; i < len; i++) {
                    (function (j) {
                        var item = _this.layoutChild[j];

                        var itemLayoutHeight = item.state.layoutHeight;

                        if (_this.layoutChild.length === 1 && (!itemLayoutHeight || itemLayoutHeight === 'auto' || itemLayoutHeight === 'wrap_content')) {
                            return;
                        }
                        var iHeight = parseFloat(itemLayoutHeight);

                        if (!isNaN(iHeight)) {
                            var computedStyle = window.getComputedStyle(item.getElementForSize());
                            if (parseFloat(item.state.padding.paddingTop || '0') + parseFloat(item.state.padding.paddingBottom || '0') + parseFloat(item.getValidBorderTopWidth()) + parseFloat(item.getValidBorderBottomWidth()) > iHeight) iHeight = parseFloat(item.state.padding.paddingTop || '0') + parseFloat(item.state.padding.paddingBottom || '0') + parseFloat(item.getValidBorderTopWidth()) + parseFloat(item.getValidBorderBottomWidth());
                            iHeight += parseFloat(item.state.marginTop) + parseFloat(item.state.marginBottom);
                            item.actualHeight = iHeight;
                            _this.hSum += iHeight;
                        } else if (!itemLayoutHeight || itemLayoutHeight === 'auto' || itemLayoutHeight === 'wrap_content') {
                            if (typeof item.getElementForSize === 'function') {
                                var computedStyle = window.getComputedStyle(item.getElementForSize());
                                iHeight = parseFloat(computedStyle.height) || 0;
                                iHeight += parseFloat(item.state.marginTop) + parseFloat(item.state.marginBottom);
                                item.actualHeight = iHeight;
                                _this.hSum += iHeight;
                            }
                        } else if (itemLayoutHeight === 'match_parent') {
                            var computedStyle = window.getComputedStyle(item.getElementForSize());
                            var iMargin = parseFloat(item.state.marginTop) + parseFloat(item.state.marginBottom);
                            if (pWrapHeight) {
                                var changedHeight = iMargin + 'px';
                            } else {
                                var changedHeight = iMargin > 0 ? 'calc(100% - ' + iMargin + 'px)' : '100%';
                                var changedHeight_topTag = _this.hSum > 0 ? 'calc(100% - ' + _this.hSum + 'px)' : '100%';
                            }
                            item.setTopStyle('height', changedHeight);
                            item.setTopTagStyle('height', changedHeight_topTag);
                            item.forceUpdate();

                            if (!item.state.layoutWeight) {
                                _this.weightSum = 0;
                                return;
                            }

                            _this.hSum += iMargin;
                        }

                        var iWeight = parseFloat(item.state.layoutWeight);

                        if (!isNaN(iWeight)) _this.weightSum += iWeight;
                    })(i);
                }
            }
        }
    }, {
        key: '__setWidgetWeight',
        value: function __setWidgetWeight() {
            if (this.state.children.length <= 0 || this.weightSum <= 0) return;
            var _this = this;

            var layoutRoot = this.getElement();

            var whiteSpaceSize = 0;
            var rootSize = 0;

            if (this.state.orientation === 'vertical') {
                var pPadding = parseFloat(this.state.padding.paddingTop || '0') + parseFloat(this.state.padding.paddingBottom || '0');

                rootSize = layoutRoot.clientHeight - pPadding;
                whiteSpaceSize = rootSize;

                if (whiteSpaceSize <= 0 && !isNaN(parseFloat(this.state.layoutHeight))) {
                    whiteSpaceSize = parseFloat(this.state.layoutHeight) - pPadding;
                }

                whiteSpaceSize -= this.hSum;

                if (whiteSpaceSize <= 0) return;

                var weightRatio = whiteSpaceSize / this.weightSum;

                for (var i = 0; i < this.state.children.length; i++) {
                    (function (j) {
                        var item = _this.layoutChild[j];
                        if (item.state.layoutWeight) {
                            var itemHeight;
                            itemHeight = item.actualHeight;

                            itemHeight = itemHeight + weightRatio * parseFloat(item.state.layoutWeight);
                            itemHeight = itemHeight / rootSize * 100 + '%';

                            var minusValue = parseFloat(item.state.marginTop) || 0;
                            minusValue += parseFloat(item.state.marginBottom) || 0;

                            if (typeof item.getElementForSize === 'function' && item.getElementForSize().style.boxSizing !== 'border-box') {
                                minusValue += parseFloat(item.getValidBorderTopWidth()) || 0;
                                minusValue += parseFloat(item.getValidBorderBottomWidth()) || 0;
                                minusValue += parseFloat(item.state.padding.paddingTop || '0');
                                minusValue += parseFloat(item.state.padding.paddingBottom || '0');
                            }

                            item.setTopStyle('height', 'calc(100% - ' + minusValue + 'px)');
                            item.setTopTagStyle('height', itemHeight);
                            item.forceUpdate();
                        }
                    })(i);
                }
            } else {
                var pPadding = parseFloat(this.state.padding.paddingLeft || '0') + parseFloat(this.state.padding.paddingRight || '0');

                rootSize = layoutRoot.clientWidth - pPadding;
                whiteSpaceSize = rootSize;

                if (whiteSpaceSize <= 0 && !isNaN(parseFloat(this.state.layoutWidth))) {
                    whiteSpaceSize = parseFloat(this.state.layoutWidth) - pPadding;
                }

                whiteSpaceSize -= this.wSum;

                if (whiteSpaceSize <= 0) return;

                var weightRatio = whiteSpaceSize / this.weightSum;
                for (var i = 0; i < this.layoutChild.length; i++) {
                    (function (j) {
                        var item = _this.layoutChild[j];
                        if (item.state.layoutWeight) {

                            var itemWidth = item.actualWidth;

                            itemWidth = itemWidth + weightRatio * parseFloat(item.state.layoutWeight);
                            itemWidth = itemWidth / rootSize * 100 + '%';

                            if (!itemWidth) {
                                if (item.state.layoutWidth === 'auto' || !item.state.layoutWidth) itemWidth = '';
                                if (!isNaN(parseFloat(item.state.layoutWidth))) itemWidth = item.layoutWidth;
                            }
                            item.setTopStyle('width', itemWidth);
                            item.forceUpdate();
                        }
                    })(i);
                }
            }
        }
    }, {
        key: 'getWidth',
        value: function getWidth() {
            return this.getElement().offsetWidth;
        }
    }, {
        key: 'getHeight',
        value: function getHeight() {
            return this.getElement().offsetHeight;
        }
    }, {
        key: 'addWidgetByIndex',
        value: function addWidgetByIndex(widget, i) {
            var _this4 = this;

            this.setState(function (state, props) {
                var changedchilds = [];
                Object.assign(changedchilds, state.children);
                if (changedchilds.indexOf(widget.getReactElement()) >= 0) changedchilds.splice(changedchilds.indexOf(widget.getReactElement()), 1);
                if (widget.getTemplate()) {
                    var properties = widget.getTemplate().state;
                    changedchilds.splice(i, 0, React.createElement(_this4._top.Render.topWidgets[properties.tagName], properties, properties.children));
                } else if (widget.getReactElement()) {
                    changedchilds.splice(i, 0, widget.getReactElement());
                }
                return {
                    children: changedchilds
                };
            });
        }
    }, {
        key: 'complete',
        value: function complete() {
            this.__componentDidMount();
        }
    }, {
        key: '__render',
        value: function __render() {
            this.renderLayout();
            var topRootClass = 'top-linearlayout-root ' + this.state.orientation;
            return React.createElement(
                'top-linearlayout',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: topRootClass, style: this.topStyle },
                    this.__setWrapperStyle(this.state.children)
                )
            );
        }
    }]);

    return TopLinearlayoutUI;
}(TopLayoutBehavior);

var TopLinearlayout = function (_TopLinearlayoutUI) {
    _inherits(TopLinearlayout, _TopLinearlayoutUI);

    function TopLinearlayout() {
        _classCallCheck(this, TopLinearlayout);

        return _possibleConstructorReturn(this, (TopLinearlayout.__proto__ || Object.getPrototypeOf(TopLinearlayout)).apply(this, arguments));
    }

    return TopLinearlayout;
}(TopLinearlayoutUI);

TopLinearlayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {
    orientation: {
        type: String,
        options: ['horizontal', 'vertical'],
        default: 'horizontal'
    }
});

TopLinearlayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-linearlayout',
    verticalAlignment: 'top'
});

TopLinearlayout.propConfigs = Object.assign({}, TopLinearlayoutUI.propConfigs, {});

TopLinearlayout.defaultProps = Object.assign({}, TopLinearlayoutUI.defaultProps, {});

(function () {

    var LinearlayoutCreator = function LinearlayoutCreator(topInstance) {
        Linearlayout.prototype = Object.create(topInstance.Widget.Layout.prototype);
        Linearlayout.prototype.constructor = Linearlayout;

        function Linearlayout(element, props, childs) {
            topInstance.Widget.Layout.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-linearlayout']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-linearlayout'], props, childs));
            }
        }

        Linearlayout.create = function (element, props, childs) {
            return new Linearlayout(element, props, childs);
        };

        Linearlayout.prototype.getWidth = function () {
            return this.getTemplate().getWidth();
        };

        Linearlayout.prototype.getHeight = function () {
            return this.getTemplate().getHeight();
        };

        Linearlayout.prototype.addWidgetByIndex = function (widget, index) {
            this.getTemplate().addWidgetByIndex(widget, index);
        };

        return Linearlayout;
    };

    getTopUI().Widget.Layout.Linearlayout = LinearlayoutCreator(getTopUI());
    getTop().Widget.Layout.Linearlayout = LinearlayoutCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _toConsumableArray = function(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopListviewUI = function (_TopContainerBehavior) {
  _inherits(TopListviewUI, _TopContainerBehavior);

  function TopListviewUI(props) {
    _classCallCheck(this, TopListviewUI);

    var _this = _possibleConstructorReturn(this, (TopListviewUI.__proto__ || Object.getPrototypeOf(TopListviewUI)).call(this, props));

    _this.listData = {
      data: [],
      bodyinfo: [],
      rowinfo: [],
      _top: _this._top
    };
    _this.mountData = {
      flag: false
    };
    _this.state.items = _this._top.Util.namespace(_this.state.items, _this);
    return _this;
  }

  _createClass(TopListviewUI, [{
    key: "__makeEventArray",
    value: function __makeEventArray() {
      var _this2 = this;

      this.listData.eventinfo = this._top.Util.namespace(this.state.items, this).map(function (rowitem, rowitemindex) {
        return [].concat(_toConsumableArray(Object.values(_this2.state["rowOption"]))).map(function (data, index) {
          return {
            selected: false,
            checked: false
          };
        });
      });
    }
  }, {
    key: "__componentDidMount",
    value: function __componentDidMount() {}
  }, {
    key: "__componentDidUpdate",
    value: function __componentDidUpdate() {}
  }, {
    key: "__componentWillUpdate",
    value: function __componentWillUpdate() {}
  }, {
    key: "__componentWillUnmount",
    value: function __componentWillUnmount() {}
  }, {
    key: "__initProperties",
    value: function __initProperties() {
      this.listData.data = this.state.items;
      this.state.bodySet = this._top.Util.namespace(this.state.bodySet, this);
      this.state.bodyWidth = this._top.Util.namespace(this.state.bodyWidth, this);
      var _state = this.state,
          bodySet = _state.bodySet,
          bodyWidth = _state.bodyWidth;

      var colspanCount = 0;
      var toppos = 0;
      var leftpos = 0;

      colspanCount = 0;
      this.listData.bodyinfo = bodySet.map(function (obj, bodyindex) {
        leftpos = 0;
        return obj.body.map(function (columnitem, index) {
          var left = leftpos;
          var width = 0;

          if (~~parseInt(bodyWidth[index].width)) {
            width = parseInt(bodyWidth[index].width);
          } else {
            width = 120;
          }

          var right = left + width;
          leftpos += width;
          return {
            width: width,
            left: left,
            right: right,
            colspan: columnitem.colspan,
            rowspan: columnitem.rowspan,
            visible: "visible"
          };
        });
      });

      toppos = 0;
      this.listData.rowinfo = this.listData.data.map(function (rowitem, rowitemindex) {
        return bodySet.map(function (obj, bodyindex) {
          var height = parseInt(obj.rowHeight) ? parseInt(obj.rowHeight) : 30;
          var top = toppos;
          var bottom = top + height;
          toppos += height;
          return {
            vindex: rowitemindex,
            dataIndex: rowitemindex,
            height: height,
            top: top,
            bottom: bottom
          };
        });
      });
    }
  }, {
    key: "__updateDataModel",
    value: function __updateDataModel() {
      this.state.items = this.state.dataModel.items;
    }
  }, {
    key: "__updateItems",
    value: function __updateItems() {
      this.state.data = this.state.items;
    }
  }, {
    key: "getSelectedIndex",
    value: function getSelectedIndex() {
      var selects = [];
      for (var i = 0; i < this.state.rowinfo.length; i++) {
        var obj = this.state.rowinfo[i];
        if (obj.selected == true) {
          selects.push(i);
        }
      }
      return selects;
    }
  }, {
    key: "getSelectedData",
    value: function getSelectedData() {
      var selectsData = [];
      var selects = this.getSelectedIndex();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = selects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var i = _step.value;

          var obj = this.state.rowinfo[i];
          if (this.listData.widgetItems && this.listData.widgetItems.length > 0) {
            selectsData.push(this.state.children[i]);
          } else {
            selectsData.push(this.state.data[i]);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return selectsData;
    }
  }, {
    key: "__selectData",
    value: function __selectData(indexOrObject) {
      if (indexOrObject instanceof Array) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = indexOrObject[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var idx = _step2.value;

            this.state.rowinfo[idx]["selected"] = "selected";
            this.state.rowinfo[idx].CellInfoLink[0].setState({
              selected: "selected"
            });
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      } else {
        this.state.rowinfo[indexOrObject]["selected"] = "selected";
        this.state.rowinfo[indexOrObject].CellInfoLink[0].setState({
          selected: "selected"
        });
      }
      return;
    }
  }, {
    key: "__renderLayout",
    value: function __renderLayout() {}
  }, {
    key: "__render",
    value: function __render() {
      var _this3 = this;

      this.__initProperties();
      var overscan = this.state.overscan;

      return React.createElement(
        "top-listview",
        {
          id: this.state.id,
          ref: this.setTopRef,
          "class": this.makeTopTagClassString(),
          style: this.topTagStyle
        },
        React.createElement(
          "div",
          {
            id: this.state.id,
            ref: this.setRootRef,
            className: "top-listview-root",
            disabled: this.__calculateDerivedDisabled(),
            style: this.topStyle
          },
          React.createElement(ContainerBody, {
            cellrenderer: this.state.cellrenderer,
            isTable: false,
            columninfo: this.listData.bodyinfo,
            rowinfo: this.listData.rowinfo,
            event: this.listData.eventinfo,
            "viewport-height": this.state["layoutHeight"],
            "viewport-width": this.state["layoutWidth"],
            data: this.listData.data,
            "data-role": "listview",
            "data-inset": "true",
            className: "top-tbody listview-container flexframe",
            "item-drag": true,
            _top: this._top,
            ref: function ref(_ref) {
              _this3.list = _ref;
            },
            overscan: overscan
          })
        )
      );
    }
  }]);

  return TopListviewUI;
}(TopContainerBehavior);

TopListviewUI.propConfigs = Object.assign({}, TopContainerBehavior.propConfigs, {
  cellrenderer: {
    type: Function,
    default: null
  },

  onRowclick: {
    type: Function
  },

  itemDrag: {
    type: Boolean,
    options: [true, false],
    default: false
  },

  onScrollend: {
    type: Function
  }
});

TopListviewUI.defaultProps = Object.assign({}, TopContainerBehavior.defaultProps, {
  tagName: "top-listview",
  overscan: 2,
  bodyWidth: {
    type: Array,
    default: []
  },
  bodySet: {
    type: Array,
    default: []
  },
  data: {
    type: Array,
    default: []
  }
});

var TopListview = function (_TopListviewUI) {
  _inherits(TopListview, _TopListviewUI);

  function TopListview() {
    _classCallCheck(this, TopListview);

    return _possibleConstructorReturn(this, (TopListview.__proto__ || Object.getPrototypeOf(TopListview)).apply(this, arguments));
  }

  return TopListview;
}(TopListviewUI);

TopListview.propConfigs = Object.assign({}, TopListviewUI.propConfigs, {});
TopListview.defaultProps = Object.assign({}, TopListviewUI.defaultProps, {});

(function () {
  var ListviewCreator = function ListviewCreator(topInstance) {
    Listview.prototype = Object.create(topInstance.Widget.Container.prototype);
    Listview.prototype.constructor = Listview;

    function Listview(element, props) {
      topInstance.Widget.Container.apply(this, arguments);
      if (element instanceof topInstance.Render.topWidgets["top-listview"]) {
        this.setTemplate(element);
      } else {
        this.setReactElement(React.createElement(topInstance.Render.topWidgets["top-listview"], props));
      }
    }

    Listview.create = function (element, props) {
      return new Listview(element, props);
    };

    Listview.prototype.updateRowItemsDom = function (node) {
      this.getTemplate().updateRowItemsDom(node);
    };
    Listview.prototype.updateRowItemsDomString = function (string) {
      this.getTemplate().updateRowItemsDomString(string);
    };

    return Listview;
  };
  getTopUI().Widget.Container.Listview = ListviewCreator(getTopUI());
  getTop().Widget.Container.Listview = ListviewCreator(getTop());
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _defineProperty = function(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopMenuUI = function (_TopMenuBehavior) {
    _inherits(TopMenuUI, _TopMenuBehavior);

    function TopMenuUI(props) {
        _classCallCheck(this, TopMenuUI);

        var _this2 = _possibleConstructorReturn(this, (TopMenuUI.__proto__ || Object.getPrototypeOf(TopMenuUI)).call(this, props));

        _this2.state.selectedItems = [];
        _this2.state.selectedKey = '';
        return _this2;
    }

    _createClass(TopMenuUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            var mountFuncName = '__mount' + this._top.Util.capitalizeFirstLetter(this.state.type);
            if (typeof this[mountFuncName] === 'function') this[mountFuncName]();
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {
            var mountFuncName = '__mount' + this._top.Util.capitalizeFirstLetter(this.state.type);
            var floatingRoot = this.dom.top.querySelector('.top-menu-root.Menu_type_floating');
            if (this.state.type === 'floating') {
                if (!floatingRoot) {
                    this[mountFuncName]();
                } else {
                    for (key in this.topStyle) {
                        if (this.topStyle[key]) {
                            floatingRoot.style[key] = this.topStyle[key];
                        }
                    }
                }
            } else {
                if (floatingRoot) {
                    this.dom.top.removeChild(floatingRoot);
                }
            }
        }
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initialClassname',
        value: function __initialClassname() {
            var classTest = /(menu_01)|(menu_02)/g;
            if (this.state.type === 'side' && !classTest.test(this._top.Util.__classListToClassString(this.userClassList))) {
                this._top.Util.__addClassToClassList(this.userClassList, 'menu_01');
            }
        }
    }, {
        key: '__setMenuLayout',
        value: function __setMenuLayout(item) {
            return React.createElement(
                'a',
                { className: 'top-menu_item_inner' },
                this.state.menuLayout
            );
        }
    }, {
        key: '__getAnchor',
        value: function __getAnchor(item) {
            var depth = item.depth;
            var id = item.id ? 'top-menu_' + this.state.id + '_' + item.id : '';
            var itemClass = 'top-menu_item_inner inner_depth' + depth + ' ' + id;
            var iconClass = 'top-menu_icon icon_depth' + depth + ' ' + (item.icon ? item.icon : '');
            var textClass = 'top-menu_text text_depth' + depth;
            var iconStyle = {};
            var isParent = item.children && item.children.length ? true : false;
            if (!item.icon) iconStyle['paddingRight'] = '0px';
            var isMenu02 = this.userClassList.includes("menu_02") ? true : false;
            isMenu02 = this.state.sideType === 'shown' ? true : isMenu02;

            return [React.createElement(
                'a',
                { key: 'a', className: itemClass },
                item.image ? React.createElement('img', { key: 'img', className: 'top-menu_image', src: item.image }) : React.createElement('i', { key: 'icon', className: iconClass, style: iconStyle }),
                React.createElement(
                    'span',
                    { key: 'text', className: textClass },
                    item.text
                ),
                this.state.type === 'side' && isMenu02 && isParent && React.createElement('i', { key: 'arrow', className: 'top-menu_arrow icon-arrow_potab_down' })
            ), this.state.type === 'header' && React.createElement('i', { key: 'arrow', className: 'top-menu_arrow icon-arrow_down' }), this.state.type === 'cascading' && React.createElement('i', { key: 'arrow', className: 'top-menu_arrow icon-arrow_filled_left' })];
        }
    }, {
        key: '__setItems',
        value: function __setItems(items) {
            var _this3 = this;

            if (!items) {
                return;
            }
            var newItems = [];
            var oneLevelParent = {};
            var twoLevelParent = {};
            var oneLevelIndex = -1;
            var twoLevelIndex = -1;
            var threeLevelIndex = -1;

            items.map(function (item, index, array) {
                var isSelected = false;
                var newItem = {
                    depth: item.level,
                    text: item.text,
                    id: item.id,
                    icon: item.icon
                };

                var isParent = false;
                if (index < array.length - 1 && item.level < array[index + 1].level) {
                    isParent = true;
                    if (items.level === 2) {
                        oneLevelParent = newItem;
                    } else if (items.level === 3) {
                        twoLevelParent = newItem;
                    }
                }

                if (item.level === 1) {
                    oneLevelIndex++;
                    if (isParent) newItem.children = [];
                    newItem.indexKey = oneLevelIndex.toString();
                    newItems.push(newItem);
                    oneLevelParent = newItem;
                    twoLevelIndex = -1;
                } else if (item.level === 2) {
                    twoLevelIndex++;
                    if (isParent) newItem.children = [];
                    newItem.indexKey = oneLevelIndex + '_' + twoLevelIndex;
                    threeLevelIndex = -1;
                    twoLevelParent = newItem;
                    oneLevelParent.children.push(newItem);
                } else if (item.level === 3) {
                    threeLevelIndex++;
                    newItem.indexKey = oneLevelIndex + '_' + twoLevelIndex + '_' + threeLevelIndex;
                    twoLevelParent.children.push(newItem);
                }

                _this3.state.selectedItems.map(function (itemObj) {
                    if (itemObj.indexKey === newItem.indexKey) {
                        isSelected = true;
                    }
                });

                if (_this3.state.selectedKey === newItem.indexKey) {
                    _this3.selected = newItem;
                }
                if (isSelected) {
                    newItem.selected = true;
                } else {
                    newItem.selected = false;
                }
            });
            return newItems;
        }
    }, {
        key: '__makeMenu',
        value: function __makeMenu(items) {
            var _this4 = this;

            this.dom.lis = [];
            var items = items || this.items;
            return items.map(function (item, index, array) {
                var _classNames;

                var isDivider = (item.divider === true || item.divider) === 'true' ? true : false;
                var isItemlayout = item.itemLayoutId ? true : false;
                var isFloating = _this4.state.type === 'floating' ? true : false;
                var isCascading = _this4.state.type === 'cascading' ? true : false;
                var isDropdown = _this4.state.type === 'dropdown' ? true : false;
                var isParent = item.children && item.children.length ? true : false;
                var depth = 'depth' + item.depth;
                var liClass = classNames((_classNames = {
                    'top-menu_item': !isFloating,
                    'top-menu_parent': isCascading,
                    'connected_layout': isItemlayout,
                    'divider': isDivider
                }, _defineProperty(_classNames, 'top-menu_parent', isParent), _defineProperty(_classNames, 'top-menu_collapsed', isParent), _classNames));
                var ulStyle = {
                    display: 'none'
                };
                liClass += ' ' + depth;
                if (item.children && item.children.length > 0) {
                    return React.createElement(
                        'li',
                        { key: 'li_' + depth + '_' + index, ref: function ref(_ref) {
                                return _this4.dom.lis.push(_ref);
                            }, className: liClass },
                        _this4.state.menuLayout ? _this4.__setMenuLayout(item) : _this4.__getAnchor(item),
                        React.createElement(
                            'ul',
                            { style: ulStyle, className: 'ul_' + depth },
                            _this4.__makeMenu(item.children)
                        ),
                        isDropdown ? _this4.renderDropdownIcon() : ''
                    );
                } else {
                    return React.createElement(
                        'li',
                        { key: 'li_' + depth + '_' + index, ref: function ref(_ref2) {
                                return _this4.dom.lis.push(_ref2);
                            }, className: liClass },
                        _this4.state.menuLayout ? _this4.__setMenuLayout(item) : _this4.__getAnchor(item)
                    );
                }
            });
        }
    }, {
        key: '__mountFloating',
        value: function __mountFloating() {
            var root = this.dom.top;
            $(root.querySelector("ul")).slicknav({
                appendTo: this.dom.root,
                label: ''
            });
        }
    }, {
        key: '__renderHeader',
        value: function __renderHeader() {
            var topRootClass = 'top-menu Menu_type_' + this.state.type + ' ' + (this.state.animation ? 'withAnimation' : 'withoutAnimation') + ' placement_' + this.state.placement;
            var containerStyle = {};
            return React.createElement(
                'div',
                { ref: this.setRootRef, className: topRootClass, id: this.state.id, disabled: this.__calculateDerivedDisabled(), style: this.topStyle },
                React.createElement(
                    'div',
                    { className: 'top-menu-root' },
                    React.createElement(
                        'div',
                        { className: 'top-menu-container', style: containerStyle },
                        React.createElement(
                            'ul',
                            { className: 'top-menu_nav' },
                            this.__makeMenu()
                        )
                    )
                )
            );
        }
    }, {
        key: '__renderDrawer',
        value: function __renderDrawer() {
            var _this5 = this;

            var topRootClass = 'top-menu Menu_type_' + this.state.type + ' ' + (this.state.animation ? 'withAnimation' : 'withoutAnimation') + ' placement_' + this.state.placement;
            var containerStyle = {};
            if (this.state.isOpened === undefined) {
                this.state.isOpened = true;
            }

            var navStyle = {
                display: this.state.isOpened ? '' : 'none'
            };
            var rootStyle = Object.assign(this.topStyle);
            rootStyle.width = this.state.rootWidth;
            rootStyle.height = this.state.rootHeight;

            var btnClass = classNames({
                'top-menu_btn': true,
                'top-menu_open': this.state.isMenuOpened,
                'top-menu_collapsed': !this.state.isMenuOpened
            });

            return React.createElement(
                'div',
                { ref: this.setRootRef, className: topRootClass, id: this.state.id, disabled: this.__calculateDerivedDisabled(), style: rootStyle },
                React.createElement(
                    'div',
                    { className: 'top-menu-root' },
                    React.createElement(
                        'div',
                        { className: 'top-menu-container', style: containerStyle },
                        React.createElement('button', { className: btnClass }),
                        React.createElement(
                            'ul',
                            { className: 'top-menu_nav', style: navStyle, ref: function ref(_ref3) {
                                    return _this5.dom.menuNav = _ref3;
                                } },
                            this.__makeMenu()
                        )
                    )
                )
            );
        }
    }, {
        key: '__renderFloating',
        value: function __renderFloating() {
            var topRootClass = 'top-menu Menu_type_' + this.state.type + ' ' + (this.state.animation ? 'withAnimation' : 'withoutAnimation');
            var ulId = this._top.Util.guid();

            return [React.createElement('div', { ref: this.setRootRef, className: topRootClass, id: this.state.id, disabled: this.__calculateDerivedDisabled(), style: this.topStyle, key: this.state.id }), React.createElement(
                'ul',
                { id: ulId, key: ulId },
                this.__makeMenu()
            )];
        }
    }, {
        key: '__renderSide',
        value: function __renderSide() {
            var _this6 = this;

            var item = this.items;

            function getMaxWidth() {
                var maxText = '';
                for (var i = 0; i < item.length; i++) {
                    if (item[i].text.length > maxText.length) {
                        maxText = item[i].text;
                    }
                }
                String.prototype.width = function () {
                    var f = '13px arial',
                        o = $('<div>' + this + '</div>').css({
                        'position': 'absolute',
                        'float': 'left',
                        'white-space': 'nowrap',
                        'visibility': 'hidden',
                        'font': f
                    }).appendTo($('body')),
                        w = o.width();
                    o.remove();
                    return w;
                };
                return maxText.width() + 110;
            }

            var isMenu02 = this.userClassList.includes("menu_02") ? true : false;
            isMenu02 = this.state.sideType === "shown" ? true : isMenu02;
            var topRootClass = 'top-menu Menu_type_' + this.state.type + ' ' + (this.state.animation ? 'withAnimation' : 'withoutAnimation') + ' ' + (isMenu02 ? 'menu_02' : 'menu_01') + ' placement_' + this.state.placement;
            var containerStyle = {};
            if (isMenu02) {
                var maxWidth = getMaxWidth() + 'px';
                containerStyle['width'] = maxWidth;
                if (this.state.placement === 'right') {
                    containerStyle['marginLeft'] = '-' + maxWidth;
                }
            } else {
                containerStyle['width'] = '50px';
            }
            return React.createElement(
                'div',
                { ref: this.setRootRef, className: topRootClass, id: this.state.id, disabled: this.__calculateDerivedDisabled(), style: this.topStyle },
                React.createElement(
                    'div',
                    { className: 'top-menu-root' },
                    React.createElement(
                        'div',
                        { className: 'top-menu-container', ref: function ref(_ref4) {
                                return _this6.dom.container = _ref4;
                            }, style: containerStyle },
                        React.createElement(
                            'ul',
                            { className: 'top-menu_nav' },
                            this.__makeMenu()
                        )
                    )
                )
            );
        }
    }, {
        key: '__renderCascading',
        value: function __renderCascading() {
            var topMenuTitleIconClass = 'top-menu_title_icon ' + (this.state.icon ? this.state.icon : '');
            var topMenuTitleStyle = {};
            var topRootClass = 'top-menu Menu_type_' + this.state.type + ' ' + (this.state.animation ? 'withAnimation' : 'withoutAnimation');

            return React.createElement(
                'div',
                { ref: this.setRootRef, className: topRootClass, id: this.state.id, disabled: this.__calculateDerivedDisabled(), style: this.topStyle },
                React.createElement(
                    'div',
                    { className: 'top-menu-root' },
                    React.createElement(
                        'ul',
                        { className: 'top-menu_nav' },
                        this.__makeMenu()
                    )
                )
            );
        }
    }, {
        key: '__renderDropdown',
        value: function __renderDropdown() {
            var topMenuTitleIconClass = 'top-menu_title_icon ' + (this.state.icon ? this.state.icon : '');
            var topMenuTitleStyle = {};
            var topRootClass = 'top-menu Menu_type_' + this.state.type + ' ' + (this.state.animation ? 'withAnimation' : 'withoutAnimation');

            if (this.state.iconArrow === undefined) {
                this.state.iconArrow = 'down';
            }

            var btnClass = classNames({
                'top-menu_btn': true,
                'top-menu_collapsed': !this.state.isOpened,
                'top-menu_open': this.state.isOpened
            });

            var iconClass = classNames({
                'icon-arrow_filled_down': this.state.iconArrow === 'down',
                'icon-arrow_filled_up': this.state.iconArrow === 'up'
            });

            var navStyle = {
                display: this.state.isOpened === true ? 'block' : 'none',
                maxHeight: this.state.listMaxHeight ? this.state.listMaxHeight : '',
                overflowY: this.state.listMaxHeight ? "scroll" : ''
            };
            return React.createElement(
                'div',
                { ref: this.setRootRef, className: topRootClass, id: this.state.id, disabled: this.__calculateDerivedDisabled(), style: this.topStyle },
                React.createElement(
                    'div',
                    { className: 'top-menu-root' },
                    React.createElement(
                        'a',
                        { className: btnClass, style: { outline: 'none' } },
                        React.createElement('i', { className: topMenuTitleIconClass }),
                        React.createElement(
                            'span',
                            { className: 'top-menu_title', style: topMenuTitleStyle },
                            this.state.title
                        ),
                        React.createElement('i', { className: iconClass })
                    ),
                    React.createElement(
                        'ul',
                        { className: 'top-menu_nav', style: navStyle },
                        this.__makeMenu()
                    )
                )
            );
        }
    }, {
        key: 'renderDropdownIcon',
        value: function renderDropdownIcon() {
            return React.createElement(
                'i',
                { className: 'top-menu_arrow icon-arrow_filled_right' },
                ' '
            );
        }
    }, {
        key: 'setDropdownPosition',
        value: function setDropdownPosition(ul) {
            var btn = this.dom.root.querySelector('.top-menu_btn');
            var list = ul;
            var btn = ul.parentNode;
            if (!list || list.offsetWidth === undefined || list.offsetWidth === 0) return;

            list.style.top = "";
            list.style.left = "";
            list.style.width = "";
            list.style.right = "";
            list.style.bottom = "";
            if (this.state.listLocation) {
                if (this.state.listLocation.startsWith("b")) {
                    list.style.top = btn.getBoundingClientRect().top + "px";
                } else {
                    list.style.bottom = window.innerHeight - btn.getBoundingClientRect().bottom + btn.offsetHeight + "px";
                }
                if (this.state.listLocation.endsWith("l")) {
                    list.style.left = btn.getBoundingClientRect().left + btn.getBoundingClientRect().width + "px";
                } else {
                    var calcedRight = Math.abs(btn.getBoundingClientRect().right - $(document).width());
                    list.style.right = calcedRight + "px";
                }
            } else {
                list.style.top = btn.getBoundingClientRect().top + "px";
                list.style.left = btn.getBoundingClientRect().left + btn.getBoundingClientRect().width + "px";

                if ($(list).offset().top + list.offsetHeight > $(document).height()) {
                    list.style.top = "";
                    list.style.bottom = window.innerHeight - btn.getBoundingClientRect().bottom + btn.offsetHeight + "px";
                }
            }

            if (list.offsetWidth !== undefined && btn && btn.offsetWidth !== undefined && list.offsetWidth <= btn.offsetWidth) {
                list.style.width = btn.offsetWidth + "px";
            }
        }
    }, {
        key: '__renderMenu',
        value: function __renderMenu() {
            var renderFuncName = '__render' + this._top.Util.capitalizeFirstLetter(this.state.type);
            return this[renderFuncName]();
        }
    }, {
        key: '__initProperties',
        value: function __initProperties() {
            if (typeof this.state.items === 'string') {
                this.menuData.data = this._top.Util.namespace(this.state.items, this);
                this.menuData.itemsString = this.state.items;
            } else if (_typeof(this.state.items) === 'object') {
                this.menuData.data = this.state.items;
            } else if (this.state.items === undefined) {
                this.menuData.data = [];
            }
            if (this.state.children) {
                for (var i = 0; i < this.state.children.length; i++) {
                    if (this.state.children[i].props.tagName === 'top-menuitem') {
                        this.menuData.menuItems.push(this.state.children[i]);
                    }
                }
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            this.__initProperties();
            if (this.state.placement === 'right') {
                this.state.layoutRight = '0px';
                this.__updateLayoutRight();
            }
            this.items = this.__setItems(this.state.items);

            return React.createElement(
                'top-menu',
                { ref: this.setTopRef, id: this.state.id, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                this.__renderMenu()
            );
        }
    }]);

    return TopMenuUI;
}(TopMenuBehavior);

var TopMenu = function (_TopMenuUI) {
    _inherits(TopMenu, _TopMenuUI);

    function TopMenu(props) {
        _classCallCheck(this, TopMenu);

        var _this7 = _possibleConstructorReturn(this, (TopMenu.__proto__ || Object.getPrototypeOf(TopMenu)).call(this, props));

        _this7.state.isMenuOpened = true;
        _this7.dom.openedLIs = [];
        return _this7;
    }

    _createClass(TopMenu, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopMenu.prototype.__proto__ || Object.getPrototypeOf(TopMenu.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent();
            this.originWidth = this.dom.root.offsetWidth;
            this.originHeight = this.dom.root.offsetHeight;
        }
    }, {
        key: '__initEventInternal',
        value: function __initEventInternal() {
            this.__addEventByAttr('itemclick');
            this.__addEventByAttr('open');
            this.__addEventByAttr('close');
            this.__addEventByAttr('select');
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            var typeName = this._top.Util.capitalizeFirstLetter(this.state.type);
            var eventHandlerName = 'eventHandlerFor' + typeName;

            this._top.EventManager.on("click", this.dom.root, this[eventHandlerName].bind(this));
        }
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {
            this._top.EventManager.off("click", this.dom.root);
        }
    }, {
        key: 'eventHandlerForDrawer',
        value: function eventHandlerForDrawer() {
            var _this = this;
            var target = event.srcElement;
            var targetName = '';
            while (true) {
                if (target.tagName == undefined || target.tagName == null) {
                    return;
                }
                var classList = this._top.Util.__classStringToClassList(target.className);
                if (classList.includes("top-menu_item_inner")) {
                    targetName = 'itemInner';
                    break;
                } else if (classList.includes("top-menu_btn")) {
                    targetName = 'menuBtn';
                    break;
                }
                target = target.parentNode;
            };
            var checkReg = new RegExp("^top-menu_" + this.id + "_");

            if (targetName === 'menuBtn') {
                if ($(target).hasClass('top-menu_open')) {
                    if (!_this.layoutHeight || _this.layoutHeight === "auto") {
                        this.setState({
                            rootHeight: _this.originHeight + 'px'
                        });
                    }
                    this.setState({
                        isOpened: false,
                        isMenuOpened: false
                    });

                    var btnWidth = target.offsetWidth;
                    this.setState({
                        rootWidth: btnWidth + 'px'
                    });

                    if (this._top.Util.Browser.isIE()) {
                        _this.__dispatchEvent(new CustomEvent("close"));
                    } else {
                        _this.__dispatchEvent(new Event("close"));
                    }
                } else {
                    if (_this.layoutHeight === "auto") {
                        this.setState({
                            rootHeight: 'auto'
                        });
                    }

                    this.setState({
                        isOpened: true,
                        rootWidth: _this.originWidth + 'px',
                        isMenuOpened: true
                    });
                    if (this._top.Util.Browser.isIE()) {
                        _this.__dispatchEvent(new CustomEvent("open"));
                    } else {
                        _this.__dispatchEvent(new Event("open"));
                    }
                }
            } else if (targetName === 'itemInner') {
                var thisLI = target.parentNode;

                _this.menuItemClickEventForDrawerAndSide(target, thisLI, target, checkReg);
            }
        }
    }, {
        key: 'eventHandlerForDropdown',
        value: function eventHandlerForDropdown() {
            var _this = this;
            var target = event.srcElement;
            var targetName = '';
            while (true) {
                var classList = this._top.Util.__classStringToClassList(target.className);
                if (target.tagName == undefined || target.tagName == null) {
                    return;
                }
                if (classList.includes('top-menu_item')) {
                    targetName = 'menuItem';
                    break;
                } else if (classList.includes("top-menu_btn")) {
                    targetName = 'menuBtn';
                    break;
                }
                target = target.parentNode;
            };

            if (targetName === 'menuBtn') {
                if (classList.includes("top-menu_collapsed")) {
                    this.setState({
                        iconArrow: 'up',
                        isOpened: true
                    });
                } else if (classList.includes("top-menu_open")) {
                    this.setState({
                        iconArrow: 'down',
                        isOpened: false
                    });
                }
            } else if (targetName === 'menuItem') {
                if (!classList.includes('top-menu_parent')) {

                    var this_id;
                    this_id = this.state.id;
                    var checkReg = new RegExp("^top-menu_" + this_id + "_");

                    var innerItem = target.querySelector(".top-menu_item_inner");
                    for (var i = 0; i < innerItem.classList.length; i++) {
                        if (checkReg.test(innerItem.classList[i])) {
                            this.selectedMenuId = innerItem.classList[i].replace("top-menu_" + this_id + "_", "");
                            break;
                        }
                    }
                    var parent_ul = target.parentNode;

                    var prevSelectedItem = $(parent_ul).find("> .selected");
                    if (prevSelectedItem) {
                        if (prevSelectedItem.hasClass("top-menu_parent")) closeMenuItem(prevSelectedItem[0]);else prevSelectedItem.removeClass("selected");
                    }
                    target.classList.add("selected");
                } else if (classList.includes('top-menu_collapsed')) {
                    var parent_ul = target.parentNode;

                    var prevSelectedItem = $(parent_ul).find("> .selected");
                    if (prevSelectedItem) {
                        if (prevSelectedItem.hasClass("top-menu_parent")) closeMenuItem(prevSelectedItem[0]);else prevSelectedItem.removeClass("selected");
                    }

                    openMenuItem(target);
                    var childMenu_ul = target.querySelector('ul');
                    this.setDropdownPosition(childMenu_ul);
                } else if (target.className.includes('top-menu_open')) {
                    closeMenuItem(target);
                }
            }

            function closeMenuItem(menuElem) {
                if (!menuElem) return;

                var childMenu_ul = menuElem.querySelector("ul");

                menuElem.classList.remove("selected");
                menuElem.classList.remove("top-menu_open");
                menuElem.classList.add("top-menu_collapsed");

                childMenu_ul.style.display = "none";
                var childMenuItem_li = $(childMenu_ul).find("> .selected");
                if (childMenuItem_li.length > 0 && childMenuItem_li.hasClass("top-menu_parent")) {
                    for (var i = 0; i < childMenuItem_li.length; i++) {
                        closeMenuItem(childMenuItem_li[i]);
                    }
                }
            }

            function openMenuItem(menuElem) {
                if (!menuElem) return;

                var parent_ul = menuElem.parentNode;
                var childMenu_ul = menuElem.querySelector("ul");

                menuElem.classList.add("selected");
                menuElem.classList.add("top-menu_open");
                menuElem.classList.remove("top-menu_collapsed");
                if (childMenu_ul) {
                    childMenu_ul.style.display = "block";
                    childMenu_ul.style.top = (parent_ul.clientHeight - parent_ul.offsetHeight) / 2 + "px";
                    childMenu_ul.style.left = menuElem.offsetLeft + menuElem.offsetWidth + "px";
                }
            }
        }
    }, {
        key: 'eventHandlerForFloating',
        value: function eventHandlerForFloating() {
            var _this = this;
            var target = event.srcElement;
            var targetName = '';
            while (true) {
                if (target.tagName == undefined || target.tagName == null) {
                    return;
                }
                var classList = this._top.Util.__classStringToClassList(target.className);
                var parentClassList = this._top.Util.__classStringToClassList(target.parentNode.className);
                if (classList.includes("top-menu_item_inner") && !parentClassList.includes("top-menu_parent")) {
                    targetName = 'menuItem';
                    break;
                } else if (classList.includes("top-menu_btn")) {
                    targetName = 'menuBtn';
                    break;
                }
                target = target.parentNode;
            };

            if (targetName === 'menuItem') {} else if (targetName === 'menuBtn') {}
        }
    }, {
        key: 'eventHandlerForSide',
        value: function eventHandlerForSide() {
            var _this = this;
            var checkReg = new RegExp("^top-menu_" + this.id + "_");
            var checkClass02 = /\b(menu_02)\b/g;
            var width = this.getMaxWidth();
            var isMenu02 = checkClass02.test(this.dom.root.classList.value) ? true : false;
            var eventType = event.type;
            isMenu02 = this.sideType === "shown" ? true : isMenu02;
            $(this.dom.root).find(".top-menu_nav").css("width", width);
            var targetName = '';
            if (eventType === 'enter') {} else if (eventType === 'leave') {} else if (eventType === 'click') {
                var target = event.srcElement;
                while (true) {
                    if (target.tagName == undefined || target.tagName == null) {
                        return;
                    }
                    var classList = this._top.Util.__classStringToClassList(target.className);
                    if (isMenu02) {
                        if (classList.includes("top-menu_item")) {
                            targetName = 'click_menuItem_02';
                            break;
                        }
                    } else {
                        if (classList.includes("top-menu_item")) {
                            targetName = 'click_menuItem_01';
                            break;
                        }
                    }
                    target = target.parentNode;
                };
            }
            if (targetName === 'click_menuItem_02' || targetName === 'click_menuItem_01') {
                var thisLI = target;

                var thisAnchor = target.querySelector('.top-menu_item_inner');
                _this.menuItemClickEventForDrawerAndSide(target, thisLI, thisAnchor, checkReg);
            } else if (targetName === 'click_menuItem_01') {}
        }
    }, {
        key: 'eventHandlerForHeader',
        value: function eventHandlerForHeader() {
            var _this = this;
            var target = event.srcElement;
            var targetName = '';
            var checkReg = new RegExp("^top-menu_" + this.id + "_");

            while (true) {
                if (target.tagName == undefined || target.tagName == null) {
                    return;
                }
                var classList = this._top.Util.__classStringToClassList(target.className);
                if (classList.includes("top-menu_parent")) {
                    targetName = 'menuItem';
                    break;
                } else if (classList.includes("top-menu_btn")) {
                    targetName = 'menuBtn';
                    break;
                }
                target = target.parentNode;
            };

            if (targetName === 'menuItem') {} else if (targeName === 'menuBtn') {}
        }
    }, {
        key: 'eventHandlerForCascading',
        value: function eventHandlerForCascading() {
            var _this = this;
            var target = event.srcElement;
            var targetName = '';
            var checkReg = new RegExp("^top-menu_" + this.id + "_");

            while (true) {
                if (target.tagName == undefined || target.tagName == null) {
                    return;
                }
                var classList = this._top.Util.__classStringToClassList(target.className);
                if (classList.includes("top-menu_parent")) {
                    targetName = 'menuItem';
                    break;
                } else if (classList.includes("top-menu_btn")) {
                    targetName = 'menuBtn';
                    break;
                }
                target = target.parentNode;
            };

            if (targetName === 'menuItem') {} else if (targeName === 'menuBtn') {}
        }
    }, {
        key: 'open',
        value: function open() {
            this.height = this.dom.span.getBoundingClientRect().top + this.dom.span.getBoundingClientRect().height - 1 + "px";
            this.setState({
                isOpened: true
            });
        }
    }, {
        key: 'close',
        value: function close() {
            this.setState({
                isOpened: false
            });
        }
    }, {
        key: 'menuItemClickEventForDrawerAndSide',
        value: function menuItemClickEventForDrawerAndSide(target, targetLi, anchor, checkReg) {
            var _this = this;
            var thisLI = targetLi;

            $(this.dom.root).find(".selected").removeClass("selected");
            var opened_LIs = $(this.dom.root).find("li.top-menu_open");
            var parent_LIs = $(target).closest("ul").parents("li");
            $.each(opened_LIs, function (index, openedLI) {
                var isParent = false;
                $.each(parent_LIs, function (_index, parent_li) {
                    if (openedLI === parent_li) isParent = true;
                });

                if (openedLI === thisLI) isParent = true;
                if (!isParent) {
                    _this.state.animation === false ? $(openedLI).find("> ul").hide() : $(openedLI).find("> ul").slideUp();
                    openedLI.classList.remove("top-menu_open");
                    openedLI.classList.add("top-menu_collapsed");
                }
            });
            target.classList.add("selected");
            $(this.dom.root).find("li.depth1.active").removeClass('active');

            var activeDepth1 = $(anchor).parents("li.depth1")[0];
            activeDepth1.classList.add('active');

            if ($(thisLI).hasClass("top-menu_open")) {
                this.state.animation === false ? $(thisLI).find("> ul").hide() : $(thisLI).find("> ul").slideUp();
                thisLI.classList.remove('top-menu_open');
                thisLI.classList.add('top-menu_collapsed');

                if ($(thisLI).hasClass("depth1")) {
                    $(activeDepth1).removeClass('active');
                }
            } else if ($(thisLI).hasClass("top-menu_collapsed")) {
                this.state.animation === false ? $(thisLI).find("> ul").show() : $(thisLI).find("> ul").slideDown();
                thisLI.classList.remove('top-menu_collapsed');
                thisLI.classList.add('top-menu_open');
            }

            for (var i = 0; i < anchor.classList.length; i++) {
                if (checkReg.test(anchor.classList[i])) {
                    this.selectedMenuId = anchor.classList[i].replace("top-menu_" + this.id + "_", "");
                    break;
                }
            }

            var menuItems = thisLI.querySelectorAll('a');
            for (var i = 0; i < menuItems.length; i++) {
                menuItem = menuItems[i];
                if ($(menuItem).hasClass('selected')) $(menuItem.parentNode).addClass('selected');else $(menuItem.parentNode).removeClass('selected');
            }
        }
    }, {
        key: 'getMaxWidth',
        value: function getMaxWidth() {
            var nodes = this.dom.root.getElementsByTagName("li");
            if (this.state.layoutWidth && this.state.layoutWidth !== 'match_parent' && this.state.layoutWidth !== 'auto') {
                return this.state.layoutWidth;
            }
            var len = nodes.length;
            var maxText = "";
            var temp = "";
            for (var i = 0; i < len; i++) {
                temp = $(nodes[i]).children("a").text();
                if (temp.length > maxText.length) {
                    maxText = temp;
                }
            }
            String.prototype.width = function () {
                var f = '13px arial',
                    o = $('<div>' + this + '</div>').css({
                    'position': 'absolute',
                    'float': 'left',
                    'white-space': 'nowrap',
                    'visibility': 'hidden',
                    'font': f
                }).appendTo($('body')),
                    w = o.width();
                o.remove();
                return w;
            };
            return maxText.width() + 110;
        }
    }]);

    return TopMenu;
}(TopMenuUI);

TopMenuUI.propConfigs = Object.assign({}, TopMenuBehavior.propConfigs, {
    type: {
        type: String,
        options: ['floating', 'side', 'dropdown', 'drawer', 'header', 'cascading'],
        default: 'dropdown',
        aliases: ['menuType']
    },

    items: {
        type: Array,
        arrayOf: Object,
        default: []
    },

    animation: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    placement: {
        type: String,
        options: ['left', 'right', 'vertical', 'horizontal'],
        default: 'left'
    },

    sideType: {
        type: String,
        options: ['hidden', 'shown'],
        default: 'hidden'
    },

    autoClose: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    hoverClose: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    listMaxHeight: {
        type: String
    },

    listLocation: {
        type: String,
        options: ['bl', 'br', 'tl', 'tr'],
        default: 'bl'
    },

    icon: {
        type: String
    },

    onOpen: {
        type: Function
    },

    onClose: {
        type: Function
    },

    onSelect: {
        type: Function
    },

    onItemclick: {
        type: Function
    }

});

TopMenuUI.defaultProps = Object.assign({}, TopMenuBehavior.defaultProps, {
    tagName: 'top-menu'
});

(function () {

    var MenuCreator = function MenuCreator(topInstance) {
        Menu.prototype = Object.create(topInstance.Widget.prototype);
        Menu.prototype.constructor = Menu;

        function Menu(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-menu']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-menu'], props));
            }
        }

        Menu.create = function (element, props) {
            return new Menu(element, props);
        };

        Menu.prototype.addMenu = function (widget) {
            this.getTemplate().menuItems.push(widget.getTemplate());
        };

        Menu.prototype.removeMenu = function (widget, destroy) {
            var child_len = this.getTemplate().menuItems.length;

            for (var i = 0; i < child_len; i++) {
                if (this.getTemplate().menuItems[i].id == widget.id) {
                    this.getTemplate().menuItems.splice(i, 1);
                    break;
                }
            }
        };
        return Menu;
    };

    getTopUI().Widget.Menu = MenuCreator(getTopUI());
    getTop().Widget.Menu = MenuCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopNotificationUI = function (_TopEventBehavior) {
    _inherits(TopNotificationUI, _TopEventBehavior);

    function TopNotificationUI(props) {
        _classCallCheck(this, TopNotificationUI);

        return _possibleConstructorReturn(this, (TopNotificationUI.__proto__ || Object.getPrototypeOf(TopNotificationUI)).call(this, props));
    }

    _createClass(TopNotificationUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__renderNotification',
        value: function __renderNotification() {
            return React.createElement(WidgetNameBlock, { widgetName: 'Notification' });
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-notification',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-notification-root', style: this.topStyle },
                    this.__renderNotification()
                )
            );
        }
    }]);

    return TopNotificationUI;
}(TopEventBehavior);

var TopNotification = function (_TopNotificationUI) {
    _inherits(TopNotification, _TopNotificationUI);

    function TopNotification() {
        _classCallCheck(this, TopNotification);

        return _possibleConstructorReturn(this, (TopNotification.__proto__ || Object.getPrototypeOf(TopNotification)).apply(this, arguments));
    }

    return TopNotification;
}(TopNotificationUI);

TopNotificationUI.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {
    icon: {
        type: String
    },

    title: {
        type: String
    },

    message: {
        type: String
    },

    url: {
        type: String
    },

    target: {
        type: String,
        options: ['_blank', '_self', '_parent', '_top']
    },

    type: {
        type: String,
        options: ['success', 'info', 'warning', 'danger'],
        default: 'info'
    },

    placement: {
        type: String,
        options: ['tl', 'tc', 'tr', 'bl', 'bc', 'br'],
        default: 'tr'
    },

    offset: {
        type: Number,
        default: 0
    },

    offsetX: {
        type: Number
    },

    offsetY: {
        type: Number
    },

    delay: {
        type: Number,
        default: 0
    },

    updatedOnopen: {
        type: Boolean,
        default: false
    }
});

TopNotificationUI.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {
    tagName: 'top-notification'
});

TopNotification.propConfigs = Object.assign({}, TopNotificationUI.propConfigs, {});

TopNotification.defaultProps = Object.assign({}, TopNotificationUI.defaultProps, {});

(function () {

    var NotificationCreator = function NotificationCreator(topInstance) {
        Notification.prototype = Object.create(topInstance.Widget.prototype);
        Notification.prototype.constructor = Notification;

        function Notification(element, props, childs) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-notification']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-notification'], props, childs));
            }
        }

        Notification.create = function (element, props, childs) {
            return new Notification(element, props, childs);
        };

        return Notification;
    };

    getTopUI().Widget.Notification = NotificationCreator(getTopUI());
    getTop().Widget.Notification = NotificationCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopPageUI = function (_TopLayoutBehavior) {
    _inherits(TopPageUI, _TopLayoutBehavior);

    function TopPageUI(props) {
        _classCallCheck(this, TopPageUI);

        var _this2 = _possibleConstructorReturn(this, (TopPageUI.__proto__ || Object.getPrototypeOf(TopPageUI)).call(this, props));

        _this2.__updateActivated();
        return _this2;
    }

    _createClass(TopPageUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__layoutAttached',
        value: function __layoutAttached() {
            if (this.state.activated) this.__initSrc();
        }
    }, {
        key: '__initSrc',
        value: function __initSrc() {
            if (typeof this.state.src === 'string') {
                var _this = this;
                this.state.src = this._top.Util.__getRawValue(this.state.src);
                this._top.Ajax.execute(this.state.src, {
                    success: function success(data) {
                        var navData = window.performance.getEntriesByType("navigation");
                        if (navData.length > 0 && navData[0].loadEventEnd > 0) {
                            _this.__onSuccessSrcLoad(data);
                        } else {
                            $(window).bind('load', function () {
                                _this.__onSuccessSrcLoad(data);
                            });
                        }
                    },
                    complete: function complete() {
                        if (_this.__redrawChild !== undefined) {
                            for (var i = 0; i < _this.__redrawChild.length; i++) {
                                _this.__redrawChild[i]();
                            }
                        }
                    }
                });
            }
        }
    }, {
        key: '__updateActivated',
        value: function __updateActivated() {
            if (this.state.activated) {
                this.setTopTagStyle('display', 'block');
            } else {
                this.setTopTagStyle('display', 'none');
            }
        }
    }, {
        key: '__updateLoaded',
        value: function __updateLoaded() {
            if (this.state.loaded) this.__initSrc();
        }
    }, {
        key: '__render',
        value: function __render() {
            var _this3 = this;

            console.debug('render', this.props.id);
            var children = React.Children.map(this.state.children, function (child, index) {
                return React.cloneElement(child, {
                    index: index,
                    layoutParent: _this3,
                    layoutFunction: function layoutFunction() {}
                });
            });
            return React.createElement(
                'top-page',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                children
            );
        }
    }]);

    return TopPageUI;
}(TopLayoutBehavior);

var TopPage = function (_TopPageUI) {
    _inherits(TopPage, _TopPageUI);

    function TopPage() {
        _classCallCheck(this, TopPage);

        return _possibleConstructorReturn(this, (TopPage.__proto__ || Object.getPrototypeOf(TopPage)).apply(this, arguments));
    }

    return TopPage;
}(TopPageUI);

TopPageUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {
    src: {
        type: String
    },
    activated: {
        type: Boolean,
        default: false,
        options: [true, false]
    },
    loaded: {
        type: Boolean,
        default: false,
        options: [true, false]
    }
});

TopPageUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-page'
});

TopPage.propConfigs = Object.assign({}, TopPageUI.propConfigs, {});

TopPage.defaultProps = Object.assign({}, TopPageUI.defaultProps, {});

(function () {

    var PageCreator = function PageCreator(topInstance) {
        Page.prototype = Object.create(topInstance.Widget.Layout.prototype);
        Page.prototype.constructor = Page;

        function Page(element, props, childs) {
            topInstance.Widget.Layout.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-page']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-page'], props, childs));
            }
        }

        Page.create = function (element, props, childs) {
            return new Page(element, props, childs);
        };

        return Page;
    };

    getTop().Widget.Layout.Page = PageCreator(getTop());
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopPaginationUI = function (_TopEventBehavior) {
    _inherits(TopPaginationUI, _TopEventBehavior);

    function TopPaginationUI(props) {
        _classCallCheck(this, TopPaginationUI);

        var _this = _possibleConstructorReturn(this, (TopPaginationUI.__proto__ || Object.getPrototypeOf(TopPaginationUI)).call(this, props));

        _this.setControlBtn = function (element) {
            _this.controlBtn = _this.controlBtn || [];
            _this.controlBtn.push(element);
        };

        _this.setInputField = function (element) {
            _this.inputField = element;
        };
        return _this;
    }

    _createClass(TopPaginationUI, [{
        key: "__componentDidMount",
        value: function __componentDidMount() {
            if (this.state.type !== 'input') {
                $(this.dom.root).bootpag({
                    total: this.state.total,
                    page: this.state.page,
                    maxVisible: this.state.maxVisible,
                    firstLastUse: true,
                    first: " ",
                    last: " ",
                    next: " ",
                    prev: " ",
                    leaps: false
                });
            }
        }
    }, {
        key: "__componentDidUpdate",
        value: function __componentDidUpdate() {
            if (this.state.type !== 'input') {
                $(this.dom.root).bootpag({
                    total: this.state.total,
                    page: this.state.page,
                    maxVisible: this.state.maxVisible,
                    firstLastUse: true,
                    first: " ",
                    last: " ",
                    next: " ",
                    prev: " ",
                    leaps: false
                });
            }
        }
    }, {
        key: "__componentWillUpdate",
        value: function __componentWillUpdate() {
            $(this.dom.root).empty();
        }
    }, {
        key: "__componentWillUnmount",
        value: function __componentWillUnmount() {}
    }, {
        key: "__handleChange",
        value: function __handleChange(e) {
            this.setState({
                page: this._top.Util.__getPropConfigs(this).page.type(e.target.value)
            });
        }
    }, {
        key: "href",
        value: function href(c) {
            return this.state.hrefSrc.replace(this.state.hrefVariable, c);
        }
    }, {
        key: "__render",
        value: function __render() {
            var _this2 = this;

            var lp = this.state.total > this.state.maxVisible ? Math.min(this.state.maxVisible + 1, this.state.total) : 2;

            return React.createElement(
                "top-pagination",
                { type: this.state.type, id: this.state.id, ref: this.setTopRef, "class": this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    "div",
                    { id: this.state.id, ref: this.setRootRef, className: "top-pagination-root", disabled: this.__calculateDerivedDisabled(), style: this.topStyle },
                    this.state.type === 'input' && React.createElement(
                        "ul",
                        { className: "top-pagination-container" },
                        React.createElement(
                            "li",
                            { "data-lp": "1", className: "first", ref: this.setControlBtn },
                            React.createElement("a", { className: "cell_link", href: this.href(1) })
                        ),
                        React.createElement(
                            "li",
                            { "data-lp": "1", className: "prev", ref: this.setControlBtn },
                            React.createElement("a", { className: "cell_link", href: this.href(1) })
                        ),
                        React.createElement(
                            "li",
                            { className: "cell" },
                            React.createElement(
                                "a",
                                { className: "cell_link" },
                                React.createElement("input", { className: "cell_input", type: "number", min: "1", max: this.state.total, value: this.state.page, onChange: function onChange(e) {
                                        _this2.__handleChange(e);
                                    }, ref: this.setInputField }),
                                "\xA0of ",
                                this.state.total
                            )
                        ),
                        React.createElement(
                            "li",
                            { "data-lp": lp, className: "next", ref: this.setControlBtn },
                            React.createElement("a", { className: "cell_link", href: this.href(lp) })
                        ),
                        React.createElement(
                            "li",
                            { "data-lp": this.state.total, className: "last", ref: this.setControlBtn },
                            React.createElement("a", { className: "cell_link", href: this.href(this.state.total) })
                        )
                    )
                )
            );
        }
    }]);

    return TopPaginationUI;
}(TopEventBehavior);

var TopPagination = function (_TopPaginationUI) {
    _inherits(TopPagination, _TopPaginationUI);

    function TopPagination(props) {
        _classCallCheck(this, TopPagination);

        var _this3 = _possibleConstructorReturn(this, (TopPagination.__proto__ || Object.getPrototypeOf(TopPagination)).call(this, props));

        _this3.callbackFunc = function (e) {};

        return _this3;
    }

    _createClass(TopPagination, [{
        key: "__componentDidMount",
        value: function __componentDidMount() {
            _get(TopPagination.prototype.__proto__ || Object.getPrototypeOf(TopPagination.prototype), "__componentDidMount", this).call(this);
            this.__bindEvent();
        }
    }, {
        key: "__bindEvent",
        value: function __bindEvent() {
            var controlBtns = this.controlBtn;
            var inputField = this.inputField;
            if (controlBtns) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = controlBtns[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var controlBtn = _step.value;

                        this._top.EventManager.on("touch", controlBtn, this.callbackFunc);
                        this._top.EventManager.on("click", controlBtn, this.callbackFunc2.bind(this));

                        this._top.EventManager.on("touch", controlBtn, function (e) {});

                        this._top.EventManager.on("touch", controlBtn, function () {}.bind(this));
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }

            if (inputField) {
                this._top.EventManager.on("keydown", this.dom.top, function (e) {});
            }
        }
    }, {
        key: "__handleChange",
        value: function __handleChange(e) {
            var input = e.target.value;
            if (input != "") {
                input = ~~input;
                input = input >= this.state.total ? this.state.total : input;
                input = input <= 1 ? 1 : input;
            }

            this.setState(function (state) {
                return { page: input };
            });

            this._top.Util.namespace(this.props.onPagechange)(event, { page: input });
        }
    }, {
        key: "callbackFunc2",
        value: function callbackFunc2(e) {
            if (e.target.className == "next") {
                this.setState(function (state) {
                    return state.page == state.total ? state.total : { page: state.page + 1 };
                });
            } else if (e.target.className == "prev") {
                this.setState(function (state) {
                    return state.page == 1 ? 1 : { page: state.page - 1 };
                });
            } else if (e.target.className == "last") {
                this.setState(function (state) {
                    return { page: state.total };
                });
            } else if (e.target.className == "first") {
                this.setState(function (state) {
                    return { page: 1 };
                });
            }
            this._top.Util.namespace(this.props.onClick)(event, this.state);
        }
    }]);

    return TopPagination;
}(TopPaginationUI);

TopPaginationUI.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {
    total: {
        type: Number,
        default: 1
    },

    page: {
        type: Number
    },

    type: {
        type: String,
        default: 'basic',
        options: ['basic', 'big', 'input', 'button']
    },

    maxVisible: {
        type: Number
    },

    onPagechange: {
        type: Function
    },
    hrefSrc: {
        type: String,
        default: 'javascript:void(0);'
    },
    hrefVariable: {
        type: String,
        default: '{{number}}'
    },
    eventPageSelected: {
        type: Function
    }
});

TopPaginationUI.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {
    tagName: 'top-pagination'
});

TopPagination.propConfigs = Object.assign({}, TopPaginationUI.propConfigs, {});
TopPagination.defaultProps = Object.assign({}, TopPaginationUI.defaultProps, {});

(function () {

    var PaginationCreator = function PaginationCreator(topInstance) {
        Pagination.prototype = Object.create(topInstance.Widget.prototype);
        Pagination.prototype.constructor = Pagination;

        function Pagination(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-pagination']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-pagination'], props));
            }
        }

        Pagination.create = function (element, props) {
            return new Pagination(element, props);
        };

        return Pagination;
    };

    getTopUI().Widget.Pagination = PaginationCreator(getTopUI());
    getTop().Widget.Pagination = PaginationCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopPanelUI = function (_TopLayoutBehavior) {
    _inherits(TopPanelUI, _TopLayoutBehavior);

    function TopPanelUI(props) {
        _classCallCheck(this, TopPanelUI);

        return _possibleConstructorReturn(this, (TopPanelUI.__proto__ || Object.getPrototypeOf(TopPanelUI)).call(this, props));
    }

    _createClass(TopPanelUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'renderLayout',
        value: function renderLayout() {}
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;

            _get(TopPanelUI.prototype.__proto__ || Object.getPrototypeOf(TopPanelUI.prototype), '__initDomRef', this).call(this);
            this.dom.titleLayout = null;
            this.dom.title = null;
            this.dom.content = null;
            this.setTitleLayoutRef = function (element) {
                _this2.dom.titleLayout = element;
            };
            this.setTitleRef = function (element) {
                _this2.dom.title = element;
            };
            this.setContentRef = function (element) {
                _this2.dom.content = element;
            };
        }
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this3 = this;

            if (children) {
                children = React.Children.map(children, function (child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this3,
                        layoutFunction: function layoutFunction() {}
                    });
                });
            }
            return children;
        }
    }, {
        key: 'setTitle',
        value: function setTitle() {
            var setTitle = React.createElement(
                'span',
                { ref: this.setTitleRef, className: 'top-panel-title' },
                this.state.title
            );
            return setTitle;
        }
    }, {
        key: '__render',
        value: function __render() {
            var contentStyle = {
                paddingTop: this.state.padding.paddingTop,
                paddingBottom: this.state.padding.paddingBottom,
                paddingLeft: this.state.padding.paddingLeft,
                paddingRight: this.state.padding.paddingRight,
                height: 'calc(100% - 28px)'
            };

            return React.createElement(
                'top-panel',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-panel-root', style: this.topStyle },
                    React.createElement(
                        'div',
                        { ref: this.setTitleLayoutRef, className: 'top-panel-title-layout' },
                        this.setTitle()
                    ),
                    React.createElement(
                        'div',
                        { ref: this.setContentRef, className: 'top-panel-content', style: contentStyle },
                        this.__setWrapperStyle(this.state.children)
                    )
                )
            );
        }
    }]);

    return TopPanelUI;
}(TopLayoutBehavior);

var TopPanel = function (_TopPanelUI) {
    _inherits(TopPanel, _TopPanelUI);

    function TopPanel(props) {
        _classCallCheck(this, TopPanel);

        return _possibleConstructorReturn(this, (TopPanel.__proto__ || Object.getPrototypeOf(TopPanel)).call(this, props));
    }

    return TopPanel;
}(TopPanelUI);

TopPanelUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {
    title: {
        type: String
    },

    titleHtml: {
        type: String
    }

});

TopPanelUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-panel'
});
TopPanel.propConfigs = Object.assign({}, TopPanelUI.propConfigs, {});
TopPanel.defaultProps = Object.assign({}, TopPanelUI.defaultProps, {});

(function () {

    var PanelCreator = function PanelCreator(topInstance) {
        Panel.prototype = Object.create(topInstance.Widget.Layout.prototype);
        Panel.prototype.constructor = Panel;

        function Panel(element, props, childs) {
            topInstance.Widget.Layout.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-panel']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-panel'], props, childs));
            }
        }

        Panel.create = function (element, props, childs) {
            return new Panel(element, props, childs);
        };

        return Panel;
    };

    getTopUI().Widget.Layout.Panel = PanelCreator(getTopUI());
    getTop().Widget.Layout.Panel = PanelCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopPopoverUI = function (_TopLayoutBehavior) {
    _inherits(TopPopoverUI, _TopLayoutBehavior);

    function TopPopoverUI(props) {
        _classCallCheck(this, TopPopoverUI);

        return _possibleConstructorReturn(this, (TopPopoverUI.__proto__ || Object.getPrototypeOf(TopPopoverUI)).call(this, props));
    }

    _createClass(TopPopoverUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__renderPopover',
        value: function __renderPopover() {
            return React.createElement(WidgetNameBlock, { widgetName: 'Popover' });
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-popover',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-popover-root', style: this.topStyle },
                    this.__renderPopover()
                )
            );
        }
    }]);

    return TopPopoverUI;
}(TopLayoutBehavior);

var TopPopover = function (_TopPopoverUI) {
    _inherits(TopPopover, _TopPopoverUI);

    function TopPopover() {
        _classCallCheck(this, TopPopover);

        return _possibleConstructorReturn(this, (TopPopover.__proto__ || Object.getPrototypeOf(TopPopover)).apply(this, arguments));
    }

    return TopPopover;
}(TopPopoverUI);

TopPopoverUI.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {
    title: {
        type: String
    },

    content: {
        type: String
    },

    placement: {
        type: String,
        options: ['top', 'right', 'bottom', 'left'],
        default: 'bottom'
    },

    delay: {
        type: Number,
        default: 0
    },

    trigger: {
        type: String,
        options: ['click', 'hover']
    }
});

TopPopoverUI.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {
    tagName: 'top-popover'
});

TopPopover.propConfigs = Object.assign({}, TopPopoverUI.propConfigs, {});

TopPopover.defaultProps = Object.assign({}, TopPopoverUI.defaultProps, {});

(function () {

    var PopoverCreator = function PopoverCreator(topInstance) {
        Popover.prototype = Object.create(topInstance.Widget.prototype);
        Popover.prototype.constructor = Popover;

        function Popover(element, props, childs) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-popover']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-popover'], props, childs));
            }
        }

        Popover.create = function (element, props, childs) {
            return new Popover(element, props, childs);
        };

        return Popover;
    };

    getTopUI().Widget.Popover = PopoverCreator(getTopUI());
    getTop().Widget.Popover = PopoverCreator(getTop());
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _toConsumableArray = function(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopProgressbarUI = function (_TopEventBehavior) {
	_inherits(TopProgressbarUI, _TopEventBehavior);

	function TopProgressbarUI(props) {
		_classCallCheck(this, TopProgressbarUI);

		var _this = _possibleConstructorReturn(this, (TopProgressbarUI.__proto__ || Object.getPrototypeOf(TopProgressbarUI)).call(this, props));

		_this.progressColorList = [];
		_this.state.internalProgress = undefined;
		return _this;
	}

	_createClass(TopProgressbarUI, [{
		key: '__componentDidMount',
		value: function __componentDidMount() {}
	}, {
		key: '__componentDidUpdate',
		value: function __componentDidUpdate() {}
	}, {
		key: '__componentWillUpdate',
		value: function __componentWillUpdate() {}
	}, {
		key: '__componentWillUnmount',
		value: function __componentWillUnmount() {}
	}, {
		key: '__updateProgressColor',
		value: function __updateProgressColor() {
			var color = this.state.progressColor;
			var list = this.progressColorList;

			if (!color) return;

			if (!list.includes(color)) {
				var styles = 'background-color:' + color + ';',
				    s = 'top-progressbar#' + this.state.id + ' ',
				    sheet = document.styleSheets[0];

				if (this.state.type === 'normal') {
					if (this._top.Util.Browser.isChrome()) {
						s += '.top-progressbar-progress::-webkit-progress-value';
					} else if (this._top.Util.Browser.isIE()) {
						s += '.top-progressbar-progress::-ms-fill';
					}
				} else {
					s += '.top-progressbar-progress.fill';
				}

				if (!this.rule && this.rule !== 0 || !sheet.cssRules.length) {
					if (sheet.insertRule) {
						this.rule = sheet.insertRule(s + '{' + styles + '}', 0);
					} else if (sheet.addRule) {
						this.rule = sheet.addRule(s, styles);
					}
				} else {
					sheet.rules[this.rule].style.backgroundColor = color;
				}
				list.push(color);
			}
		}
	}, {
		key: '__renderProgress',
		value: function __renderProgress() {
			var type = this.state.type;
			this.state.internalProgress = typeof this.state.internalProgress === 'number' ? this.state.internalProgress : this.state.progress;

			if (type === 'normal') {
				if (this.state.indeterminate) {
					return React.createElement('progress', { className: 'top-progressbar-progress' });
				} else {
					return React.createElement('progress', { className: 'top-progressbar-progress', value: this.state.internalProgress });
				}
			} else {
				var discreteValue = Math.round(this.state.internalProgress * 10);

				return [].concat(_toConsumableArray(Array(10))).map(function (item, i) {
					var isFill = i < discreteValue ? 'fill' : '',
					    barClass = classNames('top-progressbar-progress', 'bar_' + i, isFill);

					return React.createElement('div', { className: barClass, key: 'bar_' + i });
				});
			}
		}
	}, {
		key: '__render',
		value: function __render() {
			var rootClass = classNames('top-progressbar-root', { discrete: this.state.type === 'discrete' });

			this.__updateProgressColor();

			return React.createElement(
				'top-progressbar',
				{
					id: this.state.id,
					ref: this.setTopRef,
					'class': this.makeTopTagClassString(),
					style: this.topTagStyle },
				React.createElement(
					'div',
					{
						id: this.state.id,
						ref: this.setRootRef,
						className: rootClass,
						disabled: this.__calculateDerivedDisabled(),
						style: this.topStyle },
					this.__renderProgress()
				)
			);
		}
	}]);

	return TopProgressbarUI;
}(TopEventBehavior);

var TopProgressbar = function (_TopProgressbarUI) {
	_inherits(TopProgressbar, _TopProgressbarUI);

	function TopProgressbar(props) {
		_classCallCheck(this, TopProgressbar);

		var _this2 = _possibleConstructorReturn(this, (TopProgressbar.__proto__ || Object.getPrototypeOf(TopProgressbar)).call(this, props));

		_this2.rootLeft = undefined;
		_this2.rootWidth = undefined;
		return _this2;
	}

	_createClass(TopProgressbar, [{
		key: '__componentDidMount',
		value: function __componentDidMount() {
			if (this.state.type === 'discrete') this.__bindEvent();
		}
	}, {
		key: '__componentDidUpdate',
		value: function __componentDidUpdate() {}
	}, {
		key: '__bindEvent',
		value: function __bindEvent() {
			var _this3 = this;

			var blocks = 10,
			    root = this.dom.root;

			this._top.EventManager.on('mousedown', root, function (e) {
				if (_this3.rootLeft === undefined) {
					var fillIdx = parseInt(e.toElement.className.match(/[0-9]/gi)[0]);

					_this3.rootWidth = e.target.offsetWidth;
					_this3.rootLeft = e.pageX - fillIdx * _this3.rootWidth / blocks - e.offsetX;

					_this3._top.EventManager.on('mousemove', document, _this3.__dragProgress);
					_this3.__dragProgress(e);
				}
			});

			this._top.EventManager.on('mouseup', document, function () {
				if (_this3.rootLeft !== undefined) {
					_this3._top.EventManager.off('mousemove', document);
					_this3.rootWidth = undefined;
					_this3.rootLeft = undefined;
				}
			});

			if (this.__dragProgress === undefined) {
				this.__dragProgress = function (e) {
					var rootLeft = _this3.rootLeft,
					    mouseX = e.pageX - rootLeft + 1,
					    rootWidth = _this3.rootWidth,
					    barWidth = rootWidth / blocks;

					if (mouseX < 0) {
						mouseX = 0;
					} else if (mouseX > rootLeft + rootWidth) {
						mouseX = rootWidth;
					}

					var progress = Math.ceil(mouseX / barWidth) / blocks;

					if (_this3.state.internalProgress !== progress) {
						_this3.setState({
							internalProgress: progress
						});
					}
				};
			}
		}
	}, {
		key: '__render',
		value: function __render() {
			return _get(TopProgressbar.prototype.__proto__ || Object.getPrototypeOf(TopProgressbar.prototype), '__render', this).call(this);
		}
	}]);

	return TopProgressbar;
}(TopProgressbarUI);

TopProgressbarUI.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {
	indeterminate: {
		type: Boolean,
		default: false,
		options: [true, false]
	},

	progress: {
		type: Number,
		default: 0.5,
		convert: function convert(value) {
			if (value > 1) value = 1;else if (value < 0) value = 0;
			return value;
		}
	},

	progressColor: {
		type: String
	},

	type: {
		type: String,
		options: ['discrete', 'normal'],
		default: 'normal'
	}
});

TopProgressbarUI.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {
	tagName: 'top-progressbar'
});

TopProgressbar.propConfigs = Object.assign({}, TopProgressbarUI.propConfigs, {});

TopProgressbar.defaultProps = Object.assign({}, TopProgressbarUI.defaultProps, {});

(function () {
	var ProgressbarCreator = function ProgressbarCreator(topInstance) {
		Progressbar.prototype = Object.create(topInstance.Widget.prototype);
		Progressbar.prototype.constructor = Progressbar;

		function Progressbar(element, props) {
			topInstance.Widget.apply(this, arguments);
			if (element instanceof topInstance.Render.topWidgets['top-progressbar']) {
				this.setTemplate(element);
			} else {
				this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-progressbar'], props));
			}
		}

		Progressbar.create = function (element, props) {
			return new Progressbar(element, props);
		};

		Progressbar.prototype.getProgress = function () {
			return this.getTemplate().state.progress;
		};

		Progressbar.prototype.saveProgress = function () {
			this.getTemplate().state.progress = this.getTemplate().state.internalProgress;
		};

		Progressbar.prototype.setProgress = function (progress) {
			this.getTemplate().setState({
				internalProgress: undefined,
				progress: progress
			});
		};

		return Progressbar;
	};

	getTopUI().Widget.Progressbar = ProgressbarCreator(getTopUI());
	getTop().Widget.Progressbar = ProgressbarCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopRadiobuttonUI = function (_TopCheckBehavior) {
    _inherits(TopRadiobuttonUI, _TopCheckBehavior);

    function TopRadiobuttonUI(props) {
        _classCallCheck(this, TopRadiobuttonUI);

        var _this = _possibleConstructorReturn(this, (TopRadiobuttonUI.__proto__ || Object.getPrototypeOf(TopRadiobuttonUI)).call(this, props));

        _this.__updateGroupId();
        return _this;
    }

    _createClass(TopRadiobuttonUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'getElement',
        value: function getElement() {
            return this.dom.check;
        }
    }, {
        key: 'getElementForSize',
        value: function getElementForSize() {
            return this.dom.text;
        }
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;

            _get(TopRadiobuttonUI.prototype.__proto__ || Object.getPrototypeOf(TopRadiobuttonUI.prototype), '__initDomRef', this).call(this);
            this.dom.check = null;
            this.dom.text = null;
            this.setCheckRef = function (element) {
                _this2.dom.check = element;
            };
            this.setTextRef = function (element) {
                _this2.dom.text = element;
            };
        }
    }, {
        key: '__updateGroupId',
        value: function __updateGroupId() {
            if (this.bfgroupId) {
                if (this._top.Widget.RadioGroup[this.bfgroupId] && this._top.Widget.RadioGroup[this.bfgroupId].indexOf(this) >= 0) {
                    this._top.Widget.RadioGroup[this.bfgroupId].splice(this._top.Widget.RadioGroup[this.bfgroupId].indexOf(this), 1);
                }
            }
            if (this.state.groupId) {
                if (this._top.Widget.RadioGroup[this.state.groupId] === undefined) this._top.Widget.RadioGroup[this.state.groupId] = [];
                this._top.Widget.RadioGroup[this.state.groupId].push(this);
                this.bfgroupId = this.state.groupId;
            }
        }
    }, {
        key: '__unCheckRadioGroup',
        value: function __unCheckRadioGroup() {
            var _this3 = this;

            if (this.state.groupId) {
                if (this._top.Widget.RadioGroup[this.state.groupId]) this._top.Widget.RadioGroup[this.state.groupId].forEach(function (r) {
                    if (r !== _this3) {
                        if (r.state.checked === r.state.falseValue) return;
                        r.__updatePropertiesImpl({ 'checked': r.state.falseValue });
                    }
                });
            }
        }
    }, {
        key: '__updateChecked',
        value: function __updateChecked() {
            _get(TopRadiobuttonUI.prototype.__proto__ || Object.getPrototypeOf(TopRadiobuttonUI.prototype), '__updateChecked', this).call(this);
            if (this.__isCheckedTrue()) {
                this.__unCheckRadioGroup();
            }
        }
    }, {
        key: '__getCheckedButton',
        value: function __getCheckedButton() {
            var checkedButton = null;
            if (this.state.groupId) {
                if (this._top.Widget.RadioGroup[this.state.groupId]) this._top.Widget.RadioGroup[this.state.groupId].forEach(function (r) {
                    if (r.__isCheckedTrue()) {
                        checkedButton = r.getTopElement().topWidget;
                        return;
                    }
                });
            }
            return checkedButton;
        }
    }, {
        key: '__render',
        value: function __render() {
            var topDisabled = this.__calculateDerivedDisabled();
            var topLabelClass = 'top-radiobutton-text ' + this.state.checkPosition + ' ' + (topDisabled ? 'disabled ' : '');

            if (this.state.checked) {
                topLabelClass += 'checked';
            }

            return React.createElement(
                'top-radiobutton',
                {
                    id: this.state.id,
                    ref: this.setTopRef,
                    'class': this.makeTopTagClassString(),
                    disabled: topDisabled,
                    style: this.topTagStyle },
                React.createElement('input', {
                    className: 'top-radiobutton-check',
                    ref: this.setCheckRef,
                    type: 'radio',
                    name: this.state.groupId,
                    checked: this.state.checked,
                    disabled: topDisabled,
                    onChange: function onChange(e) {
                        e.preventDefault();
                    } }),
                React.createElement(
                    'label',
                    {
                        className: topLabelClass,
                        ref: this.setTextRef,
                        disabled: topDisabled,
                        style: this.topStyle },
                    this.state.checkPosition === 'left' && React.createElement('i', { className: 'top-radiobutton-icon' }),
                    React.createElement(
                        'span',
                        { style: this.topTextStyle },
                        this.state.text
                    ),
                    this.state.checkPosition === 'right' && React.createElement('i', { className: 'top-radiobutton-icon' })
                )
            );
        }
    }]);

    return TopRadiobuttonUI;
}(TopCheckBehavior);

var TopRadiobutton = function (_TopRadiobuttonUI) {
    _inherits(TopRadiobutton, _TopRadiobuttonUI);

    function TopRadiobutton() {
        _classCallCheck(this, TopRadiobutton);

        return _possibleConstructorReturn(this, (TopRadiobutton.__proto__ || Object.getPrototypeOf(TopRadiobutton)).apply(this, arguments));
    }

    _createClass(TopRadiobutton, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopRadiobutton.prototype.__proto__ || Object.getPrototypeOf(TopRadiobutton.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent();
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            var _this5 = this;

            this._top.EventManager.on('click', this.dom.text, function (event) {
                if (!_this5.__isCheckedTrue()) {
                    _this5.setState({ 'checked': _this5.state.trueValue });
                    _this5.__updateChecked();
                }
            });
        }
    }]);

    return TopRadiobutton;
}(TopRadiobuttonUI);

TopRadiobuttonUI.propConfigs = Object.assign({}, TopCheckBehavior.propConfigs, {});

TopRadiobuttonUI.defaultProps = Object.assign({}, TopCheckBehavior.defaultProps, {
    tagName: 'top-radiobutton'
});

TopRadiobutton.propConfigs = Object.assign({}, TopRadiobuttonUI.propConfigs, {});

TopRadiobutton.defaultProps = Object.assign({}, TopRadiobuttonUI.defaultProps, {});

(function () {

    var RadiobuttonCreator = function RadiobuttonCreator(topInstance) {
        Radiobutton.prototype = Object.create(topInstance.Widget.prototype);
        Radiobutton.prototype.constructor = Radiobutton;

        function Radiobutton(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-radiobutton']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-radiobutton'], props));
            }
        }

        Radiobutton.create = function (element, props) {
            return new Radiobutton(element, props);
        };

        Radiobutton.prototype.isChecked = function () {
            return this.getTemplate().__isCheckedTrue();
        };

        Radiobutton.prototype.getCheckedButton = function () {
            return this.getTemplate().__getCheckedButton();
        };

        return Radiobutton;
    };

    getTopUI().Widget.Radiobutton = RadiobuttonCreator(getTopUI());
    getTop().Widget.Radiobutton = RadiobuttonCreator(getTop());
    getTopUI().Widget.RadioGroup = {};
    getTop().Widget.RadioGroup = {};
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopSelectboxUI = function (_TopContainerBehavior) {
    _inherits(TopSelectboxUI, _TopContainerBehavior);

    function TopSelectboxUI(props) {
        _classCallCheck(this, TopSelectboxUI);

        var _this2 = _possibleConstructorReturn(this, (TopSelectboxUI.__proto__ || Object.getPrototypeOf(TopSelectboxUI)).call(this, props));

        _this2.state.checkedIndex = {};
        _this2.state.selectedNodes = [];
        _this2.optionWidth = '';
        _this2.optionTop = '';
        return _this2;
    }

    _createClass(TopSelectboxUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'getPaddingStyleObjectKey',
        value: function getPaddingStyleObjectKey() {
            return 'spanTagStyle';
        }
    }, {
        key: '__renderNodes',
        value: function __renderNodes() {
            var _this3 = this;

            if (this.state.nodes && _typeof(this.state.nodes[0]) === 'object') {
                this.isObjNodes = true;
            }
            var nodes = this.state.nodes;
            if (!nodes) return;
            this.dom.li = [];
            return nodes.map(function (node, index, array) {
                var nodeText = _this3.isObjNodes ? node.text : node;
                if (_this3.selectedText === nodeText) {
                    _this3.selectedIndex = index;
                }
                var topOptionClass = 'top-selectbox-option ' + 'option_' + index;
                var liKey = 'option_' + nodeText;
                return React.createElement(
                    'li',
                    { className: topOptionClass, key: liKey, ref: function ref(_ref) {
                            return _this3.dom.li.push(_ref);
                        } },
                    _this3.state.multiSelect ? _this3.__renderCheckbox(nodeText) : nodeText
                );
            });
        }
    }, {
        key: '__renderCheckbox',
        value: function __renderCheckbox(node) {
            return React.createElement(
                'label',
                { className: 'top-selectbox-label' },
                React.createElement('i', { className: 'top-selectbox-label-icon' }),
                React.createElement(
                    'span',
                    { style: this.topTextStyle },
                    node
                )
            );
        }
    }, {
        key: '__render',
        value: function __render() {
            var _this4 = this;

            var spanClass = classNames({
                'top-selectbox-container': true,
                'top-selectbox_collapsed': !this.state.isOpened,
                'top-selectbox_open': this.state.isOpened,
                'active': this.state.isOpened
            });
            var iconClass = classNames({
                'top-selectbox-icon': true,
                'icon-arrow_filled_down': !this.state.isOpened,
                'icon-arrow_filled_up': this.state.isOpened
            });

            this.selectedText = this.state.title;
            var display = this.state.isOpened ? 'block' : 'none';

            var optionsStyle = {
                display: display,
                top: this.optionTop,
                width: this.optionWidth
            };
            return React.createElement(
                'top-selectbox',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-selectbox-root', disabled: this.__calculateDerivedDisabled(), style: this.topStyle },
                    React.createElement(
                        'ul',
                        { className: 'top-selectbox-options', style: optionsStyle, ref: function ref(_ref2) {
                                return _this4.dom.options = _ref2;
                            } },
                        React.createElement(
                            'li',
                            { className: 'top-selectbox-option title' },
                            this.state.title
                        ),
                        this.__renderNodes()
                    ),
                    React.createElement(
                        'span',
                        { className: spanClass, ref: function ref(_ref4) {
                                return _this4.dom.span = _ref4;
                            }, style: this.spanTagStyle },
                        React.createElement('i', { className: iconClass, ref: function ref(_ref3) {
                                return _this4.dom.iconArrow = _ref3;
                            } }),
                        this.selectedText
                    )
                )
            );
        }
    }]);

    return TopSelectboxUI;
}(TopContainerBehavior);

var TopSelectbox = function (_TopSelectboxUI) {
    _inherits(TopSelectbox, _TopSelectboxUI);

    function TopSelectbox(props) {
        _classCallCheck(this, TopSelectbox);

        var _this5 = _possibleConstructorReturn(this, (TopSelectbox.__proto__ || Object.getPrototypeOf(TopSelectbox)).call(this, props));

        _this5.handlerForLiClick = function (target) {
            if (target.className.includes('title')) return;
            var index = target.className.split('option_')[1].split('checked')[0] * 1;
            var selectedNode = _this5.state.nodes[index];
            _this5.clickedIndex = index;

            if (!_this5.state.multiSelect) {
                _this5.selectedText = target.innerText;
                _this5.setState({
                    title: _this5.selectedText,
                    selectedNodes: selectedNode
                });
                _this5.close();
            } else {
                if (target.className.includes('checked')) {
                    target.classList.remove('checked');
                    _this5.state.checkedIndex[index] = false;
                } else {
                    target.classList.add('checked');
                    _this5.state.checkedIndex[index] = true;
                }
                var selectedNodes = [];
                var selectedNodeTexts = [];
                for (var key in _this5.state.checkedIndex) {
                    if (_this5.state.checkedIndex[key] === true) {
                        var selectedNodeText = _this5.isObjNodes ? _this5.state.nodes[key].text : _this5.state.nodes[key];
                        var selectedNode = _this5.state.nodes[key];
                        selectedNodes.push(selectedNode);
                        selectedNodeTexts.push(selectedNodeText);
                    }
                }
                var title = selectedNodeTexts.join();
                _this5.setState({
                    selectedNodes: selectedNodes,
                    title: title
                });
            }
            _this5.__dispatchEvent(new Event('change'));
        };

        _this5.handlerForContainerClick = function (target) {
            var options = _this5.dom.options;
            var root = _this5.dom.root;
            if (_this5.state.isOpened) {
                _this5.optionWidth = '';
                _this5.close();
            } else {
                _this5.optionWidth = root.offsetWidth - 2 + "px";
                _this5.open();
            }
        };

        return _this5;
    }

    _createClass(TopSelectbox, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopSelectbox.prototype.__proto__ || Object.getPrototypeOf(TopSelectbox.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent();
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            this._top.EventManager.on("click", this.dom.root, this.clickcallback.bind(this));
        }
    }, {
        key: '__initEventInternal',
        value: function __initEventInternal() {
            this.__addEventByAttr('change');
            this.__addEventByAttr('open');
            this.__addEventByAttr('close');
        }
    }, {
        key: 'clickcallback',
        value: function clickcallback(event) {
            var _this = this;
            var target = event.srcElement;
            var targetName = '';
            while (true) {
                var classList = this._top.Util.__classStringToClassList(target.className);
                if (target.tagName == undefined || target.tagName == null) {
                    return;
                }
                if (classList.includes('top-selectbox-container')) {
                    targetName = 'Container';
                    break;
                } else if (classList.includes('top-selectbox-option')) {
                    targetName = 'Li';
                    break;
                }
                target = target.parentNode;
            };

            if (target && targetName) {
                var eventHandlerName = 'handlerFor' + targetName + 'Click';
                this[eventHandlerName](target);
            }
        }
    }, {
        key: 'open',
        value: function open() {
            this.optionTop = this.dom.span.getBoundingClientRect().top + this.dom.span.getBoundingClientRect().height - 1 + "px";
            this.setState({
                isOpened: true
            });

            this.__dispatchEvent(new Event('open'));
        }
    }, {
        key: 'close',
        value: function close() {
            this.setState({
                isOpened: false
            });

            this.__dispatchEvent(new Event('close'));
        }
    }, {
        key: 'select',
        value: function select(value) {
            var _this6 = this;

            if (!this.state.nodes) return;
            var isNum = typeof value === "number";
            if (isNum && value < this.state.nodes.length) {
                var node = this.state.nodes[value];
                this.selectedText = this.isObjNodes ? node.text : node;
                this.setState({
                    title: this.selectedText,
                    selectedNodes: node
                });
            } else if (this.isObjNodes) {
                var nodes = this.state.nodes;
                nodes.map(function (node) {
                    if (node.value === value) {
                        _this6.selectedText = node.text;
                        _this6.setState({
                            title: _this6.selectedText,
                            selectedNodes: node
                        });
                    };
                });
            }
            this.__dispatchEvent(new Event('change'));
        }
    }]);

    return TopSelectbox;
}(TopSelectboxUI);

TopSelectboxUI.propConfigs = Object.assign({}, TopContainerBehavior.propConfigs, {
    title: {
        type: String
    },

    nodes: {
        type: Array
    },

    selectedIndex: {
        type: Number
    },

    selectedText: {
        type: String
    },

    value: {
        type: String
    },

    listMaxHeight: {
        type: String
    },

    autoScroll: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    listLocation: {
        type: String,
        options: ['bl', 'br', 'tl', 'tr'],
        default: 'bl'
    },

    searchable: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    multiSelect: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    focusTooltip: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    onChange: {
        type: Function
    }

});

TopSelectboxUI.defaultProps = Object.assign({}, TopContainerBehavior.defaultProps, {
    tagName: 'top-selectbox'
});

TopSelectbox.propConfigs = Object.assign({}, TopSelectboxUI.propConfigs, {});

TopSelectbox.defaultProps = Object.assign({}, TopSelectboxUI.defaultProps, {});
(function () {

    var SelectboxCreator = function SelectboxCreator(topInstance) {
        Selectbox.prototype = Object.create(topInstance.Widget.Container.prototype);
        Selectbox.prototype.constructor = Selectbox;

        function Selectbox(element, props) {
            topInstance.Widget.Container.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-selectbox']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-selectbox'], props));
            }
        }

        Selectbox.create = function (element, props) {
            return new Selectbox(element, props);
        };

        Selectbox.prototype.select = function (value) {
            this.getTemplate().select(value);
        };

        Selectbox.prototype.getSelected = function () {
            return this.getTemplate().state.selectedNodes;
        };

        Selectbox.prototype.getTitle = function () {
            return this.getTemplate().state.title;
        };

        Selectbox.prototype.close = function () {
            this.getTemplate().close();
        };

        Selectbox.prototype.open = function () {
            this.getTemplate().open();
        };

        Selectbox.prototype.getClickedIndex = function () {
            return this.getTemplate().clickedIndex;
        };
        return Selectbox;
    };

    getTopUI().Widget.Container.Selectbox = SelectboxCreator(getTopUI());
    getTop().Widget.Container.Selectbox = SelectboxCreator(getTop());
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopSliderUI = function (_TopEventBehavior) {
	_inherits(TopSliderUI, _TopEventBehavior);

	function TopSliderUI(props) {
		_classCallCheck(this, TopSliderUI);

		var _this2 = _possibleConstructorReturn(this, (TopSliderUI.__proto__ || Object.getPrototypeOf(TopSliderUI)).call(this, props));

		_this2.handlerNumber = undefined;
		_this2.isRendered = false;
		return _this2;
	}

	_createClass(TopSliderUI, [{
		key: '__componentDidMount',
		value: function __componentDidMount() {
			this.__initSlider();
		}
	}, {
		key: '__componentDidUpdate',
		value: function __componentDidUpdate() {}
	}, {
		key: '__componentWillUpdate',
		value: function __componentWillUpdate() {}
	}, {
		key: '__componentWillUnmount',
		value: function __componentWillUnmount() {}
	}, {
		key: '__updateNumber',
		value: function __updateNumber() {
			if (this.__checkHandlerChanged()) {
				this.__updateConnect();
				this.__destroyAndInit();
			} else if (this.isRendered) {
				this.slider.set(this.__convertNumber());
			}
		}
	}, {
		key: '__updateMin',
		value: function __updateMin() {
			this.slider.updateOptions({
				range: {
					min: this.state.min,
					max: this.state.max
				}
			});
		}
	}, {
		key: '__updateMax',
		value: function __updateMax() {
			this.slider.updateOptions({
				range: {
					min: this.state.min,
					max: this.state.max
				}
			});
		}
	}, {
		key: '__updateStep',
		value: function __updateStep() {
			this.slider.updateOptions({
				step: this.state.step
			});
		}
	}, {
		key: '__updateOrientation',
		value: function __updateOrientation() {
			this.__updateDirection();
		}
	}, {
		key: '__updateDirection',
		value: function __updateDirection() {
			this.__destroyAndInit();
		}
	}, {
		key: '__destroyAndInit',
		value: function __destroyAndInit() {
			if (this.isRendered) {
				this.slider.destroy();
				this.isRendered = false;
				this.__initSlider();
				if (this.__bindEvent) this.__bindEvent();
			}
		}
	}, {
		key: '__convertNumber',
		value: function __convertNumber() {
			var number = this.state.number;
			return number;
		}
	}, {
		key: '__updateConnect',
		value: function __updateConnect() {
			this.__destroyAndInit();
		}
	}, {
		key: '__convertConnect',
		value: function __convertConnect() {
			var numLength = this.__convertNumber().length;
			var connect = this.state.connect;

			if (numLength + 1 !== connect.length) {
				if (numLength < 2) connect = [true, false];else {
					connect = new Array(numLength + 1);
					connect.fill(true);
					connect[0] = false;
					connect[numLength] = false;
				}
			}

			return connect;
		}
	}, {
		key: '__checkHandlerChanged',
		value: function __checkHandlerChanged() {
			var number = this.__convertNumber(),
			    oldHandler = this.handlerNumber,
			    newHandler = number.length;

			if (oldHandler === newHandler) return false;else {
				this.handlerNumber = newHandler;
				return true;
			}
		}
	}, {
		key: '__convertDirection',
		value: function __convertDirection() {
			var direction = this.state.direction;
			if (direction === 'btt') direction = 'rtl';else if (direction === 'ttb') direction = 'ltr';

			return direction;
		}
	}, {
		key: '__initSlider',
		value: function __initSlider() {
			var connect = this.__convertConnect(),
			    direction = this.__convertDirection(),
			    number = this.__convertNumber();

			this.slider = noUiSlider.create(this.dom.root, {
				start: number,
				step: this.state.step,
				connect: connect,
				range: {
					min: this.state.min,
					max: this.state.max
				},
				orientation: this.state.orientation,
				direction: direction
			});
			this.__setHandleBarClassName();
			this.isRendered = true;
		}
	}, {
		key: '__setHandleBarClassName',
		value: function __setHandleBarClassName() {
			var handles = this.dom.root.querySelectorAll('.top-slider-origin'),
			    bars = this.dom.root.querySelectorAll('.top-slider-fill');

			handles.forEach(function (handle, i) {
				handle.classList.add('handle_' + i);
			});
			bars.forEach(function (bar, i) {
				bar.classList.add('bar_' + i);
			});
		}
	}, {
		key: '__render',
		value: function __render() {
			return React.createElement(
				'top-slider',
				{
					id: this.state.id,
					ref: this.setTopRef,
					orientation: this.state.orientation,
					'class': this.makeTopTagClassString(),
					style: this.topTagStyle },
				React.createElement('div', {
					id: this.state.id,
					ref: this.setRootRef,
					className: 'top-slider-root',
					disabled: this.__calculateDerivedDisabled(),
					style: this.topStyle })
			);
		}
	}]);

	return TopSliderUI;
}(TopEventBehavior);

var TopSlider = function (_TopSliderUI) {
	_inherits(TopSlider, _TopSliderUI);

	function TopSlider(props) {
		_classCallCheck(this, TopSlider);

		return _possibleConstructorReturn(this, (TopSlider.__proto__ || Object.getPrototypeOf(TopSlider)).call(this, props));
	}

	_createClass(TopSlider, [{
		key: '__bindEvent',
		value: function __bindEvent() {
			var _this = this,
			    fnHandlechange = this.state.onHandlechange,
			    fnHandleDragend = this.state.onHandledragend,
			    fnHandleDragstart = this.state.onHandledragstart,
			    shadowBase = this.dom.root.querySelector('.top-slider-base');

			this.slider.off();

			this.slider.on('update', function () {
				var values = this.get();

				if (typeof values === 'string') {
					values = [parseFloat(values)];
				} else if (values instanceof Array) {
					values = values.map(function (value) {
						return parseFloat(value);
					});
				}

				_this.state.number = values;
			});

			this.slider.on('slide', function (value) {

				if (typeof fnHandlechange === 'function') {
					fnHandlechange(event, _this._top.Dom.selectById(_this.id), value);
				}
			});

			this.slider.on('start', function (value) {
				shadowBase.classList.add('active');

				if (typeof fnHandleDragstart === 'function') {
					fnHandleDragstart(event, _this._top.Dom.selectById(_this.id), value);
				}
			});

			this.slider.on('end', function (value) {
				shadowBase.classList.remove('active');

				if (typeof fnHandleDragend === 'function') {
					fnHandleDragend(event, _this._top.Dom.selectById(_this.id), value);
				}
			});
		}
	}, {
		key: '__componentDidMount',
		value: function __componentDidMount() {
			_get(TopSlider.prototype.__proto__ || Object.getPrototypeOf(TopSlider.prototype), '__componentDidMount', this).call(this);
			this.__bindEvent();
		}
	}, {
		key: '__render',
		value: function __render() {
			return _get(TopSlider.prototype.__proto__ || Object.getPrototypeOf(TopSlider.prototype), '__render', this).call(this);
		}
	}]);

	return TopSlider;
}(TopSliderUI);

TopSliderUI.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {
	step: {
		type: Number,
		default: 1
	},

	min: {
		type: Number,
		default: 0
	},

	max: {
		type: Number,
		default: 100
	},

	number: {
		type: Array,
		default: [50],
		arrayOf: Number,
		convert: function convert(value) {
			return value.sort();
		}
	},

	connect: {
		type: Array,
		default: [true, false],
		arrayOf: Boolean
	},

	orientation: {
		type: String,
		default: 'horizontal',
		options: ['horizontal', 'vertical']
	},

	direction: {
		type: String,
		default: 'ltr',
		options: ['ltr', 'rtl', 'btt', 'ttb']
	},

	onHandlechange: {
		type: Function
	},

	onHandledragstart: {
		type: Function
	},

	onHandledragend: {
		type: Function
	}
});

TopSliderUI.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {
	tagName: 'top-slider'
});

TopSlider.propConfigs = Object.assign({}, TopSliderUI.propConfigs, {});

TopSlider.defaultProps = Object.assign({}, TopSliderUI.defaultProps, {});

(function () {
	var SliderCreator = function SliderCreator(topInstance) {
		Slider.prototype = Object.create(topInstance.Widget.prototype);
		Slider.prototype.constructor = Slider;

		function Slider(element, props) {
			topInstance.Widget.apply(this, arguments);
			if (element instanceof topInstance.Render.topWidgets['top-slider']) {
				this.setTemplate(element);
			} else {
				this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-slider'], props));
			}
		}

		Slider.create = function (element, props) {
			return new Slider(element, props);
		};

		return Slider;
	};

	getTopUI().Widget.Slider = SliderCreator(getTopUI());
	getTop().Widget.Slider = SliderCreator(getTop());
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _defineProperty = function(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopSpinnerUI = function (_TopInputBehavior) {
    _inherits(TopSpinnerUI, _TopInputBehavior);

    function TopSpinnerUI(props) {
        _classCallCheck(this, TopSpinnerUI);

        var _this2 = _possibleConstructorReturn(this, (TopSpinnerUI.__proto__ || Object.getPrototypeOf(TopSpinnerUI)).call(this, props));

        _this2.format = _this2.state.format;
        _this2.step = _this2.state.step;
        _this2.time = _this2.state.time;
        return _this2;
    }

    _createClass(TopSpinnerUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'handleChange',
        value: function handleChange(e) {
            this.setState(_defineProperty({}, this.state.type, e.target.value));
        }
    }, {
        key: '__render',
        value: function __render() {
            var _this3 = this;

            var topDisabled = this.__calculateDerivedDisabled();
            return React.createElement(
                'top-spinner',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-spinner-root', style: this.topStyle },
                    React.createElement('input', { className: 'top-spinner-input', type: 'text', ref: function ref(_ref) {
                            return _this3.dom.input = _ref;
                        }, disabled: topDisabled, value: this.state.type == 'time' ? this.state.time : this.state.number, onChange: function onChange(e) {
                            _this3.handleChange(e);
                        } }),
                    React.createElement('i', { className: 'top-spinner-button up' }),
                    React.createElement('i', { className: 'top-spinner-button down' })
                )
            );
        }
    }]);

    return TopSpinnerUI;
}(TopInputBehavior);

var TopSpinner = function (_TopSpinnerUI) {
    _inherits(TopSpinner, _TopSpinnerUI);

    function TopSpinner(props) {
        _classCallCheck(this, TopSpinner);

        var _this4 = _possibleConstructorReturn(this, (TopSpinner.__proto__ || Object.getPrototypeOf(TopSpinner)).call(this, props));

        _this4.handlerForUpClick = function (target) {
            var value;
            var step = _this4.state.step;
            if (_this4.state.type == 'time') {
                _this4.spinInputValue('up');
                value = _this4.time;
                _this4.setState({
                    time: value
                });
            } else {
                value = _this4.state.number + step;
                if (_this4.state.max && value > _this4.state.max) {
                    value = _this4.state.max;
                }
                _this4.setState({
                    number: value
                });
            }
        };

        _this4.handlerForDownClick = function (target) {
            var value;
            var step = _this4.state.step;
            if (_this4.state.type == 'time') {
                _this4.spinInputValue('down');
                value = _this4.time;
                _this4.setState({
                    time: value
                });
            } else {
                value = _this4.state.number - step;
                if (_this4.state.min && value < _this4.state.min) {
                    value = _this4.state.min;
                }
                _this4.setState({
                    number: value
                });
            }
        };

        _this4.initPropertiesForTime = function () {
            var d = new Date();
            var hour,
                min,
                second,
                msec,
                period = "";
            var isContainHour = /h/gi;
            var isContainPeriod = /(am)|(pm)/gi;

            if (isContainHour.test(_this4.format)) {
                _this4.timeSystem = _this4.format.includes("h") ? "12" : "24";
            }

            if (_this4.time === undefined || _this4.time === null) {
                hour = d.getHours().toString();
                min = d.getMinutes().toString();
                second = d.getSeconds().toString();
                msec = _this4.format.match(/S/g) ? d.getMilliseconds().toString().substring(0, _this4.format.match(/S/g).length) : d.getMilliseconds().toString();
                _this4.time = hour + min + second + msec;
            } else {
                if (/[\s]*p*[\s]*/gi.test(_this4.time)) {
                    _this4.time = _this4.time.replace(/[\s]*p*[\s]*/, "");
                }
                var numberArray = _this4.time.match(/[0-9]/g);
                var timeFormat = _this4.format.replace(/[\s]*p[\s]*/, "");

                if (_this4.timeSystem === "12") {
                    hour = _this4.time.substring(timeFormat.indexOf("h"), timeFormat.lastIndexOf("h") + 1);
                } else {
                    hour = _this4.time.substring(timeFormat.indexOf("H"), timeFormat.lastIndexOf("H") + 1);
                }

                min = _this4.time.substring(timeFormat.indexOf("m"), timeFormat.lastIndexOf("m") + 1);
                second = _this4.time.substring(timeFormat.indexOf("s"), timeFormat.lastIndexOf("s") + 1);
                msec = _this4.time.substring(timeFormat.indexOf("S"), timeFormat.lastIndexOf("S") + 1);
            }

            period = isContainPeriod.test(_this4.time) ? "" + _this4.time.match(isContainPeriod)[0] : hour > 11 ? "PM" : "AM";

            if (_this4.timeSystem === "12" && hour > 11) {
                hour = Math.abs(12 - parseInt(hour));
            }

            _this4.numberOfH = _this4.format.match(/h/gi) && _this4.format.match(/h/gi).length || 0;
            _this4.numberOfM = _this4.format.match(/m/gi) && _this4.format.match(/m/gi).length || 0;
            _this4.numberOfS = _this4.format.match(/s/g) && _this4.format.match(/s/g).length || 0;
            _this4.numberOfMS = _this4.format.match(/S/g) && _this4.format.match(/S/g).length || 0;

            hour = _this4.__leadingZeros(hour, _this4.numberOfH);
            min = _this4.__leadingZeros(min, _this4.numberOfM);
            second = _this4.__leadingZeros(second, _this4.numberOfS);
            msec = _this4.__leadingZeros(msec, _this4.numberOfMS);

            _this4.hour = hour;
            _this4.min = min;
            _this4.second = second;
            _this4.msec = msec;
            _this4.period = period;

            var newTimeValue = _this4.format;
            newTimeValue = newTimeValue.replace(/hh|h/ig, hour);
            newTimeValue = newTimeValue.replace(/mm|m/ig, min);
            newTimeValue = newTimeValue.replace(/ss|s/g, second);
            newTimeValue = newTimeValue.replace(/SSS|SS|S/g, msec);
            newTimeValue = newTimeValue.replace(/p/, period);

            _this4.time = newTimeValue;
            _this4.state.time = _this4.time;

            _this4.hourIndexRange = _this4.timeSystem == "12" ? [_this4.format.indexOf("h"), _this4.format.lastIndexOf("h")] : [_this4.format.indexOf("H"), _this4.format.lastIndexOf("H")];
            _this4.minIndexRange = [_this4.format.indexOf("m"), _this4.format.lastIndexOf("m")];
            _this4.secondIndexRange = [_this4.format.indexOf("s"), _this4.format.lastIndexOf("s")];
            _this4.msecIndexRange = [_this4.format.indexOf("S"), _this4.format.lastIndexOf("S")];
            _this4.periodIndexRange = [_this4.format.indexOf("p"), _this4.format.indexOf("p") + 1];

            _this4.order = _this4.format.split(/[^phms]/ig);
            var orderLength = _this4.order.length;
            var index = 0;
            while (index < orderLength) {
                var item = _this4.order[index];
                if (item.match(/hh|h/ig)) {
                    _this4.order[index] = "hour";
                } else if (item.match(/mm|m/ig)) {
                    _this4.order[index] = "min";
                } else if (item.match(/ss|s/g)) {
                    _this4.order[index] = "second";
                } else if (item.match(/SSS|SS|S/g)) {
                    _this4.order[index] = "msec";
                } else if (item.match(/p/ig)) {
                    _this4.order[index] = "period";
                }
                index++;
            }

            var startsWithP = /^[\s]*p[\s]*/;
            if (startsWithP.test(_this4.format)) {
                var addArrayValue = function addArrayValue(array) {
                    if (array[0] === -1) return;
                    array[0]++;
                    array[1]++;
                };

                addArrayValue(_this4.hourIndexRange);
                addArrayValue(_this4.minIndexRange);
                addArrayValue(_this4.secondIndexRange);
                addArrayValue(_this4.msecIndexRange);
            }
        };

        if (_this4.state.type === 'time') {
            _this4.initPropertiesForTime();
        }
        return _this4;
    }

    _createClass(TopSpinner, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopSpinner.prototype.__proto__ || Object.getPrototypeOf(TopSpinner.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent();
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            this._top.EventManager.on("click", this.dom.root, this.callbackHandler.bind(this));
            this._top.EventManager.on("mousedown", this.dom.root, this.callbackHandler.bind(this));
            this._top.EventManager.on("mouseup", this.dom.root, this.callbackHandler.bind(this));
        }
    }, {
        key: 'callbackHandler',
        value: function callbackHandler(event) {
            var _this = this;
            var target = event.srcElement;
            var targetName = '';
            var direction = '';
            var spinTimeout;
            while (true) {
                var classList = this._top.Util.__classStringToClassList(target.className);
                if (target.tagName == undefined || target.tagName == null) {
                    return;
                }
                if (classList.includes('up')) {
                    targetName = 'up';
                    break;
                } else if (classList.includes('down')) {
                    targetName = 'down';
                    break;
                }
                target = target.parentNode;
            };
            if (target && targetName === "up") {
                direction = "Up";
            } else if (target && targetName === "down") {
                direction = "Down";
            }
            if (event.type === 'click') {
                if (this.state.type === 'time') {
                    var thisPosition = this.doGetCaretPosition(this.dom.input);

                    if (this.hourIndexRange[0] != -1 && this.hourIndexRange[0] <= thisPosition && this.hourIndexRange[1] + 1 >= thisPosition) selectedRange = "hour";else if (this.minIndexRange[0] != -1 && this.minIndexRange[0] <= thisPosition && this.minIndexRange[1] + 1 >= thisPosition) selectedRange = "min";else if (this.secondIndexRange[0] != -1 && this.secondIndexRange[0] <= thisPosition && this.secondIndexRange[1] + 1 >= thisPosition) selectedRange = "second";else if (this.msecIndexRange[0] != -1 && this.msecIndexRange[0] <= thisPosition && this.msecIndexRange[1] + 1 >= thisPosition) selectedRange = "msec";else if (this.periodIndexRange[0] != -1 && this.periodIndexRange[0] <= thisPosition && this.periodIndexRange[1] + 1 >= thisPosition) selectedRange = "period";

                    this.setSelectionByRange(this.dom.input);
                }
            }
            if (event.type === 'mousedown') {
                var _numberSpinSpeed = function _numberSpinSpeed() {
                    clearTimeout(spinTimeout);
                    _this[eventHandlerName](target);
                    count++;
                    delay = count < 8 ? delay : count < 16 ? 120 : count < 36 ? 80 : count < 101 ? 50 : 30;
                    if (!_this.isMouseUp) {
                        spinTimeout = setTimeout(_numberSpinSpeed, delay);
                    } else {
                        clearTimeout(spinTimeout);
                        _this.isMouseUp = false;
                    }
                };

                var eventHandlerName = 'handlerFor' + direction + 'Click';
                var count = 0;
                var delay = 150;

                spinTimeout = setTimeout(_numberSpinSpeed, delay);
            } else if (event.type === 'mouseup') {
                this.isMouseUp = true;
            }
        }
    }, {
        key: 'spinInputValue',
        value: function spinInputValue(direction) {
            var currentValue = this.state.time;
            if (!selectedRange) selectedRange = this.order[_this.order.length - 1];

            if (selectedRange === "hour") {
                direction == "up" ? this.changeHourValue("up") : this.changeHourValue("down");
            } else if (selectedRange === "min") {
                direction == "up" ? this.changeMSValue("up", "min") : this.changeMSValue("down", "min");
            } else if (selectedRange === "second") {
                direction == "up" ? this.changeMSValue("up", "second") : this.changeMSValue("down", "second");
            } else if (selectedRange === "msec") {
                direction == "up" ? this.changeMsecValue("up") : this.changeMsecValue("down");
            } else if (selectedRange === "period") {
                this.changePeriodValue();
            }

            return this.time;
        }
    }, {
        key: 'doGetCaretPosition',
        value: function doGetCaretPosition(oField) {
            var iCaretPos = 0;
            if (document.selection) {
                oField.focus();
                var oSel = document.selection.createRange();
                oSel.moveStart('character', -oField.value.length);
                iCaretPos = oSel.text.length;
            } else if (oField.selectionStart || oField.selectionStart == '0') {
                iCaretPos = oField.selectionStart;
            }
            return iCaretPos;
        }
    }, {
        key: 'setSelectionByRange',
        value: function setSelectionByRange(input) {
            if (selectedRange === "hour") {
                input.setSelectionRange(this.hourIndexRange[0], this.hourIndexRange[1] + 1);
            } else if (selectedRange === "min") {
                input.setSelectionRange(this.minIndexRange[0], this.minIndexRange[1] + 1);
            } else if (selectedRange === "second") {
                input.setSelectionRange(this.secondIndexRange[0], this.secondIndexRange[1] + 1);
            } else if (selectedRange === "msec") {
                input.setSelectionRange(this.msecIndexRange[0], this.msecIndexRange[1] + 1);
            } else if (selectedRange === "period") {
                input.setSelectionRange(this.periodIndexRange[0], this.periodIndexRange[1] + 1);
            }
        }
    }, {
        key: 'changeHourValue',
        value: function changeHourValue(direction, fromMin) {
            var currentValue;
            var newValue;
            var index1 = this.hourIndexRange[0];
            var index2 = this.hourIndexRange[1];
            var hourStep = fromMin ? 1 : parseFloat(this.step);

            currentValue = this.state.time.substring(index1, index2 + 1);
            if (currentValue === "") currentValue = "00";
            if (isNaN(currentValue)) currentValue = this.hour;

            newValue = direction == "up" ? parseFloat(currentValue) + hourStep : parseFloat(currentValue) - hourStep;

            switch (this.timeSystem) {
                case "12":
                    {
                        if (newValue > 11) {
                            newValue = 0;
                            changePeriodValue();
                        }
                        if (newValue < 0) {
                            newValue = 11;
                            changePeriodValue();
                        }
                        break;
                    }
                case "24":
                    {
                        if (newValue > 23) {
                            newValue = 0;
                            changePeriodValue();
                        }
                        if (newValue < 0) {
                            newValue = 23;
                            changePeriodValue();
                        }
                        break;
                    }
            }

            newValue = this.__leadingZeros(newValue, this.numberOfH);
            this.hour = newValue;

            var newTimeValue = this.format;
            newTimeValue = newTimeValue.replace(/hh|h/ig, this.hour);
            newTimeValue = newTimeValue.replace(/mm|m/ig, this.min);
            newTimeValue = newTimeValue.replace(/ss|s/g, this.second);
            newTimeValue = newTimeValue.replace(/SSS|SS|S/g, this.msec);
            newTimeValue = newTimeValue.replace(/p/, this.period);

            this.time = newTimeValue;
        }
    }, {
        key: 'changeMSValue',
        value: function changeMSValue(direction, range, fromChild) {
            var currentValue;
            var newValue;
            var index1, index2;
            var digits;
            var newStep = fromChild ? 1 : parseFloat(this.step);

            if (range === "min") {
                index1 = this.minIndexRange[0];
                index2 = this.minIndexRange[1];
                digits = this.numberOfM;
            } else {
                index1 = this.secondIndexRange[0];
                index2 = this.secondIndexRange[1];
                digits = this.numberOfS;
            }

            currentValue = this.state.time.substring(index1, index2 + 1);
            if (currentValue === "") currentValue = "00";
            if (isNaN(currentValue)) {
                currentValue = range === "min" ? this.min : this.second;
            }

            newValue = parseFloat(currentValue) + (direction == "up" ? newStep : -newStep);

            if (newValue > 59) {
                newValue = parseFloat(currentValue) + newStep - 60;
                range === "min" ? this.changeHourValue("up", true) : this.changeMSValue("up", "min", true);
            }
            if (newValue < 0) {
                newValue = parseFloat(currentValue) - newStep + 60;
                range === "min" ? this.changeHourValue("down", true) : this.changeMSValue("down", "min", true);
            }

            newValue = this.__leadingZeros(newValue, digits);

            if (range === "min") this.min = newValue;else this.second = newValue;

            var newTimeValue = this.format;
            newTimeValue = newTimeValue.replace(/hh|h/ig, this.hour);
            newTimeValue = newTimeValue.replace(/mm|m/ig, this.min);
            newTimeValue = newTimeValue.replace(/ss|s/g, this.second);
            newTimeValue = newTimeValue.replace(/SSS|SS|S/g, this.msec);
            newTimeValue = newTimeValue.replace(/p/, this.period);

            this.time = newTimeValue;
        }
    }, {
        key: 'changeMsecValue',
        value: function changeMsecValue(direction, fromChild) {
            var currentValue;
            var newValue;
            var index1 = this.msecIndexRange[0];
            var index2 = this.msecIndexRange[1];
            var digits = this.numberOfMS;
            var msecStep = fromChild ? 1 : parseFloat(this.step);

            currentValue = this.state.time.substring(index1, index2 + 1);
            if (currentValue === "") currentValue = digits == 3 ? "000" : digits == 2 ? "00" : "0";
            if (isNaN(currentValue)) currentValue = this.msec;

            newValue = direction == "up" ? parseFloat(currentValue) + msecStep : parseFloat(currentValue) - msecStep;

            if (newValue > (digits == 3 ? 999 : digits == 2 ? 99 : 9)) {
                newValue = parseFloat(currentValue) + msecStep - (digits == 3 ? 1000 : digits == 2 ? 100 : 10);
                changeMSValue("up", "second", true);
            }
            if (newValue < 0) {
                newValue = parseFloat(currentValue) - msecStep + (digits == 3 ? 1000 : digits == 2 ? 100 : 10);
                changeMSValue("down", "second", true);
            }

            newValue = this.__leadingZeros(newValue, this.numberOfMS);
            this.msec = newValue;

            var newTimeValue = this.format;
            newTimeValue = newTimeValue.replace(/hh|h/ig, this.hour);
            newTimeValue = newTimeValue.replace(/mm|m/ig, this.min);
            newTimeValue = newTimeValue.replace(/ss|s/g, this.second);
            newTimeValue = newTimeValue.replace(/SSS|SS|S/g, this.msec);
            newTimeValue = newTimeValue.replace(/p/, this.period);

            this.time = newTimeValue;
        }
    }, {
        key: 'changePeriodValue',
        value: function changePeriodValue() {
            var currentValue, newValue, index1, index2;
            var testPeriod = /\b(am)|\b(pm)/gi;

            index1 = this.periodIndexRange[0];
            index2 = this.periodIndexRange[1];
            currentValue = this.state.time.substring(index1, index2 + 1);

            if (!testPeriod.test(currentValue)) currentValue = this.period;
            newValue = togglePeriod(currentValue);

            this.period = newValue;

            var newTimeValue = this.format;
            newTimeValue = newTimeValue.replace(/hh|h/ig, this.hour);
            newTimeValue = newTimeValue.replace(/mm|m/ig, this.min);
            newTimeValue = newTimeValue.replace(/ss|s/g, this.second);
            newTimeValue = newTimeValue.replace(/SSS|SS|S/g, this.msec);
            newTimeValue = newTimeValue.replace(/p/, this.period);

            this.time = newTimeValue;

            function togglePeriod(p) {
                var ret;
                var includeA = /a/ig;

                if (includeA.test(p)) {
                    if (p.includes("a")) ret = p.replace("a", "p");else ret = p.replace("A", "P");
                } else {
                    if (p.includes("p")) ret = p.replace("p", "a");else ret = p.replace("P", "A");
                }
                return ret;
            }
        }
    }, {
        key: '__leadingZeros',
        value: function __leadingZeros(n, digits) {
            var zero = '';
            n = n.toString();
            if (n == "" || isNaN(n)) n = "0";
            if (n.includes('-')) {
                n = n.substring(1);
                zero += '-';
            }

            if (n.length < digits) {
                var len = digits - n.length;
                while (len--) {
                    zero += '0';
                }
            }
            return zero + n;
        }
    }]);

    return TopSpinner;
}(TopSpinnerUI);

TopSpinnerUI.propConfigs = Object.assign({}, TopInputBehavior.propConfigs, {
    type: {
        type: String,
        default: 'number',
        options: ['number', 'time']
    },

    step: {
        type: Number,
        default: 1
    },

    number: {
        type: Number,
        default: 0
    },

    min: {
        type: Number
    },

    max: {
        type: Number
    },

    time: {
        type: String
    },

    format: {
        type: String,
        default: "HH:mm"
    },
    valueByType: {
        type: String
    },
    wrap: {
        type: String
    }
});

TopSpinnerUI.defaultProps = Object.assign({}, TopInputBehavior.defaultProps, {
    tagName: 'top-spinner'
});

TopSpinner.propConfigs = Object.assign({}, TopSpinnerUI.propConfigs, {});

TopSpinner.defaultProps = Object.assign({}, TopSpinnerUI.defaultProps, {});

(function () {

    var SpinnerCreator = function SpinnerCreator(topInstance) {
        Spinner.prototype = Object.create(topInstance.Widget.prototype);
        Spinner.prototype.constructor = Spinner;

        function Spinner(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-spinner']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-spinner'], props));
            }
        }

        Spinner.create = function (element, props) {
            return new Spinner(element, props);
        };

        return Spinner;
    };

    getTopUI().Widget.Spinner = SpinnerCreator(getTopUI());
    getTop().Widget.Spinner = SpinnerCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopSplitterlayoutUI = function (_TopLayoutBehavior) {
    _inherits(TopSplitterlayoutUI, _TopLayoutBehavior);

    function TopSplitterlayoutUI(props) {
        _classCallCheck(this, TopSplitterlayoutUI);

        return _possibleConstructorReturn(this, (TopSplitterlayoutUI.__proto__ || Object.getPrototypeOf(TopSplitterlayoutUI)).call(this, props));
    }

    _createClass(TopSplitterlayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.adjustLayoutSize();
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {
            this.adjustLayoutSize();
        }
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'adjustLayoutSize',
        value: function adjustLayoutSize() {
            var splitterWidth = splitterHeight = 0;
            var contents = this.dom.root.querySelectorAll('.top-splitterlayout-content');
            var splitter = this.dom.root.querySelector('.top-splitterlayout-splitter');
            if (contents) {
                var len = contents.length;
                for (var i = 0; i < len; i++) {
                    if (this.state.orientation === 'horizontal') {
                        contents[i].style.display = 'inline-block';
                        splitterWidth = splitter.offsetWidth;
                        var width = 'calc(' + parseInt(this.sizeArray[i]) / this.sizeSum * 100 + '% - ' + parseInt(splitterWidth / len) + 'px)';
                        contents[i].style.width = width;
                        contents[i].style.height = '100%';
                        if (i === len - 1) {
                            contents[i].style.left = splitterWidth + 'px';
                        }
                    } else {
                        splitterHeight = splitter.offsetHeight;
                        var height = 'calc(' + parseInt(this.sizeArray[i]) / this.sizeSum * 100 + '% - ' + parseInt(splitterHeight / len) + 'px)';
                        contents[i].style.height = height;
                        contents[i].style.width = '100%';
                        if (i === len - 1) {
                            contents[i].style.top = splitterHeight + 'px';
                        }
                    }
                }
            }
        }
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this2 = this;

            if (children) {
                children = React.Children.map(children, function (child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this2,
                        layoutFunction: function layoutFunction() {
                            var pWrapWidth = this.props.layoutParent.state.layoutWidth === "auto" || this.props.layoutParent.state.layoutWidth === 'wrap_content';
                            var pWrapHeight = !this.props.layoutParent.state.layoutHeight || this.props.layoutParent.state.layoutHeight === "auto" || this.props.layoutParent.state.layoutHeight === 'wrap_content';
                            if (this.state.layoutWidth === "match_parent") {
                                if (pWrapWidth) {
                                    this.__updateLayoutWidth(parseInt(this.state.marginRight) + parseInt(this.state.marginLeft) + "px");
                                } else {
                                    this.__updateLayoutWidth("100%");
                                }
                            }

                            if (this.state.layoutHeight === "match_parent") {
                                if (pWrapHeight) {
                                    this.__updateLayoutHeight(parseInt(this.state.marginTop) + parseInt(this.state.marginBottom) + "px");
                                } else {
                                    this.__updateLayoutHeight("100%");
                                }
                            }
                        }
                    });
                });
            }
            return children;
        }
    }, {
        key: 'makeContentTag',
        value: function makeContentTag(index) {
            var contentClass = 'top-splitterlayout-content content_' + index;
            var contentStyle = {};
            if (this.state.orientation === 'horizontal') contentStyle.display = 'inline-block';
            return React.createElement(
                'div',
                { className: contentClass, style: contentStyle },
                this.__setWrapperStyle(this.state.children[index])
            );
        }
    }, {
        key: 'makeSplitterTag',
        value: function makeSplitterTag() {
            var splitterClass = 'top-splitterlayout-splitter ' + this.state.orientation;
            var splitterStyle = {};
            if (this.state.orientation === 'horizontal') splitterStyle.display = 'inline-block';
            return React.createElement('div', { className: splitterClass, style: splitterStyle });
        }
    }, {
        key: 'renderLayout',
        value: function renderLayout() {
            var sizeArray = [];
            var sizeSum = 0;

            sizeArray = this.state.ratio.split(':');

            for (var i = 0; i < sizeArray.length; i++) {
                if (sizeArray[i] === '') sizeArray[i] = '0';
                var size = parseInt(sizeArray[i]);
                sizeSum += size;
            }

            this.sizeArray = sizeArray;
            this.sizeSum = sizeSum;

            return React.createElement(
                React.Fragment,
                null,
                this.makeContentTag(0),
                this.makeSplitterTag(),
                this.makeContentTag(1)
            );
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-splitterlayout',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-splitterlayout-root', style: this.topStyle },
                    this.renderLayout()
                )
            );
        }
    }]);

    return TopSplitterlayoutUI;
}(TopLayoutBehavior);

var TopSplitterlayout = function (_TopSplitterlayoutUI) {
    _inherits(TopSplitterlayout, _TopSplitterlayoutUI);

    function TopSplitterlayout() {
        _classCallCheck(this, TopSplitterlayout);

        return _possibleConstructorReturn(this, (TopSplitterlayout.__proto__ || Object.getPrototypeOf(TopSplitterlayout)).apply(this, arguments));
    }

    return TopSplitterlayout;
}(TopSplitterlayoutUI);

TopSplitterlayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {
    orientation: {
        type: String,
        options: ['horizontal', 'vertical'],
        default: 'vertical'
    },

    ratio: {
        type: String,
        default: '1:1'
    },

    splitter: {
        type: Number,
        default: 1
    },

    postResize: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    onSplitterDrag: {
        type: Function
    }
});

TopSplitterlayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-splitterlayout'
});

TopSplitterlayout.propConfigs = Object.assign({}, TopSplitterlayoutUI.propConfigs, {});

TopSplitterlayout.defaultProps = Object.assign({}, TopSplitterlayoutUI.defaultProps, {});

(function () {

    var SplitterlayoutCreator = function SplitterlayoutCreator(topInstance) {
        Splitterlayout.prototype = Object.create(topInstance.Widget.Layout.prototype);
        Splitterlayout.prototype.constructor = Splitterlayout;

        function Splitterlayout(element, props, childs) {
            topInstance.Widget.Layout.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-splitterlayout']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-splitterlayout'], props, childs));
            }
        }

        Splitterlayout.create = function (element, props, childs) {
            return new Splitterlayout(element, props, childs);
        };

        return Splitterlayout;
    };

    getTopUI().Widget.Layout.Splitterlayout = SplitterlayoutCreator(getTopUI());
    getTop().Widget.Layout.Splitterlayout = SplitterlayoutCreator(getTop());
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _toConsumableArray = function(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopStepperUI = function (_TopEventBehavior) {
	_inherits(TopStepperUI, _TopEventBehavior);

	function TopStepperUI(props) {
		_classCallCheck(this, TopStepperUI);

		var _this2 = _possibleConstructorReturn(this, (TopStepperUI.__proto__ || Object.getPrototypeOf(TopStepperUI)).call(this, props));

		_this2.state.nodeIndex = 0;
		return _this2;
	}

	_createClass(TopStepperUI, [{
		key: '__componentDidMount',
		value: function __componentDidMount() {}
	}, {
		key: '__componentDidUpdate',
		value: function __componentDidUpdate() {}
	}, {
		key: '__componentWillUpdate',
		value: function __componentWillUpdate() {}
	}, {
		key: '__componentWillUnmount',
		value: function __componentWillUnmount() {}
	}, {
		key: '__setSpacing',
		value: function __setSpacing() {
			this.setTopStyle('paddingLeft', (this.state.spacing || this.state.paddingLeft) + 'px');
			this.setTopStyle('paddingRight', (this.state.spacing || this.state.paddingRight) + 'px');
		}
	}, {
		key: '__setRootSize',
		value: function __setRootSize() {
			if (!this.topStyle.width) {
				this.setTopStyle('width', '100%');
			}
			if (!this.topStyle.height) {
				this.setTopStyle('height', '75px');
			}
		}
	}, {
		key: '__renderEachStep',
		value: function __renderEachStep(i, stepState) {
			var radius = this.state.radius,
			    fontSize = 13,
			    extraSize = 4,
			    circleSize = radius * 2 + 'px',
			    circleStyle = {
				width: circleSize,
				height: circleSize,
				borderRadius: radius + 'px',
				top: 'calc(50% - ' + radius + 'px)'
			},
			    numberStyle = {
				width: circleSize,
				height: circleSize,
				top: 'calc(50% - ' + radius + 'px)',
				lineHeight: 2 * radius - extraSize + 'px'
			},
			    labelStyle = {
				top: 'calc(50% + ' + (radius + fontSize) + 'px)'
			};

			return [React.createElement('div', { className: 'top-stepper-circle', style: circleStyle, key: 'circle' }), React.createElement(
				'span',
				{ className: 'top-stepper-number', style: numberStyle, key: 'number' },
				stepState === 'completed' ? '\uE91B' : i + 1
			), React.createElement(
				'span',
				{ className: 'top-stepper-label', style: labelStyle, key: 'label' },
				this.state.labels[i]
			)];
		}
	}, {
		key: '__renderStepper',
		value: function __renderStepper() {
			var _this3 = this;

			var steps = this.state.steps,
			    radius = this.state.radius,
			    nodeIndex = this.state.nodeIndex,
			    lastIdx = steps - 1,
			    lineWidth = 'calc((100% - ' + steps * radius * 2 + 'px) / ' + lastIdx + ')',
			    stepWidth = radius * 2 + 'px';

			return [].concat(_toConsumableArray(Array(steps))).map(function (v, i) {
				var stepState = i < nodeIndex ? 'completed' : i === nodeIndex ? 'focused' : 'unfocused',
				    lineClass = classNames('top-stepper-line', stepState),
				    stepClass = classNames('top-stepper-step', stepState),
				    lineStyle = { width: lineWidth },
				    stepStyle = { width: stepWidth },
				    lineKey = 'line-' + i,
				    stepKey = 'step-' + i;

				return [React.createElement(
					'div',
					{ className: stepClass, style: stepStyle, key: lineKey },
					_this3.__renderEachStep(i, stepState)
				), i < lastIdx && React.createElement('div', { className: lineClass, style: lineStyle, key: stepKey })];
			});
		}
	}, {
		key: '__render',
		value: function __render() {
			this.__setSpacing();
			this.__setRootSize();

			return React.createElement(
				'top-stepper',
				{
					ref: this.setTopRef,
					id: this.state.id,
					'class': this.makeTopTagClassString(),
					style: this.topTagStyle },
				React.createElement(
					'div',
					{
						ref: this.setRootRef,
						id: this.state.id,
						className: 'top-stepper-root',
						disabled: this.__calculateDerivedDisabled(),
						style: this.topStyle },
					this.__renderStepper()
				)
			);
		}
	}]);

	return TopStepperUI;
}(TopEventBehavior);

var TopStepper = function (_TopStepperUI) {
	_inherits(TopStepper, _TopStepperUI);

	function TopStepper(props) {
		_classCallCheck(this, TopStepper);

		return _possibleConstructorReturn(this, (TopStepper.__proto__ || Object.getPrototypeOf(TopStepper)).call(this, props));
	}

	_createClass(TopStepper, [{
		key: '__componentDidMount',
		value: function __componentDidMount() {
			_get(TopStepper.prototype.__proto__ || Object.getPrototypeOf(TopStepper.prototype), '__componentDidMount', this).call(this);
		}
	}, {
		key: 'focus',
		value: function focus() {
			this.dom.root.focus();
		}
	}, {
		key: 'blur',
		value: function blur() {
			this.dom.root.blur();
		}
	}, {
		key: '__render',
		value: function __render() {
			return _get(TopStepper.prototype.__proto__ || Object.getPrototypeOf(TopStepper.prototype), '__render', this).call(this);
		}
	}]);

	return TopStepper;
}(TopStepperUI);

TopStepperUI.propConfigs = Object.assign({}, TopEventBehavior.propConfigs, {
	textAlign: {
		type: String,
		default: 'center',
		options: ['center', 'left']
	},

	steps: {
		type: Number,
		default: 3,
		convert: function convert(value) {
			value = parseInt(value);
			return value > 2 ? value : 2;
		}
	},

	labels: {
		type: Array,
		arrayOf: String
	},

	spacing: {
		type: Number,
		default: 0.5
	},

	radius: {
		type: Number,
		default: 11.5,
		convert: function convert(value) {
			value = parseInt(value);
			return value > 11.5 ? value : 11.5;
		}
	}
});

TopStepperUI.defaultProps = Object.assign({}, TopEventBehavior.defaultProps, {
	tagName: 'top-stepper'
});

TopStepper.propConfigs = Object.assign({}, TopStepperUI.propConfigs, {});

TopStepper.defaultProps = Object.assign({}, TopStepperUI.defaultProps, {});

(function () {
	var StepperCreator = function StepperCreator(topInstance) {
		Stepper.prototype = Object.create(topInstance.Widget.prototype);
		Stepper.prototype.constructor = Stepper;

		function Stepper(element, props) {
			topInstance.Widget.apply(this, arguments);
			if (element instanceof topInstance.Render.topWidgets['top-stepper']) {
				this.setTemplate(element);
			} else {
				this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-stepper'], props));
			}
		}

		Stepper.create = function (element, props) {
			return new Stepper(element, props);
		};

		Stepper.prototype.next = function () {
			var _this = this.getTemplate(),
			    nodeIndex = _this.state.nodeIndex;
			if (nodeIndex < _this.state.steps - 1) {
				_this.setState({ nodeIndex: nodeIndex + 1 });
			}
		};

		Stepper.prototype.prev = function () {
			var _this = this.getTemplate(),
			    nodeIndex = _this.state.nodeIndex;
			if (nodeIndex > 0) {
				_this.setState({ nodeIndex: nodeIndex - 1 });
			}
		};

		Stepper.prototype.goTo = function (idx) {
			var _this = this.getTemplate();
			var index = idx * 1 - 1;
			if (index > -1 && index < _this.state.steps) {
				_this.setState({ nodeIndex: index });
			}
		};

		Stepper.prototype.getStatus = function (idx) {
			var _this = this.getTemplate(),
			    nodeIndex = _this.state.nodeIndex;
			if (idx) {
				var index = idx * 1 - 1;
			} else return;

			if (nodeIndex === index) {
				return 'focused';
			} else if (nodeIndex < index) {
				return 'unfocused';
			} else {
				return 'completed';
			}
		};

		Stepper.prototype.getStepNumber = function () {
			var _this = this.getTemplate(),
			    nodeIndex = _this.state.nodeIndex;
			return nodeIndex + 1;
		};

		Stepper.prototype.getWidth = function () {
			return this.getTemplate().getElementForSize().clientWidth;
		};

		Stepper.prototype.getHeight = function () {
			return this.getTemplate().getElementForSize().clientHeight;
		};

		return Stepper;
	};

	getTopUI().Widget.Stepper = StepperCreator(getTopUI());
	getTop().Widget.Stepper = StepperCreator(getTop());
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopSwitchUI = function (_TopCheckBehavior) {
    _inherits(TopSwitchUI, _TopCheckBehavior);

    function TopSwitchUI(props) {
        _classCallCheck(this, TopSwitchUI);

        return _possibleConstructorReturn(this, (TopSwitchUI.__proto__ || Object.getPrototypeOf(TopSwitchUI)).call(this, props));
    }

    _createClass(TopSwitchUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'getPaddingStyleObjectKey',
        value: function getPaddingStyleObjectKey() {
            return 'sliderTagStyle';
        }
    }, {
        key: '__render',
        value: function __render() {
            var topDisabled = this.__calculateDerivedDisabled();
            var sliderClass = classNames({
                'top-switch-slider': true,
                'checked': this.__isCheckedTrue(),
                'disabled': topDisabled
            });

            return React.createElement(
                'top-switch',
                {
                    id: this.state.id,
                    ref: this.setTopRef,
                    'class': this.makeTopTagClassString(),
                    disabled: topDisabled,
                    style: this.topTagStyle },
                React.createElement(
                    'label',
                    {
                        className: 'top-switch-root',
                        ref: this.setRootRef,
                        style: this.topStyle },
                    React.createElement(
                        'div',
                        { className: sliderClass, style: this.sliderTagStyle },
                        React.createElement(
                            'div',
                            { className: 'top-switch-on' },
                            React.createElement(
                                'div',
                                { className: 'top-switch-text' },
                                this.state.textOn
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'top-switch-off' },
                            React.createElement(
                                'div',
                                { className: 'top-switch-text' },
                                this.state.textOff
                            )
                        )
                    )
                ),
                React.createElement('input', {
                    className: 'top-switch-background',
                    type: 'checkbox',
                    name: this.state.groupId,
                    checked: this.__isCheckedTrue(),
                    disabled: topDisabled,
                    onChange: function onChange(e) {
                        e.preventDefault();
                    } })
            );
        }
    }]);

    return TopSwitchUI;
}(TopCheckBehavior);

var TopSwitch = function (_TopSwitchUI) {
    _inherits(TopSwitch, _TopSwitchUI);

    function TopSwitch() {
        _classCallCheck(this, TopSwitch);

        return _possibleConstructorReturn(this, (TopSwitch.__proto__ || Object.getPrototypeOf(TopSwitch)).apply(this, arguments));
    }

    _createClass(TopSwitch, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopSwitch.prototype.__proto__ || Object.getPrototypeOf(TopSwitch.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent();
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            var _this3 = this;

            this._top.EventManager.on('click', this.dom.root, function (event) {
                _this3.toggle();
            });
        }
    }, {
        key: 'on',
        value: function on() {
            this.__updateProperties({ 'checked': this.state.trueValue });
        }
    }, {
        key: 'off',
        value: function off() {
            this.__updateProperties({ 'checked': this.state.falseValue });
        }
    }, {
        key: 'toggle',
        value: function toggle() {
            if (this.__isCheckedTrue()) this.off();else this.on();
        }
    }]);

    return TopSwitch;
}(TopSwitchUI);

TopSwitchUI.propConfigs = Object.assign({}, TopCheckBehavior.propConfigs, {
    textOn: {
        type: String,
        default: "On"
    },

    textOff: {
        type: String,
        default: "Off"
    }
});

TopSwitchUI.defaultProps = Object.assign({}, TopCheckBehavior.defaultProps, {
    tagName: 'top-switch'
});

TopSwitch.propConfigs = Object.assign({}, TopSwitchUI.propConfigs, {});

TopSwitch.defaultProps = Object.assign({}, TopSwitchUI.defaultProps, {});

(function () {

    var SwitchCreator = function SwitchCreator(topInstance) {
        Switch.prototype = Object.create(topInstance.Widget.prototype);
        Switch.prototype.constructor = Switch;

        function Switch(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-switch']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-switch'], props));
            }
        }

        Switch.create = function (element, props) {
            return new Switch(element, props);
        };

        Switch.prototype.on = function () {
            this.getTemplate().on();
        };

        Switch.prototype.off = function () {
            this.getTemplate().off();
        };

        Switch.prototype.toggle = function () {
            this.getTemplate().toggle();
        };

        Switch.prototype.isOn = function () {
            return this.getTemplate().__isCheckedTrue();
        };

        return Switch;
    };

    getTopUI().Widget.Switch = SwitchCreator(getTopUI());
    getTop().Widget.Switch = SwitchCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopTablayoutUI = function (_TopLayoutBehavior) {
    _inherits(TopTablayoutUI, _TopLayoutBehavior);

    function TopTablayoutUI(props) {
        _classCallCheck(this, TopTablayoutUI);

        var _this = _possibleConstructorReturn(this, (TopTablayoutUI.__proto__ || Object.getPrototypeOf(TopTablayoutUI)).call(this, props));

        _this.state.display_tab_length = -1;
        _this.setTabs();
        return _this;
    }

    _createClass(TopTablayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            if (this.state.children.length === 0 || this.state.tabs.length === 0) return;
            this.setDisplayTabLength();
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {
            if (this.onChangeTabLength) {
                if (this.state.children.length === 0 || this.state.tabs.length === 0) return;
                if (this.reRenderChildFlag) {
                    this.__reRenderChild();
                    this.reRenderChildFlag = false;
                }
                this.onChangeTabLength = false;
                this.setDisplayTabLength();
            }
        }
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;

            _get(TopTablayoutUI.prototype.__proto__ || Object.getPrototypeOf(TopTablayoutUI.prototype), '__initDomRef', this).call(this);
            this.dom.table = null;
            this.dom.tr = null;
            this.dom.container = null;
            this.dom.td = [];
            this.dom.pageNext = null;
            this.dom.pagePrev = null;
            this.dom.pageNextList = null;
            this.dom.pagePrevList = null;
            this.dom.tabPlus = null;
            this.dom.customMenu = null;
            this.dom.customMenuButton = [];
            this.dom.customMenuItem = [];
            this.dom.closeButton = [];
            this.setTableRef = function (element) {
                _this2.dom.table = element;
            };
            this.setTrRef = function (element) {
                _this2.dom.tr = element;
            };
            this.setContainerRef = function (element) {
                _this2.dom.container = element;
            };
            this.setTdRef = function (element) {
                _this2.dom.td.push(element);
            };
            this.setPageNextRef = function (element) {
                _this2.dom.pageNext = element;
            };
            this.setPagePrevRef = function (element) {
                _this2.dom.pagePrev = element;
            };
            this.setPageNextListRef = function (element) {
                _this2.dom.pageNextList = element;
            };
            this.setPagePrevListRef = function (element) {
                _this2.dom.pagePrevList = element;
            };
            this.setTabPlusRef = function (element) {
                _this2.dom.tabPlus = element;
            };
            this.setCustomMenuRef = function (element) {
                _this2.dom.customMenu = element;
            };
            this.setCustomMenuBtnRef = function (element) {
                _this2.dom.customMenuButton.push(element);
            };
            this.setCustomMenuItemRef = function (element) {
                _this2.dom.customMenuItem.push(element);
            };
            this.setCloseButtonRef = function (element) {
                _this2.dom.closeButton.push(element);
            };
        }
    }, {
        key: '__initialClassname',
        value: function __initialClassname() {
            var classTest = /(light)|(dark)|(tab_01)|(tab_02)|(tab_03)|(tab_04)/g;
            if (!classTest.test(this._top.Util.__classListToClassString(this.userClassList))) {
                this._top.Util.__addClassToClassList(this.userClassList, 'tab_01');
            }
        }
    }, {
        key: 'checkTabClassName',
        value: function checkTabClassName() {
            var tabClassName = '';
            var checkClass = [];
            checkClass.push(/\b(tab_01)\b/g);
            checkClass.push(/\b(tab_02)\b/g);
            checkClass.push(/\b(tab_03)\b/g);
            checkClass.push(/\b(tab_04)\b/g);
            checkClass.push(/\b(light)\b/g);
            checkClass.push(/\b(dark)\b/g);
            for (var i = 0; i < checkClass.length; i++) {
                if (checkClass[i].test(this.makeTopTagClassString())) {
                    var j = i + 1;
                    switch (i) {
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                            {
                                tabClassName = 'tab_0' + j;
                                break;
                            }
                        case 4:
                            {
                                tabClassName = 'light';
                                break;
                            }
                        case 5:
                            {
                                tabClassName = 'dark';
                                break;
                            }
                    }
                }
            }
            this.tabClassName = tabClassName;
        }
    }, {
        key: 'setTabs',
        value: function setTabs() {
            var changedTabs = [];
            Object.assign(changedTabs, this.state.tabs);
            this.state.children.map(function (child, index) {
                if (child.props.layoutTabName) {
                    var tabName = child.props.layoutTabName;
                    var tabDisabled = child.props.layoutTabDisabled === 'true' || child.props.layoutTabDisabled === true ? true : false;
                    var current_id = child.props.layoutTabId ? child.props.layoutTabId : child.props.id;
                    var closable = false;
                    if (child.props.layoutClosable) closable = child.props.layoutClosable;
                    var image = null;
                    if (child.props.layoutTabIcon) image = child.props.layoutTabIcon;
                    changedTabs[index] = {
                        id: current_id,
                        text: tabName,
                        layout: child,
                        disabled: tabDisabled,
                        closable: closable,
                        image: image
                    };
                }
            });
            this.objTabs = {};
            for (var i = 0; i < changedTabs.length; i++) {
                this.objTabs[changedTabs[i].id] = changedTabs[i];
            }
            this.state.tabs = changedTabs;
        }
    }, {
        key: 'getDisplayTabLength',
        value: function getDisplayTabLength(tabs) {
            var display_tab_length = Math.floor(this.dom.container.clientWidth / this.dom.tr.children[1].clientWidth);
            var tabLength = tabs === undefined ? this.state.tabs.length : tabs.length;
            if (display_tab_length > tabLength + 1) {
                return display_tab_length = tabLength + 1;
            } else {
                return display_tab_length;
            }
        }
    }, {
        key: 'setDisplayTabLength',
        value: function setDisplayTabLength() {
            var display_tab_length = this.getDisplayTabLength();
            this.setState({
                display_tab_length: display_tab_length
            });
        }
    }, {
        key: 'getSelectedIndex',
        value: function getSelectedIndex() {
            if (typeof this.state.ideSelected === 'number') return this.state.ideSelected;
            var selectedIndex = 0;
            var selectedId = this.state.ideSelected || this.state.selected;
            if (selectedId) {
                for (var i = 0; i < this.state.tabs.length; i++) {
                    if (this.state.tabs[i].id === selectedId) {
                        selectedIndex = i;
                        break;
                    }
                }
            }
            return selectedIndex;
        }
    }, {
        key: 'createTab',
        value: function createTab() {
            var tds = [];
            var selectedIndex = this.getSelectedIndex();
            for (var i = 0; i < this.state.tabs.length; i++) {
                var tdClassList = ['top-tablayout-tab-wrapper', 'tabs', this.tabClassName];
                if (this.state.tabs[i].disabled === true) tdClassList.push('tab-disabled');
                var divClassList = ['top-tablayout-tab', 'tab_' + i, this.tabClassName];
                if (i === selectedIndex) divClassList.push('active');
                var spanClassList = ['tab_text', this.tabClassName];
                var tdStyle = {};
                if (i < this.state.display_tab_length && i >= 0) tdStyle.display = 'table-cell';else tdStyle.display = 'none';
                var td = React.createElement(
                    'td',
                    { id: this.state.tabs[i].id, key: i, ref: this.setTdRef, className: this._top.Util.__classListToClassString(tdClassList), tabIndex: this.state.tabIndex, style: tdStyle },
                    React.createElement(
                        'div',
                        { className: this._top.Util.__classListToClassString(divClassList) },
                        React.createElement(
                            'span',
                            { className: this._top.Util.__classListToClassString(spanClassList) },
                            this.state.tabs[i].text
                        ),
                        this.createCloseBtn(i),
                        this.createCustomMenuBtn(i)
                    )
                );
                tds.push(td);
            }
            return React.createElement(
                'table',
                { ref: this.setTableRef, cellSpacing: '0', cellPadding: '1', className: 'top-tablayout-table', width: '100%' },
                React.createElement(
                    'tbody',
                    null,
                    React.createElement(
                        'tr',
                        { ref: this.setTrRef },
                        this.createPaginationPre(),
                        tds,
                        this.createPaginationNext(),
                        this.createPaginationPlus(),
                        this.createLastTd()
                    )
                )
            );
        }
    }, {
        key: 'createCloseBtn',
        value: function createCloseBtn(i) {
            if (this.state.tabs[i].closable === true || this.state.tabs[i].closable === 'true') {
                var spanClassList = ['close_btn', this.tabClassName];
                var id = this.state.tabs[i].id + '_closeBtn_' + i;
                return React.createElement('span', { id: id, ref: this.setCloseButtonRef, className: this._top.Util.__classListToClassString(spanClassList) });
            }
        }
    }, {
        key: 'createCustomMenuBtn',
        value: function createCustomMenuBtn(i) {
            var selectedIndex = this.getSelectedIndex();
            if (this.state.custommenu !== undefined) {
                var spanClassList = ['td_menu', this.tabClassName];
                var id = this.state.tabs[i].id + '_menuBtn';
                var spanStyle = {};
                if (this.state.tabs[i].closable === true || this.state.tabs[i].closable === 'true') spanStyle.marginRight = '-25%';
                if (this.state.menuFocus === true) {
                    if (i === selectedIndex) {
                        spanStyle.display = 'block';
                    } else {
                        spanStyle.display = 'none';
                    }
                } else {
                    spanStyle.display = 'block';
                }
                return React.createElement('span', { id: id, ref: this.setCustomMenuBtnRef, className: this._top.Util.__classListToClassString(spanClassList), style: spanStyle });
            }
        }
    }, {
        key: 'createCustomMenu',
        value: function createCustomMenu() {
            if (this.state.custommenu) {
                var divClassList = ['tab_custommenu', this.tabClassName];
                return React.createElement(
                    'div',
                    { ref: this.setCustomMenuRef, className: this._top.Util.__classListToClassString(divClassList) },
                    React.createElement(
                        'ul',
                        null,
                        this.createCustomMenuItem()
                    )
                );
            }
        }
    }, {
        key: 'createCustomMenuItem',
        value: function createCustomMenuItem() {
            var _this3 = this;

            var customMenu = this.state.custommenu;
            var liClassList = ['custommenu_item', this.tabClassName];
            var list = customMenu.map(function (item) {
                var listKey = 'menu_' + item.text;
                return React.createElement(
                    'li',
                    { key: listKey, ref: _this3.setCustomMenuItemRef, className: _this3._top.Util.__classListToClassString(liClassList) },
                    item.text
                );
            });
            return list;
        }
    }, {
        key: 'createPaginationPre',
        value: function createPaginationPre() {
            if (this.state.paginate === true) {
                var tdClassList = ['top-tablayout-tab-wrapper', 'top-tablayout-tab-btn', this.tabClassName];
                var tdStyle = {
                    display: 'none'
                };
                var divClassList = ['top-tablayout-prev', this.tabClassName];
                var spanClassList = ['list', this.tabClassName];
                var spanStyle = {
                    marginLeft: '-8px'
                };
                return React.createElement(
                    'td',
                    { ref: this.setPagePrevRef, className: this._top.Util.__classListToClassString(tdClassList), style: tdStyle, key: 'paginate_pre' },
                    React.createElement(
                        'div',
                        { className: this._top.Util.__classListToClassString(divClassList) },
                        React.createElement('span', { className: this._top.Util.__classListToClassString(spanClassList), style: spanStyle })
                    )
                );
            }
        }
    }, {
        key: 'createPaginationNext',
        value: function createPaginationNext() {
            if (this.state.paginate === true) {
                var tdClassList = ['top-tablayout-tab-wrapper', 'top-tablayout-tab-btn', this.tabClassName];
                var tdStyle = {
                    display: 'none'
                };
                var divClassList = ['top-tablayout-next', this.tabClassName];
                var spanClassList = ['list', this.tabClassName];
                var spanStyle = {
                    marginLeft: '8px'
                };
                return React.createElement(
                    'td',
                    { ref: this.setPageNextRef, className: this._top.Util.__classListToClassString(tdClassList), style: tdStyle, key: 'paginate_next' },
                    React.createElement(
                        'div',
                        { className: this._top.Util.__classListToClassString(divClassList) },
                        React.createElement('span', { className: this._top.Util.__classListToClassString(spanClassList), style: spanStyle })
                    )
                );
            }
        }
    }, {
        key: 'createPaginationPlus',
        value: function createPaginationPlus() {
            if (this.state.paginate === true) {
                var tdClassList = ['top-tablayout-tab-wrapper', this.tabClassName];
                var divClassList = ['top-tablayout-plus', this.tabClassName];
                var spanStyle = {
                    marginLeft: '-8px'
                };
                if (this.state.plusbutton === false) spanStyle.display = 'none';
                return React.createElement(
                    'td',
                    { key: 'paginate_plus', ref: this.setTabPlusRef, className: this._top.Util.__classListToClassString(tdClassList) },
                    React.createElement(
                        'div',
                        { className: this._top.Util.__classListToClassString(divClassList) },
                        React.createElement('span', { style: spanStyle })
                    )
                );
            }
        }
    }, {
        key: 'createLastTd',
        value: function createLastTd() {
            var tdId = this.state.id + '_right';
            var tdClassList = ['top-tablayout-tab', this.tabClassName, 'last'];
            return React.createElement(
                'td',
                { id: tdId, width: '100%' },
                React.createElement('div', { className: this._top.Util.__classListToClassString(tdClassList) })
            );
        }
    }, {
        key: 'createPaginationPrevContainer',
        value: function createPaginationPrevContainer() {
            if (this.state.paginate === true) {
                var divClassList_1 = ['tab_paginate-prev-container', this.tabClassName];
                var divClassList_2 = ['tap_paginate-prev-list', this.tabClassName];
                var divStyle = {
                    display: 'none'
                };
                return React.createElement(
                    'div',
                    { className: this._top.Util.__classListToClassString(divClassList_1) },
                    React.createElement('div', { ref: this.setPagePrevListRef, className: this._top.Util.__classListToClassString(divClassList_2), style: divStyle })
                );
            }
        }
    }, {
        key: 'createPaginateContainer',
        value: function createPaginateContainer() {
            if (this.state.paginate === true) {
                var divClassList_1 = ['tab_paginate-container', this.tabClassName];
                var divClassList_2 = ['tap_paginate-next-list', this.tabClassName];
                var divStyle = {
                    display: 'none'
                };
                return React.createElement(
                    'div',
                    { className: this._top.Util.__classListToClassString(divClassList_1) },
                    React.createElement('div', { ref: this.setPageNextListRef, className: this._top.Util.__classListToClassString(divClassList_2), style: divStyle })
                );
            }
        }
    }, {
        key: '__updateSelected',
        value: function __updateSelected() {
            this.reRenderChildFlag = true;
        }
    }, {
        key: '__updateIdeSelected',
        value: function __updateIdeSelected() {
            this.reRenderChildFlag = true;
        }
    }, {
        key: '__reRenderChild',
        value: function __reRenderChild() {
            this.layoutChild.forEach(function (c) {
                c.forceUpdate();
            });
        }
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this4 = this;

            if (children) {
                var selectedIndex = this.getSelectedIndex();
                children = React.Children.map(children, function (child, index) {
                    var wrapperStyle = {};
                    if (index !== selectedIndex) wrapperStyle.display = 'none';
                    return React.createElement('div', { style: wrapperStyle }, React.cloneElement(child, {
                        index: index,
                        layoutParent: _this4,
                        layoutFunction: function layoutFunction() {
                            if (this.state.layoutWidth === 'match_parent') this.__updateLayoutWidth('100%');
                            if (this.state.layoutHeight === 'match_parent') this.__updateLayoutHeight('100%');
                        }
                    }));
                });
            }
            return children;
        }
    }, {
        key: '__render',
        value: function __render() {
            this.checkTabClassName();
            var containerClassName = 'top-tablayout-container ' + this.tabClassName;
            var childContainerStyle = {};
            if (this.dom.container) {
                childContainerStyle.height = 'calc(100% - ' + this.dom.container.clientHeight + 'px)';
            } else {
                childContainerStyle.height = 'calc(100% - 34px)';
            }
            return React.createElement(
                'top-tablayout',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, name: this.state.name, ref: this.setRootRef, className: 'top-tablayout-root', style: this.topStyle },
                    React.createElement(
                        'div',
                        { id: this.state.id, ref: this.setContainerRef, className: containerClassName },
                        this.createPaginationPrevContainer(),
                        this.createPaginateContainer(),
                        this.createCustomMenu(),
                        this.createTab()
                    ),
                    React.createElement(
                        'div',
                        { className: 'top-tablayout-child-container', style: childContainerStyle },
                        this.__setWrapperStyle(this.state.children)
                    )
                )
            );
        }
    }, {
        key: 'addWidget',
        value: function addWidget(widget, i) {
            this.setState(function (state, props) {
                var changedtabs = [];
                Object.assign(changedtabs, state.tabs);
                if (typeof i === "number") changedtabs.splice(i, 0, []);else changedtabs.push([]);
                return {
                    tabs: changedtabs
                };
            });
            _get(TopTablayoutUI.prototype.__proto__ || Object.getPrototypeOf(TopTablayoutUI.prototype), 'addWidget', this).call(this, widget, i);
        }
    }, {
        key: 'removeWidget',
        value: function removeWidget(widget) {
            if (widget.getReactElement()) {
                var index = this.state.children.indexOf(widget.getReactElement());
            } else if (widget.getTemplate()) {
                var index = this.layoutChild.indexOf(widget.getTemplate());
            }
            _get(TopTablayoutUI.prototype.__proto__ || Object.getPrototypeOf(TopTablayoutUI.prototype), 'removeWidget', this).call(this, widget);
            this.setState(function (state, props) {
                var changedtabs = [];
                Object.assign(changedtabs, state.tabs);
                if (index > -1) {
                    changedtabs.splice(index, 1);
                }
                return {
                    tabs: changedtabs
                };
            });
        }
    }]);

    return TopTablayoutUI;
}(TopLayoutBehavior);

var TopTablayout = function (_TopTablayoutUI) {
    _inherits(TopTablayout, _TopTablayoutUI);

    function TopTablayout(props) {
        _classCallCheck(this, TopTablayout);

        var _this5 = _possibleConstructorReturn(this, (TopTablayout.__proto__ || Object.getPrototypeOf(TopTablayout)).call(this, props));

        _this5.closedTabId = null;

        _this5.tabPlusCount = 0;
        return _this5;
    }

    _createClass(TopTablayout, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopTablayout.prototype.__proto__ || Object.getPrototypeOf(TopTablayout.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent();
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {
            _get(TopTablayout.prototype.__proto__ || Object.getPrototypeOf(TopTablayout.prototype), '__componentDidUpdate', this).call(this);

            this.__bindEvent();
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            var _this6 = this;

            for (var i = 0; i < this.dom.td.length; i++) {
                this._top.EventManager.on('click', this.dom.td[i], this.onClickTab.bind(this));
                this._top.EventManager.on('keydown', this.dom.td[i], this.onKeydownTab.bind(this));
                if (this.state.contextCustomMenu) {
                    this._top.EventManager.on('contextmenu', this.dom.td[i], this.openCustomMenuList.bind(this));
                } else {
                    this._top.EventManager.on('click', this.dom.customMenuButton[i], this.openCustomMenuList.bind(this));
                }
                this._top.EventManager.on('click', this.dom.closeButton[i], this.onClickCloseButton.bind(this));
            }
            for (var j = 0; j < this.dom.customMenuItem.length; j++) {
                this._top.EventManager.on('click', this.dom.customMenuItem[j], this.onSelectCustomMenu.bind(this));
            }

            if (this.state.contextCustomMenu) {
                if (!this.customMenuToggleFunction) {
                    this.customMenuToggleFunction = function () {
                        _this6.dom.customMenu.children[0].style.display = 'none';
                    };
                    this._top.EventManager.on('click', document, this.customMenuToggleFunction.bind(this));
                } else {
                    this._top.EventManager.off('click', document, this.customMenuToggleFunction.bind(this));
                }
            }

            this._top.EventManager.on('click', this.dom.pageNext, this.onClickPaginateButton.bind(this));
            this._top.EventManager.on('click', this.dom.pagePrev, this.onClickPaginateButton.bind(this));
            this._top.EventManager.on('click', this.dom.tabPlus, this.onClickPlusButton.bind(this));
        }
    }, {
        key: '__initEventInternal',
        value: function __initEventInternal() {
            this.__addEventByAttr('tabchange');
            this.__addEventByAttr('tabclick');
            this.__addEventByAttr('close');
            this.__addEventByAttr('plusclick');
        }
    }, {
        key: 'onClickTab',
        value: function onClickTab(event) {
            if (event.target.classList.contains('tab-disabled')) return;
            if (this.state.selected !== event.target.id) {
                this.__dispatchEvent(new Event("tabchange"));
            }
            this.setState({
                selected: event.target.id
            });
            this.__dispatchEvent(new Event("tabclick"));
        }
    }, {
        key: 'onKeydownTab',
        value: function onKeydownTab(event) {
            if (event.keyCode === 13 || event.keyCode === 32) {
                this.onClickTab(event);
            }
        }
    }, {
        key: 'onClickPaginateButton',
        value: function onClickPaginateButton(e) {
            if (e.srcElement.classList.contains('top-tablayout-prev')) {
                this.openPaginateTabList(this.dom.pagePrevList, e, true);
            } else {
                this.openPaginateTabList(this.dom.pageNextList, e, true);
            }
            e.stopPropagation();
        }
    }, {
        key: 'openPaginateTabList',
        value: function openPaginateTabList(list, event, flag) {
            if (list.style.display != 'none') {
                list.style.display = 'none';
            } else {
                list.style.display = 'block';
            }
            if (flag === true) {
                var target = event.srcElement === 'SPAN' ? event.srcElement.parentNode : event.srcElement;
                var left = target.offsetLeft;
                var top = target.offsetTop;
                list.style.left = left + 'px';
                list.style.top = top + target.clientHeight + 'px';
            }
        }
    }, {
        key: 'onClickPlusButton',
        value: function onClickPlusButton(event) {
            if (this.state.onPlusclick) {
                this.__dispatchEvent(new Event("plusclick"));
            } else {
                this.tabPlus();
            }
            event.stopPropagation();
        }
    }, {
        key: 'tabPlus',
        value: function tabPlus(tabObj, tabIndex) {
            var newTab = void 0;
            var changedTabs = [];
            if (tabObj) {
                newTab = tabObj;
            } else {
                newTab = {
                    id: "new_" + this.tabPlusCount,
                    text: "new_" + this.tabPlusCount
                };
                this.tabPlusCount++;
            }
            Object.assign(changedTabs, this.state.tabs);
            if (tabObj && tabIndex) {
                changedTabs.splice(tabIndex, 0, newTab);
            } else {
                changedTabs.push(newTab);
            }
            this.objTabs[newTab.id] = newTab;
            this.onChangeTabLength = true;
            this.reRenderChildFlag = true;
            this.setState({
                tabs: changedTabs,
                selected: newTab.id
            });
        }
    }, {
        key: 'openCustomMenuList',
        value: function openCustomMenuList(event) {
            var customMenuList = this.dom.customMenu;
            if (!customMenuList) {
                return;
            }

            var container = this.dom.container;
            var containerLeft = $(container).offset().left || 0;
            var menuLeft = $(event.target).offset().left;
            if (customMenuList.children[0].style.display !== 'block') {
                if (!this.state.contextCustomMenu) {
                    customMenuList.style.left = menuLeft - containerLeft + 'px';
                } else {
                    customMenuList.style.left = event.clientX - containerLeft + 'px';
                }
                customMenuList.children[0].style.display = 'block';
            } else {
                customMenuList.children[0].style.display = 'none';
            }
            this.currentTabText = event.target.parentNode.innerText;
            this.currentTab = event.target.parentNode.parentNode;
        }
    }, {
        key: 'onSelectCustomMenu',
        value: function onSelectCustomMenu(event) {
            var callback = void 0;
            var thisTab = void 0;
            for (var i = 0; i < this.state.custommenu.length; i++) {
                if (this.state.custommenu[i].text === event.target.innerText) {
                    if (typeof this.state.custommenu[i].onClick === 'string') {
                        callback = this._top.Util.namespace(this.state.custommenu[i].onClick, this);
                    } else {
                        callback = this.state.custommenu[i].onClick;
                    }
                    for (var j = 0; j < this.state.tabs.length; j++) {
                        if (this.state.tabs[j].text === this.currentTabText) {
                            thisTab = this.state.tabs[j];
                            break;
                        }
                    }
                    if (callback) {
                        callback(this.currentTab, thisTab);
                    }
                    this.currentTabText = undefined;
                    this.currentTab = undefined;
                    this.dom.customMenu.children[0].style.display = 'none';
                    break;
                }
            }
        }
    }, {
        key: 'onClickCloseButton',
        value: function onClickCloseButton(event) {
            this.closedTabId = event.target.id;
            var index = this.closedTabId.split('_closeBtn_')[1];
            this.removeWidget(this._top.Dom.selectById(this.state.children[index].props.id));
            var detail = {
                'id': this.closedTabId
            };
            this.__dispatchEvent(new Event("close", detail));
        }
    }]);

    return TopTablayout;
}(TopTablayoutUI);

TopTablayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {
    tabs: {
        type: Array,
        default: []
    },

    selected: {
        type: String
    },
    ideSelected: {
        type: [Number, String]
    },

    onSelect: {
        type: Function
    },

    paginate: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    onTabchange: {
        type: Function
    },

    onTabclick: {
        type: Function
    },

    onPlusclick: {
        type: Function
    },

    onClose: {
        type: Function
    },

    custommenu: {
        type: Array
    },

    tabTooltip: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    plusbutton: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    menuFocus: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    contextCustomMenu: {
        type: Boolean,
        options: [true, false],
        default: false
    },

    beforeTabFocus: {
        type: Boolean,
        options: [true, false],
        default: false
    }
});

TopTablayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-tablayout'
});

TopTablayout.propConfigs = Object.assign({}, TopTablayoutUI.propConfigs, {});

TopTablayout.defaultProps = Object.assign({}, TopTablayoutUI.defaultProps, {});

(function () {

    var TablayoutCreator = function TablayoutCreator(topInstance) {
        Tablayout.prototype = Object.create(topInstance.Widget.Layout.prototype);
        Tablayout.prototype.constructor = Tablayout;

        function Tablayout(element, props, childs) {
            topInstance.Widget.Layout.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-tablayout']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-tablayout'], props, childs));
            }
        }

        Tablayout.create = function (element, props, childs) {
            return new Tablayout(element, props, childs);
        };

        Tablayout.prototype.addTab = function (tab, index) {
            this.getTemplate().tabPlus(tab, index);
        };

        return Tablayout;
    };

    getTopUI().Widget.Layout.Tablayout = TablayoutCreator(getTopUI());
    getTop().Widget.Layout.Tablayout = TablayoutCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ContainerContext = React.createContext({});

var TopTableviewUI = function (_TopContainerBehavior) {
  _inherits(TopTableviewUI, _TopContainerBehavior);

  function TopTableviewUI(props) {
    _classCallCheck(this, TopTableviewUI);

    var _this = _possibleConstructorReturn(this, (TopTableviewUI.__proto__ || Object.getPrototypeOf(TopTableviewUI)).call(this, props));

    _this.__filterChange = function (event, keyword, accessor) {
      if (keyword != "") {
        var originData = _this.tableData.originData;

        _this.tableData.data = originData.filter(function (obj) {
          return obj[accessor] == keyword;
        });
        _this.tableData.filterConnect = true;
      }
      _this.forceUpdate();
    };

    _this.__sortChange = function (event, di, accessor) {
      var data = _this.tableData.data;

      if (di == 1) {
        data.sort(function (obj1, obj2) {
          if (obj1[accessor] > obj2[accessor]) {
            return 1;
          } else {
            return -1;
          }
        });
      }

      if (di == 2) {
        data.sort(function (obj1, obj2) {
          if (obj1[accessor] < obj2[accessor]) {
            return 1;
          } else {
            return -1;
          }
        });
      }
      _this.forceUpdate();
    };

    _this.__checkHeeadtoBody = function (event, dataIndex, rowIndex) {
      var bool = event.target.checked;
      _this.tableData.headeventinfo.forEach(function (obj) {
        obj.forEach(function (info) {
          info.checked = bool;
        });
      });
      _this.tableData.eventinfo.forEach(function (obj) {
        obj.forEach(function (info) {
          info.checked = bool;
        });
      });
      _this.forceUpdate();
    };

    _this.__checkBodytoHead = function (event, dataIndex, rowIndex) {
      var bool = event.target.checked;
      _this.tableData.eventinfo[dataIndex][rowIndex].checked = bool;
      var boolevery = _this.tableData.eventinfo.every(function (obj) {
        return obj.every(function (info) {
          return info.checked;
        });
      });
      _this.tableData.headeventinfo.forEach(function (obj) {
        obj.forEach(function (info) {
          info.checked = boolevery;
        });
      });
      _this.forceUpdate();
    };

    _this.__selectBody = function (event, dataIndex, rowIndex) {
      if (event.shiftKey) {
        if (_this.lastSelectedIndex > dataIndex) {
          var from = dataIndex;
          var to = _this.lastSelectedIndex;
        } else {
          var to = dataIndex;
          var from = _this.lastSelectedIndex;
        }
        _this.tableData.eventinfo.forEach(function (data, index) {
          if (index >= from && index <= to) {
            return data.forEach(function (r) {
              return r.selected = true;
            });
          } else {
            return data.forEach(function (r) {
              return r.selected = false;
            });
          }
        });
      } else if (event.ctrlKey) {} else {
        _this.tableData.eventinfo.forEach(function (obj) {
          obj.forEach(function (r) {
            return r.selected = false;
          });
        });
      }
      _this.lastSelectedIndex = dataIndex;
      _this.tableData.eventinfo[dataIndex].forEach(function (r) {
        return r.selected = true;
      });
      _this.forceUpdate();
    };

    _this.scrollhandler = function () {
      if (_this.thead) {
        _this.thead.Conbody.children[0].style.right = event.srcElement.scrollLeft + "px";
        _this.thead.setState({ from2: _this.tbody.from2 });
      }
      if (_this.fixedbody) {
        _this.fixedbody.Conbody.children[0].style.bottom = event.srcElement.scrollTop + "px";
        _this.fixedbody.setState({ from: _this.tbody.from });
      }
      if (_this.state.columnResize) {
        _this.resizerbox.box.style.right = event.srcElement.scrollLeft + "px";
      }
    };

    _this.dragStart = function () {
      _this.originX = event.x;
    };

    _this.dragOver = function () {};

    _this.dragEnd = function (cidx) {
      var delta = event.x - _this.originX;
      cidx = cidx + parseInt(_this.state.fixedPivotNum);
      var width = parseInt(_this.state.columns[cidx].width) || 120;
      var newbodyWidth = _this.state.columns.sclie;
      _this.state.columns[cidx].width = width + delta < 10 ? 10 : width + delta + "px";

      var newcolnum = _this.thead.calcolnum(parseInt(_this.thead.state["viewport-width"]));
      var newto2 = _this.thead.state.to2 + newcolnum + 1;
      _this.forceUpdate();
    };

    _this.tableData = {
      sortStates: {},
      headColumnOption: [],
      headerrowinfo: [],
      headercolumninfo: [],
      headerdata: [{}],

      columnOption: [],
      rowinfo: [],
      columninfo: [],
      data: [{}],

      checkHeeadtoBody: _this.__checkHeeadtoBody,
      checkBodytoHead: _this.__checkBodytoHead,
      selectBody: _this.__selectBody,

      sortChange: _this.__sortChange,

      filterChange: _this.__filterChange,
      filterConnect: false,

      _top: _this._top,
      _root: _this,
      originData: _this.state.items
    };
    _this.mountData = {
      flag: false
    };
    _this.state.pageLength = parseInt(_this.props.pageLength);
    _this.__makeEventArray();
    _this.v5 = false;
    return _this;
  }

  _createClass(TopTableviewUI, [{
    key: "__updateHeaderSet",
    value: function __updateHeaderSet() {
      this.__makeEventArray();
    }
  }, {
    key: "__updateBodySet",
    value: function __updateBodySet() {
      this.__makeEventArray();
    }
  }, {
    key: "__componentDidMount",
    value: function __componentDidMount() {}
  }, {
    key: "__componentDidUpdate",
    value: function __componentDidUpdate() {}
  }, {
    key: "__componentWillUpdate",
    value: function __componentWillUpdate() {}
  }, {
    key: "__componentWillUnmount",
    value: function __componentWillUnmount() {}
  }, {
    key: "__makeEventArray",
    value: function __makeEventArray() {
      var _this2 = this;

      this.tableData.eventinfo = this.state.items.map(function (rowitem, rowitemindex) {
        return _this2.state.bodySet.map(function (data, index) {
          return {
            selected: false,
            checked: false
          };
        });
      });

      this.tableData.headeventinfo = [{}].map(function (rowitem, rowitemindex) {
        return _this2.state.headerSet.map(function (data, index) {
          return {
            selected: false,
            checked: false
          };
        });
      });
    }
  }, {
    key: "__initProperties",
    value: function __initProperties() {
      var _this3 = this;

      if (this.tableData.filterConnect) {
        this.tableData.filterConnect = false;
      } else if (typeof this.state.items == "String") {
        this.tableData.data = this._top.Util.namespace(this.state.items, this);
      } else {
        this.tableData.data = this.state.items, this;
      }

      var _state = this.state,
          headerSet = _state.headerSet,
          columns = _state.columns,
          bodySet = _state.bodySet;


      var pivot = ~~this.state.fixedPivotNum;
      var pageStartNum = this.state.pageStartNum;
      if (this.state.pageLength > 0) {
        var pageEndNum = pageStartNum + this.state.pageLength;
      } else {
        var pageEndNum = this.tableData.data.length;
      }

      this.state.pagepointer = this.tableData.data.slice(pageStartNum, pageEndNum);

      var toppos = 0;
      this.tableData.headerrowinfo = this.state.headerdata.map(function (headrowitem, headrowitemindex) {
        return headerSet.map(function (obj, index) {
          var height = parseInt(obj.rowHeight) ? parseInt(obj.rowHeight) : 30;
          var top = toppos;
          var bottom = top + height;
          toppos += height;
          return {
            vindex: headrowitemindex,
            dataIndex: headrowitemindex,
            height: height,
            top: top,
            bottom: bottom
          };
        });
      });

      var colspanCount = 0;

      this.tableData.headercolumnfixed = [];
      this.tableData.headercolumnflexed = [];
      this.headerspaned = new Array(headerSet.length).fill(null).map(function () {
        return new Array(columns.length).fill(0);
      });
      for (var headrowitemindex = 0; headrowitemindex < headerSet.length; headrowitemindex++) {
        this.tableData.headercolumnfixed.push([]);
        this.tableData.headercolumnflexed.push([]);
        var headrowitem = headerSet[headrowitemindex].header;
        var leftpos = 0;
        var point = 0;
        for (var index = 0; index < columns.length; index++) {
          if (this.headerspaned[headrowitemindex][index]) {
            var columnitem = { spaned: true, colspan: 1, rowspan: 1 };
          } else {
            var columnitem = headrowitem[point] || {};
            point++;
          }
          var left = leftpos;
          var headText = columnitem.headText || '';
          var colspan = columnitem.colspan || 1;
          var rowspan = columnitem.rowspan || 1;
          var visible = columnitem.visible || "visible";
          var accessor = columnitem.accessor || '';
          var sort = columnitem.sort || false;
          var filter = columnitem.filter || false;
          var json = columnitem.children || '';
          var width = ~~parseInt(columns[index].width);
          for (var i = 0; i < rowspan; i++) {
            for (var j = 0; j < colspan; j++) {
              if (i == 0 && j == 0) {
                continue;
              }
              this.headerspaned[headrowitemindex + i][index + j] = 1;
            }
          }
          var right = left + width;
          leftpos += width;
          var temp = {
            width: width,
            left: left,
            right: right,
            colspan: colspan,
            rowspan: rowspan,
            visible: "visible",
            headText: headText,
            accessor: accessor,
            sort: sort,
            filter: filter,
            json: this.v5 ? json : null,
            _ref: null };
          if (index < pivot) {
            this.tableData.headercolumnfixed[headrowitemindex].push(temp);
            if (index == pivot - 1) {
              leftpos = 0;
            }
          } else {
            this.tableData.headercolumnflexed[headrowitemindex].push(temp);
          }
        }
      }

      toppos = 0;
      this.tableData.rowinfo = this.state.pagepointer.map(function (rowitem, rowitemindex) {
        return bodySet.map(function (obj, index) {
          var height = parseInt(obj.rowHeight) ? parseInt(obj.rowHeight) : 30;
          var top = toppos;
          var bottom = top + height;
          toppos += height;
          return {
            vindex: rowitemindex,
            dataIndex: rowitemindex + _this3.state.pageStartNum,
            height: height,
            top: top,
            bottom: bottom
          };
        });
      });

      this.tableData.columnfixed = [];
      this.tableData.columnflexed = [];
      this.bodyspaned = new Array(bodySet.length).fill(null).map(function () {
        return new Array(columns.length).fill(0);
      });
      colspanCount = 0;
      for (var rowitemindex = 0; rowitemindex < bodySet.length; rowitemindex++) {
        this.tableData.columnfixed.push([]);
        this.tableData.columnflexed.push([]);
        var rowitem = bodySet[rowitemindex].body;
        var _leftpos = 0;
        var _point = 0;
        for (var _index = 0; _index < columns.length; _index++) {
          if (this.bodyspaned[rowitemindex][_index]) {
            var columnitem = { spaned: true, colspan: 1, rowspan: 1 };
          } else {
            var columnitem = rowitem[_point] || {};
            _point++;
          }
          var _left = _leftpos;
          var _colspan = columnitem.colspan || 1;
          var _rowspan = columnitem.rowspan || 1;
          var _visible = columnitem.visible || "visible";
          var _accessor = columnitem.accessor || '';
          var _json = columnitem.children || '';
          var _width = ~~parseInt(columns[_index].width);
          for (var _i = 0; _i < _rowspan; _i++) {
            for (var _j = 0; _j < _colspan; _j++) {
              if (_i == 0 && _j == 0) {
                continue;
              }
              this.bodyspaned[rowitemindex + _i][_index + _j] = 1;
            }
          }
          var _right = _left + _width;
          _leftpos += _width;
          var _temp = {
            width: _width,
            left: _left,
            right: _right,
            colspan: _colspan,
            rowspan: _rowspan,
            visible: "visible",
            accessor: _accessor,
            json: this.v5 ? _json : null,
            _ref: null };
          if (_index < pivot) {
            this.tableData.columnfixed[rowitemindex].push(_temp);
            if (_index == pivot - 1) {
              _leftpos = 0;
            }
          } else {
            this.tableData.columnflexed[rowitemindex].push(_temp);
          }
        }
      }
    }
  }, {
    key: "gotoPage",
    value: function gotoPage(pagenum) {
      if (!~~pagenum) {
        return;
      }
      var newPSN = (pagenum - 1) * this.state.pageLength;
      this.setState({ pageStartNum: newPSN });
    }
  }, {
    key: "__render",
    value: function __render() {
      var _this4 = this;

      this.__initProperties();var _state2 = this.state,
          overscan = _state2.overscan,
          headerdata = _state2.headerdata,
          fixedPivotNum = _state2.fixedPivotNum,
          pagepointer = _state2.pagepointer,
          layoutWidth = _state2.layoutWidth,
          layoutHeight = _state2.layoutHeight,
          id = _state2.id,
          headcellrenderer = _state2.headcellrenderer,
          cellrenderer = _state2.cellrenderer;


      var fix_width = 0;
      if (fixedPivotNum) {
        fix_width = this.tableData.headercolumnfixed[0][this.tableData.headercolumnfixed[0].length - 1].right + 5;
      }
      var flex_width = layoutWidth == "match_parent" ? "100%" : parseInt(layoutWidth) - fix_width;
      var head_height = this.state.headerSet.reduce(function (acc, cur, index) {
        return acc + parseInt(cur.rowHeight);
      }, 0);
      var body_height = layoutHeight == "match_parent" ? "100%" : parseInt(layoutHeight) - head_height;
      var resizerposition = {
        left: fix_width + "px",
        position: "relative"
      };

      var isEmpty = this.tableData.data.length == 0 ? true : false;

      return React.createElement(
        "top-tableview",
        { id: id, ref: this.setTopRef, "class": this.makeTopTagClassString, style: this.topTagStyle },
        React.createElement(
          "div",
          {
            id: id,
            ref: this.setRootRef,
            className: "top-tableview-root",
            style: this.topStyle
          },
          React.createElement(
            ContainerContext.Provider,
            { value: this.tableData },
            React.createElement(
              "div",
              { className: "table_wrapper" },
              React.createElement(
                "div",
                { className: "header_wrapper" },
                this.v5 && React.createElement(
                  "div",
                  { style: resizerposition },
                  React.createElement(Resizerbox, {
                    left: fix_width,
                    columninfo: this.tableData.headercolumnflexed[this.tableData.headercolumnflexed.length - 1],
                    height: head_height,
                    dragStart: this.dragStart,
                    dragOver: this.dragOver,
                    dragEnd: this.dragEnd,
                    ref: function ref(_ref) {
                      _this4.resizerbox = _ref;
                    }
                  })
                ),
                fixedPivotNum > 0 && React.createElement(ContainerBody, {
                  isHead: true,
                  cellrenderer: headcellrenderer,
                  columninfo: this.tableData.headercolumnfixed,
                  rowinfo: this.tableData.headerrowinfo,
                  event: this.tableData.headeventinfo,
                  "viewport-height": head_height,
                  "viewport-width": fix_width,
                  data: headerdata,
                  "data-role": "tableview",
                  "data-inset": "true",
                  className: "top-thead top-tableview-container fixframe",
                  "item-drag": false,
                  overscan: overscan
                }),
                React.createElement(ContainerBody, {
                  isHead: true,
                  cellrenderer: headcellrenderer,
                  columninfo: this.tableData.headercolumnflexed,
                  rowinfo: this.tableData.headerrowinfo,
                  event: this.tableData.headeventinfo,
                  "viewport-height": head_height,
                  "viewport-width": flex_width,
                  data: headerdata,
                  "data-role": "tableview",
                  "data-inset": "true",
                  className: "top-thead top-tableview-container flexframe",
                  "item-drag": false,
                  pivot: fixedPivotNum,
                  ref: function ref(_ref2) {
                    _this4.thead = _ref2;
                  },
                  overscan: overscan
                })
              ),
              React.createElement(
                "div",
                { className: "body_wrapper" },
                this.state.fixedPivotNum > 0 && React.createElement(ContainerBody, {
                  isHead: false,
                  isTable: true,
                  isEmpty: isEmpty,
                  cellrenderer: cellrenderer,
                  columninfo: this.tableData.columnfixed,
                  rowinfo: this.tableData.rowinfo,
                  event: this.tableData.eventinfo,
                  "viewport-height": body_height,
                  "viewport-width": fix_width,
                  data: pagepointer,
                  "data-role": "tableview",
                  "data-inset": "true",
                  className: "top-tbody top-tableview-container fixframe",
                  "item-drag": true,
                  ref: function ref(_ref3) {
                    _this4.fixedbody = _ref3;
                  },
                  overscan: overscan
                }),
                React.createElement(ContainerBody, {
                  isHead: false,
                  isTable: true,
                  isEmpty: isEmpty,
                  cellrenderer: cellrenderer,
                  columninfo: this.tableData.columnflexed,
                  rowinfo: this.tableData.rowinfo,
                  event: this.tableData.eventinfo,
                  "viewport-height": body_height,
                  "viewport-width": flex_width,
                  data: pagepointer,
                  "data-role": "tableview",
                  "data-inset": "true",
                  className: "top-tbody top-tableview-container flexframe",
                  "item-drag": true,
                  pivot: fixedPivotNum,
                  ref: function ref(_ref4) {
                    _this4.tbody = _ref4;
                  },
                  overscan: overscan,
                  _top: this._top,
                  sync: this.scrollhandler
                })
              )
            )
          )
        )
      );
    }
  }]);

  return TopTableviewUI;
}(TopContainerBehavior);

TopTableviewUI.propConfigs = Object.assign({}, TopContainerBehavior.propConfigs, {
  overscan: {
    type: Number,
    default: 2
  },
  headerSet: {
    type: Array,
    default: undefined
  },
  bodySet: {
    type: Array,
    default: undefined
  },
  columns: {
    type: Array,
    default: undefined
  },
  items: {
    type: Array,
    default: []
  },

  cellrenderer: {
    type: Function,
    default: null
  },

  headcellrenderer: {
    type: Function,
    default: null
  },

  paginate: {
    type: Boolean,
    options: [true, false],
    default: false
  },

  pageLength: {
    type: Number,
    default: -1
  },

  onEmpty: {
    type: Function
  },

  sortable: {
    type: Boolean,
    options: [true, false],
    default: false
  },

  columnReorder: {
    type: Boolean,
    options: [true, false],
    default: false
  },

  columnResize: {
    type: Boolean,
    options: [true, false],
    default: false
  },

  headColumnOption: {
    type: Array,
    default: undefined
  },

  headRowOption: {
    type: Array,
    default: undefined
  },

  columnOption: {
    type: Array,
    default: undefined
  },

  rowOption: {
    type: Array,
    default: undefined
  },

  emptyMessage: {
    type: String,
    default: "No data available in table"
  },

  selectType: {
    type: String,
    options: ["row", "cell"],
    default: "row"
  },

  itemDrag: {
    type: Boolean,
    options: [true, false],
    default: false
  },
  onRowclick: {
    type: Function
  },

  onRowdblclick: {
    type: Function
  },

  onRowcontextmenu: {
    type: Function
  },

  onCellclick: {
    type: Function
  },

  onCelldblclick: {
    type: Function
  },

  onCellcontextmenu: {
    type: Function
  },

  onRowcheck: {
    type: Function
  },

  onHeadercheck: {
    type: Function
  },

  onUpdate: {
    type: Function
  },

  onHeaderclick: {
    type: Function
  },

  onHeaderdbclick: {
    type: Function
  },

  storeColumn: {
    type: Boolean,
    options: [true, false],
    default: false
  },

  storeKey: {
    type: Boolean,
    options: [true, false],
    default: false
  },

  headerContextMenu: {
    type: Boolean,
    options: [true, false],
    default: false
  },

  multiSortable: {
    type: Boolean,
    options: [true, false],
    default: false
  }
});

TopTableviewUI.defaultProps = Object.assign({}, TopContainerBehavior.defaultProps, {
  tagName: "top-tableview",
  pageStartNum: 0,
  headerdata: [{}],
  fixedPivotNum: 0,
  layoutVerticalAlignment: 'top',
  verticalScroll: true,
  horizontalScroll: false,
  overscan: 2
});

var TopTableview = function (_TopTableviewUI) {
  _inherits(TopTableview, _TopTableviewUI);

  function TopTableview(props) {
    _classCallCheck(this, TopTableview);

    var _this5 = _possibleConstructorReturn(this, (TopTableview.__proto__ || Object.getPrototypeOf(TopTableview)).call(this, props));

    _this5.v5 = true;
    return _this5;
  }

  return TopTableview;
}(TopTableviewUI);

TopTableview.defaultProps = Object.assign({}, TopTableviewUI.defaultProps, {});
TopTableview.propConfigs = Object.assign({}, TopTableviewUI.propConfigs, {
  pageLength: {
    type: Number,
    default: -1
  }
});

(function () {
  var TableviewCreator = function TableviewCreator(topInstance) {
    Tableview.prototype = Object.create(topInstance.Widget.Container.prototype);
    Tableview.prototype.constructor = Tableview;

    function Tableview(element, props) {
      topInstance.Widget.Container.apply(this, arguments);
      if (element instanceof topInstance.Render.topWidgets['top-tableview']) {
        this.setTemplate(element);
      } else {
        this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-tableview'], props));
      }
    }
    Tableview.create = function (element, props) {
      return new Tableview(element, props);
    };
    Tableview.prototype.gotoPage = function (pageIndex) {
      this.getTemplate().gotoPage(pageIndex);
    };
    return Tableview;
  };
  getTopUI().Widget.Container.Tableview = TableviewCreator(getTopUI());
  getTop().Widget.Container.Tableview = TableviewCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopTextareaUI = function (_TopMaskBehavior) {
    _inherits(TopTextareaUI, _TopMaskBehavior);

    function TopTextareaUI(props) {
        _classCallCheck(this, TopTextareaUI);

        return _possibleConstructorReturn(this, (TopTextareaUI.__proto__ || Object.getPrototypeOf(TopTextareaUI)).call(this, props));
    }

    _createClass(TopTextareaUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            var _this2 = this;

            var topRootClass = 'top-textarea-root';
            var topDisabled = this.__calculateDerivedDisabled();

            return React.createElement(
                'top-textarea',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement('textarea', { id: this.state.id, ref: this.setRootRef, className: topRootClass, spellCheck: 'false', disabled: topDisabled, rows: this.state.rows, cols: this.state.cols, placeholder: this.state.hint, value: this.state.text, onChange: function onChange(e) {
                        _this2.handleChange(e);
                    }, style: this.topStyle })
            );
        }
    }]);

    return TopTextareaUI;
}(TopMaskBehavior);

var TopTextarea = function (_TopTextareaUI) {
    _inherits(TopTextarea, _TopTextareaUI);

    function TopTextarea() {
        _classCallCheck(this, TopTextarea);

        return _possibleConstructorReturn(this, (TopTextarea.__proto__ || Object.getPrototypeOf(TopTextarea)).apply(this, arguments));
    }

    return TopTextarea;
}(TopTextareaUI);

TopTextareaUI.propConfigs = Object.assign({}, TopMaskBehavior.propConfigs, {
    rows: {
        type: Number,
        default: 5
    },

    cols: {
        type: Number,
        default: 100
    },

    maxBytes: {
        type: Number
    },

    highlight: {
        type: Boolean,
        default: false
    },

    highlightConfig: {
        type: Object
    },

    autosize: {
        type: Boolean,
        default: false
    }
});

TopTextareaUI.defaultProps = Object.assign({}, TopMaskBehavior.defaultProps, {
    tagName: 'top-textarea',
    rows: 5,
    cols: 100
});

TopTextarea.propConfigs = Object.assign({}, TopTextareaUI.propConfigs, {});

TopTextarea.defaultProps = Object.assign({}, TopTextareaUI.defaultProps, {});

(function () {

    var TextareaCreator = function TextareaCreator(topInstance) {
        Textarea.prototype = Object.create(topInstance.Widget.prototype);
        Textarea.prototype.constructor = Textarea;

        function Textarea(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-textarea']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-textarea'], props));
            }
        }

        Textarea.create = function (element, props) {
            return new Textarea(element, props);
        };

        return Textarea;
    };

    getTopUI().Widget.Textarea = TextareaCreator(getTopUI());
    getTop().Widget.Textarea = TextareaCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopTextfieldUI = function (_TopMaskBehavior) {
    _inherits(TopTextfieldUI, _TopMaskBehavior);

    function TopTextfieldUI(props) {
        _classCallCheck(this, TopTextfieldUI);

        return _possibleConstructorReturn(this, (TopTextfieldUI.__proto__ || Object.getPrototypeOf(TopTextfieldUI)).call(this, props));
    }

    _createClass(TopTextfieldUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.__setTitleLineHeight();
            this.__setWrapperWidth();
            this.__setInputWidth();
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {
            this.__setTitleLineHeight();
            this.__setWrapperWidth();
            this.__setInputWidth();
        }
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;

            _get(TopTextfieldUI.prototype.__proto__ || Object.getPrototypeOf(TopTextfieldUI.prototype), '__initDomRef', this).call(this);
            this.dom.title = null;
            this.dom.text = null;
            this.dom.clear = null;
            this.dom.icon = null;
            this.dom.wrapper2 = null;
            this.setTitleRef = function (element) {
                _this2.dom.title = element;
            };
            this.setTextRef = function (element) {
                _this2.dom.text = element;
            };
            this.setClearRef = function (element) {
                _this2.dom.clear = element;
            };
            this.setIconRef = function (element) {
                _this2.dom.icon = element;
            };
            this.setWrapper2Ref = function (element) {
                _this2.dom.wrapper2 = element;
            };
        }
    }, {
        key: '__initialClassname',
        value: function __initialClassname() {
            var classTest = /(in_textfield)|(out_textfield)/g;
            if (!classTest.test(this._top.Util.__classListToClassString(this.userClassList))) {
                this._top.Util.__addClassToClassList(this.userClassList, 'in_textfield');
            }
        }
    }, {
        key: '__setTitleLineHeight',
        value: function __setTitleLineHeight() {
            var label = this.dom.title;
            if (label) {
                label.style.lineHeight = label.offsetHeight + 'px';
            }
        }
    }, {
        key: '__setWrapperWidth',
        value: function __setWrapperWidth() {
            var label = this.dom.title;
            if (label) {
                var titleWidth = label.offsetWidth;
                this.dom.wrapper2.style.width = 'calc(100% - ' + titleWidth + 'px)';
            }
        }
    }, {
        key: '__setInputWidth',
        value: function __setInputWidth() {
            var span = this.dom.icon;
            var button = this.dom.clear;
            var sWidth = 0;
            if (span) {
                sWidth += span.offsetWidth;
            }
            if (button) {
                sWidth += button.offsetWidth;
            }
            if (span || button) {
                this.dom.text.style.width = 'calc(100% - ' + sWidth + 'px)';
            } else {
                this.dom.text.style.width = '';
            }
        }
    }, {
        key: 'handleClear',
        value: function handleClear(e) {
            this.setState({
                text: ''
            });
        }
    }, {
        key: '__render',
        value: function __render() {
            var _this3 = this;

            var topRootClass = 'top-textfield-root';
            var topTextClass = 'top-textfield-text';
            var topIconClass = 'top-textfield-icon';
            var topIconStyle = {};
            var topTitleClass = 'top-textfield-title';
            var topClearStyle = {};
            var topDisabled = this.__calculateDerivedDisabled();

            if (this.state.icon) {
                topIconClass += ' top-textfield-icon ' + this.state.icon;
                topIconStyle['width'] = this.state.textSize;
            }
            if (this.state.clear) {
                topClearStyle['width'] = this.state.textSize;
            }

            return React.createElement(
                'top-textfield',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: topRootClass, style: this.topStyle },
                    React.createElement(
                        'form',
                        { autoComplete: 'off', onSubmit: function onSubmit(e) {
                                e.preventDefault();
                            } },
                        React.createElement(
                            'div',
                            { className: 'top-textfield-wrapper-depth-1' },
                            this.state.title && React.createElement(
                                'label',
                                { ref: this.setTitleRef, className: topTitleClass, disabled: topDisabled },
                                this.state.title
                            ),
                            React.createElement(
                                'div',
                                { ref: this.setWrapper2Ref, className: 'top-textfield-wrapper-depth-2' },
                                React.createElement('input', { ref: this.setTextRef, className: topTextClass, type: this.state.password ? 'password' : 'text', disabled: topDisabled, placeholder: this.state.hint, value: this.state.text, onChange: function onChange(e) {
                                        _this3.handleChange(e);
                                    } }),
                                this.state.clear && React.createElement('button', { ref: this.setClearRef, className: 'top-textfield-clear', type: 'reset', onClick: function onClick(e) {
                                        _this3.handleClear(e);
                                    }, style: topClearStyle }),
                                this.state.icon && React.createElement('span', { ref: this.setIconRef, className: topIconClass, disabled: topDisabled, style: topIconStyle })
                            )
                        )
                    )
                )
            );
        }
    }]);

    return TopTextfieldUI;
}(TopMaskBehavior);

var TopTextfield = function (_TopTextfieldUI) {
    _inherits(TopTextfield, _TopTextfieldUI);

    function TopTextfield() {
        _classCallCheck(this, TopTextfield);

        return _possibleConstructorReturn(this, (TopTextfield.__proto__ || Object.getPrototypeOf(TopTextfield)).apply(this, arguments));
    }

    return TopTextfield;
}(TopTextfieldUI);

TopTextfieldUI.propConfigs = Object.assign({}, TopMaskBehavior.propConfigs, {
    password: {
        type: Boolean,
        default: false
    },

    title: {
        type: String
    },

    icon: {
        type: String
    },

    iconPosition: {
        type: String,
        default: "right"
    },

    onIconclick: {
        type: Function
    },

    clear: {
        type: Boolean,
        default: false
    },

    required: {
        type: Boolean
    },

    onClear: {
        type: String
    },

    titleWidth: {
        type: String,
        default: "auto"
    }
});

TopTextfieldUI.defaultProps = Object.assign({}, TopMaskBehavior.defaultProps, {
    tagName: 'top-textfield'
});

TopTextfield.propConfigs = Object.assign({}, TopTextfieldUI.propConfigs, {});

TopTextfield.defaultProps = Object.assign({}, TopTextfieldUI.defaultProps, {});

(function () {

    var TextfieldCreator = function TextfieldCreator(topInstance) {
        Textfield.prototype = Object.create(topInstance.Widget.prototype);
        Textfield.prototype.constructor = Textfield;

        function Textfield(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-textfield']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-textfield'], props));
            }
        }

        Textfield.create = function (element, props) {
            return new Textfield(element, props);
        };

        return Textfield;
    };

    getTopUI().Widget.Textfield = TextfieldCreator(getTopUI());
    getTop().Widget.Textfield = TextfieldCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopTextviewUI = function (_TopTextBehavior) {
    _inherits(TopTextviewUI, _TopTextBehavior);

    function TopTextviewUI(props) {
        _classCallCheck(this, TopTextviewUI);

        var _this = _possibleConstructorReturn(this, (TopTextviewUI.__proto__ || Object.getPrototypeOf(TopTextviewUI)).call(this, props));

        _this.__updateUrl();
        return _this;
    }

    _createClass(TopTextviewUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__updateUrl',
        value: function __updateUrl() {
            if (this.state.url) {
                this.state.url = this.state.url.startsWith('/') ? 'javascript:getTop().App.routeTo(\"' + this.state.url + '\")' : this.state.url;
            }
        }
    }, {
        key: '__render',
        value: function __render() {

            var topRootClass = 'top-textview-root';
            var topUrlClass = 'top-textview-url';
            if (this.state.multiLine) {
                topRootClass += ' multi-line';
                topUrlClass += ' multi-line';
            }

            return React.createElement(
                'top-textview',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'span',
                    { id: this.state.id, ref: this.setRootRef, className: topRootClass, disabled: this.__calculateDerivedDisabled(), style: this.topStyle },
                    React.createElement(
                        'a',
                        { className: topUrlClass, href: this.state.url },
                        this.state.text
                    ),
                    React.createElement('div', { className: 'top-textview-aligner' })
                )
            );
        }
    }]);

    return TopTextviewUI;
}(TopTextBehavior);

var TopTextview = function (_TopTextviewUI) {
    _inherits(TopTextview, _TopTextviewUI);

    function TopTextview() {
        _classCallCheck(this, TopTextview);

        return _possibleConstructorReturn(this, (TopTextview.__proto__ || Object.getPrototypeOf(TopTextview)).apply(this, arguments));
    }

    return TopTextview;
}(TopTextviewUI);

TopTextviewUI.propConfigs = Object.assign({}, TopTextBehavior.propConfigs, {
    url: {
        type: String
    },

    multiLine: {
        type: Boolean
    },

    maxLine: {
        type: Number
    },

    html: {
        type: String
    },
    ellipsis: {
        type: Boolean,
        default: false
    }
});

TopTextviewUI.defaultProps = Object.assign({}, TopTextBehavior.defaultProps, {
    tagName: 'top-textview',
    ellipsis: false,
    multiLine: false
});

TopTextview.propConfigs = Object.assign({}, TopTextviewUI.propConfigs, {});

TopTextview.defaultProps = Object.assign({}, TopTextviewUI.defaultProps, {});

(function () {

    var TextviewCreator = function TextviewCreator(topInstance) {
        Textview.prototype = Object.create(topInstance.Widget.prototype);
        Textview.prototype.constructor = Textview;

        function Textview(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-textview']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-textview'], props));
            }
        }

        Textview.create = function (element, props) {
            return new Textview(element, props);
        };

        return Textview;
    };

    getTopUI().Widget.Textview = TextviewCreator(getTopUI());
    getTop().Widget.Textview = TextviewCreator(getTop());
})();var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopToggleUI = function (_TopCheckBehavior) {
    _inherits(TopToggleUI, _TopCheckBehavior);

    function TopToggleUI(props) {
        _classCallCheck(this, TopToggleUI);

        return _possibleConstructorReturn(this, (TopToggleUI.__proto__ || Object.getPrototypeOf(TopToggleUI)).call(this, props));
    }

    _createClass(TopToggleUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            var topDisabled = this.__calculateDerivedDisabled();

            var topRootClass = classNames({
                'top-toggle-root': true,
                'btn': true,
                'btn-primary': this.__isCheckedTrue(),
                'btn-default': !this.__isCheckedTrue(),
                'off': !this.__isCheckedTrue(),
                'disabled': topDisabled
            });

            return React.createElement(
                'top-toggle',
                {
                    id: this.state.id,
                    ref: this.setTopRef,
                    'class': this.makeTopTagClassString(),
                    disabled: topDisabled,
                    style: this.topTagStyle },
                React.createElement(
                    'label',
                    {
                        id: this.state.id,
                        ref: this.setRootRef,
                        className: topRootClass,
                        style: this.topStyle },
                    React.createElement(
                        'div',
                        { className: 'top-toggle-background' },
                        React.createElement('span', { className: 'top-toggle-handle btn' })
                    )
                ),
                React.createElement('input', {
                    type: 'checkbox',
                    className: 'top-toggle-input',
                    name: this.state.groupId,
                    checked: this.__isCheckedTrue(),
                    disabled: topDisabled,
                    onChange: function onChange(e) {
                        e.preventDefault();
                    } })
            );
        }
    }]);

    return TopToggleUI;
}(TopCheckBehavior);

var TopToggle = function (_TopToggleUI) {
    _inherits(TopToggle, _TopToggleUI);

    function TopToggle() {
        _classCallCheck(this, TopToggle);

        return _possibleConstructorReturn(this, (TopToggle.__proto__ || Object.getPrototypeOf(TopToggle)).apply(this, arguments));
    }

    _createClass(TopToggle, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopToggle.prototype.__proto__ || Object.getPrototypeOf(TopToggle.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent();
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            var _this3 = this;

            this._top.EventManager.on('click', this.dom.root, function (event) {
                _this3.toggle();
            });
        }
    }, {
        key: 'on',
        value: function on() {
            this.__updateProperties({ 'checked': this.state.trueValue });
        }
    }, {
        key: 'off',
        value: function off() {
            this.__updateProperties({ 'checked': this.state.falseValue });
        }
    }, {
        key: 'toggle',
        value: function toggle() {
            if (this.__isCheckedTrue()) this.off();else this.on();
        }
    }]);

    return TopToggle;
}(TopToggleUI);

TopToggleUI.propConfigs = Object.assign({}, TopCheckBehavior.propConfigs, {});

TopToggleUI.defaultProps = Object.assign({}, TopCheckBehavior.defaultProps, {
    tagName: 'top-toggle'
});

TopToggle.propConfigs = Object.assign({}, TopToggleUI.propConfigs, {});

TopToggle.defaultProps = Object.assign({}, TopToggleUI.defaultProps, {});

(function () {

    var ToggleCreator = function ToggleCreator(topInstance) {
        Toggle.prototype = Object.create(topInstance.Widget.prototype);
        Toggle.prototype.constructor = Toggle;

        function Toggle(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-toggle']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-toggle'], props));
            }
        }

        Toggle.create = function (element, props) {
            return new Toggle(element, props);
        };

        Toggle.prototype.on = function () {
            this.getTemplate().on();
        };

        Toggle.prototype.off = function () {
            this.getTemplate().off();
        };

        Toggle.prototype.toggle = function () {
            this.getTemplate().toggle();
        };

        Toggle.prototype.isOn = function () {
            return this.getTemplate().__isCheckedTrue();
        };

        return Toggle;
    };

    getTopUI().Widget.Toggle = ToggleCreator(getTopUI());
    getTop().Widget.Toggle = ToggleCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _defineProperty = function(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _toConsumableArray = function(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopTreeviewUI = function (_TopContainerBehavior) {
    _inherits(TopTreeviewUI, _TopContainerBehavior);

    function TopTreeviewUI(props) {
        _classCallCheck(this, TopTreeviewUI);

        var _this = _possibleConstructorReturn(this, (TopTreeviewUI.__proto__ || Object.getPrototypeOf(TopTreeviewUI)).call(this, props));

        _this.state.itemList = _this.treeToList(_this.state.items);
        _this.state.checkedItems = [];
        _this.state.selectedItems = [];
        return _this;
    }

    _createClass(TopTreeviewUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            var _this2 = this;

            return React.createElement(
                'top-treeview',
                {
                    id: this.state.id,
                    ref: this.setTopRef,
                    'class': this.makeTopTagClassString(),
                    style: this.topTagStyle
                },
                React.createElement(
                    'div',
                    {
                        id: this.state.id,
                        ref: this.setRootRef,
                        className: 'top-treeview-root',
                        disabled: this.__calculateDerivedDisabled(),
                        style: this.topStyle
                    },
                    React.createElement(TopTreeLine, {
                        width: this.state.layoutWidth,
                        height: this.state.layoutHeight,
                        itemList: this.state.itemList
                    }),
                    this.state.itemList.map(function (itemWrapper, index) {
                        if (itemWrapper.hidden) return null;
                        var item = itemWrapper['item'];
                        return React.createElement(TopTreeItem, {
                            key: _this2.props.id + '_' + index,
                            index: index,
                            item: item,
                            level: itemWrapper.level,
                            isParent: itemWrapper.isParent,
                            collapsed: itemWrapper.collapsed,
                            selected: _this2.state.selectedItems.includes(item),
                            checkable: item.checkable ? item.checkable : _this2.state.checkable,
                            draggable: _this2.state.draggable
                        });
                    })
                )
            );
        }
    }, {
        key: 'treeToList',
        value: function treeToList(items) {
            var itemList = [];
            traverse(items, 0);
            return itemList;

            function traverse(items, level) {
                items.forEach(function (item) {
                    itemList.push(copyItem(item, level));
                    if (item['children'] && item['children'].length > 0) {
                        traverse(item['children'], level + 1);
                    }
                });
            }
            function copyItem(item, level) {
                var copy = Object.assign({}, item);
                if (copy['children'] && copy['children'].length > 0) {
                    isParent = true;
                } else {
                    isParent = false;
                }
                delete copy['children'];
                var itemWrapper = {
                    item: copy,
                    level: level,
                    isParent: isParent
                };
                return itemWrapper;
            }
        }
    }, {
        key: 'listToTree',
        value: function listToTree(itemList) {
            var ret = [];
            var stack = [];
            for (var i = 0; i < itemList.length; i++) {
                var curr = itemList[i];
                if (curr.level === 0) {
                    stack = [];
                    ret.push(curr.item);
                    stack.push(curr);
                    continue;
                }
                var stackTop = stack[stack.length - 1];
                if (curr.level === stackTop.level + 1) {
                    var parent = stackTop;
                    if (!parent.item.children) parent.item.children = [];
                    parent.item.children.push(curr.item);
                    stack.push(curr);
                } else if (curr.level === stackTop.level) {
                    var parent = stack.find(function (s) {
                        return curr.level - 1 === s.level;
                    });
                    parent.item.children.push(curr.item);
                } else if (curr.level < stackTop.level) {
                    var parent = stack.find(function (s) {
                        return curr.level - 1 === s.level;
                    });
                    stack.splice(stack.indexOf(parent) + 1);
                    if (!parent.item.children) parent.item.children = [];
                    parent.item.children.push(curr.item);
                    stack.push(curr);
                }
            }
            return ret;
        }
    }, {
        key: '__updateItems',
        value: function __updateItems() {
            this.state.itemList = this.treeToList(this.state.items);
        }
    }]);

    return TopTreeviewUI;
}(TopContainerBehavior);

var TopTreeview = function (_TopTreeviewUI) {
    _inherits(TopTreeview, _TopTreeviewUI);

    function TopTreeview(props) {
        _classCallCheck(this, TopTreeview);

        return _possibleConstructorReturn(this, (TopTreeview.__proto__ || Object.getPrototypeOf(TopTreeview)).call(this, props));
    }

    _createClass(TopTreeview, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.bindEvent();
        }
    }, {
        key: 'bindEvent',
        value: function bindEvent() {
            var _this4 = this;

            this._top.EventManager.on('click', this.dom.root, function (e) {
                var target = e.toElement;
                var targetItem = target.closest('.top-treeview-item');
                var classList = target.classList;
                var index = parseInt(targetItem.dataset.index);
                var item = _this4.state.itemList[index]['item'];
                if (classList.contains('top-treeview-item') || classList.contains('top-treeview-text')) {
                    _this4.selectItem(e, item);
                } else if (classList.contains('top-treeview-check')) {
                    _this4.checkBtn(e, item);
                } else if (classList.contains('top-treeview-button')) {
                    _this4.clickBtn(e, index);
                } else if (classList.contains('top-treeview-dropdown-option') && classList.contains('remove')) {
                    _this4.removeItem(index);
                }
            });
            this._top.EventManager.on('drop', this.dom.root, function (e) {
                return _this4.dropItem(e);
            });
        }
    }, {
        key: 'clickBtn',
        value: function clickBtn(e, index) {
            var itemList = this.state.itemList;
            var itemWrapper = itemList[index];
            itemWrapper.collapsed = !itemWrapper.collapsed;
            var numberToCollapse = this.__countDecendant(index);
            for (var i = index + 1; i < index + numberToCollapse; i++) {
                itemList[i].hidden = itemWrapper.collapsed;
            }
            this.forceUpdate();
            e.stopPropagation();
        }
    }, {
        key: 'checkBtn',
        value: function checkBtn(e, item) {
            var checkBtn = e.toElement;
            checkBtn.classList.toggle('checked');
            var checkedItems = this.state.checkedItems.slice();
            if (checkedItems.includes(item)) {
                checkedItems.splice(checkedItems.indexOf(item), 1);
            } else {
                checkedItems.push(item);
            }
            this.setState({
                checkedItems: checkedItems
            });
            e.stopPropagation();
        }
    }, {
        key: 'selectItem',
        value: function selectItem(e, item) {
            var selectedItems = this.state.selectedItems.slice();
            if (e.ctrlKey) {
                if (selectedItems.includes(item)) {
                    selectedItems.splice(selectedItems.indexOf(item), 1);
                } else {
                    selectedItems.push(item);
                }
            } else {
                selectedItems = [item];
            }
            this.setState({
                selectedItems: selectedItems
            });
        }
    }, {
        key: 'removeItem',
        value: function removeItem(index) {
            var itemList = this.state.itemList.slice();
            var numberToRemove = this.__countDecendant(index);
            itemList.splice(index, numberToRemove);
            this.setState({
                itemList: itemList
            });
        }
    }, {
        key: 'dropItem',
        value: function dropItem(e) {
            var srcIndex = parseInt(e.dataTransfer.getData('text'));
            var target = e.toElement;
            var targetItem = target.closest('.top-treeview-item');
            var targetIndex = parseInt(targetItem.dataset.index);
            if (targetIndex === null) return;
            var itemList = this.state.itemList.slice();
            if (srcIndex === targetIndex) return;
            var count = this.__countDecendant(srcIndex);
            var srcList = itemList.slice(srcIndex, srcIndex + count);
            itemList.splice(srcIndex, count);
            if (srcIndex < targetIndex) targetIndex -= count;
            var targetItemWrapper = itemList[targetIndex];
            var srcLevel = srcList[0].level;
            for (var i = 0; i < srcList.length; i++) {
                if (targetItem.classList.contains('underline')) {
                    srcList[i].level = srcList[i].level - srcLevel + targetItemWrapper.level;
                } else if (targetItem.classList.contains('dragover')) {
                    srcList[i].level = srcList[i].level - srcLevel + targetItemWrapper.level + 1;
                }
            }
            itemList.splice.apply(itemList, [targetIndex + 1, 0].concat(_toConsumableArray(srcList)));
            this.setState({
                itemList: itemList
            });
            this.forceUpdate();
        }
    }, {
        key: '__countDecendant',
        value: function __countDecendant(index) {
            var itemList = this.state.itemList;
            for (var i = index + 1; i < itemList.length; i++) {
                if (itemList[i].level <= itemList[index].level) break;
            }
            var count = i - index;
            return count;
        }
    }]);

    return TopTreeview;
}(TopTreeviewUI);

TopTreeviewUI.propConfigs = Object.assign({}, TopContainerBehavior.propConfigs, {
    items: {
        type: Array,
        aliases: ['nodes']
    },

    checkable: {
        type: Boolean,
        default: false
    },

    expand: {
        type: Boolean,
        default: true
    },

    draggable: {
        type: Boolean,
        default: false
    }
});

TopTreeviewUI.defaultProps = Object.assign({}, TopContainerBehavior.defaultProps, {
    tagName: 'top-treeview'
});

TopTreeview.propConfigs = Object.assign({}, TopTreeviewUI.propConfigs, {});

TopTreeview.defaultProps = Object.assign({}, TopTreeviewUI.defaultProps, {});

(function () {
    var TreeviewCreator = function TreeviewCreator(topInstance) {
        Treeview.prototype = Object.create(topInstance.Widget.Container.prototype);
        Treeview.prototype.constructor = Treeview;

        function Treeview(element, props) {
            topInstance.Widget.Container.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-treeview']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-treeview'], props));
            }
        }

        Treeview.create = function (element, props) {
            return new Treeview(element, props);
        };

        Treeview.prototype.getCheckedItems = function () {
            return this.getTemplate().state.checkedItems;
        };

        Treeview.prototype.getSelectedItems = function () {
            return this.getTemplate().state.selectedItems;
        };

        Treeview.prototype.getItems = function () {
            var itemList = this.getTemplate().state.itemList;
            return this.getTemplate().listToTree(itemList);
        };

        Treeview.prototype.removeItem = function (id) {
            var itemList = this.getTemplate().state.itemList;
            var index = itemList.findIndex(function (itemWrapper) {
                return itemWrapper.item.id === id;
            });
            if (index > -1) {
                this.getTemplate().removeItem(index);
            }
        };

        Treeview.prototype.editItem = function (id, item) {
            var itemList = this.getTemplate().state.itemList;
            var index = itemList.findIndex(function (itemWrapper) {
                return itemWrapper.item.id === id;
            });
            if (index > -1) {
                itemList[index].item = item;
                this.getTemplate().forceUpdate();
            }
        };

        return Treeview;
    };

    getTopUI().Widget.Container.Treeview = TreeviewCreator(getTopUI());
    getTop().Widget.Container.Treeview = TreeviewCreator(getTop());
})();

var TopTreeItem = function (_React$Component) {
    _inherits(TopTreeItem, _React$Component);

    function TopTreeItem(props) {
        _classCallCheck(this, TopTreeItem);

        var _this5 = _possibleConstructorReturn(this, (TopTreeItem.__proto__ || Object.getPrototypeOf(TopTreeItem)).call(this, props));

        _this5.state = {
            hovered: false,
            editMode: false,
            dragOver: false,
            underline: false
        };
        return _this5;
    }

    _createClass(TopTreeItem, [{
        key: 'handleDropdown',
        value: function handleDropdown(hovered) {
            this.setState({
                hovered: hovered
            });
        }
    }, {
        key: 'setEditMode',
        value: function setEditMode() {
            this.setState({
                hovered: false,
                editMode: true
            });
        }
    }, {
        key: 'handleInput',
        value: function handleInput(e) {
            if (e.type === 'blur' || e.type === 'keydown' && (e.key === 'Enter' || e.key === 'Escape')) {
                this.props.item.text = e.target.value;
                this.setState({
                    editMode: false
                });
            }
        }
    }, {
        key: 'onDragStart',
        value: function onDragStart(e, index) {
            e.dataTransfer.setData("text", index);
        }
    }, {
        key: 'onDragOver',
        value: function onDragOver(e) {
            var bottom = e.target.getBoundingClientRect().bottom;
            var offset = 4;
            if (!this.state.dragOver) {
                this.setState({
                    dragOver: true
                });
            }
            if (e.clientY > bottom - offset && !this.state.underline) {
                this.setState({
                    underline: true
                });
            }
            e.preventDefault();
        }
    }, {
        key: 'onDragLeave',
        value: function onDragLeave() {
            this.setState({
                dragOver: false,
                underline: false
            });
        }
    }, {
        key: 'onDrop',
        value: function onDrop() {
            this.setState({
                dragOver: false,
                underline: false
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var item = this.props.item;
            var level = this.props.level;
            var itemStyle;
            if (level > 5) {
                var offset1 = 17;
                var offset2 = 24;
                itemStyle = {
                    'paddingLeft': (level - 1) * offset1 + offset2
                };
            }
            var itemClass = classNames(_defineProperty({
                'top-treeview-item': true,
                'parent': this.props.isParent,
                'child': !this.props.isParent,
                'collapsed': this.props.collapsed && this.props.isParent,
                'selected': this.props.selected,
                'dragover': this.state.dragOver,
                'underline': this.state.underline
            }, 'level-' + level, true));
            return React.createElement(
                'div',
                {
                    className: itemClass,
                    style: itemStyle,
                    'data-index': this.props.index,
                    onMouseEnter: function onMouseEnter() {
                        return _this6.handleDropdown(true);
                    },
                    onMouseLeave: function onMouseLeave() {
                        return _this6.handleDropdown(false);
                    },
                    draggable: this.props.draggable,
                    onDragStart: function onDragStart(e) {
                        return _this6.onDragStart(e, _this6.props.index);
                    },
                    onDragLeave: function onDragLeave() {
                        return _this6.onDragLeave();
                    },
                    onDrop: function onDrop() {
                        return _this6.onDrop();
                    },
                    onDragOver: function onDragOver(e) {
                        return _this6.onDragOver(e);
                    }
                },
                this.props.isParent && React.createElement('span', { className: 'top-treeview-button' }),
                this.props.checkable && React.createElement('span', { className: 'top-treeview-check' }),
                item.image && !item.icon && React.createElement('span', { className: 'top-treeview-image', style: { 'background': 'url(' + item.image + ')' } }),
                item.icon && React.createElement('span', { className: 'top-treeview-icon ' + item.icon }),
                !this.state.editMode && React.createElement(
                    'span',
                    { className: 'top-treeview-text' },
                    item.text
                ),
                this.state.editMode && React.createElement('input', { defaultValue: item.text, onBlur: function onBlur(e) {
                        return _this6.handleInput(e);
                    }, onKeyDown: function onKeyDown(e) {
                        return _this6.handleInput(e);
                    } }),
                this.state.hovered && React.createElement(TopTreeDropdown, { setEditMode: function setEditMode(e) {
                        return _this6.setEditMode(e);
                    } })
            );
        }
    }]);

    return TopTreeItem;
}(React.Component);

var TopTreeDropdown = function (_React$Component2) {
    _inherits(TopTreeDropdown, _React$Component2);

    function TopTreeDropdown(props) {
        _classCallCheck(this, TopTreeDropdown);

        var _this7 = _possibleConstructorReturn(this, (TopTreeDropdown.__proto__ || Object.getPrototypeOf(TopTreeDropdown)).call(this, props));

        _this7.state = {
            opened: false
        };
        return _this7;
    }

    _createClass(TopTreeDropdown, [{
        key: 'clickDropdown',
        value: function clickDropdown(e) {
            var opened = this.state.opened;
            this.setState({
                opened: !opened
            });
            e.stopPropagation();
        }
    }, {
        key: 'createDropDownList',
        value: function createDropDownList() {
            var _this8 = this;

            return React.createElement(
                'div',
                { className: 'top-treeview-dropdown-list' },
                React.createElement(
                    'div',
                    {
                        className: 'top-treeview-dropdown-option',
                        onClick: function onClick(e) {
                            return _this8.props.setEditMode(e);
                        }
                    },
                    'Edit'
                ),
                React.createElement(
                    'div',
                    { className: 'top-treeview-dropdown-option remove' },
                    'Remove'
                )
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _this9 = this;

            return React.createElement(
                'span',
                {
                    className: 'top-treeview-dropdown',
                    onClick: function onClick(e) {
                        return _this9.clickDropdown(e);
                    }
                },
                this.state.opened && this.createDropDownList()
            );
        }
    }]);

    return TopTreeDropdown;
}(React.Component);

var TopTreeLine = function (_React$Component3) {
    _inherits(TopTreeLine, _React$Component3);

    function TopTreeLine(props) {
        _classCallCheck(this, TopTreeLine);

        var _this10 = _possibleConstructorReturn(this, (TopTreeLine.__proto__ || Object.getPrototypeOf(TopTreeLine)).call(this, props));

        _this10.canvas = React.createRef();
        return _this10;
    }

    _createClass(TopTreeLine, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.traverse(this.props.itemList);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.canvas.current.getContext('2d').clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);
            this.traverse(this.props.itemList);
        }
    }, {
        key: 'traverse',
        value: function traverse(itemList) {
            var stack = [];
            for (var i = 0; i < itemList.length; i++) {
                var curr = itemList[i];
                if (curr.hidden === true) continue;
                if (curr.level === 0) {
                    stack = [];
                    stack.push({ index: i, level: curr.level });
                    continue;
                }
                var stackTop = stack[stack.length - 1];
                if (curr.level === stackTop.level + 1) {
                    var parent = stackTop;
                    var child = { index: i, level: curr.level };
                    stack.push(child);
                } else if (curr.level === stackTop.level) {
                    var parent = stack.find(function (s) {
                        return curr.level - 1 === s.level;
                    });
                    var child = { index: i, level: curr.level };
                } else if (curr.level < stackTop.level) {
                    var parent = stack.find(function (s) {
                        return curr.level - 1 === s.level;
                    });
                    var child = { index: i, level: curr.level };
                    stack.splice(stack.indexOf(parent) + 1);
                    stack.push(child);
                }
                this.draw(parent, child);
            }
        }
    }, {
        key: 'draw',
        value: function draw(parent, child) {
            var ctx = this.canvas.current.getContext('2d');
            var offsetHorizontal = 17;
            var offsetVertical = 25;
            var initX = 5.5;
            var initY = 15.5;
            ctx.beginPath();
            ctx.moveTo(initX + parent.level * offsetHorizontal, initY + parent.index * offsetVertical);
            ctx.lineTo(initX + parent.level * offsetHorizontal, initY + child.index * offsetVertical);
            ctx.lineTo(initX + (parent.level + 1) * offsetHorizontal, initY + child.index * offsetVertical);
            ctx.strokeStyle = "#F1F1F1";
            ctx.stroke();
        }
    }, {
        key: 'render',
        value: function render() {
            var style = {
                position: 'absolute',
                'zIndex': -1
            };
            var width = parseInt(this.props.width) || 200;
            var height = parseInt(this.props.height) || 1000;
            return React.createElement('canvas', {
                style: style,
                width: width,
                height: height,
                ref: this.canvas
            });
        }
    }]);

    return TopTreeLine;
}(React.Component);var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopVideoviewUI = function (_TopResourceBehavior) {
    _inherits(TopVideoviewUI, _TopResourceBehavior);

    function TopVideoviewUI(props) {
        _classCallCheck(this, TopVideoviewUI);

        return _possibleConstructorReturn(this, (TopVideoviewUI.__proto__ || Object.getPrototypeOf(TopVideoviewUI)).call(this, props));
    }

    _createClass(TopVideoviewUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-videoview',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement('video', { id: this.state.id, ref: this.setRootRef, className: 'top-videoview-root', type: 'video/mp4', src: this.state.src, name: this.state.name, autoPlay: this.state.autoPlay, controls: this.state.control, loop: this.state.loop, disabled: this.__calculateDerivedDisabled(), style: this.topStyle })
            );
        }
    }]);

    return TopVideoviewUI;
}(TopResourceBehavior);

var TopVideoview = function (_TopVideoviewUI) {
    _inherits(TopVideoview, _TopVideoviewUI);

    function TopVideoview() {
        _classCallCheck(this, TopVideoview);

        return _possibleConstructorReturn(this, (TopVideoview.__proto__ || Object.getPrototypeOf(TopVideoview)).apply(this, arguments));
    }

    return TopVideoview;
}(TopVideoviewUI);

TopVideoviewUI.propConfigs = Object.assign({}, TopResourceBehavior.propConfigs, {
    autoPlay: {
        type: Boolean,
        default: false
    },

    control: {
        type: Boolean,
        default: false
    },

    loop: {
        type: Boolean,
        default: false
    }
});

TopVideoviewUI.defaultProps = Object.assign({}, TopResourceBehavior.defaultProps, {
    tagName: 'top-videoview'
});

TopVideoview.propConfigs = Object.assign({}, TopVideoviewUI.propConfigs, {});

TopVideoview.defaultProps = Object.assign({}, TopVideoviewUI.defaultProps, {});

(function () {

    var VideoviewCreator = function VideoviewCreator(topInstance) {
        Videoview.prototype = Object.create(topInstance.Widget.prototype);
        Videoview.prototype.constructor = Videoview;

        function Videoview(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-videoview']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-videoview'], props));
            }
        }

        Videoview.create = function (element, props) {
            return new Videoview(element, props);
        };

        return Videoview;
    };

    getTopUI().Widget.Videoview = VideoviewCreator(getTopUI());
    getTop().Widget.Videoview = VideoviewCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _templateObject = _taggedTemplateLiteral(['\n            width: 100%;\n            height: 100%;\n            position: absolute;\n            top: 0px;\n        '], ['\n            width: 100%;\n            height: 100%;\n            position: absolute;\n            top: 0px;\n        ']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopWebviewUI = function (_TopCommonstyleBehavi) {
    _inherits(TopWebviewUI, _TopCommonstyleBehavi);

    function TopWebviewUI(props) {
        _classCallCheck(this, TopWebviewUI);

        return _possibleConstructorReturn(this, (TopWebviewUI.__proto__ || Object.getPrototypeOf(TopWebviewUI)).call(this, props));
    }

    _createClass(TopWebviewUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;

            _get(TopWebviewUI.prototype.__proto__ || Object.getPrototypeOf(TopWebviewUI.prototype), '__initDomRef', this).call(this);
            this.dom.eventBlock = null;
            this.setEventBlock = function (element) {
                _this2.dom.eventBlock = element;
            };
        }
    }, {
        key: '__eventBlock',
        value: function __eventBlock() {
            var StyledDiv = function StyledDiv(_ref) {
                var className = _ref.className,
                    refFunction = _ref.refFunction,
                    children = _ref.children;
                return React.createElement(
                    'div',
                    { className: className, ref: refFunction },
                    children
                );
            };
            var EventBlock = styled(StyledDiv)(_templateObject);
            return React.createElement(EventBlock, { className: 'top-webview-event-block', refFunction: this.setEventBlock });
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement(
                'top-webview',
                { id: this.state.id, ref: this.setTopRef, 'class': this.makeTopTagClassString(), style: this.topTagStyle },
                React.createElement(
                    'div',
                    { id: this.state.id, ref: this.setRootRef, className: 'top-webview-root', style: this.topStyle },
                    React.createElement('iframe', { className: 'top-webview-iframe', src: this.state.url, name: this.state.name, alt: this.state.name, scrolling: 'yes', disabled: this.__calculateDerivedDisabled() }),
                    this.__eventBlock()
                )
            );
        }
    }]);

    return TopWebviewUI;
}(TopCommonstyleBehavior);

var TopWebview = function (_TopWebviewUI) {
    _inherits(TopWebview, _TopWebviewUI);

    function TopWebview() {
        _classCallCheck(this, TopWebview);

        return _possibleConstructorReturn(this, (TopWebview.__proto__ || Object.getPrototypeOf(TopWebview)).apply(this, arguments));
    }

    return TopWebview;
}(TopWebviewUI);

TopWebviewUI.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {
    url: {
        type: String
    },

    onLoad: {
        type: Function
    }
});

TopWebviewUI.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {
    tagName: 'top-webview'
});

TopWebview.propConfigs = Object.assign({}, TopWebviewUI.propConfigs, {});

TopWebview.defaultProps = Object.assign({}, TopWebviewUI.defaultProps, {});

(function () {

    var WebviewCreator = function WebviewCreator(topInstance) {
        Webview.prototype = Object.create(topInstance.Widget.prototype);
        Webview.prototype.constructor = Webview;

        function Webview(element, props) {
            topInstance.Widget.apply(this, arguments);
            if (element instanceof topInstance.Render.topWidgets['top-webview']) {
                this.setTemplate(element);
            } else {
                this.setReactElement(React.createElement(topInstance.Render.topWidgets['top-webview'], props));
            }
        }

        Webview.create = function (element, props) {
            return new Webview(element, props);
        };

        return Webview;
    };

    getTopUI().Widget.Webview = WebviewCreator(getTopUI());
    getTop().Widget.Webview = WebviewCreator(getTop());
})();var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _classCallCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _possibleConstructorReturn = function(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

var _inherits = function(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TopWidgetitemUI = function (_TopWidgetBehavior) {
    _inherits(TopWidgetitemUI, _TopWidgetBehavior);

    function TopWidgetitemUI(props) {
        _classCallCheck(this, TopWidgetitemUI);

        return _possibleConstructorReturn(this, (TopWidgetitemUI.__proto__ || Object.getPrototypeOf(TopWidgetitemUI)).call(this, props));
    }

    _createClass(TopWidgetitemUI, [{
        key: 'render',
        value: function render() {
            console.debug('render', this.props.id);
            return this.props.children;
        }
    }]);

    return TopWidgetitemUI;
}(TopWidgetBehavior);

TopWidgetitemUI.defaultProps = {
    tagName: 'top-widgetitem'
};

var TopRowitemUI = function (_TopWidgetitemUI) {
    _inherits(TopRowitemUI, _TopWidgetitemUI);

    function TopRowitemUI() {
        _classCallCheck(this, TopRowitemUI);

        return _possibleConstructorReturn(this, (TopRowitemUI.__proto__ || Object.getPrototypeOf(TopRowitemUI)).apply(this, arguments));
    }

    return TopRowitemUI;
}(TopWidgetitemUI);

TopRowitemUI.defaultProps = {
    tagName: 'top-rowitem'
};

var TopColumnitemUI = function (_TopWidgetitemUI2) {
    _inherits(TopColumnitemUI, _TopWidgetitemUI2);

    function TopColumnitemUI() {
        _classCallCheck(this, TopColumnitemUI);

        return _possibleConstructorReturn(this, (TopColumnitemUI.__proto__ || Object.getPrototypeOf(TopColumnitemUI)).apply(this, arguments));
    }

    return TopColumnitemUI;
}(TopWidgetitemUI);

TopColumnitemUI.defaultProps = {
    tagName: 'top-columnitem'
};

var TopTableheaderUI = function (_TopWidgetitemUI3) {
    _inherits(TopTableheaderUI, _TopWidgetitemUI3);

    function TopTableheaderUI() {
        _classCallCheck(this, TopTableheaderUI);

        return _possibleConstructorReturn(this, (TopTableheaderUI.__proto__ || Object.getPrototypeOf(TopTableheaderUI)).apply(this, arguments));
    }

    return TopTableheaderUI;
}(TopWidgetitemUI);

TopTableheaderUI.defaultProps = {
    tagName: 'top-tableheader'
};

var TopHeaderrowUI = function (_TopWidgetitemUI4) {
    _inherits(TopHeaderrowUI, _TopWidgetitemUI4);

    function TopHeaderrowUI() {
        _classCallCheck(this, TopHeaderrowUI);

        return _possibleConstructorReturn(this, (TopHeaderrowUI.__proto__ || Object.getPrototypeOf(TopHeaderrowUI)).apply(this, arguments));
    }

    return TopHeaderrowUI;
}(TopWidgetitemUI);

TopHeaderrowUI.defaultProps = {
    tagName: 'top-headerrow'
};

var TopHeadercolumnUI = function (_TopWidgetitemUI5) {
    _inherits(TopHeadercolumnUI, _TopWidgetitemUI5);

    function TopHeadercolumnUI() {
        _classCallCheck(this, TopHeadercolumnUI);

        return _possibleConstructorReturn(this, (TopHeadercolumnUI.__proto__ || Object.getPrototypeOf(TopHeadercolumnUI)).apply(this, arguments));
    }

    return TopHeadercolumnUI;
}(TopWidgetitemUI);

TopHeadercolumnUI.defaultProps = {
    tagName: 'top-headercolumn'
};

var TopAccordiontabUI = function (_TopWidgetitemUI6) {
    _inherits(TopAccordiontabUI, _TopWidgetitemUI6);

    function TopAccordiontabUI() {
        _classCallCheck(this, TopAccordiontabUI);

        return _possibleConstructorReturn(this, (TopAccordiontabUI.__proto__ || Object.getPrototypeOf(TopAccordiontabUI)).apply(this, arguments));
    }

    return TopAccordiontabUI;
}(TopWidgetitemUI);

TopAccordiontabUI.defaultProps = {
    tagName: 'top-accodiontab'
};(function () {

    var RenderCreator = function RenderCreator(topInstance) {
        Render.prototype = Object.create(topInstance.prototype);
        Render.prototype.constructor = Render;

        Render.top_index = 0;
        Render.prototype.rootDocument = undefined;

        Render.topWidgets = {
            'top-absolutelayout': TopAbsolutelayoutUI,
            'top-accordionlayout': TopAccordionlayoutUI,

            'top-alarmbadge': TopAlarmbadgeUI,
            'top-breadcrumb': TopBreadcrumbUI,
            'top-button': TopButtonUI,
            'top-calendar': TopCalendarUI,
            'top-chart': TopChartUI,
            'top-checkbox': TopCheckboxUI,
            'top-chip': TopChipUI,

            'top-colorpicker': TopColorpickerUI,

            'top-dashboard': TopDashboardUI,
            'top-datepicker': TopDatepickerUI,
            'top-dialog': TopDialogUI,

            'top-flowlayout': TopFlowlayoutUI,
            'top-foldinglayout': TopFoldinglayoutUI,

            'top-framelayout': TopFramelayoutUI,

            'top-htmleditor': TopHtmleditorUI,
            'top-icon': TopIconUI,
            'top-imagebutton': TopImagebuttonUI,
            'top-imageslider': TopImagesliderUI,
            'top-imageview': TopImageviewUI,
            'top-layout': TopLayoutUI,
            'top-linearlayout': TopLinearlayoutUI,
            'top-listview': TopListviewUI,
            'top-menu': TopMenuUI,
            'top-notification': TopNotificationUI,
            'top-pagination': TopPaginationUI,
            'top-panel': TopPanelUI,
            'top-popover': TopPopoverUI,
            'top-progressbar': TopProgressbarUI,
            'top-radiobutton': TopRadiobuttonUI,

            'top-selectbox': TopSelectboxUI,

            'top-slider': TopSliderUI,
            'top-stepper': TopStepperUI,
            'top-spinner': TopSpinnerUI,
            'top-splitterlayout': TopSplitterlayoutUI,
            'top-switch': TopSwitchUI,
            'top-tablayout': TopTablayoutUI,
            'top-tableview': TopTableviewUI,
            'top-textarea': TopTextareaUI,
            'top-textfield': TopTextfieldUI,
            'top-textview': TopTextviewUI,

            'top-toggle': TopToggleUI,
            'top-treeview': TopTreeviewUI,
            'top-videoview': TopVideoviewUI,
            'top-webview': TopWebviewUI,
            'top-widgetitem': TopWidgetitemUI,
            'top-rowitem': TopRowitemUI,
            'top-columnitem': TopColumnitemUI,
            'top-tableheader': TopTableheaderUI,
            'top-headerrow': TopHeaderrowUI,
            'top-headercolumn': TopHeadercolumnUI
        };

        Render.loadWidgets = function () {
            topInstance.Util.__initLibsPath();

            for (key in Render.topWidgetNames) {
                if (typeof window[Render.topWidgetNames[key]] === 'function') {
                    Render.topWidgets[key] = window[Render.topWidgetNames[key]];
                } else if (window[Render.topWidgetNames[key]] === 'PENDING') {
                    continue;
                } else if (window[Render.topWidgetNames[key]] === undefined) {
                    if (topInstance.libsPath) {
                        window[Render.topWidgetNames[key]] = 'PENDING';

                        var script = document.createElement('script');
                        script.src = topInstance.libsPath + 'widgets/' + key + '.js';
                        script.async = false;
                        script.name = key;
                        script.onload = function () {
                            Render.topWidgets[this.name] = window[Render.topWidgetNames[this.name]];
                        };
                        document.head.appendChild(script);
                    }
                }
            }
        };

        function Render() {}

        Render.renderDom = function (root, json, callback) {
            var _this = this;
            var navData = window.performance.getEntriesByType("navigation");

            this.setRootDocument(root);

            if (navData.length > 0 && navData[0].loadEventEnd > 0) {
                if (typeof json !== 'function') {
                    ReactDOM.render(React.createElement(this.getComp(), { json: json }), root);
                } else {
                    ReactDOM.render(this.createNode(root), root);
                    callback = json;
                }
                if (typeof callback === 'function') callback();
            } else {
                $(window).bind('load', function () {
                    if (typeof json !== 'function') {
                        ReactDOM.render(React.createElement(_this.getComp(), { json: json }), root);
                    } else {
                        ReactDOM.render(_this.createNode(root), root);
                        callback = json;
                    }
                    if (typeof callback === 'function') callback();
                });
            }
        };

        Render.createNode = function (node) {
            var attrs = Array.prototype.slice.call(node.attributes);
            var props = {
                key: node.tagName + '-' + this.top_index
            };
            this.top_index++;

            attrs.map(function (attr) {
                return props[topInstance.Util.toCamelCase(attr.name)] = attr.value;
            });

            if (!props.id) {
                props.id = topInstance.Util.guid();
            }

            if (!!props.class) {
                props.className = props.class;
                delete props.class;
            }

            var children = [];
            for (var i = 0; i < node.children.length; i++) {
                var child = this.createNode(node.children[i]);
                children.push(child);
            }
            props.children = children;

            var Comp = topInstance.Render.topWidgets[node.tagName.toLowerCase()];
            if (!Comp) Comp = topInstance.Render.getComp();
            return React.createElement(Comp, props, children);
        };

        Render.getComp = function () {
            return TopLayoutEditor;
        };

        Render.setRootDocument = function (dom) {
            this.rootDocument = dom.ownerDocument;
        };

        Render.getRootDocument = function () {
            return this.rootDocument;
        };

        return Render;
    };

    getTopUI().Render = RenderCreator(getTopUI());
    getTop().Render = RenderCreator(getTop());

    getTop().Render.renderDom = function (root, callback) {
        this.setRootDocument(root);
        ReactDOM.render(this.createNode(root), root);
        if (typeof callback === 'function') callback();
    };

    getTop().Render.getComp = function () {
        return TopApp;
    };
    getTop().Render.topWidgets = {
        'top-absolutelayout': TopAbsolutelayout,
        'top-accordionlayout': TopAccordionlayout,

        'top-alarmbadge': TopAlarmbadge,
        'top-breadcrumb': TopBreadcrumb,
        'top-button': TopButton,
        'top-calendar': TopCalendar,
        'top-chart': TopChart,
        'top-checkbox': TopCheckbox,
        'top-chip': TopChip,

        'top-colorpicker': TopColorpicker,

        'top-dashboard': TopDashboard,
        'top-datepicker': TopDatepicker,
        'top-dialog': TopDialog,

        'top-flowlayout': TopFlowlayout,
        'top-foldinglayout': TopFoldinglayout,

        'top-framelayout': TopFramelayout,

        'top-htmleditor': TopHtmleditor,
        'top-icon': TopIcon,
        'top-imagebutton': TopImagebutton,
        'top-imageslider': TopImageslider,
        'top-imageview': TopImageview,
        'top-layout': TopLayout,
        'top-linearlayout': TopLinearlayout,
        'top-listview': TopListview,
        'top-menu': TopMenu,
        'top-notification': TopNotification,
        'top-pagination': TopPagination,
        'top-panel': TopPanel,
        'top-popover': TopPopover,
        'top-progressbar': TopProgressbar,
        'top-radiobutton': TopRadiobutton,

        'top-selectbox': TopSelectbox,

        'top-slider': TopSlider,
        'top-stepper': TopStepper,
        'top-spinner': TopSpinner,
        'top-splitterlayout': TopSplitterlayout,
        'top-switch': TopSwitch,
        'top-tablayout': TopTablayout,
        'top-tableview': TopTableview,
        'top-textarea': TopTextarea,
        'top-textfield': TopTextfield,
        'top-textview': TopTextview,

        'top-toggle': TopToggle,
        'top-treeview': TopTreeview,
        'top-videoview': TopVideoview,
        'top-webview': TopWebview,
        'top-widgetitem': TopWidgetitemUI,
        'top-rowitem': TopRowitemUI,
        'top-columnitem': TopColumnitemUI,
        'top-tableheader': TopTableheaderUI,
        'top-headerrow': TopHeaderrowUI,
        'top-headercolumn': TopHeadercolumnUI
    };

    getTopUI().Util.__gatherPropertyAliases();
    getTop().Util.__gatherPropertyAliases();
})();
// minified by minify-widgets -- sangjin
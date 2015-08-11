/**
 * Created by MiniApp.
 */
(function(){
if (!/mobile/i.test(navigator.userAgent)){
    return
}
/**
 * Created by MiniApp.
 */

 var MiniApp = (function () {
    var instance;

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    function guid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    function createCookie(name,value,days) {
        var expires;
        if (localStorage) {
            localStorage.setItem(name, value);
        } else {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime()+(days*24*60*60*1000));
                expires = ", expires="+date.toGMTString();
            } else {
                expires = '';
            }

            document.cookie = name+"="+value+expires+", path=/";
        }
    }

    function readCookie(name) {
        if (localStorage) {
            return localStorage.getItem(name);
        } else {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');

            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
            }    
        }
        
        return null;
    }


    function getMiniAppUUID() {
        var uuid = readCookie('miniappuuid');

        if (uuid === null) {
            uuid = guid();
            createCookie('miniappuuid', uuid, 365);
        }
        
        return uuid;
    }

    var miniappuuid = getMiniAppUUID();

    function manager(){
        this.addClass = function(name, obj){
            this[name] = obj;
        };

        this.addService = function(name, instance){
            this[name] = instance;
        };
        this.getGuid = function(){
            return miniappuuid;
        };
    }

    function createInstance() {
        var object = new manager();
        return object;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
/**
 * Created by MiniApp.
 */
(function() {
    MiniApp.getInstance().addService('http', (function(){

        function getHeaders(url, callback){
            var http = new XMLHttpRequest();
            http.open('HEAD', url);
            http.onreadystatechange = function(e) {
                console.log(this.getAllResponseHeaders());
                if (this.readyState == 4 && this.status == 200) {


                    callback(this.status != 404);
                }
            };
            http.send();
        }
        function get(url, callback) {

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);

            xhr.onreadystatechange = function (e) {
                if (this.readyState == 4 && this.status == 200) {
                    callback(this.response);
                }
            };
            xhr.send();

        }

        function post(url, data, callback) {

            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            //xhr.setRequestHeader("Access-Control-Allow-Origin", '*');
            xhr.onreadystatechange = function (e) {
                if (this.readyState == 4 && this.status == 200) {
                    try{
                        var jsonResp = JSON.parse(this.response);
                        callback(jsonResp);
                    } catch(err) {
                        //console.log("getPanelStyle Parse Error", err);
                        callback({});
                    }
                }
            };
            var dataStr = "";
            for (var param in data){
                dataStr += (param + "=" + data[param] + "&");
            }
            xhr.send(dataStr);
        }

        var host = "http://dev.miniapp.me";
        //var host = "http://localhost:3000";
        //var host = "http://mgmt.miniapp.me"; // Production

        function getPanelStyle(data, callback){
            post(host + "/api/miniapps/initparams/", data, function(styleStr){
                callback(styleStr);
            });
        }

        function getMiniapps(data, callback){
            post(host + "/api/miniapps/related/", data, function(apps){
                callback(apps);
            });
        }

        function engageEvent(action, articleURL, miniAppName, presentedMiniapps){
            var params = {};
            if(navigator){
                params.language = navigator.language;
            }

            var data =  { clientID:            '',   // { type: String }, // user_id
                deviceID:            '',   // { type: String },// device_id
                action:              action,   // { type: String }, // event_type
                timestamp:           (new Date()).getTime(),   // { type: Date, default: Date.now }, // time
                hostAppName :        'haaretz',   // { type: String }, // event_properties
                miniAppName:         miniAppName || '',   // { type: String },
                // notificationTypeId:  '',   // { type: String },
                sdkVersion:          '1.0web',   // { type: String }, // app_version
                // category:            '',   // { type: String },
                hostAppUserId:       '',   // { type: String },
                os_name:             '',   // { type: String },
                os_version:          '',   // { type: String },
                device_brand:        '',   // { type: String },
                device_manufacturer: '',   // { type: String },
                device_model:        '',   // { type: String },
                device_type:         '',   // { type: String },
                carrier:             'web',   // { type: String },
                // dma:                 '',   // { type: String },
                // country:             '',   // { type: String },
                // region:              '',   // { type: String },
                // city:                '',   // { type: String },
                language:            params.language,   // { type: String },
                // revenue:             '',   // { type: Number },
                // location_lat:        '',   // { type: Number },
                // location_lng:        '',   // { type: Number },
                // altitude:            '',   // { type: Number },
                ip:                  '',   // { type: String },
                adIdentifier:        MiniApp.getInstance().getGuid(),   // { type: String }, // idfa
                adid:                '',   // { type: String },
                articleURL:          articleURL,   // { type: String },
                presentedMiniapps:   presentedMiniapps || ["","","",""] };   // { type: [String] } // user_properties

            post(host + "/api/engagment/create/", data, function(){
            });
        }

        return {
            //get: get,
            getPanelStyle: getPanelStyle,
            getMiniapps: getMiniapps,
            engageEvent: engageEvent,
            getHeaders: getHeaders
        };

    })());


// var miniapps =  [{
//     id:"rest",
//     name:"Rest",
//     icon:"http://a2.mzstatic.com/us/r30/Purple1/v4/38/22/d3/3822d343-e4ab-d002-d289-95f7255b6ade/icon60x60.png",
//     appAddress:"http://www.rest.co.il/rests?tags=b70039845_e70041139",
//     appDownloadLink:"itms://itunes.apple.com/il/app/rest-rst-ms-dwt/id482489325?mt=8"
// },{
//     id:"dominos",
//     name:"Dominos",
//     icon:"http://a3.mzstatic.com/us/r30/Purple5/v4/cc/bb/32/ccbb3292-1d77-d040-786b-361e3a12104f/icon60x60.png",
//     appAddress:"http://www.dominos.co.il/",
//     appDownloadLink:"itms://itunes.apple.com/il/app/pyzh-h-t/id509221604?mt=8"
// }, {
//     id:"seret",
//     name:"סרט",
//     icon:"http://a3.mzstatic.com/us/r30/Purple3/v4/d6/55/00/d655009e-bdfe-b2a6-7ee1-062cf3d91be8/icon60x60.png",
//     appAddress:"http://m.seret.co.il/s_movies.asp?MID=4600",
//     appDownloadLink:"itms://itunes.apple.com/us/app/seret/id878566086"
// }, {
//     id: 'cinemacity',
//     name: 'Cinema City',
//     icon:"http://i60.tinypic.com/256fko6.png",
//     appAddress:"http://m.cinema-city.co.il/moviePage?presentFC=40655",
//     appDownloadLink:"itms://itunes.apple.com/il/app/cinema-city/id551561995?mt=8"
// }];

// var panelStyle = {
//     "Id": "dailylinger",
//     "ApiRouteMiniappRelated": "api/miniapps/related",
//     "ApiRouteEngagementCreate": "api/engagment/create",
//     "AnimationDuration": 0.5,
//     "AnimationType": 1,
//     "PanelHeight": 90,
//     "PanelIntro": "Just for you..",
//     "PanelAlpha": 1,
//     "BackNavigationText": "Back to article",
//     "NavigationTextColor": "#404040",
//     "PanelBackground": "#404040",
//     "PresenterPanelBuffer": -10,
//     "PresenterYOffset": 0,
//     "MinNumberOfMiniApps": 1,
//     "__v": 0
// };

})();
/**
 * Created by MiniApp.
 */

(function(){
    MiniApp.getInstance().addService('utils', (function(){
        function isiPhone(){
            return (/iPhone/i.test(navigator.userAgent));
        }
        function isiPad(){
            return (/iPad/i.test(navigator.userAgent));
        }

        function isNotChrome(){
            return (!/chrome|CriOS/i.test(navigator.userAgent));
        }

        return {
            isiPhone: isiPhone,
            isiPad: isiPad,
            isNotChrome: isNotChrome
        };
    })());
})();

(function(){

    /*
     * Class AppIcon
     */
    function AppIcon(options){
        if (!(options && options.icon && options.id)){
            return null;
        }

        var element;
        var appImage;
        var id;
        var name;
        var icon;
        var appAddress;
        var appDownloadLink;
        var clickListeners = [];
        var instance;
        var lastTouch;

        /*** Public functions ***/
        function getElement(){
            return element;
        }

        function onClick(cb){
            clickListeners.push(cb);
        }
        function highlight(on){
            if (on){
                appImage.style.boxShadow = "rgba(119, 219, 239, 0.75) 0px 0px 2px 2px";
            }else {
                appImage.style.boxShadow = "none";
            }

        }

        /*** Private functions ***/

        function click(){
            for (var i=0; i<clickListeners.length; i++ ){
                clickListeners[i](instance);
            }
        }
        function createAppElement(style){
            var app = document.createElement('div');
            app.style.float = "left";
            app.style.marginRight = "0px";
            app.style.marginLeft = "0px";
            app.style.cursor = "pointer";
            app.style.width = "80px";
            app.style.textAlign = "center";
            app.id = id;
            appImage = document.createElement('img');
            appImage.style.borderRadius = "5px";
            appImage.style.margin = "auto";
            appImage.style.width = "45px";
            appImage.style.height = "45px";
            appImage.style.borderRadius = '10px';
            appImage.src = icon;
            app.appendChild(appImage);

            var nameText = document.createElement('div');
            nameText.style.textAlign = "center";
            nameText.style.fontFamily = "'Roboto', sans-serif";
            nameText.style.fontSize = "11px";
            nameText.style.color = "#ffffff";
            nameText.style.direction = "rtl";
            var dispName = name;
            if (dispName.length > 12){
                dispName = dispName.substr(0, 11) + "..";
            }
            nameText.textContent = dispName;
            app.appendChild(nameText);
            app.addEventListener("touchstart", function(e) {
                lastTouch = e.touches[0];
            },true);
            app.addEventListener("touchmove", function(e) {
                lastTouch = e.touches[0];
                e.preventDefault();
                e.stopPropagation();
            },true);
            app.addEventListener("touchend", function(e) {
                var bounds = element.getBoundingClientRect();
                if (lastTouch.clientX >= bounds.left && lastTouch.clientX <= bounds.right &&
                lastTouch.clientY >= bounds.top && lastTouch.clientY <= bounds.bottom){
                    click();
                }
            },true);

            return app;
        }

        function init(){
            id = options.id;
            icon = options.icon;
            name = options.name;
            appAddress = options.appAddress;
            appDownloadLink = options.appDownloadLink;
            element = createAppElement();
        }

        init();
        instance = {
            getElement: getElement,
            getAppAddress: function (){return appAddress;},
            getAppDownloadLink: function (){return appDownloadLink;},
            getAppIcon: function (){return icon;},
            getAppName: function (){return name;},
            getAppId: function (){return id;},
            onClick: onClick,
            highlight: highlight
        };
        return instance;
    }

    MiniApp.getInstance().addClass("AppIcon", AppIcon);
})();
/**
 * Created by MiniApp.
 */
(function(){
    /*
     * Class Panel
     */

    var miniapp = MiniApp.getInstance();
    function Panel(options){
        if (!options){
            options = {};
        }
        var element;
        var container;
        var apps = [];
        var presentedFrame;
        var heightFixDiv;
        var visable = false;
        var hiddenElements = [];

        function addFont() {
            var cssId = 'miniappFontCSS';  // you could encode the css path itself to generate id..
            if (!document.getElementById(cssId))
            {
                var head  = document.getElementsByTagName('head')[0];
                var link  = document.createElement('link');
                link.id   = cssId;
                link.rel  = 'stylesheet';
                link.type = 'text/css';
                link.href = 'http://fonts.googleapis.com/css?family=Roboto:300';
                link.media = 'all';
                head.appendChild(link);
            }
        }

        /*** Public functions ***/
        function removeMiniapp(app){
            container.removeChild(app.getElement());
            for (var i=0; i< apps.length; i++){
                if (app == apps[i].app){
                    apps[i].frame.remove();
                    apps.splice(i,1);
                    updateWidth();
                    return;
                }
            }
        }

        function getMiniapps(){
            return apps;
        }

        function hide(){
            element.style.display = "none";
            document.body.removeChild(heightFixDiv);
        }

        function show(){
            if (visable) {
                return;
            }
            var done;

            function finalizeShow(success){
                if (success) {
                    document.body.appendChild(heightFixDiv);
                }
                if (typeof done === "function"){
                        done(success);
                    }
            }

            function slideUp() {
                var newBottom = parseInt(element.style.bottom) + 1;
                element.style.bottom = newBottom + "px";
                if (newBottom < 0) {
                    setTimeout(slideUp, 1);
                } else {
                    finalizeShow(true);
                }
            }

            function slideRight() {
                var newLeft = parseInt(element.style.left) + 16;
                element.style.left = newLeft + "px";
                if (newLeft < 0) {
                    setTimeout(slideRight, 16);
                } else {
                    element.style.left = 0;
                    finalizeShow(true);
                }
            }
            /*
            for (var i=0; i< apps.length; i++){
                if (!apps[i].frame.isReady()){
                    removeMiniapp(apps[i].app);
                    i--;
                }
            }
            */
            if (apps.length > 0) {
                visable = true;
                switch (options.AnimationType) {
                    case 0:
                        element.style.left = -window.innerWidth + "px";
                        element.style.display = "block";
                        slideRight();
                        break;
                    case 2:
                        element.style.display = "block";
                        finalizeShow(true);
                        break;
                    default:
                        element.style.bottom = -parseInt(element.style.height) + "px";
                        element.style.display = "block";
                        slideUp();
                        break;
                }
            } else {
                finalizeShow(false);
            }

            return { done: function (cb){done = cb;}};
        }

        function getElement(){
            return element;
        }

        function addMiniapp(app, frame){
            if (options.preloadFrames !== false){
                frame.preLoadAppInFrame(app);
                frame.onReady(handleFrameReady);
            }

            var appElement = app && app.getElement();
            if (appElement){
                container.appendChild(appElement);
                app.onClick(handleAppClick);
                frame.onHide(handleFrameHide);

                apps.push({"app": app, "frame": frame});
                updateWidth();
            }
        }

        /*** Private functions ***/

        function updateHeight(){
            /*
            function changeHeight(pixels) {
                element.style.height = pixels + "px";
                element.firstChild.style.height = pixels + "px";
                return;

                if (parseInt(element.style.height) == pixels){
                    return;
                }
                var inc = (parseInt(element.style.height) < pixels) ? 1 : - 1;
                var newHeight = parseInt(element.style.height) + inc;
                element.style.height = newHeight + "px";
                element.firstChild.style.height = newHeight + "px";
                if (newHeight != pixels) {
                    setTimeout(function(){changeHeight(pixels);}, 1);
                }

            }
            if (element && miniapp.utils.isiPhone() && miniapp.utils.isNotChrome()){
                if (screen.availHeight - window.innerHeight < 60) {
                    changeHeight((options.PanelHeight || 90) + 30);
                } else {
                    changeHeight((options.PanelHeight || 90));
                }
            }
            */
        }

        function handleFrameReady(farme) {
            for (var i = 0; i < apps.length; i++) {
                if (!apps[i].frame.isReady()) {
                    return;
                }
            }

            // If all frames are ready show panel
            if (!visable) {
                show();
            }

        }

        function afterFrameHide(frame){
            presentedFrame = null;
                for (var i=0; i< apps.length; i++) {
                    if (frame == apps[i].frame){
                         apps[i].app.highlight(false);
                    }
                }
                restoreHidden();
        }

        function handleFrameHide(frame, fromCloseButton){
            if (frame === presentedFrame && fromCloseButton){
                afterFrameHide(frame);
            }
        }

        function restoreHidden(){
            for (var i=0; i< hiddenElements.length; i++){
                hiddenElements[i].element.style.display = hiddenElements[i].display;
            }
            hiddenElements = [];
        }

        function hideBodyElements(visibleApp){
            var whiteListElements = [element, heightFixDiv];
            for (var i=0; i< apps.length; i++){
                whiteListElements.push(apps[i].frame.getIframe());
                whiteListElements.push(apps[i].frame.getTitle());
            }

            for (var j=0; j< document.body.children.length; j++){
                var child = document.body.children[j];
                if (whiteListElements.indexOf(child) == -1 && child.style.display != "none"){
                    hiddenElements.push({element:child, display:child.style.display});
                    child.style.display = "none";
                }
            }
        }

        function handleAppClick(app){
            for (var i=0; i< apps.length; i++){
                var animate = (options.AnimationType != 2);
                if (presentedFrame){
                    animate = false;
                }
                if (apps[i].app == app){
                    if (presentedFrame === apps[i].frame){
                        miniapp.http.engageEvent("CloseMiniApp", window.location.href,
                            app.getAppId(),
                            apps.map(function(miniapp){return miniapp.app.getAppId();}));
                        apps[i].frame.hide(true, true);
                        apps[i].app.highlight(false);
                    } else {
                        miniapp.http.engageEvent("OpenMiniApp", window.location.href,
                            app.getAppId(),
                            apps.map(function(miniapp){return miniapp.app.getAppId();}));
                        app.highlight(true);
                        apps[i].frame.show(animate);
                        hideBodyElements(apps[i]);
                        if (!presentedFrame){
                            history.pushState({app: app.getAppName()}, app.getAppName());
                        }
                        presentedFrame = apps[i].frame;

                    }
                } else {
                    apps[i].frame.hide(animate);
                    apps[i].app.highlight(false);
                }
            }
        }

        function updateWidth(){
            var totalWidth = 0;
            for (var i=0; i< apps.length; i++){
                totalWidth += parseInt(apps[i].app.getElement().style.width);
                totalWidth += parseInt(apps[i].app.getElement().style.marginLeft);
                totalWidth += parseInt(apps[i].app.getElement().style.marginRight);
            }
            container.style.width = totalWidth+"px";
        }

        function createPanelElement(style){
            var panel = document.createElement('div');
            var wrapper = document.createElement('div');
            container = createPanelContainer();

            wrapper.style.position = 'relative';
            wrapper.style.height = (style.PanelHeight || 90) + "px";
            panel.appendChild(wrapper);
            wrapper.appendChild(container);

            panel.style.position = 'fixed';
            panel.style.bottom = 0;
            panel.style.left = 0;
            panel.style.width = '100%';
            panel.style.height = (style.PanelHeight || 90) + "px";
            panel.style.opacity = style.PanelAlpha || 1;
            panel.style.backgroundColor = style.PanelBackground || "#404040";
            panel.style.display = "none";
            panel.style.zIndex = 1000;
            panel.style.webkitTransform = "translateZ(2px)";
            panel.style.webkitBackfaceVisibility = "hidden";

            if (options.id) {panel.id = options.id;}
            return panel;
        }

        function createPanelContainer(){
            var container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = "50%";
            container.style.left = "50%";
            container.style.transform = "translate(-50%, -50%)";
            container.style.webkitTransform = "translate(-50%, -50%)";
            return container;
        }

        function createPageHeightFixElement(height){
            var heightFix = document.createElement('div');
            heightFix.style.height = height + "px";
            heightFix.style.width =  "1px";
            return heightFix;
        }



        function init(){
            // Add Roboto font
            addFont();
            element = createPanelElement(options);
            heightFixDiv = createPageHeightFixElement(options.PanelHeight || 90);
            document.body.appendChild(element);
            window.addEventListener('popstate', function(e) {
                if (presentedFrame){
                    presentedFrame.hide(false, false);
                    afterFrameHide(presentedFrame);
                }
            }, true);
            element.addEventListener("touchmove", function(e) {
                for (var i=0; i< apps.length; i++){
                    var children = apps[i].app.getElement().children;
                    for (var child in children) {
                        if (children[child] == e.target) {
                            return true;
                        }
                    }
                }
                e.stopPropagation();
                e.preventDefault();
            },true);
        }

        init();

        return {
            addMiniapp: addMiniapp,
            removeMiniapp: removeMiniapp,
            getMiniapps: getMiniapps,
            setStyle: {},
            getElement: getElement,
            hide: hide,
            show: show
        };
    }

    miniapp.addClass("Panel", Panel);
})();
/**
 * Created by MiniApp.
 */
(function(){
    /*
     * Class DisplayFrame
     */
    var miniapp = MiniApp.getInstance();
    function DisplayFrame(options){
        if (!options){
            options = {};
        }

        var frame;
        var frameWrapper;
        var titleWrapper;
        //var titleIcon;
        var titleText;
        var displayedApp;
        var isDisplayed = false;
        var hideListeners = [];
        var readyListeners = [];
        var instance;
        var ready = false;
        var hostStaticFiles = "http://dev.miniapp.me";
        var lastTouch;

        /*** Public functions ***/
        function remove(){
            document.body.removeChild(frameWrapper);
            document.body.removeChild(titleWrapper);
        }

        function isReady(){
            return ready;
        }

        function onReady(cb){
            readyListeners.push(cb);
        }

        function onHide(cb){
            hideListeners.push(cb);
        }

        function getTitle(){
            return titleWrapper;
        }

        function getIframe(){
            return frameWrapper;
        }

        function hide(animate, selfClose) {
            if ((options.AnimationType == 2)){
                animate = false;
            }

            if (isDisplayed) {
                // if (animate === false) {
                titleWrapper.style.display = "none";
                frameWrapper.style.display = "none";
                frame.style.display = "none";
                //}
                isDisplayed = false;
                for (var i=0; i<hideListeners.length; i++){
                    hideListeners[i](instance, selfClose);
                }
            }
        }
        function show(){
            
            if (frame.src !== displayedApp.getAppAddress()) {
                frame.src = displayedApp.getAppAddress();//hostStaticFiles + "/js/sdk/frame-wrapper.html?url=" + app.getAppAddress();    
            }
            
            titleWrapper.style.display = "block";
            frameWrapper.style.display = "block";
            frame.style.display = "block";
            isDisplayed = true;
        }

        function preLoadAppInFrame(app){
            //frame.src = app.getAppAddress();//hostStaticFiles + "/js/sdk/frame-wrapper.html?url=" + app.getAppAddress();
            titleText.textContent = app.getAppName();
            displayedApp = app;
        }

        /*** Private functions ***/
        function downloadDisplayedApp(){
            var link = displayedApp && displayedApp.getAppDownloadLink();
            if (link){
                window.open(link);
            }
        }

        function createFrameElement(style){
            frame = document.createElement('iframe');
            frameWrapper = document.createElement('div');
            frameWrapper.style.webkitOverflowScrolling = "touch";
            frameWrapper.style.overflow = "scroll";
            frameWrapper.style.width = window.innerWidth + "px";
            frameWrapper.style.margin = 0;
            frameWrapper.style.display = "none";
            frameWrapper.style.zIndex = 999;
            frameWrapper.style.marginLeft = "-8px";
            frameWrapper.style.marginTop = "45px";
            if (!(miniapp.utils.isiPhone() || miniapp.utils.isiPad())) {
                frameWrapper.style.height = window.innerHeight + "px";
            }
            frameWrapper.style.backgroundColor = "white";
            frame.width = window.innerWidth + "px";
            frame.height = "100%";
            frame.style.border = "none";

            var loader = document.createElement('img');
            loader.style.position = 'absolute';
            loader.style.top = "50%";
            loader.style.left = "50%";
            loader.style.transform = "translate(-50%, -50%)";
            loader.style.webkitTransform = "translate(-50%, -50%)";
            loader.src = "ajax-loader.gif"; //hostStaticFiles + your image name


            frame.addEventListener("load", function() {
                if (frame.src) {
                    ready = true;
                    for (var i = 0; i < readyListeners.length; i++) {
                        loader.style.display = "none";
                        readyListeners[i](instance);
                    }

                    /* CODE FOR USING FRAME-WARPPER
                    window.addEventListener("message", function(e){
                        if (e.data && e.data.miniappFrameReady){
                            if (frame.src.indexOf(e.data.url) != -1){
                                ready = true;
                                for (var i = 0; i < readyListeners.length; i++) {
                                    readyListeners[i](instance);
                                }
                            }
                        }
                    }, false);
                    */

                }
            }, true);


            frameWrapper.appendChild(loader);
            frameWrapper.appendChild(frame);

            return frameWrapper;
        }

        function createFrameTitle(style){
            var titleWrapper = document.createElement('div');

            titleWrapper.style.position = 'fixed';
            titleWrapper.style.top = 0;
            titleWrapper.style.left = 0;
            titleWrapper.style.width = '100%';
            titleWrapper.style.zIndex = 1000;
            titleWrapper.style.display = "none";

            var title = document.createElement('div');
            title.style.textAlign = "center";
            title.style.backgroundColor = "#ffffff";
            title.style.border = "1px #007AFF solid";
            title.style.height = "45px";
            title.style.position = "relative";

            var contentWrapper = document.createElement('div');
            contentWrapper.style.position = 'absolute';
            contentWrapper.style.top = "50%";
            contentWrapper.style.width = "100%";
            contentWrapper.style.left = 0;
            contentWrapper.style.transform = "translate(0, -50%)";
            contentWrapper.style.webkitTransform = "translate(0, -50%)";
            contentWrapper.style.color = "#000000";
            title.appendChild(contentWrapper);

            titleText = document.createElement('span');
            contentWrapper.appendChild(titleText);

            //titleIcon = document.createElement('img');
            //titleIcon.style.position = 'absolute';
            //titleIcon.style.top = 0;
            //titleIcon.style.left = "50%";
            //titleIcon.style.transform = "translate(-50%, 0)";
            //titleIcon.style.webkitTransform = "translate(-50%, 0)";
            //titleIcon.style.width = "45px";
            //titleIcon.style.height = "45px";
            //titleIcon.style.marginTop = "-11px";
            //contentWrapper.appendChild(titleIcon);

            var closeButton = document.createElement('div');
            closeButton.textContent = style.BackNavigationText;
            closeButton.style.float = "left";
            closeButton.style.marginLeft = "10px";
            closeButton.style.cursor = "pointer";
            if (window.getComputedStyle) {
                closeButton.style.fontFamily = window.getComputedStyle(document.body).fontFamily;
            }
            closeButton.style.fontSize = '18px';
            closeButton.style.color = "#007AFF";
            closeButton.addEventListener("touchstart", function(e) {
                lastTouch = e.touches[0];
                e.preventDefault();
                e.stopPropagation();
            },true);
            closeButton.addEventListener("touchmove", function(e) {
                lastTouch = e.touches[0];
                e.preventDefault();
                e.stopPropagation();
            },true);
            closeButton.addEventListener("touchend", function(e) {
                var bounds = closeButton.getBoundingClientRect();
                if (lastTouch.clientX >= bounds.left && lastTouch.clientX <= bounds.right &&
                lastTouch.clientY >= bounds.top && lastTouch.clientY <= bounds.bottom){
                    hide(true, true);
                }
            },true);
            contentWrapper.appendChild(closeButton);

            // var downloadButton = document.createElement('div');
            // downloadButton.textContent = "Install";
            // downloadButton.style.float = "right";
            // downloadButton.style.marginRight = "10px";
            // downloadButton.style.cursor = "pointer";
            // downloadButton.style.color = "#007AFF";
            // downloadButton.style.border = "1px #007AFF solid";
            // downloadButton.style.borderRadius = "5px";
            // downloadButton.style.padding = "5px";
            // downloadButton.style.marginTop = "-5px";
            // downloadButton.onclick = function(){
            //     downloadDisplayedApp();
            // };
            // contentWrapper.appendChild(downloadButton);

            var im = document.createElement('img');
            im.style.float = "right";
            im.style.height = "30px";
            im.style.width = "100px";

            if(window.location.origin.indexOf("haaretz") > -1){
                im.src = "http://www.haaretz.co.il/htz/images/mobileweb/logo-haaretz.png";
            }
            else if(window.location.origin.indexOf("themarker") > -1){
                im.src = "http://www.themarker.com/images/mobileweb/logo-marker@2x.png";
            }
            else{
                im.style.visibility = "hidden";
            }
            
            contentWrapper.appendChild(im);
            titleWrapper.appendChild(title);

            return titleWrapper;
        }


        function init(){
            frameWrapper = createFrameElement(options || {});
            document.body.insertBefore(frameWrapper,document.body.firstElementChild);
            titleWrapper = createFrameTitle(options || {});
            document.body.appendChild(titleWrapper);
        }

        init();
        instance = {
            getTitle: getTitle,
            preLoadAppInFrame: preLoadAppInFrame,
            show: show,
            hide: hide,
            onHide: onHide,
            isReady: isReady,
            onReady: onReady,
            getIframe: getIframe,
            remove: remove
        };
        return instance;
    }

    miniapp.addClass("DisplayFrame", DisplayFrame);
})();
/**
 * Created by MiniApp.
 */


(function(){
    document.body.onload = function() {

        console.log("MiniAppSDK init");

        var miniapp = MiniApp.getInstance();
        var panel;
        // ToDo: check publisher according to window.location.origin
        var publisherData = {"publisher": "haaretz"};

        miniapp.http.engageEvent("OpenArticle", window.location.href);

        miniapp.http.getPanelStyle(publisherData, function (panelStyle) {
            if (panelStyle && panelStyle[0]) {
                panelStyle = panelStyle[0];
            }

            panel = miniapp.Panel(panelStyle);
            var appsData = {"link": window.location.href, "publisher": "haaretz"};
            miniapp.http.getMiniapps(appsData, function (miniapps) {
                console.log("MiniAppSDK " + miniapps.length + " MiniApps");
                if (miniapps && miniapps.length && miniapps.length > 0) {
                    miniapp.http.engageEvent("ShowMiniAppPanel", window.location.href, "",
                        miniapps.map(function (miniapp) {
                            return miniapp.id;
                        }));
                }
                for (var i = 0; i < miniapps.length; i++) {
                    if (miniapps[i]) {
                        var frame = miniapp.DisplayFrame(panelStyle);
                        var app = miniapp.AppIcon(miniapps[i]);
                        panel.addMiniapp(app, frame);
                        miniapp.http.engageEvent("Impression", window.location.href, miniapps[i].id,
                            miniapps.map(function (miniapp) {
                                return miniapp.id;
                            }));
                    }
                }
                setTimeout(function () {
                    panel.show();
                }, panelStyle.LoadingTimeout || 8000);
            });

        });


        console.log("MiniAppSDK init completed");
    };

})();
/**
 * Created by MiniApp.
 */
})();

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
                        console.log("getPanelStyle Parse Error", err);
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
            engageEvent: engageEvent
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
(function(){

    /*
     * Class AppIcon
     */
     function AppIcon(options){
        if (!(options && options.icon && options.id)){
            return null;
        }

        var element;
        var id;
        var name;
        var icon;
        var appAddress;
        var appDownloadLink;
        var clickListeners = [];
        var instance;

        /*** Public functions ***/
        function getElement(){
            return element;
        }

        function onClick(cb){
            clickListeners.push(cb);
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
            var im = document.createElement('img');
            im.style.borderRadius = "5px";
            im.style.margin = "auto";
            im.style.width = "45px";
            im.style.height = "45px";
            im.style.borderRadius = '10px';
            im.src = icon;
            app.appendChild(im);

            var nameText = document.createElement('div');
            nameText.style.textAlign = "center";
            nameText.style.fontFamily = "'Roboto', sans-serif";
            nameText.style.fontSize = "11px";
            nameText.style.color = "#ffffff";
            var dispName = name;
            if (dispName.length > 12){
                dispName = dispName.substr(0, 10) + "...";
            }
            nameText.textContent = dispName;
            app.appendChild(nameText);
            app.onclick = function(){
                click();
            };
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
            onClick: onClick
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
     function Panel(options){
        if (!options){
            options = {};
        }

        var element;
        var container;
        var apps = [];
        var presentedFrame;

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
        function getMiniapps(){
            return apps;
        }

        function hide(){
            element.style.display = "none";
        }

        function show(){
            var done;

            function slideUp() {
                var newBottom = parseInt(element.style.bottom) + 1;
                element.style.bottom = newBottom + "px";
                if (newBottom < 0) {
                    setTimeout(slideUp, 1);
                } else {
                    if (typeof done === "function"){
                        done(true);
                    }
                }
            }

            function slideRight() {
                var newLeft = parseInt(element.style.left) + 4;
                element.style.left = newLeft + "px";
                if (newLeft < 0) {
                    setTimeout(slideRight, 1);
                } else {
                    element.style.left = 0;
                    if (typeof done === "function"){
                        done(true);
                    }
                }
            }
            if (apps.length > 0) {
                switch (options.AnimationType) {
                    case 0:
                    element.style.left = -window.innerWidth + "px";
                    element.style.display = "block";
                    slideRight();
                    break;
                    default:
                    element.style.bottom = -parseInt(element.style.height) + "px";
                    element.style.display = "block";
                    slideUp();
                    break;
                }
            } else {
                if (typeof done === "function"){
                    done(false);
                }
            }

            return { done: function (cb){done = cb;}};
        }

        function getElement(){
            return element;
        }

        function addMiniapp(app, frame){
            if (options.preloadFrames !== false){
                frame.preLoadAppInFrame(app);
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
        function handleFrameHide(frame, fromCloseButton){
            if (frame === presentedFrame && fromCloseButton){
                presentedFrame = null;
            }
        }

        function handleAppClick(app){
            for (var i=0; i< apps.length; i++){
                var animate = true;
                if (presentedFrame){
                    animate = false;
                }
                if (apps[i].app == app){
                    if (presentedFrame === apps[i].frame){
                        MiniApp.getInstance().http.engageEvent("CloseMiniApp", window.location.href,
                            apps[i].app.getAppId(),
                            apps.map(function(miniapp){return miniapp.app.getAppId();}));
                        apps[i].frame.hide(true, true);
                    } else {
                        MiniApp.getInstance().http.engageEvent("OpenMiniApp", window.location.href,
                            apps[i].app.getAppId(),
                            apps.map(function(miniapp){return miniapp.app.getAppId();}));
                        apps[i].frame.show(animate);
                        presentedFrame = apps[i].frame;
                    }
                } else {
                    apps[i].frame.hide(animate);
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



        function init(){
            // Add Roboto font
            addFont();
            element = createPanelElement(options);
            document.body.appendChild(element);
        }

        init();

        return {
            addMiniapp: addMiniapp,
            removeMiniapps: {},
            getMiniapps: getMiniapps,
            setStyle: {},
            getElement: getElement,
            hide: hide,
            show: show
        };
    }

    MiniApp.getInstance().addClass("Panel", Panel);
})();
/**
 * Created by MiniApp.
 */
(function(){
    /*
     * Class DisplayFrame
     */
    function DisplayFrame(options){
        if (!options){
            options = {};
        }

        var element;
        var frame;
        var title;
        var titleIcon;
        var displayedApp;
        var isDisplayed = false;
        var hideListeners= [];
        var instance;

        /*** Public functions ***/
        function onHide(cb){
            hideListeners.push(cb);
        }

        function getElement(){
            return element;
        }

        function hide(animate, selfClose) {
            function slideLeft() {
                var newLeft = parseInt(element.style.left) - 4;
                element.style.left = newLeft + "px";
                if (newLeft > (-window.innerWidth)) {
                    setTimeout(slideLeft, 1);
                } else {
                    element.style.left = -window.innerWidth + "px";
                }
            }
            function slideDown() {
                var newTop = parseInt(element.style.top) + 5;
                element.style.top = newTop + "px";
                if (newTop < parseInt(element.style.height)) {
                    setTimeout(slideDown, 1);
                } else {
                    element.style.top = -parseInt(element.style.height) + "px";
                }
            }
            if (isDisplayed) {
                if (animate === false) {
                    element.style.left = -window.innerWidth + "px";
                } else {
                    //slideDown();
                    slideLeft();
                }
                isDisplayed = false;
                for (var i=0; i<hideListeners.length; i++){
                    hideListeners[i](instance, selfClose);
                }
            }
        }
        function show(animate){
            function slideRight() {
                var newLeft = parseInt(element.style.left) + 4;
                element.style.left = newLeft + "px";
                if (newLeft < 0) {
                    setTimeout(slideRight, 1);
                } else {
                    element.style.left = 0;
                }
            }
            function slideUp(){
                var newTop =  parseInt(element.style.top) - 5;
                element.style.top = newTop+"px";
                if (newTop > 0) {
                    setTimeout(slideUp, 1);
                } else {
                    element.style.top = 0;
                }
            }
            if (animate === false){
                element.style.left = 0;
            } else {
                element.style.left = -window.innerWidth + "px";
                //slideUp();
                slideRight();
            }

            isDisplayed = true;
        }

        function preLoadAppInFrame(app){
            frame.src = app.getAppAddress();
            //element.style.top = window.innerHeight+"px";
            element.style.left = -window.innerWidth + "px";
            element.style.display = "block";
            titleIcon.src = app.getAppIcon();
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
            var displayFrame = document.createElement('div');
            title = createFrameTitle(style);
            displayFrame.appendChild(title);

            displayFrame.style.position = 'fixed';
            displayFrame.style.top = 0;
            displayFrame.style.left = 0;
            displayFrame.style.width = '100%';
            displayFrame.style.height = (window.innerHeight - 45)+"px";
            displayFrame.style.display = "none";

            frame = document.createElement('iframe');
            var frameWrapper = document.createElement('div');
            frameWrapper.style.overflow = "auto";
            frameWrapper.style.webkitOverflowScrolling = "touch";
            frameWrapper.style.height = parseInt(displayFrame.style.height)-parseInt(title.style.height) + "px";
            frameWrapper.appendChild(frame);
            frame.width = "100%";
            frame.height = parseInt(displayFrame.style.height)-parseInt(title.style.height);
            frame.style.border = "none";
            displayFrame.appendChild(frameWrapper);

            return displayFrame;
        }

        function createFrameTitle(style){
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

            titleIcon = document.createElement('img');
            titleIcon.style.position = 'absolute';
            titleIcon.style.top = 0;
            titleIcon.style.left = "50%";
            titleIcon.style.transform = "translate(-50%, 0)";
            titleIcon.style.webkitTransform = "translate(-50%, 0)";
            titleIcon.style.width = "45px";
            titleIcon.style.height = "45px";
            titleIcon.style.marginTop = "-11px";
            contentWrapper.appendChild(titleIcon);

            var closeButton = document.createElement('div');
            closeButton.textContent = style.BackNavigationText;
            closeButton.style.float = "left";
            closeButton.style.marginLeft = "10px";
            closeButton.style.cursor = "pointer";
            if (window.getComputedStyle) {
                closeButton.style.fontFamily = window.getComputedStyle(document.body).fontFamily;
            }
            closeButton.style.fontSize = '18px';
            closeButton.onclick = function(){
                hide(true, true);
            };
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
            im.src = "http://www.haaretz.co.il/htz/images/mobileweb/logo-haaretz.png";
            contentWrapper.appendChild(im);
            
            return title;
        }

        function init(){
            element = createFrameElement(options || {});
            document.body.appendChild(element);
        }

        init();
        instance = {
            getElement: getElement,
            preLoadAppInFrame: preLoadAppInFrame,
            show: show,
            hide: hide,
            onHide: onHide
        };
        return instance;
    }

    MiniApp.getInstance().addClass("DisplayFrame", DisplayFrame);
})();
/**
 * Created by MiniApp.
 */


(function(){
    console.log("MiniAppSDK init");
    
    var miniapp = MiniApp.getInstance();
    var panel;
    // ToDo: check publisher according to window.location.origin
    var publisherData = {"publisher" : "haaretz" };

    miniapp.http.engageEvent("OpenArticle", window.location.href);

    miniapp.http.getPanelStyle(publisherData, function(panelStyle){
        if(panelStyle && panelStyle[0]){
            panelStyle = panelStyle[0];
        }

        panel = miniapp.Panel(panelStyle);
        var appsData = { "link":window.location.href, "publisher" : "haaretz" };
        miniapp.http.getMiniapps(appsData, function(miniapps){
            console.log("MiniAppSDK " + miniapps.length + " MiniApps");
            if(miniapps && miniapps.length && miniapps.length > 0){
                miniapp.http.engageEvent("ShowMiniAppPanel", window.location.href, "", 
                    miniapps.map(function(miniapp){return miniapp.id;}));
            }
            for (var i=0; i<miniapps.length; i++){
                if (miniapps[i]){
                    var frame = miniapp.DisplayFrame(panelStyle);
                    var app = miniapp.AppIcon(miniapps[i]);
                    panel.addMiniapp(app, frame);
                    miniapp.http.engageEvent("Impression", window.location.href, miniapps[i].id, 
                        miniapps.map(function(miniapp){return miniapp.id;}));
                }
            }
        });

        setTimeout(function(){panel.show();}, 8001);
    });


    console.log("MiniAppSDK init completed");

})();
/**
 * Created by MiniApp.
 */
})();

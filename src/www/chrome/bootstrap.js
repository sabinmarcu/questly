(function(){
    "use strict";

    var win = chrome.app.window.current();
    var actions = {
        close: function() {
            win.close();
        },
        maximize: function() {
            win.maximize();
        },
        fullscreen: function() {
            win.fullscreen();
        },
        minimize: function() {
            win.minimize();
        },
        restore: function() {
            win.restore();
        },
    }, conditions = {
        close: function() { return true; },
        maximize: function() { return !win.isMaximized() && !win.isFullscreen(); },
        minimize: function() { return !win.isMinimized() && !win.isFullscreen(); },
        restore: function() { return win.isMaximized() || win.isMinimized(); },
        fullscreen: function() { return !win.isFullscreen(); },
        fullscreenexit: function() { return win.isFullscreen(); },
    }, handlerMap = {
        close: actions.close,
        maximize: actions.maximize,
        minimize: actions.minimize,
        restore: actions.restore,
        fullscreen: actions.fullscreen,
        fullscreenexit: actions.restore,
    }, elements = ["close", "maximize", "minimize", "restore", "fullscreen", "fullscreenexit"];

    var iconMap = elements.reduce(function(acc, key) {
        acc[key] = document.getElementById(key);
        return acc;
    }, {});

    var bar = document.getElementById("chromepanel"), data = {};
    var down = function(e) {
        if (!win.isFullscreen()) {
            let bounds = win.getBounds();
            data.x = e.screenX - bounds.left;
            data.y = e.screenY - bounds.top;
        }
    }, move = function(e) {
        if (data.x && data.y) {
            win.moveTo(e.screenX - data.x, e.screenY - data.y)
        }

    }, up = function(e) {
        if (data.x && data.y) {
            delete data.x
            delete data.y
        }
    };

    bar.addEventListener("mousedown" , down);
    window.addEventListener("mousemove" , move);
    window.addEventListener("mouseup"   , up);
    window.addEventListener("mouseleave", up);

    var refresh = function() {
        elements.map(function(el) {
            if (conditions[el]()) {
                iconMap[el].style.display = "inline";
            } else {
                iconMap[el].style.display = "none";
            }
        });
        if (win.isFullscreen()) {
            bar.className = "fullscreen";
        } else {
            bar.className = "";
        }
    }

    elements.map(function(el) {
        iconMap[el].addEventListener("click", function() {
            handlerMap[el]();
            setTimeout(refresh, 500);
            refresh();
        });
    });
    refresh();

})();

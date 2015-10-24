(function() {
    'use strict';
    let s = document.createElement("script"), u = __BASEURL__[__BASEURL__.length - 1] === "/" ? __BASEURL__ : __BASEURL__ + "/";
    s.src = u + "app.js";
    s.id = "app";
    document.head.appendChild(s);
})();

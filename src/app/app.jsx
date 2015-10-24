(function () {
    'use strict';

    console.timeStamp("Start");

    require("babel/polyfill");
    // require("!!style!css?-modules!mdi/css/materialdesignicons.css");

    let React = require('react');
    let ReactDOM = require("react-dom");
    // let injectTapEventPlugin = require('react-tap-event-plugin');
    let Main = require('./components/main');

    let {renderDevTools, createStore} = require("./helpers/devTools");

    let { combineReducers } = require('redux');
    let { Provider } = require('react-redux');
    let { arrayToReducerMap, loadReducers } = require("./helpers/util");

    // For dev
    if (__DEV__) {
        window.React = React;
    }

    // Material-UI requirement
    // injectTapEventPlugin();

    console.timeStamp("Required intial stuff");

    // Load Reducers
    let ctx = require.context('./reducers/', true, /\.\/?(.*)\/((?:_init|[^\/]+\.reducer)\.(?:js|jsx|ls))$/gm);
    let reducers = loadReducers(ctx);

    // Create the Redux store
    const reducer = combineReducers( reducers );
    const store = createStore(reducer);

    console.timeStamp("Loaded reducers");


    let meta;
    meta = document.createElement("meta");
    meta.setAttribute("name", "viewport");
    meta.setAttribute("content", "height=device-height, width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1");
    document.head.appendChild(meta);

    meta = document.createElement("link");
    meta.setAttribute("rel", "apple-touch-icon");
    meta.setAttribute("href", "512.png");
    document.head.appendChild(meta);
    meta = document.createElement("link");
    meta.setAttribute("rel", "apple-touch-icon");
    meta.setAttribute("sizes", "152x152");
    meta.setAttribute("href", "152.png");
    document.head.appendChild(meta);
    meta = document.createElement("link");
    meta.setAttribute("rel", "apple-touch-icon");
    meta.setAttribute("sizes", "120x120");
    meta.setAttribute("href", "120.png");
    document.head.appendChild(meta);
    meta = document.createElement("link");
    meta.setAttribute("rel", "apple-touch-icon");
    meta.setAttribute("sizes", "76x76");
    meta.setAttribute("href", "76.png");
    document.head.appendChild(meta);

    meta = document.createElement("meta");
    meta.setAttribute("name", "apple-mobile-web-app-capable");
    meta.setAttribute("content", "yes");
    document.head.appendChild(meta);

    meta = document.createElement("link");
    meta.setAttribute("rel", "icon");
    meta.setAttribute("href", "icon.ico");
    document.head.appendChild(meta);

    // Load MDI from a CDN (lower app size)
    meta = document.createElement("link");
    meta.setAttribute("href", "https://cdn.materialdesignicons.com/1.1.34/css/materialdesignicons.min.css");
    meta.setAttribute("rel", "stylesheet");
    document.head.appendChild(meta);

    document.title = __NAME__;

    console.timeStamp("Set meta tags and title");

    let wrapper = document.createElement("div");

    // Mount the app and dev tools
    ReactDOM.render(
        (<div>
            <Provider store={store}>
                <Main />
            </Provider>
            {renderDevTools(store)}
        </div>)
    , wrapper);

    wrapper.setAttribute("id", "ApplicationWrapper");
    document.body.appendChild(wrapper);

    console.timeStamp("Done Rendering");

})();

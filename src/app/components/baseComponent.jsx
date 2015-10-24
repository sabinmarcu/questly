import React from "react";
import { extend, bindAll } from "../helpers/util";

import baseStyles from "./_baseStyles.styl";

const _extend = (owner, file, req, bind = true) => {
    const prop = `${file}s`;
    try {
        Object.defineProperty(owner, prop, {
            get: () => bind && bindAll(owner, req(`./${file}`)) || req(`./${file}`),
        });

    } catch (e) {
        console.warn(`Couldn't load ${file[0].toUpperCase()}${file.substr(1)}s for "${owner.name || owner.displayName || owner.toString()}"`, e);
    }
}

export default class EnhancedComponent extends React.Component {
    constructor(ctx = require, ...args) {
        super(...args);
        _extend(this, "view", ctx);
        _extend(this, "style", ctx, false);
    }

    render() {
        return (this.views && this.views.render && this.views.render()) || <span>Not implemented</span>;
    }
}

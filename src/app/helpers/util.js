"use strict";

import _ from "lodash";
import jQuery from "jquery";
import memoize from "./memoize";

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

const FILES = [];

class Util {

    // TODO: Refractor the actions and reducer functions
    // Can be a lot more useful if they're refractored and abstracted to be used by both actions and reducers

    static getFiles(cb) {
        jQuery.get(Util.suffixSlash(window.location) + "files", cb);
    }
    static getDescription(cb, item = window.location + "/readme.md") {
        jQuery.get(item, cb);
    }
    static suffixSlash(str) {
        str = str + "";
        return str[str.length - 1] === "/" ? str : str + "/";
    }

    static *entries(obj) {
        for (let key of Object.keys(obj)) {
            yield [key, obj[key]];
        }
    }

    static reflection(func) {
        let fnStr = func.toString().replace(STRIP_COMMENTS, "");
        let result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
        if(result === null) { result = []; }
        return result;
    }

    static get actions() {
        return Util.loadActionsMemoized(require.context('../actions/', true, /\.\/?(.*)\/((?:[^\/]+)\.(?:js|jsx|ls))$/gm));
    }

    static loadActions(ctx) {
        return Util.combineActionMap(ctx, Util.arrayToActionMap(ctx.keys().join("\n")));
    }

    static arrayToActionMap(arr) {
        const r = /\.\/?(.*)\/((?:[^\/]+)\.(?:js|jsx|ls))$/gm;
        return arr
            .replace(r, (matched, $1, $2, offset, string) => `${$2}|${$1.replace(/\//, ".")}|${matched}$`)
            .replace(/(\n|\t)/g, "")
            .split("$")
            .map((it) => it.length > 0 ? {
                action: it.split("|")[0]
                    .replace(/(.*)\.(?:js|jsx|ls)$/g, "$1")
                    .replace(/(\.)*([A-Z])*/g, (matched, $1, $2) =>
                        matched.length > 0 ?
                            (($1 && "_") || ($2 && `_${$2.toLowerCase()}`))
                        : ""
                    ).toUpperCase(),
                prefix: it.split("|")[1].toUpperCase(),
                full: it.split("|")[2],
            } : null
        ).filter((it) => it != null ? it : undefined)
    }

    static combineActionMap(ctx, array) {
        return array.reduce((prev, set) => {
            const _type = `${set.prefix}:${set.action}`, _directType = set.action.toLowerCase().replace(/_([a-z])/g, (matched, $1) =>
                matched.length > 0 ?
                    $1.toUpperCase()
                : ""), _action = ctx(set.full), _prefix = set.prefix.toLowerCase();
            prev[_prefix] = prev[_prefix] || {};
            prev[_prefix][_directType] = (...args) => {
                return _.extend(_action(...args), {type: _type});
            }
            return prev;
        }, {});
    }

    static get loadActionsMemoized() {
        return memoize(Util.loadActions);
    }

    static get reducers() {
        return Util.loadReducers(require.context('../reducers/', true, /\.\/?(.*)\/((?:_init|[^\/]+\.reducer)\.(?:js|jsx|ls))$/gm));
    }

    static loadReducers(ctx) {
        return Util.compressAllReducers(Util.arrayToReducerMap(ctx.keys().join("\n")).reduce((prev, set) => {
            const _type = `${set.prefix}:${set.reducer}`, _directType = set.reducer, _reducer = ctx(set.full), _prefix = set.prefix.toLowerCase();
            prev[_prefix] = prev[_prefix] || [];
            prev[_prefix].push((state, action) => {
                if (_directType === "_INIT" || _type === action.type) {
                    return _reducer(state, action);
                }
                return state;
            });
            return prev;
        }, {}));
    }

    static compressReducers(reducers) {
        return (state, action) =>
            reducers.reduce(
                (p, r) => r(p, action), state
            )
    }

    static compressAllReducers(reducerObject) {
        return [...Util.entries(reducerObject)].reduce((prev, [set, reducers]) =>
            (prev[set] = Util.compressReducers(reducers)) && prev || prev
        , {});
    }

    static arrayToReducerMap(arr) {
        const r = /\.\/?(.*)\/((?:_init|[^\/]+\.reducer)\.(?:js|jsx|ls))$/gm;
        return arr
            .replace(r, (matched, $1, $2, offset, string) => `${$2}|${$1.replace(/\//, ".")}|${matched}$`)
            .replace(/(\n|\t)/g, "")
            .split("$")
            .map((it) => it.length > 0 ? {
                reducer: it.split("|")[0]
                    .replace(/([^(reducer)]*)(?:\.reducer)?\.(?:js|jsx|ls)$/g, "$1")
                    .replace(/(\.)*([A-Z])*/g, (matched, $1, $2) =>
                        matched.length > 0 ?
                            (($1 && "_") || ($2 && `_${$2.toLowerCase()}`))
                        : ""
                    ).toUpperCase(),
                prefix: it.split("|")[1].toUpperCase(),
                full: it.split("|")[2],
            } : null
        ).filter((it) => it != null ? it : undefined)
    }

    static bindAll(owner, o) {
        let keys = Object.getOwnPropertyNames(o), ret = {};
        for (let k of keys) {
            let descriptor = Object.getOwnPropertyDescriptor(o, k), newdesc = {};
            if (descriptor.value != null && (typeof descriptor.value.apply) !== "undefined") {
                newdesc.value = descriptor.value.bind(owner);
            }
            if ((typeof descriptor.get) !== "undefined") {
                newdesc.get = descriptor.get.bind(owner);
            }
            if ((typeof descriptor.set) !== "undefined") {
                newdesc.set = descriptor.set.bind(owner);
            }
            Object.defineProperty(ret, k, newdesc);
        }
        return ret;
    }

    static extend(dest) {
        let l = arguments.length;
        const excl = ["$scope", "constructor"];
        if (l < 2 && dest == null) {
            return dest;
        }
        for (let i = 1; i < l; i++) {
            let hasDescriptor = false, bindMode, owner, shouldBind = true, useSelfbind = false;
            let o = arguments[i];
            if ((typeof o.isBindingDescriptor) !== "undefined" && (typeof o.object) !== "undefined") {
                hasDescriptor = true; bindMode = o.bind_mode || false; owner = o.owner || null; shouldBind = o.bind !== undefined ? o.bind : shouldBind; useSelfbind = o.useSelfbind || o.selfbind || useSelfbind; o = o.object;
            }
            let keys = Object.getOwnPropertyNames(o);
            for (let k of keys) {
                if (excl.indexOf(k) < 0) {
                    try {
                        if (hasDescriptor) {
                            if (owner != null) {
                                if (bindMode === true || bindMode === "direct") {
                                    dest[k] = o[k].bind(owner);
                                }
                                else {
                                    if (bindMode === "descriptor") {
                                        try {
                                            let descriptor = Object.getOwnPropertyDescriptor(o, k), sbdescriptor, val = null, get = null, set = null;
                                            if (descriptor.value != null && (typeof descriptor.value.apply) !== "undefined") {
                                                if (useSelfbind) {
                                                    val = descriptor.value;
                                                    delete descriptor.value;
                                                } else {
                                                    descriptor.value = descriptor.value.bind(owner);
                                                }
                                            }
                                            if ((typeof descriptor.get) !== "undefined") {
                                                if (useSelfbind) {
                                                    get = descriptor.get;
                                                    delete descriptor.get;
                                                } else {
                                                    descriptor.get = descriptor.get.bind(owner);
                                                }
                                            }

                                            if ((typeof descriptor.set) !== "undefined") {
                                                if (useSelfbind) {
                                                    set = descriptor.set;
                                                    delete descriptor.set;
                                                } else {
                                                    descriptor.set = descriptor.set.bind(owner);
                                                }
                                            }
                                            if (useSelfbind) {
                                                delete descriptor.writable;
                                                descriptor.get = function() {
                                                    let obj = {configurable: true, writable: true};
                                                    if (val !== null) {
                                                        const bound = val.bind(owner);
                                                        obj.value = bound;
                                                    }
                                                    if (get !== null) {
                                                        const bound = get.bind(owner);
                                                        obj.get = bound;
                                                    }
                                                    if (set !== null) {
                                                        const bound = set.bind(owner);
                                                        obj.set = bound;
                                                    }
                                                    Object.defineProperty(dest, k, obj);
                                                }
                                            }
                                            Object.defineProperty(dest, k, descriptor);
                                        } catch (e) {
                                            console.log("ERROR", e);
                                            throw e;
                                        }
                                    }
                                }
                            }
                            else {
                                if (bindMode === "descriptor") {
                                    let descriptor = Object.getOwnPropertyDescriptor(o, k), val = null, get = null, set = null;
                                    if (descriptor.value != null && (typeof descriptor.value.apply) !== "undefined") {
                                        if (useSelfbind) {
                                            val = descriptor.value;
                                            delete descriptor.value;
                                        } else {
                                            descriptor.value = descriptor.value;
                                        }
                                    }
                                    if ((typeof descriptor.get) !== "undefined") {
                                        if (useSelfbind) {
                                            get = descriptor.get;
                                            delete descriptor.get;
                                        } else {
                                            descriptor.get = descriptor.get;
                                        }
                                    }

                                    if ((typeof descriptor.set) !== "undefined") {
                                        if (useSelfbind) {
                                            set = descriptor.set;
                                            delete descriptor.set;
                                        } else {
                                            descriptor.set = descriptor.set;
                                        }
                                    }
                                    if (useSelfbind) {
                                        delete descriptor.writable;
                                        descriptor.get = function() {
                                            let obj = {configurable: true, writable: true};
                                            if (val !== null) {
                                                const bound = val.bind(this);
                                                obj.value = bound;
                                            }
                                            if (get !== null) {
                                                const bound = get.bind(this);
                                                obj.get = bound;
                                            }
                                            if (set !== null) {
                                                const bound = set.bind(this);
                                                obj.set = bound;
                                            }
                                            Object.defineProperty(this, k, obj);
                                        }
                                    }
                                    Object.defineProperty(dest, k, descriptor);
                                } else {
                                    dest[k] = o[k];
                                }
                            }
                        }
                        else { dest[k] = o[k]; }
                    } catch (e) {
                        continue;
                    }
                }
            }
        }
        return dest;
    }

}

export default Util;

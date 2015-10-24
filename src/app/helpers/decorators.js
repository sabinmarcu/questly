/*global Factories*/
"use strict";

import is from "check-types";
import _ from "lodash";

let uuids = new WeakMap();

const SIGNALS = {
    "RED": 0,
    "YELLOW": 1,
    "GREEN": 2,
};

class Decorator {
    static installdebugger(target) {
        let name = target.name || "", section = null, r = /^(?:[A-Z][a-z]*)+([A-Z][a-z]*)$/.exec(name);
        if (r !== null) {
            section = r[1];
        }

        if (section) {
            name = `${section}:${name.replace(section, "")}`;
        }
        let dbg = new Factories.debugger(name);
        _.extend(target, dbg);
        _.extend(target.prototype, dbg);

        return target;
    }

    static uuidify(target) {
        Object.defineProperty(target.prototype, "uuid", {
            enumerable: false,
            configurable: false,
            get: function() {
                if (!uuids.has(this)) {
                    uuids.set(this, Math.uuid());
                }
                return uuids.get(this);
            },
        });
    }

    static installsemaphor(target) {
        Object.defineProperty(target.prototype, "SIGNALS", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: SIGNALS,
        });
    }

    static semaphorise(t = 2, k = "signal", d) {
        let reqsignal = 2, signalTarget = "signal", handler = function(target, key, descriptor) {
            let v = descriptor.value, g = descriptor.get, s = descriptor.set;
            if (is.assigned(v)) {
                descriptor.value = function(...args) {
                    let test = (is.boolean(this[signalTarget]) && this[signalTarget]) || (is.number(this[signalTarget]) && this[signalTarget] >= reqsignal);
                    if (test) {
                        return v.call(this, ...args);
                    } else {
                        return this;
                    }
                };
            }
            if (is.assigned(g)) {
                descriptor.get = function() {
                    let test = (is.boolean(this[signalTarget]) && this[signalTarget]) || (is.number(this[signalTarget]) && this[signalTarget] >= reqsignal);
                    if (test) {
                        return g.call(this);
                    } else {
                        return this;
                    }
                };
            }
            if (is.assigned(s)) {
                descriptor.set = function(...args) {
                    let test = (is.boolean(this[signalTarget]) && this[signalTarget]) || (is.number(this[signalTarget]) && this[signalTarget] >= reqsignal);
                    if (test) {
                        return s.call(this, ...args);
                    } else {
                        return this;
                    }
                };
            }
        };
        if (is.string(t) && (typeof SIGNALS[t.toUpperCase()]) !== "undefined") {
            reqsignal = SIGNALS[t.toUpperCase()];
            signalTarget = k || "signal";
        } else if (is.number(t)) {
            reqsignal = t || 0;
            signalTarget = k || "signal";
        } else {
            return handler(t, k, d);
        }
        return handler;
    }

    static selfbind(target, key, descriptor) {
        const fn = descriptor.value;
        delete descriptor.value;
        delete descriptor.writable;
        descriptor.get = function() {
            const bound = fn.bind(this);
            Object.defineProperty(this, key, {
                configurable: true,
                writable: true,
                value: bound,
            });
            return bound;
        };
    }

    static pubsubify(target) {
        target.__channels__ = target.prototype.__channels__ = {};
        let delegateEvent = function(event, handler, owner) {
            if (!is.assigned(this.__channels__)) {
                this.__channels__ = {};
            }
            if (!is.assigned(this.__channels__[event])) {
                this.__channels__[event] = [];
            }
            let index = this.__channels__[event].length;
            this.__channels__[event].unshift(function(...args) {
                return handler.bind(owner)(...args);
            });
            return index;
        }.bind(target), subscribe = function(event, handler) {
            this.delegateEvent(event, handler, this);
        }.bind(target), publish = function(event, ...args) {
            if (!is.assigned(this.__channels__)) {
                return null;
            }
            if (is.assigned(event) && is.assigned(this.__channels__[event])) {
                if (this.log || target.log) {
                    (this.log || target.log)(`Emitting '${event}'`, ...args);
                }
                for (let handler of this.__channels__[event]) {
                    handler(...args);
                }
            }
            return this;
        }.bind(target);

        _.extend(target, {delegateEvent, subscribe, publish});
        _.extend(target.prototype, {delegateEvent, subscribe, publish});
    }

}

export default Decorator;

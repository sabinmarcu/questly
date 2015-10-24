
const Memos = new WeakMap();
const initMemo = (method) => {
    if (!Memos.has(method)) {
        Memos.set(method, new Map());
    }
    return Memos.get(method);
}, memoize = (method) => {

    const map = initMemo(method);
    let ret = (...args) => {
        let ret = null, _args = JSON.stringify(args);

        if (!map.has(_args)) {
            ret = method(...args);
            map.set(_args, ret);
        } else {
            ret = map.get(_args);
        }

        return ret;
    };
    ret.refresh = refresh(method);
    return ret;
}, refresh = (method) => {
    const map = initMemo(method);
    return (...args) => {
        let ret = method(...args), _args = JSON.stringify(args);
        map.set(_args, ret);
        return ret;
    };
};

memoize.refresh = refresh;
export default memoize;

// # _m = new WeakMap();
// #
// # _init    = (m) -> (if not _m.has m then _m.set m, new Map! else true) and _m.get m
// # _refresh = (m) ->
// #     (__m = _init m) and (...a) ->
// #         (_r = m ...a) and (_a = JSON.stringify a) and (__m.set _a, _r) and _r
// # _memo    = (m) ->
// #     _rm = (__m = _init m) and (...a) ->
// #         (_a = JSON.stringify a) and (if __m.has _a then __m.get _a else (
// #             (_r = m ...a) and (__m.set _a, _r) and _r
// #         ))
// #         (_a = JSON.stringify a) and (if __m.has _a then __m.get _a else (
// #             (_r = m ...a) and (__m.set _a, _r) and _r
// #         ))
// #     _rm.refresh = _refresh
// #     _rm
// #
// # module.exports = _memo

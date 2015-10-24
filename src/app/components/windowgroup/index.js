import BaseComponent from "../baseComponent";
import { selfbind } from "../../helpers/decorators";
import _ from "lodash";

const swap = (a, i1, i2) => _.clone(a).map((it, index) => 
    (index === i1 && a[i2]) ||
    (index === i2 && a[i1]) || 
    a[index]
);

export default class WindowGroupComponent extends BaseComponent {

    state = {
        selected: -1,
        items: [],
        width: window.innerWidth,
        stage: "default",
        staticLocations: [],
        locations: [],
        widths: [],
        verticals: [],
        zindexes: [],
        percentages: [],
        moving: false,
    }

    offsets = {
        zoom: 25,
        top: 50,
        duration: 500,
    }

    constructor(...args) {
        super(require, ...args);
    }

    componentDidMount() {
        this.refreshThings();
        setTimeout(this.refreshThings, 100);
        setTimeout(this.refreshThings, 200);
        window.addEventListener("resize", () => {
            this.refreshThings();
            setTimeout(this.refreshThings, 100);
            setTimeout(this.refreshThings, 200);
        });
        window.addEventListener("mouseup", this.mouseUp);
        window.addEventListener("mouseleave", this.mouseUp);
    }

    @selfbind
    refreshThings() {
        console.log("Refreshing Things");
        let widths = this.props.children.map(it => it.props.width),
            percentages = widths.map(it => it / this.sizes.width);
        widths = widths.map((it, index) => it + (this.sizes.margin < 0 && this.sizes.margin * percentages[index] ));
        let prev = this.sizes.margin > 0 && this.sizes.margin / 2 || 0, locs = widths.map(
                (it, index) => {
                    let ret = prev; prev = prev + it;
                    return ret;
                }
            );
        this.setState({
            items: this.props.children,
            staticLocations: locs,
            locations: locs,
            widths: widths,
            percentages: percentages,
            verticals: Array.apply(null, Array(this.props.children.length)).map(it => this.offsets.top),
            zindexes: Array.apply(null, Array(this.props.children.length)).map(it => 1),
            width: window.innerWidth,
        })
    }

    setTimer(func, time = 50) {
        this.timer = setTimeout(() => {
            func();
            this.unsetTimer();
        }, time);
    }

    checkTimer(accept, reject) {
        if (!!this.timer) {
            reject();
        } else {
            accept();
        }
    }

    unsetTimer() {
        this.checkTimer(function(){}, () => {
            clearTimeout((this.timer));
            delete this.timer;   
        });
    }

    @selfbind
    mouseDown(id, ev) {
        let capture = ev.target.dataset["capture"], node = ev.target;
        while (!capture && node) {
            if (node.dataset && node.dataset["nocapture"]) break;
            capture = node.dataset && node.dataset["capture"] && !node.dataset["root"];
            node = node.parentNode;
        }
        if (capture){
            const idx = this.findIndexOfId(id);
            this.setState({
                selected: id, 
                stage: "activating",
                locations: this.state.staticLocations.map(
                    (it, index) => it + this.offsetWidth(index, idx) - ((idx === index) && this.offsets.zoom / 2 || 0)
                ),
                widths: this.state.items.map((it, index) => it.props.width + (this.sizes.margin < 0 && this.sizes.margin * this.state.percentages[index]) + (index === idx && this.offsets.zoom || 0)),
                verticals: this.state.items.map((it, index) => this.offsets.top - (index === idx && this.offsets.zoom || 0)),
                zindexes: this.state.items.map((it, index) => (index === idx && 2 || 1)),
            });
            this.unsetTimer();
            this.setTimer(() => this.setState({stage: "activated"}));
            ev.preventDefault();
        }
    }

    @selfbind
    mouseUp() {
        this.setState({
            stage: "deactivating",
            locations: _.clone(this.state.staticLocations),
            widths: this.state.items.map((it, index) => it.props.width + (this.sizes.margin < 0 && this.sizes.margin * this.state.percentages[index])),
            verticals: Array.apply(null, Array(this.props.children.length)).map(it => this.offsets.top),
            zindexes: Array.apply(null, Array(this.props.children.length)).map(it => 1),
        });
        this.unsetTimer();
        this.setTimer(() => {
            this.setState({selected: -1, stage: "default"});
        }, this.offsets.duration);
    }

    @selfbind
    mouseOver(id, ev, target = null) {
        if (id === null) {
            let node = target;
            while (node && !id) {
                id = node.dataset && node.dataset["captureIndex"];
                node = node.parentNode;
            }
            id = parseInt(id);
        }
        const idx = this.findIndexOfId(id);
        if (this.state.stage === "activated" && id !== this.state.moving && this.state.selected !== id) {
            console.log("SWAPPING", id, this.state.selected)
            const swapped = swap(this.state.items, idx, this.findIndexOfId(this.state.selected)), swappedLocations = swap(this.state.staticLocations, idx, this.findIndexOfId(this.state.selected)), swappedPercentages = swap(this.state.percentages, idx, this.findIndexOfId(this.state.selected));
            let prev = this.sizes.margin > 0 && this.sizes.margin / 2 || 0, locs = swapped.map(
                (it, index) => {
                    let ret = prev; prev = prev + it.props.width + (this.sizes.margin < 0 && this.sizes.margin * swappedPercentages[index]);
                    return ret;
                }
            );
            console.log("LOCS", locs);
            this.setState({
                moving: id,
                items: swapped, 
                locations: locs.map(
                    (it, index) => it + this.offsetWidth(index, idx) - ((idx === index) && this.offsets.zoom / 2 || 0)
                ),
                staticLocations: locs,
                percentages: swappedPercentages,
                widths: swapped.map((it, index) => it.props.width + (this.sizes.margin < 0 && this.sizes.margin * swappedPercentages[index])+ (index === idx && this.offsets.zoom || 0)),
                verticals: swapped.map((it, index) => this.offsets.top - (index === idx && this.offsets.zoom || 0)),
                zindexes: swapped.map((it, index) => (index === idx && 2 || 1)),
            });
            this.setTimer(() => this.setState({moving: null}), this.offsets.duration);
        }
        ev.preventDefault();
        return null;
    }

    widthUntil(id, items = this.state.items, frm) {
        frm = frm || 0;
        console.log("Getting width between", id, frm);
        let val = items.reduce(
            (prev, it, index) => {
                let foundLast = prev.foundLast, foundFirst = prev.foundFirst;
                if (!prev.foundLast) {
                    if (index === frm) {
                        foundFirst = true;
                    }
                    if (index === id) {
                        foundLast = true;
                    }
                    if (!foundLast && foundFirst) {
                        return {foundLast, foundFirst, value: prev.value + it.props.width};
                    } else {
                        return {foundLast, foundFirst, value: prev.value};
                    }
                }
                return prev;
            }
        , {value: 0, foundLast: false, foundFirst: false}).value
        return val;
    }

    offsetWidth(id, selected = this.findIndexOfId(this.state.selected)) {
        if (selected === -1) {
            return 0;
        }
        return id > selected && this.offsets.zoom || id < selected && (0 - this.offsets.zoom);
    }

    findIndexOfId(idx) {
        return this.state.items.reduce((prev, it, index) => it.props.index === idx ? index : prev, -1);
    }

    getStyles(id) {
        const idx = this.findIndexOfId(id), sidx = this.findIndexOfId(this.state.selected);
        return { 
            top: this.state.verticals[this.findIndexOfId(id)], 
            bottom: this.state.verticals[this.findIndexOfId(id)],
            width: this.state.widths[this.findIndexOfId(id)],
            display: "flex",
            left: this.state.locations[this.findIndexOfId(id)],
            transitionDuration: `${this.offsets.duration}ms`,
            zIndex: this.state.zindexes[this.findIndexOfId(id)],
            borderTopLeftRadius: 
                (
                    (id === this.state.selected) ||
                    (this.state.selected !== -1 && 
                        (idx === 0) ||
                        (idx === sidx + 1)
                    )
                ) && "2px" || "0px",
            borderTopRightRadius: 
                (
                    (id === this.state.selected) ||
                    (this.state.selected !== -1 && 
                        (idx === this.state.items.length - 1) ||
                        (idx === sidx - 1)
                    )
                ) && "2px" || "0px",
            borderBottomLeftRadius: 
                (
                    (id === this.state.selected) ||
                    (this.state.selected !== -1 && 
                        (idx === 0) ||
                        (idx === sidx + 1)
                    )
                ) && "2px" || "0px",
            borderBottomRightRadius: 
                (
                    (id === this.state.selected) ||
                    (this.state.selected !== -1 && 
                        (idx === this.state.items.length - 1) ||
                        (idx === sidx - 1)
                    )
                ) && "2px" || "0px",
        };
    } 

    getBackgroundStyle(which) {
        const sidx = this.findIndexOfId(this.state.selected);
        switch (which) {
            case "left": 
                if (sidx === -1 || sidx === 0) {
                    return {
                        display: "none",
                    }
                } else {
                    let styl = {
                        left: this.state.staticLocations[0],
                        top: this.offsets.top,
                        bottom: this.offsets.top,
                        width: this.widthUntil(sidx),
                        transitionDuration: "0ms",
                    }
                    if (this.state.stage === "activated") {
                        styl = {
                            left: this.state.locations[0],
                            top: this.state.verticals[0],
                            bottom: this.state.verticals[0],
                            width: this.widthUntil(sidx),
                            transitionDuration: `${this.offsets.duration}ms`,
                        }
                    }
                    return styl;
                }
            case "right": 
                if (sidx === -1) {
                    return {
                        display: "none",
                    }
                } else {
                    const idx = sidx;
                    let styl = {
                        left: this.state.staticLocations[idx + 1],
                        top: this.offsets.top,
                        bottom: this.offsets.top,
                        width: this.widthUntil(this.state.items.length, this.state.items, idx + 1),
                        transitionDuration: "0ms",
                    }
                    if (this.state.stage === "activated") {
                        styl = {
                            left: this.state.locations[idx + 1],
                            top: this.state.verticals[idx + 1],
                            bottom: this.state.verticals[idx + 1],
                            width: this.widthUntil(this.state.items.length, this.state.items, idx + 1),
                            transitionDuration: `${this.offsets.duration}ms`,
                        }
                    }
                    return styl;
                }
            case "center": 
                if (sidx === -1) {      
                    return {
                        left: this.sizes.margin / 2,
                        top: this.offsets.top,
                        bottom: this.offsets.top,
                        width: this.sizes.width,
                        transitionDuration: `0ms`,
                    }
                } else {
                    let styl = {
                        left: this.state.staticLocations[sidx],
                        top: this.offsets.top,
                        bottom: this.offsets.top,
                        width: this.state.items[sidx].props.width,
                    };
                    if (this.state.stage === "activated") {
                        styl = {...styl, 
                            left: this.state.locations[sidx],
                            top: this.state.verticals[sidx],
                            bottom: this.state.verticals[sidx],
                            width: this.state.widths[sidx],
                            transitionDuration: `${this.offsets.duration}ms`,
                        };
                    } else {
                        styl.transitionDuration = "0ms";
                    }
                    return styl;
                }
        }
    }

    get sizes() {
        let width = this.props.children.reduce((prev, it) => prev + it.props.width, 0),
            wmargin = this.state.width - width;

        return { width, margin: wmargin };
    }

    get rootStyles() {
        return {
            left: this.sizes.margin / 2,
            top: this.offsets.top,
            bottom: this.offsets.top,
            right: this.sizes.margin / 2,
        }
    }
}
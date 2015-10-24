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
        stage: "deactivated",
        swap: -1,
    }

    constructor(...args) {
        super(require, ...args);
    }

    componentDidMount() {
        let children = this.props.children;
        this.setState({
            items: children,
        });
    }

    setTimer(func, time = 50) {
        this.timer = setTimeout(func, time);
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
    mouseDown(id) {
        this.setState({selected: parseInt(id), stage: "activating"});
        this.unsetTimer();
        this.setTimer(() => this.setState({stage: "activated"}), 50)
    }

    @selfbind
    mouseUp() {
        console.log("END");
        this.setState({stage: "deactivating"});
        this.unsetTimer()
        this.setTimer(() => this.setState({selected: -1, stage: "deactivated", swap: -1}), 1000);
    }

    @selfbind
    mouseOver(id, ev) {
        if (this.state.stage === "activated") {
            console.log("OVER", id);
            if (id === this.state.selected) {
                this.setState({swap: -1});
            } else {
                const target = ev.target, rect = target.getClientRects()[0], midPoint = rect.left + rect.width / 2, pointerX = ev.clientX;
                console.log("EVENT", id, midPoint, pointerX < midPoint ? "left" : "right");
            }   
        }
    }
}
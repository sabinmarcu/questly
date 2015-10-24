import BaseComponent from "../../baseComponent";

export default class WindowGroupContainerComponent extends BaseComponent {

    state = {
        activated: false,
    }

    constructor(...args) {
        super(require, ...args);
    }
}
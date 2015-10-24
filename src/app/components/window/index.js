import BaseComponent from "../baseComponent";

export default class WinowComponent extends BaseComponent {
    static defaultProps = {
        width: 300,
    }

    constructor(...args) {
        super(require, ...args);
    }
}
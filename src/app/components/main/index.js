import React from "react";
import EnhancedComponent from "../baseComponent";
import _ from "lodash";
import { selfbind } from "../../helpers/decorators";

export default class Main extends EnhancedComponent {

    constructor(...args) {
        super(require, ...args);
    }

    @selfbind
    dragStart(e) {
        console.log("START", e);
    }

    @selfbind
    dragEnd(e) {
        console.log("END", e);
    }
}

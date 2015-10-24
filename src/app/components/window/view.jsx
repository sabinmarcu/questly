import React from "react";
import { VelocityComponent } from "velocity-react";

export default class WindowViews {
    static render() {
        return <div className={[this.styles.wrapper, this.props.className || ""].join(" ")}>
            <h1>Title {this.props.index}</h1>
            <div>
                {this.props.children}
            </div>
        </div>;
    }
}
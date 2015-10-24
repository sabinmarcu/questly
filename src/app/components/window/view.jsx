import React from "react";
import { VelocityComponent } from "velocity-react";

export default class WindowViews {
    static render() {
        return <div dataCapture={true} className={[this.styles.wrapper, this.props.className || ""].join(" ")}>
            <h1 dataCapture={true}>Title {this.props.index}</h1>
            <div className={this.styles.inner}>
                {this.props.children}
            </div>
        </div>;
    }
}
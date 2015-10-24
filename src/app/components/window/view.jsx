import React from "react";
import { VelocityComponent } from "velocity-react";

export default class WindowViews {
    static render() {
        return <div data-capture={true} data-root={true} className={[this.styles.wrapper, this.props.className || ""].join(" ")}>
            <h1 className={this.styles.title} data-capture={true}>
                Title {this.props.index}
                <div className={this.styles.right} data-nocapture={true}>
                    <div className="mdi mdi-close"></div>
                </div>
            </h1>
            <div className={this.styles.inner}>
                {this.props.children}
            </div>
        </div>;
    }
}
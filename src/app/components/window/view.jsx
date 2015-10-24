import React from "react";

export default class WindowViews {
    static render() {
        return <div className={[this.styles.wrapper, this.props.className || ""].join(" ")}>
            <h1>Title</h1>
            <div>
                {this.props.children}
            </div>
        </div>
    }
}
import React from "react";

export default class WindowGroupContainerViews {
    static render() {
        return <section className={[this.styles.wrapper, this.props.drag && this.styles.dragging, this.state.activated && this.styles.activated, this.props.className].join(" ")}>
            {this.props.children}
        </section>;
    }
}
import React from "react";
import {VelocityComponent} from "velocity-react";

export default class WindowGroupViews {
    static get processedChildren() {
        return (this.props.children || []).map((it, index) => 
                <span 
                    id={it.props.index}
                    data-capture-index={it.props.index}
                    className={[this.styles.itemwrapper, it.props.index === this.state.selected && this.styles.selected].join(" ")}
                    onMouseDown={(ev) => this.mouseDown(it.props.index, ev)}
                    onMouseMove={(ev) => this.mouseOver(it.props.index, ev)}
                    onTouchStart={(ev) => this.mouseDown(it.props.index, ev)}
                    onTouchMove={(ev) => 
                        this.mouseOver(null, ev, document.elementFromPoint(ev.touches[0].pageX, ev.touches[0].pageY))
                    }
                    style={this.getStyles(it.props.index)}
                >
                {it}</span>
            );
    }
    static background(which) {
        return <span className={this.styles.background} style={this.getBackgroundStyle(which)}></span>
    }
    static get backgrounds() {
        return [
            this.views.background("left"),
            this.views.background("center"),
            this.views.background("right"),
        ];
    }
    static render() {
        return <section 
            className={[this.styles.wrapper, this.state.stage].join(" ")} 
            onMouseUp={this.mouseUp}
            onTouchEnd={this.mouseUp}
            onTouchCancel={this.mouseUp}
            style={this.rootStyles}
        > 
        { [ this.views.backgrounds, this.views.processedChildren ] }
        </section>
    }
}
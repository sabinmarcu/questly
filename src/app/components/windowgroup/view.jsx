import React from "react";
import WindowGroupContainer from "./windowgroupcontainer";

export default class WindowGroupViews {
    static get processedChildren() {
        return (this.state.items || []).map((it, index) => 
                <span 
                    key={it.props.index} 
                    id={it.props.index}
                    ref={`item-${it.props.index}`}
                    className={[this.styles.itemwrapper, this.state.swap === it.props.index && [this.styles.hidden, (this.state.swap > this.state.selected ? this.styles.right : this.styles.left)].join(" ") ].join(" ")} 
                    onMouseDown={() => this.mouseDown(it.props.index)}
                    onMouseMove={(ev) => this.mouseOver(it.props.index, ev)}
                >{it}</span>
            );
    }
    static get splitView() {
        const children = this.views.processedChildren,
            selectedindex = children.map(it => it.props.children.props.index).indexOf(this.state.selected);
        switch (this.state.selected) {
            case 0: return [
                this.views.container(children.slice(selectedindex, selectedindex + 1), true),
                this.views.container(children.slice(selectedindex + 1, children.length)),
            ];
            case children.length - 1: return [
                this.views.container(children.slice(0, selectedindex )),
                this.views.container(children.slice(selectedindex, selectedindex + 1).concat([children[selectedindex + 2]]), true),
            ];
            default: return [
                this.views.container(children.slice(0, selectedindex )),
                this.views.container(children.slice(selectedindex, selectedindex + 1), true),
                this.views.container(children.slice(selectedindex + 1, children.length)),
            ];
        }
    }
    static get normalView() {
        return this.views.container(this.views.processedChildren);
    }
    static container(children, dragflag = false) {
        return <WindowGroupContainer drag={dragflag} className={this.state.stage}>{children}</WindowGroupContainer>
    }
    static render() {
        return <section className={this.styles.wrapper} onMouseUp={this.mouseUp} onMouseLeave={this.mouseUp} >
            { this.state.selected >= 0 ? this.views.splitView : this.views.normalView }
        </section>
    }
}
import React from "react";
import QuestList from "../questlist";
import WindowGroup from "../windowgroup";

export default class MainViews {
    static render() { 
        return <div className={this.styles.appwrapper}>
            <WindowGroup>
                {Array.apply(null, Array(4)).map((it, index) => {
                        console.log(it, index);
                        return <QuestList index={index} onDragStart={this.dragStart(index)} onDragEnd={this.dragEnd(index)} />
                    }
                )}
            </WindowGroup>
        </div>
    }
}
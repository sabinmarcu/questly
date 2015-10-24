import React from "react";
import QuestList from "../questlist";
import WindowGroup from "../windowgroup";
import Window from "../window";

export default class MainViews {
    static render() { 
        return <div className={this.styles.appwrapper}>
            <WindowGroup>
                {Array.apply(null, Array(4)).map((it, index) => {
                        console.log(it, index);
                        return <Window index={index} width={index === 2 && 400 || 200}><QuestList/></Window>
                    }
                )}
            </WindowGroup>
        </div>
    }
}
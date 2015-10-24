import React from "react";
import Window from "../window";

export default class QuestsListView {
    static render() {
        return <Window title="Quests List" className={this.styles.win}>
            <h1> List itself {this.props.index} </h1>
        </Window>;
    }
}
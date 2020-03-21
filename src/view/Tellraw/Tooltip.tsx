import React from "react";
import JsonView from "../../unit/JsonView";
import JsonTile from "../../lib/tellraw/JsonTile";

interface IProps {
    tile: JsonTile,
    visible: boolean,
}
export default function(props: IProps) {
    if (!props.tile) {
        return null;
    }
    const hover = props.tile.getHoverEvent();
    const value = hover.getValue();
    // const pro = hover.getPro();
    // if (pro) {
    //     const { nbt, style } = hover.getJsonGroup().toJson();
    //     return (
    //         <div style={{ display: `${props.visible ? 'block' : 'none'}`}}>
    //             <JsonView styleList={style} jsonList={nbt} /> 
    //         </div>
    //     )
    // }
    return (
        <div style={{ display: `${props.visible ? 'block' : 'none'}`}}>
            <div>{value}</div>
        </div>
    )
}
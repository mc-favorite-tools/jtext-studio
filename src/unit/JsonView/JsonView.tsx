import React, { useState } from "react";
import { ITileProps, ITextStyle } from "../../lib/tellraw/JsonTile";
import ColorPicker from "../ColorPicker";
import { RGBColor } from "react-color";

interface IProps {
    jsonList: ITileProps[],
    styleList: ITextStyle[],
    actIndex: number,
    onClick: (index: number) => void,
    value: RGBColor,
    onChange: (value: RGBColor) => void,
    className: string,
    style: React.CSSProperties,
    posChange: (toIndex: number) => void, 
}
let actIndex = -1;
let toIndex = -1;
let targetNode: any = null;

export default function(props: IProps) {
    const cls = 'json-view' + (props.className ? ' ' + props.className : '');
    const onDragStart = (index: number, e: any) => {
        actIndex = index
        e.target.style.opacity = "0.3";
        e.target.classList.remove('animate');
        props.onClick(index)
    }
    const onDragEnter = (index: number, e: any) => {
        e.preventDefault()
        if (actIndex !== index) {
            toIndex = index
            if (targetNode) {
                targetNode.classList.remove('drag-enter');
            }
            targetNode = e.target.parentNode;
            targetNode.classList.add('drag-enter');
        }
    }
    const onDragleave = (index: number, e: any) => {
        // if (actIndex !== index) {
        //     targetNode.classList.remove('drag-enter');
        // }
    }
    const onDragEnd = (e: any) => {
        if (toIndex !== -1) {
            props.posChange(toIndex);
        }
        actIndex = -1;
        if (targetNode) {
        e.target.classList.add('animate');
        targetNode.classList.remove('drag-enter');
            targetNode = null;
        }
        e.target.style.opacity = "1";
    }
    return (
        <div className={cls} style={props.style}>
            <div className='json-view-color'>
                <ColorPicker className='pane' value={props.value} onChange={props.onChange} />
            </div>
            <div className='json-view-pane'>
                {
                    props.jsonList.map((item, index) => {
                        const attr = props.styleList[index];
                        const cls = 'mc-tile' + (props.actIndex === index ? ' active animate' : '')
                        if (item.option === 'text') {
                            const list = item.text.split('\n');
                            return (
                                <span
                                    draggable
                                    contentEditable={false}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDragStart={onDragStart.bind(null, index)}
                                    onDragEnd={onDragEnd}
                                    onDragLeave={onDragleave.bind(null, index)}
                                    onDragEnter={onDragEnter.bind(null, index)}
                                    style={{...attr}} className={cls} key={index}
                                    onClick={props.onClick.bind(null, index)}>
                                    {
                                        list.map((el, i) => {
                                            return (
                                                <span key={i} className='mc-tile-end'>
                                                    {el.replaceAll(' ', '▫')}
                                                    { list.length - 1 !== i && <><span className='mc-tile-enter'>﹁</span><br /></> }
                                                </span>
                                            )
                                        })   
                                    } 
                                </span>
                            )
                        }
                        return (
                            <span 
                                draggable
                                onDragOver={(e) => e.preventDefault()}
                                onDragStart={onDragStart.bind(null, index)}
                                onDragEnd={onDragEnd}
                                onDragLeave={onDragleave.bind(null, index)}
                                onDragEnter={onDragEnter.bind(null, index)}
                                style={{...attr}}
                                className={cls}
                                key={index}
                                onClick={props.onClick.bind(null, index)}>
                                {'@' + item.option}
                            </span>
                        )
                    })
                }
            </div>
        </div>
    )
}
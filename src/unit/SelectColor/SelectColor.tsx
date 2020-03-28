import { GithubPicker, ColorResult } from "react-color";
import React, { useState, useEffect } from "react";

interface IProps {
    value?: string,
    onChange?: (id: string) => void,
    style?: React.CSSProperties,
}
const colors = ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#FFAA00', '#AAAAAA', '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF']
const colorId = ['black', 'dark_blue', 'dark_green', 'dark_aqua', 'dark_red', 'dark_purple', 'gold', 'gray', 'dark_gray', 'blue', 'green', 'aqua', 'red', 'light_purple', 'yellow', 'white']

const getColorById = (id: string) => {
    return colors[colorId.indexOf(id)] || 'white'
}
const getIdByColor = (color: string) => {
    return colorId[colors.indexOf(color.toLocaleUpperCase())] || '#ffffff'
}
export default function(props: IProps) {
    const [value, setValue] = useState(props.value || 'white')
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        setValue(() => props.value)
    }, [props.value])
    const change = (color: ColorResult) => {
        const id = getIdByColor(color.hex)
        setValue(() => id)
        hideBar()
        if (props.onChange) {
            props.onChange(id)
        }
    }
    const showBar = () => {
        setVisible(() => true)
    }
    const hideBar = () => {
        setVisible(() => false)
    }
    return (
        <div style={props.style} title='ctrl+⇅' className='select-color'>
            <div onClick={showBar} className='select-color-watch'>
                <div style={{ backgroundColor: getColorById(value) }} className="select-color-tile"></div>
            </div>
            {
                visible && (
                    <div className='select-color-pane'>
                        <div onClick={hideBar} className='select-color-cover'></div>
                        <GithubPicker width='220px' onChange={change} colors={colors} />
                    </div>
                )
            }
        </div>
    )
}
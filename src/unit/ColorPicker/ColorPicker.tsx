/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
import React from 'react'
import { SketchPicker, ColorResult, RGBColor } from 'react-color'

interface IProps {
    value?: RGBColor, 
    onChange?: (value: RGBColor) => void,
    className?: string,
    popStyle?: React.CSSProperties,
    presetColors?: string[],
    disableAlpha?: boolean,
    style?: React.CSSProperties,
}
interface IStates {
    displayColorPicker: boolean,
    color: RGBColor,
}
const defaultPresetColors = ['#f8e9cc', '#F5A623', '#F8E71C', '#8B572A', '#7ED321', '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF']
class ColorPicker extends React.Component<IProps, IStates> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            displayColorPicker: false,
            color: this.props.value ? this.props.value : { r: 0, g: 0, b: 0, a: 1 },
        }
    }
    public static getDerivedStateFromProps(props: IProps, state: IStates) {
        if (props.value !== state.color) {
            return {
                color: props.value
            }
        }
        return null
    }
    handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
    }
    handleClose = () => {
        this.setState({ displayColorPicker: false })
    }
    handleChange = (color: ColorResult) => {
        this.setState({ color: color.rgb })
        if (this.props.onChange) {
            this.props.onChange(color.rgb)
        }
    }
    render() {
        const { color } = this.state;
        const { r, g, b, a } = color as RGBColor
        const style: React.CSSProperties = {
            backgroundColor: `rgba(${r},${g},${b},${a})`,
        }
        const presetColors = this.props.presetColors ? this.props.presetColors : defaultPresetColors
        return (
            <div style={this.props.style} className={['mc-colorpicker', this.props.className].join(' ')}>
                <div className='swatch' onClick={this.handleClick}>
                    <div className='color' style={style} />
                </div>
                {
                    this.state.displayColorPicker
                        ? (
                            <div style={this.props.popStyle} className='popover'>
                                <div className='cover' onClick={ this.handleClose }/>
                                <SketchPicker disableAlpha={this.props.disableAlpha} presetColors={presetColors} color={this.state.color} onChange={this.handleChange} />
                            </div>
                        ) 
                        : null 
                }

            </div>
        )
    }
}

export default ColorPicker
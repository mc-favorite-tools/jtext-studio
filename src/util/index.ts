/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
import { RGBColor } from 'react-color';
import color from '../lib/tellraw/color';

export function isSimpleType(type: string) {
    return ['byte', 'int', 'bool', 'short', 'double', 'long', 'float', 'string', 'select'].includes(type)
}
export function RGB2HEX(color: RGBColor): string {
    const { r, g, b } = color
	return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0')
}

export function HEX2RGB(hex: number): RGBColor {
	return { r:hex >> 16, g: (hex & 0x00ff00) >> 8, b: hex & 0x0000ff, a: 255 }
}
export function toRGBColor(c: string = '#ffffff'): RGBColor {
    return HEX2RGB(parseInt(c.slice(1), 16))
}
import ClickEvent, { IClickProps } from "./event/ClickEvent";
import HoverEvent, { IHoverProps } from "./event/HoverEvent";
import Color from "./color";
import { Score, JsonGroup } from ".";
import { ScoreProps } from "./Score";
import TileError from "../../util/TileError";

export interface INbtEvent {
    action: string,
    value: string,
    pro?: number,
}
export interface ITextStyle {
    color?: string,
    fontWeight?: number,
    fontStyle?: string,
    textDecoration?: string,
}
export type textType = 'bold' | 'italic' | 'underlined' | 'strikethrough' | 'obfuscated'
export type tileType = 'text' | 'nbt' | 'selector' | 'score'
export type nbtType = 'block' | 'entity' | 'storage'

export default class JsonTile {
    //#region fields
    private text = '';
    private color = 'white';
    private selector = '';
    private nbt = '';
    private block: string = '';
    private entity: string = '';
    private storage: string = '';
    private bold = false;
    private italic = false;
    private underlined = false;
    private strikethrough = false;
    private obfuscated = false;
    private clickEvent = new ClickEvent({});
    private hoverEvent = new HoverEvent({});
    private score = new Score(null);
    private option: tileType = 'text';
    private nbtOption: nbtType = 'entity';
    //#endregion

    constructor(props: Partial<ITileProps>) {
        if (props === null) {
            return;
        }
        this.setOption(props.option, true)
        if (this.option === 'text') {
            this.setText(props.text)
        } else if (this.option === 'nbt') {
            this.setNbt(props.nbt)
            this.setNbtOption(props.nbtOption)
            if (this.nbtOption === 'storage') {
                this.setStorage(props.storage)
            } else if (this.nbtOption === 'entity') {
                this.setEntity(props.entity)
            } else {
                this.setBlock(props.block)
            }
        } else if (this.option === 'score') {
            this.setScore(props.score)
        } else if (this.option === 'selector') {
            this.setSelector(props.selector)
        }
        this.setColor(props.color, true)
        this.setBold(props.bold)
        this.setItalic(props.italic)
        this.setUnderlined(props.underlined)
        this.setStrikethrough(props.strikethrough)
        this.setObfuscated(props.obfuscated)
        this.setClickEvent(props.clickEvent)
        this.setHoverEvent(props.hoverEvent)
    }
    //#region props
    public change(type: textType) {
        if (type === 'bold') {
            this.bold = !this.bold
        } else if (type === 'italic') {
            this.italic = !this.italic
        } else if (type === 'obfuscated') {
            this.obfuscated = !this.obfuscated
        } else if (type === 'strikethrough') {
            this.strikethrough = !this.strikethrough
        } else if (type === 'underlined') {
            this.underlined = !this.underlined
        }
    }
    public setBold(bold: boolean) {
        this.bold = bold ? true : false
    }
    public setItalic(italic: boolean) {
        this.italic = italic ? true : false
    }
    public setUnderlined(underlined: boolean) {
        this.underlined = underlined ? true : false
    }
    public setStrikethrough(strikethrough: boolean) {
        this.strikethrough = strikethrough ? true : false
    }
    public setObfuscated(obfuscated: boolean) {
        this.obfuscated = obfuscated ? true : false
    }
    public getScore() {
        return this.score
    }
    public setScore(props: Partial<ScoreProps>) {
        this.score = new Score(props ? props : {})
    }
    public getNbtOption() {
        return this.nbtOption
    }
    public getBlock() {
        return this.block
    }
    public getStorage() {
        return this.storage
    }
    public setStorage(storage: string) {
        this.storage = storage
    }
    public setBlock(block: string) {
        this.block = block
    }
    public getEntity() {
        return this.entity
    }
    public setEntity(entity: string) {
        this.entity = entity
    }
    public setNbtOption(nbtOption: nbtType) {
        if (nbtOption as nbtType) {
            this.nbtOption = nbtOption
        } else {
            throw new TileError('nbtOption类型有误，应该是block" | "entity" | "storage')
        }
    }
    public isEmpty() {
        if (this.option === 'text') {
            return this.text === ''
        } else if (this.option === 'nbt') {
            return this.nbt === ''
        } else if (this.option === 'selector') {
            return this.selector === ''
        } else if (this.option === 'score') {
            return this.score.getName() === ''
        }
        return false
    }
    public getOption() {
        return this.option
    }
    public setOption(option: tileType, isValid = false) {
        if (isValid) {
            if (option as tileType) {
                this.option = option
            } else {
                throw new TileError('option类型有误，应该是text" | "nbt" | "selector" | "score')
            }
        } else {
            this.option = option
        }
    }
    public getText() {
        return this.text
    }
    public setText(text: string) {
        this.text = text
    }
    public getNbt() {
        return this.nbt
    }
    public setNbt(nbt: string) {
        this.nbt = nbt
    }
    public getSelector() {
        return this.selector
    }
    public setSelector(selector: string) {
        this.selector = selector
    }
    public getColor() {
        return this.color
    }
    public setColor(color: string, isValid = false) {
        if (isValid && color) {
            if (Color.findIndex(item => item.id === color) > -1) {
                this.color = color
            } else {
                throw new TileError('color字段的值有误')
            }
        } else {
            this.color = color ? color : 'white'
        }
    }
    public getClickEvent() {
        return this.clickEvent
    }
    public setClickEvent(props: Partial<IClickProps>) {
        this.clickEvent = new ClickEvent(props ? props : {})
    }
    public getHoverEvent() {
        return this.hoverEvent
    }
    public setHoverEvent(props: Partial<IHoverProps>) {
        this.hoverEvent = new HoverEvent(props ? props : {})
    }
    //#endregion
    
    public getStyle() {
        const obj: ITextStyle = {}
        const arr = [];
        if (this.color) {
            const fc = Color.find(e => e.id === this.color).fc
            obj['color'] = '#' + fc
        }
        if (this.bold) {
            obj['fontWeight'] = 700
        }
        if (this.italic) {
            obj['fontStyle'] = 'italic'
        }
        if (this.underlined) {
            arr.push('underline');
        }
        if (this.strikethrough) {
            arr.push('line-through');
        }
        if (this.obfuscated) {
            arr.push('overline');
        }
        if (arr.length) {
            obj['textDecoration'] = arr.join(' ')
        }
        return obj
    }
    public export() {
        const { option, text, nbt, nbtOption, block, entity, storage, score, selector, color, ...rest } = this
        const obj: any = {}
        obj.option = this.option
        if (this.option === 'text') {
            obj.text = this.text
        } else if (this.option === 'nbt') {
            obj.nbt = this.nbt
            obj.nbtOption = this.nbtOption
            if (this.nbtOption === 'storage') {
                obj.storage = this.storage
            } else if (this.nbtOption === 'entity') {
                obj.entity = this.entity
            } else {
                obj.block = this.block
            }
        } else if (this.option === 'score') {
            obj.score = this.score.export()
        } else if (this.option === 'selector') {
            obj.selector = this.selector
        } else {
            throw new TileError('option仅能是text | nbt | score | selector')
        }
        if (this.color !== 'white') {
            obj.color = this.color
        }
        return {
            ...obj,
            ...this.valide(rest)
        }
    }
    private valide(data: any) {
        return Object.entries(data).reduce(
            (s: any, [k, v]: any) => {
                const type = typeof v
                if (type === 'boolean' && v !== false ||
                    type === 'string' && v !== '') {
                    s[k] = v
                } else if (type === 'object') {
                    const o = v.export()
                    o && (s[k] = o)
                }
                return s
            },
            {}
        )
    }
    public toJson() {
        return Object.entries(this).reduce(
            (s: any, [k, v]) => {
                s[k] = typeof v === 'object' ? v.toJson() : v
                return s
            },
            {}
        )
    }
    public toString() {
        let { text, option, nbtOption, nbt, selector, entity, block, storage, score, ...rest } = this;
        const baseStr = Object.keys(rest).reduce((s, key) => {
            // @ts-ignore
            let value = rest[key]
            if (typeof value === 'object') {
                s += value.toString()
            } else if (value) {
                if (typeof value === 'boolean') {
                    s += `"${key}":${value},`
                } else {
                    s += `"${key}":"${value}",`
                }
            }
            return s
        }, '').trimEnd(',')
        if (option === 'text') {
            return text ? `{"text":"${text.replace(/\n/g, '\\n')}",${baseStr}}` : ''
        } else if (option === 'nbt') {
            let str = ''
            if (nbt) {
                str += `{"nbt":"${nbt}",`
                if (nbtOption === 'storage') {
                    str += `"storage":"${storage}",`
                } else if (nbtOption === 'entity') {
                    str += `"entity":"${entity}",`
                } else {
                    str += `"block":"${block}",`
                }
                return `${str}${baseStr}}`
            }
            return ''
        } else if (option === 'score') {
            return score.getName() ? `{${score.toString()}${baseStr}}` : ''
        } else if (option === 'selector') {
            return selector ? `{"selector":"${selector}",${baseStr}}` : ''
        }
        return ''
    }
}
export interface ITileProps {
    text?: string,
    color?: string,
    selector?: string,
    bold?: boolean,
    italic?: boolean,
    underlined?: boolean,
    strikethrough?: boolean,
    obfuscated?: boolean,
    clickEvent?: Partial<IClickProps>,
    hoverEvent?: Partial<IHoverProps>,
    score?: Partial<ScoreProps>,
    nbt?: string,
    option?: tileType,
    nbtOption?: nbtType,
    entity?: string,
    block?: string,
    storage?: string,
    mark?: string,
}
/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
import EventBase from "./EventBase"
import JsonGroup from "../JsonGroup";

export enum HoverActions {
    show_text = 'show_text',
    show_item = 'show_item',
    show_entity = 'show_entity',
}
export interface IHoverProps {
    action: string,
    value: string,
    pro: number,
    // jsonGroup: JsonGroup,
}
export default class HoverEvent extends EventBase {
    private pro: number = 0;
    // private jsonGroup: JsonGroup = null;

    constructor(props: Partial<IHoverProps>) {
        super(props.action ? props.action : HoverActions.show_text, props.value)
        if (props) {
            this.setPro(props.pro)
        }
    }
    public getPro() {
        return this.pro;
    }
    public setPro(pro: number) {
        if (pro === undefined) {
            return this
        } else if (pro === 0 || pro === 1) {
            this.pro = pro
            return this
        }
        throw new TypeError('pro字段类型错误，应该是0或者1')
    }
    public export() {
        return this.value ? this.toJson() : null
    }
    // public getJsonGroup() {
    //     return this.jsonGroup;
    // }
    public setValue(value: string) {
        // if (this.pro === 1) {
        //     this.parse()
        // }
        this.value = value
        return this
    }
    // public parse() {
    //     if (!this.value.trim()) {
    //         return;
    //     }
    //     try {
    //         const data = JSON.parse(this.value);
    //         data.shift();
    //         this.jsonGroup = new JsonGroup({ data });
    //     } catch (error) {
    //         if (error instanceof TypeError) {
    //             throw error
    //         } else {
    //             throw new TypeError('数据错误，无法解析')
    //         }
    //     }
    // }
    public toJson() {
        return {
            ...super.toJson(),
            pro: this.pro,
        }
    }
    public toString() {
        if (this.value) {
            const action = `\"action\":\"${this.action}\",`;
            let value = '';
            if (this.action === HoverActions.show_text) {
                value = `\"value\":${this.action === HoverActions.show_text && +this.pro ? this.value.escape() : '\"' + this.value.escape() + '\"'}`
            } else {
                value = `\"value\":\"${this.value.escape()}\"`
            }
            return `"hoverEvent":{${action + value}},`
        }
        return ''
    }
}
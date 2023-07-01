/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
import EventBase from "./EventBase"

export enum ClickActions {
    open_url= 'open_url',
    change_page= 'change_page',
    run_command= 'run_command',
    suggest_command= 'suggest_command',
    copy_to_clipboard = 'copy_to_clipboard',
}
export interface IClickProps {
    action: string,
    value: string,
}
export default class ClickEvent extends EventBase {
    constructor(props: Partial<IClickProps>) {
        super(props.action ? props.action : ClickActions.run_command, props.value)
    }
    public export() {
        return this.value ? this.toJson() : null
    }
    public toString() {
        if (this.value) {
            if (this.action === ClickActions.run_command && !this.value.startsWith('/')) {
                this.value = '/' + this.value
            }
            return `"clickEvent":{\"action\":\"${this.action}\",\"value\":\"${this.value.escape()}\"},`
        }
        return ''
    }
}
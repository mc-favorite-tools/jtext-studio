export default class EventBase {
    protected action: string;
    protected value: string;

    constructor(action: string, value = '') {
        this.action = action
        this.value = value
    }
    public getValue() {
        return this.value;
    }
    public setValue(value: string) {
        this.value = value;
    }
    public getAction() {
        return this.action;
    }
    public setAction(action: string) {
        this.action = action
    }
    public toJson() {
        return Object.entries(this).reduce(
            (s: any, [k, v]) => {
                s[k] = typeof v === 'function' ? v.toJson() : v
                return s
            },
            {}
        )
    }
}
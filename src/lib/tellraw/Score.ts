export type scoreType = 'value' | 'objective'

export interface ScoreProps {
    name: string,
    objective: string,
    value: string,
    option: scoreType,
}

export default class Score {
    private name = '*';
    private objective: string = '';
    private value: string = '';
    private option: scoreType = 'objective';

    //#region props
    public getName() {
        return this.name
    }
    public setName(name: string) {
        this.name = name ? name : '*'
    }
    public getObjective() {
        return this.objective
    }
    public setObjective(objective: string) {
        this.objective = objective
        this.value = ''
    }
    public getOption() {
        return this.option
    }
    public setOption(option: scoreType) {
        this.option = option ? option : 'objective'
    }
    public getValue() {
        return this.value
    }
    public setValue(value: string) {
        this.value = value
        this.objective = ''
    }
    //#endregion
    
    constructor(props: Partial<ScoreProps>) {
        if (props === null) {
            return;
        }
        this.setName(props.name)
        this.setOption(props.option)
        if (props.option === 'objective') {
            this.setObjective(props.objective)
        } else {
            this.setValue(props.value)
        }
    }

    public export() {
        const obj: any = {}
        obj.name = this.name
        obj.option = this.option
        if (this.option === 'objective') {
            obj.objective = this.objective
        } else {
            obj.value = this.value
        }
        return obj
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
    public toString() {
        if (this.option === 'value') {
            return `"score":{"name":"${this.name}","value":"${this.value}"},`
        }
        return `"score":{"name":"${this.name}","objective":"${this.objective}"},`
    }
}

declare interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
    Tooltips: Tooltips;
}

declare class Tooltips {
    public showTips(msgTips: MsgTips);
    public getRate(): number;
}
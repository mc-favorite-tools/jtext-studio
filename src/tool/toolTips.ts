import * as Msgs from './../config/msg';
import { notification } from "antd"

export enum MsgTips {
    welcome = 1,
    nbtPath = 2,
    add = 4,
    split = 8,
    style = 16,
    save = 32,
    drag = 64,
    color = 128,
    export = 256,
    share = 512,
    video = 1024,
}

const mapTips = {
    [MsgTips.add]: Msgs.addMsg,
    [MsgTips.welcome]: Msgs.welcomeMsg,
    [MsgTips.nbtPath]: Msgs.nbtPathMsg,
    [MsgTips.style]: Msgs.styleMsg,
    [MsgTips.split]: Msgs.splitMsg,
    [MsgTips.save]: Msgs.saveMsg,
    [MsgTips.drag]: Msgs.dragMsg,
    [MsgTips.color]: Msgs.colorMsg,
    [MsgTips.export]: Msgs.exportMsg,
    [MsgTips.share]: Msgs.shareMsg,
    [MsgTips.video]: Msgs.videoMsg,
}

class Tooltips {
    private tips: number;
    private total = 10;
    private count = 0;
    constructor() {
        this.tips = +window.localStorage.getItem('tips') || 0
    }
    public exist(msgTips: MsgTips) {
        return this.tips & msgTips
    }
    public getRate() {
        return this.count / this.total
    }
    public showTips(msgTips: MsgTips) {
        if (!this.exist(msgTips)) {
            notification.info(mapTips[msgTips])
            this.tips += msgTips
            this.count++
            window.localStorage.setItem('tips', this.tips + '')
        }
    }
}

export default function() {
    if (!window.Tooltips) {
        window.Tooltips = new Tooltips()
    }
    return window.Tooltips
}
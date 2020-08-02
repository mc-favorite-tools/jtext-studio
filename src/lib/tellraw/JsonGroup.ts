import JsonTile from "./JsonTile";
import TileError from "../../util/TileError";

export default class JsonGroup {
    public tiles: JsonTile[] = [];
    public actTile: JsonTile = null;
    public actIndex: number = -1;
    private mark: string = '';
    private time: string = new Date().format('yy-MM-dd HH:mm:ss');

    constructor(data: any) {
        if (data === null) {
            return;
        }
        if (typeof data === 'object' && Array.isArray(data.data)) {
            this.tiles = data.data.map((item: any) => new JsonTile(item))
            this.mark = data.mark
            this.time = data.time
        } else {
            throw new TileError('导入数据错误')
        }
    }
    public clear() {
        this.tiles = [];
        this.actIndex = -1;
        this.actTile = null;
    }
    public lastTile() {
        return this.tiles[this.tiles.length - 1]
    }
    public getTiles() {
        return this.tiles
    }
    public getMark() {
        return this.mark
    }
    public setMark(mark: string) {
        this.mark = mark
    }
    public updateTime() {
        this.time = new Date().format('yyyy-MM-dd HH:mm:ss')
        return this
    }
    public getTime() {
        return this.time
    }
    public setTime(time: string) {
        this.time = time
    }
    public setActTile(index: number) {
        this.actIndex = index
        this.actTile = index === -1 ? null : this.tiles[index]
    }
    public update(newTile: JsonTile) {
        if (this.actIndex > -1) {
            this.tiles[this.actIndex] = newTile
        }
        throw new RangeError('索引越界')
    }
    public next() {
        this.setActTile(++this.actIndex % this.tiles.length)
    }
    public prev() {
        this.setActTile(--this.actIndex < 0 ? this.tiles.length - 1 : this.actIndex)
    }
    public posChange(to: number) {
        // 过滤结尾是空的tile
        if (to === this.tiles.length - 1 && this.lastTile().isEmpty()) {
            return;
        }
        const [act] = this.tiles.splice(this.actIndex, 1);
        this.tiles.splice(to, 0, act);
        this.actIndex = to;
        this.actTile = act;
    }
    // public add(tile: JsonTile) {
    //     this.tiles.push(tile)
    // }
    // public insert(tile: JsonTile) {
    //     this.tiles.splice(this.actIndex, 0, tile)
    // }
    // public insert() {
    //     let tile = new JsonTile(null)
    //     this.tiles.splice(this.actIndex, 0, tile)
    //     this.actTile = tile
    // }
    /**
     * 克隆
     */
    // public clone() {
    //     const lastTile = this.lastTile()
    //     if (this.actTile === lastTile && lastTile.isEmpty()) {
    //         this.tiles.pop()
    //         const newTiles = this.tiles.map(item => item.export()).map(item => new JsonTile(item))
    //         this.tiles.push(...newTiles)
    //         this.add()
    //     } else {
    //         const newTile = new JsonTile(this.actTile.export());
    //         this.tiles.splice(this.actIndex, 0, newTile);
    //         this.actTile = this.tiles[++this.actIndex];
    //     }
    // }
    /**
     * 高级编辑
     */
    public editPro() {
        const tpl = this.actTile.export()
        const list = this.actTile.getText().split(/\n(?!\n)(?!$)/g)
        if (list.length === 1) {
            const newTile = new JsonTile(tpl)
            this.tiles.splice(this.actIndex, 0, newTile);
            this.actIndex++
        } else {
            const newTiles = list.map(text => {
                const tile = new JsonTile(tpl)
                tile.setText(text)
                return tile
            })
            this.tiles.splice(this.actIndex, 1, ...newTiles);
        }
        this.actTile = this.tiles[this.actIndex]
    }
    public add(tiles?: JsonTile[] | JsonTile) {
        if (tiles) {
            if (Array.isArray(tiles)) {
                this.tiles.push(...tiles)
            } else {
                this.tiles.push(tiles)
            }
        } else {
            let tile = new JsonTile(null)
            const last = this.tiles[this.tiles.length - 1]
            if (this.tiles.length && last.isEmpty()) {
                tile = last
            } else {
                this.tiles.push(tile)
            }
            this.actTile = tile
            this.actIndex = this.tiles.length - 1
        }
    }
    public hasEmpty() {
        const len = this.getTiles().length
        if (len === 0 || len === 1 && this.tiles[0].isEmpty()) {
            return true
        } else {
            return false
        }
    }
    public remove() {
        this.tiles.splice(this.actIndex, 1)
        if (this.tiles.length === this.actIndex) {
            this.actIndex--
            if (this.actIndex === -1) {
                this.actTile = null
                return
            }
        }
        this.actTile = this.tiles[this.actIndex]
    }
    public export() {
        return {
            data: this.tiles.map(item => item.export()),
            mark: this.mark,
            time: new Date().format('yyyy-MM-dd HH:mm:ss')
        }
    }
    public toJson() {
        return this.tiles.reduce(
            (s ,e) => {
                s.nbt.push(e.toJson());
                s.style.push(e.getStyle());
                return s
            },
            { nbt: [], style: [], actIndex: this.actIndex, mark: this.mark }
        )
    }
    public toString() {
        return this.tiles.reduce((s, e) => {
            if (e) {
                s += e.toString() + ','
            }
            return s
        }, '').trimEnd(',')
    }
}
/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
import React, { useState, useEffect, useRef } from "react";
import { Button, Select, Input, Row, Col, message, Radio, Tooltip, notification, InputRef } from "antd";
import { JsonGroup } from "../../lib/tellraw";
import './index.less'
import { ITileProps, textType, nbtType } from "../../lib/tellraw/JsonTile";
import color from "../../lib/tellraw/color";
import { RGBColor } from "react-color";
import copy from 'copy-to-clipboard';
import JsonView from "../../unit/JsonView";
import Output, { TellrawData } from "./Output";
import Import from "./Import";
import TileError from "../../util/TileError";
import TextArea, { TextAreaRef } from "antd/lib/input/TextArea";
import Parse from "./Parse";
import getToolTips, { MsgTips } from "../../tool/toolTips";
import EditableTagGroup from "./EditableTag";
import ColorPicker from "../../unit/ColorPicker";
import { toRGBColor, RGB2HEX } from "../../util";
import { colors } from "../../const";
import LZString from 'lz-string'

const duration = 5 * 60 * 1000;
const initColor = {r: 248, g: 233, b: 204, a: 1};
const toolTips = getToolTips()
let jsonGroup = new JsonGroup(null);
const version = '0.9.2'

jsonGroup.add()

export default function() {
    const [nbt, setNbt] = useState<ITileProps>({});
    const [bgColor, setBgColor] = useState<RGBColor>(initColor);
    const [objGroup, setObjGroup] = useState(jsonGroup.toJson());
    const [visible, setVisible] = useState(false);
    const [importVisible, setImportVisible] = useState(false);
    const [parseVisible, setParseVisible] = useState(false);
    const [data, setData] = useState<TellrawData[]>([]);
    const actIdRef = useRef<string>('')
    const textRef = useRef<TextAreaRef>()
    const nbtRef = useRef<InputRef>()
    const selectorRef = useRef<InputRef>()
    const scoreRef = useRef<InputRef>()
    const [tags, setTags] = useState<string[]>([])

    useEffect(() => {
        window.addEventListener('keydown', textKeyDown);
        toolTips.showTips(MsgTips.welcome);
        loadTags();
        loadStore();
        loadLog();
        loadUrl()
        const timer = tips5Min();
        update();
        return () => {
            clearTimeout(timer)
            window.removeEventListener('keydown', textKeyDown)
        }
    }, [])
    const loadUrl = () => {
        const text = LZString.decompressFromBase64(window.location.hash.slice(1))
        importSubmit(text)
    }
    const updateUrl = () => {
        const compress = LZString.compressToBase64(JSON.stringify(jsonGroup.export()))
        window.location.hash = compress
    }
    const share = () => {
        message.success('已复制到剪贴板')
        copy(window.location.href)
    }
    const loadLog = () => {
        const old =  window.localStorage.getItem('version')
        if (old !== version) {
            notification.warning({
                key: 'log',
                message: `更新日志 - v${version}`,
                description: (
                    <ol>
                        <li>重要提醒：该软件不再维护，请使用新的生成器<a href="https://www.mcbbs.net/thread-1361537-1-1.html">JText Editor</a></li>
                    </ol>
                ),
                duration: 0,
            })
            window.localStorage.setItem('version', version)
        }
    }
    const loadStore = () => {
        const rawData =  window.localStorage.getItem('data');
        try {
            const data = (rawData ? JSON.parse(rawData) : []) as TellrawData[];
            if (data.length) {
                const tellraws = data.map(item => ({ ...item, data: new JsonGroup(item.data) }))
                setData(() => tellraws)
                message.success(`缓存数据加载成功，共${tellraws.length}条`)
            }
        } catch (error) {
            message.error('仓库数据加载异常')
            window.localStorage.setItem('store', '')
        }
    }
    const loadTags = () => {
        try {
            const tags =  window.localStorage.getItem('tags')
            setTags(() => tags ? JSON.parse(tags) : ['tellraw', 'sign', 'book', 'title'])
        } catch (error) {
            message.error('标签数据加载异常')
            window.localStorage.setItem('tags', '')
        }
    }
    const tips5Min = () => {
        return setTimeout(() => {
            const rate = toolTips.getRate()
            if (rate < 0.5) {
                toolTips.showTips(MsgTips.video)
            } else if (rate > 0.8) {
                toolTips.showTips(MsgTips.share)
            }
        }, duration)
    }

    useEffect(() => {
        if (toolTips.getRate() === 1) {
            return;
        }
        if (!jsonGroup.actTile) {
            return;
        }
        const text = jsonGroup.actTile.getText()
        const tiles = jsonGroup.getTiles()
        const color = jsonGroup.actTile.getColor()
        if (text.length > 4) {
            toolTips.showTips(MsgTips.add)
        } else if (text.includes('\n')) {
            toolTips.showTips(MsgTips.split)
        } else if (tiles.length > 3 && tiles.length <= 5) {
            toolTips.showTips(MsgTips.style)
        } else if (tiles.length > 5 && tiles.length <= 7) {
            toolTips.showTips(MsgTips.save)
        } else if (tiles.length > 7) {
            toolTips.showTips(MsgTips.drag)
        } else if (color === 'aqua' || color === 'green') {
            toolTips.showTips(MsgTips.color)
        } else if (jsonGroup.actTile.getOption() === 'nbt') {
            toolTips.showTips(MsgTips.nbtPath)
        }
    })
    const changeStyle = (type: textType) => {
        jsonGroup.actTile.change(type);
        update();
        notification.close('styleMsg')
    }
    const update = () => {
        setNbt(() => {
            if (!jsonGroup.actTile) {
                jsonGroup.add()
            }
            return jsonGroup.actTile.toJson()
        })
        updateUrl()
        setObjGroup(() => jsonGroup.toJson());
    }
    const editPro = () => {
        if (!jsonGroup.actTile.isEmpty()) {
            jsonGroup.editPro()
            notification.close('splitMsg')
            update()
        }
    }
    const add = () => {
        if (jsonGroup.actTile.isEmpty()) {
            message.warn(`必填项为空，请填写`)
        } else {
            jsonGroup.add()
            update()
        }
    }
    const cancel = () => {
        if (jsonGroup.actTile.isEmpty() && jsonGroup.hasEmpty()) {
            return;
        }
        jsonGroup.setActTile(-1)
        update()
    }
    const remove = () => {
        if (jsonGroup.hasEmpty()) {
            return;
        }
        if (jsonGroup.actTile) {
            jsonGroup.remove();
            update();
        } else {
            message.warning('请选中要删除的项')
        }
    }
    const clear = () => {
        if (jsonGroup.hasEmpty()) {
            return;
        }
        jsonGroup = new JsonGroup(null);
        jsonGroup.add();
        setNbt(() => ({}));
        setObjGroup(() => ({ nbt: [], style: [], actIndex: -1, mark: '' }));
        update()
    }
    const merify = (idx: number) => {
        jsonGroup.setActTile(idx)
        update()
        setFocus()
    }
    const setFocus = () => {
        if (nbt.option === 'text') {
            textRef.current.focus()
        } else if (nbt.option === 'nbt') {
            nbtRef.current.focus()
        } else if (nbt.option === 'selector') {
            selectorRef.current.focus()
        } else {
            scoreRef.current.focus()
        }
    }
    const generate = (index: number, isValid = true) => {
        if (isValid && jsonGroup.hasEmpty()) {
            message.warning('请先添加一项')
            return;
        }
        const G = index == null ? jsonGroup : data[index].data
        const nbtString = `["",${G.toString().trimEnd(',')}]`;
        copy(nbtString);
        message.success('已复制到剪贴板');
    }
    const fillHover = (index: number) => {
        const G = data[index].data.toString()
        const nbtString = `["",${G.toString().trimEnd(',')}]`;
        jsonGroup.actTile.getHoverEvent().setPro(1).setValue(nbtString)
        update()
    }
    const save = () => {
        if (jsonGroup.hasEmpty()) {
            message.warning('空空如也~，快去添加吧')
            return;
        }
        jsonGroup.setActTile(-1);
        const newData = {
            data: jsonGroup,
            time: jsonGroup.updateTime().getTime(),
            mark: jsonGroup.getMark() ? jsonGroup.getMark() : jsonGroup.getTiles()[0].getText().substr(0, 20),
            id: Math.random().toString(36).slice(3),
        }
        setData(data => {
            const actId = actIdRef.current;
            const index = data.findIndex(item => item.id === actId)
            if (actId && index > -1) {
                data.splice(index, 1, { ...newData, id: actId })
                actIdRef.current = ''
            } else {
                data.push(newData)
            }
            window.localStorage.setItem('data', JSON.stringify(data.map(item => ({ ...item, data: item.data.export() }))));
            return [...data]
        })
        message.success('暂存成功，点击仓库查看')
        clear()
    }
    const open = () => {
        setVisible(() => true)
    }
    const colorChange = (color: RGBColor) => {
        jsonGroup.actTile.setColor(RGB2HEX(color))
        update()
    }
    const bgColorChange = (color: RGBColor) => {
        setBgColor(() => color);
    }
    const posChange = (to: number) => {
        jsonGroup.posChange(to)
        update()
    }
    const getColor = (color: RGBColor) => {
        const { r, g, b, a } = color;
        return `rgba(${r},${g},${b},${a})`
    }
    const textChange = (e: any) => {
        jsonGroup.actTile.setText(e.target.value);
        update()
    }
    const prevColor = () => {
        const i = color.findIndex(item => item.fc === jsonGroup.actTile.getColor())
        jsonGroup.actTile.setColor(color[(i + 1) % 16].fc);
        update()
    }
    const nextColor = () => {
        const i = color.findIndex(item => item.fc === jsonGroup.actTile.getColor())
        jsonGroup.actTile.setColor(color[i <= 0 ? 15 : i - 1].fc);
        update()
    }
    const keyAdd = () => {
        notification.close('addMsg')
        add()
    }
    const keyMap: any = {
        'ctrl+b': () => jsonGroup.actTile.change('bold'),//
        'ctrl+i': () => jsonGroup.actTile.change('italic'),//
        'ctrl+u': () => jsonGroup.actTile.change('underlined'),//
        'ctrl+s': save,
        'ctrl+o': () => jsonGroup.actTile.change('obfuscated'),//
        'ctrl+arrowleft': () => jsonGroup.prev(),//
        'ctrl+arrowright': () => jsonGroup.next(),//
        'ctrl+arrowup': prevColor,//
        'ctrl+arrowdown': nextColor,//
        'ctrl+delete': remove,
        'ctrl+g': generate.bind(null, null),
        'ctrl+k': editPro,
        'shift+enter': keyAdd,
        'escape': cancel,
        'ctrl+p': open,
        'ctrl+shift+s': () => jsonGroup.actTile.change('strikethrough'),
    }
    const textKeyDown = (e: any) => {
        const k = e.key.toLowerCase();
        const keyList = [];
        if (e.ctrlKey) keyList.push('ctrl')
        if (e.shiftKey) keyList.push('shift')
        if (e.altKey) keyList.push('alt')
        keyList.push(k)
        const command = keyMap[keyList.join('+')]
        if (command) {
            e.preventDefault()
            command()
            update();
        }
    }
    const cmdSelectChange = (action: string) => {
        jsonGroup.actTile.getClickEvent().setAction(action)
        update()
    }
    const hoverSelectChange = (action: string) => {
        jsonGroup.actTile.getHoverEvent().setAction(action)
        update()
    }
    const hoverModeChange = (mode: number) => {
        const hoverEvent = jsonGroup.actTile.getHoverEvent();
        hoverEvent.setPro(mode);
        update()
    }
    const clickTextChange = (e: any) => {
        jsonGroup.actTile.getClickEvent().setValue(e.target.value)
        update()
    }
    const hoverTextChange = (e: any) => {
        jsonGroup.actTile.getHoverEvent().setValue(e.target.value)
        update()
    }
    const nbtSelectChange = (option: any) => {
        jsonGroup.actTile.setNbtOption(option)
        setNbt(() => jsonGroup.actTile.toJson())
    }
    const scoreSelectChange = (option: any) => {
        jsonGroup.actTile.getScore().setOption(option)
        setNbt(() => jsonGroup.actTile.toJson())
    }
    const nbtChange = (e: any) => {
        jsonGroup.actTile.setNbt(e.target.value)
        setNbt(() => jsonGroup.actTile.toJson())
    }
    const nbtOptChange = (e: any) => {
        const tile = jsonGroup.actTile
        const value = e.target.value
        if (tile.getNbtOption() === 'block') {
            tile.setBlock(value)
        } else if (tile.getNbtOption() === 'entity') {
            tile.setEntity(value)
        } else {
            tile.setStorage(value)
        }
        setNbt(() => tile.toJson())
    }
    const scoreNameChange = (e: any) => {
        jsonGroup.actTile.getScore().setName(e.target.value)
        setNbt(() => jsonGroup.actTile.toJson())
    }
    const scoreOptChange = (e: any) => {
        const score = jsonGroup.actTile.getScore()
        if (score.getOption() === 'objective') {
            score.setObjective(e.target.value)
        } else {
            score.setValue(e.target.value)
        }
        setNbt(() => jsonGroup.actTile.toJson())
    }
    const selectorChange = (e: any) => {
        jsonGroup.actTile.setSelector(e.target.value)
        setNbt(() => jsonGroup.actTile.toJson())
    }
    const optChange = (e: any) => {
        jsonGroup.actTile.setOption(e.target.value)
        update()
    }
    const markChange = (e: any) => {
        jsonGroup.setMark(e.target.value)
        update()
    }
    const onClose = () => {
        setVisible(() => false)
        setFocus()
    }
    const importJson = () => {
        setImportVisible(() => true)
    }
    const exportJson = () => {
        if (jsonGroup.hasEmpty()) {
            message.warning('空空如也~，快去添加吧')
        } else {
            copy(JSON.stringify(jsonGroup.export()))
            toolTips.showTips(MsgTips.export)
            message.success('已复制到剪贴板')
        }
    }
    const importCancel = () => {
        setImportVisible(() => false)
    }
    const importSubmit = (value: string) => {
        try {
            const data = JSON.parse(value)
            jsonGroup = new JsonGroup(data)
            setImportVisible(() => false)
            message.success('导入成功')
            setObjGroup(() => jsonGroup.toJson())
            jsonGroup.setActTile(0)
        } catch (error) {
            if (error instanceof TileError) {
                message.error(error.toString())
            } else {
                message.error('导入数据错误，无法解析')
            }
        }
    }
    const editData = (id: string) => {
        const one = data.find(item => item.id === id)
        jsonGroup = one.data
        actIdRef.current = id
        setObjGroup(() => jsonGroup.toJson())
        merify(0)
    }
    const removeOne = (id: string) => {
        if (actIdRef.current === id) {
            clear()
            actIdRef.current = ''
        }
        setData(data => {
            const index = data.findIndex(v => v.id === id)
            data.splice(index, 1)
            window.localStorage.setItem('data', JSON.stringify(data.map(item => ({ ...item, data: item.data.export() }))));
            return [...data]
        })
        message.success('删除成功')
    }
    const removeData = (id: string[]) => {
        if (!id.length) {
            message.warning('请至少选择1项')
            return;
        }
        id.forEach(id => {
            if (actIdRef.current === id) {
                clear()
                actIdRef.current = ''
            }
            data.splice(data.findIndex(item => item.id === id), 1)
            window.localStorage.setItem('data', JSON.stringify(data.map(item => ({ ...item, data: item.data.export() }))));
        })
        setData(() => [...data])
        message.success('删除成功')
    }
    const pack = (id: string[], items: TellrawData[]) => {
        if (id.length < 1) {
            message.warning('请至少选择两项')
            return;
        }
        const firstIndex = data.findIndex(item => item.id === items[0].id)
        id.forEach(id => {
            data.splice(data.findIndex(item => item.id === id), 1)
        })
        data.splice(firstIndex, 0, ...items)
        setData(() => [...data])
    }
    const merge = (id: string[], items: TellrawData[]) => {
        if (id.length < 1) {
            message.warning('请至少选择两项')
            return;
        }
        const firstIndex = data.findIndex(item => item.id === items[0].id)
        const firstOne = items[firstIndex]
        id.forEach(id => {
            const index = data.findIndex(item => item.id === id)
            const removeOne = data.splice(index, 1)
            if (id !== firstOne.id) {
                firstOne.data.add(removeOne[0].data.getTiles())
            }
        })
        data.splice(firstIndex, 0, firstOne)
        setData(() => {
            window.localStorage.setItem('data', JSON.stringify(data.map(item => ({ ...item, data: item.data.export() }))));
            return [...data]
        })
    }
    const move = (items: TellrawData[]) => {
        if (!items.length) {
            message.warning('请至少选择一项')
            return;
        }
        const firstOne = items[0]
        const lastOne = items[items.length - 1]
        const firstIndex = data.findIndex(item => item === firstOne)
        const lastIndex = data.findIndex(item => item === lastOne)
        const start = (firstIndex === 0 ? data.length : firstIndex) - 1
        data.splice(start, 0, ...data.splice(firstIndex, lastIndex - firstIndex + 1))
        setData(() => [...data])
    }
    const openParse = () => {
        setParseVisible(() => true)
        notification.close('nbtPathMsg')
    }
    const parseCancel = () => {
        setParseVisible(() => false)
    }
    const parseSubmit = (path: string, value: string, type: nbtType) => {
        if (path) {
            jsonGroup.actTile.setNbt(path)
            if (value) {
                if (!jsonGroup.actTile.getEntity() && type === 'entity') {
                    jsonGroup.actTile.setEntity(`@e[type=${value},limit=1,sort=nearest]`)
                }
                if (!jsonGroup.actTile.getBlock() && type === 'block') {
                    jsonGroup.actTile.setBlock(value)
                }
            }
            type && jsonGroup.actTile.setNbtOption(type)
            setNbt(() => jsonGroup.actTile.toJson())
            setParseVisible(() => false)
        } else {
            message.warning('请选择路径')
        }
    }
    const clickHandleByTag = (value: string) => {
        jsonGroup.setMark(value)
        update()
    }
    const changeByTag = (tags: string[]) => {
        window.localStorage.setItem('tags', JSON.stringify(tags))
        setTags(() => tags)
    }
    const renderOption = () => {
        if (nbt.option === 'nbt') {
            return (
                <div>
                    <div style={{ marginBottom: 10 }}>
                        <Input
                            autoFocus
                            key='nbt'
                            ref={nbtRef}
                            value={nbt.nbt}
                            spellCheck={false}
                            onChange={nbtChange}
                            suffix={<Tooltip title='解析一段合法的nbt标签'><span onClick={openParse} style={{ cursor: 'pointer', color: '#1890ff' }}>解析</span></Tooltip>}
                            addonBefore={<div style={{ width: 53, textAlign: 'left' }}>nbt</div>}
                            placeholder='必填项，请输入' />
                    </div>
                    <div>
                        <Input
                            spellCheck={false}
                            placeholder='必填项，请输入'
                            value={nbt.nbtOption === 'block' ? nbt.block : nbt.nbtOption === 'entity' ? nbt.entity : nbt.storage}
                            onChange={nbtOptChange}
                            addonBefore={
                            <Select defaultValue='entity' value={nbt.nbtOption} onChange={nbtSelectChange} style={{ width: 75 }}>
                                <Select.Option value='block'>block</Select.Option>
                                <Select.Option value='entity'>entity</Select.Option>
                                <Select.Option value='storage'>storage</Select.Option>
                            </Select> } />
                    </div>
                </div>
            )
        } else if (nbt.option === 'score') {
            return (
                <div>
                    <div style={{ marginBottom: 10 }}>
                        <Input value={nbt.score.name} onChange={scoreNameChange} spellCheck={false} placeholder='必填项，请输入' addonBefore={<div style={{ width: 79, textAlign: 'left' }}>name</div>} />
                    </div>
                    <div>
                        <Input
                            key='score'
                            spellCheck={false}
                            ref={scoreRef}
                            autoFocus
                            placeholder='必填'
                            value={nbt.score.option === 'objective' ? nbt.score.objective : nbt.score.value}
                            onChange={scoreOptChange}
                            addonBefore={
                                <Select defaultValue='objective' style={{ width: 100 }} value={nbt.score.option} onChange={scoreSelectChange}>
                                    <Select.Option key='objective' value='objective'>objective</Select.Option>
                                    <Select.Option key='value' value='value'>value</Select.Option>
                                </Select>
                            } />
                    </div>
                </div>
            )
        } else if (nbt.option === 'selector') {
            return <Input ref={selectorRef} autoFocus value={nbt.selector} onChange={selectorChange} spellCheck={false} placeholder='必填项，请输入' addonBefore={<div style={{ width: 53, textAlign: 'left' }}>selector</div>} />
        } else {
            return <Input.TextArea ref={textRef} autoFocus spellCheck={false} value={nbt.text} onChange={textChange} style={{ resize: 'none' }} placeholder='必填项，请输入' rows={8}></Input.TextArea>
        }
    }
    return (
        <div className='mc-tellraw'>
            <Import visible={importVisible} onCancel={importCancel} onSubmit={importSubmit} />
            <Parse visible={parseVisible} onCancel={parseCancel} onSubmit={parseSubmit} />
            <Row>
                <Col style={{ textAlign: 'right', lineHeight: '30px' }} span={3}>预览：</Col>
                <Col span={19}>
                    <JsonView
                        className='mc-tellraw-view'
                        style={{ backgroundColor: getColor(bgColor), minHeight: 180, maxHeight: 240, overflowY: 'auto' }}
                        onClick={merify}
                        value={bgColor}
                        onChange={bgColorChange}
                        jsonList={objGroup.nbt}
                        posChange={posChange}
                        styleList={objGroup.style}
                        actIndex={objGroup.actIndex} />
                </Col>
            </Row>
            <div className='mc-tellraw-cont'>
                <div className='mc-tellraw-right-bar'>
                    <Row className='group'>
                        <Col style={{ textAlign: 'right', lineHeight: '30px' }} span={3}>操作：</Col>
                        <Col span={19}>
                            <Button.Group style={{ float: 'left' }}>
                                <Button style={{ width: 65 }} type='primary' onClick={add} title='shift+enter'>新增</Button>
                                <Button disabled={nbt.option !== 'text'} style={{ width: 65 }} title='ctrl+k' onClick={editPro}>拆分</Button>
                                <Button style={{ width: 65, color: 'red' }} onClick={remove} title='ctrl+delete'>删除</Button>
                                <Button style={{ width: 65, color: 'red' }} onClick={clear}>清空</Button>
                                <Button style={{ width: 65 }} onClick={cancel} title='esc'>取消</Button>
                                <Button style={{ width: 65 }} onClick={generate.bind(null, null, true)} title='ctrl+g'>生成</Button>
                                <Button style={{ width: 65 }} onClick={save} title='ctrl+s'>暂存</Button>
                                <Button style={{ width: 65 }} onClick={importJson}>导入</Button>
                                <Button style={{ width: 65 }} onClick={exportJson}>导出</Button>
                                <Button style={{ width: 65 }} onClick={share}>分享</Button>
                                <Button style={{ width: 65 }} type='primary' onClick={open} title='ctrl+p'>仓库</Button>
                            </Button.Group>
                        </Col>
                    </Row>
                    <Row className='group'>
                        <Col style={{ textAlign: 'right', lineHeight: '30px' }} span={3}>样式：</Col>
                        <Col span={19}>
                            <Button.Group style={{ paddingRight: 10 }}>
                                <Button style={{ width: 65 }} type={nbt.bold ? 'primary' : 'default'} onClick={changeStyle.bind(null, 'bold')} title='ctrl+b'>粗体</Button>
                                <Button style={{ width: 65 }} type={nbt.italic ? 'primary' : 'default'} onClick={changeStyle.bind(null, 'italic')} title='ctrl+i'>斜体</Button>
                                <Button style={{ width: 65 }} type={nbt.underlined ? 'primary' : 'default'} onClick={changeStyle.bind(null, 'underlined')} title='ctrl+u'>下划线</Button>
                                <Button style={{ width: 65 }} type={nbt.strikethrough ? 'primary' : 'default'} onClick={changeStyle.bind(null, 'strikethrough')} title='ctrl+shift+s'>删除线</Button>
                                <Button style={{ width: 65 }} type={nbt.obfuscated ? 'primary' : 'default'} onClick={changeStyle.bind(null, 'obfuscated')} title='ctrl+o'>混淆</Button>
                            </Button.Group>
                            <span>
                                字体颜色：<ColorPicker presetColors={colors} style={{ verticalAlign: 'middle' }} value={toRGBColor(nbt.color)}  onChange={colorChange} />
                            </span>
                        </Col>
                    </Row>
                    <Row style={{ marginBottom: 10 }}>
                        <Col span={3} style={{ textAlign: "right", paddingTop: 4 }}>点击click：</Col>
                        <Col span={19}>
                            <Input
                                addonBefore={
                                    <Select onChange={cmdSelectChange} value={nbt.clickEvent && nbt.clickEvent.action} defaultValue='run_command' style={{ width: 100 }}>
                                        <Select.Option value='run_command'>执行指令</Select.Option>
                                        <Select.Option value='open_url'>打开网址</Select.Option>
                                        <Select.Option value='suggest_command'>输入文本</Select.Option>
                                        <Select.Option value='copy_to_clipboard'>复制内容</Select.Option>
                                        <Select.Option value='change_page'>切换页码</Select.Option>
                                    </Select>
                                }
                                placeholder='选填'
                                allowClear
                                value={nbt.clickEvent && nbt.clickEvent.value}
                                onChange={clickTextChange} />
                        </Col>
                    </Row>
                    <Row style={{ marginBottom: 10 }}>
                        <Col span={3} style={{ textAlign: "right", paddingTop: 4 }}>悬浮hover：</Col>
                        <Col span={19}>
                            <Input
                                addonBefore={
                                    <Select onChange={hoverSelectChange} value={nbt.hoverEvent && nbt.hoverEvent.action} defaultValue='show_text' style={{ width: 100 }}>
                                        <Select.Option value='show_text'>text</Select.Option>
                                        <Select.Option value='show_item'>item</Select.Option>
                                        <Select.Option value='show_entity'>entity</Select.Option>
                                    </Select>
                                }
                                placeholder='选填'
                                allowClear
                                value={nbt.hoverEvent && nbt.hoverEvent.value}
                                onChange={hoverTextChange}
                                addonAfter={
                                    (nbt.hoverEvent && nbt.hoverEvent.action && nbt.hoverEvent.action === 'show_text')
                                        ? (
                                            <Select onChange={hoverModeChange} value={nbt.hoverEvent && nbt.hoverEvent.pro}>
                                                <Select.Option value={0}>常规模式</Select.Option>
                                                <Select.Option value={1}>高级模式</Select.Option>
                                            </Select>
                                        )
                                        : null
                                } />

                        </Col>
                    </Row>
                    <Row style={{ marginBottom: 10 }}>
                        <Col span={3} style={{ textAlign: "right", paddingTop: 4 }}>可选类型：</Col>
                        <Col span={19}>
                            <Radio.Group defaultValue='text' value={nbt.option} onChange={optChange} style={{ marginBottom: 10}}>
                                <Radio key='text' value="text">text</Radio>
                                <Radio key='nbt' value="nbt">nbt</Radio>
                                <Radio key='selector' value="selector">selector</Radio>
                                <Radio key='score' value="score">score</Radio>
                            </Radio.Group>
                            {renderOption()}
                        </Col>
                    </Row>
                    <Row style={{ marginBottom: 10 }}>
                        <Col span={3} style={{ textAlign: "right", paddingTop: 4 }}>备注：</Col>
                        <Col span={19}>
                            <Input style={{ marginBottom: 10 }} maxLength={20} placeholder='选填，限20字' value={objGroup.mark} onChange={markChange} />
                            <EditableTagGroup tags={tags} onClose={changeByTag} onClick={clickHandleByTag} onChange={changeByTag} />
                        </Col>
                    </Row>
                </div>
            </div>
            <Output
                generate={generate}
                fillHover={fillHover}
                editData={editData}
                removeOne={removeOne}
                remove={removeData}
                pack={pack}
                merge={merge}
                move={move}
                visible={visible}
                data={data}
                onClose={onClose} />
        </div>
    )
}
import React, { useState, useEffect, useRef } from "react";
import { Button, Select, Input, Row, Col, message, Radio, Modal, Icon, Tooltip, AutoComplete } from "antd";
import { JsonGroup } from "../../lib/tellraw";
import './index.scss'
import { ITileProps, textType, nbtType } from "../../lib/tellraw/JsonTile";
import color from "../../lib/tellraw/color";
import { RGBColor } from "react-color";
import copy from 'copy-to-clipboard';
import JsonView from "../../unit/JsonView";
import Output, { TellrawData } from "./Output";
import Import from "./Import";
import TileError from "../../util/TileError";
import { SelectColor } from "../../unit/SelectColor";
import TextArea from "antd/lib/input/TextArea";
import Parse from "./Parse";

let jsonGroup = new JsonGroup(null);
jsonGroup.add()
const initColor = {r: 248, g: 233, b: 204, a: 1};

export default function() {
    const [nbt, setNbt] = useState<ITileProps>({});
    const [bgColor, setBgColor] = useState<RGBColor>(initColor);
    const [objGroup, setObjGroup] = useState(jsonGroup.toJson());
    const [visible, setVisible] = useState(false);
    const [importVisible, setImportVisible] = useState(false);
    const [parseVisible, setParseVisible] = useState(false);
    const [data, setData] = useState<TellrawData[]>([]);
    const [actIndex, setActIndex] = useState(-1);
    const textRef = useRef<TextArea>()
    const nbtRef = useRef<Input>()
    const selectorRef = useRef<Input>()
    const scoreRef = useRef<Input>()

    useEffect(() => {
        window.addEventListener('keydown', textKeyDown)
        update()
        return () => {
            window.removeEventListener('keydown', textKeyDown)
        }
    }, [])
    const clickHandle = (type: textType) => {
        jsonGroup.actTile.change(type);
        update()
    }
    const update = () => {
        setNbt(() => {
            if (!jsonGroup.actTile) {
                jsonGroup.add()
            }
            return jsonGroup.actTile.toJson()
        })
        setObjGroup(() => jsonGroup.toJson());
    }
    const editPro = () => {
        if (jsonGroup.actTile.isEmpty()) {
            message.warn(`请选择一个非空项`)
        } else {
            jsonGroup.editPro()
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
            message.warn(`必填项为空，请填写`)
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
            mark: jsonGroup.getMark() ? jsonGroup.getMark() : jsonGroup.getTiles()[0].getText(),
            id: Math.random().toString(36).slice(3),
        }
        if (actIndex > -1) {
            data.splice(actIndex, 1, newData)
            setData(() => [...data])
            setActIndex(() => -1)
        } else {
            setData(data => [...data, newData])
        }
        message.success('保存成功')
        clear()
    }
    const open = () => {
        setVisible(() => true)
    }
    const colorChange = (color: string) => {
        jsonGroup.actTile.setColor(color)
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
    const textKeyDown = (e: any) => {
        const k = e.key.toLowerCase();
        if (jsonGroup.actTile) {
            if (e.ctrlKey && !e.shiftKey && !e.altKey) {
                if (k === 'b') {
                    e.preventDefault()
                    jsonGroup.actTile.change('bold');
                    update();
                } else if (k === 'i') {
                    e.preventDefault()
                    jsonGroup.actTile.change('italic');
                    update();
                } else if (k === 'u') {
                    e.preventDefault()
                    jsonGroup.actTile.change('underlined');
                    update();
                } else if (k === 's') {
                    e.preventDefault()
                    jsonGroup.actTile.change('strikethrough');
                    update();
                } else if (k === 'o') {
                    e.preventDefault()
                    jsonGroup.actTile.change('obfuscated');
                    update();
                } else if (k === 'arrowleft') {
                    e.preventDefault()
                    jsonGroup.prev();
                    update();
                } else if (k === 'arrowright') {
                    e.preventDefault()
                    jsonGroup.next();
                    update()
                } else if (k === 'delete') {
                    e.preventDefault()
                    remove();
                } else if (k === 'arrowup') {
                    e.preventDefault()
                    const i = color.findIndex(item => item.id === jsonGroup.actTile.getColor())
                    jsonGroup.actTile.setColor(color[(i + 1) % 16].id);
                    update();
                } else if (k === 'arrowdown') {
                    e.preventDefault()
                    const i = color.findIndex(item => item.id === jsonGroup.actTile.getColor())
                    jsonGroup.actTile.setColor(color[i === 0 ? 15 : i - 1].id);
                    update();
                } else if (k === 'g') {
                    e.preventDefault()
                    generate(null)
                } else if (k === 'k') {
                    e.preventDefault()
                    editPro();
                }
            } else if (e.shiftKey && !e.ctrlKey && !e.altKey) {
                if (k === 'enter') {
                    e.preventDefault()
                    add()
                }
            } else if (k === 'escape') {
                e.preventDefault()
                cancel()
            }
        }
        if (e.ctrlKey) {
            if (k === 'p') {
                e.preventDefault()
                open()
            }
            if (e.shiftKey) {
                if (k === 's') {
                    e.preventDefault()
                    save()
                }
            }
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
    }
    const importJson = () => {
        setImportVisible(() => true)
    }
    const exportJson = () => {
        if (jsonGroup.hasEmpty()) {
            message.success('空空如也~，快去添加吧')
        } else {
            copy(JSON.stringify(jsonGroup.export()))
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
        } catch (error) {
            if (error instanceof TileError) {
                message.error(error.toString())
            } else {
                message.error('导入数据错误，无法解析')
            }
        }
    }
    const editData = (index: number) => {
        jsonGroup = data[index].data
        setActIndex(() => index)
        setObjGroup(() => jsonGroup.toJson())
    }
    const removeOne = (index: number) => {
        Modal.confirm({
            title: '警告',
            okText: '确定',
            cancelText: '取消',
            content: '确定删除该项吗？删除不可恢复',
            onOk: () => {
                setData(data => {
                    data.splice(index, 1)
                    return [...data]
                })
                if (actIndex === index) {
                    clear()
                } else if (actIndex > index) {
                    setActIndex(() => actIndex - 1)
                }
                message.success('删除成功')
            },
            onCancel(){}
        })
    }
    const removeData = (id: string[]) => {
        if (!id.length) {
            message.warning('请至少选择1项')
            return;
        }
        id.forEach(id => {
            data.splice(data.findIndex(item => item.id === id), 1)
        })
        setData(() => [...data])
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
                <Col span={18}>
                    <JsonView
                        className='mc-tellraw-view'
                        style={{ backgroundColor: getColor(bgColor), height: 180, overflowY: 'auto' }}
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
                        <Col span={18}>
                            <Button.Group style={{ float: 'left' }}>
                                <Button style={{ width: 65 }} type='primary' onClick={add} title='shift+enter'>新增</Button>
                                <Button disabled={nbt.option !== 'text'} style={{ width: 65 }} title='ctrl+k' onClick={editPro}>拆分</Button>
                                <Button style={{ width: 65, color: 'red' }} onClick={remove} title='ctrl+delete'>删除</Button>
                                <Button style={{ width: 65, color: 'red' }} onClick={clear}>清空</Button>
                                <Button style={{ width: 65 }} onClick={cancel} title='esc'>取消</Button>
                                <Button style={{ width: 65 }} onClick={generate.bind(null, null, true)} title='ctrl+g'>生成</Button>
                                <Button style={{ width: 65 }} onClick={save} title='ctrl+shift+s'>暂存</Button>
                                <Button style={{ width: 65 }} onClick={importJson}>导入</Button>
                                <Button style={{ width: 65 }} onClick={exportJson}>导出</Button>
                                <Button style={{ width: 65 }} type='primary' onClick={open} title='ctrl+p'>仓库</Button>
                            </Button.Group>
                        </Col>
                    </Row>
                    <Row className='group'>
                        <Col style={{ textAlign: 'right', lineHeight: '30px' }} span={3}>样式：</Col>
                        <Col span={18}>
                            <Button.Group style={{ paddingRight: 10 }}>
                                <Button style={{ width: 65 }} type={nbt.bold ? 'primary' : 'default'} onClick={clickHandle.bind(null, 'bold')} title='ctrl+b'>粗体</Button>
                                <Button style={{ width: 65 }} type={nbt.italic ? 'primary' : 'default'} onClick={clickHandle.bind(null, 'italic')} title='ctrl+i'>斜体</Button>
                                <Button style={{ width: 65 }} type={nbt.underlined ? 'primary' : 'default'} onClick={clickHandle.bind(null, 'underlined')} title='ctrl+u'>下划线</Button>
                                <Button style={{ width: 65 }} type={nbt.strikethrough ? 'primary' : 'default'} onClick={clickHandle.bind(null, 'strikethrough')} title='ctrl+s'>删除线</Button>
                                <Button style={{ width: 65 }} type={nbt.obfuscated ? 'primary' : 'default'} onClick={clickHandle.bind(null, 'obfuscated')} title='ctrl+o'>混淆</Button>
                            </Button.Group>
                            <span>
                                字体颜色：<SelectColor value={nbt.color}  onChange={colorChange} />
                            </span>
                        </Col>
                    </Row>
                    <Row style={{ marginBottom: 10 }}>
                        <Col span={3} style={{ textAlign: "right", paddingTop: 4 }}>点击click：</Col>
                        <Col span={18}>
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
                        <Col span={18}>
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
                        <Col span={18}>
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
                        <Col span={18}>
                            <Input maxLength={20} placeholder='选填' value={objGroup.mark} onChange={markChange} />
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
                move={move}
                visible={visible}
                data={data}
                onClose={onClose} />
        </div>
    )
}
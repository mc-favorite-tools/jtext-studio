/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
import React, { useState, useRef, useEffect } from "react";
import { Modal, Input, TreeSelect, message, Row, Col } from "antd";
// @ts-ignore
import parse from "mojangson-parser";
import Search from "antd/lib/input/Search";
import { nbtType } from "../../lib/tellraw/JsonTile";

interface IProps {
    visible: boolean,
    onCancel?: () => void,
    onSubmit?: (path: string, value: string, type: nbtType) => void,
}
export default function(props: IProps) {
    const [path, setPath] = useState([])
    const [data, setData] = useState([])
    const [select, setSelect] = useState(undefined)
    const inputRef = useRef<Search>()
    const valueRef = useRef<string>('')
    const typeRef = useRef<nbtType>('entity')
    
    const handleCancel = () => {
        if (props.onCancel) {
            props.onCancel()
        }
    }
    const handleSuibmit = () => {
        if (props.onSubmit) {
            const result = path.reduce<string>((s, v) => {
               return s += (Array.isArray(v) ? `${v[0]}[${v[1]}]` : v) + '.'
            }, '')
            props.onSubmit(result.slice(0, -1), valueRef.current, typeRef.current)
        }
    }
    useEffect(() => {
        inputRef.current && inputRef.current.focus()
    }, [props.visible])
    const createSelectNode = (data: any, path: any = []) => {
        const isArray = Array.isArray(data)
        let last: any;
        if (isArray) {
            last = path.pop()
        }
        return (
            Object.keys(data).map((key) => {
                const value = data[key]
                const type = typeof value
                const newPath = [...path, isArray ? [last, key] : key];
                if (type === 'string' || 
                    type === 'boolean' || 
                    type === 'number') {
                    return (
                        <TreeSelect.TreeNode 
                            path={newPath} 
                            title={`${key}: ${value.length > 30 ? `${value.slice(0, 30)}...` : value}`}
                            key={newPath.toString()}
                            value={newPath.toString()} />
                    )
                }
                return (
                    <TreeSelect.TreeNode path={newPath} title={`${key}`} key={newPath.toString()} value={newPath.toString()}>
                        {createSelectNode(value, [...newPath])}
                    </TreeSelect.TreeNode>
                )
            })
        )
    }
    const onSearch = (value: string) => {
        try {
            const index = value.indexOf('{')
            if (index === -1) {
                message.error('请输入合法的nbt')
            } else {
                if (value.startsWith('/setblock')) {
                    const match = value.match(/setblock (.+) minecraft/)
                    if (match) {
                        valueRef.current = match[1]
                        typeRef.current = 'block'
                    }
                } else if (value.startsWith('/summon')) {
                    const match = value.match(/summon minecraft:(\w+)/)
                    if (match) {
                        valueRef.current = match[1]
                        typeRef.current = 'entity'
                    }
                }
                const data = parse(value.slice(index))
                setData(() => data)
                setSelect(() => '')
                message.success('解析成功，请选择需要的路径')
            }
        } catch (error) {
            message.error('请输入合法的nbt')
        }
    }
    const onSelect = (_: any, treeNode: any) => {
        const path = treeNode.props.path
        setSelect(() => path)
        setPath(() => path)
    }
    return (
        <Modal
            visible={props.visible}
            onCancel={handleCancel}
            onOk={handleSuibmit}
            okText='确定'
            cancelText='取消'
            title='游戏中F3 + i复制nbt' >
            <Row style={{ marginBottom: 10 }}>
                <Col span={3}>
                    <span style={{ lineHeight: '32px' }}>nbt：</span>
                </Col>
                <Col span={21}>
                    <Input.Search allowClear enterButton="解析" autoFocus ref={inputRef} spellCheck={false} onSearch={onSearch} placeholder='请输入' />
                </Col>
            </Row>
            <Row>
                <Col span={3}>
                    <span style={{ lineHeight: '32px' }}>路径：</span>
                </Col>
                <Col span={21}>
                    <TreeSelect
                        dropdownStyle={{ maxHeight: 350, overflow: 'auto' }} 
                        notFoundContent='暂无内容可选'
                        style={{ width: '100%' }} 
                        onSelect={onSelect}
                        value={select}
                        placeholder='请选择'>
                        {createSelectNode(data)}
                    </TreeSelect>
                </Col>
            </Row>
        </Modal>
    )
}
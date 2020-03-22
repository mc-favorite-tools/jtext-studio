import React, { useState, useRef, useEffect } from "react";
import { Modal, Input, TreeSelect, message, Row, Col } from "antd";
import Nbt from "../../lib/parse";
import Search from "antd/lib/input/Search";

interface IProps {
    visible: boolean,
    onCancel?: () => void,
    onSubmit?: (value: string, id: string) => void,
}
export default function(props: IProps) {
    const [value, setValue] = useState([])
    const [data, setData] = useState([])
    const inputRef = useRef<Search>()
    const idRef = useRef<string>('')

    const handleCancel = () => {
        if (props.onCancel) {
            props.onCancel()
        }
    }
    const handleSuibmit = () => {
        if (props.onSubmit) {
            const result = value.reduce<string>((s, v) => {
               return s += (Array.isArray(v) ? `${v[0]}[${v[1]}]` : v) + '.'
            }, '')
            props.onSubmit(result.slice(0, -1), idRef.current)
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
                            title={`${key}: ${value}`}
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
                const match = value.match(/summon minecraft:(\w+)/)
                if (match) {
                    idRef.current = match[1]
                }
                const data = Nbt.parse(value.slice(index))
                setData(() => data)
                message.success('解析成功，请选择需要的路径')
            }
        } catch (error) {
            message.error('请输入合法的nbt')
        }
    }
    const onSelect = (_: any, treeNode: any) => {
        setValue(() => treeNode.props.path)
    }
    return (
        <Modal
            visible={props.visible}
            onCancel={handleCancel}
            onOk={handleSuibmit}
            okText='确定'
            cancelText='取消'
            title='解析nbt' >
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
                        placeholder='请选择'>
                        {createSelectNode(data)}
                    </TreeSelect>
                </Col>
            </Row>
        </Modal>
    )
}
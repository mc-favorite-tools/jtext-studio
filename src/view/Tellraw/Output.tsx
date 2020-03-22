import React, { useState } from "react";
import { Table, Button, Drawer, message } from "antd";
import { JsonGroup } from "../../lib/tellraw";
import copy from "copy-to-clipboard";
import ButtonGroup from "antd/lib/button/button-group";

export interface TellrawData {
    time: string,
    mark: string,
    data: JsonGroup,
    id: string,
}
interface IProps {
    visible: boolean,
    onClose: () => void,
    data: TellrawData[],
    editData: (index: number) => void,
    removeOne: (index: number) => void,
    pack: (keys: string[], items: TellrawData[]) => void,
    remove: (keys: string[]) => void,
    move: (items: TellrawData[]) => void,
    generate: (index: number, valid: boolean) => void,
    fillHover: (index: number) => void,
}
export default function(props: IProps) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
    const [selectedRowItems, setSelectedRowItems] = useState<TellrawData[]>([])
    const toTellraw = () => {
        if (selectedRowKeys.length) {
            const result = selectedRowItems.reduce((s, e) => {
                s += e.data.toString() + ','
                return s
            }, '').trimEnd(',')
            copy(`/tellraw @p ["",${result}]`)
            message.success('已复制到剪切板')
            return;
        }
        message.warning('请至少选择一项')
    }
    const toSign = () => {
        if (selectedRowKeys.length > 0 && selectedRowKeys.length <= 4) {
            const result = selectedRowItems.map((item, index) => `Text${index + 1}:"[${item.data.toString().escape().trimEnd(',')}]"`).join(',')
            copy(`/give @p oak_sign{BlockEntityTag:{${result}}}`)
            message.success('已复制到剪切板')
            return;
        }
        message.warning('请选择1-4项')
    }
    const toBook = () => {
        if (selectedRowKeys.length) {
            const result = selectedRowItems.map(item => `"[${item.data.toString().escape().trimEnd(',')}]"`).join(',')
            copy(`/give @p written_book{pages:[${result}],title:"mc studio",author:"by hans"}`)
            message.success('已复制到剪切板')
            return;
        }
        message.warning('请至少选择一项')
    }
    const toTitle = () => {
        if (selectedRowKeys.length) {
            const result = selectedRowItems.reduce((s, e) => {
                s += e.data.toString() + ','
                return s
            }, '').trimEnd(',')
            copy(`/title @p title ["",${result}]`)
            message.success('已复制到剪切板')
            return;
        }
        message.warning('请至少选择一项')
    }
    const onChange = (select: any, items: any) => {
        setSelectedRowKeys(() => select)
        setSelectedRowItems(() => items)
    }
    const rowSelection = {
        selectedRowKeys,
        onChange
    }
    const columns: any = [
        {
            title: '序号',
            width: 100,
            render: (_: any, __: any, index: number) => {
                return index + 1 
            }
        },
        {
            key: 'mark',
            dataIndex: 'mark',
            title: '备注',
            ellipsis: true,
        },
        {
            key: 'time',
            dataIndex: 'time',
            title: '创建时间',
            width: 150
        },
        {
            key: 'action',
            dataIndex: 'action',
            fixed: 'right',
            title: '操作',
            render: (_: string, __: TellrawData, index: number) => {
                return (
                    <div>
                        <a style={{ marginRight: 8 }} onClick={props.editData.bind(null, index)}>编辑</a>
                        <a style={{ marginRight: 8 }} onClick={props.generate.bind(null, index, false)}>生成</a>
                        <a style={{ marginRight: 8 }} title='启用hover高级模式，并填充当前项' onClick={props.fillHover.bind(null, index)}>hover</a>
                        <a style={{ color: 'red' }} onClick={props.removeOne.bind(null, index)}>删除</a>
                    </div>
                )
            }
        },
    ]
    const remove = () => {
        props.remove(selectedRowKeys)
        setSelectedRowKeys(() => [])
    }
    return (
        <Drawer
            width={720}
            onClose={props.onClose}
            visible={props.visible}
            title={
                <div>
                    <div style={{ float: 'right', marginRight: 50 }}>
                        <ButtonGroup>
                            <Button onClick={toTellraw} type='primary'>tellraw</Button>
                            <Button onClick={toSign}>sign</Button>
                            <Button onClick={toBook}>book</Button>
                            <Button onClick={toTitle}>title</Button>
                        </ButtonGroup>
                        <ButtonGroup style={{ marginLeft: 10 }}>
                            <Button onClick={props.move.bind(null, selectedRowItems)} title='将选择项向上移动'>移动</Button>
                            <Button onClick={props.pack.bind(null, selectedRowKeys, selectedRowItems)}>整理</Button>
                            <Button style={{ color: 'red' }} onClick={remove}>删除</Button>
                        </ButtonGroup>
                    </div>
                    <h3>仓库</h3>
                </div>
            }
            bodyStyle={{ paddingBottom: 80 }}>
            <Table
                columns={columns}
                size='small'
                locale={{ emptyText: '暂无数据' }}
                rowKey='id'
                rowSelection={rowSelection}
                pagination={false}
                dataSource={props.data}/>
        </Drawer>
    )
}
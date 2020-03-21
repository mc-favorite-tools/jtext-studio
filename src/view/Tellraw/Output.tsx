import React, { useState } from "react";
import { Table, Button, Drawer, message } from "antd";
import { JsonGroup } from "../../lib/tellraw";
import copy from "copy-to-clipboard";

export interface TellrawData {
    time: string,
    mark: string,
    data: JsonGroup,
}
interface IProps {
    visible: boolean,
    onClose: () => void,
    data: TellrawData[],
    editData: (index: number) => void,
    removeData: (index: number) => void,
    generate: (index: number) => void,
}
export default function(props: IProps) {
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [selectedRowItems, setSelectedRowItems] = useState<TellrawData[]>([])
    const generate = () => {
        
    }
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
            width: 150,
            title: '操作',
            render: (_: string, __: TellrawData, index: number) => {
                return (
                    <div>
                        <a style={{ marginRight: 8 }} onClick={props.editData.bind(null, index)}>编辑</a>
                        <a style={{ marginRight: 8 }} onClick={props.generate.bind(null, index)}>生成</a>
                        <a onClick={props.removeData.bind(null, index)}>删除</a>
                        {/* <a onClick={preview.bind(null, record)}>预览</a> */}
                    </div>
                )
            }
        },
    ]
    return (
        <Drawer
            width={720}
            onClose={props.onClose}
            visible={props.visible}
            title={
                <div>
                    <div style={{ float: 'right', marginRight: 50 }}>
                        <Button onClick={toTellraw} type='primary' style={{ marginRight: 10 }}>tellraw</Button>
                        <Button onClick={toSign} type='primary' style={{ marginRight: 10 }}>sign</Button>
                        <Button onClick={toBook} type='primary' style={{ marginRight: 10 }}>book</Button>
                        <Button onClick={toTitle} type='primary'>title</Button>
                    </div>
                    <h3>输出面板</h3>
                </div>
            }
            bodyStyle={{ paddingBottom: 80 }}>
            <Table
                columns={columns}
                size='small'
                locale={{ emptyText: '暂无数据' }}
                rowKey={(_: any, index: number) => index + ''}
                rowSelection={rowSelection}
                pagination={false}
                dataSource={props.data}/>
        </Drawer>
    )
}
import React, { useState } from "react";
import { Table, Button, Drawer, message } from "antd";
import { JsonGroup } from "../../lib/tellraw";
import copy from "copy-to-clipboard";

export interface CmdProps {
    time: string,
    mark: string,
    data: string,
}
interface IProps {
    visible: boolean,
    onClose: () => void,
    data: CmdProps[],
    editData: (index: number) => void,
    removeData: (index: number) => void,
    generate: (index: number) => void,
}
export default function(props: IProps) {
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [selectedRowItems, setSelectedRowItems] = useState<CmdProps[]>([])
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
            render: (_: string, __: CmdProps, index: number) => {
                return (
                    <div>
                        <a style={{ marginRight: 8 }} onClick={props.editData.bind(null, index)}>编辑</a>
                        <a style={{ marginRight: 8 }} onClick={props.generate.bind(null, index)}>生成</a>
                        <a onClick={props.removeData.bind(null, index)}>删除</a>
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
                    </div>
                    <h3>预置命令</h3>
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
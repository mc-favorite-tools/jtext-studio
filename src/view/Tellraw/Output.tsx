import React, { useState, useRef } from "react";
import { Table, Button, Drawer, message, notification, Input, Tooltip } from "antd";
import { JsonGroup } from "../../lib/tellraw";
import copy from "copy-to-clipboard";
import ButtonGroup from "antd/lib/button/button-group";
import { SorterResult } from "antd/lib/table";
import JsonView from "../../unit/JsonView";

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
    editData: (id: string) => void,
    removeOne: (id: string) => void,
    pack: (keys: string[], items: TellrawData[]) => void,
    remove: (keys: string[]) => void,
    move: (items: TellrawData[]) => void,
    generate: (index: number, valid: boolean) => void,
    fillHover: (index: number) => void,
}
export default function(props: IProps) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
    const [selectedRowItems, setSelectedRowItems] = useState<TellrawData[]>([])
    const [, setSorter] = useState<SorterResult<TellrawData>>()
    const [searchText, setSearchText] = useState('')
    const searchInputRef = useRef<Input>()

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
    const replace = (value: string) => {
        copy(value.replace(/\\\\n/g, ''))
        notification.close('replace')
    }
    const toSign = () => {
        if (selectedRowKeys.length > 0 && selectedRowKeys.length <= 4) {
            const result = selectedRowItems.map((item, index) => `Text${index + 1}:"[${item.data.toString().escape().trimEnd(',')}]"`).join(',')
            if (result.includes('\\n')) {
                notification.warning({
                    key: 'replace',
                    message: '警告',
                    description: '木牌中无法显示换行，是否将其删除？',
                    btn: (
                        <Button type='primary' onClick={replace.bind(null, result)}>替换</Button>
                    ),
                })
            }
            copy(`/give @p oak_sign{BlockEntityTag:{${result}}}`)
            message.success('已复制到剪切板')
            return;
        }
        message.warning('请选择1-4项')
    }
    const toBook = () => {
        if (selectedRowKeys.length) {
            const result = selectedRowItems.map(item => `"[${item.data.toString().escape().trimEnd(',')}]"`).join(',')
            copy(`/give @p written_book{pages:[${result}],title:"",author:"made by JText Studio"}`)
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
    const removeOne = (id: string) => {
        props.removeOne(id)
        setSelectedRowKeys(keys => keys.filter(v => v !== id))
    }
    const handleSearch = (selectedKeys: string[], confirm: any, dataIndex: any) => {
        if (selectedKeys.length) {
            confirm();
            setSearchText(() => selectedKeys[0]);
        } else {
            message.warning('请输入筛选条件')
        }
    }
    const handleReset = (clearFilters: any) => {
        clearFilters();
        setSearchText(() => '')
      }
    const getColumnSearchProps = (dataIndex: string) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInputRef}
                    placeholder='请输入关键字'
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                <Button
                    type="primary"
                    onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    size="small"
                    style={{ width: 90, marginRight: 8 }}>筛选</Button>
                <Button
                    onClick={() => handleReset(clearFilters)}
                    size="small"
                    style={{ width: 90 }}>重置</Button>
            </div>
        ),
        onFilter: (value: string, record: any) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible: boolean) => {
            if (visible) {
                setTimeout(() => searchInputRef.current.select());
            }
        },
    })
    const changeHandle = (_: any, __: any, sorter: SorterResult<TellrawData>) => {
        setSorter(() => sorter)
    }
    const columns: any = [
        {
            title: '序号',
            width: 50,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            key: 'mark',
            dataIndex: 'mark',
            title: '备注',
            ellipsis: true,
            render: (text: string, record: TellrawData) => {
                const data = record.data.toJson()
                return (
                    <Tooltip title={<JsonView readonly={true} className='mc-tellraw-view' jsonList={data.nbt} styleList={data.style} />}>
                        {text}
                    </Tooltip>
                )
            },
            ...getColumnSearchProps('mark'),
        },
        {
            key: 'time',
            dataIndex: 'time',
            title: '创建时间',
            width: 150,
            sorter: (a: TellrawData, b: TellrawData) => Date.parse(a.time) - Date.parse(b.time),
        },
        {
            key: 'action',
            dataIndex: 'action',
            fixed: 'right',
            title: '操作',
            render: (_: string, record: TellrawData, index: number) => {
                return (
                    <div>
                        <a style={{ marginRight: 8 }} onClick={props.editData.bind(null, record.id)}>编辑</a>
                        <a style={{ marginRight: 8 }} onClick={props.generate.bind(null, index, false)}>生成</a>
                        <a style={{ marginRight: 8 }} title='启用hover高级模式，并填充当前项' onClick={props.fillHover.bind(null, index)}>hover</a>
                        <a style={{ color: 'red' }} onClick={removeOne.bind(null, record.id)}>删除</a>
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
                            <Button disabled={!!searchText.length} onClick={props.move.bind(null, selectedRowItems)} title='将选择项向上移动'>移动</Button>
                            <Button disabled={!!searchText.length} onClick={props.pack.bind(null, selectedRowKeys, selectedRowItems)}>整理</Button>
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
                onChange={changeHandle}
                dataSource={props.data}/>
        </Drawer>
    )
}
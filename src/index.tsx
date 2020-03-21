import 'antd/dist/antd.css';
import './index.scss';
import './util/string';
import './util/date'
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import Axios from 'axios';
import Tellraw from './view/Tellraw';
import Nbt from './lib/parse';
import { TreeSelect } from 'antd';

Axios.interceptors.response.use(res => {
    return res.data
})

function Abc() {
    const [nbt, setNbt] = useState([])
    useEffect(() => {
        Axios.get('./tmp.txt').then((data) => {
            const nbt = Nbt.parse(data)
            setNbt(() => nbt)
        })
    }, [])

    function onClick(_: any, TreeNode: any) {
        console.log(TreeNode.props.path);
    }
    function create(data: any, path: any = []): any {
        const isArray = Array.isArray(data)
        let last: any;
        if (isArray) {
            last = path.pop()
        }
        return (
            Object.keys(data).map((key) => {
                const value = data[key]
                const type = typeof value
                let newPath;
                if (isArray) {
                    newPath = [...path, [last, key]]
                } else {
                    newPath = [...path, key]
                }
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
                        {create(value, [...newPath])}
                    </TreeSelect.TreeNode>
                )
            })
        )
    }
    return (
        <TreeSelect 
            onSelect={onClick}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }} 
            style={{ width: 300 }} >
            {create(nbt)}
        </TreeSelect>
    )
}
ReactDOM.render(
    <div style={{ paddingTop: 20 }}>
        <Tellraw />
        <div style={{ textAlign: 'center', position: 'fixed', bottom: 20, width: '100%' }}>
            <a href="https://github.com/haima16/mc-jtext" target='_blank'>使用文档</a> | 
            <a href="https://github.com/haima16/mc-jtext/issues" target='_blank'> 问题反馈</a> | 
            <a href="https://github.com/haima16/mc-jtext/blob/master/log.md" target='_blank'> 更新日志</a> - by hans
        </div>
    </div>
    , document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

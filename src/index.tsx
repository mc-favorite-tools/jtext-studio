import 'antd/dist/antd.css';
import './index.scss';
import './util/string';
import './util/date'
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import Tellraw from './view/Tellraw';
import { Typography } from 'antd';

ReactDOM.render(
    <div>
        <h1>
            JText Studio
            <span>匠心打造，追求极致</span>
            <Typography.Text style={{ fontSize: 14 }} type="warning">兼容v1.14+</Typography.Text>
            <div className='right'>
                <a href="https://hans000.gitee.io/obsolete-ooc/" target='_blank'>OOOC</a>
                <a href="https://gitee.com/hans000/JText-Studio" target='_blank'>使用文档</a>
                <a href="https://gitee.com/hans000/JText-Studio/issues" target='_blank'> 问题反馈</a>
                <a href="https://gitee.com/hans000/JText-Studio/blob/master/CHANGELOG.md" target='_blank'> 更新日志</a>
            </div>
        </h1>
        <div className="cont">
            <Tellraw />
        </div>
    </div>
    , document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

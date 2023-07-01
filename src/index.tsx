/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
import 'antd/dist/antd.css';
import './index.less';
import './util/string';
import './util/date'
import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import Tellraw from './view/Tellraw';
import { Typography } from 'antd';

ReactDOM.render(
    <div>
        <header style={{ textAlign: 'center', backgroundColor: 'red' }}>注意：软件已归档，可能存在严重bug，不再维护，请使用新的软件<a href="https://www.mcbbs.net/thread-1361537-1-1.html">JText Editor(点击访问)</a>，拥有更好的体验</header>
        <h1>
            JText Studio
            <span>匠心打造，追求极致</span>
            <Typography.Text style={{ fontSize: 14 }} type="warning">兼容v1.14+</Typography.Text>
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

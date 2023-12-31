/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
// import vitePluginImport from 'vite-plugin-babel-import'
import cdnImport from 'vite-plugin-cdn-import'

export default defineConfig({
    base: './',
    css: {
        preprocessorOptions: {
            less: { javascriptEnabled: true }
        }
    },
    plugins: [
        reactRefresh(),
        // cdnImport({
        //     modules: [
        //         {
        //             name: 'react',
        //             var: 'React',
        //             path: 'https://unpkg.com/react@17.0.2/umd/react.production.min.js',
        //         },
        //         {
        //             name: 'react-dom',
        //             var: 'ReactDOM',
        //             path: 'https://unpkg.com/react-dom@17.0.2/umd/react-dom.production.min.js',
        //         },
        //         {
        //             name: '@ant-design/icons',
        //             var: 'icons',
        //             path: 'https://unpkg.com/@ant-design/icons@4.7.0/dist/index.umd.js',
        //         },
        //         {
        //             name: 'antd',
        //             var: 'antd',
        //             path: 'https://unpkg.com/antd@4.21.0/dist/antd.min.js',
        //             css: 'https://unpkg.com/antd@4.21.0/dist/antd.min.css',
        //         },
        //     ]
        // }),
    ]
})

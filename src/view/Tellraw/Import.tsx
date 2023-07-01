/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
import React, { useState, useRef, useEffect } from "react";
import { Modal, Input } from "antd";

interface IProps {
    visible: boolean,
    onCancel?: () => void,
    onSubmit?: (value: string) => void,
}
export default function(props: IProps) {
    const [value, setValue] = useState('')
    const inputRef = useRef<Input>()
    const onChange = (e: any) => {
        e.persist();
        setValue(() => e.target.value)
    }
    const handleCancel = () => {
        if (props.onCancel) {
            props.onCancel()
        }
        setValue(() => '')
    }
    const handleSuibmit = () => {
        if (props.onSubmit) {
            props.onSubmit(value)
        }
        setValue(() => '')
    }
    useEffect(() => {
        inputRef.current && inputRef.current.focus()
    }, [props.visible])
    return (
        <Modal
            visible={props.visible}
            onCancel={handleCancel}
            onOk={handleSuibmit}
            okText='解析'
            cancelText='取消'
            title='导入数据' >
            <Input autoFocus ref={inputRef} value={value} spellCheck={false} placeholder='请输入' onChange={onChange} />
        </Modal>
    )
}
/*
 * The AGPL License (AGPL)
 * Copyright (c) 2023 hans000
 */
import { Tag, Input, Tooltip, Icon } from 'antd';
import React from 'react';

interface IProps {
    tags: string[];
    onClick?: (value: string) => void;
    onChange?: (tags: string[]) => void;
    onClose?: (tags: string[]) => void;
}
interface IState {
    inputVisible: boolean;
    inputValue: string;
}

export default class EditableTagGroup extends React.Component<IProps, IState> {
    private saveInputRef: any = React.createRef();

    constructor(props: IProps) {
        super(props)
        this.state = {
            inputVisible: false,
            inputValue: '',
        }
    }
    private handleClose = (removedTag: string) => {
        const tags = this.props.tags.filter(tag => tag !== removedTag);
        this.props.onClose(tags)
    }

    private showInput = () => {
        this.setState({ inputVisible: true }, () => this.saveInputRef.current.focus());
    }

    private handleInputChange = (e: any) => {
        this.setState({ inputValue: e.target.value });
    }

    private handleInputConfirm = () => {
        const { inputValue } = this.state;
        let { tags } = this.props;
        if (inputValue && tags.indexOf(inputValue) === -1) {
            tags = [...tags, inputValue];
        }
        this.setState({
            inputVisible: false,
            inputValue: '',
        })
        if (this.props.onChange) {
            this.props.onChange(tags)
        }
    }
    public render() {
        const { inputVisible, inputValue } = this.state;
        return (
            <div>
                {
                    this.props.tags.map((tag, index) => {
                        const isLongTag = tag.length > 8;
                        const tagElem = (
                            <Tag style={{ marginBottom: 8 }} onClick={this.props.onClick.bind(null, tag)} key={tag} closable={index > 3} onClose={() => this.handleClose(tag)}>
                                {isLongTag ? `${tag.slice(0, 8)}...` : tag}
                            </Tag>
                        );
                        return isLongTag ? (
                            <Tooltip title={tag} key={tag}>
                                {tagElem}
                            </Tooltip>
                        ) : tagElem
                    })
                }
                {
                    inputVisible && (
                        <Input ref={this.saveInputRef} type="text" size="small" style={{ width: 78 }} value={inputValue} onChange={this.handleInputChange} onBlur={this.handleInputConfirm} onPressEnter={this.handleInputConfirm} />
                    )
                }
                {
                    !inputVisible && (
                        <Tag onClick={this.showInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
                            <Icon type="plus" />标签
                        </Tag>
                    )
                }
            </div>
        );
    }
}
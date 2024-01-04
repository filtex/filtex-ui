import React, { useEffect, useState } from "react";

import './Input.css';

export interface InputProps {
    label: string;
    class: string;
    type: string;
    value: any;
    hidden?: boolean;
    onSuggestionRequested: (ev: any) => void;
    onChange: (ev: any) => void;
    onSubmit: () => void;
}

const Input = (props: InputProps) => {
    const [touched, setTouched] = useState(false);
    const [className, setClassName] = useState('');

    useEffect(() => {
        const classes = [
            'node'
        ];

        classes.push(props.class);

        if (touched) {
            classes.push('touched');
        }

        if (props.type?.length > 0) {
            classes.push(props.type);
        }

        setClassName(classes.join(' '));
    }, [props.class, props.type, touched]);

    const handleKeyDown = (e: any) => {
        const { key, ctrlKey } = e;

        switch (key) {
            case 'Enter':
                e.preventDefault();
                if (ctrlKey) {
                    if (props.onSubmit) {
                        props.onSubmit();
                    }
                }
                break;
        }
    };

    const handleClick = (e: any) => {
        setTimeout(() => {
            if (props.onSuggestionRequested) {
                props.onSuggestionRequested(e);
            }
        }, 100);
    };

    const handleFocus = (e: any) => {
        setTimeout(() => {
            if (props.onSuggestionRequested) {
                props.onSuggestionRequested(e);
            }
        }, 100);
    };

    const getWidth = () => {
        const width = props.value?.length * 12;
        return Math.max(100, Math.min(175, width)) + 'px';
    };

    return (
        props.hidden
            ? <></>
            : <input
                className={className}
                placeholder={props.label}
                autoComplete={'none'}
                spellCheck={false}
                value={props.value ?? ''}
                style={{ width: getWidth() }}
                onKeyDown={handleKeyDown}
                onClick={handleClick}
                onFocus={handleFocus}
                onBlur={() => setTouched(true)}
                onChange={props.onChange} />
    );
};

export default Input;

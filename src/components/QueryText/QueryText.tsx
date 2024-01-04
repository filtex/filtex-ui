import React, {useContext, useEffect, useMemo, useState} from "react";
import {Metadata, Token} from "../../models";
import Editor, {OnChangeOptions} from "../Editor/Editor";
import {TokenType} from "../../constants";
import {TextQueryTokenizer} from "../../tokenizers";
import {TextQueryValidator} from "../../validators";
import {DropdownContext} from "../../contexts";

import './QueryText.css';

export interface QueryTextProps {
    metadata: Metadata;
    value: string;
    onValueChange: (query: string) => void;
    onValueSubmit: () => void;
    className?: string;
    hidden?: boolean;
}

const QueryText = (props: QueryTextProps) => {
    const { setOptions } = useContext(DropdownContext);
    const inputRef = React.createRef<HTMLTextAreaElement>() as React.MutableRefObject<HTMLTextAreaElement>;
    const [input, setInput] = useState<any>(null);

    const [value, setValue] = useState('');
    const [selectedTokenIndex, setSelectedTokenIndex] = useState(-1);
    const [cursorIndex, setCursorIndex] = useState({ start: -1, end: -1 });
    const [valid, setValid] = useState(true);

    const textQueryTokenizer = useMemo(() => new TextQueryTokenizer(props.metadata), [props.metadata]);
    const textQueryValidator = useMemo(() => new TextQueryValidator(props.metadata, textQueryTokenizer), [props.metadata, textQueryTokenizer]);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    useEffect(() => {
        setInput(inputRef.current);
    }, [inputRef]);

    useEffect(() => {
        const tokens = textQueryTokenizer.tokenize(value);
        const tokenIndex = findSelectedTokenIndex(tokens, cursorIndex.start, cursorIndex.end);
        setSelectedTokenIndex(tokenIndex);
    }, [cursorIndex, textQueryTokenizer, value]);

    const handleChange = (options: OnChangeOptions) => {
        setCursorIndex({
            start: options.cursor.start,
            end: options.cursor.end
        });

        if (options.cursor.start === -1) {
            return;
        }

        const tokens = textQueryTokenizer.tokenize(options.value);
        const tokenizedQuery = tokens.map(x => x.value).join('');

        setValue(tokenizedQuery);
        if (props.onValueChange) {
            props.onValueChange(tokenizedQuery);
        }

        try {
            textQueryValidator.validate(tokenizedQuery);
            setValid(true);
        } catch {
            setValid(false);
        }
    };

    const handleSubmit = () => {
        setSelectedTokenIndex(-1);
        setOptions({ hidden: true });

        if (props.onValueSubmit) {
            props.onValueSubmit();
        }
    };

    const findSelectedTokenIndex = (tokens: Token[], start: number, end: number) => {
        if (start === -1 || end === -1) {
            return -1;
        }

        if (tokens.reduce((acc, cur) => acc + cur.value.length, 0) === start) {
            return tokens.length - 1;
        }

        let index = 0;
        let totalTokenLength = 0;

        for (const token of tokens) {
            if (totalTokenLength + token.value.length > start) {
                break;
            } else {
                index++;
                totalTokenLength += token.value.length;
            }
        }

        return index;
    };

    const selectionFn = (position: number) => {
        const tokens = textQueryTokenizer.tokenize(value);
        const tokenIndex = findSelectedTokenIndex(tokens, position, position);

        if (tokenIndex === -1) {
            return { start: 0, end: 0 };
        }

        const start = tokenIndex === 0 ? 0 : tokens.slice(0, tokenIndex).map(x => x.value).join('').length;
        const end = start + tokens[tokenIndex].value.length;

        return { start, end };
    };

    const coloringFn = (value: string) => {
        const tokens = textQueryTokenizer.tokenize(value);
        return tokens.map((token, index) => {
            const classes = [
                'token'
            ];

            classes.push(token.type.name);

            if (index === selectedTokenIndex) {
                classes.push('selected');
            }

            if (token.type === TokenType.TokenTypeSpace) {
                return `<span class="` + classes.join(' ') + `">&nbsp;</span>`;
            }

            return `<span class="` + classes.join(' ') + `">` + token.value.replace(/ /g, '&nbsp') + `</span>`;
        }).join('');
    };

    return (
        <div className={"query-text " + (valid ? 'valid' : 'invalid') + " " + props.className} hidden={props.hidden}>
            <Editor
                inputRef={inputRef}
                label="Type some query..."
                value={value}
                onChange={handleChange}
                onSubmit={handleSubmit}
                selectionFn={selectionFn}
                coloringFn={coloringFn} />
        </div>
    );
};

export default QueryText;

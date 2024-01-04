import React, {useContext, useEffect, useMemo, useState} from "react";
import {Metadata, Token} from "../../models";
import Editor, {OnChangeOptions} from "../Editor/Editor";
import {TokenType} from "../../constants";
import {TextQueryTokenizer} from "../../tokenizers";
import {TextQueryValidator} from "../../validators";
import {QuerySuggester} from "../../suggesters";
import {getCursorState} from "../../utils";
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
    const querySuggester = useMemo(() => new QuerySuggester(props.metadata), [props.metadata]);

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

        const tokenIndex = findSelectedTokenIndex(tokens, options.cursor.start, options.cursor.end);

        const result = querySuggester.suggest(tokens, tokenIndex);
        const selectedToken = tokenIndex !== null ? tokens[tokenIndex] : null;
        const search = selectedToken && selectedToken.value.length !== options.cursor.end - options.cursor.start ? result.selectedToken?.value : null;

        const prevTokens = tokenIndex !== null ? tokens.slice(0, tokenIndex) : tokens;
        const lastToken = prevTokens.filter(x => x.type !== TokenType.TokenTypeSpace).at(-1) ?? null;
        const lastFieldToken = prevTokens.filter(x => x.type === TokenType.TokenTypeField).at(-1) ?? null;
        const lastFieldType = textQueryTokenizer.getFieldType(lastFieldToken?.value);

        let type = 'options';
        if (lastToken?.type.isComparerTokenType()) {
            switch (lastFieldType?.name) {
                case 'date':
                    type = 'date';
                    break;
                case 'time':
                    type = 'time';
                    break;
                case 'datetime':
                    type = 'datetime';
                    break;
            }
        }

        let suggestions;

        if (search && search.trim().length > 0) {
            suggestions = result.suggestions.filter((s) => s.value.toLowerCase().replace(/ /g, '').includes(search.toLowerCase().replace(/ /g, '')));
        } else {
            suggestions = result.suggestions;
        }

        if (input) {
            const selectedStart = prevTokens.reduce((acc, cur) => acc + cur.value.length, 0);
            const state = getCursorState(input, selectedStart);
            const x = state.coordinates.x + input.parentElement.offsetLeft - input.offsetLeft;
            const y = state.coordinates.y + input.parentElement.offsetTop + input.clientHeight + 5;

            let fn = {
                fn: (v: any) => {
                    if (!v) {
                        return;
                    }

                    let tokens: Token[] = [];
                    if (v.onSelected) {
                        tokens = v.onSelected();
                    }
                    const newQuery = tokens.map(x => x.value).join('');

                    setValue(newQuery);

                    setTimeout(()=> {
                        const { selectionStart } = input;

                        handleChange({
                            value: newQuery,
                            cursor: {
                                start: input.selectionStart,
                                end: input.selectionEnd
                            }
                        });

                        setSelectedTokenIndex(-1);

                        input.selectionStart = selectionStart + v.value.length + 1;
                        input.selectionEnd = selectionStart + v.value.length + 1;
                        input.focus();
                    }, 100);
                }
            };

            if (type === 'date' || type === 'time' || type === 'datetime') {
                const willCurTokenRemove = selectedToken && (
                    selectedToken.type === TokenType.TokenTypeNone ||
                    selectedToken.type.isValueTokenType());
                fn = {
                    fn: (v: any) => {

                        const newTokens = [...prevTokens];

                        let sliceCount = 1;

                        if (willCurTokenRemove === false) {
                            newTokens.push(tokens[tokenIndex]);
                            sliceCount++;
                        }

                        let value = '';

                        if (type === 'date') {
                            value = `${v.year}-${(v.month + 1).toString().padStart(2, '0')}-${v.day.toString().padStart(2, '0')}`;
                            newTokens.push(new Token(TokenType.TokenTypeDateValue, value));
                        } else if (type === 'time') {
                            value = `${v.hour.toString().padStart(2, '0')}:${v.minute.toString().padStart(2, '0')}:${v.second.toString().padStart(2, '0')}`;
                            newTokens.push(new Token(TokenType.TokenTypeTimeValue, value));
                        } else if (type === 'datetime') {
                            value = `${v.year}-${(v.month + 1).toString().padStart(2, '0')}-${v.day.toString().padStart(2, '0')} ${v.hour.toString().padStart(2, '0')}:${v.minute.toString().padStart(2, '0')}:${v.second.toString().padStart(2, '0')}`;
                            newTokens.push(new Token(TokenType.TokenTypeDateTimeValue, value));
                        }

                        const nextTokens = tokens
                            .slice(tokenIndex + sliceCount, tokens.length);

                        if (nextTokens.length === 0) {
                            newTokens.push(new Token(TokenType.TokenTypeSpace, ' '));
                        }

                        nextTokens
                            .forEach(token => newTokens.push(token));

                        const newQuery = newTokens.map(x => x.value).join('');

                        setValue(newQuery);

                        setTimeout(()=> {
                            const { selectionStart } = input;

                            handleChange({
                                value: newQuery,
                                cursor: {
                                    start: input.selectionStart,
                                    end: input.selectionEnd
                                }
                            });

                            setSelectedTokenIndex(-1);

                            input.selectionStart = selectionStart + value.length + 1;
                            input.selectionEnd = selectionStart + value.length + 1;
                            input.focus();
                        }, 100);
                    }
                };
            }

            setOptions({
                type: type,
                hidden: false,
                isAnimated: true,
                value: selectedToken?.value,
                values: suggestions.map(x => ({ label: x.value, value: x })),
                x: x,
                y: y,
                fn: fn,
                elementRef: input,
                adjustPosition: true
            });
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

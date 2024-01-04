import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import { TokenType } from "../../constants";
import {Metadata, Token} from "../../models";
import {QuerySuggester} from "../../suggesters";
import { JsonQueryTokenizer } from "../../tokenizers";
import Input from "../Input/Input";
import { DropdownContext } from "../../contexts";

import './QueryTree.css';

export interface QueryTreeProps {
    metadata: Metadata;
    value: any;
    onValueChange: (value: any) => void;
    onValueSubmit: () => void;
    className?: string;
    hidden?: boolean;
}

const QueryTree = (props: QueryTreeProps) => {
    const { setOptions } = useContext(DropdownContext);
    const [tree, setTree] = useState<any>(['', ['', '', '']]);
    const [tokensTree, setTokensTree] = useState<any>([new Token(TokenType.TokenTypeNone, ''), [[new Token(TokenType.TokenTypeNone, ''), new Token(TokenType.TokenTypeNone, ''), new Token(TokenType.TokenTypeNone, '')]]]);

    const jsonQueryTokenizer =  useMemo(() => new JsonQueryTokenizer(props.metadata), [props.metadata]);
    const querySuggester = useMemo(() => new QuerySuggester(props.metadata), [props.metadata]);

    const updateTokensTree = useCallback((tree: any[]) => {
        if (!tree || tree.length === 0) {
            tree = ['', '', ''];
        }
        if (!Array.isArray(tree[1])) {
            tree = ['', [tree]]
        }
        const tokens = jsonQueryTokenizer.tokenize(JSON.stringify(tree));
        setTree(tree);
        setTokensTree(tokens);
    }, [jsonQueryTokenizer]);

    useEffect(() => {
        updateTokensTree(props.value);
    }, [props.value, updateTokensTree]);

    const addRow = (type: string, path: string) => {
        let item: any = ['', '', ''];

        if (type === 'group') {
            item = ['', [item]];
        }

        const copy = [...tree];

        let data = copy;
        let last: number = -1;

        const items = path.split('/');

        items.forEach((v: string, i: number) => {
            if (v.length === 0) {
                return;
            }
            const index = parseInt(v);
            if (items.length - 1 === i) {
                last = index;
                return;
            }
            data = data[index];
        });

        if (path.length === 0) {
            data = item;
        } else if (last !== null && last !== -1) {
            data.splice(last + 1, 0, item);
        } else {
            data.push(item);
        }

        updateTokensTree(copy);

        if (props.onValueChange) {
            props.onValueChange([...copy]);
        }

        setOptions({ hidden: true });
    };

    const deleteRow = (path: string) => {
        const copy = [...tree];

        let data = copy;
        let last: number = -1;

        const items = path.split('/');

        items.forEach((v: string, i: number) => {
            if (v.length === 0) {
                return;
            }
            const index = parseInt(v);
            if (items.length - 1 === i) {
                last = index;
                return;
            }
            data = data[index];
        });

        if (path.length === 0) {
            data = [];
        } else if (last !== null) {
            data.splice(last, 1);
        } else {
            data = [];
        }

        updateTokensTree(copy);

        if (props.onValueChange) {
            props.onValueChange([...copy]);
        }

        setOptions({ hidden: true });
    };

    const handleChange = (path: string, value: string) => {
        const copy = [...tree];

        let data = copy;
        let last: number = -1;

        const items = path.split('/');

        items.forEach((v: string, i: number) => {
            if (v.length === 0) {
                return;
            }
            const index = parseInt(v);
            if (items.length - 1 === i) {
                last = index;
                return;
            }
            data = data[index];
        });

        if (!data[last]) {
            data[last] = '';
        }

        data[last] = value;

        updateTokensTree(copy);

        if (props.onValueChange) {
            props.onValueChange([...copy]);
        }
    };

    const handleSubmit = () => {
        setOptions({ hidden: true });

        if (props.onValueSubmit) {
            props.onValueSubmit();
        }
    };

    const addValue = (path: string) => {
        const copy = [...tree];

        let data = copy;
        let last: number = -1;

        const items = path.split('/');

        items.forEach((v: string, i: number) => {
            if (v.length === 0) {
                return;
            }
            const index = parseInt(v);
            if (items.length - 1 === i) {
                last = index;
                return;
            }
            data = data[index];
        });

        if (Array.isArray(data[last])) {
            data[last] = [...data[last], ''];
        } else {
            data[last] = [data[last], ''];
        }

        updateTokensTree(copy);

        if (props.onValueChange) {
            props.onValueChange([...copy]);
        }

        setOptions({ hidden: true });
    };

    const openDropdown = (ev: any, type: string, values: any[]) => {
        const el = ev.target;
        const x = el.offsetLeft;
        const y = el.offsetTop + el.clientHeight * 1.5;
        const fn = {
            fn: (v: any) => {
                let value;

                if (type === 'date') {
                    value = `${v.year}-${(v.month + 1).toString().padStart(2, '0')}-${v.day.toString().padStart(2, '0')}`;
                } else if (type === 'time') {
                    value = `${v.hour.toString().padStart(2, '0')}:${v.minute.toString().padStart(2, '0')}:${v.second.toString().padStart(2, '0')}`;
                } else if (type === 'datetime') {
                    value = `${v.year}-${(v.month + 1).toString().padStart(2, '0')}-${v.day.toString().padStart(2, '0')} ${v.hour.toString().padStart(2, '0')}:${v.minute.toString().padStart(2, '0')}:${v.second.toString().padStart(2, '0')}`;
                } else {
                    value = v.value;
                }

                const prototype = Object.getPrototypeOf(el);
                const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
                if (prototypeValueSetter) {
                    prototypeValueSetter.call(el, value);
                }
                el.dispatchEvent(new Event('input', {bubbles: true}));
                el.style.width = Math.max(85, Math.min(125, value.length * 10)) + 'px';
                setTimeout(() => {
                    setOptions({ hidden: true });
                }, 100);
            }
        };

        setOptions({ type, hidden: false, values: values, x: x, y: y, fn: fn, elementRef: el });
    };

    const openGroupMenu = (ev: any, path: string) => {
        const values = [
            {
                label: 'Add Group',
                value: 'add-group'
            },
            {
                label: 'Add Rule',
                value: 'add-rule'
            }
        ];

        if (path !== '') {
            values.push({
                label: 'Delete Group',
                value: 'delete-group'
            });
        }

        const x = ev.target.offsetLeft;
        const y = ev.target.offsetTop + ev.target.clientHeight * 0.3;
        const fn = {
            fn: (v: string) => {
                switch (v) {
                    case 'add-group':
                        addRow('group', path + '/1/-1');
                        break;
                    case 'add-rule':
                        addRow('item', path + '/1/-1');
                        break;
                    case 'delete-group':
                        deleteRow(path);
                        break;
                }
            }
        };

        setOptions({ type: 'options', hidden: false, values: values, x: x, y: y, fn: fn, elementRef: ev.target });
    };

    const openRuleMenu = (ev: any, path: string, data: any[]) => {
        const values = [
            {
                label: 'Add Group',
                value: 'add-group'
            },
            {
                label: 'Add Rule',
                value: 'add-rule'
            },
        ];

        if (isMultiAllowed(data) && isValueAllowed(data)) {
            values.push({
                label: 'Add Value',
                value: 'add-value'
            });
        }

        values.push({
            label: 'Delete Rule',
            value: 'delete-rule'
        });

        const x = ev.target.offsetLeft;
        const y = ev.target.offsetTop + ev.target.clientHeight * 0.3;
        const fn = {
            fn: (v: string) => {
                switch (v) {
                    case 'add-group':
                        addRow('group', path);
                        break;
                    case 'add-rule':
                        addRow('item', path);
                        break;
                    case 'add-value':
                        addValue(path + '/2');
                        break;
                    case 'delete-rule':
                        deleteRow(path);
                        break;
                }
            }
        };

        setOptions({ type: 'options', hidden: false, values: values, x: x, y: y, fn: fn, elementRef: ev.target });
    };

    const suggestLogic = (ev: any) => {
        const tokens = [
            new Token(TokenType.TokenTypeField, ' '),
            new Token(TokenType.TokenTypeSpace, ' '),
            new Token(TokenType.TokenTypeEqual, ' '),
            new Token(TokenType.TokenTypeSpace, ' '),
            new Token(TokenType.TokenTypeValue, ' '),
            new Token(TokenType.TokenTypeSpace, ' ')
        ];
        const result = querySuggester.suggest(tokens);
        let values = result.suggestions;

        if (ev.target.value.length !== ev.target.selectionEnd - ev.target.selectionStart) {
            values = values.filter((s) => s.value.toLowerCase().replace(/ /g,'').includes(ev.target.value.toLowerCase().replace(/ /g,'')));
        }

        openDropdown(ev, 'options', values.map(item => {
            return {
                label: item.value,
                value: {
                    value: item.value
                }
            };
        }));
    };

    const suggestField = (ev: any) => {
        const tokens: Token[] = [];
        const result = querySuggester.suggest(tokens);
        let values = result.suggestions;

        if (ev.target.value.length !== ev.target.selectionEnd - ev.target.selectionStart) {
            values = values.filter((s) => s.value.toLowerCase().replace(/ /g,'').includes(ev.target.value.toLowerCase().replace(/ /g,'')));
        }

        openDropdown(ev, 'options', values.map(item => {
            return {
                label: item.value,
                value: {
                    value: item.value
                }
            };
        }));
    };

    const suggestOperator = (ev: any, data: any[]) => {
        const tokens = [
            new Token(TokenType.TokenTypeField, data[0].value),
            new Token(TokenType.TokenTypeSpace, ' ')
        ];
        const result = querySuggester.suggest(tokens);
        let values = result.suggestions;

        if (ev.target.value.length !== ev.target.selectionEnd - ev.target.selectionStart) {
            values = values.filter((s) => s.value.toLowerCase().replace(/ /g,'').includes(ev.target.value.toLowerCase().replace(/ /g,'')));
        }

        openDropdown(ev, 'options', values.map(item => {
            return {
                label: item.value,
                value: {
                    value: item.value
                }
            };
        }));
    };

    const suggestValue = (ev: any, data: any[]) => {
        const tokens = [
            new Token(TokenType.TokenTypeField, data[0].value),
            new Token(TokenType.TokenTypeSpace, ' '),
            new Token(TokenType.TokenTypeEqual, data[1].value),
            new Token(TokenType.TokenTypeSpace, ' ')
        ];
        const result = querySuggester.suggest(tokens);
        let values = result.suggestions;

        if (ev.target.value.length !== ev.target.selectionEnd - ev.target.selectionStart) {
            values = values.filter((s) => s.value.toLowerCase().replace(/ /g,'').includes(ev.target.value.toLowerCase().replace(/ /g,'')));
        }

        if (!isValueAllowed(data)) {
            return;
        }

        const selectedProperties = props.metadata.fields
            .filter(prop => prop.label.toLowerCase() === data[0]?.value?.toLowerCase());
        if (selectedProperties.length === 0) {
            return;
        }
        const metaField = selectedProperties[0];

        let type = 'options';
        switch (metaField?.type) {
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

        openDropdown(ev, type, values.map(item => {
            return {
                label: item.value,
                value: {
                    value: item.value
                }
            };
        }));
    };

    const isValueAllowed = (data: any) => {
        const lastOperatorToken = data[1] as Token;
        if (!lastOperatorToken || lastOperatorToken.type === TokenType.TokenTypeNone) {
            return true;
        }
        return lastOperatorToken.type.isComparerTokenType();
    };

    const isMultiAllowed = (data: any) => {
        const lastOperatorToken = data[1] as Token;
        if (!lastOperatorToken) {
            return false;
        }
        return lastOperatorToken.type.isMultiAllowedTokenType();
    };

    const renderRule = (data: any[], path: string) => {
        if (Array.isArray(data[1])) {
            return (
                <>
                    <div className="row">
                        <Input
                            key={path + '/0'}
                            label="Logic"
                            class="logic"
                            type={data[0]?.type.name}
                            value={data[0]?.value}
                            onSuggestionRequested={(ev) => suggestLogic(ev)}
                            onChange={(ev) => {
                                handleChange(path + '/0', ev.target.value);
                                suggestLogic(ev);
                            }}
                            onSubmit={handleSubmit}
                        />
                        <button
                            className="menu"
                            onClick={(ev) => openGroupMenu(ev, path)}>...
                        </button>
                    </div>
                    <div className="indent">
                        {
                            data[1].map((item, index) => (
                                <div key={index}>
                                    {renderRule(item, path + '/1/' + index)}
                                </div>
                            ))
                        }
                    </div>
                </>
            );
        }

        return (
            <div className="row">
                <Input
                    key={path + '/0'}
                    label="Field"
                    class="field"
                    type={data[0]?.type.name}
                    value={data[0]?.value}
                    onSuggestionRequested={(ev) => suggestField(ev)}
                    onChange={(ev) => {
                        handleChange(path + '/0', ev.target.value);
                        suggestField(ev);
                    }}
                    onSubmit={handleSubmit}
                />
                <Input
                    key={path + '/1'}
                    label="Operator"
                    class="operator"
                    type={data[1]?.type.name}
                    value={data[1]?.value}
                    onSuggestionRequested={(ev) => suggestOperator(ev, data)}
                    onChange={(ev) => {
                        handleChange(path + '/1', ev.target.value);
                        suggestOperator(ev, data);
                    }}
                    onSubmit={handleSubmit}
                />
                {
                    Array.isArray(data[2])
                        ?
                        data[2].map((v: any, i: number) =>
                            <Input
                                key={path + '/2/' + i}
                                label="Value"
                                class="value"
                                type={v.type.name}
                                value={v.value}
                                hidden={!isValueAllowed(data)}
                                onSuggestionRequested={(ev) => suggestValue(ev, data)}
                                onChange={(ev) => {
                                    handleChange(path + '/2/' + i, ev.target.value);
                                    suggestValue(ev, data);
                                }}
                                onSubmit={handleSubmit}
                            />
                        )
                        :
                        <Input
                            key={path + '/2'}
                            label="Value"
                            class="value"
                            type={data[2]?.type.name}
                            value={data[2]?.value}
                            hidden={!isValueAllowed(data)}
                            onSuggestionRequested={(ev) => suggestValue(ev, data)}
                            onChange={(ev) => {
                                handleChange(path + '/2', ev.target.value);
                                suggestValue(ev, data);
                            }}
                            onSubmit={handleSubmit}
                        />
                }
                <button
                    className="menu"
                    onClick={(ev) => openRuleMenu(ev, path, data)}>...
                </button>
            </div>
        );
    };

    return (
        <div className={"query-tree " + props.className} hidden={props.hidden}>
            {renderRule(tokensTree, '')}
        </div>
    );
};

export default QueryTree;

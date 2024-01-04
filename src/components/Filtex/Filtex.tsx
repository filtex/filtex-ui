import React, {createRef, useCallback, useEffect, useMemo, useState} from "react";
import {Metadata} from "../../models";
import {JsonQueryConverter, TextQueryConverter} from "../../converters";
import QueryText from "../QueryText/QueryText";
import QueryTree from "../QueryTree/QueryTree";
import Dropdown from "../Dropdown/Dropdown";
import {DropdownContext, ThemeContext} from "../../contexts";
import {DefaultTheme, FiltexTheme, Themes} from "../../themes";
import {isArray, toRGB} from "../../utils";

import './Filtex.css';

export interface FiltexProps {
    metadata: Metadata;
    themes?: FiltexTheme[];
    theme?: string;
    modes?: string[];
    mode?: string;
    value?: any;
    onSubmit?: (value: any) => void;
}

const Filtex = (props: FiltexProps) => {
    const [text, setText] = useState<string>('');
    const [tree, setTree] = useState<any>(null);
    const [theme, setTheme] = useState<FiltexTheme>(DefaultTheme);
    const [modes] = useState(props.modes || ['text', 'tree']);
    const [mode, setMode] = useState(props.mode || modes[0]);
    const [value, setValue] = useState(props.value || '');
    const filtexRef = createRef<HTMLDivElement>();
    const [options, setOptions] = useState<any>({ hidden: true });

    const textQueryConverter = useMemo(() => new TextQueryConverter(props.metadata), [props.metadata]);
    const jsonQueryConverter = useMemo(() => new JsonQueryConverter(props.metadata), [props.metadata]);

    const handleTextChange = (text: string) => {
        const tree = textQueryConverter.convert(text);

        setText(text);
        setTree(tree);
    };

    const handleTextSubmit = () => {
        if (!props.onSubmit) {
            return;
        }

        if (tree === null || text === '') {
            props.onSubmit({
                tree: null,
                text: ''
            });
        } else {
            props.onSubmit({
                tree,
                text
            });
        }
    };

    const handleTreeChange = (tree: any) => {
        const text = jsonQueryConverter.convert(tree);

        setText(text);
        setTree(tree);
    };

    const handleTreeSubmit = () => {
        if (!props.onSubmit) {
            return;
        }

        if (tree === null || text === '') {
            props.onSubmit({
                tree: null,
                text: ''
            });
        } else {
            props.onSubmit({
                tree,
                text
            });
        }
    };

    const handleSwitchText = () => {
        setMode('text');
    };

    const handleSwitchTree = () => {
        setMode('tree');
    };

    const handleSubmit = () => {
        if (props.onSubmit) {
            props.onSubmit({
                tree,
                text
            });
        }
    };

    const handleReset = () => {
        setTree(null);
        setText('');
    };

    useEffect(() => {
        const themes = [...Themes, ...(props.themes || [])];
        const theme = themes.find(t => t.name === props.theme) ?? DefaultTheme;

        setTheme(theme);

        const root = filtexRef.current;
        if (!root) {
            return;
        }

        root.style.setProperty('--background-color', toRGB(theme.style.backgroundColor));
        root.style.setProperty('--hover-background-color', toRGB(theme.style.hoverBackgroundColor));
        root.style.setProperty('--active-background-color', toRGB(theme.style.activeBackgroundColor));
        root.style.setProperty('--text-color', toRGB(theme.style.textColor));
        root.style.setProperty('--selection-color', toRGB(theme.style.selectionColor));
        root.style.setProperty('--logic-text-color', toRGB(theme.style.logicTextColor));
        root.style.setProperty('--field-text-color', toRGB(theme.style.fieldTextColor));
        root.style.setProperty('--operator-text-color', toRGB(theme.style.operatorTextColor));
        root.style.setProperty('--value-text-color', toRGB(theme.style.valueTextColor));
        root.style.setProperty('--separator-text-color', toRGB(theme.style.separatorTextColor));
        root.style.setProperty('--bracket-text-color', toRGB(theme.style.bracketTextColor));
        root.style.setProperty('--invalid-border-color', toRGB(theme.style.invalidBorderColor));
        root.style.setProperty('--box-shadow', theme.style.boxShadow);
        root.style.setProperty('--border', theme.style.border);
        root.style.setProperty('--border-radius', theme.style.borderRadius);
    }, [props.themes, props.theme, filtexRef])

    useEffect(() => {
        setValue(props.value || '');
    }, [props.value]);

    useEffect(() => {
        if (!value) {
            handleReset();
        }

        if (typeof value === 'string') {
            const tree = textQueryConverter.convert(value ?? '');

            setText(value);
            setTree(tree);
        } else if (isArray(value)) {
            const text = jsonQueryConverter.convert(value ?? []);

            setText(text);
            setTree(value);
        } else {
            handleReset();
        }
    }, [jsonQueryConverter, textQueryConverter, value]);

    return (
        <ThemeContext.Provider value={theme}>
            <DropdownContext.Provider value={{options, setOptions}}>
                <div className="filtex" ref={filtexRef}>
                    {
                        modes.includes('text')
                            ? <QueryText
                                className="text-container"
                                metadata={props.metadata}
                                value={text}
                                onValueChange={handleTextChange}
                                onValueSubmit={handleTextSubmit}
                                hidden={mode !== 'text'} />
                            : <></>
                    }
                    {
                        modes.includes('tree')
                            ? <QueryTree
                                className="tree-container"
                                metadata={props.metadata}
                                value={tree}
                                onValueChange={handleTreeChange}
                                onValueSubmit={handleTreeSubmit}
                                hidden={mode !== 'tree'} />
                            : <></>
                    }
                    <Dropdown options={options} />
                </div>
            </DropdownContext.Provider>
        </ThemeContext.Provider>
    )
};

export default Filtex;

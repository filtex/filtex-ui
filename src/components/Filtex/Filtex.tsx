import React, {createRef, useEffect, useState} from "react";
import {ThemeContext} from "../../contexts";
import {DefaultTheme, FiltexTheme, Themes} from "../../themes";
import {toRGB} from "../../utils";

import './Filtex.css';

export interface FiltexProps {
    themes?: FiltexTheme[];
    theme?: string;
}

const Filtex = (props: FiltexProps) => {
    const [theme, setTheme] = useState<FiltexTheme>(DefaultTheme);
    const filtexRef = createRef<HTMLDivElement>();

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

    return (
        <ThemeContext.Provider value={theme}>
            <div className="filtex" ref={filtexRef}>
                Filtex
            </div>
        </ThemeContext.Provider>
    )
};

export default Filtex;

export interface FiltexTheme {
    name: string;
    style: FiltexThemeStyle;
}

interface FiltexThemeStyle {
    backgroundColor: string;
    hoverBackgroundColor: string;
    activeBackgroundColor: string;
    textColor: string;
    selectionColor: string;
    logicTextColor: string;
    fieldTextColor: string;
    operatorTextColor: string;
    valueTextColor: string;
    separatorTextColor: string;
    bracketTextColor: string;
    invalidBorderColor: string;
    boxShadow: string;
    border: string;
    borderRadius: string;
}

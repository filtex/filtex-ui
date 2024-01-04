import { LightTheme } from "./light";
import { DarkTheme } from "./dark";

export * from './core';
export * from './dark';
export * from './light';

export const Themes = [
    LightTheme,
    DarkTheme,
];

export const DefaultTheme = DarkTheme;

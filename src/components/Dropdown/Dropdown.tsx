import React, { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "../DatePicker/DatePicker";
import TimePicker from "../TimePicker/TimePicker";
import DateTimePicker from "../DateTimePicker/DateTimePicker";

import './Dropdown.css';

export interface DropdownProps {
    options?: any;
}

const Dropdown = (props: DropdownProps) => {
    const containerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;

    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
    const [isAnimated, setIsAnimated] = useState(false);
    const [option, setOption] = useState(-1);
    const [values, setValues] = useState<any[]>([]);
    const [hidden, setHidden] = useState(true);
    const [elementRef, setElementRef] = useState();
    const [onValueChange, setOnValueChange] = useState<any>(null);

    const scrollTo = useCallback((index: number) => {
        if (hidden || values.length === 0) {
            return;
        }

        const parentElement = containerRef.current;
        if (!parentElement) {
            return;
        }

        const childElement = parentElement.getElementsByTagName('span')[index];
        if (!childElement) {
            return;
        }

        const size = parentElement.clientHeight / childElement.clientHeight;
        const page = Math.floor(index / size);
        const start = page === 0 ? 0 : page * size;

        parentElement.scrollTo({
            top: start * childElement.clientHeight,
            behavior: 'smooth'
        });
    }, [hidden, values.length]);

    const handleValueChange = useCallback((value: any) => {
        if (onValueChange && onValueChange.fn) {
            onValueChange.fn(value);
        }
    }, [onValueChange]);

    const handleKeyDown = useCallback((e: any) => {
        if (!props.options) {
            return;
        }

        const { type } = props.options;

        if (values.length === 0 && type === 'options') {
            return;
        }

        const { key, keyCode, ctrlKey } = e;
        switch (key) {
            case "Escape":
                e.preventDefault();
                setHidden(true);
                break;
            case "Enter":
            case "Tab":
                if (!hidden && !ctrlKey) {
                    e.preventDefault();
                    if (option !== -1) {
                        handleValueChange(values[option].value);
                    }
                    setOption(0);
                    if (type !== 'options' || values.length > 0) {
                        setHidden(false);
                    }
                }
                break;
            case "ArrowUp":
                e.preventDefault();
                if (option === -1 || option === 0) {
                    setOption(values.length - 1);
                    scrollTo(values.length - 1);
                } else {
                    setOption(option - 1);
                    scrollTo(option - 1);
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                if (option !== values.length - 1) {
                    setOption(option + 1);
                    scrollTo(option + 1);
                } else {
                    setOption(0);
                    scrollTo(0);
                }
                break;
            default:
                const isAlphanumeric =
                    (keyCode >= 48 && keyCode <= 57) ||
                    (keyCode >= 65 && keyCode <= 90) ||
                    (keyCode >= 97 && keyCode <= 122);
                if (elementRef && document.activeElement === elementRef && isAlphanumeric) {
                    if (type !== 'options' || values.length > 0) {
                        setOption(0);
                        scrollTo(0);
                        setHidden(false);
                    }
                }
                break;
        }
    }, [elementRef, handleValueChange, hidden, option, props.options, scrollTo, values]);

    const handleWheel = (ev: any) => {
        containerRef.current.scrollTo({
            top: containerRef.current.scrollTop + ev.deltaY,
            behavior: 'auto'
        });
    }

    const handleClick = useCallback((ev: any) => {
        if (!props.options) {
            return;
        }

        const { type, hidden, values, elementRef } = props.options;

        const isOutside = !containerRef.current?.contains(ev.target);

        if (!isOutside && (type !== 'options' || values.length > 0)) {
            setHidden(false);
        } else if (elementRef && ev.target === elementRef && (type !== 'options' || values.length > 0)) {
            setHidden(false);
        } else if (ev.target.className === 'filtex' && hidden === false && (type !== 'options' || values.length > 0)) {
            setHidden(false);
        } else {
            setHidden(true);
        }

        setOption(-1);
        scrollTo(0);
    }, [props.options, scrollTo]);

    const handleResize = () => {
        setHidden(true);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    useEffect(() => {
        if (!props.options) {
            setHidden(true);
            return;
        }

        const { type } = props.options;

        if (type === 'options' && values.length === 0) {
            setHidden(true);
            return;
        }

        setHidden(false);
    }, [props.options, values]);
    useEffect(() => {
        if (hidden) {
            window.onscroll = () => {};
        } else {
            const x = window.scrollX;
            const y = window.scrollY;

            window.onscroll = () => {
                window.scrollTo(x, y);
            };
        }

        window.addEventListener("click", handleClick);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("click", handleClick);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [elementRef, onValueChange, hidden, coordinates, values, option, handleClick, handleKeyDown]);

    useEffect(() => {
        if (props.options) {
            const { hidden, values, x, y, fn, elementRef } = props.options;
            if (hidden === false) {
                setIsAnimated(props.options.isAnimated || false);
                setValues(values);

                if (x !== null && y !== null) {
                    if (props.options.adjustPosition && x >= elementRef.parentElement.clientWidth && x + containerRef.current.clientWidth - elementRef.parentElement.offsetLeft >= elementRef.scrollWidth) {
                        setCoordinates({ x: elementRef.parentElement.offsetLeft + elementRef.parentElement.clientWidth - containerRef.current.clientWidth, y });
                    } else {
                        setCoordinates({ x, y });
                    }
                }

                setOnValueChange(fn);
                setElementRef(elementRef);

                if (!elementRef) {
                    return;
                }

                const el: any = elementRef;

                el.addEventListener('focus', handleClick);
                el.addEventListener('blur', handleClick);
                el.addEventListener('click', handleClick);
                return () => {
                    el.removeEventListener("focus", handleClick);
                    el.removeEventListener("blur", handleClick);
                    el.removeEventListener("click", handleClick);
                };
            } else {
                setHidden(true);
            }
        }
    }, [handleClick, props.options]);

    const style = {
        transform: `translate(${coordinates.x}px, ${coordinates.y}px)`
    };

    if (isAnimated) {
        Object.assign(style, {
            transition: '.4s ease-in-out',
            WebkitTransition: '.4s ease-in-out',
            MozTransition: '.4s ease-in-out'
        });
    }

    return (
        <div ref={containerRef} className={props.options?.type === 'options' ? 'dropdown scrollable' : 'dropdown'} style={style} hidden={hidden} onWheel={handleWheel}>
            {
                props.options?.type === 'options' && values.map((x: any, i: number) => (
                    <span key={i} className={option === i ? 'item active' : 'item'}
                          onClick={() => handleValueChange(x.value)}>{x.label}</span>
                ))
            }

            {
                props.options?.type !== 'date' ? <></> :
                    <DatePicker
                        value={props.options?.value}
                        onValueChange={handleValueChange} />
            }

            {
                props.options?.type !== 'time' ? <></> :
                    <TimePicker
                        value={props.options?.value}
                        onValueChange={handleValueChange} />
            }

            {
                props.options?.type !== 'datetime' ? <></> :
                    <DateTimePicker
                        value={props.options?.value}
                        onValueChange={handleValueChange} />
            }
        </div>
    );
};

export default Dropdown;

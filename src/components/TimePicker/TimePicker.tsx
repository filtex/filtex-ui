import React, {useCallback, useEffect, useRef, useState} from "react";

import './TimePicker.css';

export interface TimePickerProps {
    hidden?: boolean;
    value?: any;
    onValueChange?: (value: any) => void;
    hideActions?: boolean;
}

const TimePicker = (props: TimePickerProps) => {
    const containerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
    const namesContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
    const hoursContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
    const minutesContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
    const secondsContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;

    const [value, setValue] = useState({
        hour: props.value?.hour ?? new Date().getHours(),
        minute: props.value?.minute ?? new Date().getMinutes(),
        second: props.value?.second ?? new Date().getSeconds()
    });

    useEffect(() => {
        if (!props.value) {
            return;
        }

        const regex = /^\d\d:\d\d(:\d\d)?/;
        if (typeof props.value === 'string' && regex.test(props.value?.toString())) {
            const [hour, minute, second] = props.value
                .toString()
                .split(':')
                .map(x => parseInt(x));
            setValue({
                hour,
                minute,
                second
            });
        } else if (typeof props.value === 'object' && !!props.value.hour && !!props.value.minute && !!props.value.second) {
            const { hour, minute, second } = props.value;
            setValue({
                hour,
                minute,
                second
            });
        } else {
            const now = new Date();
            setValue({
                hour: now.getHours(),
                minute: now.getMinutes(),
                second: now.getSeconds()
            });
        }
    }, [props.value]);

    const scrollHours = useCallback(() => {
        const hoursChildElement = hoursContainerRef.current.getElementsByTagName('button')[0];
        if (!hoursChildElement) {
            return;
        }

        hoursContainerRef.current.scrollTo({
            top: (value.hour - 3) * (hoursContainerRef.current.scrollHeight / 24),
            behavior: 'smooth'
        });
    }, [value]);

    const scrollMinutes = useCallback(() => {
        const minutesChildElement = minutesContainerRef.current.getElementsByTagName('button')[0];
        if (!minutesChildElement) {
            return;
        }

        minutesContainerRef.current.scrollTo({
            top: (value.minute - 3) * (minutesContainerRef.current.scrollHeight / 60),
            behavior: 'smooth'
        });
    }, [value]);

    const scrollSeconds = useCallback(() => {
        const secondsChildElement = secondsContainerRef.current.getElementsByTagName('button')[0];
        if (!secondsChildElement) {
            return;
        }

        secondsContainerRef.current.scrollTo({
            top: (value.second - 3) * (secondsContainerRef.current.scrollHeight / 60),
            behavior: 'smooth'
        });
    }, [value]);

    useEffect(() => {
        scrollHours();
        scrollMinutes();
        scrollSeconds();
    }, [scrollHours, scrollMinutes, scrollSeconds]);

    useEffect(() => {
        setTimeout(() => {
            const maxHeight = containerRef.current.clientHeight - 2 * namesContainerRef.current.offsetHeight;
            hoursContainerRef.current.style.maxHeight = maxHeight + 'px';
            minutesContainerRef.current.style.maxHeight = maxHeight + 'px';
            secondsContainerRef.current.style.maxHeight = maxHeight + 'px';
        }, 100)
    }, []);

    const handleHourValueChange = (hour: number) => {
        setValue({ ...value, hour });
        if (props.hideActions === true) {
            if (props.onValueChange) {
                props.onValueChange({ ...value, hour });
            }
        }
    };

    const handleMinuteValueChange = (minute: number) => {
        setValue({ ...value, minute });
        if (props.hideActions === true) {
            if (props.onValueChange) {
                props.onValueChange({ ...value, minute });
            }
        }
    };

    const handleSecondValueChange = (second: number) => {
        setValue({ ...value, second });
        if (props.hideActions === true) {
            if (props.onValueChange) {
                props.onValueChange({ ...value, second });
            }
        }
    };

    const handleValueReset = () => {
        setValue({
            hour: new Date().getHours(),
            minute: new Date().getMinutes(),
            second: new Date().getSeconds()
        });
    };

    const handleValueChange = () => {
        if (props.onValueChange) {
            props.onValueChange(value);
        }
    };

    const hours = [];
    const minutes = [];
    const seconds = [];

    for (let i = 0; i < 24; i++) {
        hours.push(i);
    }

    for (let i = 0; i < 60; i++) {
        minutes.push(i);
        seconds.push(i);
    }

    return (
        <div ref={containerRef} className="timepicker" style={{}} hidden={props.hidden}>
            <div ref={namesContainerRef} className="timepicker-names">
                <div>HOUR</div>
                <div>MIN</div>
                <div>SEC</div>
            </div>
            <div className="timepicker-content">
                <div ref={hoursContainerRef} className="hours">
                    {
                        hours.map(h =>
                            <button
                                key={'hour-' + h}
                                className={value.hour === h ? 'selected' : ''}
                                onClick={() => handleHourValueChange(h)}>
                                {h.toString().padStart(2, '0')}
                            </button>
                        )
                    }
                </div>
                <div ref={minutesContainerRef} className="minutes">
                    {
                        minutes.map(m =>
                            <button
                                key={'minute-' + m}
                                className={value.minute === m ? 'selected' : ''}
                                onClick={() => handleMinuteValueChange(m)}>
                                {m.toString().padStart(2, '0')}
                            </button>
                        )
                    }
                </div>
                <div ref={secondsContainerRef} className="seconds">
                    {
                        seconds.map(s =>
                            <button
                                key={'second-' + s}
                                className={value.second === s ? 'selected' : ''}
                                onClick={() => handleSecondValueChange(s)}>
                                {s.toString().padStart(2, '0')}
                            </button>
                        )
                    }
                </div>
            </div>
            {
                props.hideActions === true ? <></> :
                    <div className="timepicker-actions">
                        <button onClick={() => handleValueReset()}>RESET</button>
                        <button onClick={() => handleValueChange()}>DONE</button>
                    </div>
            }
        </div>
    );
};

export default TimePicker;

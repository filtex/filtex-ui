import React, { useRef, useEffect, useState } from "react";

import DatePicker from "../DatePicker/DatePicker";
import TimePicker from "../TimePicker/TimePicker";

import './DateTimePicker.css';

export interface DateTimePickerProps {
    hidden?: boolean;
    value?: any;
    onValueChange?: (value: any) => void;
}

const DateTimePicker = (props: DateTimePickerProps) => {
    const containerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
    const [value, setValue] = useState(() => {
        const now = new Date();
        return {
            year: now.getFullYear(),
            month: now.getMonth(),
            day: now.getDate(),
            hour: now.getHours(),
            minute: now.getMinutes(),
            second: now.getSeconds()
        };
    });

    useEffect(() => {
        if (!props.value) {
            return;
        }

        const regex = /^\d\d\d\d-\d\d-\d\d \d\d:\d\d(:\d\d)?/;
        if (regex.test(props.value?.toString())) {
            const [date, time] = props.value
                .toString()
                .split(' ');

            if (!date || !time) {
                return;
            }

            const [year, month, day] = date
                .split('-')
                .map((x: string) => parseInt(x));

            const [hour, minute, second] = time
                .split(':')
                .map((x: string) => parseInt(x));

            setValue({
                year,
                month: month - 1,
                day,
                hour,
                minute,
                second
            });
        } else {
            handleValueReset();
        }
    }, [props.value]);

    const handleDateValueChange = (date: { year: number, month: number, day: number }) => {
        const { year, month, day } = date;
        setValue({ ...value, year, month, day });
    };

    const handleTimeValueChange = (time: { hour: number, minute: number, second: number }) => {
        const { hour, minute, second } = time;
        setValue({ ...value, hour, minute, second });
    };

    const handleValueReset = () => {
        const now = new Date();
        setValue({
            year: now.getFullYear(),
            month: now.getMonth(),
            day: now.getDate(),
            hour: now.getHours(),
            minute: now.getMinutes(),
            second: now.getSeconds()
        });
    };

    const handleValueChange = () => {
        if (props.onValueChange) {
            props.onValueChange(value);
        }
    };

    return (
        <div ref={containerRef} className="datetimepicker" hidden={props.hidden}>
            <div className="datetimepicker-content">
                <DatePicker value={{ year: value.year, month: value.month, day: value.day }} onValueChange={handleDateValueChange} hideActions={true} />
                <TimePicker value={{ hour: value.hour, minute: value.minute, second: value.second }} onValueChange={handleTimeValueChange} hideActions={true} />
            </div>
            <div className="datetimepicker-actions">
                <button onClick={() => handleValueReset()}>RESET</button>
                <button onClick={() => handleValueChange()}>DONE</button>
            </div>
        </div>
    );
};

export default DateTimePicker;

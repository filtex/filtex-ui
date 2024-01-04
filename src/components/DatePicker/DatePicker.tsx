import React, { useEffect, useRef, useState } from "react";

import Days from "./Days/Days";
import Months from "./Months/Months";
import Years from "./Years/Years";

import './DatePicker.css';

export interface DatePickerProps {
    hidden?: boolean;
    value?: any;
    onValueChange?: (value: any) => void;
    hideActions?: boolean;
}

const DatePicker = (props: DatePickerProps) => {
    const containerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
    const [mode, setMode] = useState('days');
    const [value, setValue] = useState({
        year: props.value?.year ?? new Date().getFullYear(),
        month: props.value?.month ?? new Date().getMonth(),
        day: props.value?.day ?? new Date().getDate()
    });
    const [year, setYear] = useState(props.value?.year ?? new Date().getFullYear());
    const [month, setMonth] = useState(props.value?.month ?? new Date().getMonth());

    useEffect(() => {
        if (!props.value) {
            return;
        }

        const regex = /^\d\d\d\d-\d\d-\d\d/;
        if (typeof props.value === 'string' && regex.test(props.value?.toString())) {
            const [year, month, day] = props.value
                .toString()
                .split('-')
                .map(x => parseInt(x));

            setValue({
                year,
                month: month - 1,
                day
            });
            setYear(year);
            setMonth(month - 1);
        } else if (typeof props.value === 'object' && !!props.value.year && !!props.value.month && !!props.value.day) {
            const { year, month, day } = props.value;
            setValue({
                year,
                month: month,
                day
            });
            setYear(year);
            setMonth(month);
        } else {
            const now = new Date();
            setValue({
                year: now.getFullYear(),
                month: now.getMonth(),
                day: now.getDate()
            });
            setYear(now.getFullYear());
            setMonth(now.getMonth());
        }
    }, [props.value]);

    const handleDayValueChange = (year: number, month: number, day: number) => {
        setYear(year);
        setMonth(month);
        setValue({ year, month, day });
        if (props.hideActions === true) {
            if (props.onValueChange) {
                props.onValueChange({ year, month, day });
            }
        }
    };

    const handleValueReset = () => {
        setYear(year);
        setMonth(month);
        setValue({
            year: new Date().getFullYear(),
            month: new Date().getMonth(),
            day: new Date().getDate()
        });
    };

    const handleValueChange = () => {
        if (props.onValueChange) {
            props.onValueChange(value);
        }
    };

    const handleMonthValueChange = (year: number, month: number) => {
        setYear(year);
        setMonth(month);
        setMode('days');
    };

    const handleYearValueChange = (year: number) => {
        setYear(year);
        setMode('months');
    };

    return (
        <div ref={containerRef} className="datepicker" style={{}} hidden={props.hidden}>
            <Days
                year={year}
                onYearRequested={() => setMode('years')}
                month={month}
                onMonthRequested={() => setMode('months')}
                value={value}
                onValueChange={handleDayValueChange}
                hidden={mode !== 'days'} />

            <Months
                year={value.year}
                onYearRequested={() => setMode('years')}
                onValueChange={handleMonthValueChange}
                hidden={mode !== 'months'} />

            <Years
                year={value.year}
                onValueChange={handleYearValueChange}
                hidden={mode !== 'years'} />

            {
                mode !== 'days' || props.hideActions === true ? <></> :
                    <div className="datepicker-actions">
                        <button onClick={() => handleValueReset()}>RESET</button>
                        <button onClick={() => handleValueChange()}>DONE</button>
                    </div>
            }
        </div>
    );
};

export default DatePicker;

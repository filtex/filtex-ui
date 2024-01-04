import React, { useEffect, useState } from "react";

import './Days.css';

export interface DaysProps {
    hidden?: boolean;
    firstDayOfWeek?: number;
    year: number;
    month: number;
    value: {year: number, month: number, day: number};
    onValueChange?: (year: number, month: number, day: number) => void;
    onYearRequested?: () => void;
    onMonthRequested?: () => void;
}

const Days = (props: DaysProps) => {
    const [year, setYear] = useState(props.year);
    const [month, setMonth] = useState(props.month);
    const [value, setValue] = useState(props.value);

    const [days, setDays] = useState<{ day: number; month: number; year: number; }[]>([]);

    useEffect(() => {
        setYear(props.year);
    }, [props.year]);

    useEffect(() => {
        setMonth(props.month);
    }, [props.month]);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    useEffect(() => {
        const firstDayOfWeek = props.firstDayOfWeek ?? 0;
        const dayCount = new Date(year, month + 1, 0).getDate();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDayOfMonth = new Date(year, month, dayCount).getDay();

        let prevMonthShowingDayCount = 0;
        let nextMonthShowingDayCount = 0;

        if (dayCount % 4 !== 7) {
            prevMonthShowingDayCount = firstDayOfMonth - firstDayOfWeek;
            nextMonthShowingDayCount = 6 - lastDayOfMonth;
        }

        const list = [];

        for (let i = prevMonthShowingDayCount - 1; i >= 0; i--) {
            const prevMonth = month === 0 ? 11 : month - 1;
            const prevMonthYear = month === 0 ? year - 1 : year;
            const prevMonthDayCount = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

            list.push({
                day: prevMonthDayCount - i,
                month: prevMonth,
                year: prevMonthYear,
            });
        }

        for (let i = 1; i <= dayCount; i++) {
            list.push({
                day: i,
                month: month,
                year: year,
            });
        }

        for (let i = 1; i <= nextMonthShowingDayCount; i++) {
            const nextMonth = month === 11 ? 1 : month + 1;
            const nextMonthYear = month === 11 ? year + 1 : year;

            list.push({
                day: i,
                month: nextMonth,
                year: nextMonthYear,
            });
        }

        setDays(list);
    }, [year, month, props.firstDayOfWeek]);

    const onSelect = (year: number, month: number, day: number) => {
        if (props.onValueChange) {
            props.onValueChange(year, month, day);
        }
    };

    const decreaseYear = () => {
        setYear(year - 1);
    };

    const increaseYear = () => {
        setYear(year + 1);
    };

    const decreaseMonth = () => {
        if (month === 0) {
            decreaseYear();
        }

        setMonth(month === 0 ? 11 : month - 1);
    };

    const increaseMonth = () => {
        if (month === 11) {
            increaseYear();
        }

        setMonth(month === 11 ? 0 : month + 1);
    };

    const handleMonthClick = () => {
        if (props.onMonthRequested) {
            props.onMonthRequested();
        }
    };

    const handleYearClick = () => {
        if (props.onYearRequested) {
            props.onYearRequested();
        }
    };

    const getMonthName = (year: number, month: number) => {
        return new Date(year, month, 1).toLocaleString('default', { month: 'short' }).toLocaleUpperCase();
    };

    const getDayName = (year: number, month: number, day: number) => {
        return new Date(year, month, day).toLocaleString('default', { weekday: 'short' }).toLocaleUpperCase();
    };

    return (
        <div className="days" hidden={props.hidden}>
            <div className="days-header">
                <button onClick={decreaseYear}><span className="arrow-left"></span><span className="arrow-left"></span></button>
                <button onClick={decreaseMonth}><span className="arrow-left"></span></button>
                <button onClick={handleYearClick}>{year}</button>
                <button onClick={handleMonthClick}>{getMonthName(year, month)}</button>
                <button onClick={increaseMonth}><span className="arrow-right"></span></button>
                <button onClick={increaseYear}><span className="arrow-right"></span><span className="arrow-right"></span></button>
            </div>
            <div className="days-names">
                {
                    days.slice(0, 7).map(item => {
                        return <div key={item.year + '_' + item.month + '_' + item.day}>{getDayName(item.year, item.month, item.day)}</div>
                    })
                }
            </div>
            <div className="days-content">
                {
                    days.map(item => {
                        const now = new Date();

                        const classes = [];
                        if (item.year === year && item.month === month) {
                            classes.push('current');
                        }
                        if (item.year === value.year && item.month === value.month && item.day === value.day) {
                            classes.push('selected');
                        }
                        if (item.year === now.getFullYear() && item.month === now.getMonth() && item.day === now.getDate()) {
                            classes.push('today');
                        }

                        return (
                            <button
                                key={item.year + '_' + item.month + '_' + item.day}
                                className={classes.join(' ')}
                                onClick={_ => onSelect(item.year, item.month, item.day)}>{item.day}</button>
                        )
                    })
                }
            </div>
        </div>
    )
};

export default Days;

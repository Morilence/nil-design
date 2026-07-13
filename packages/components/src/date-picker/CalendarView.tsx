import { Icon } from '@nild/icons';
import DoubleLeft from '@nild/icons/DoubleLeft';
import DoubleRight from '@nild/icons/DoubleRight';
import Left from '@nild/icons/Left';
import Right from '@nild/icons/Right';
import { addMonths, addYears } from 'date-fns';
import { KeyboardEvent, MouseEvent, ReactNode, forwardRef } from 'react';
import {
    DatePickerDisabledOptions,
    DatePickerPanelIndex,
    DateRangeDraft,
    DatePickerView,
    dateKey,
    getCalendarDays,
    isDateDisabled,
    isInRange,
    isMonthBlocked,
    isOutsideMonth,
    isSameDate,
    isYearBlocked,
    monthIndex,
} from './_shared/date';
import variants from './style';
import type { DatePickerValue } from './interfaces';

interface CalendarCell {
    day: Date;
    disabled: boolean;
    key: string;
    label: string;
    outside: boolean;
}

export interface CalendarViewModel {
    date: Date;
    rows: CalendarCell[][];
}

interface CalendarViewProps {
    active: boolean;
    activeDate: Date;
    disabledOptions: DatePickerDisabledOptions;
    draftRange?: DateRangeDraft;
    id: string;
    index: DatePickerPanelIndex;
    maximumPanelDate?: Date;
    minimumPanelDate?: Date;
    model: CalendarViewModel;
    monthLabel: string;
    previewRange?: DateRangeDraft;
    range: boolean;
    today: Date;
    value?: DatePickerValue;
    weekdays: string[];
    onKeyDown: (evt: KeyboardEvent<HTMLDivElement>, panel: DatePickerPanelIndex) => void;
    onNavigate: (panel: DatePickerPanelIndex, date: Date) => void;
    onRangeHover?: (date: Date) => void;
    onSelectDate: (date: Date, panel: DatePickerPanelIndex) => void;
    onViewChange: (panel: DatePickerPanelIndex, view: DatePickerView) => void;
}

export const createCalendarViewModel = (
    date: Date,
    weekStartsOn: number,
    fixedWeeks: boolean,
    formatLabel: (date: Date) => string,
    disabledOptions: DatePickerDisabledOptions,
): CalendarViewModel => {
    const rows: CalendarCell[][] = [];

    getCalendarDays(date, weekStartsOn, fixedWeeks).forEach((day, index) => {
        if (index % 7 === 0) rows.push([]);

        rows[rows.length - 1].push({
            day,
            disabled: isDateDisabled(day, disabledOptions),
            key: dateKey(day),
            label: formatLabel(day),
            outside: isOutsideMonth(day, date),
        });
    });

    return { date, rows };
};

const keepGridFocus = (evt: MouseEvent<HTMLButtonElement>) => evt.preventDefault();

export const NavigationButton = ({
    children,
    disabled,
    label,
    onClick,
}: {
    children: ReactNode;
    disabled: boolean;
    label: string;
    onClick: () => void;
}) => (
    <button
        aria-label={label}
        className={variants.navButton()}
        disabled={disabled}
        onClick={onClick}
        onMouseDown={keepGridFocus}
        type="button"
    >
        {children}
    </button>
);

const CalendarView = forwardRef<HTMLDivElement, CalendarViewProps>(
    (
        {
            active,
            activeDate,
            disabledOptions,
            draftRange,
            id,
            index,
            maximumPanelDate,
            minimumPanelDate,
            model,
            monthLabel,
            onKeyDown,
            onNavigate,
            onRangeHover,
            onSelectDate,
            onViewChange,
            previewRange,
            range,
            today,
            value,
            weekdays,
        },
        ref,
    ) => {
        const { date, rows } = model;
        const prevYear = addYears(date, -1);
        const nextYear = addYears(date, 1);
        const prevMonth = addMonths(date, -1);
        const nextMonth = addMonths(date, 1);
        const afterMinimum = (candidate: Date) =>
            !minimumPanelDate || monthIndex(candidate) > monthIndex(minimumPanelDate);
        const beforeMaximum = (candidate: Date) =>
            !maximumPanelDate || monthIndex(candidate) < monthIndex(maximumPanelDate);
        const activeCellId = active ? `${id}-${index}-${dateKey(activeDate)}` : undefined;

        return (
            <div className={variants.calendarView()}>
                <div className={variants.panelHeader()}>
                    <NavigationButton
                        disabled={isYearBlocked(prevYear.getFullYear(), disabledOptions) || !afterMinimum(prevYear)}
                        label="Previous year"
                        onClick={() => onNavigate(index, prevYear)}
                    >
                        <Icon component={DoubleLeft} />
                    </NavigationButton>
                    <NavigationButton
                        disabled={isMonthBlocked(prevMonth, disabledOptions) || !afterMinimum(prevMonth)}
                        label="Previous month"
                        onClick={() => onNavigate(index, prevMonth)}
                    >
                        <Icon component={Left} />
                    </NavigationButton>
                    <div className={variants.titleGroup()}>
                        <button
                            className={variants.titleButton()}
                            onClick={() => onViewChange(index, 'month')}
                            onMouseDown={keepGridFocus}
                            type="button"
                        >
                            {monthLabel}
                        </button>
                        <button
                            className={variants.titleButton()}
                            onClick={() => onViewChange(index, 'year')}
                            onMouseDown={keepGridFocus}
                            type="button"
                        >
                            {date.getFullYear()}
                        </button>
                    </div>
                    <NavigationButton
                        disabled={isMonthBlocked(nextMonth, disabledOptions) || !beforeMaximum(nextMonth)}
                        label="Next month"
                        onClick={() => onNavigate(index, nextMonth)}
                    >
                        <Icon component={Right} />
                    </NavigationButton>
                    <NavigationButton
                        disabled={isYearBlocked(nextYear.getFullYear(), disabledOptions) || !beforeMaximum(nextYear)}
                        label="Next year"
                        onClick={() => onNavigate(index, nextYear)}
                    >
                        <Icon component={DoubleRight} />
                    </NavigationButton>
                </div>
                <div aria-hidden="true" className={variants.weekdayRow()}>
                    {weekdays.map(weekday => (
                        <span className={variants.weekday()} key={weekday}>
                            {weekday}
                        </span>
                    ))}
                </div>
                <div
                    aria-activedescendant={activeCellId}
                    aria-label={range ? 'Choose date range' : 'Choose date'}
                    className={variants.grid()}
                    onKeyDown={evt => onKeyDown(evt, index)}
                    ref={active ? ref : undefined}
                    role="grid"
                    tabIndex={active ? 0 : -1}
                >
                    {rows.map((row, rowIndex) => (
                        <div className="contents" key={rowIndex} role="row">
                            {row.map(({ day, disabled, key, label, outside }) => {
                                const rangeStart = Boolean(
                                    !outside && range && previewRange?.[0] && isSameDate(previewRange[0], day),
                                );
                                const rangeEnd = Boolean(
                                    !outside && range && previewRange?.[1] && isSameDate(previewRange[1], day),
                                );
                                const selected = Boolean(
                                    !outside &&
                                        (range
                                            ? (draftRange?.[0] && isSameDate(draftRange[0], day)) ||
                                              (draftRange?.[1] && isSameDate(draftRange[1], day))
                                            : isSameDate(value, day)),
                                );
                                const visuallySelected = range ? rangeStart || rangeEnd : selected;
                                const inRange = Boolean(
                                    !outside && range && previewRange && isInRange(day, previewRange),
                                );
                                const activeCell = !outside && isSameDate(activeDate, day);
                                const todayCell = !outside && isSameDate(today, day);

                                return (
                                    <div
                                        aria-disabled={disabled || undefined}
                                        aria-label={`${label}${disabled ? ', disabled' : ''}`}
                                        aria-selected={selected || undefined}
                                        className={variants.cell({
                                            disabled,
                                            inRange,
                                            outside,
                                            rangeEnd,
                                            rangeStart,
                                            selected: visuallySelected,
                                            today: todayCell,
                                        })}
                                        data-active={(activeCell && !visuallySelected) || undefined}
                                        id={`${id}-${index}-${key}`}
                                        key={key}
                                        onClick={() => !disabled && onSelectDate(day, index)}
                                        onMouseDown={evt => evt.preventDefault()}
                                        onMouseEnter={() => !disabled && onRangeHover?.(day)}
                                        role="gridcell"
                                    >
                                        {day.getDate()}
                                        {todayCell && (
                                            <span
                                                aria-hidden="true"
                                                className={variants.todayDot({ selected: visuallySelected })}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    },
);

CalendarView.displayName = 'DatePicker.CalendarView';

export default CalendarView;

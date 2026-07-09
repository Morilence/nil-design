import { addDays, addMonths, format as formatDateFns, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import type { DateRangePickerValue } from '../interfaces';

export const DATE_FORMAT = 'yyyy-MM-dd';

export const getDatePickerLocale = () => (typeof navigator === 'undefined' ? 'en-US' : navigator.language);

export type DatePickerPanelIndex = 0 | 1;
export type DatePickerPanelDates = readonly [Date, Date];
export type DateRangeDraft = readonly [Date | null, Date | null];
export type DatePickerView = 'day' | 'month' | 'year';

export interface DatePickerDisabledOptions {
    isDateDisabledByUser?: (date: Date) => boolean;
    maxTime?: number;
    minTime?: number;
}

export const toDay = (date: Date) => startOfDay(date);

export const getToday = () => toDay(new Date());

export const dateKey = (date: Date) => formatDateFns(toDay(date), DATE_FORMAT);

export const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();

export const isSameDate = (left: Date | null | undefined, right: Date | null | undefined) => {
    if (!left || !right) return left === right;

    return isSameDay(left, right);
};

export const isSameRange = (left: DateRangePickerValue, right: DateRangePickerValue) => {
    if (!left || !right) return left === right;

    return isSameDate(left[0], right[0]) && isSameDate(left[1], right[1]);
};

export const toRangeDraft = (value: DateRangePickerValue): DateRangeDraft => value ?? [null, null];

export const orderRange = (start: Date, end: Date): readonly [Date, Date] => {
    const startDay = toDay(start);
    const endDay = toDay(end);

    return isAfter(startDay, endDay) ? [endDay, startDay] : [startDay, endDay];
};

export const getRangePreview = (range: DateRangeDraft, date: Date): DateRangeDraft => {
    const [start, end] = range;

    return start && !end ? orderRange(start, date) : range;
};

export const formatDate = (date: Date, format: string | ((date: Date) => string) = DATE_FORMAT) =>
    typeof format === 'function' ? format(date) : formatDateFns(toDay(date), format);

export const getDisabledOptions = (
    minDate?: Date,
    maxDate?: Date,
    isDateDisabledByUser?: (date: Date) => boolean,
): DatePickerDisabledOptions => ({
    isDateDisabledByUser,
    maxTime: maxDate ? toDay(maxDate).getTime() : undefined,
    minTime: minDate ? toDay(minDate).getTime() : undefined,
});

export const isDateDisabled = (date: Date, { isDateDisabledByUser, maxTime, minTime }: DatePickerDisabledOptions) => {
    const day = toDay(date);
    const time = day.getTime();

    return Boolean(
        (minTime !== undefined && time < minTime) ||
            (maxTime !== undefined && time > maxTime) ||
            isDateDisabledByUser?.(day),
    );
};

export const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const getMonthEnd = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const getConsecutivePanelDates = (date: Date): DatePickerPanelDates => {
    const first = getMonthStart(date);

    return [first, addMonths(first, 1)];
};

export const getDateInMonth = (date: Date, month: Date) =>
    new Date(month.getFullYear(), month.getMonth(), Math.min(date.getDate(), getMonthEnd(month).getDate()));

export const isPeriodBlocked = (start: Date, end: Date, { maxTime, minTime }: DatePickerDisabledOptions) =>
    Boolean((minTime !== undefined && end.getTime() < minTime) || (maxTime !== undefined && start.getTime() > maxTime));

export const isMonthBlocked = (date: Date, options: DatePickerDisabledOptions) =>
    isPeriodBlocked(getMonthStart(date), getMonthEnd(date), options);

export const isYearBlocked = (year: number, options: DatePickerDisabledOptions) =>
    isPeriodBlocked(new Date(year, 0, 1), new Date(year, 11, 31), options);

export const isYearPageBlocked = (pageStart: number, options: DatePickerDisabledOptions) =>
    isPeriodBlocked(new Date(pageStart, 0, 1), new Date(pageStart + 11, 11, 31), options);

export const getCalendarDays = (panelDate: Date, weekStartsOn = 0, fixedWeeks = true) => {
    const monthStart = getMonthStart(panelDate);
    const monthEnd = getMonthEnd(panelDate);
    const startOffset = (monthStart.getDay() - weekStartsOn + 7) % 7;
    const endOffset = (weekStartsOn + 6 - monthEnd.getDay() + 7) % 7;
    const firstDate = addDays(monthStart, -startOffset);
    const dayCount = fixedWeeks ? 42 : startOffset + monthEnd.getDate() + endOffset;

    return Array.from({ length: dayCount }, (_, index) => addDays(firstDate, index));
};

export const getWeekdays = (locale: string, weekStartsOn = 0) => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const sunday = new Date(2026, 0, 4);

    return Array.from({ length: 7 }, (_, index) => formatter.format(addDays(sunday, weekStartsOn + index)));
};

export const isOutsideMonth = (date: Date, panelDate: Date) => monthIndex(date) !== monthIndex(panelDate);

export const isInRange = (date: Date, range: DateRangeDraft) => {
    const [start, end] = range;

    return Boolean(start && end && isAfter(date, start) && isBefore(date, end));
};

export const findEnabledDate = (target: Date, step: 1 | -1, options: DatePickerDisabledOptions, fallback: Date) => {
    let nextDate = toDay(target);

    for (let index = 0; index < 732; index += 1) {
        if (!isDateDisabled(nextDate, options)) {
            return nextDate;
        }

        nextDate = addDays(nextDate, step);
    }

    return fallback;
};

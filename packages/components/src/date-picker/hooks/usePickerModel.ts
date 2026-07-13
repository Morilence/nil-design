import { useEffectCallback, useIsomorphicLayoutEffect } from '@nild/hooks';
import { useMemo, useState } from 'react';
import {
    DatePickerDisabledOptions,
    DatePickerPanelDates,
    DatePickerPanelIndex,
    DatePickerView,
    DateRangeDraft,
    findEnabledDate,
    getConsecutivePanelDates,
    getDateInMonth,
    getDisabledOptions,
    getMonthStart,
    getRangePreview,
    getToday,
    isDateDisabled,
    isSameDate,
    isSameRange,
    monthIndex,
    orderRange,
    toDay,
    toRangeDraft,
} from '../_shared/date';
import type { DatePickerValue, DateRangePickerValue } from '../interfaces';
import type { Dispatch, SetStateAction } from 'react';

type PickerMode = 'single' | 'range';
type PickerValue = DatePickerValue | DateRangePickerValue;

interface UsePickerModelOptions {
    closePanel: (focusTrigger?: boolean) => void;
    isDateDisabledByUser?: (date: Date) => boolean;
    maxDate?: Date;
    minDate?: Date;
    mode: PickerMode;
    onChange?: (value: PickerValue) => void;
    readonly: boolean;
    setValue: Dispatch<SetStateAction<PickerValue>>;
    value: PickerValue;
    visibleOpen: boolean;
}

interface PickerState {
    activeDate: Date;
    activePanel: DatePickerPanelIndex;
    draftRange: DateRangeDraft;
    hoverDate: Date | null;
    panelDates: DatePickerPanelDates;
    view: DatePickerView;
}

interface PickerModel extends Omit<PickerState, 'hoverDate'> {
    activateDate: (date: Date, preferredPanel?: DatePickerPanelIndex) => void;
    changePanelDate: (panel: DatePickerPanelIndex, date: Date) => void;
    changeView: (panel: DatePickerPanelIndex, view: DatePickerView) => void;
    clear: () => void;
    commitValue: (value: PickerValue, close?: boolean) => void;
    disabledOptions: DatePickerDisabledOptions;
    previewRange?: DateRangeDraft;
    selectDate: (date: Date, panel: DatePickerPanelIndex) => void;
    selectViewDate: (panel: DatePickerPanelIndex, date: Date, view: DatePickerView) => void;
    setHoverDate: Dispatch<SetStateAction<Date | null>>;
}

const isRangeValue = (value: PickerValue): value is NonNullable<DateRangePickerValue> => Array.isArray(value);

const getPanelDatesForValue = (mode: PickerMode, value: PickerValue): DatePickerPanelDates => {
    if (mode === 'single' || !isRangeValue(value)) {
        return getConsecutivePanelDates(value instanceof Date ? value : getToday());
    }

    const [start, end] = orderRange(value[0], value[1]);
    const first = getMonthStart(start);
    const last = getMonthStart(end);

    return monthIndex(first) === monthIndex(last) ? getConsecutivePanelDates(first) : [first, last];
};

const createPickerState = (
    mode: PickerMode,
    value: PickerValue,
    disabledOptions: DatePickerDisabledOptions,
): PickerState => {
    const panelDates = getPanelDatesForValue(mode, value);
    const selectedDate = value instanceof Date ? value : (value?.[0] ?? panelDates[0]);

    return {
        activeDate: findEnabledDate(selectedDate, 1, disabledOptions, getToday()),
        activePanel: 0,
        draftRange: mode === 'range' && isRangeValue(value) ? toRangeDraft(value) : [null, null],
        hoverDate: null,
        panelDates,
        view: 'day',
    };
};

const getValueKey = (value: PickerValue) => {
    if (value instanceof Date) return toDay(value).getTime();
    if (value) return `${toDay(value[0]).getTime()}:${toDay(value[1]).getTime()}`;

    return '';
};

const usePickerModel = ({
    closePanel,
    isDateDisabledByUser,
    maxDate,
    minDate,
    mode,
    onChange,
    readonly,
    setValue,
    value,
    visibleOpen,
}: UsePickerModelOptions): PickerModel => {
    const disabledOptions = useMemo(
        () => getDisabledOptions(minDate, maxDate, isDateDisabledByUser),
        [isDateDisabledByUser, maxDate, minDate],
    );
    const [state, setState] = useState(() => createPickerState(mode, value, disabledOptions));
    const valueKey = getValueKey(value);
    const resetState = useEffectCallback((nextValue: PickerValue = value) => {
        setState(createPickerState(mode, nextValue, disabledOptions));
    });

    const getActivatedState = (date: Date, preferredPanel: DatePickerPanelIndex = state.activePanel): PickerState => {
        const day = toDay(date);

        if (mode === 'single') {
            return {
                ...state,
                activeDate: day,
                activePanel: 0,
                panelDates: getConsecutivePanelDates(day),
            };
        }

        const targetPanelDate = getMonthStart(day);
        const targetMonth = monthIndex(targetPanelDate);
        const leftMonth = monthIndex(state.panelDates[0]);
        const rightMonth = monthIndex(state.panelDates[1]);
        let activePanel = preferredPanel;
        let panelDates = state.panelDates;

        if (targetMonth === leftMonth) {
            activePanel = 0;
        } else if (targetMonth === rightMonth) {
            activePanel = 1;
        } else if (targetMonth < leftMonth) {
            activePanel = 0;
            panelDates = [targetPanelDate, state.panelDates[1]];
        } else if (targetMonth > rightMonth) {
            activePanel = 1;
            panelDates = [state.panelDates[0], targetPanelDate];
        } else {
            panelDates =
                preferredPanel === 0 ? [targetPanelDate, state.panelDates[1]] : [state.panelDates[0], targetPanelDate];
        }

        return { ...state, activeDate: day, activePanel, panelDates };
    };

    const activateDate = (date: Date, preferredPanel?: DatePickerPanelIndex) => {
        setState(getActivatedState(date, preferredPanel));
    };

    const changePanelDate = (panel: DatePickerPanelIndex, date: Date) => {
        const nextPanelDate = getMonthStart(date);

        if (mode === 'single') {
            if (monthIndex(nextPanelDate) === monthIndex(state.panelDates[0])) return;

            setState({
                ...state,
                activeDate: findEnabledDate(
                    getDateInMonth(state.activeDate, nextPanelDate),
                    1,
                    disabledOptions,
                    nextPanelDate,
                ),
                panelDates: getConsecutivePanelDates(nextPanelDate),
            });

            return;
        }

        const nextMonth = monthIndex(nextPanelDate);
        const siblingMonth = monthIndex(state.panelDates[panel === 0 ? 1 : 0]);

        if ((panel === 0 && nextMonth >= siblingMonth) || (panel === 1 && nextMonth <= siblingMonth)) return;
        if (nextMonth === monthIndex(state.panelDates[panel])) return;

        setState({
            ...state,
            activeDate:
                state.activePanel === panel
                    ? findEnabledDate(
                          getDateInMonth(state.activeDate, nextPanelDate),
                          1,
                          disabledOptions,
                          nextPanelDate,
                      )
                    : state.activeDate,
            panelDates: panel === 0 ? [nextPanelDate, state.panelDates[1]] : [state.panelDates[0], nextPanelDate],
        });
    };

    const changeView = (panel: DatePickerPanelIndex, view: DatePickerView) => {
        const panelDate = state.panelDates[panel];

        setState({
            ...state,
            activeDate:
                monthIndex(state.activeDate) === monthIndex(panelDate)
                    ? state.activeDate
                    : findEnabledDate(panelDate, 1, disabledOptions, panelDate),
            activePanel: panel,
            view,
        });
    };

    const selectViewDate = (panel: DatePickerPanelIndex, date: Date, view: DatePickerView) => {
        const day = toDay(date);
        const panelDate = getMonthStart(day);

        setState({
            ...state,
            activeDate: day,
            activePanel: mode === 'single' ? 0 : panel,
            panelDates:
                mode === 'single'
                    ? getConsecutivePanelDates(day)
                    : panel === 0
                      ? [panelDate, state.panelDates[1]]
                      : [state.panelDates[0], panelDate],
            view,
        });
    };

    const commitValue = (nextValue: PickerValue, close = true) => {
        if (readonly) return;

        const normalizedValue =
            mode === 'range'
                ? isRangeValue(nextValue)
                    ? orderRange(nextValue[0], nextValue[1])
                    : null
                : nextValue instanceof Date
                  ? toDay(nextValue)
                  : null;
        const invalid = isRangeValue(normalizedValue)
            ? normalizedValue.some(date => isDateDisabled(date, disabledOptions))
            : normalizedValue instanceof Date && isDateDisabled(normalizedValue, disabledOptions);

        if (invalid) return;

        const unchanged =
            mode === 'range'
                ? isSameRange(
                      isRangeValue(value) ? value : null,
                      isRangeValue(normalizedValue) ? normalizedValue : null,
                  )
                : isSameDate(
                      value instanceof Date ? value : null,
                      normalizedValue instanceof Date ? normalizedValue : null,
                  );

        if (!unchanged) {
            setValue(normalizedValue);
            onChange?.(normalizedValue);
        }

        close ? closePanel(true) : resetState(normalizedValue);
    };

    const selectDate = (date: Date, panel: DatePickerPanelIndex) => {
        if (readonly || isDateDisabled(date, disabledOptions)) return;

        const day = toDay(date);

        if (mode === 'single') {
            commitValue(day);

            return;
        }

        if (!state.draftRange[0] || state.draftRange[1]) {
            setState({ ...getActivatedState(day, panel), draftRange: [day, null], hoverDate: null });

            return;
        }

        commitValue(orderRange(state.draftRange[0], day));
    };

    useIsomorphicLayoutEffect(() => {
        if (visibleOpen) resetState();
    }, [resetState, valueKey, visibleOpen]);

    return {
        ...state,
        activateDate,
        changePanelDate,
        changeView,
        clear: () => commitValue(null),
        commitValue,
        disabledOptions,
        previewRange:
            mode === 'range' ? getRangePreview(state.draftRange, state.hoverDate ?? state.activeDate) : undefined,
        selectDate,
        selectViewDate,
        setHoverDate: action =>
            setState(current => ({
                ...current,
                hoverDate: typeof action === 'function' ? action(current.hoverDate) : action,
            })),
    };
};

export default usePickerModel;

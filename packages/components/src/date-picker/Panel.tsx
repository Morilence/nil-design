import { useTimeout } from '@nild/hooks';
import { Icon } from '@nild/icons';
import DoubleLeft from '@nild/icons/DoubleLeft';
import DoubleRight from '@nild/icons/DoubleRight';
import Left from '@nild/icons/Left';
import Right from '@nild/icons/Right';
import { cnMerge } from '@nild/shared';
import { addDays, addMonths, addYears } from 'date-fns';
import { KeyboardEvent, MouseEvent, ReactNode, forwardRef, useEffect, useMemo, useRef } from 'react';
import {
    DatePickerDisabledOptions,
    DatePickerPanelDates,
    DatePickerPanelIndex,
    DateRangeDraft,
    DatePickerView,
    findEnabledDate,
    getDatePickerLocale,
    getMonthStart,
    getToday,
    getWeekdays,
    isMonthBlocked,
    isYearBlocked,
    isYearPageBlocked,
    monthIndex,
} from './_shared/date';
import CalendarView, { NavigationButton, createCalendarViewModel } from './CalendarView';
import variants from './style';
import type { DatePickerValue } from './interfaces';

interface PanelProps {
    activeDate: Date;
    activePanel: DatePickerPanelIndex;
    className?: string;
    disabledOptions: DatePickerDisabledOptions;
    draftRange?: DateRangeDraft;
    fixedWeeks: boolean;
    id: string;
    open: boolean;
    panelDates: DatePickerPanelDates;
    presets?: ReactNode;
    previewRange?: DateRangeDraft;
    range: boolean;
    value?: DatePickerValue;
    view: DatePickerView;
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    onActiveDateChange: (date: Date, panel: DatePickerPanelIndex) => void;
    onClose: () => void;
    onPanelDateChange: (panel: DatePickerPanelIndex, date: Date) => void;
    onRangeHover?: (date: Date | null) => void;
    onSelectDate: (date: Date, panel: DatePickerPanelIndex) => void;
    onViewChange: (panel: DatePickerPanelIndex, view: DatePickerView) => void;
    onViewDateSelect: (panel: DatePickerPanelIndex, date: Date, view: DatePickerView) => void;
}

const getYearPageStart = (date: Date) => Math.floor(date.getFullYear() / 12) * 12;

const keepGridFocus = (evt: MouseEvent<HTMLButtonElement>) => evt.preventDefault();

const Panel = forwardRef<HTMLDivElement, PanelProps>(
    (
        {
            activeDate,
            activePanel,
            className,
            disabledOptions,
            draftRange,
            fixedWeeks,
            id,
            onActiveDateChange,
            onClose,
            onPanelDateChange,
            onRangeHover,
            onSelectDate,
            onViewChange,
            onViewDateSelect,
            open,
            panelDates,
            presets,
            previewRange,
            range,
            value,
            view,
            weekStartsOn,
        },
        ref,
    ) => {
        const activeGridRef = useRef<HTMLDivElement | null>(null);
        const focusActiveGrid = useTimeout(() => activeGridRef.current?.focus({ preventScroll: true }), 180);
        const locale = getDatePickerLocale();
        const weekdays = useMemo(() => getWeekdays(locale, weekStartsOn), [locale, weekStartsOn]);
        const formatters = useMemo(
            () => ({
                fullDate: new Intl.DateTimeFormat(locale, { dateStyle: 'full' }),
                month: new Intl.DateTimeFormat(locale, { month: 'long' }),
                shortMonth: new Intl.DateTimeFormat(locale, { month: 'short' }),
            }),
            [locale],
        );
        const calendarViews = useMemo(
            () =>
                (range ? panelDates : [panelDates[0]]).map(date =>
                    createCalendarViewModel(
                        date,
                        weekStartsOn,
                        fixedWeeks,
                        day => formatters.fullDate.format(day),
                        disabledOptions,
                    ),
                ),
            [disabledOptions, fixedWeeks, formatters, panelDates, range, weekStartsOn],
        );
        const today = getToday();
        const presetsVisible = Boolean(presets);
        const panelDate = panelDates[activePanel];
        const minimumPanelDate = range && activePanel === 1 ? panelDates[0] : undefined;
        const maximumPanelDate = range && activePanel === 0 ? panelDates[1] : undefined;
        const afterMinimum = (date: Date) => !minimumPanelDate || monthIndex(date) > monthIndex(minimumPanelDate);
        const beforeMaximum = (date: Date) => !maximumPanelDate || monthIndex(date) < monthIndex(maximumPanelDate);
        const isPanelMonthBlocked = (date: Date) =>
            isMonthBlocked(date, disabledOptions) || !afterMinimum(date) || !beforeMaximum(date);
        const isPanelYearBlocked = (year: number) => {
            const date = new Date(year, panelDate.getMonth(), 1);

            return isYearBlocked(year, disabledOptions) || !afterMinimum(date) || !beforeMaximum(date);
        };

        const handleDayKeyDown = (evt: KeyboardEvent<HTMLDivElement>, panel: DatePickerPanelIndex) => {
            let nextDate: Date | undefined;
            let step: 1 | -1 = 1;

            switch (evt.key) {
                case 'ArrowLeft':
                    nextDate = addDays(activeDate, -1);
                    step = -1;
                    break;
                case 'ArrowRight':
                    nextDate = addDays(activeDate, 1);
                    break;
                case 'ArrowUp':
                    nextDate = addDays(activeDate, -7);
                    step = -1;
                    break;
                case 'ArrowDown':
                    nextDate = addDays(activeDate, 7);
                    break;
                case 'Home': {
                    const offset = (activeDate.getDay() - weekStartsOn + 7) % 7;

                    nextDate = addDays(activeDate, -offset);
                    step = -1;
                    break;
                }
                case 'End': {
                    const offset = (activeDate.getDay() - weekStartsOn + 7) % 7;

                    nextDate = addDays(activeDate, 6 - offset);
                    break;
                }
                case 'PageUp':
                    nextDate = evt.shiftKey ? addYears(activeDate, -1) : addMonths(activeDate, -1);
                    step = -1;
                    break;
                case 'PageDown':
                    nextDate = evt.shiftKey ? addYears(activeDate, 1) : addMonths(activeDate, 1);
                    break;
                case 'Enter':
                case ' ':
                    evt.preventDefault();
                    onSelectDate(activeDate, panel);

                    return;
                case 'Escape':
                    evt.preventDefault();
                    onClose();

                    return;
                default:
                    return;
            }

            evt.preventDefault();
            onActiveDateChange(findEnabledDate(nextDate, step, disabledOptions, activeDate), panel);
        };

        const handleViewKeyDown = (evt: KeyboardEvent<HTMLDivElement>) => {
            if (evt.key === 'Escape') {
                evt.preventDefault();
                onClose();

                return;
            }

            const yearView = view === 'year';
            const isBlocked = (date: Date) =>
                yearView ? isPanelYearBlocked(date.getFullYear()) : isPanelMonthBlocked(date);

            if (evt.key === 'Enter' || evt.key === ' ') {
                evt.preventDefault();

                if (!isBlocked(activeDate)) {
                    onViewDateSelect(activePanel, getMonthStart(activeDate), yearView ? 'month' : 'day');
                }

                return;
            }

            const moves: Record<string, number> = yearView
                ? { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3, PageUp: -12, PageDown: 12 }
                : {
                      ArrowLeft: -1,
                      ArrowRight: 1,
                      ArrowUp: -3,
                      ArrowDown: 3,
                      Home: -activeDate.getMonth(),
                      End: 11 - activeDate.getMonth(),
                  };
            const move = moves[evt.key];
            let nextDate =
                move === undefined ? undefined : yearView ? addYears(activeDate, move) : addMonths(activeDate, move);

            if (yearView && (evt.key === 'Home' || evt.key === 'End')) {
                const pageStart = getYearPageStart(activeDate);

                nextDate = new Date(evt.key === 'Home' ? pageStart : pageStart + 11, activeDate.getMonth(), 1);
            }

            if (!nextDate) return;

            evt.preventDefault();
            !isBlocked(nextDate) && onViewDateSelect(activePanel, nextDate, view);
        };

        const renderViewHeader = () => {
            if (view === 'year') {
                const pageStart = getYearPageStart(panelDate);
                const previousDate = addYears(panelDate, -12);
                const nextDate = addYears(panelDate, 12);

                return (
                    <div className={variants.panelHeader()}>
                        <NavigationButton
                            disabled={isYearPageBlocked(pageStart - 12, disabledOptions) || !afterMinimum(previousDate)}
                            label="Previous years"
                            onClick={() => onPanelDateChange(activePanel, previousDate)}
                        >
                            <Icon component={DoubleLeft} />
                        </NavigationButton>
                        <span />
                        <div className={variants.titleGroup()}>
                            <span className={variants.titleButton()}>{`${pageStart} - ${pageStart + 11}`}</span>
                        </div>
                        <span />
                        <NavigationButton
                            disabled={isYearPageBlocked(pageStart + 12, disabledOptions) || !beforeMaximum(nextDate)}
                            label="Next years"
                            onClick={() => onPanelDateChange(activePanel, nextDate)}
                        >
                            <Icon component={DoubleRight} />
                        </NavigationButton>
                    </div>
                );
            }

            const previousDate = addYears(panelDate, -1);
            const nextDate = addYears(panelDate, 1);

            return (
                <div className={variants.panelHeader()}>
                    <NavigationButton
                        disabled={isPanelYearBlocked(previousDate.getFullYear())}
                        label="Previous year"
                        onClick={() => onPanelDateChange(activePanel, previousDate)}
                    >
                        <Icon component={Left} />
                    </NavigationButton>
                    <span />
                    <div className={variants.titleGroup()}>
                        <button
                            className={variants.titleButton()}
                            onClick={() => onViewChange(activePanel, 'year')}
                            onMouseDown={keepGridFocus}
                            type="button"
                        >
                            {panelDate.getFullYear()}
                        </button>
                    </div>
                    <span />
                    <NavigationButton
                        disabled={isPanelYearBlocked(nextDate.getFullYear())}
                        label="Next year"
                        onClick={() => onPanelDateChange(activePanel, nextDate)}
                    >
                        <Icon component={Right} />
                    </NavigationButton>
                </div>
            );
        };

        const renderGridView = () => {
            const yearView = view === 'year';
            const pageStart = getYearPageStart(panelDate);
            const activeValue = yearView ? activeDate.getFullYear() : activeDate.getMonth();
            const selectedValue = yearView ? panelDate.getFullYear() : panelDate.getMonth();

            return (
                <div>
                    {renderViewHeader()}
                    <div
                        aria-activedescendant={`${id}-${view}-${activeValue}`}
                        aria-label={yearView ? 'Choose year' : 'Choose month'}
                        className={variants.viewGrid()}
                        onKeyDown={handleViewKeyDown}
                        ref={activeGridRef}
                        role="grid"
                        tabIndex={0}
                    >
                        {Array.from({ length: 12 }, (_, index) => {
                            const value = yearView ? pageStart + index : index;
                            const date = yearView
                                ? new Date(value, panelDate.getMonth(), 1)
                                : new Date(panelDate.getFullYear(), value, 1);
                            const disabled = yearView ? isPanelYearBlocked(value) : isPanelMonthBlocked(date);
                            const label = yearView ? `${value}` : formatters.shortMonth.format(date);

                            return (
                                <div
                                    aria-disabled={disabled || undefined}
                                    aria-label={label}
                                    aria-selected={value === selectedValue || undefined}
                                    className={variants.viewCell({ disabled, selected: value === selectedValue })}
                                    data-active={(value === activeValue && value !== selectedValue) || undefined}
                                    id={`${id}-${view}-${value}`}
                                    key={value}
                                    onClick={() =>
                                        !disabled && onViewDateSelect(activePanel, date, yearView ? 'month' : 'day')
                                    }
                                    onMouseDown={evt => evt.preventDefault()}
                                    role="gridcell"
                                >
                                    {label}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        };

        useEffect(() => {
            if (open) focusActiveGrid.run();

            return focusActiveGrid.cancel;
        }, [activePanel, focusActiveGrid, open, panelDates, view]);

        return (
            <div
                aria-label={range ? 'Date range picker' : 'Date picker'}
                className={cnMerge(variants.panel({ presetsVisible }), className)}
                id={id}
                onMouseLeave={() => onRangeHover?.(null)}
                ref={ref}
                role="dialog"
            >
                {presetsVisible && <div className={variants.presetList()}>{presets}</div>}
                <div className={variants.panelBody({ range: range && view === 'day' })}>
                    {view === 'day' &&
                        calendarViews.map((model, index) => {
                            const panel = index as DatePickerPanelIndex;

                            return (
                                <CalendarView
                                    active={activePanel === panel}
                                    activeDate={activeDate}
                                    disabledOptions={disabledOptions}
                                    draftRange={draftRange}
                                    id={id}
                                    index={panel}
                                    key={monthIndex(model.date)}
                                    maximumPanelDate={panel === 0 && range ? panelDates[1] : undefined}
                                    minimumPanelDate={panel === 1 ? panelDates[0] : undefined}
                                    model={model}
                                    monthLabel={formatters.month.format(model.date)}
                                    previewRange={previewRange}
                                    range={range}
                                    ref={activePanel === panel ? activeGridRef : undefined}
                                    today={today}
                                    value={value}
                                    weekdays={weekdays}
                                    onKeyDown={handleDayKeyDown}
                                    onNavigate={onPanelDateChange}
                                    onRangeHover={date => onRangeHover?.(date)}
                                    onSelectDate={onSelectDate}
                                    onViewChange={onViewChange}
                                />
                            );
                        })}
                    {view !== 'day' && renderGridView()}
                </div>
            </div>
        );
    },
);

Panel.displayName = 'DatePicker.Panel';

export default Panel;
